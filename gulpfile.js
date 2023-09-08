'use strict'

const fs = require('fs')
const zlib = require('zlib')
const http = require('https')
const gulp = require("gulp")
const ts = require('gulp-typescript')
const merge2 = require('merge2')
const AdmZip = require('adm-zip')
// const {} = require("./index")
const generate = require("./index")
const typescript = require("typescript")
const {SourceMapConsumer, SourceNode} = require('source-map');
const path = require("path");

// 需要添加到最前面的类
let beforeTs = ["src/com/Factory.ts", "src/com/core/View.ts", "src/com/core/Proxys.ts",
    "src/com/core/BaseView.ts", "src/com/utils/ChangeValue.ts",
    "src/com/utils/UtilKit.ts"]

generate.global = ["src/Types.ts"]
generate.tsProject = 'tsconfig.json'
generate.beforeTs = beforeTs
generate.libs = ["./libs/**/*", "./src/**/*.d.ts"]
generate.project = "gameCore"
generate.namespace = "coreLib"
generate.saveTempPath = "./bin"
generate.saveTempTs = "lib.ts"
// generate.settings = {typescript: typescript}


let reserved = [

    // glsl
    "clipMatDir", "clipMatPos", "clipOff", "mmat", "u_MvpMatrix",
    "texture", "strength_sig2_2sig2_gauss1", "blurInfo",
    "colorAlpha", "colorMat", "u_color", "u_blurInfo1", "u_blurInfo2", "colorAdd", "u_TexRange",
    "offsetX", "offsetY", "texcoord", "u_mmat2", "colorAdd", "v_color",

    // "blendMode"
    "normal", "overlay", "light", "destination-out", "add_old", "lighter", "lighter_old",
    "READ_DATA", "READ_BLOCK", "READ_STRINGS", "READ_ANIMATIONS",

    // lib
    "Laya", "xoffset", "yoffset", "xadvance", "blendMode", "inst",

    // core
    "SceneManager", "openGame", "closeGame", "showGameToView",
    "APP", "share", "openApp", "showGame",

    // config prop
    "ignoreSuffix", "forceLoad", "runLoad", "branch", "res", "couponHelp", "js", "bonusFormat", "odds", "completeFun", "guide", "helpRes",
    "bet_limit", "expire_time", "faceValue", "games", "num", "total_number",

    // spine
    "skeleton", "fps", "bones", "bone", "slots", "ik", "skins", "attachments", "events", "animations", "uvs", "vertexCount", "vertices", "triangles",

    // dom
    "stencil", "premultipliedAlpha", "preserveDrawingBuffer", "tx", "ty", "skew"

    // "run", "runWith", "getRes"
]

gulp.task("resetSource", (f) => {

    // 创建 SourceMapConsumer 对象，用于解析 Source Map 文件
    const consumer = new SourceMapConsumer(fs.readFileSync("bin/gameCore.min.js.map", "utf8"))
    // 将压缩后的 JavaScript 代码转换为 SourceNode 对象
    const node = SourceNode.fromStringWithSourceMap(fs.readFileSync("bin/gameCore.min.js", "utf8"), consumer);
    const {code} = node.toStringWithSourceMap();
    console.log(code)
    fs.writeFileSync("dist/gameCore.js", code, "utf8")
    f()
})

gulp.task("clean", () => {
    return generate.clean([
        "dist/**/gameCore**.d.ts",
        "dist/**/gameCore**.js",
        "dist/**/gameCore**.js.map",
    ])
})

gulp.task('createTs', () => {
    return generate.createTs(["src/**/*.ts", "!**/*.d.ts"])
})

gulp.task('createJs', () => {
    return generate.createJs()
})

gulp.task('minifyJs', () => {
    return generate.minifyJs()
})

gulp.task('mangleJs', () => {
    let libFile = "./dist/libCache.json"
    let libs = {}
    if (fs.existsSync(libFile)) {
        libs = JSON.parse(fs.readFileSync(libFile, "utf8"))
    }
    let cacheFile = "dist/nameCache.json"
    if (!fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, "{}", "utf8")
    let minCaches = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
    minCaches = {}
    let nameCaches = {...libs, ...minCaches}

    return generate.mangleJs({
        sourceMap: true,
        nameCache: nameCaches,
        // keep_fnames: [],
        // keep_classnames
        mangle: {
            properties: {
                // keep_quoted: true, // 如果设为 true，使用带引号的属性名称 （'o[“foo”]'） 会保留属性名称 （'foo'），以便即使以不带引号的样式 （'o.foo'） 使用，它也不会在整个脚本中被破坏
                reserved: reserved
            },
            //     // keep_fnames: /Laya\.*/,
            //     toplevel: true,
        },
        format: {
            preserve_annotations: true
        }

        // toplevel: true
    }, null, "./dist/min", "../map").on('end', function () {
        // console.log("结束了")
        // 当 Gulp 任务结束时, 把 nameCache 写入到文件中
        // console.log(nameCaches)
        fs.writeFileSync(cacheFile, JSON.stringify(nameCaches));
    })
})

gulp.task('createDTs', () => {
    return generate.createDTs()
})

gulp.task('dtsAppend', () => {
    return generate.dtsAppend("src/**/*.d.ts")
})

gulp.task('removeTemp', () => {
    return generate.clean("bin")
})

//完整构建
gulp.task('build', gulp.series("clean", 'createTs', "createJs", "minifyJs", "mangleJs", "createDTs", "dtsAppend"
    , "removeTemp"
))

gulp.task('buildStream', gulp.series("clean", () => {
    let libFile = "./dist/libCache.json"
    let libs = {}
    if (fs.existsSync(libFile)) {
        libs = JSON.parse(fs.readFileSync(libFile, "utf8"))
    }
    let cacheFile = "dist/nameCache.json"
    if (!fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, "{}", "utf8")
    let minCaches = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
    minCaches = {}
    let nameCaches = {...libs, ...minCaches}

    return generate.createTs(["src/**/*.ts", "!**/*.d.ts"])
        .pipe(generate.createJsStream())
        .pipe(generate.minifyJsStream())
        .pipe(generate.mangleJsStream({
            sourceMap: true, nameCache: nameCaches, mangle: {properties: {reserved: reserved}}, format: {preserve_annotations: true}
            // toplevel: true
        }, null, "./dist/min", "../map"))
        .pipe(generate.runStream(function () {
            console.log("write cache")
            // 把 nameCache 写入到文件中
            // console.log(nameCaches)
            fs.writeFileSync(cacheFile, JSON.stringify(nameCaches));
            return true
        }))
        .pipe(generate.createDTsStream())
        .pipe(generate.dtsAppendStream(["src/**/*.d.ts"]))


}, "removeTemp"))


let downloadWebp = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.3.0-windows-x64.zip"
const filePath = 'webp' // 下载文件的路径

gulp.task("updateWEBP", (done) => {
    // 创建http请求
    http.get(downloadWebp, (res) => {
        let downloadZip = filePath + "/file.zip"
        if (fs.existsSync(downloadZip))
            unzip()
        else
            download()

        function download() {
            // 创建写入文件的流
            const fileWriteStream = fs.createWriteStream(downloadZip)
            // 如果压缩文件被gzip压缩，则创建解压流
            const unzipStream = res.headers['content-encoding'] === 'gzip' ? zlib.createGunzip() : null

            // 将响应流和解压流连接起来
            const responseStream = unzipStream ? res.pipe(unzipStream) : res

            // 将响应流和写入文件的流连接起来
            responseStream.pipe(fileWriteStream)

            // 监听下载完成事件
            fileWriteStream.on('finish', unzip)
        }

        function unzip() {
            console.log('下载完成, 开始解压')
            if (fs.existsSync(filePath + "/bin")) fs.unlinkSync(filePath + "/bin")
            // 创建AdmZip对象
            const zip = new AdmZip(downloadZip)
            // 解压zip文件到指定文件夹
            zip.extractEntryTo("libwebp-1.3.0-windows-x64/bin/", filePath + "/bin", false)
            fs.unlinkSync(downloadZip)
            // zip.extractAllTo(filePath, true)
            console.log('解压完成')
        }
    }).on('error', (error) => {
        console.error(`下载失败: ${error.message}`)
    })
    done()
})

gulp.task('build-Temp', () => {
    let cacheFile = "dist/libCache.json"
    if (!fs.existsSync(cacheFile)) {
        generate.createDirectory(cacheFile)
        fs.writeFileSync(cacheFile, "{}", "utf8")
    }
    let nameCaches = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
    nameCaches = {}
    return generate.mangleJs({
        sourceMap: true,
        nameCache: nameCaches,
        toplevel: true,
        mangle: {
            properties: {
                // keep_quoted: true, // 如果设为 true，被引号的属性名就不会被更改。
                reserved: reserved,
            },
            // keep_fnames: /Laya\.*/,
            // toplevel: false,
        },
    }, [
        "./template/laya.core.js",
        "./template/laya.html.js",
        "./template/laya.ani.js",
        "./template/laya.debugtool.js",
        "./template/spine-core-3.8.js",
        "./template/laya.spine.js",
        "./template/fairygui.js",
    ], "./dist/min", "../map").on('end', function () {
        fs.writeFileSync(cacheFile, JSON.stringify(nameCaches));
    })
})

gulp.task("min-js", () => {
    return generate.mangleJs(null, ["./template/domparserinone.js"],
        "./dist/min", "../map")
})
