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

function buildLib(done) {
    buildLibrary({
        src: {
            globs: ["src/**/*.ts", "**/*.d.ts", "../TSCore/bin/*.d.ts"],
        },
        outName: project,
        dist: "./bin"
    }, done, {
        js: {
            namespace: project,
            isMinify: true,
            plugs: [{
                onAfterCodeCompile: function (file) {
                    let content = file.contentBuffer.toString()
                    content += "\nnew Activation()\n"
                    file.contentBuffer = Buffer.from(content)
                }
            }]
        },
        dts: {
            namespace: project,
            globalDtsFile: ["./src/entity.d.ts"]
        }
    })
}

gulp.task('build', gulp.series("clean", buildLib))

gulp.task('default', gulp.series("build"))