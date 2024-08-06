const fs = require('fs')
const path = require('path')
const gulp = require("gulp")
const terser = require("gulp-terser")
const inject = require("gulp-inject-string")
const concat = require('gulp-concat')
const del = require("del")
const each = require("gulp-each")
const sort = require('gulp-sort')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const ts = require("gulp-typescript")
const through2 = require("through2").obj
const webp = require("./webp/ToWebp")
const {Settings} = require("gulp-typescript")
const {MinifyOptions} = require("terser")

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
    saveTempPath = "./bin"
    /**
     * 保存临时文件d.ts的名字
     * @type {string}
     */
    saveTempTs = "d.ts"
    /**
     * 最终结果生成目录
     * @type {string}
     */
    distPath = "./dist"
    /**
     * 压缩后的保存路径
     * @type {string}
     */
    minifyPath = "./dist"
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
     *
     * @type {MinifyOptions}
     */
    terserOpt = {}

    /**
     * 要放到全局的ts
     * @type {string[]}
     */
    global

    /**
     *
     * @param files {string[]}
     * @param customFun {(chunk)=>{}}
     *
     */
    createTs(files, customFun = null) {
        const tempPath = path.join(this.saveTempPath, "temp")
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, {recursive: true})
            console.log("创建目录：" + tempPath)
        }
        this.global = this.global || []

        let content = []
        for (let i = 0; i < this.global.length; i++) {
            content.push(fs.readFileSync(this.global[i], "utf-8"))
        }
        return gulp.src(this.beforeTs.concat(files, this.global.map(value => "!" + value)))
            .pipe(sort((a, b) => {
                    let aIndex = this.beforeTs.indexOf(path.relative(a.cwd, a.path).replaceAll("\\", "/"))
                    let bIndex = this.beforeTs.indexOf(path.relative(b.cwd, b.path).replaceAll("\\", "/"))
                    if (aIndex >= 0 && bIndex >= 0) {
                        return aIndex - bIndex
                    } else if (aIndex >= 0) {
                        return -1
                    } else if (bIndex >= 0) {
                        return 1
                    }
                    return a.path.localeCompare(b.path)
                }
            ))
            .pipe(each((content, file, callback) => {
                // console.log(file.history[0])
                /** @type string[] */
                let contents = content.split('\n')
                let arr = []
                /** @type string[] */
                let newContent = []
                let isNamespace = false
                for (let line of contents) {
                    // if (line.startsWith("declare namespace ")) {
                    //     break
                    // } else
                    if (/\s?namespace(\s+)?\w*\s*.*\{/.test(line)) {
                        isNamespace = true
                        // 忽略掉 已有命名空间
                    } else if (line.trimStart().startsWith("import ")) {// 将 import导入的库 缓存起来
                        if (!line.match(/((\s|})from(\s|"|{))/g) && line.indexOf("=") > -1) {
                            arr.push(line)
                        }
                    } else {
                        // 有重写方法
                        if (/(?<=\s?)override(?=\s.+\(.*?\))/.test(line)) {
                            newContent.push("\t/*@override*/")
                        }
                        // 如果没有引入其它库文件  直接跳过替换
                        if (arr.length === 0) {
                            newContent.push(line)
                            continue
                        }
                        // 将其它库文件 放到属性前面
                        for (let i = 0; i < arr.length; i++) {
                            let tar = arr[i].substring(arr[i].indexOf("import ") + 6, arr[i].indexOf("=")).trim()
                            let reg = new RegExp("(?<=^|\\s|:|\\(|!|<|\\[|>|\\{)" + tar + "(?=\\s+?|\\.|\\[|,|\"|\\(|\\)|;|,|<|>|$)", "g")
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
                if (isNamespace) { // 如果有命名空间  那么在末尾删除一个}
                    for (let i = newContent.length - 1; i >= 0; i--) {
                        if (newContent.indexOf("}") > -1) {
                            newContent[i] = newContent[i].replace(/}(?!.*})/, "")
                            break
                        }
                    }
                }
                callback(null, newContent.join("\n"))
            }))
            .pipe(concat(this.saveTempTs))
            .pipe(run((chunk) => {
                let chunkString = chunk.contents.toString('utf8')
                if (this.namespace) {
                    chunkString = 'namespace ' + this.namespace + ' {\n' + chunkString + '\n}'
                }
                chunkString += '\n\n' + content.join("\n\n")
                chunk.contents = Buffer.from(chunkString)
                customFun && customFun(chunk)
            }))
            .pipe(gulp.dest(tempPath))
            .pipe(print("生成代码文件"))
    }

    createTS = this.createTs

    /**
     * 将ts创建成js 如果后面的流数据不为空  将当做留数据处理
     * @param [files=chunk] {string[]|chunk}
     * @param [chunk=utf-8] {chunk|string}
     * @param [encoding=null] {string | (()=>{}) }
     * @param [callback=null] {()=>{}}执行完成回调
     */
    createJs(files, chunk, encoding, callback) {
        if (files && files.stat) {
            [files, chunk, encoding, callback] = [null, files, chunk, encoding]
        }
        let stream = null
        if (files || (!files && !chunk)) {
            files = [path.join(this.saveTempPath, "temp", this.saveTempTs), ...this.libs]
            stream = gulp.src(files)
        } else if (chunk) {
            // 流处理
            stream = gulp.src([chunk.path, ...this.libs])
        }
        if (!stream) throw Error("stream is null")
        stream = stream
            .pipe(ts.createProject(this.tsProject, this.settings)())
            .js
            .pipe(concat(this.project + ".js"))
            .pipe(inject.replace('var ' + this.namespace + ';', ''))
            .pipe(inject.prepend('window.' + this.namespace + ' = {};\n'))
            // .pipe(babel({
            //     presets: [["@babel/preset-env"]]
            // }))
            .pipe(gulp.dest(this.distPath))
            .pipe(print("编译成js"))
            .pipe(run(function (k) {
                callback && callback(null, k)
            }))
        if (!callback) return stream
    }

    /**
     * 执行压缩 当被当做流处理的时候 chunk不为null
     * @param [files=null] {string[]|chunk} 文件 默认 path.join(this.distPath, this.project + ".js")
     * @param [minDir=null] {string|chunk} 生成压缩保存位置 默认 this.minifyPath
     * @param [chunk=utf-8] {chunk|string}
     * @param [encoding=null] {string | (()=>{}) }
     * @param [callback=null] {()=>{}}执行完成回调
     */
    minifyJs(files, minDir, chunk, encoding, callback) {
        // 使用解构赋值获取参数值，同时设置默认参数值
        if (files && files.stat) {
            [files, minDir, chunk, encoding, callback] = [[files.path], null, files, minDir, chunk]
        } else if (minDir && minDir.stat) {
            [files, minDir, chunk, encoding, callback] = [files, null, minDir, chunk, encoding]
        }
        if (!files) files = chunk ? [chunk.path] : []
        !files.length && files.push(path.join(this.distPath, this.project + ".js"))
        !minDir && (minDir = this.minifyPath)
        const terserOpt = defaults(this.terserOpt, {
            timings: true,
            // toplevel: true,
            compress: {
                // dead_code: false, //删除无法访问的代码
                // directives: false, //删除冗余或非标准指令
                // side_effects: false, // 是否删除无副作用的代码
                // unused: false, // 是否删除未使用的代码
                // top_retain: ["ggg"] // 防止顶级属性混淆压缩
                // global_defs 条件编译  根据此设置 代码动态编译删除代码  https://github.com/terser/terser#conditional-compilation
                properties: true, // 点符号重写属性访问foo["bar"] → foo.bar
            },
            format: {
                // beautify: true, // 不进行删除空白和换行
            },
        })
        const stream = mJs(files, terserOpt)
            .pipe(gulp.dest(minDir))
            .pipe(print("生成 min.js"))
            .pipe(run(function (k) {
                k.history.pop()
                callback && callback(null, k)
            }))
        if (!callback) return stream
    }

    /**
     * 执行混淆压缩 当被当做流处理的时候 chunk不为null
     * @param terserOpt {MinifyOptions} gulp-terser 压缩传入参数. 默认: {timings: true, compress: {properties:false}, format: {quote_keys: true}}
     * @param [files=null] {string[]} 文件 默认 path.join(this.distPath, this.project + ".js")
     * @param [minDir=null] {string} 生成压缩保存位置 默认 this.minifyPath
     * @param [mapFile=null] {string} 生成的map映射位置 相对路径是 minDir目录
     * @param [chunk=utf-8] {chunk|string}
     * @param [encoding=null] {string | (()=>{}) }
     * @param [callback=null] {()=>{}}执行完成回调
     *
     */
    mangleJs(terserOpt, files, minDir, mapFile, chunk, encoding, callback) {
        // 使用解构赋值获取参数值，同时设置默认参数值
        if (files && files.stat) {
            [terserOpt, files, minDir, mapFile, chunk, encoding, callback] = [terserOpt, null, null, null, files, minDir, mapFile]
        } else if (minDir && minDir.stat) {
            [terserOpt, files, minDir, mapFile, chunk, encoding, callback] = [terserOpt, files, null, null, minDir, mapFile, chunk]
        } else if (mapFile && mapFile.stat) {
            [terserOpt, files, minDir, mapFile, chunk, encoding, callback] = [terserOpt, files, minDir, null, mapFile, chunk, encoding]
        }
        if (!files) files = chunk ? [chunk.path] : []
        !files.length && files.push(path.join(this.distPath, this.project + ".js"))
        !minDir && (minDir = this.minifyPath)

        terserOpt = defaults(terserOpt, {
            timings: true,
            // toplevel: true,
            compress: {
                // dead_code: false, //删除无法访问的代码
                // directives: false, //删除冗余或非标准指令
                // side_effects: false, // 是否删除无副作用的代码
                // unused: false, // 是否删除未使用的代码
                // top_retain: ["ggg"] // 防止顶级属性混淆压缩
                // global_defs 条件编译  根据此设置 代码动态编译删除代码  https://github.com/terser/terser#conditional-compilation
                properties: true, // 点符号重写属性访问foo["bar"] → foo.bar
            },
            format: {
                // beautify: true, // 不进行删除空白和换行
                // 保留所有带引号的属性名。  如：object.call("LP_Init")
                quote_keys: true,
            },
        })

        if (terserOpt.mangle && terserOpt.mangle.properties) {
            let reservedCache
            if (!has(terserOpt.mangle.properties, "reservedCache")) {
                reservedCache = true
            } else {
                reservedCache = terserOpt.mangle.properties.reservedCache
                delete terserOpt.mangle.properties.reservedCache
            }
            if (reservedCache) {
                let nameCache = terserOpt.nameCache || (terserOpt.nameCache = {} && terserOpt.nameCache)
                let props = terserOpt.mangle.properties.reserved
                if (props) {
                    if (!nameCache.props) nameCache.props = {}
                    if (!nameCache.props.props) nameCache.props.props = {}
                    for (const propsValue of props) {
                        nameCache.props.props["$" + propsValue] = propsValue
                    }
                }
            }
        }

        const stream = mJs(files, terserOpt, mapFile)
            .pipe(gulp.dest(minDir))
            .pipe(print("混淆 min.js", function (call) {
                call()
                callback && callback(null, chunk)
            }))
        if (!callback) return stream
    }

    /**
     * @param [chunk=null] {chunk}
     * @param [encoding="utf-8"] {string }
     * @param [callback=null] {function():{}}执行完成回调
     */
    createDTs(chunk, encoding, callback) {
        const stream = gulp.src([path.join(this.saveTempPath, "temp", this.saveTempTs), ...this.libs])
            .pipe(ts.createProject(this.tsProject, this.settings)())
            .dts
            .pipe(concat(this.project + ".d.ts"))
            .pipe(gulp.dest(this.distPath))
            .pipe(print("生成 d.ts 文件", function (call) {
                call()
                callback && callback(null, chunk)
            }))
        if (!callback) return stream
    }

    /**
     * 给生成的 *.d.ts 添加新内容在尾部
     * @param appendFile 文件路径
     *
     */
    dtsAppend(...appendFile) {
        appendFile.unshift(path.join(this.distPath, this.project + ".d.ts"))
        const stream = gulp.src(appendFile)
            .pipe(concat(this.project + ".d.ts"))
            .pipe(gulp.dest(this.distPath))
            .pipe(print("合并完成"))


        return stream
    }

    /**
     *
     * @param [files=null] {string[]} 压缩文件数组
     * @return {*}
     */
    createJsStream(files) {
        return runStream(this.createJs.bind(this), null, files)
    }

    /**
     * @param [files=null] {string[]} 文件 默认 path.join(this.distPath, this.project + ".js")
     * @param [minDir=null] {string} 生成压缩保存位置 默认 this.minifyPath
     * @return {*}
     */
    minifyJsStream(files, minDir) {
        return runStream(this.minifyJs.bind(this), null, files, minDir)
    }

    /**
     * @param terserOpt {MinifyOptions} gulp-terser 压缩传入参数. 默认: {timings: true, compress: {properties:false}, format: {quote_keys: true}}
     * @param [files=null] {string[]} 文件 默认 path.join(this.distPath, this.project + ".js")
     * @param [minDir=null] {string} 生成压缩保存位置 默认 this.minifyPath
     * @param [mapFile=null] {string} 生成的map映射位置 相对路径是 minDir目录
     * @return {*}
     */
    mangleJsStream(terserOpt, files, minDir, mapFile) {
        return runStream(this.mangleJs.bind(this), null, terserOpt, files, minDir, mapFile)
    }

    createDTsStream() {
        return runStream(this.createDTs.bind(this))
    }

    /**
     *
     * @param files {string[]}
     * @return {*}
     */
    dtsAppendStream(files) {
        return runStream((files, hk, e, r) => {
            this.dtsAppend(...files)
                .pipe(run(function () {
                    r()
                }))
        }, null, files)
    }

}

class DefaultsError extends Error {
    constructor(msg, defs) {
        super();
        this.name = "DefaultsError";
        this.message = msg;
        this.defs = defs;
    }
}

/**
 * 压缩js
 * @param files {string[] | chunk}
 * @param terserOpt {MinifyOptions}
 * @param [mapFile="."] {string} map保存位置
 * @return {*}
 */
function mJs(files, terserOpt, mapFile) {
    let stream
    if (Array.isArray(files)) {
        stream = gulp.src(files)
    } else stream = gulp.src(files.path) // 重新获取流
    if (!terserOpt.mangle) {
        return stream.pipe(terser(terserOpt)).pipe(rename({extname: '.min.js', dirname: ""}))
    }
    return stream.pipe(sourcemaps.init())
        .pipe(terser(terserOpt))
        .pipe(rename({extname: '.min.js', dirname: ""}))
        .pipe(sourcemaps.write(mapFile ? mapFile : "."))
}

/**
 * 清理文件目录
 * @param patterns {string | string[]}
 * @return {Promise<string[]>}
 */
function clean(patterns) {
    return del(patterns, {force: true})
}

/**
 * 清理文件目录
 * @param patterns {string | string[]}
 * @param [end=null] {function(()=>{}):{}}
 */
function cleanStream(patterns, end) {
    return run(async () => {
        await clean(patterns)
    }, end)
}

/**
 *
 * @param args 配置
 * @param defs 默认值
 * @param [croak=false] 验证配置在默认中存在否
 * @param [append=false] 如果存在键，如果值是数组是否追加在尾部，排除存在的
 * @return {*}
 */
function defaults(args, defs, croak, append) {
    if (args === true) {
        args = {}
    } else if (args != null && typeof args === "object") {
        args = {...args}
    }

    const ret = args || {}

    if (croak) for (const i in ret) if (has(ret, i) && !has(defs, i)) {
        throw new DefaultsError("`" + i + "` is not a supported option", defs)
    }

    for (const i in defs) if (has(defs, i)) {
        if (!args || !has(args, i)) {
            ret[i] = defs[i]
        } else if (i === "ecma") {
            let ecma = args[i] | 0;
            if (ecma > 5 && ecma < 2015) ecma += 2009;
            ret[i] = ecma
        } else {
            ret[i] = (args && has(args, i)) ? (() => {
                const value = args[i]
                if (Array.isArray(value) && append) {
                    for (const defValue of defs[i]) {
                        if (value.indexOf(defValue) < 0) {
                            value.push(defValue)
                        }
                    }
                }
                return value
            })() : defs[i]
        }
    }
    return ret
}

function has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * 创建路径文件的所有目录
 * @param filePath
 */
function createDirectory(filePath) {
    // 获取路径的目录名称
    const dirname = path.dirname(filePath)
    // 检查目录是否存在
    if (fs.existsSync(dirname)) return
    // 递归创建目录
    createDirectory(dirname)
    // 创建当前目录
    fs.mkdirSync(dirname)
}

/**
 * 一个通过流传输的打印，每次都会调用操作
 * @param prefix {string}
 * @param [end=null] {function(()=>{}):{}} 结束流 参数方法需要回调不然会阻塞
 */
function print(prefix, end) {
    return run(function (prefix, chunk, encoding) {
        console.log(prefix, chunk.path)
    }, end, prefix)
}

/**
 * 配合gulp pipe 流执行，必须有返回非 undefined 的值  否则阻塞
 * @param func {({chunk},{enc},{callback})=>Boolean} 返回值不是 undefined 将会立即结束流 否者等待调用callback
 * @param [end=null] {function(()=>{}):{}} 结束流 参数方法需要回调不然会阻塞
 * @param args {any} 附带的参数  会放在开头
 */
function runStream(func, end, ...args) {
    return through2(function (chunk, encoding, callback) {
        if (func) {
            let result = func.apply(this, [...args, chunk, encoding, callback])
            if (result !== undefined) callback(null, chunk)
        } else callback(null, chunk)
    }, end)
}

/**
 * 运行一次流处理 function中不要执行异步数据处理，否则执行顺序会混乱
 * @param func {({chunk},{enc})=>{}} 处理方法
 * @param [end=null] {function(()=>{}):{}} 结束流 参数方法需要回调不然会阻塞
 * @param args {any} 附带的参数  会放在开头
 * @return {*}
 */
function run(func, end, ...args) {
    return through2(function (chunk, encoding, callback) {
        func && func.apply(this, [...args, chunk, encoding])
        callback(null, chunk)
    }, end)
}

/**
 * 收集指定路径下的所有文件路径
 * @param url {string} 相对路径或绝对路径
 * @return {Promise<string[]>} 完整路径数据
 */
function findFiles(url) {
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
        url = path.resolve(url)
        read(url)
    })
}

/**
 * 收集指定路径下的所有文件路径
 * @param url {string} 相对路径或绝对路径
 * @return string[] 完整路径数据
 */
function findFilesSync(url) {
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
    url = path.resolve(url)
    read(url)
    return files
}

const generate = new GenerateModule()

generate.createDirectory = createDirectory
generate.clean = clean

module.exports = generate
module.exports.generate = generate
module.exports.print = print
module.exports.clean = clean
module.exports.defaults = defaults
module.exports.createDirectory = createDirectory
module.exports.cleanStream = cleanStream
module.exports.runStream = runStream
module.exports.run = run
module.exports.mJs = mJs

module.exports.findFiles = findFiles
module.exports.findFilesSync = findFilesSync