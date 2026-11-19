'use strict'

const fs = require('fs')
const path = require('path')
const {rollupPack} = require("../../lib/rollup-pack")
const {log} = require("../../lib/util")

process.chdir(__dirname)

/**
 * Slot 测试应用运行时库清单
 * [源路径(相对 demo/slot), 拷贝后文件名]
 * 加载顺序与 bin/index.html 保持一致：
 * laya.core → laya.ani → spine → fairygui → gameLib → tsCore
 */
const SLOT_TEST_RUNTIME_LIBS = [
    ["../../template/laya.core.js", "laya.core.js"],
    ["../../template/laya.ani.js", "laya.ani.js"],
    ["../../template/spine-core-3.8.js", "spine-core-3.8.js"],
    ["../../template/laya.spine.js", "laya.spine.js"],
    ["../../template/laya.html.js", "laya.html.js"],
    ["../../template/laya.debugtool.js", "laya.debugtool.js"],
    ["../../template/fairygui.js", "fairygui.js"],
    ["../../TSCore/bin/tsCore.js", "tsCore.js"],
    ["../../GameLib/bin/gameLib.js", "gameLib.js"],
]

/**
 * 生成运行壳 HTML（脚本顺序即依赖顺序，slotTestApp 入口自动执行 tsCore.App.run）
 */
function writeSlotTestHtml() {
    const scripts = [
        ...SLOT_TEST_RUNTIME_LIBS.map(([, name]) => `./libs/${name}`),
        "./slotTestApp.js",
    ].map((src) => `    <script src="${src}"></script>`).join("\n")

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>Slot 滚动策略测试</title>
    <style>body{margin:0;background:#1a1a2e;overflow:hidden}</style>
</head>
<body>
${scripts}
</body>
</html>
`
    fs.writeFileSync("./bin/index.html", html, "utf-8")
}

/**
 * 拷贝运行时库并生成 index.html
 */
function buildRuntime() {
    fs.mkdirSync("./bin/libs", {recursive: true})
    for (const [src, name] of SLOT_TEST_RUNTIME_LIBS) {
        fs.copyFileSync(src, `./bin/libs/${name}`)
    }
    // 符号图标资源（运行时经 Laya.loader 加载）
    if (fs.existsSync("./res/symbols")) {
        fs.cpSync("./res/symbols", "./bin/res/symbols", {recursive: true})
    }
    writeSlotTestHtml()
    const iconCount = fs.existsSync("./bin/res/symbols") ? fs.readdirSync("./bin/res/symbols").length : 0
    log.info(`[Slot] 运行时库拷贝完成：${SLOT_TEST_RUNTIME_LIBS.length} 个 + 图标 ${iconCount} 张 + index.html`)
}

async function main() {
    await rollupPack("./src/SlotTestApp.ts", "slotTestApp", {
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

module.exports = {buildSlot: main}
