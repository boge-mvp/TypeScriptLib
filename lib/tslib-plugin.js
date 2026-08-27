'use strict'

const rollup = require("rollup")

const VIRTUAL_ID = "\0tslib-helpers"

/**
 * tslib helper 按需注入
 *
 * 原理：扫描平铺产物中裸调用的 __xxx helper（noEmitHelpers 编译产物），
 * 与 tslib 导出名求交集，经 rollup mini-bundle（treeshake）生成
 * `window.__xxx = __xxx` 挂载代码段——运行时幂等，多库注入互不冲突。
 */

/**
 * 生成 tslib helper 挂载代码段
 * @param code {string} 平铺后的完整产物代码（用于扫描 helper 使用集）
 * @param explicit {string[] | null} 显式指定注入清单；null 时自动扫描
 * @return {Promise<string>} 挂载代码段（无需注入时返回空字符串）
 */
async function buildTslibHelpers(code, explicit) {
    const candidates = new Set()
    if (Array.isArray(explicit) && explicit.length) {
        for (const name of explicit) candidates.add(name)
    } else {
        const re = /\b__([a-z][a-z0-9]*)\b/g
        let m
        while ((m = re.exec(code))) {
            candidates.add("__" + m[1])
        }
    }
    if (!candidates.size) return ""
    const tslibExports = Object.keys(require("tslib"))
    const helpers = [...candidates].filter(h => tslibExports.includes(h))
    if (!helpers.length) return ""

    const entry = `import { ${helpers.join(", ")} } from "tslib";\n`
        + helpers.map(h => `window.${h} = ${h};`).join("\n")

    const bundle = await rollup.rollup({
        input: VIRTUAL_ID,
        treeshake: true,
        plugins: [
            {
                name: "tslib-virtual-entry",
                resolveId(id) {
                    if (id === VIRTUAL_ID) return id
                    return null
                },
                load(id) {
                    if (id === VIRTUAL_ID) return entry
                    return null
                }
            },
            {
                name: "tslib-resolve",
                resolveId(id) {
                    if (id === "tslib") return require.resolve("tslib/tslib.es6.js")
                    return null
                }
            }
        ]
    })
    const {output} = await bundle.generate({format: "es"})
    return output[0].code
}

module.exports = {buildTslibHelpers}
