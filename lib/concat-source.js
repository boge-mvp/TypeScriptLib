'use strict'

const path = require('path')
const fs = require('fs')

/**
 * 合并编译产物
 *
 * 规则：
 * - 清理 `export {}` 与本地 `import {...} from "..."` 语句
 * - global 文件（路径含 /global/ 或首行 // 注释含 global）进入 global 区，其余进入模块区
 * - appendFile：global 的文件读入 global 区尾部，非 global 的以文本追加到模块区尾部
 *
 * @param files {{src: string, code: string}[]} 有序文件列表
 * @param opt {{appendFile?: string|string[]} | null}
 * @return {{globalCode: string, moduleCode: string, fullCode: string, basename: string}}
 *  fullCode = globalCode + "\n" + moduleCode
 */
function concatSource(files, opt = null) {
    opt = opt || {}
    const newLine = typeof opt.newLine === 'string' ? opt.newLine : '\n'

    const globalSegs = []
    const moduleSegs = []
    /** @param segs {string[]} @param content {string} 段间固定插入换行 */
    const add = (segs, content) => {
        if (segs.length) segs.push(newLine)
        segs.push(content)
    }

    let basename = "bundle.js"
    for (const file of files) {
        // js 入口之类的会出现 export {}; 的空数据清理掉    dts中如果有空数据也会有这种情况
        let content = file.code
        content = content.replace(/export\s*\{\s*}(;?)(?:\r\n|\r|\n)?/g, "")
        // 去除所有的本地导入 import {A} from '../P/A'
        content = content.replace(/import\s*\{\s*.*}\s*from\s*(["'].*["'])(;?)(?:\r\n|\r|\n)?/g, "")
        // 多文件合并前剥离各产物顶部的严格模式指令（合并后落在中部均为无效字面量）
        content = content.replace(/^\s*["']use strict["'];?\s*/, "")

        if (content.trim().length > 0) {
            if (isGlobalSource(file.src, content)) {
                add(globalSegs, content)
            } else {
                add(moduleSegs, content)
            }
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
        for (const value of appendFile) {
            const file = path.join(process.cwd(), value)
            const isGlobal = isGlobalSource(file, null)
            if (isGlobal) {
                add(globalSegs, fs.readFileSync(file, "utf-8"))
            } else {
                appendStr.push(fs.readFileSync(file, "utf-8"))
            }
        }
    }

    let moduleCode = moduleSegs.join("")
    if (appendStr.length) {
        moduleCode += "\n" + appendStr.join("\n\n")
    }
    const globalCode = globalSegs.join("")
    const fullCode = globalCode ? `${globalCode}\n${moduleCode}` : moduleCode

    return {globalCode, moduleCode, fullCode, basename}
}

/**
 * 判定是否为全局文件
 * @param file {string} 源文件路径
 * @param firstLineContent {string | null} 编译产物首行（内存）；null 时读磁盘文件首行
 * @return {boolean}
 */
function isGlobalSource(file, firstLineContent) {
    if (!path.isAbsolute(file)) {
        file = path.join(process.cwd(), file)
    }
    if (/[/\\]global[/\\].*\.(ts|js)/g.test(file)) {
        return true
    }
    if (!fs.existsSync(file)) return false
    let firstLine = firstLineContent
    if (firstLine == null) {
        const content = fs.readFileSync(file, "utf-8")
        firstLine = content.split(/\r\n|\r|\n/, 1)[0]
    } else {
        firstLine = firstLine.split(/\r\n|\r|\n/, 1)[0]
    }
    if (!firstLine?.length) return false
    firstLine = firstLine.trim()
    return firstLine.startsWith('//') && firstLine.toLowerCase().includes('global')
}

module.exports = {concatSource, isGlobalSource}
