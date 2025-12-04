const fs = require('fs')
const path = require('path')

const ts = require("typescript");

/**
 * @type ts.CompilerOptions
 */
let compilerOptions;
/**
 * 已经执行添加的模块
 */
const loadFile = new Set()
const mapMoule = new Map()

/**
 * 解析泛型
 * @param options
 * @returns {{id: *, meta: {additionalDeps: T[]}, moduleSideEffects: boolean}|{code: string, map: null}|{name: string, buildStart(): void, resolveId(*, *, *): Promise<{id: *, meta: {additionalDeps: T[]}, moduleSideEffects: boolean}|undefined>, transform(*, *): Promise<{code: string, map: null}|undefined>}}
 */
function parseGenerics(options) {
    let parentApi
    return {
        name: 'inject',
        buildStart({ plugins }) {
            const parentName = 'virtual-main';
            const parentPlugin = plugins.find(
                plugin => plugin.name === parentName
            );
            if (parentPlugin) {
                parentApi = parentPlugin.api;
                compilerOptions = parentApi.compilerOptions()
            } else {
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
                compilerOptions = parsed.options
            }
            // console.log("buildStart")
        },
        async resolveId(source, importer, options) {
            console.log(source)
            let resolved
            if (importer) {
                resolved = await this.resolve(source, importer, options)
            } else {
                resolved = await this.resolve(source)
            }
            source = resolved.id
            // console.log("resolveId", source)
            // 计算这个节点是否有泛型依赖
            const generics = getGenerics.call(this, source)
            if (generics.length > 0) {
                const result = [...generics]
                if (result.length > 0) {
                    result.forEach(value => loadFile.add(value))
                    mapMoule.set(source, result)
                }
            }
        },
        async transform(code, id) {
            if (mapMoule.has(id)) {

                const duplicates = mapMoule.get(id)
                const addImport = []
                for (const duplicate of duplicates) {
                    const file = duplicate.path
                    const elementName = duplicate.elementName

                    let name = path.relative(path.dirname(id), file).replace(/\\/g, "/").replace(".ts", "")
                    if (!name.startsWith(".")) {
                        name = "./" + name
                    }
                    const a = new RegExp("import\\s*\\{[^}]*\\b" + elementName + "\\b[^}]*\\}\\s*from")
                    if (!a.test(code)) {
                        const imports = "import \"" + name + "\";"
                        addImport.push(imports)
                    }
                }
                if (addImport.length > 0) {
                    const index = id.lastIndexOf(path.sep)
                    const name = id.substring(index)

                    console.log("强制添加 被遗弃的对象-> " + name + ": " + addImport.join(" "))
                    code = addImport.join("\n") + "\n" + code
                    return {
                        code,
                        map: null
                    }
                }

            }
        }
    }
}

function getImportPath(moduleName, importPath) {
    // 使用TypeScript官方API解析模块名
    const resolvedModuleName = ts.resolveModuleName(
        moduleName,
        importPath,
        compilerOptions,
        ts.sys
    );
    if (resolvedModuleName.resolvedModule) {
        importPath = resolvedModuleName.resolvedModule.resolvedFileName;
        importPath = path.normalize(importPath)
    }
    return importPath
}

cacheParseGenerics = []

function getGenerics(id) {
    if (cacheParseGenerics.includes(id)) {
        console.warn("重复解析数据", id)
    } else cacheParseGenerics.push(cacheParseGenerics)
    const code = fs.readFileSync(id).toString()
    const sourceFile = ts.createSourceFile(id, code, compilerOptions.target, true)

    //  判断当前节点文件是否存在class 如果存在 那么判断类是否有泛型
    //  比如 class TestA<TestB> 这种 如果存在 那么在ast中添加依赖信息
    //  让rollup知道TestA依赖TestB 即便没有实际引用的代码

    const dependencies = [];
    // 遍历AST查找类声明
    ts.forEachChild(sourceFile, function visit(node) {
        if (ts.isImportDeclaration(node)) {
            // 获取完整的importClause数据
            const importClause = node.importClause;
            // 获取导入模块的相对路径
            /**
             * @type string
             */
            let importPath = node.moduleSpecifier.text

            // 只处理相对路径导入（本地模块）
            if (importPath.includes('/')) {
                // 基于当前文件位置进行解析
                importPath = getImportPath(importPath, id);
                let className = importPath
                const index = importPath.lastIndexOf(path.sep)
                if (index > -1) {
                    className = importPath.substring(index + 1)
                }
                // 忽略以 I 开头的接口类（约定接口类以 I 开头）
                if (importPath.includes('interfaces') ||
                    (className.charAt(0) === 'I' && className.charAt(1) >= 'A' && className.charAt(1) <= 'Z')) {
                    return; // 跳过此循环迭代
                }
                // 处理命名导入 - 多个导入分别处理
                if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
                    importClause.namedBindings.elements.forEach(element => {
                        const elementName = element.name.text;
                        const dependencyInfo = {
                            path: importPath,
                            elementName: elementName,
                            importClause: importClause,
                            moduleSpecifier: node.moduleSpecifier
                        };
                        // 确保不会重复添加相同的依赖项
                        if (!dependencies.some(dep => dep.path === importPath && dep.elementName === elementName)) {
                            dependencies.push(dependencyInfo);
                        }
                    });
                }
            }
        }
        ts.forEachChild(node, visit);
    });

    return dependencies
}

module.exports = parseGenerics