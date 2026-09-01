'use strict'

const ts = require("typescript")
const path = require("path")
const {addMetadata, createNamespaceTransformer} = require("../typescript-parse")
const astDependencies = require("./ast-dependencies")
const {log} = require("./util")

let dtsLogged = false

/**
 * 使用 TypeScript API 编译
 * 一次 emit 同时收集 js 与 dts 输出到内存，并按依赖关系排序
 *
 * @param {string} [tsConfig="tsconfig.json"] tsconfig 路径（相对 cwd）
 * @param {boolean} [withJs=true] 是否产出 js
 * @param {boolean} [withDts=true] 是否产出 dts
 * @return {Promise<{jsFiles: {src: string, code: string}[], dtsFiles: {src: string, code: string}[], program: ts.Program,
 *                    useStrict: boolean}>}
 */
async function compile(tsConfig = "tsconfig.json", withJs = true, withDts = true) {
    const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsConfig)
    if (!configPath) throw new Error(`[ts-compile] 未找到 tsconfig: ${tsConfig}`)
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
    if (configFile.error) {
        console.log(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"))
    }
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.resolve(path.dirname(configPath)))
    if (parsed.errors.length) {
        for (const err of parsed.errors) {
            log.warn("[ts-compile] " + ts.flattenDiagnosticMessageText(err.messageText, "\n"))
        }
    }

    const compilerOptions = {...parsed.options}
    // TS 6 起 strict 系列默认值翻转为开启（strictNullChecks: undefined 等价 true，
    // null 字面量参数推断为 null 而非 any）；tsconfig 未显式配置时钉住 strict:false
    // 保持宽松推断语义
    if (compilerOptions.strict === undefined) {
        compilerOptions.strict = false
    }
    // 严谨模式产物标记：alwaysStrict 未显式配置时随 strict 取值（TS 同规则），
    // 供上层在最终产物顶部补严格模式指令
    const useStrict = compilerOptions.alwaysStrict != null
        ? compilerOptions.alwaysStrict
        : compilerOptions.strict === true
    // 输出到内存：不落盘、不产出 sourcemap 注释
    compilerOptions.sourceMap = false
    compilerOptions.inlineSourceMap = false
    compilerOptions.noEmitOnError = false

    const rootNames = parsed.fileNames
    const program = ts.createProgram({
        rootNames,
        options: compilerOptions
    })

    // 首次编译时输出使用到的 .d.ts 声明文件列表
    if (!dtsLogged && !process.env.__TS_DTS_LOGGED__) {
        dtsLogged = true
        process.env.__TS_DTS_LOGGED__ = "1"
        const declarationFiles = program.getSourceFiles()
            .filter(sf => sf.isDeclarationFile)
            .map(sf => path.resolve(sf.fileName).replace(/\\/g, "/"))

        const cwd = process.cwd().replace(/\\/g, "/")
        const projectDts = []
        const builtinDts = []
        for (const file of declarationFiles) {
            if (file.includes("/node_modules/typescript/lib/lib.") || file.includes("/node_modules/.pnpm/typescript")) {
                builtinDts.push(file)
            } else {
                let displayPath = path.relative(cwd, file).replace(/\\/g, "/")
                if (!displayPath.startsWith(".") && !displayPath.startsWith("/")) {
                    displayPath = "./" + displayPath
                }
                projectDts.push(displayPath)
            }
        }

        log.info(`引用声明文件 (.d.ts) 清单 [项目与库依赖: ${projectDts.length} 个, TS 内置库: ${builtinDts.length} 个]:`)
        for (const file of projectDts) {
            console.log(`    - ${file}`)
        }
    }

    // 收集输出：输出绝对路径 -> 内容
    const outputs = new Map()
    const writer = (fileName, text) => {
        outputs.set(path.resolve(fileName).replace(/\\/g, "/"), text)
    }
    const transformers = {
        before: [
            addMetadata(),
            createNamespaceTransformer()
        ],
        afterDeclarations: [
            createNamespaceTransformer()
        ]
    }
    const emitResult = program.emit(undefined, writer, undefined, false, transformers)
    for (const diag of emitResult.diagnostics) {
        const msg = ts.flattenDiagnosticMessageText(diag.messageText, "\n")
        log.warn(`[ts-compile] ${msg}`)
    }

    // 参与输出的源文件（非声明输入）
    const rootSet = new Set(rootNames.map(f => path.resolve(f).replace(/\\/g, "/")))
    const sourceFiles = program.getSourceFiles().filter(sf => {
        return !sf.isDeclarationFile && rootSet.has(sf.fileName.replace(/\\/g, "/"))
    })

    // rootDir 推导（TS 同规则：所有输入文件的公共前缀，此处以参与输出的源文件为准）
    const rootDir = compilerOptions.rootDir
        ? path.resolve(compilerOptions.rootDir).replace(/\\/g, "/")
        : commonRoot(sourceFiles.map(sf => sf.fileName.replace(/\\/g, "/")))

    // 依赖排序字典：{ key(小写绝对路径): {ts, fileNameOriginal} }
    const dict = {}
    for (const sf of sourceFiles) {
        const normalized = sf.fileName.replace(/\\/g, "/")
        dict[normalized.toLowerCase()] = {ts: sf, fileNameOriginal: normalized}
    }
    const sorted = astDependencies(dict)

    // 按排序结果换算输出并收集
    const jsFiles = []
    const dtsFiles = []
    for (const key of Object.keys(sorted)) {
        const info = sorted[key]
        const src = info.fileNameOriginal
        const suffix = path.relative(rootDir, src).replace(/\\/g, "/").replace(/\.tsx?$/, "")
        if (withJs) {
            const code = findOutput(outputs, suffix + ".js", src)
            if (code != null) jsFiles.push({src, code})
        }
        if (withDts) {
            const code = findOutput(outputs, suffix + ".d.ts", src)
            if (code != null) dtsFiles.push({src, code})
        }
    }
    return {jsFiles, dtsFiles, program, useStrict}
}

/**
 * 在输出集合中按期望后缀查找内容（跨盘符大小写兜底）
 * @param outputs {Map<string, string>}
 * @param expectedSuffix {string} 形如 com/App.js
 * @param src {string} 源文件绝对路径（兜底 basename 匹配）
 * @return {string | null}
 */
function findOutput(outputs, expectedSuffix, src) {
    const lower = expectedSuffix.toLowerCase()
    for (const [outPath, code] of outputs) {
        if (outPath.toLowerCase().endsWith("/" + lower) || outPath.toLowerCase() === lower) {
            return code
        }
    }
    // 兜底：同名不同目录（rootDir 推导偏差时）
    const base = path.basename(expectedSuffix).toLowerCase()
    for (const [outPath, code] of outputs) {
        if (path.basename(outPath).toLowerCase() === base) {
            return code
        }
    }
    log.warn(`[ts-compile] 未找到源文件输出: ${src} (${expectedSuffix})`)
    return null
}

/**
 * 计算路径列表的公共根目录
 * @param paths {string[]}
 * @return {string}
 */
function commonRoot(paths) {
    if (!paths.length) return process.cwd().replace(/\\/g, "/")
    const split = paths.map(p => p.split("/"))
    let root = split[0]
    for (const parts of split.slice(1)) {
        let i = 0
        while (i < root.length && i < parts.length && root[i] === parts[i]) i++
        root = root.slice(0, i)
    }
    return root.join("/")
}

module.exports = {compile}
