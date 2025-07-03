'use strict'

const fs = require('fs')
const zlib = require('zlib')
const http = require('https')
const path = require("path")

const gulp = require("gulp")
const concat = require("gulp-concat")
const {append} = require("gulp-inject-string")

const AdmZip = require('adm-zip')
const {reserved} = require("./reserved")
const {generate, createDirectory, clean, runStream, cleanStream, print} = require("./index")
const {SourceMapConsumer, SourceNode} = require('source-map');
const typescript = require("typescript")

// 需要添加到最前面的类
let beforeTs = ["src/com/Factory.ts", "src/com/block/Block.ts", "src/com/core/View.ts", "src/com/core/Proxys.ts",
    "src/com/core/BaseView.ts", "src/com/utils/ChangeValue.ts",
    "src/com/utils/UtilKit.ts"]

generate.global = ["src/Types.ts"]
generate.tsProject = 'tsconfig.json'
generate.beforeTs = beforeTs
generate.libs = ["./libs/**/*", "./src/**/*.d.ts"]
generate.project = "gameCore"
generate.namespace = "coreLib"
generate.saveTempPath = "./bin"
generate.distPath = generate.minifyPath = "./bin"
generate.saveTempTs = "lib.ts"
// generate.settings = {typescript: typescript}

const libCache = path.join(generate.distPath, "libCache.json")

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
        ".bin/**/gameCore**.d.ts",
        ".bin/**/gameCore**.js",
        ".bin/**/gameCore**.js.map",
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
    let libs = {}
    if (fs.existsSync(libCache)) {
        libs = JSON.parse(fs.readFileSync(libCache, "utf8"))
    }
    let cacheFile = path.join(generate.distPath, "nameCache.json")
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
    }, null, generate.distPath + "/min", "../map")
        .on('end', function () {
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
    return clean("bin/temp")
})

//完整构建
// gulp.task('build', gulp.series("clean", 'createTs', "createJs", "minifyJs", "mangleJs", "createDTs", "dtsAppend"
//     , "removeTemp"
// ))
gulp.task('build', gulp.series("clean", () => {
        return gulp.src([
            "./TSCore/bin/**/*",
            "./GameLib/bin/**/*"
        ]).pipe(gulp.dest("./bin"))
    }
    // , () => {
    //     return gulp.src("./bin2/*Lib.js")
    //         .pipe(concat(`${generate.namespace}.js`))
    //         .pipe(append(`window.${generate.namespace}=Object.assign({},window.enhanceLib,window.gameLib)`))
    //         .pipe(gulp.dest("./bin2"))
    //         .pipe(cleanStream(["./bin2/*Lib.js", `!./bin2/${generate.namespace}.js`]))
    //         .pipe(print("create"))
    // }, () => {
    //     return gulp.src("./bin2/*.min.js")
    //         .pipe(concat(`${generate.namespace}.min.js`))
    //         .pipe(append(`window.${generate.namespace}=Object.assign({},window.enhanceLib,window.gameLib)`))
    //         .pipe(gulp.dest("./bin2"))
    //         .pipe(cleanStream(["./bin2/*.min.js", `!./bin2/${generate.namespace}.min.js`]))
    //         .pipe(print("create"))
    // }, () => {
    //     return gulp.src("./bin2/*.d.ts")
    //         .pipe(concat(`${generate.namespace}.d.ts`))
    //         .pipe(append(`window.${generate.namespace}=Object.assign({},window.enhanceLib,window.gameLib)`))
    //         .pipe(gulp.dest("./bin2"))
    //         .pipe(cleanStream(["./bin2/*.d.ts", `!./bin2/${generate.namespace}.d.ts`]))
    //         .pipe(print("create"))
    // }, () => {
    //     return gulp.src("./bin2/min/*.min.js")
    //         .pipe(concat(`${generate.namespace}.min.js`))
    //         .pipe(append(`window.${generate.namespace}=Object.assign({},window.enhanceLib,window.gameLib)`))
    //         .pipe(gulp.dest("./bin2/min"))
    //         .pipe(cleanStream(["./bin2/min/*.min.js", `!./bin2/min/${generate.namespace}.min.js`]))
    //         .pipe(print("create"))
    // }, () => {
    //     return gulp.src("./bin2/map/*.js.map")
    //         .pipe(concat(`${generate.namespace}.js.map`))
    //         // .pipe(append(`window.${generate.namespace}=Object.assign({},window.enhanceLib,window.gameLib)`))
    //         .pipe(gulp.dest("./bin2/map"))
    //         .pipe(cleanStream(["./bin2/map/*.js.map", `!./bin2/map/${generate.namespace}.js.map`]))
    //         .pipe(print("create"))
    // }
))

gulp.task('buildStream', gulp.series("clean", () => {
    let libs = {}
    if (fs.existsSync(libCache)) {
        libs = JSON.parse(fs.readFileSync(libCache, "utf8"))
    }
    let cacheFile = generate.distPath + "/nameCache.json"
    if (!fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, "{}", "utf8")
    let minCaches = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
    minCaches = {}
    let nameCaches = {...libs, ...minCaches}

    return generate.createTs(["src/**/*.ts", "!**/*.d.ts"])
        .pipe(generate.createJsStream())
        .pipe(generate.minifyJsStream())
        .pipe(generate.mangleJsStream({
            sourceMap: true,
            nameCache: nameCaches,
            mangle: {properties: {reserved: reserved}},
            format: {preserve_annotations: true}
            // toplevel: true
        }, null, generate.distPath + "/min", "../map"))
        .pipe(runStream(function () {
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
    if (!fs.existsSync(libCache)) {
        createDirectory(libCache)
        fs.writeFileSync(libCache, "{}", "utf8")
    }
    let nameCaches = JSON.parse(fs.readFileSync(libCache, "utf8"))
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
        "./template/worker.js",
        "./template/workerloader.js",
    ], generate.distPath + "/min", "../map")
        .on('end', function () {
            fs.writeFileSync(libCache, JSON.stringify(nameCaches));
        })
})

gulp.task("min-js", () => {
    return generate.minifyJs(["./template/domparserinone.js", "./template/gameload.js", "./template/Reflect.js"], "./template")
})


gulp.task('default', gulp.series("build"))