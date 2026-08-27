'use strict'

const path = require("path")
const fs = require("fs")
const rollup = require("rollup")
const {default: rollupTerser} = require("@rollup/plugin-terser")

const {compile} = require("./ts-compile")
const {concatSource} = require("./concat-source")
const {namespaceAssign, namespaceConverge} = require("./namespace-wrap")
const {buildPolyfillBundle} = require("./polyfill-plugin")
const {buildTslibHelpers} = require("./tslib-plugin")
const {log, writeFile} = require("./util")

const VIRTUAL_ID = "\0virtual:bundle"

/**
 * 构建打包库（rollup 实现）
 *
 * 链路：ts API 编译（js/dts 内存产物 + 依赖排序）→ 合并（global/module 双区 + appendFile）
 *   → 命名空间挂载 → plugs 钩子（onAfterCodeCompile 作用于 module 区）
 *   → 包裹（js: window.ns IIFE / dts: declare namespace）
 *   → 注入层（tslib helper 挂载 + core-js 按需 polyfill）
 *   → rollup 单次构建双输出（xxx.js / isMinify 时 xxx.min.js + hidden map）
 *
 * @param config {{src?: {globs?: string[]}, outName: string, dist: string}}
 * @param opt {{js?: {namespace?: string, isMinify?: boolean, terserOpt?: object,
 *                    polyfill?: boolean|{targets: string|object}, tslib?: boolean|string[],
 *                    plugs?: Array<{onBeforeCodeCompile?: Function, onAfterCodeCompile?: Function}>},
 *             dts?: {namespace?: string, globalDtsFile?: string|string[]}}} | null}
 * @param tsConfig {string} tsconfig 路径（相对 cwd）
 * @return {Promise<void>}
 */
async function buildLibrary(config, opt = null, tsConfig = "tsconfig.json") {
    const jsOpt = (opt && opt.js) || {}
    const dtsOpt = (opt && opt.dts) || {}
    const jsName = `${config.outName}.js`
    const dtsName = `${config.outName}.d.ts`
    const t0 = Date.now()

    // ---------- 编译 ----------
    const {jsFiles, dtsFiles, useStrict} = await compile(tsConfig)
    log.info(`编译完成: ${jsFiles.length} 个 js 输出 / ${dtsFiles.length} 个 dts 输出`)
    if (useStrict) log.info(`严格模式: 开启（产物顶部注入 "use strict"）`)

    // ---------- dts 链 ----------
    const dts = concatSource(dtsFiles, {appendFile: dtsOpt.globalDtsFile})
    const dtsGlobal = namespaceAssign(dts.globalCode, dtsName, dtsOpt.namespace, true)
    let dtsModule = namespaceAssign(dts.moduleCode, dtsName, dtsOpt.namespace, false)
    const dtsFull = namespaceConverge(dtsGlobal, dtsModule, dtsName, dtsOpt.namespace)
    writeFile(path.join(config.dist, dtsName), dtsFull)
    log.info(`dts 输出: ${path.join(config.dist, dtsName)} (${(dtsFull.length / 1024).toFixed(1)} KB)`)

    // ---------- js 链 ----------
    // plugs.onBeforeCodeCompile：逐编译产物调用
    for (const plug of jsOpt.plugs || []) {
        if (typeof plug.onBeforeCodeCompile === "function") {
            for (const f of jsFiles) {
                plug.onBeforeCodeCompile({src: f.src, basename: path.basename(f.src), content: f.code})
            }
        }
    }
    const js = concatSource(jsFiles)
    const jsGlobal = namespaceAssign(js.globalCode, jsName, jsOpt.namespace, true)
    let jsModule = namespaceAssign(js.moduleCode, jsName, jsOpt.namespace, false)
    // plugs.onAfterCodeCompile：作用于 module 区（file.contentBuffer 接口，修改会参与后续包裹）
    for (const plug of jsOpt.plugs || []) {
        if (typeof plug.onAfterCodeCompile === "function") {
            const file = {contentBuffer: Buffer.from(jsModule)}
            plug.onAfterCodeCompile(file)
            jsModule = file.contentBuffer.toString()
        }
    }
    const jsFull = namespaceConverge(jsGlobal, jsModule, jsName, jsOpt.namespace)

    // ---------- 注入层 ----------
    // tslib helper 挂载段：作为入口代码顶层（window.__xxx 赋值，多库幂等）
    const polyfillOpt = jsOpt.polyfill === undefined ? true : jsOpt.polyfill
    const tslibOpt = jsOpt.tslib === undefined ? true : jsOpt.tslib
    const parts = []
    if (tslibOpt) {
        const snippet = await buildTslibHelpers(jsFull, Array.isArray(tslibOpt) ? tslibOpt : null)
        if (snippet) {
            parts.push(snippet)
            log.info(`tslib helper 注入: ${snippet.match(/window\.__\w+/g)?.join(", ")}`)
        } else {
            log.info("tslib helper 注入: 无需注入")
        }
    }
    // 业务代码必须保持顶层作用域（跨库全局契约：后续库裸引用前序库平铺的全局函数），
    // polyfill 经独立 mini-bundle 包成匿名 IIFE 后由 rollup intro 注入产物头部
    parts.push(jsFull)
    const entryCode = parts.join("\n")
    let polyfillIntro = ""
    if (polyfillOpt) {
        const targets = polyfillOpt && typeof polyfillOpt === "object" ? polyfillOpt.targets : undefined
        polyfillIntro = await buildPolyfillBundle(jsFull, jsName, targets)
    }

    // ---------- rollup 双输出 ----------
    const bundle = await rollup.rollup({
        input: VIRTUAL_ID,
        treeshake: false,
        plugins: [
            {
                name: "virtual-bundle-entry",
                resolveId(id) {
                    if (id === VIRTUAL_ID) return id
                    return null
                },
                load(id) {
                    if (id === VIRTUAL_ID) return entryCode
                    return null
                }
            }
        ],
        onwarn(warning) {
            if (warning.code === "CIRCULAR_DEPENDENCY" || warning.code === "THIS_IS_UNDEFINED") return
            log.warn(`[rollup] ${warning.message}`)
        }
    })
    // 严格模式开启时在最终产物顶部注入指令（banner 由 rollup 组装，位于产物第一行）
    const banner = useStrict ? '"use strict";' : undefined
    // polyfill IIFE 经 intro 注入（位于 banner 之后、业务代码之前）：
    // intro 计入 sourcemap 映射，min 输出经 terser 统一压缩，map 无漂移
    const intro = polyfillIntro || undefined
    const outputs = [{file: path.join(config.dist, jsName), format: "es", banner, intro}]
    if (jsOpt.isMinify) {
        outputs.push({
            file: path.join(config.dist, `${config.outName}.min.js`),
            format: "es",
            sourcemap: "hidden",
            banner,
            intro,
            // terser 按 script 模式处理（module:false），否则顶部严格模式指令被视作冗余删除
            plugins: [rollupTerser({module: false, ...(jsOpt.terserOpt || {})})]
        })
    }
    for (const output of outputs) {
        await bundle.write(output)
        // 清除合并产物中部独立成行的无效严格模式指令（commonjs 转换 core-js 模块的残留）；
        // 以换行为前缀匹配，不会波及 banner 注入的顶部真指令
        const code = fs.readFileSync(output.file, "utf-8")
        const stripped = code.replace(/(\r\n|\r|\n)(?:[ \t]*["']use strict["'];?[ \t]*(?:\r\n|\r|\n))+/g, "$1")
        if (stripped !== code) {
            fs.writeFileSync(output.file, stripped)
        }
        log.info(`js 输出: ${output.file}`)
    }
    await bundle.close()
    log.info(`buildLibrary 完成: ${config.outName} (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
}

module.exports = {buildLibrary}
