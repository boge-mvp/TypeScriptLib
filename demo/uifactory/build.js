'use strict'

const path = require('path')
const fs = require('fs')
const {rollupPack} = require("../../index")
const {log} = require("../../lib/util")

async function buildUIFactory() {
    log.info("========== 开始构建 UIFactory 全功能检视测试台 Demo (单页 TabBar 架构) ==========")

    const demoDir = __dirname
    const binDir = path.join(demoDir, "bin")
    const srcDir = path.join(demoDir, "src")
    const libsDir = path.join(binDir, "libs")

    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, {recursive: true})
    }
    if (!fs.existsSync(libsDir)) {
        fs.mkdirSync(libsDir, {recursive: true})
    }

    // 复制运行时依赖库 (与 demo/slot 严格保持一致，确保 tsCore 与 gameLib 完整运行时底座)
    const copyLibs = [
        {src: path.join(__dirname, "../../template/laya.core.js"), dest: path.join(libsDir, "laya.core.js")},
        {src: path.join(__dirname, "../../template/laya.ani.js"), dest: path.join(libsDir, "laya.ani.js")},
        {src: path.join(__dirname, "../../template/spine-core-3.8.js"), dest: path.join(libsDir, "spine-core-3.8.js")},
        {src: path.join(__dirname, "../../template/laya.spine.js"), dest: path.join(libsDir, "laya.spine.js")},
        {src: path.join(__dirname, "../../template/laya.html.js"), dest: path.join(libsDir, "laya.html.js")},
        {src: path.join(__dirname, "../../template/laya.debugtool.js"), dest: path.join(libsDir, "laya.debugtool.js")},
        {src: path.join(__dirname, "../../template/fairygui.js"), dest: path.join(libsDir, "fairygui.js")},
        {src: path.join(__dirname, "../../template/zlib/rawinflate.min.js"), dest: path.join(libsDir, "rawinflate.js")},
        {src: path.join(__dirname, "../../TSCore/bin/tsCore.js"), dest: path.join(libsDir, "tsCore.js")},
        {src: path.join(__dirname, "../../GameLib/bin/gameLib.js"), dest: path.join(libsDir, "gameLib.js")},
    ]

    for (const lib of copyLibs) {
        if (fs.existsSync(lib.src)) {
            fs.copyFileSync(lib.src, lib.dest)
        }
    }

    // 复制静态布局与资源配置目录 res/ -> bin/res/
    const resDir = path.join(demoDir, "res")
    const binResDir = path.join(binDir, "res")

    // 路径直驱：传入一个路径，程序自动扫描递归合并为统一合包，并选择性编译为压缩加密的二进制包
    const { bundleLayouts } = require("../../lib/bundle-layouts");
    const layoutDir = path.join(resDir, "layout");
    if (fs.existsSync(layoutDir)) {
        const bundleRes = bundleLayouts({
            inputDir: layoutDir,
            outputDir: resDir,
            baseDir: demoDir, // 生成如 "res/layout/header.json" 的标准相对路径
            bundleName: "ui_bundle",
            extension: "bin", // 自定义后缀，也可使用 fgui.UIConfig.packageFileExtension
            outputBinary: true,
            outputJson: true
        });
        log.info(`[UIFactory] 成功打包集中式布局数据包: ${bundleRes.count} 个页面 | 原始: ${(bundleRes.rawSize/1024).toFixed(1)}KB -> 二进制: ${(bundleRes.binarySize/1024).toFixed(1)}KB (压缩率 ${bundleRes.compressionRatio})`);
    }

    if (fs.existsSync(resDir)) {
        if (typeof fs.cpSync === "function") {
            fs.cpSync(resDir, binResDir, {recursive: true})
        } else {
            const copyDir = (src, dest) => {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true})
                for (const item of fs.readdirSync(src)) {
                    const s = path.join(src, item)
                    const d = path.join(dest, item)
                    if (fs.statSync(s).isDirectory()) copyDir(s, d)
                    else fs.copyFileSync(s, d)
                }
            }
            copyDir(resDir, binResDir)
        }
    }

    process.chdir(demoDir)

    // 编译 UIFactoryTestApp.ts -> bin/uifactoryTestApp.js
    const {rollupPack} = require("../../lib/rollup-pack")
    await rollupPack("./src/UIFactoryTestApp.ts", "uifactoryTestApp", {
        outDir: "./bin",
        minify: false,
        sourcemap: "hidden",
        tsconfig: "./tsconfig.json",
        bundleTslib: ["__awaiter", "__metadata", "__decorate", "__param"]
    })

    // 生成单页宿主 HTML (index.html，严格对齐官方 demo E:/libs/FairyGUI-layabox/demo/bin/index.html 与标准)
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <title>UIFactory 4.0 纯代码引擎 — 全原生组件全属性交互检视测试台</title>
    <meta charset="utf-8" />
    <meta name="renderer" content="webkit" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="full-screen" content="true" />
    <meta name="x5-fullscreen" content="true" />
    <meta name="360-fullscreen" content="true" />
    <meta name="laya" screenorientation="landscape" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <style>body{margin:0;background:#090d16;overflow:hidden}</style>
</head>
<body>
    <!-- LayaAir 2.x & FGUI 完整全量依赖 (与 demo/slot/bin/index.html 一致) -->
    <script src="libs/laya.core.js"></script>
    <script src="libs/laya.ani.js"></script>
    <script src="libs/spine-core-3.8.js"></script>
    <script src="libs/laya.spine.js"></script>
    <script src="libs/laya.html.js"></script>
    <script src="libs/laya.debugtool.js"></script>
    <script src="libs/rawinflate.js"></script>
    <script src="libs/fairygui.js"></script>
    <script src="libs/tsCore.js"></script>
    <script src="libs/gameLib.js"></script>

    <!-- 主测试应用 -->
    <script src="uifactoryTestApp.js"></script>
</body>
</html>`

    fs.writeFileSync(path.join(binDir, "index.html"), indexHtml, "utf8")
    log.info("========== UIFactory 全功能检视测试台 Demo (单页) 构建成功 ==========")
}

module.exports = {buildUIFactory}

if (require.main === module) {
    buildUIFactory().catch(e => {
        console.error(e)
        process.exitCode = 1
    })
}
