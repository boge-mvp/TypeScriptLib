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

function parseGenerics(options) {

    return {
        name: 'inject',
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
            compilerOptions = parsed.options
            console.log("buildStart")
        },
        async resolveId(source, importer, options) {
            if (importer) {
                const resolved = await this.resolve(source, importer, options)
                if (!resolved) {
                    source
                }
                source = resolved.id
            }
            // console.log("resolveId", source)
            // 计算这个节点是否有泛型依赖
            const generics = getGenerics.call(this, source)
            if (generics.length > 0) {
                const my = this
                const result = []
                await Promise.all(
                    generics.map(async value => {
                        const info = this.getModuleInfo(value)
                        result.push(value)
                    })
                )
                if (result.length > 0) {
                    result.forEach(value => loadFile.add(value))
                    mapMoule.set(source, result)
                    const duplicates = result.filter(value => !loadFile.has(value))
                    if (duplicates.length > 0) {
                        return {
                            id: source,
                            meta: {
                                additionalDeps: duplicates
                            },
                            moduleSideEffects: true
                        }
                    }
                }
            }
        },
        async transform(code, id) {
            if (mapMoule.has(id)) {
                /**
                 * @type string[]
                 */
                const duplicates = mapMoule.get(id)
                const addImport = []
                for (const duplicate of duplicates) {
                    let name = path.relative(path.dirname(id), duplicate).replace(/\\/g, "/").replace(".ts", "")
                    if (!name.startsWith(".")) {
                        name = "./" + name
                    }
                    const className = name.substring(name.lastIndexOf("/") + 1)
                    const a = new RegExp("import\\s*\\{\\s*" + className + "\\s*}\\s*from")
                    if (!a.test(code)) {
                        const imports = "import { " + className + " } from \"" + name + "\";"
                        addImport.push(imports)
                    }
                }
                if (addImport.length > 0) {
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

function getGenerics(id) {
    const code = fs.readFileSync(id).toString()
    const sourceFile = ts.createSourceFile(id, code, compilerOptions.target, true)

    //  判断当前节点文件是否存在class 如果存在 那么判断类是否有泛型
    //  比如 class TestA<TestB> 这种 如果存在 那么在ast中添加依赖信息
    //  让rollup知道TestA依赖TestB 即便没有实际引用的代码

    let hasClass = false;
    let classGenericParams = [];
    // 遍历AST查找类声明
    ts.forEachChild(sourceFile, function visit(node) {
        if (ts.isClassDeclaration(node)) {
            hasClass = true;
            // 检查类是否有泛型参数
            if (node.typeParameters && node.typeParameters.length > 0) {
                // 收集泛型参数名称
                node.typeParameters.forEach(param => {
                    if (param.name && param.name.text) {
                        classGenericParams.push(param.name.text);
                    }
                });
            }
            // 检查是否有继承且父类使用了泛型
            if (node.heritageClauses) {
                node.heritageClauses.forEach(clause => {
                    clause.types.forEach(type => {
                        if (type.typeArguments) {
                            type.typeArguments.forEach(arg => {
                                if (ts.isTypeReferenceNode(arg) && ts.isIdentifier(arg.typeName)) {
                                    classGenericParams.push(arg.typeName.text);
                                }
                            });
                        }
                    });
                });
            }
        }
        ts.forEachChild(node, visit);
    });
    const dependencies = [];
    // 如果找到了带有泛型的类，将泛型参数作为依赖添加到模块信息中
    if (hasClass && classGenericParams.length > 0) {
        // 添加依赖信息到模块中
        classGenericParams.forEach(param => {
            // 查找泛型参数对应的导入声明
            const importDeclaration = sourceFile.statements.find(statement =>
                ts.isImportDeclaration(statement) &&
                statement.importClause &&
                statement.importClause.namedBindings &&
                ts.isNamedImports(statement.importClause.namedBindings) &&
                statement.importClause.namedBindings.elements.some(element =>
                    element.name.text === param)
            );

            if (importDeclaration) {
                // 如果找到导入声明，添加到依赖中
                // 根据tsconfig配置解析路径
                let importPath = importDeclaration.moduleSpecifier.text;
                if (!path.isAbsolute(importPath)) {
                    importPath = getImportPath(importPath, id)
                }
                if (this.getModuleInfo(importPath)) {
                    return;
                }
                if (!dependencies.includes(importPath)) {
                    dependencies.push(importPath);
                }
            }
        });
    }
    return dependencies
}

module.exports = parseGenerics