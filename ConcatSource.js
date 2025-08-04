'use strict';

const through = require('through2');
const path = require('path');
const fs = require('fs');
const File = require('vinyl');
const Concat = require('concat-with-sourcemaps');


/**
 * @see gulp-concat
 */

// file can be a vinyl file object or a string
// when a string it will construct a new one
/**
 *
 * @param file {string|File}
 * @param opt {{newLine?:string, namespace?:string, append?:string|string[], appendFile?:string|string[]}}
 */
module.exports = function (file, opt) {
    if (!file) {
        throw new Error('gulp-concat: Missing file option');
    }
    opt = opt || {};

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== 'string') {
        opt.newLine = '\n';
    }

    const namespace = opt.namespace

    let isUsingSourceMaps = false;
    let latestFile;
    let latestMod;
    let fileName;
    let golbalConcat;
    let concat;

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
    } else {
        throw new Error('gulp-concat: Missing path in file options');
    }

    function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new Error('gulp-concat: Streaming not supported'));
            cb();
            return;
        }

        // enable sourcemap support for concat
        // if a sourcemap initialized file comes in
        if (file.sourceMap && isUsingSourceMaps === false) {
            isUsingSourceMaps = true;
        }

        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }

        // construct concat instance
        if (!concat) {
            concat = new Concat(isUsingSourceMaps, fileName, opt.newLine);
        }
        if (!golbalConcat) {
            golbalConcat = new Concat(isUsingSourceMaps, fileName, opt.newLine);
        }

        // add file to concat instance
        /** @type {string} */
        const _path = file.path
        /** @type {string} */
        let content = file.contents.toString()

        // js 入接口之类的会出现 export {}; 的空数据清理掉    dts中如果有空数据也会有这种情况
        content = content.replace(/export\s*\{\s*}(;?)(?:\r\n|\r|\n)?/g, "")

        if (fileName.endsWith(".d.ts")) {
            if (namespace) {
                const results = content.matchAll(/declare\s+(class|interface|enum|abstract)\s+(\w+)(?=\s|\{)/g)
                results.forEach(result => {
                    content = content.replace(result[0], `${result[1]} ${result[2]}`)
                })
            }
        } else {
            if (namespace) {
                const results = content.matchAll(/export\s+(class|interface|enum|abstract)\s+(\w+)(?=\s|\{)/g)
                results.forEach(result => {
                    content += `\n${namespace}.${result[2]} = ${result[2]}\n`
                })
            }
            content = content.replace(/export\s*/g, "")
        }
        // 去除所有的本地导入 import {A} from '../P/A'
        content = content.replace(/import\s*\{\s*.*}\s*from\s*(["'].*["'])(;?)(?:\r\n|\r|\n)?/g, "")
        if (content.trim().length > 0) {
            if (_path.includes("global")) {
                golbalConcat.add(file.relative, Buffer.from(content), file.sourceMap);
            } else {
                concat.add(file.relative, Buffer.from(content), file.sourceMap);
            }
        }

        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (!latestFile || !concat) {
            cb();
            return;
        }

        let joinedFile;

        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === 'string') {
            joinedFile = latestFile.clone({contents: false});
            joinedFile.path = path.join(latestFile.base, file);
        } else {
            joinedFile = new File(file);
        }
        /** @type {string} */
        let content = concat.content.toString()
        if (namespace && content) {
            const ns = content.split("\n")
            if (fileName.endsWith(".d.ts")) {
                content = `declare namespace ${namespace} {\n\n\t${ns.join("\n\t")}\n}`
            } else {
                content = `(function (${namespace}) {\n\t${ns.join("\n\t")}\n}(this.${namespace} || (this.${namespace} = {})));`
            }
        }
        const appendStr = []
        if (opt.append) {
            const append = opt.append
            if (Array.isArray(append)) {
                appendStr.push(...append)
            } else appendStr.push(append)
        }
        if (opt.appendFile) {
            const appendFile = Array.isArray(opt.appendFile) ? opt.appendFile : [opt.appendFile]
            appendFile.forEach(value => appendStr.push(fs.readFileSync(path.join(process.cwd(), value))))
        }
        if (appendStr.length) {
            content += "\n" + appendStr.join("\n\n")
        }

        joinedFile.contents = Buffer.from(`${golbalConcat.content}\n${content}`)

        if (golbalConcat.sourceMapping) {
            joinedFile.sourceMap = JSON.parse(golbalConcat.sourceMap);
        }

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);
};
