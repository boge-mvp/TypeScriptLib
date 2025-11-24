'use strict'

const {clean, buildLibrary} = require("../index")

const path = require("path")
const gulp = require("gulp")
const {reserved} = require("../reserved")
const gulpTs = require("gulp-typescript")
const fs = require('fs');

const ts = require('typescript')

const project = "tsCore"

gulp.task("clean", () => {
    return clean([
        `./bin/**/${project}**.ts`,
        `./bin/**/${project}**.js`,
        `./bin/**/${project}**.js.map`,
    ])
})

function buildLib(done) {
    buildLibrary({
        src: {
            globs: ["src/**/*.ts"],
        },
        outName: project,
        dist: "./bin",
        namespace: project,
        js: {isMinify: true},
        dts: {
            globalDtsFile: ["./src/define.d.ts", "./src/entity.d.ts"]
        }
    }, function () {
        done()
    })
}


gulp.task('build', gulp.series("clean", buildLib))

gulp.task('default', gulp.series("build"))