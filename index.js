const fs = require('fs')
const path = require('path')

const streamNode = require("node:stream")
const gulp = require("gulp")
const terser = require("gulp-terser")
const inject = require("gulp-inject-string")
const concat = require('gulp-concat')
const del = require("del")
const each = require("gulp-each")
const sort = require('gulp-sort')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const gulpTs = require("gulp-typescript")
const through2 = require("through2").obj
const webp = require("./webp/ToWebp")
const {Settings} = require("gulp-typescript")
const {MinifyOptions} = require("terser")
const merge = require('merge2')
const concatSource = require("./ConcatSource");

const ts = require('typescript')

const rollup = require('rollup')
const File = require('vinyl')
const source = require('vinyl-source-stream')
const {globSync} = require('glob');
const glsl = require('rollup-plugin-glsl')
const typescriptRollup = require('@rollup/plugin-typescript')
const rollupTerser = require("@rollup/plugin-terser")
const {dts} = require("rollup-plugin-dts")
const {SrcOptions} = require("vinyl-fs")
/***************************** 公共逻辑方法 *****************************/

function createNamespaceTransformer() {
    return (context) => {
        return (sourceFile) => {
            // 存储 import = 声明的映射关系
            const namespaceMap = new Map();

            // 第一次遍历：收集命名空间映射
            function visitFirstPass(node) {
                // 处理 import xxx = yyy.zzz 声明
                if (ts.isImportEqualsDeclaration(node) && ts.isQualifiedName(node.moduleReference)) {
                    const namespaceName = node.name.text;
                    const fullName = node.moduleReference.getText(sourceFile);
                    namespaceMap.set(namespaceName, fullName);
                    // 移除这个 import 声明
                    return undefined;
                }
                return ts.visitEachChild(node, visitFirstPass, context);
            }

            // 应用第一次遍历
            sourceFile = ts.visitNode(sourceFile, visitFirstPass);

            // 第二次遍历：替换使用简写名称的地方
            function visitSecondPass(node) {
                // 替换标识符为完整的命名空间路径
                if (ts.isIdentifier(node) && namespaceMap.has(node.text)) {
                    const parent = node.parent;

                    // 检查是否是独立的标识符使用（不是属性访问的一部分）
                    if (
                        // 变量声明类型: let a: Pool
                        ts.isVariableDeclaration(parent) && parent.type === node ||
                        // 函数参数类型: function test(a: Pool)
                        ts.isParameter(parent) && parent.type === node ||
                        // 返回值类型: function test(): Pool
                        ts.isFunctionDeclaration(parent) && parent.type === node ||
                        ts.isMethodDeclaration(parent) && parent.type === node ||
                        // 新建实例: new Pool()
                        ts.isNewExpression(parent) && parent.expression === node ||
                        // 静态方法调用: Pool.method()
                        ts.isPropertyAccessExpression(parent) && parent.expression === node
                    ) {
                        const fullName = namespaceMap.get(node.text);
                        return createQualifiedNameExpression(fullName);
                    }
                }

                // 处理类型引用节点
                if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && namespaceMap.has(node.typeName.text)) {
                    const fullName = namespaceMap.get(node.typeName.text);
                    return ts.factory.createTypeReferenceNode(
                        createQualifiedNameExpression(fullName),
                        node.typeArguments
                    );
                }

                return ts.visitEachChild(node, visitSecondPass, context);
            }

            return ts.visitNode(sourceFile, visitSecondPass);
        };

        // 辅助函数：根据完整名称创建限定名表达式
        function createQualifiedNameExpression(fullName) {
            const parts = fullName.split('.');
            let result = ts.factory.createIdentifier(parts[0]);
            for (let i = 1; i < parts.length; i++) {
                result = ts.factory.createPropertyAccessExpression(
                    result,
                    ts.factory.createIdentifier(parts[i])
                );
            }
            return result;
        }
    };
}

/**
 * @returns {ts.TransformerFactory<ts.SourceFile>}
 */
function addMetadata() {
    const decoratorName = ["Component", "FguiBindView", "AppMain"]
    return (context) => {
        /**
         * @param {ts.Node} node
         */
        const visitor = (node) => {
            // 只处理类声明
            if (ts.isClassDeclaration(node)) {
                const name = node.name.text
                const decorators = ts.getDecorators(node)
                // 查看装饰器中是否有 @Component
                const hasTargetDecorator = decorators?.some(modifier => {
                    // 获取装饰器表达式
                    const decorator = getExpression(modifier.expression)
                    return decoratorName.includes(decorator.text)
                });
                if (hasTargetDecorator && node.name) {
                    const className = node.name.text;
                    // 创建 Reflect.metadata 装饰器表达式
                    const metadataDecorator = ts.factory.createDecorator(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('Reflect'),
                                'metadata'
                            ),
                            undefined,
                            [
                                ts.factory.createStringLiteral('class:name'),
                                ts.factory.createStringLiteral(className)
                            ]
                        )
                    );
                    // 重新排列，把 Component 放到最后
                    let newModifiers = (node.modifiers || []).toSorted((a, b) => {
                        if (a.kind === b.kind && a.kind === ts.SyntaxKind.Decorator) {
                            const aName = getExpression(a.expression)
                            const bName = getExpression(b.expression)
                            if (aName.text === "Component") {
                                return 1
                            } else if (bName.text === "Component") {
                                return -1
                            }
                        }
                        return 0
                    })
                    // 添加到 modifiers 列表中
                    newModifiers = ts.canHaveDecorators(node) ? [...newModifiers, metadataDecorator] : [metadataDecorator];
                    // 返回修改后的类节点
                    return ts.factory.updateClassDeclaration(
                        node,
                        newModifiers,
                        node.name,
                        node.typeParameters,
                        node.heritageClauses || [],
                        node.members
                    )
                }

            }
            return ts.visitEachChild(node, visitor, context)
        }

        return (sourceFile) => {
            return ts.visitNode(sourceFile, visitor)
        }
    }
}

/**
 * 条件执行gulp流中的插件
 * @param condition {boolean|function} 条件，如果为true则执行插件流
 * @param plugins {Array} gulp插件数组
 * @return {NodeJS.ReadWriteStream}
 */
function ifelse(condition, plugins) {
    return through2(function (chunk, encoding, callback) {
        // 判断condition类型并计算实际的布尔值
        let result = false;
        if (typeof condition === "boolean") {
            result = condition;
        } else if (typeof condition === "function") {
            // 当condition是函数时，传递chunk和encoding参数进行判断
            result = condition.apply(this, [chunk, encoding]);
        } else {
            callback(new Error("condition must be a boolean or function"));
            return;
        }

        // 如果条件为真且提供了插件数组，则执行这些插件
        if (result && Array.isArray(plugins) && plugins.length > 0) {
            // 创建一个流来顺序执行所有插件
            let stream = through2();
            // 将当前chunk传递到插件流中
            stream.write(chunk);
            // 监听最终结果并回调
            stream.on('data', (resultChunk) => {
                callback(null, resultChunk);
            });
            stream.on('error', (err) => {
                callback(err);
            });
            // 依次通过所有插件
            for (let plugin of plugins) {
                if (typeof plugin === 'function') {
                    stream = stream.pipe(plugin());
                } else {
                    stream = stream.pipe(plugin);
                }
            }
        } else {
            // 条件为假或没有插件，直接传递数据
            callback(null, chunk);
        }
    });
}


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
 *
 * @type
 *
 * 配合gulp pipe 流执行，必须有返回非 undefined 的值 否则阻塞
 * @param func {function(chunk: Buffer | File, encoding: string, callback: function(Error|null, chunk: Buffer)): boolean}
 *        返回值不是 undefined 将会立即结束流，否则等待调用 callback
 * @param [end=null] {function(): void} 结束流的方法，需要回调否则会阻塞
 * @param args {any} 附带的参数 会放在开头
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

/**
 *
 * @param tsConfig
 * @return {gulpTs.Project}
 */
function getProject(tsConfig = "tsconfig.json") {
    return gulpTs.createProject(tsConfig, {
        typescript: ts,
        getCustomTransformers: program => ({
            before: [
                addMetadata(),
                createNamespaceTransformer()
            ],
            afterDeclarations: [
                createNamespaceTransformer()
            ]
        })
    });
}

/**
 *
 * @param globs {string | string[]}
 * @param [opt] {SrcOptions}
 * @return {gulpTs.CompileStream}
 */
function createCompileStream(globs, opt) {
    const tsProject = getProject()
    return gulp.src(globs, opt).pipe(tsProject())
}

/**
 *
 * @param v {{src:{ globs: (string | string[]), opt?: SrcOptions}, outName:string, dist:string, namespace?:string, js:{ isMinify?:boolean}, dts:{ globalDtsFile?:string[]}}}
 * @param done
 */
function buildLibrary(v, done) {
    const tsResult = createCompileStream(v.src.globs, v.src.opt)
    const jsStream = buildJs(tsResult, v.outName, v.dist, v.js.isMinify, v.namespace)
    const dtsStream = buildDts(tsResult, v.outName, v.dist, v.dts.globalDtsFile, v.namespace)
    merge(
        jsStream,
        dtsStream
    ).on("finish", done);
}

/**
 *
 * @param tsResult {gulpTs.CompileStream} createCompileStream
 * @param outName {string} 输出文件名字 不带文件后缀
 * @param dist {string} 输出目录
 * @param [isMinify=false] {boolean}
 * @param [namespace=null] {string|null}
 *
 * 获取tsResult可看 {@link createCompileStream}
 */
function buildJs(tsResult, outName, dist, isMinify = false, namespace = null) {
    return tsResult
        .js
        .pipe(concatSource(`${outName}.js`, {namespace: namespace}))
        .pipe(gulp.dest(dist))
        .pipe(ifelse(isMinify, [
            sourcemaps.init(),
            terser(),
            rename({extname: '.min.js', dirname: ""}),
            sourcemaps.write(".", {addComment: false}),
            gulp.dest(dist)
        ]))
}

/**
 *
 * @param tsResult {gulpTs.CompileStream} createCompileStream
 * @param outName {string} 输出文件名字 不带文件后缀
 * @param dist {string} 输出目录
 * @param [globalFile=[]] {string[]}
 * @param [namespace=null] {string|null}
 *
 * 获取tsResult可看 {@link createCompileStream}
 */
function buildDts(tsResult, outName, dist, globalFile = [], namespace = null) {
    return tsResult
        .dts
        .pipe(concatSource(`${outName}.d.ts`, {
            namespace: namespace,
            appendFile: globalFile
        }))
        .pipe(gulp.dest(dist))

}










/**
 * 输出文件
 * @param outPath
 */
const outSource = function (outPath) {
    return {
        name: 'outSourceFile',
        renderChunk(code, chunk, outputOptions) {
            fs.writeFileSync(outPath, code, "utf8")
            return {
                code: code,
                map: null // 可选项，如果需要源映射，则可以提供映射文件
            }
        }
    };
}


/**
 * @param input {string}
 * @param outName {string}
 * @param outDir
 * @return {string}
 */
function createIndexTs(input, outName, outDir = "./") {
    const files = globSync(input, {
        nodir: true,
        ignore: [
            "**/*.d.ts",
            "**/*.fs", "**/*.vs"],
        posix: true
    })
    let entryContent = files
        .map(file => {
            const modulePath = "../src/" + path.posix.relative('src', file.slice(0, -path.extname(file).length))
            const className = modulePath.substring(modulePath.lastIndexOf("/") + 1)
            return `export * from '${modulePath}';`
        })
        .join('\n');
    const dir = outDir
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    const entryFilePath = path.join(dir, "index.ts")
    fs.writeFileSync(entryFilePath, entryContent);
    return entryFilePath
}

/**
 *
 * @param {LeftHandSideExpression} exp
 * @return IdentifierObject
 */
function getExpression(exp) {
    if (ts.isCallExpression(exp) &&
        ts.isIdentifier(exp.expression)) {
        return getExpression(exp.expression)
    }
    return exp
}

// 修改 dtsFix 函数
function dtsFix(name) {
    return (context) => {
        const visitor = (node) => {
            // 收集全局声明用于 .d.ts 文件
            if (ts.isSourceFile(node) && (node.fileName.includes('/global/') || node.fileName.includes('\\global\\'))) {
                const globalDeclarations = [];

                // 收集全局函数和变量声明
                for (const statement of node.locals) {
                    if (ts.isFunctionDeclaration(statement) && statement.name) {
                        globalDeclarations.push({
                            type: 'function',
                            name: statement.name.text,
                            parameters: statement.parameters,
                            returnType: statement.type
                        });
                    } else if (ts.isVariableStatement(statement)) {
                        for (const declaration of statement.declarationList.declarations) {
                            if (ts.isIdentifier(declaration.name)) {
                                globalDeclarations.push({
                                    name: declaration.name.text,
                                    type: declaration.type
                                });
                            }
                        }
                    }
                }

                // 添加 declare global 块到 .d.ts
                if (globalDeclarations.length > 0) {
                    const globalMembers = globalDeclarations.map(decl => {
                        if (decl.type === 'function') {
                            return ts.factory.createFunctionDeclaration(
                                [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
                                undefined,
                                decl.name,
                                undefined,
                                decl.parameters || [],
                                decl.returnType || ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                                undefined
                            );
                        } else if (decl.type === 'variable') {
                            return ts.factory.createVariableStatement(
                                [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
                                ts.factory.createVariableDeclarationList([
                                    ts.factory.createVariableDeclaration(
                                        decl.name,
                                        undefined,
                                        decl.type || ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                    )
                                ])
                            );
                        }
                    });

                    const globalBlock = ts.factory.createModuleDeclaration(
                        [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
                        ts.factory.createIdentifier("global"),
                        ts.factory.createModuleBlock(globalMembers),
                        ts.NodeFlags.GlobalAugmentation
                    );

                    // 添加 export {} 确保文件被视为模块
                    const exportStatement = ts.factory.createExportDeclaration(
                        undefined,
                        false,
                        ts.factory.createNamedExports([])
                    );

                    return ts.factory.updateSourceFile(
                        node,
                        [
                            ...node.statements,
                            globalBlock,
                            exportStatement
                        ]
                    );
                }
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return (sourceFile) => {
            return ts.visitNode(sourceFile, visitor);
        };
    };
}

/**
 *
 * @param options {rollup.RollupOptions[]}
 * @return {module:stream.internal.Readable}
 */
function rollupStream(...options) {
    const build = async (options, stream) => {
        const bundle = await rollup.rollup(options);
        stream.emit('bundle', bundle);
        let outputOpt = options.output
        if (!Array.isArray(outputOpt)) {
            outputOpt = [outputOpt]
        }
        // 遍历每个 output 配置
        for (const outputOptions of outputOpt) {
            const {output} = await bundle.generate(outputOptions);
            for (const chunk of output) {
                let fileName = chunk.fileName;
                let outFile = outputOptions.file
                let dir = outputOptions.dir
                let base
                if (outFile) {
                    base = path.dirname(outFile) + "/"
                } else if (dir) {
                    base = dir
                }
                // 处理 chunk 类型（JS）
                if (chunk.type === 'chunk') {
                    fileName = chunk.preliminaryFileName
                    let content = chunk.code
                    let opt = {
                        contents: Buffer.from(content),
                        path: fileName
                    }
                    if (base) {
                        opt.base = base
                        opt.path = path.join(base, fileName)
                    }
                    const file = new File(opt);
                    result.push(file);

                    // 如果有 source map
                    if (chunk.map) {
                        fileName = chunk.sourcemapFileName
                        opt = {
                            contents: Buffer.from(`\n//# sourceMappingURL=${chunk.map.toUrl()}`),
                            path: fileName
                        }
                        if (base) {
                            opt.base = base
                            opt.path = path.join(base, fileName)
                        }
                        const mapFile = new File(opt);
                        result.push(mapFile);
                    }

                } else if (chunk.type === 'asset') {
                    const t = chunk
                    // const file = new File({
                    //     base: base,
                    //     path: base + fileName,
                    //     contents: Buffer.from(chunk.source),
                    // });
                    // result.push(file);
                }
            }
        }

    };

    const create = async (options, stream) => {
        for (const option of options) {
            await build(option, result)
        }
        stream.push(null); // 结束流
    }
    const result = new streamNode.Readable({
        objectMode: true, // 默认只能是 string Buffer
        read: () => {
        }
    });
    create(options, result).catch((error) => {
        result.emit('error', error);
    });
    return result;
}

function rollupPluginAddNameSpace(outName) {
    const globals = []
    const contents = []
    return {
        name: "add-namespace",
        renderChunk(inputCode, chunk, options) {
            const modules = chunk.modules
            for (const chunkKey in modules) {
                const module = modules[chunkKey]
                const paths = chunkKey.split("/")
                let code = module.code
                if (code) {
                    if (paths.includes("global")) {
                        globals.push(code)
                    } else {
                        code = code.replace(/declare\s/g, "export ")
                        // code = code.replace(/export\s*{(?:\s*\w+\s*,)*\s*.*\s*(?:,\s*\w+\s*)*}\s*;?/g, "")
                        contents.push(code)
                    }
                }
            }
            const code = `declare namespace ${outName} {\n\n${contents.map(value => {
                // value = value.replace("declare", "export")
                const ns = value.split("\n")
                return "\t" + ns.join("\n\t")
            }).join("\n\n")}\n\n}\n${globals.join("\n")}`
            // console.log(code)
            return code
        }
    }
}

function rollupPluginGlobal() {
    return {
        name: "global",
        /**
         * @param code {string}
         * @param id {string}
         */
        transform(code, id) {
            if (id.includes("/global/")) {
                const module = this.getModuleInfo(id)
                return code
            }
        }
    }
}

function rollupPluginAppedDts(...extendedLibrary) {
    const outPath = "bin/types"
    return {
        name: 'append-define-dts',
        /**
         * @param code {string}
         * @param id {string}
         */
        transform(code, id) {
            console.log("id->" + id)
            // if (!id.includes("index.ts")) {
            //     const declarationId = id.replace(/((\.d)?\.([cm])?([tj])sx?|\.json)$/, ".d.ts")
            //     const name = path.basename(declarationId)
            //     if (!fs.existsSync(outPath)) {
            //         fs.mkdirSync(outPath)
            //     }
            //     const file = path.join(outPath, name)
            //     // console.log(declarationId + "->" + file)
            //     fs.writeFileSync(file, Buffer.from(code))
            // }
            // return code
        },
        generateBundle(options, bundle) {
            if (extendedLibrary.length) {
                const fileName = path.basename(options.file)
                const dtsFile = bundle[fileName];
                if (dtsFile && dtsFile.type === 'chunk') {
                    extendedLibrary.forEach(value => {
                        const defineDts = fs.readFileSync(value, 'utf-8');
                        dtsFile.code += `\n\n// From ${path.basename(value)}\n${defineDts}`;
                    })
                }
            }
        }
    }
}


/**
 *
 *
 * @param pattern {string | string[]} Synchronous form of {@link glob}
 * @param outName {string} 输出文件名字
 * @param outDir {string} 输出目录
 * @param [options=null] {{tsconfig?: string}} 可选配置
 */
function rollupPack(pattern, outName, outDir, options) {
    const localPath = process.cwd()
    outDir = path.resolve(localPath, outDir)
    const inputFile = createIndexTs(pattern, outName, outDir)
    const extendedLibrary = [
        // path.resolve(localPath, "src/define.d.ts"),
        // path.resolve(localPath, "src/entity.d.ts")
    ]
    // const inputFile = "D:\\WorkSpace\\LayaBox\\TypeScriptLib\\TSCore\\bin\\index.ts"
    options = defaults(options, {
        tsconfig: "tsconfig.json"
    })
    return rollupStream(
        {
            input: inputFile,
            treeshake: false,// 删除无调用代码
            external: ["tslib"],// 排除 tslib，不将其打包进最终文件
            output: {
                // compact: true, // 去除多余缩进
                format: 'iife',
                dir: outDir,
                name: outName,
                extend: true,
                sourcemap: "hidden", // rollup不处理sourcemap映射
                globals: {
                    tslib: "window"  // 告诉 Rollup 将 tslib 视为全局变量
                }
            },
            plugins: [
                glsl({
                    include: /.*(.glsl|.vs|.fs)$/,
                    sourceMap: false,
                    compress: false
                }),
                typescriptRollup({
                    transformers: {
                        before: [
                            addMetadata()
                        ]
                    },
                    // cacheDir: "D:/WorkSpace/.rollup.cache",
                    tsconfig: options.tsconfig
                }),
                outSource(path.join(outDir, `${outName}.js`)),
                rollupTerser({
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
                }),
                // {
                //     name: 'write-ts-debug',
                //     renderStart(outputOptions, inputOptions) {
                //         // 创建调试目录
                //         const debugDir = path.join(outDir, 'debug');
                //         if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, {recursive: true});
                //     },
                //     generateBundle(options, bundle, isWrite) {
                //         for (const key in bundle) {
                //             const chunk = bundle[key];
                //             if (chunk.type === 'chunk') {
                //                 //
                //                 //         const debugPath = path.join(outDir, 'debug', chunk.fileName.replace('.js', '.ts'));
                //                 //         fs.writeFileSync(debugPath, chunk.code, 'utf8');
                //                 //         console.log(`已写入调试 TS 文件: ${debugPath}`);
                //             }
                //         }
                //     }
                // },
            ]
        },
        {
            input: inputFile,
            treeshake: false,// 删除无调用代码
            external: ["tslib"],// 排除 tslib，不将其打包进最终文件
            output: {
                file: `${outDir}/${outName}.d.ts`,
                format: 'es',
                name: outName,
                extend: true,
                sourcemap: false,
            },
            plugins: [
                // rollupPluginGlobal(),
                rollupPluginAddNameSpace(outName),
                dts({
                    // transformers: dtsFix(outName)
                }),
                rollupPluginAppedDts(...extendedLibrary)
            ]
        }
    ).on('end', () => {
        if (fs.existsSync(inputFile)) {
            // fs.unlinkSync(inputFile); // 构建完成后删除临时文件
        }
    }).pipe(gulp.dest(outDir))

}

const _webp = new webp.Webp()

exports = {
    webp: _webp,
    print,
    clean,
    defaults,
    createDirectory,
    cleanStream,
    runStream,
    run,
    mJs,

    findFiles,
    findFilesSync,
    addMetadata,
    createNamespaceTransformer,
    buildLibrary,
    ifelse,


    rollupStream
}
module.exports = exports