'use strict'

// 1. 核心打包与编译方法
const { buildLibrary } = require("./lib/build-library")
const { rollupPack } = require("./lib/rollup-pack")
const { compile } = require("./lib/ts-compile")
const { packResources, removeTemp } = require("./packNpmLib")

// 2. 专用 Rollup 插件与 AST 转换器
const rollupRename = require("./rollup-plugin-rename")
const generics = require("./rollup-plugin-generics")
const decorators = require("./rollup-plugin-decorators")
const { addMetadata, createNamespaceTransformer, scanNode } = require("./typescript-parse")

// 3. 构建管线底层模块
const { buildPolyfillBundle } = require("./lib/polyfill-plugin")
const { buildTslibHelpers } = require("./lib/tslib-plugin")
const { concatSource } = require("./lib/concat-source")
const { namespaceAssign, namespaceConverge } = require("./lib/namespace-wrap")
const astDependencies = require("./lib/ast-dependencies")

// 4. 通用工具库
const { clean, log, writeFile, createDirectory } = require("./lib/util")
const webp = require("./webp/ToWebp")

const _webp = new webp.Webp()

module.exports = {
    // ======== 主打包入口 ========
    buildLibrary,
    rollupPack,
    compile,
    packResources,
    removeTemp,

    // ======== 插件与转换器 ========
    rollupRename,
    generics,
    decorators,
    addMetadata,
    createNamespaceTransformer,
    scanNode,

    // ======== 管线原子能力 ========
    buildPolyfillBundle,
    buildTslibHelpers,
    concatSource,
    namespaceAssign,
    namespaceConverge,
    astDependencies,

    // ======== 辅助工具 ========
    webp: _webp,
    clean,
    log,
    writeFile,
    createDirectory
}
