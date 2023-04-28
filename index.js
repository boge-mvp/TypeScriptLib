const gulp = require("gulp")
const minify = require('gulp-minify')
const inject = require("gulp-inject-string")
const concat = require('gulp-concat')
const del = require("del")
const each = require("gulp-each")
const babel = require('gulp-babel')
const fs = require('fs')
const path = require('path')


class GenerateModule {
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
     * 使用 ts.createProject('tsconfig.json') 创建的 Project
     * @type {Project}
     */
    tsProject = null

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
     * @return {*}
     */
    createTS(files) {
        if (!fs.existsSync(this.saveTempPath + "/temp")) {
            fs.mkdirSync(this.saveTempPath + "/temp")
        }
        return gulp.src(this.beforeTs.concat(files))
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
                            let reg = new RegExp("(?<=\\s|:|\\(|!|<|\\[)" + tar + "(?=\\s+?|\\.|\\[|,|\"|\\(|\\)|;|,|>|$)", "g")
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
            // .pipe(inject.replace("export\s+(?=class|enum|interface|const)", ""))
            .pipe(inject.prepend('namespace ' + this.namespace + ' {\n'))
            .pipe(inject.append('\n}'))
            .pipe(gulp.dest(this.saveTempPath + "/temp"))
    }

    createJs() {
        return gulp.src([this.saveTempPath + "/temp/" + this.saveTempTs].concat(this.libs))
            .pipe(this.tsProject())
            .js
            .pipe(concat(this.project + ".js"))
            .pipe(inject.replace('var ' + this.namespace + ';', ''))
            .pipe(inject.prepend('window.' + this.namespace + ' = {};\n'))
            // .pipe(babel({presets: ['@babel/preset-env']}))
            .pipe(minify({ext: {min: ".min.js"}}))
            .pipe(gulp.dest(this.saveTempPath))
    }

    createDTs() {
        return gulp.src([this.saveTempPath + "/temp/" + this.saveTempTs].concat(this.libs))
            .pipe(this.tsProject())
            .dts
            .pipe(concat(this.project + ".d.ts"))
            .pipe(gulp.dest(this.saveTempPath))
    }

    /**
     * 给生成的 *.d.ts 添加新内容在尾部
     * @param appendFile 文件路径
     */
    dtsAppend(...appendFile) {
        let content = []
        for (let i = 0; i < appendFile.length; i++) {
            content.push(fs.readFileSync(appendFile[i], "utf-8"))
        }
        fs.appendFileSync(this.saveTempPath + "/" + this.project + ".d.ts", "\n\n" + content.join("\n\n"))
    }

    removeTemp() {
        return del([this.saveTempPath + "/temp/"], {force: true})
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