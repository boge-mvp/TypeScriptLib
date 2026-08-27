'use strict'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * 构建库公共工具
 */

const log = {
    info: (msg) => console.log(`[${chalk.green('info')}] ${msg}`),
    warn: (msg) => console.warn(`[${chalk.yellow('warn')}] ${msg}`),
    error: (msg) => console.error(`[${chalk.red('error')}] ${msg}`)
}

/**
 * 创建路径文件的所有目录
 * @param filePath {string}
 */
function createDirectory(filePath) {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) return
    createDirectory(dirname)
    fs.mkdirSync(dirname)
}

/**
 * 清理文件目录（替代 del）
 * @param patterns {string | string[]}
 * @return {Promise<string[]>}
 */
function clean(patterns) {
    if (!Array.isArray(patterns)) patterns = [patterns]
    const removed = []
    for (const pattern of patterns) {
        for (const p of expandGlobSync(pattern)) {
            fs.rmSync(p, {recursive: true, force: true})
            removed.push(p)
        }
    }
    return Promise.resolve(removed)
}

/**
 * 极简 glob 展开（支持 ** 与 * 与 前缀目录形式）
 * 约定：本项目 clean 模式形如 [bin 目录任意深度] + [tsCore 前缀文件]，均以目录前缀开头
 * @param pattern {string}
 * @return {string[]}
 */
function expandGlobSync(pattern) {
    pattern = pattern.replace(/\\/g, '/')
    // 拆分固定前缀目录部分（首个含通配符段之前）
    const segments = pattern.split('/')
    let fixed = []
    let i = 0
    while (i < segments.length && !/[*?]/.test(segments[i])) {
        fixed.push(segments[i])
        i++
    }
    const base = fixed.join('/') || '.'
    const rest = segments.slice(i).join('/')
    if (!rest) {
        return fs.existsSync(base) ? [base] : []
    }
    const results = []
    const walk = (dir) => {
        if (!fs.existsSync(dir)) return
        const entries = fs.readdirSync(dir, {withFileTypes: true})
        for (const entry of entries) {
            const full = (dir + '/' + entry.name).replace(/\/\.\//g, '/')
            if (entry.isDirectory()) {
                walk(full)
            }
        }
    }
    // 收集所有文件与目录路径再按简化 glob 匹配
    const all = []
    const collect = (dir) => {
        if (!fs.existsSync(dir)) return
        all.push(dir)
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
            const full = dir + '/' + entry.name
            all.push(full)
            if (entry.isDirectory()) collect(full)
        }
    }
    collect(base)
    const baseIndex = base.length + 1
    for (const candidate of all) {
        const rel = candidate.startsWith(base + '/') ? candidate.slice(baseIndex) : candidate
        if (globMatch(rest, rel)) results.push(candidate)
    }
    return results
}

/**
 * 简化 glob 匹配：支持 ** 与 *（** 匹配任意含 / 路径段）
 * @param pattern {string}
 * @param str {string}
 * @return {boolean}
 */
function globMatch(pattern, str) {
    const re = pattern
        .split('/')
        .map(seg => seg === '**' ? '(?:.+/)?' : seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]'))
        .join('/')
    return new RegExp('^' + re + '$').test(str)
}

/**
 * 收集指定路径下的所有文件路径
 * @param url {string} 相对路径或绝对路径
 * @return {string[]} 完整路径数据
 */
function findFilesSync(url) {
    const files = []
    const read = (dir) => {
        const entries = fs.readdirSync(dir, {withFileTypes: true})
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name).replace(/\\/g, "/")
            if (entry.isDirectory()) {
                read(fullPath)
            } else {
                files.push(fullPath)
            }
        }
    }
    url = path.resolve(url)
    read(url)
    return files
}

/**
 * 写文件（自动创建目录）
 * @param file {string} 绝对或相对 cwd 的文件路径
 * @param content {string | Buffer}
 */
function writeFile(file, content) {
    file = path.resolve(file)
    createDirectory(file)
    fs.writeFileSync(file, content)
}

module.exports = {log, clean, createDirectory, findFilesSync, writeFile, expandGlobSync, globMatch}
