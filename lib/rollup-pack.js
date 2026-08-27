'use strict'

const path = require('path')
const fs = require('fs')
const ts = require('typescript')
const rollup = require('rollup')
const nodeResolve = require("@rollup/plugin-node-resolve").default
const glsl = require('rollup-plugin-glsl')
const typescriptRollup = require('@rollup/plugin-typescript')
const _terser = require("@rollup/plugin-terser")
const rollupTerser = _terser.default || _terser

const {addMetadata, createNamespaceTransformer} = require("../typescript-parse")
const generics = require("../rollup-plugin-generics")
const decorators = require("../rollup-plugin-decorators")
const {log, writeFile} = require("./util")

/**
 * 配置合并（defaults 浅合并；true 视为空对象，便于布尔开关携带详细配置）
 * @param args {object | boolean | null | undefined} 用户配置
 * @param defs {object} 默认配置
 * @return {object}
 */
function defaults(args, defs) {
    if (args === true) args = {}
    const ret = args || {}
    for (const key of Object.keys(defs)) {
        if (ret[key] === undefined) ret[key] = defs[key]
    }
    return ret
}

/**
 * 将 renderChunk 缓存的代码作为 asset 输出（配合 terser 实现 xxx.js 与 xxx.min.js 双输出）
 * @param outName {string} 输出文件名
 */
const outSource = function (outName) {
    let cacheCode = null
    return {
        name: 'outSourceFile',
        renderChunk(code) {
            cacheCode = code
        },
        generateBundle() {
            if (cacheCode) {
                this.emitFile({
                    type: "asset",
                    fileName: outName,
                    source: cacheCode
                })
                cacheCode = null
            }
        }
    }
}

/**
 * @typedef {Object} RollupOptions
 * @property {string} [outDir] - 输出目录路径
 * @property {string|false} [tsconfig="tsconfig.json"] - TypeScript 配置文件路径
 * @property {object} [compilerOptions] - 传递给 ts 插件的编译选项
 * @property {string|false} [filterRoot=false] - 编译的根目录
 * @property {boolean | 'inline' | 'hidden'} [sourcemap=false] - sourcemap 生成模式
 * @property {boolean | object} [minify=false] - 是否压缩代码，对象则作为 terser 配置
 * @property {Array} [plugins=[]] - 额外的 rollup 插件
 * @property {string[] | boolean} [bundleTslib=false] - tslib helper 白名单：把指定 helper 内联进产物并挂到 window
 * @property {string | RegExp | Array} [include] - ts 插件包含的文件
 * @property {string | RegExp | Array} [exclude] - ts 插件排除的文件
 */

/**
 * 使用 Rollup 打包指定入口文件（IIFE 格式），产物直接写盘
 * @param {string} inputFile - 入口文件路径
 * @param {string} outName - 输出模块的全局变量名
 * @param {RollupOptions} [options] - 打包配置选项
 * @returns {Promise<void>}
 */
async function rollupPack(inputFile, outName, options) {
    options = defaults(options, {
        tsconfig: "tsconfig.json",
        sourcemap: false,
        filterRoot: false,
        minify: false,
        plugins: [],
        bundleTslib: false
    })
    const localPath = process.cwd()
    const outDir = path.resolve(localPath, options.outDir || "")
    // output.file 需带输出目录前缀（相对 cwd），使 ts 插件的 outDir 路径校验通过
    let file = path.relative(localPath, path.join(outDir, `${outName}${options.minify ? ".min" : ""}.js`))
    /**
     * @type {object}
     */
    const compilerOptions = options.compilerOptions || {}
    compilerOptions.outDir ??= outDir

    const inputCode = await decorators(inputFile)
    let parsedCompilerOptions
    const plugins = [
        options.bundleTslib && nodeResolve({resolveOnly: ["tslib"]}),
        {
            name: "virtual-main",
            order: "pre",
            buildStart() {
                const tsConfig = ts.readConfigFile(options.tsconfig, ts.sys.readFile)
                if (tsConfig.error) {
                    log.warn(tsConfig.error.messageText)
                }
                const parsed = ts.parseJsonConfigFileContent(tsConfig.config, {
                    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
                    readDirectory: () => [],
                    fileExists: ts.sys.fileExists,
                    readFile: ts.sys.readFile
                }, path.resolve(path.dirname(options.tsconfig)))
                parsedCompilerOptions = parsed.options
            },
            api: {
                compilerOptions: function () {
                    return parsedCompilerOptions
                }
            },
            async load(id) {
                const input = await this.resolve(inputFile)
                if (id === input.id) {
                    let code = ts.transpile(inputCode, parsedCompilerOptions)
                    if (Array.isArray(options.bundleTslib) && options.bundleTslib.length > 0) {
                        // 强制白名单：import 引用使 treeshake 保留 helper；挂 window 全局供产物内部裸调用
                        const assigns = options.bundleTslib.map(fn => `window.${fn} = ${fn};`).join("\n")
                        code = `import {${options.bundleTslib.join(", ")}} from "tslib";\n${assigns}\n` + code
                    }
                    return code
                }
            }
        },
        generics(options),
        glsl({
            include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: false,
            compress: false
        }),
        typescriptRollup({
            include: options.include,
            exclude: options.exclude,
            filterRoot: options.filterRoot,
            transformers: {
                before: [
                    addMetadata(),
                    createNamespaceTransformer()
                ]
            },
            compilerOptions,
            tsconfig: options.tsconfig
        }),
        options.minify && outSource(`${outName}.js`),
        options.minify && rollupTerser(defaults(options.minify, {
            timings: true,
            compress: {
                properties: true, // 使用点表示法重写属性访问，例如 foo["bar"] → foo.bar
            },
            format: {
                beautify: false, // 压缩输出
            },
            mangle: {}
        })),

        ...options.plugins
    ].filter(Boolean)

    const bundle = await rollup.rollup({
        input: inputFile,
        // bundleTslib 开启时启用摇树以按需内联 tslib helper
        treeshake: !!options.bundleTslib,
        external: options.bundleTslib ? [] : ["tslib"], // 不把 tslib 打包进产物
        plugins
    })

    const outputOptions = {
        format: 'iife',
        file: file,
        name: outName,
        extend: true,
        sourcemap: options.sourcemap,
        globals: options.bundleTslib ? {} : {
            tslib: "window"  // 将 tslib 视为全局变量
        }
    }

    const {output} = await bundle.generate(outputOptions)
    for (const chunk of output) {
        // fileName 为相对输出根的路径（iife 单文件即 basename），拼 outDir 还原绝对路径写盘
        const code = chunk.type === 'chunk' || chunk.code !== undefined ? chunk.code : chunk.source
        writeFile(path.join(outDir, chunk.fileName), code)
    }
    await bundle.close()
    log.info(`rollupPack 完成：${file}`)
}

module.exports = {rollupPack, defaults, outSource}
