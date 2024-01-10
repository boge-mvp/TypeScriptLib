'use strict'

const fs = require('fs')
const path = require("path")

const gulp = require("gulp")
const {generate, createDirectory, clean, runStream} = require("../index")
const typescript = require("typescript")


let reserved = []
// 需要添加到最前面的类
let beforeTs = ["src/com/core/BaseView.ts"]

generate.global = ["src/GameGlobal.ts"]
generate.tsProject = 'tsconfig.json'
generate.beforeTs = beforeTs
generate.libs = ["../libs/**/*", "./src/**/*.d.ts", "../TSCore/bin/*.d.ts"]
generate.project = generate.namespace = "gameLib"
generate.saveTempPath = "./bin"
generate.distPath = generate.minifyPath = "./bin"
generate.saveTempTs = "lib.ts"
// generate.settings = {typescript: typescript}

const libCache = path.join("../TSCore/bin", "nameCache.json")

gulp.task("clean", () => {
    return generate.clean([
        `./bin/**/${generate.project}**.d.ts`,
        `./bin/**/${generate.project}**.js`,
        `./bin/**/${generate.project}**.js.map`,
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
        },
        toplevel: true
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
gulp.task('build', gulp.series("clean", 'createTs', "createJs", "minifyJs", "mangleJs", "createDTs", "dtsAppend"
    , "removeTemp"
))

gulp.task('buildStream', gulp.series("clean", () => {
    let libs = {}
    if (fs.existsSync(libCache)) {
        libs = JSON.parse(fs.readFileSync(libCache, "utf8"))
    }
    let cacheFile = generate.distPath + "/nameCache.json"
    if (!fs.existsSync(cacheFile)) {
        createDirectory(cacheFile)
        fs.writeFileSync(cacheFile, "{}", "utf8")
    }
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
            format: {preserve_annotations: true},
            toplevel: true
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

gulp.task('default', gulp.series("buildStream"))