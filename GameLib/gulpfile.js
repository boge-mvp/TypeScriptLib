'use strict'

const gulp = require("gulp")
const {clean, buildLibrary} = require("../index")

const project = "gameLib"

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
            globalDtsFile: ["./src/entity.d.ts"]
        }
    }, done)
}))

gulp.task('default', gulp.series("build"))