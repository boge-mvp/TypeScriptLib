'use strict';

const through = require('through2');
const path = require('path');
const fs = require('fs');
const File = require('vinyl');
const Concat = require('concat-with-sourcemaps');
const readline = require("readline")

/**
 * @see gulp-concat
 */

// file can be a vinyl file object or a string
// when a string it will construct a new one
/**
 *
 * @param file {string|File}
 * @param opt {{newLine?:string, append?:string|string[], appendFile?:string|string[]} | null}
 */
module.exports = function (file, opt = null) {
    if (!file) {
        throw new Error('gulp-concat: Missing file option');
    }
    opt = opt || {};

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== 'string') {
        opt.newLine = '\n';
    }

    let isUsingSourceMaps = false;
    let latestFile;
    let latestMod;
    let fileName;
    /**
     * @type Concat
     */
    let globalConcat;
    /**
     * @type Concat
     */
    let concat;

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
    } else {
        throw new Error('gulp-concat: Missing path in file options');
    }

    async function bufferContents(file, enc, done) {
        // ignore empty files
        if (file.isNull()) {
            done();
            return;
        }

        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new Error('gulp-concat: Streaming not supported'));
            done();
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
        if (!globalConcat) {
            globalConcat = new Concat(isUsingSourceMaps, fileName, opt.newLine);
        }

        // add file to concat instance
        /** @type {string} */
        const _path = file.path
        /** @type {string} */
        let content = file.contents.toString()

        // js 入接口之类的会出现 export {}; 的空数据清理掉    dts中如果有空数据也会有这种情况
        content = content.replace(/export\s*\{\s*}(;?)(?:\r\n|\r|\n)?/g, "")
        // 去除所有的本地导入 import {A} from '../P/A'
        content = content.replace(/import\s*\{\s*.*}\s*from\s*(["'].*["'])(;?)(?:\r\n|\r|\n)?/g, "")

        if (content.trim().length > 0) {
            const isGlobal = await isGlobalFile(_path)
            if (isGlobal) {
                globalConcat.add(file.relative, Buffer.from(content), file.sourceMap);
            } else {
                concat.add(file.relative, Buffer.from(content), file.sourceMap);
            }
        }

        done();
    }

    async function endStream(done) {
        // no files passed in, no file goes out
        if (!latestFile || !concat) {
            done();
            return;
        }

        /** @type {File} */
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

        const appendStr = []
        if (opt.append) {
            const append = opt.append
            if (Array.isArray(append)) {
                appendStr.push(...append)
            } else appendStr.push(append)
        }
        if (opt.appendFile) {
            const appendFile = Array.isArray(opt.appendFile) ? opt.appendFile : [opt.appendFile]
            for (const value of appendFile) {
                const file = path.join(process.cwd(), value)
                const isGlobal = await isGlobalFile(file)
                if (isGlobal) {
                    globalConcat.add(file.relative, fs.readFileSync(file));
                } else {
                    appendStr.push(fs.readFileSync(file))
                }
            }
        }
        if (appendStr.length) {
            content += "\n" + appendStr.join("\n\n")
        }

        joinedFile.globalBuffer = globalConcat.content
        joinedFile.contentBuffer = Buffer.from(content)

        const golbalCode = globalConcat.content.toString()
        const newCode = `${golbalCode}\n${content}`
        joinedFile.contents = Buffer.from(newCode)

        if (globalConcat.sourceMapping) {
            joinedFile.sourceMap = JSON.parse(globalConcat.sourceMap);
        }

        this.push(joinedFile);
        done();
    }

    return through.obj(bufferContents, endStream);
};

/**
 *
 * @param file {string}
 * @returns {Promise<Awaited<boolean>|*>}
 */
async function isGlobalFile(file) {
    if (!path.isAbsolute(file)) {
        file = path.join(process.cwd(), file)
    }
    if (/[/\\]global[/\\].*\.(ts|js)/g.test(file)) {
        return Promise.resolve(true)
    }
    if (!fs.existsSync(file)) return Promise.resolve(false)
    const lines = await readFirstLine(file)
    if (!lines?.length) return Promise.resolve(false)
    const firstLine = lines.trim();
    return firstLine.startsWith('//') && firstLine.toLowerCase().includes('global')
}

/**
 *
 * @param filePath {string}
 * @returns {Promise<string>}
 */
function readFirstLine(filePath) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            rl.close();
            resolve(line);
        });

        rl.on('error', (err) => {
            rl.close();
            reject(err);
        });

        fileStream.on('error', (err) => {
            rl.close();
            reject(err);
        });
    });
}
