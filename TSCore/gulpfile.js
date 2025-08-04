'use strict'

const {clean, buildLibrary} = require("../index")

const path = require("path")
const gulp = require("gulp")
const {reserved} = require("../reserved")

const project = "tsCore"

gulp.task("clean", () => {
    return clean([
        `./bin/**/${project}**.ts`,
        `./bin/**/${project}**.js`,
        `./bin/**/${project}**.js.map`,
    ])
})

gulp.task('build', gulp.series("clean", (done) => {
    buildLibrary({
        src: {
            globs: ["src/**/*.ts", "!**/*.d.ts"],
        },
        outName: project,
        dist: "./bin",
        namespace: project,
        js: {isMinify: true},
        dts: {
            globalDtsFile: ["./src/define.d.ts", "./src/entity.d.ts"]
        }
    }, done)
}))

gulp.task('default', gulp.series("build"))