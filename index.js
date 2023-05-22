const gulp = require("gulp")
const minify = require('gulp-minify')
const inject = require("gulp-inject-string")
const concat = require('gulp-concat')
const del = require("del")
const each = require("gulp-each")
const sort = require('gulp-sort')
const babel = require('gulp-babel')
const fs = require('fs')
const path = require('path')
const ts = require("gulp-typescript")
const through2 = require("through2")
const webp = require("./webp/ToWebp")
const {Settings} = require("gulp-typescript");

class GenerateModule {

    webp = new webp.Webp()

    /**
     * 要在最前面编译的ts文件
     * @type {string[]}
     */
    beforeTs = []

    /**
     * 需要支持的库文件
     * @type {string[]}
     */
    libs = []
    /**
     * 保存临时文件的目录
     * @type {string}
     */
    saveTempPath = "bin"
    /**
     * 保存临时文件d.ts的名字
     * @type {string}
     */
    saveTempTs = "d.ts"
    /**
     * 命名空间  将整个库文件打包到一个对象内
     * @type {string}
     */
    namespace = "core"
    /**
     * 项目名字  生成的js 和 .d.ts 就用这个名字
     * @type {string}
     */
    project = "core"

    /**
     * tsconfig.json 配置路径
     */
    tsProject = 'tsconfig.json'

    /**
     * @type {Settings}
     */
    settings

    /**
     * 清理文件目录
     * @param patterns {string | string[]}
     * @return {Promise<string[]>}
     */
    clean(patterns) {
        return del(patterns, {force: true})
    }

    /**
     *
     * @param files {string[]}
     * @param customFun {(file)=>{}}
     * @return {*}
     */
    createTS(files, customFun = null) {
        if (!fs.existsSync(this.saveTempPath + "/temp")) {
            fs.mkdirSync(this.saveTempPath + "/temp", {recursive: true})
            console.log("创建目录：" + this.saveTempPath + "/temp")
        }
        return gulp.src(this.beforeTs.concat(files))
            .pipe(sort({
                comparator: (a, b) => {
                    let aIndex = this.beforeTs.indexOf(path.relative(a.cwd, a.path).replaceAll("\\", "/"))
                    let bIndex = this.beforeTs.indexOf(path.relative(b.cwd, b.path).replaceAll("\\", "/"))
                    if (aIndex >= 0 && bIndex >= 0) {
                        return aIndex - bIndex
                    } else if (aIndex >= 0) {
                        return -1
                    } else if (bIndex >= 0) {
                        return 1
                    }
                    return a.path.localeCompare(b.path);
                }
            }))
            .pipe(each((content, file, callback) => {
                // console.log(file.history[0])
                let contents = content.split('\n')
                let arr = []
                let newContent = []
                for (let line of contents) {
                    // if (line.startsWith("declare namespace ")) {
                    //     break
                    // } else
                    if (line.startsWith("import ")) {
                        if (!line.match(/((\s|})from(\s|"|{))/g) && line.indexOf("=") > -1) {
                            arr.push(line)
                        }
                    } else {
                        if (arr.length === 0) {
                            newContent.push(line)
                            continue
                        }
                        for (let i = 0; i < arr.length; i++) {
                            let tar = arr[i].substring(arr[i].indexOf("import ") + 6, arr[i].indexOf("=")).trim()
                            let reg = new RegExp("(?<=\\s|:|\\(|!|<|\\[|>)" + tar + "(?=\\s+?|\\.|\\[|,|\"|\\(|\\)|;|,|>|$)", "g")
                            if (reg.test(line)) {
                                let endIndex = arr[i].lastIndexOf(".")
                                let newC = arr[i].substring(arr[i].lastIndexOf("=") + 1, endIndex).trim()
                                // let value = reg.exec(line)
                                line = line.replace(reg, newC + "." + tar)
                            }
                        }
                        newContent.push(line)
                    }
                }
                callback(null, newContent.join("\n"))
            }))
            .pipe(concat(this.saveTempTs))
            .pipe(through2.obj((file, encoding, callback) => {
                customFun && customFun(file)
                return callback(null, file)
            }))
            .pipe(inject.prepend('namespace ' + this.namespace + ' {\n'))
            .pipe(inject.append('\n}'))
            .pipe(gulp.dest(this.saveTempPath + "/temp"))
            .pipe(this.print("生成代码文件"))
    }

    createJs() {
        return gulp.src([this.saveTempPath + "/temp/" + this.saveTempTs].concat(this.libs))
            .pipe(ts.createProject(this.tsProject, this.settings)())
            .js
            .pipe(concat(this.project + ".js"))
            .pipe(inject.replace('var ' + this.namespace + ';', ''))
            .pipe(inject.prepend('window.' + this.namespace + ' = {};\n'))
            // .pipe(babel({presets: ['@babel/preset-env']}))
            .pipe(minify({ext: {min: ".min.js"}}))
            .pipe(gulp.dest(this.saveTempPath))
            .pipe(this.print("生成js文件"))
    }

    createDTs() {
        return gulp.src([this.saveTempPath + "/temp/" + this.saveTempTs].concat(this.libs))
            .pipe(ts.createProject(this.tsProject, this.settings)())
            .dts
            .pipe(concat(this.project + ".d.ts"))
            .pipe(gulp.dest(this.saveTempPath))
            .pipe(this.print("生成d.ts文件"))
    }

    /**
     * 给生成的 *.d.ts 添加新内容在尾部
     * @param appendFile 文件路径
     */
    dtsAppend(...appendFile) {
        appendFile.unshift(this.saveTempPath + "/" + this.project + ".d.ts")
        return gulp.src(appendFile)
            .pipe(concat(this.project + ".d.ts"))
            .pipe(gulp.dest(this.saveTempPath))
            .pipe(this.print("合并完成"))
    }

    removeTemp() {
        return del([this.saveTempPath + "/temp/"], {force: true})
    }

    /**
     * 一个通过流传输的自定义插件，每次都会调用操作
     * @param prefix {string}
     * @return {*}
     */
    print(prefix) {
        return through2.obj(function (file, encoding, callback) {
            console.log(prefix + ": " + file.path)
            return callback(null, file)
        })
    }

}

module.exports = new GenerateModule()

/**
 * 收集所有的文件路径
 * @param url
 */
module.exports.findFiles = function (url) {
    return new Promise((resolve, reject) => {
        const files = []
        const read = (dir) => {
            fs.readdir(dir, {withFileTypes: true}, (err, entries) => {
                if (err) {
                    reject()
                    return
                }
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name).replace(/\\/g, "/")
                    if (entry.isDirectory()) {
                        read(fullPath)
                    } else {
                        files.push(fullPath)
                    }
                }
                resolve(files)
            })

        }
        read(url)
    })
}

module.exports.findFilesSync = (url) => {
    const files = []
    const read = (dir) => {
        const entries = fs.readdirSync(dir, {withFileTypes: true})
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name).replace(/\\/g, "/")
            if (entry.isDirectory()) {
                read(fullPath)
            } else {
                files.push(fullPath)
            }
        }
    }
    read(url)
    return files
}