'use strict'

const fs = require("fs")
const zlib = require('zlib')
const http = require('https')
const path = require("path")
const log = require("gulplog")
const gulp = require("gulp")

const {reserved} = require("./reserved")
const {createDirectory, cleanStream, mJs, buildJs, buildDts, rollupPack} = require("./index")
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

//下载并安装 webp 工具到用户目录 ~/.webp/bin/（委托 webp/downloader.js，支持多平台、版本 1.6.0）
gulp.task("updateWEBP", (done) => {
    const {ensureWebpBinaries, getBinDir} = require("./webp/downloader.js")
    ensureWebpBinaries().then(() => {
        console.log(`[updateWEBP] webp 工具就绪: ${getBinDir()}`)
        done()
    }).catch((error) => {
        console.error(`[updateWEBP] 下载或解压失败: ${error.message}`)
        done(error)
    })
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