'use strict'

/**
 * 命名空间包裹
 *
 * 两阶段：
 * 1. namespaceAssign —— 对合并后的文本追加 ns.X = X 挂载（js）/ declare 清理（dts）
 * 2. namespaceVerify —— 去除 export 语法并整体包裹（js: window.ns IIFE / dts: declare namespace）
 *
 * global 区不参与 verify 包裹，直接平铺在产物顶部
 */

/**
 * 阶段1：追加命名空间挂载 / 清理 dts declare
 * @param content {string} global 区或 module 区文本
 * @param basename {string} 产物文件名（如 tsCore.js / tsCore.d.ts）
 * @param namespace {string | null} 命名空间
 * @param isGlobal {boolean} 是否为 global 区（保留 declare）
 * @return {string}
 */
function namespaceAssign(content, basename, namespace, isGlobal) {
    if (!namespace || !content) return content
    if (basename.endsWith(".d.ts")) {
        for (const result of content.matchAll(/export\s+declare\s+(class|interface|enum|abstract|const)\s+(\w+)(?=\s|<|\{|:)/g)) {
            content = content.replace(result[0], `export ${result[1]} ${result[2]}`)
        }
        if (!isGlobal) {
            content = content.replaceAll(/\bdeclare\s+/g, "")
        }
    } else {
        for (const result of content.matchAll(/export\s+(class|interface|enum|abstract|var)\s+(\w+)(?=\s|<|\{|;)/g)) {
            content += `\n${namespace}.${result[2]} = ${result[2]}\n`
        }
        for (const result of content.matchAll(/export\s*\{\s*(\w+)\s*}\s*(;?)/g)) {
            content += `\n${namespace}.${result[1]} = ${result[1]}\n`
        }
    }
    return content
}

/**
 * 阶段2：去除 export 语法并整体包裹
 * @param content {string} 文本
 * @param basename {string} 产物文件名
 * @param namespace {string | null}
 * @return {string}
 */
function namespaceVerify(content, basename, namespace) {
    const isDts = basename.endsWith(".d.ts")
    if (!isDts) {
        content = content.replace(/export\s*\{\s*\w*\s*}\s*(;?)/g, "")
        content = content.replace(/export\s*/g, "")
    }
    if (namespace) {
        const ns = content.split("\n")
        content = isDts
            ? `declare namespace ${namespace} {\n\n\t${ns.join("\n\t")}\n}`
            : `window.${namespace} = (function (${namespace}) {\n\t${ns.join("\n\t")}\n\treturn ${namespace}\n}({}));`
    }
    return content
}

/**
 * 组合：module 区包裹后与 global 区拼接
 * @param globalCode {string} global 区文本（可能为空）
 * @param moduleCode {string} module 区文本（可能为空）
 * @param basename {string} 产物文件名
 * @param namespace {string | null}
 * @return {string} 最终产物文本
 */
function namespaceConverge(globalCode, moduleCode, basename, namespace) {
    if (globalCode.length > 0 && moduleCode.length > 0) {
        return `${globalCode}\n${namespaceVerify(moduleCode, basename, namespace)}`
    }
    return namespaceVerify(globalCode.length > 0 ? globalCode : moduleCode, basename, namespace)
}

module.exports = {namespaceAssign, namespaceVerify, namespaceConverge}
