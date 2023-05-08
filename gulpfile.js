'use strict'

const gulp = require("gulp")
const ts = require('gulp-typescript')
const fs = require('fs')
const http = require('https')
const zlib = require('zlib')
const AdmZip = require('adm-zip')
const generate = require("./index")

// 需要添加到最前面的类
let beforeTs = ["src/com/core/View.ts", "src/com/core/Proxys.ts",
    "src/com/core/BaseView.ts", "src/com/utils/ChangeValue.ts",
    "src/com/utils/UtilsTool.ts"]

generate.tsProject = 'tsconfig.json'
generate.beforeTs = beforeTs
generate.libs = ["libs/**/*", "src/**/*.d.ts"]
generate.project = "gameCore"
generate.namespace = "coreLib"
generate.saveTempPath = "bin"
generate.saveTempTs = "d22.ts"



gulp.task("clean", () => {
    return generate.clean(["bin/**/*.*", "!bin/*.html", "!bin/webp"])
})

gulp.task('createTS', () => {
    return generate.createTS(["src/**/*.ts", "!**/*.d.ts"])
})

gulp.task('createJs', () => {
    return generate.createJs()
})

gulp.task('createDTs', () => {
    return generate.createDTs()
})

gulp.task('dtsAppend', () => {
    return generate.dtsAppend("src/**/*.d.ts")
})

gulp.task('removeTemp', () => {
    return generate.clean("bin/temp/")
})

//完整构建
gulp.task('build', gulp.series("clean", 'createTS', "createJs", "createDTs", "dtsAppend"
    , "removeTemp"
))


let downloadWebp = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.3.0-windows-x64.zip"
const filePath = 'bin/webp' // 下载文件的路径

gulp.task("updateWEBP", (done) => {
    // 创建http请求
    http.get(downloadWebp, (res) => {
        let downloadZip = filePath + "/file.zip"
        // 创建写入文件的流
        const fileWriteStream = fs.createWriteStream(downloadZip)
        // 如果压缩文件被gzip压缩，则创建解压流
        const unzipStream = res.headers['content-encoding'] === 'gzip' ? zlib.createGunzip() : null

        // 将响应流和解压流连接起来
        const responseStream = unzipStream ? res.pipe(unzipStream) : res

        // 将响应流和写入文件的流连接起来
        responseStream.pipe(fileWriteStream)

        // 监听下载完成事件
        fileWriteStream.on('finish', () => {
            console.log('下载完成, 开始解压')
            fs.unlinkSync(filePath + "/bin")
            // 创建AdmZip对象
            const zip = new AdmZip(downloadZip)
            // 解压zip文件到指定文件夹
            zip.extractEntryTo("libwebp-1.3.0-windows-x64/bin/", filePath + "/bin", false)
            fs.unlinkSync(downloadZip)
            // zip.extractAllTo(filePath, true)
            console.log('解压完成')

        })
    }).on('error', (error) => {
        console.error(`下载失败: ${error.message}`)
    })
    done()
})