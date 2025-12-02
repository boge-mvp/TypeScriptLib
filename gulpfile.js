'use strict'

const fs = require("fs")
const zlib = require('zlib')
const http = require('https')
const path = require("path")
const log = require("gulplog")
const gulp = require("gulp")

const AdmZip = require('adm-zip')
const {reserved} = require("./reserved")
const {createDirectory, cleanStream, mJs, buildJs, buildDts} = require("./index")
const {SourceMapConsumer, SourceNode} = require('source-map');

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

gulp.task("clean", (done) => {
    log.info("[clean] 无实现")
    done()
    // return clean([
    //     ".bin/**/gameCore**.d.ts",
    //     ".bin/**/gameCore**.js",
    //     ".bin/**/gameCore**.js.map",
    // ])
})

//完整构建
gulp.task('build', gulp.series("clean", (done) => {
        log.info("[build] 无实现")
        // return gulp.src([
        //     "./TSCore/bin/**/*",
        //     "./GameLib/bin/**/*"
        // ]).pipe(gulp.dest("./bin"))
        done()
    }
))

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

gulp.task("min-js", () => {
    return mJs(
        ["./template/domparserinone.js", "./template/gameload.js", "./template/reflect.js"],
        undefined, undefined, {
            addComment: false
        }
    ).pipe(gulp.dest("./template"))
})

gulp.task("buildJsTest", () => {
    return buildJs({
            globs: ["TSCore/src/com/*.ts", "./TsCore/bin/*.d.ts"]
        }, "testApp", "bin/test", {
            namespace: "teconst",
            plugs: [{
                onBeforeCodeCompile: function (file) {
                    if (file.basename === "Path.js") {
                        let code = file.contents.toString()
                        code += "\nnew Path()\n"
                        file.contents = Buffer.from(code)
                        // console.log(file)
                    }
                },
                onAfterCodeCompile: function (file) {
                    const code = file.contents.toString()
                    // console.log(file)
                }
            }]
        }
    )
})
gulp.task("buildDtsTest", () => {
    return buildDts({
        globs: ["TSCore/src/com/*.ts", "./TsCore/bin/*.d.ts"]
    }, "testApp", "bin/test", undefined, "tscore")
})


gulp.task('default', gulp.series("build"))


gulp.task("test", () => {
    console.log(path.dirname("D:\\WorkSpace\\LayaBox\\TypeScriptLib\\delete.js"))
})