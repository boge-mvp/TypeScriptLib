'use strict'
// GameLib 构建入口（rollup 版 buildLibrary；chdir 到本目录使相对路径基于模块根）
process.chdir(__dirname)

const {clean} = require("../lib/util")
const {buildLibrary} = require("../lib/build-library")

const project = "gameLib"

async function main() {
    await clean([
        `./bin/**/${project}**.ts`,
        `./bin/**/${project}**.js`,
        `./bin/**/${project}**.js.map`,
    ])
    await buildLibrary({
        src: {
            globs: ["src/**/*.ts", "**/*.d.ts", "../TSCore/bin/*.d.ts"],
        },
        outName: project,
        dist: "./bin"
    }, {
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

main().catch(err => {
    console.error(err)
    process.exitCode = 1
})
