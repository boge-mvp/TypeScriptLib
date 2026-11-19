'use strict'

const fs = require('fs')
const path = require('path')
const {rollupPack} = require("../../lib/rollup-pack")
const {log} = require("../../lib/util")

process.chdir(__dirname)

const LOADER_TEST_RUNTIME_LIBS = [
    ["../../template/laya.core.js", "laya.core.js"],
    ["../../template/laya.ani.js", "laya.ani.js"],
    ["../../template/fairygui.js", "fairygui.js"],
    ["../../TSCore/bin/tsCore.js", "tsCore.js"],
]

function writeLoaderTestHtml() {
    const scripts = [
        ...LOADER_TEST_RUNTIME_LIBS.map(([, name]) => `./libs/${name}`),
        "./loaderTestApp.js",
    ].map((src) => `    <script src="${src}"></script>`).join("\n")

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>资源加载器并发流式测试</title>
    <style>body{margin:0;background:#181825;overflow:hidden}</style>
</head>
<body>
${scripts}
</body>
</html>
`
    fs.writeFileSync("./bin/index.html", html, "utf-8")
}

function buildRuntime() {
    fs.mkdirSync("./bin/libs", {recursive: true})
    for (const [src, name] of LOADER_TEST_RUNTIME_LIBS) {
        fs.copyFileSync(src, `./bin/libs/${name}`)
    }
    if (fs.existsSync("./res/symbols")) {
        fs.cpSync("./res/symbols", "./bin/res/symbols", {recursive: true})
    }
    writeLoaderTestHtml()
    const iconCount = fs.existsSync("./bin/res/symbols") ? fs.readdirSync("./bin/res/symbols").length : 0
    log.info(`[LoaderTest] 运行时库拷贝完成：${LOADER_TEST_RUNTIME_LIBS.length} 个 + 图标 ${iconCount} 张 + index.html`)
}

async function main() {
    await rollupPack("./src/LoaderTestApp.ts", "loaderTestApp", {
            outDir: "./bin",
            minify: false,
            sourcemap: "hidden",
            tsconfig: "./tsconfig.json",
            bundleTslib: ["__awaiter", "__metadata", "__decorate", "__param"]
        }
    )
    buildRuntime()
}

if (require.main === module) {
    main().catch((e) => {
        log.error(e && e.stack || e)
        process.exitCode = 1
    })
}

module.exports = {buildLoader: main}
