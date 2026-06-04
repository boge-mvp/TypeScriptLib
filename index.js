const fs = require('fs')
const path = require('path')

const del = require("del")
const gulp = require("gulp")
const log = require("gulplog")
const gulpTerser = require("gulp-terser")
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const {InitOptions, WriteOptions} = require("gulp-sourcemaps")
const gulpTs = require("gulp-typescript")

const through2 = require("through2")
const {MinifyOptions} = require("terser")
const webp = require("./webp/ToWebp")
const {addMetadata, createNamespaceTransformer, scanNode} = require("./typescript-parse");
const {rollupStream, run} = require("./gulp-stream-util")
const ifelse = require("./gulp-ifelse")
const namespacePlug = require("./gulp-namespace")
const concatSource = require("./gulp-concat-source");
const sortDeclaration = require("./gulp-ts-sort-declaration");
const rollupRename = require("./rollup-plugin-rename");
const generics = require("./rollup-plugin-generics");
const decorators = require("./rollup-plugin-decorators");

const ts = require('typescript')

const {InputPluginOption} = require('rollup')
const glsl = require('rollup-plugin-glsl')
const typescriptRollup = require('@rollup/plugin-typescript')
const {PartialCompilerOptions} = require('@rollup/plugin-typescript')
const rollupTerser = require("@rollup/plugin-terser")
const {Options} = require("@rollup/plugin-terser")
const {SrcOptions} = require("vinyl-fs")

/*************************** 创建新的打包代码方法 *************************/

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
 * @param files {string[] | File}
 * @param [terserOpt=undefined] {MinifyOptions}
 * @param [initMapsOpt=undefined] {InitOptions} map初始化
 * @param [writeMapsOpt=undefined] {string|WriteOptions} map保存位置
 * @return {NodeJS.ReadWriteStream}
 */
function mJs(files, terserOpt, initMapsOpt, writeMapsOpt) {
    let stream
    if (Array.isArray(files)) {
        stream = gulp.src(files)
    } else stream = gulp.src(files.path) // 重新获取流
    if (terserOpt && !terserOpt.mangle) {
        return stream.pipe(gulpTerser(terserOpt)).pipe(rename({extname: '.min.js', dirname: ""}))
    }
    return stream.pipe(sourcemaps.init(initMapsOpt))
        .pipe(gulpTerser(terserOpt))
        .pipe(rename({extname: '.min.js', dirname: ""}))
        .pipe(sourcemaps.write(writeMapsOpt))
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
 * 合并默认配置与用户提供的配置
 *
 * 该函数用于将用户提供的参数与默认参数进行合并，生成最终的配置对象如果用户未提供某项配置，
 * 则使用默认配置如果用户配置了不支持的选项，并且设置了严格模式（croak为true），则抛出错误
 *
 * @param {Object|boolean} args - 用户提供的配置对象如果为true，则使用空对象作为配置
 * @param {Object} defs - 默认配置对象
 * @param {boolean} [croak=false] - 是否启用严格模式，如果启用，当遇到不支持的选项时抛出错误
 * @param {boolean} [append=false] - 是否在用户配置的基础上追加默认配置项，仅在用户配置和默认配置都存在该选项，且该选项为数组时有效
 * @returns {Object} - 合并后的配置对象
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
 * @return {string[]} 完整路径数据
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

/**
 * 创建并返回一个TypeScript项目实例
 * @param {string} tsConfig - TypeScript配置文件路径，默认为"tsconfig.json"
 * @param {(program?: ts.Program) => ts.CustomTransformers} [customTransformers] - 自定义转换器对象，用于扩展TypeScript编译过程
 * @returns {Object} 返回配置好的TypeScript项目实例
 */
function getProject(tsConfig = "tsconfig.json", customTransformers) {
    return gulpTs.createProject(tsConfig, {
        typescript: ts,
        getCustomTransformers: customTransformers
    });
}

/**
 * 创建一个编译流，用于处理TypeScript文件
 * @param {string|string[]} globs - 文件匹配模式，可以是字符串或字符串数组
 * @param [opt] {SrcOptions} - gulp.src的选项配置对象
 * @param {(program?: ts.Program) => ts.CustomTransformers} [customTransformers] - 自定义转换器对象，用于扩展TypeScript编译过程
 * @return {gulpTs.CompileStream} 返回一个gulp流，用于后续的管道操作
 */
function createCompileStream(globs, opt, customTransformers) {
    if (!Array.isArray(globs)) globs = [globs]
    const tsProject = getProject(undefined, customTransformers)
    // gulp.src 不知道为什么不解析 typeRoots 这里强制添加
    const types = tsProject.options.typeRoots || []
    types.forEach((value, index) => {
        // 检查路径是否已经是文件匹配模式，如果不是则添加 /*.ts
        if (!value.endsWith("@types") && !value.includes('*') && !value.endsWith('.ts')) {
            types[index] = value + '/**/*.ts'
        } else {
            types[index] = value
        }
    })
    globs.push(...types)
    return gulp.src(globs, opt).pipe(function () {
        const project = tsProject()
        sortDeclaration(project)
        return project
    }())
}

/**
 * @typedef GlobsConfig
 * @property {string|string[]} globs - 文件匹配模式，可以是字符串或字符串数组
 * @property {SrcOptions} [opt] - gulp.src的选项配置对象
 */

/**
 * @typedef BuildConfig
 * @property {GlobsConfig} src - 源文件配置
 * @property {string} outName - 输出文件的名称（不包含扩展名）
 * @property {string} dist - 输出目录路径
 */

/**
 * @typedef JSPlugin
 * @property {(file:File)=>void} [onBeforeCodeCompile] - 代码编译前
 * @property {(file:File)=>void} [onAfterCodeCompile] - 代码编译后
 * @property {()=>void} [onBeforeFlush] - 代码处理结束前
 * @property {()=>void} [onAfterFlush] - 代码处理结束后
 */
/**
 * @typedef JSOptions
 * @property {boolean} [isMinify] 默认值: false - 是否压缩代码
 * @property {string} [namespace] 默认值: undefined - 命名空间名称
 * @property {JSPlugin[]} [plugs] 默认值: [] - JS插件数组
 * @property {MinifyOptions} [terserOpt=undefined]
 * @property {InitOptions} [initMapsOpt] 默认值: undefined - map初始化
 * @property {string|WriteOptions} [writeMapsOpt] 默认值: undefined - map保存位置
 */

/**
 * @typedef DTSOptions
 * @property {string[]} [globalDtsFile]
 * @property {string} [namespace] 默认值: undefined - 命名空间名称
 */


/**
 * 构建库文件的主函数
 * @param config {BuildConfig} 构建配置对象
 * @param done {()=>void} - Gulp任务完成回调函数
 * @param [opt] { {js?:JSOptions, dts?:DTSOptions} } 可选配置
 */
function buildLibrary(config, done, opt) {
    const tsResult = createCompileStream(config.src.globs, config.src.opt, () => {
        return {
            before: [
                addMetadata(),
                createNamespaceTransformer()
            ],
            afterDeclarations: [
                createNamespaceTransformer()
            ]
        }
    })
    const jsStream = function (done) {
        buildJs(tsResult, config.outName, config.dist, opt?.js)
            .pipe(run(function () {
                done()
            }))
    }
    const dtsStream = function (done) {
        buildDts(tsResult, config.outName, config.dist, opt?.dts?.globalDtsFile, opt?.dts?.namespace)
            .pipe(run(function () {
                done()
            }))
    }
    gulp.parallel(
        jsStream,
        dtsStream
    )(done)
}


/**
 * 构建JavaScript文件的函数
 * @param {GlobsConfig | gulpTs.CompileStream} tsResult - TypeScript编译流或是其生成需要的包含globs和opt的属性
 * @param {string} outName - 输出文件的名称（不包含扩展名）
 * @param {string} dist - 输出目录路径
 * @param {JSOptions | null} opt - 可选配置
 * @returns {Stream} 返回 gulp 流对象，用于链式操作
 */
function buildJs(tsResult, outName, dist, opt) {
    const isMinify = opt?.isMinify ?? false
    const namespace = opt?.namespace
    const plugs = opt?.plugs ?? []
    const terserOpt = opt?.terserOpt
    if (tsResult.globs) {
        tsResult = createCompileStream(tsResult.globs, tsResult.opt, () => ({
            before: [
                addMetadata(),
                createNamespaceTransformer()
            ]
        }))
    }
    return tsResult
        .js
        .pipe(through2.obj(function (chunk, encoding, callback) {
            for (const plug of plugs) {
                plug.onBeforeCodeCompile?.(chunk)
            }
            callback(null, chunk)
        }, function (done) {
            for (const plug of plugs) {
                plug.onBeforeFlush?.()
            }
            done()
        }))
        .pipe(concatSource(`${outName}.js`))
        .pipe(namespacePlug(namespace))
        .pipe(through2.obj(function (chunk, encoding, callback) {
            for (const plug of plugs) {
                plug.onAfterCodeCompile?.(chunk)
            }
            callback(null, chunk)
        }, function (done) {
            for (const plug of plugs) {
                plug.onAfterFlush?.()
            }
            done()
        }))
        .pipe(gulp.dest(dist))
        .pipe(ifelse(isMinify, [
            sourcemaps.init(opt?.initMapsOpt),
            gulpTerser(terserOpt),
            rename({extname: '.min.js', dirname: ""}),
            sourcemaps.write(".", opt?.writeMapsOpt || {addComment: false}),
            gulp.dest(dist)
        ]))
}

/**
 * 构建 TypeScript 声明文件(.d.ts)
 * @param {GlobsConfig | gulpTs.CompileStream} tsResult - TypeScript编译流或是其生成需要的包含globs和opt的属性
 * @param {string} outName - 输出文件的名称（不包含扩展名）
 * @param {string} dist - 输出目录路径
 * @param {Array} globalFile - 需要追加的全局文件列表，默认为空数组
 * @param {string|null} namespace - 命名空间名称，默认为 null
 * @returns {Stream} 返回 gulp 流对象，用于链式操作
 */
function buildDts(tsResult, outName, dist, globalFile = [], namespace = null) {
    if (tsResult.globs) {
        tsResult = createCompileStream(tsResult.globs, tsResult.opt, () => ({
            afterDeclarations: [
                createNamespaceTransformer()
            ]
        }))
    }
    return tsResult
        .dts
        .pipe(concatSource(`${outName}.d.ts`, {
            appendFile: globalFile
        }))
        .pipe(namespacePlug(namespace))
        .pipe(gulp.dest(dist))
}

/**
 * 创建一个 Rollup 插件对象，用于将处理后的代码输出到指定文件
 * @param {string} outName - 输出文件的名称
 */
const outSource = function (outName) {
    let cacheCode = null
    return {
        name: 'outSourceFile',
        renderChunk(code, chunk, options) {
            cacheCode = code
        },
        generateBundle(options, bundle, isWrite) {
            if (cacheCode) {
                this.emitFile({
                    type: "asset",
                    fileName: outName,
                    source: cacheCode
                })
                cacheCode = null
            }
        }
    };
}

/**
 * @typedef {Object} RollupOptions
 * @property {string} [outDir] - 输出目录路径
 * @property {string|false} [tsconfig="tsconfig.json"] - TypeScript 配置文件路径 当设置为 false 时，忽略配置文件中指定的任何选项。如果设置为与文件路径相对应的字符串，则指定的文件将用作配置文件。
 * @property {PartialCompilerOptions} [compilerOptions] - 将额外的编译器选项传递给插件
 * @property {string|false} [filterRoot="false"] - 设置编译的根目录
 * @property {boolean | 'inline' | 'hidden'} [sourcemap=false] - 是否生成 sourcemap 文件
 * @property {boolean|Options} [minify=false] - 是否压缩代码，若为对象则作为 terser 压缩配置
 * @property {InputPluginOption} [plugins=[]] - rollup 插件
 * @property {ReadonlyArray<string | RegExp> | string | RegExp | null} [include=undefined] - include 包括的文件 默认是 {,**\/*}.(cts|mts|ts|tsx)
 * @property {ReadonlyArray<string | RegExp> | string | RegExp | null} [exclude=undefined] - exclude 排除的文件
 */

/**
 * 使用 Rollup 打包指定的输入文件，并根据配置选项生成输出文件。
 *
 * @param {string} inputFile - 需要打包的入口文件路径
 * @param {string} outName - 输出模块的全局变量名（用于 IIFE 格式）
 * @param {RollupOptions?} options - 打包配置选项
 * @returns {Promise<NodeJS.ReadWriteStream>} 返回一个 Gulp 流，用于后续处理或写入文件
 */
async function rollupPack(inputFile, outName, options) {
    options = defaults(options, {
        tsconfig: "tsconfig.json",
        sourcemap: false,
        filterRoot: false,
        minify: false,
        plugins: []
    })
    const localPath = process.cwd()
    const outDir = path.resolve(localPath, options.outDir || "")
    let file = outName + `${options.minify ? ".min" : ""}.js`
    file = path.relative(localPath, path.join(outDir, file))
    /**
     *
     * @type {PartialCompilerOptions | CompilerOptions}
     */
    const compilerOptions = options.compilerOptions || {}
    compilerOptions.outDir ??= outDir

    const inputCode = await decorators(inputFile)
    let parsedCompilerOptions
    const plugins = [
        {
            name: "virtual-main",
            order: "pre",
            buildStart() {
                const tsConfig = ts.readConfigFile(options.tsconfig, ts.sys.readFile)
                if (tsConfig.error) {
                    console.log(tsConfig.error.messageText);
                }
                const parsed = ts.parseJsonConfigFileContent(tsConfig.config, {
                    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
                    readDirectory: () => [],
                    fileExists: ts.sys.fileExists,
                    readFile: ts.sys.readFile
                }, path.resolve(path.dirname(options.tsconfig)))
                parsedCompilerOptions = parsed.options
                // console.log("buildStart")
            },
            api: {
                compilerOptions: function () {
                    return parsedCompilerOptions
                }
            },
            async load(id) {
                const input = await this.resolve(inputFile)
                if (id === input.id) {
                    const code = ts.transpile(inputCode, parsedCompilerOptions)
                    return code
                }
            }
        },
        generics(options),
        glsl({
            include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: false,
            compress: false
        }),
        typescriptRollup({
            include: options.include,
            exclude: options.exclude,
            filterRoot: options.filterRoot,
            transformers: {
                before: [
                    addMetadata(),
                    createNamespaceTransformer()
                ]
            },
            compilerOptions,
            // cacheDir: "D:/WorkSpace/.rollup.cache",
            tsconfig: options.tsconfig
        }),
        options.minify && outSource(`${outName}.js`),
        options.minify && rollupTerser(defaults(options.minify, {
            timings: true,
            compress: {
                properties: true, //（默认值：true）-使用点表示法重写属性访问，例如foo["bar"] → foo.bar
            },
            format: {
                beautify: false, // 不进行删除空白和换行
                // 保留所有带引号的属性名。  如：object.call("LP_Init")
                // quote_keys: false,
            },
            mangle: {
                // keep_classnames: /Laya.*/,
                // properties: {
                //             keep_quoted: true, // 如果设为 true，被引号的属性名就不会被更改。
                //             reserved: [
                //                 "__decorate", "__metadata", "__param", "__awaiter"
                //             ]
                // },
                //         toplevel: false
            }
        })),
        // options.minify && rollupRename((fileParts, file, fileName) => {
        //     if (file.type === "asset" && file.fileName.endsWith(".js")) return
        //     const names = fileName.split(".")
        //     return {
        //         basename: "",
        //         filename: names[0] + ".min." + names.slice(1).join("."),
        //     }
        // })

        ...options.plugins
    ]

    return new Promise((resolve, reject) => {
        rollupStream({
            input: inputFile,
            treeshake: false,// 删除无调用代码
            external: ["tslib"],// 排除 tslib，不将其打包进最终文件
            output: {
                // compact: true, // 去除多余缩进
                format: 'iife',
                // 给出完整路径
                file: file,
                name: outName,
                extend: true,
                sourcemap: options.sourcemap, // rollup不处理sourcemap映射
                globals: {
                    tslib: "window"  // 告诉 Rollup 将 tslib 视为全局变量
                }
            },
            plugins: plugins
        })
            .pipe(gulp.dest(outDir))
            .on('end', () => {
                resolve()
                if (fs.existsSync(inputFile)) {
                    // fs.unlinkSync(inputFile); // 构建完成后删除临时文件
                }
            })
            .on("error", reject)
    })


}

const _webp = new webp.Webp()

exports = {
    webp: _webp,
    clean,
    defaults,
    createDirectory,
    cleanStream,
    mJs,

    log,

    findFiles,
    findFilesSync,
    addMetadata,
    createNamespaceTransformer,
    buildLibrary,
    buildJs,
    buildDts,

    rollupPack,
    rollupRename
}
module.exports = exports