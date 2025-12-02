'use strict';

const through = require('through2');
const path = require('path');
const fs = require('fs');
const File = require('vinyl');

/**
 *
 * @param namespace {string|null}
 * @param multi {boolean} 是否对多流处理
 */
module.exports = function (namespace = null, multi = false) {

    /**
     *
     * @type {File}
     */
    let fileStream

    /**
     *
     * @param file {File}
     * @param enc
     * @param done
     */
    function transform(file, enc, done) {
        if (file.isNull()) {
            done();
            return;
        }
        if (file.isStream()) {
            this.emit('error', new Error('gulp-namespace: Streaming not supported'));
            done();
            return;
        }

        if (!multi && fileStream) {
            this.emit('error', new Error('gulp-namespace: 在使用调用本钩子之前，需要合并流 或设置multi=true'));
            done();
            return;
        }
        if (namespace) {
            const methodNames = ["contents", "globalBuffer", "contentBuffer"]
            for (const methodName of methodNames) {
                let content = file[methodName]?.toString()
                if (content) {
                    const fileName = file.basename
                    if (fileName.endsWith(".d.ts")) {
                        const results = content.matchAll(/export\s+declare\s+(class|interface|enum|abstract|const)\s+(\w+)(?=\s|<|\{|:)/g)
                        results.forEach(result => {
                            content = content.replace(result[0], `export ${result[1]} ${result[2]}`)
                        })
                        if (/[/\\]global[/\\].*\.ts/g.test(file.path) || methodName === "globalBuffer") {
                            // 全局类
                        } else {
                            // 非全局类 则都是namespace内的值 那么需要测底删除declare
                            content = content.replaceAll(/\bdeclare\s+/g, "")
                        }
                    } else {
                        let results = content.matchAll(/export\s+(class|interface|enum|abstract|var)\s+(\w+)(?=\s|<|\{|;)/g)
                        results.forEach(result => {
                            content += `\n${namespace}.${result[2]} = ${result[2]}\n`
                        })
                        results = content.matchAll(/export\s*\{\s*(\w+)\s*}\s*(;?)/g)
                        results.forEach(result => {
                            content += `\n${namespace}.${result[1]} = ${result[1]}\n`
                        })
                    }
                    file[methodName] = Buffer.from(content)
                }
            }
        }
        if (multi) {
            conver(file)
        } else fileStream = file
        done(null, file)
    }

    /**
     * @param file {File}
     */
    function conver(file) {
        const fileName = file.basename
        const isDts = fileName.endsWith(".d.ts")
        if (file.globalBuffer?.length > 0 && file.contentBuffer?.length > 0) {
            let content = file.contentBuffer.toString()
            content = verifyNamespace(content, isDts)
            file.contentBuffer = Buffer.from(content)
            const newContent = `${file.globalBuffer.toString()}\n${content}`
            file.contents = Buffer.from(newContent)
        } else {
            let content = file.contents.toString()
            content = verifyNamespace(content, isDts)
            file.contents = Buffer.from(content)
        }
    }

    function verifyNamespace(content, isDts) {
        if (!isDts) {
            content = content.replace(/export\s*\{\s*\w*\s*}\s*(;?)/g, "")
            content = content.replace(/export\s*/g, "")
        }
        if (namespace) {
            if (isDts) {
                const ns = content.split("\n")
                content = `declare namespace ${namespace} {\n\n\t${ns.join("\n\t")}\n}`
            } else {
                const ns = content.split("\n")
                content = `(function (${namespace}) {\n\t${ns.join("\n\t")}\n}(this.${namespace} || (this.${namespace} = {})));`
            }
        }
        return content
    }

    function flush(done) {
        if (fileStream) {
            conver(fileStream)
        }
        done()
    }

    return through.obj(transform, flush);

}