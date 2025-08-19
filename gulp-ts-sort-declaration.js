const gulpTs = require("gulp-typescript")
const log = require("gulplog")
const chalk = require("chalk")
const {ProjectInfo} = require("gulp-typescript/release/project")
const utils = require("gulp-typescript/release/utils")
const {File, FileDictionary} = require("gulp-typescript/release/input")
const path = require("path");
const ts = require("typescript");

/**
 * @type ProjectInfo
 */
let projectInfo

/**
 * @type utils.Map.<File>
 */
let files

/**
 * @type FileDictionary
 */
let fileDictionary

/** @type {ts.SourceFile} */
let testSource

/**
 * 根据单个ts 源文件 保存  import A from '../aaa'   map[A] = fullPath
 * @type {Map<ts.SourceFile, Map<string, string>>}
 */
let importMap = new Map()

/**
 *
 * @param {gulpTs.CompileStream} project
 */
function create(project) {
    projectInfo = project.project

    fileDictionary = projectInfo.input.current
    files = fileDictionary.files

    fileDictionary.getFileNames = projectFileNames


}

// 一般情况会进入两次 只有第二次才有依赖关系
function projectFileNames(onlyGulp) {
    const fileNames = [];
    let fileArray = files
    if (testSource && testSource.imports) {
        // 分析依赖关系并对files进行排序
        fileArray = sortFilesByDependencies(files);
    }
    for (const fileName in fileArray) {
        if (!files.hasOwnProperty(fileName))
            continue;
        let file = files[fileName];
        if (!testSource) testSource = file.ts
        if (onlyGulp && !file.gulp)
            continue;
        fileNames.push(file.fileNameOriginal);
    }
    return fileNames;
}


/**
 * 基于依赖关系对文件进行排序，优先处理继承关系
 * @param  {utils.Map<File>} files - 所有文件信息映射
 * @returns {string[]} 按依赖顺序排序的文件名列表
 */
function sortFilesByDependencies(files) {
    // 为每个文件计算依赖
    const fileDependencies = {};
    const inheritanceRelations = {}; // 存储继承关系

    for (const fileName in files) {
        if (!files.hasOwnProperty(fileName)) continue;

        const file = files[fileName];
        if (file.ts && file.ts.imports) {
            fileDependencies[fileName] = analyzeDependencies(file.ts, files);
        } else {
            fileDependencies[fileName] = [];
        }

        // 分析继承关系
        inheritanceRelations[fileName] = analyzeInheritance(file.ts, files);
    }

    // 使用Tarjan算法查找强连通分量（SCC）- 循环依赖组
    const index = new Map();
    const lowLink = new Map();
    const onStack = new Set();
    const stack = [];
    let currentIndex = 0;
    const sccs = []; // 强连通分量数组

    function strongConnect(node) {
        index.set(node, currentIndex);
        lowLink.set(node, currentIndex);
        currentIndex++;
        stack.push(node);
        onStack.add(node);

        // 遍历当前节点的所有依赖
        const dependencies = fileDependencies[node] || [];
        dependencies.forEach(dependency => {
            if (!index.has(dependency)) {
                // 未访问过的节点
                strongConnect(dependency);
                lowLink.set(node, Math.min(lowLink.get(node), lowLink.get(dependency)));
            } else if (onStack.has(dependency)) {
                // 在当前栈中，发现后向边，说明存在循环依赖
                lowLink.set(node, Math.min(lowLink.get(node), index.get(dependency)));
            }
        });

        // 如果是强连通分量的根节点
        if (lowLink.get(node) === index.get(node)) {
            const scc = [];
            let w;
            do {
                w = stack.pop();
                onStack.delete(w);
                scc.push(w);
            } while (w !== node);
            sccs.push(scc);
        }
    }

    // 对所有未访问的节点执行strongConnect
    for (const fileName in files) {
        if (!files.hasOwnProperty(fileName)) continue;
        if (!index.has(fileName)) {
            strongConnect(fileName);
        }
    }

    // 在SCC内部根据继承关系排序
    function sortSCCByInheritance(scc) {
        if (scc.length <= 1) return scc;

        // 如果 SCC 中有多个文件，说明存在循环依赖，输出警告和文件名顺序
        if (scc.length > 1) {
            // 获取项目根路径
            const projectRoot = process.cwd();
            // 构建循环依赖链条信息
            const cycleInfo = scc.map(file => {
                const deps = fileDependencies[file] || [];
                const circularDeps = deps.filter(dep => scc.includes(dep));
                return {
                    file: file,
                    circularDeps: circularDeps
                };
            });

            // 尝试构建依赖链条
            let chain = [];
            if (cycleInfo.length > 0) {
                chain.push(cycleInfo[0].file);
                let current = cycleInfo[0];
                let next = cycleInfo.find(item => current.circularDeps.includes(item.file));

                // 简单构建一个依赖链条（可能不完整，但能显示循环关系）
                while (next && !chain.includes(next.file)) {
                    chain.push(next.file);
                    current = next;
                    next = cycleInfo.find(item => current.circularDeps.includes(item.file));
                }

                // 闭合循环
                if (next) {
                    chain.push(next.file + " (循环回)");
                }
            }

            // 转换为相对路径
            const relativeChain = chain.map(file => path.relative(projectRoot, file));
            const relativeScc = scc.map(file => path.relative(projectRoot, file));

            log.warn('在文件之间检测到 ' + chalk.red('循环依赖关系') + ':');
            log.warn(chalk.cyan('文件链: ') + chalk.yellow(relativeChain.join(' -> ')));
            log.warn(chalk.cyan('循环中的所有文件: ') + chalk.yellow(relativeScc.join(', ')));
        }


        // 构建SCC内部的继承图
        const localInheritance = new Map();
        scc.forEach(file => {
            localInheritance.set(file, inheritanceRelations[file] || []);
        });

        // 拓扑排序，确保父类在子类之前
        const visited = new Set();
        const result = [];

        function visit(file) {
            if (visited.has(file)) return;

            visited.add(file);

            // 先处理父类
            const parents = localInheritance.get(file) || [];
            parents.forEach(parent => {
                if (scc.includes(parent) && !visited.has(parent)) {
                    visit(parent);
                }
            });

            result.push(file);
        }

        scc.forEach(file => {
            if (!visited.has(file)) {
                visit(file);
            }
        });

        return result;
    }

    // 构建SCC之间的依赖关系
    const sccMap = new Map(); // 文件到SCC索引的映射
    sccs.forEach((scc, index) => {
        scc.forEach(file => {
            sccMap.set(file, index);
        });
    });

    // 计算SCC之间的依赖关系
    const sccDependencies = new Map();
    sccs.forEach((scc, sccIndex) => {
        const deps = new Set();
        scc.forEach(file => {
            (fileDependencies[file] || []).forEach(dep => {
                const depSccIndex = sccMap.get(dep);
                // 如果依赖的文件属于不同的SCC，则建立SCC间的依赖关系
                if (depSccIndex !== undefined && depSccIndex !== sccIndex) {
                    deps.add(depSccIndex);
                }
            });
        });
        sccDependencies.set(sccIndex, deps);
    });

    // 对SCC进行拓扑排序
    const sccVisited = new Set();
    const sccResult = []; // 按拓扑顺序排列的SCC索引

    function visitScc(sccIndex) {
        if (sccVisited.has(sccIndex)) return;

        sccVisited.add(sccIndex);

        // 先访问依赖的SCC
        const deps = sccDependencies.get(sccIndex) || new Set();
        deps.forEach(depIndex => {
            visitScc(depIndex);
        });

        // 最后添加当前SCC
        sccResult.push(sccIndex);
    }

    // 对所有SCC执行拓扑排序
    sccs.forEach((_, index) => {
        if (!sccVisited.has(index)) {
            visitScc(index);
        }
    });

    // 按照SCC顺序构建最终结果，并在SCC内部按继承关系排序
    const finalResult = [];
    sccResult.forEach(sccIndex => {
        const scc = sccs[sccIndex];
        const sortedScc = sortSCCByInheritance(scc);
        sortedScc.forEach(file => {
            finalResult.push(file);
        });
    });

    // 构建返回对象
    const obj = {};
    finalResult.forEach(value => obj[value] = files[value]);
    return obj;
}

/**
 * 分析TypeScript源文件的导入依赖关系
 * @param {ts.SourceFile} sourceFile - TypeScript源文件
 * @param { utils.Map<File>} allFiles - 所有文件信息映射
 * @returns {string[]} 依赖的文件路径列表
 */
function analyzeDependencies(sourceFile, allFiles) {
    if (importMap.has(sourceFile)) {
        const map = importMap.get(sourceFile)
        return Array.from(map.values())
    }
    const dependencies = [];
    // 获取当前文件的目录路径
    const currentFilePath = sourceFile.fileName;
    const currentDir = path.dirname(currentFilePath);
    // 创建一个映射来存储导入的别名和对应的完整路径
    const nameMap = new Map();
    // 遍历所有语句查找导入声明
    sourceFile.statements.forEach(statement => {
        if (ts.isImportDeclaration(statement)) {
            const importPath = statement.moduleSpecifier.text;
            // 解析导入路径为绝对路径
            let resolvedPath = "";
            if (importPath.startsWith(".")) {
                // 相对路径导入
                resolvedPath = path.resolve(currentDir, importPath);
            } else {
                // 绝对路径导入（从项目根目录开始）
                resolvedPath = path.resolve(process.cwd(), importPath);
            }
            resolvedPath = resolvedPath.toLowerCase();

            // 查找对应的文件（尝试不同扩展名）
            const possiblePaths = [
                resolvedPath + ".ts",
                resolvedPath + ".tsx"
            ];

            let finalPath = "";
            for (const possiblePath of possiblePaths) {
                if (Object.values(allFiles).some(file => file.fileNameOriginal.toLowerCase() === possiblePath)) {
                    finalPath = possiblePath;
                    break;
                }
            }

            // 如果找到了对应的文件路径
            if (finalPath) {
                dependencies.push(finalPath);
                // 处理不同的导入语法
                if (statement.importClause) {
                    // 默认导入: import MyClass from "./module"
                    if (statement.importClause.name) {
                        nameMap.set(statement.importClause.name.text, finalPath);
                    }
                    // 命名空间导入: import * as utils from "./module"
                    if (statement.importClause.namedBindings) {
                        if (ts.isNamespaceImport(statement.importClause.namedBindings)) {
                            nameMap.set(statement.importClause.namedBindings.name.text, finalPath);
                        }
                        // 命名导入: import { MyClass, MyInterface } from "./module"
                        else if (ts.isNamedImports(statement.importClause.namedBindings)) {
                            statement.importClause.namedBindings.elements.forEach(element => {
                                // element.name 是导入后的名称，element.propertyName 是原始名称（如果有的话）
                                const importName = element.name.text;
                                nameMap.set(importName, finalPath);
                            });
                        }
                    }
                } else {
                    // 无导入绑定的导入: import "./module"
                    nameMap.set(finalPath, finalPath)
                }
            }
        }
    });

    if (nameMap.size > 0) {
        importMap.set(sourceFile, nameMap)
    }
    return dependencies;
}


/**
 * 分析TypeScript源文件的继承关系，并解析父类的完整路径
 * @param {ts.SourceFile} sourceFile - TypeScript源文件
 * @param {utils.Map<File>} allFiles - 所有文件信息映射
 * @returns {string[]} 继承的类的完整路径列表
 */
function analyzeInheritance(sourceFile, allFiles) {
    const inheritance = [];

    if (!sourceFile) return inheritance;

    if (!importMap.has(sourceFile)) {
        analyzeDependencies(sourceFile, allFiles)
    }

    const map = importMap.get(sourceFile)
    if (!map || map.size === 0) return inheritance

    function visit(node) {
        // 查找类声明中的继承关系
        if (ts.isClassDeclaration(node) && node.heritageClauses) {
            node.heritageClauses.forEach(clause => {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    clause.types.forEach(type => {
                        if (ts.isExpressionWithTypeArguments(type)) {
                            // 处理标准继承: class A extends B
                            if (ts.isIdentifier(type.expression)) {
                                const className = type.expression.text;
                                // 尝试从导入中解析完整路径
                                if (map.has(className)) {
                                    inheritance.push(map.get(className));
                                }
                            }
                            // 处理 mixin 模式: class A extends mixin(B, C)
                            else if (ts.isCallExpression(type.expression)) {
                                const callExpr = type.expression;
                                // 获取函数名，例如 mixinExt
                                if (ts.isIdentifier(callExpr.expression)) {
                                    const functionName = callExpr.expression.text;
                                    // 如果 mixin 函数本身也在导入中，则添加为依赖
                                    if (map.has(functionName)) {
                                        inheritance.push(map.get(functionName));
                                    }
                                }

                                // 处理函数参数中的类名
                                callExpr.arguments.forEach(arg => {
                                    if (ts.isIdentifier(arg)) {
                                        const className = arg.text;
                                        if (map.has(className)) {
                                            inheritance.push(map.get(className));
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return inheritance;
}

module.exports = create