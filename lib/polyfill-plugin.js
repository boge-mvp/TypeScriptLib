'use strict'

const rollup = require("rollup")
const commonjs = require("@rollup/plugin-commonjs")
const babel = require("@babel/core")
const {log} = require("./util")

const VIRTUAL_POLYFILL_ID = "\0virtual:polyfill-bundle"

/**
 * core-js 按需注入（babel usage 模式）
 *
 * 原理：babel 扫描产物中新 API 使用点并注入 `import "core-js/..."`；
 * 为保证产物主体零改动，仅提取注入的 import 行拼接在原代码头部，
 * 后续由 rollup 将 core-js 模块内联展开（最终位于产物顶部）。
 *
 * 默认 targets "chrome 60"：TS 已按 es2015 完成全部语法降级，babel 仅做
 * API 按需注入、零语法转换（chrome 60 以下会触发语法转换，转换结果会被
 * 丢弃导致语法未真正降级——若确实需要更低目标，应以产物整体走 babel 为宜）。
 */

/**
 * 扫描并注入 polyfill import
 * @param code {string} 平铺后的完整产物代码
 * @param filename {string} 产物文件名（供 babel 解析）
 * @param targets {string | object | undefined} browserslist 目标，默认 "chrome 60"（对齐 TS es2015 编译目标，babel 零语法转换）
 * @return {Promise<string>} import 行 + 原代码（无注入时返回原代码）
 */
async function babelPolyfillInject(code, filename, targets) {
    const result = await babel.transformAsync(code, {
        filename,
        sourceType: "module",
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [[require("@babel/preset-env"), {
            targets: targets || "chrome 60",
            modules: false,
            useBuiltIns: "usage",
            // 自动读取实际安装的 core-js 版本：写 "3" 会被解析为 3.0 基线，
            // 导致后续小版本（如 3.17 引入的 es.array.at）被错误过滤不注入
            corejs: {version: getInstalledCorejsVersion(), proposals: false}
        }]]
    })
    let injected = ""
    if (result.code) {
        const imports = []
        const stripped = result.code.replace(/^[ \t]*import\s+["'][^"']*core-js[^"']*["'];?[ \t]*$/gm, (m) => {
            imports.push(m.trim())
            return ""
        })
        // 自检：babel 语法降级必然注入 `function _xxx(` 形式的 helper；
        // 纯重打印差异（如冗余括号去除）无 helper，不告警
        const helpersOf = (s) => (s.match(/^function _\w+\s*\(/gm) || []).sort().join("|")
        if (helpersOf(stripped) !== helpersOf(code)) {
            log.warn("[polyfill] babel 触发了语法降级转换（注入 helper），转换结果未保留，请确认 targets 配置")
        }
        if (imports.length) injected = imports.join("\n") + "\n"
    }
    return injected + code
}

/**
 * 读取实际安装的 core-js 主次版本号（如 "3.50"）
 * @return {string}
 */
function getInstalledCorejsVersion() {
    const pkg = require("core-js/package.json")
    const [major, minor] = pkg.version.split(".")
    return `${major}.${minor}`
}

/**
 * rollup 插件：解析 babel 注入的 core-js 裸导入到真实文件
 */
function corejsResolve() {
    return {
        name: "corejs-resolve",
        resolveId(source) {
            if (/^core-js\//.test(source)) {
                return require.resolve(source)
            }
            return null
        }
    }
}

/**
 * 生成隔离的 polyfill 代码段（匿名 IIFE）
 *
 * 产物以经典 script 加载且多库共存：core-js 内部顶层变量（hasRequiredXxx 缓存标志、
 * 模块容器对象等）不能泄漏到全局——两个库先后加载时会因 var 重声明语义错位
 * （标志保留旧值而容器被重置）取到未初始化模块导致运行时崩溃。
 * 因此 core-js 经独立 mini-bundle 包成 (function(){...})();，业务代码保持顶层
 * （跨库全局契约：后续库裸引用前序库平铺的全局函数）。
 *
 * @param code {string} 平铺后的完整产物代码（业务代码，用于 usage 扫描）
 * @param filename {string} 产物文件名（供 babel 解析）
 * @param targets {string | object | undefined} browserslist 目标
 * @return {Promise<string>} 匿名 IIFE 代码段（无注入时返回空字符串）
 */
async function buildPolyfillBundle(code, filename, targets) {
    const injected = await babelPolyfillInject(code, filename, targets)
    const imports = injected === code ? [] :
        (injected.match(/^import\s+["'][^"']*core-js[^"']*["'];?$/gm) || []).map(s => s.trim())
    if (!imports.length) return ""

    const entry = imports.join("\n")
    const bundle = await rollup.rollup({
        input: VIRTUAL_POLYFILL_ID,
        // core-js 模块以副作用注册原型补丁，不可摇树
        treeshake: false,
        plugins: [
            {
                name: "polyfill-virtual-entry",
                resolveId(id) {
                    if (id === VIRTUAL_POLYFILL_ID) return id
                    return null
                },
                load(id) {
                    if (id === VIRTUAL_POLYFILL_ID) return entry
                    return null
                }
            },
            corejsResolve(),
            commonjs({include: [/node_modules[\\/]core-js/]})
        ],
        onwarn(warning) {
            if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "THIS_IS_UNDEFINED") return
            log.warn(`[polyfill-bundle] ${warning.message}`)
        }
    })
    const {output} = await bundle.generate({format: "iife"})
    await bundle.close()
    log.info(`core-js polyfill 注入: ${imports.length} 个模块（IIFE 隔离）`)
    return output[0].code
}

module.exports = {babelPolyfillInject, corejsResolve, buildPolyfillBundle}
