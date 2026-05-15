const ts = require("typescript");
const path = require("path");
const log = require("gulplog")
const chalk = require("chalk")

/**
 * 根据单个ts 源文件 保存  import A from '../aaa'   map[A] = fullPath
 * @type {Map<ts.SourceFile, Map<string, string>>}
 */
let importMap = new Map()
// 添加全局变量存储依赖详情
let dependencyDetailsMap = new Map();

// 建立跨平台大小写无关的快速索引
let pathCaseMap = new Map();

// 统一路径分隔符为斜杠 /
function unifyPath(p) {
    return p ? p.replace(/\\/g, '/') : p;
}

/**
 * 基于依赖关系对文件进行排序，优先处理继承关系和值依赖
 * @param  {Map<File>} files - 所有文件信息映射
 * @returns {string[]} 按依赖顺序排序的文件名列表
 */
function sortFilesByDependencies(files) {
    // 初始化路径映射表，解决跨平台大小写和分隔符不一致问题
    pathCaseMap.clear();
    for (const fileName in files) {
        if (!files.hasOwnProperty(fileName)) continue;
        const file = files[fileName];
        if (file.fileNameOriginal) {
            pathCaseMap.set(unifyPath(file.fileNameOriginal).toLowerCase(), fileName);
        }
        pathCaseMap.set(unifyPath(fileName).toLowerCase(), fileName);
    }

    // 提取并排序所有文件名，保证跨平台的入口顺序一致性
    const sortedFileNames = Object.keys(files).sort();

    // 为每个文件计算依赖
    const fileDependencies = {};
    const inheritanceRelations = {}; // 存储继承关系
    const fileDependencyDetails = {}; // 存储详细依赖信息

    for (const fileName of sortedFileNames) {
        if (!files.hasOwnProperty(fileName)) continue;

        const file = files[fileName];
        if (file.ts && file.ts.imports) {
            fileDependencies[fileName] = analyzeDependencies(file.ts, files);
            // 获取依赖详情
            if (dependencyDetailsMap.has(file.ts)) {
                fileDependencyDetails[fileName] = dependencyDetailsMap.get(file.ts);
            }
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

        // 遍历当前节点的所有依赖，同样保证依赖遍历的稳定性
        const dependencies = (fileDependencies[node] || []).slice().sort();
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
            // 排序SCC内部以保持一致性
            scc.sort();
            sccs.push(scc);
        }
    }

    // 对所有未访问的节点执行strongConnect，使用排序后的文件名列表
    for (const fileName of sortedFileNames) {
        if (!index.has(fileName)) {
            strongConnect(fileName);
        }
    }

    // 在SCC内部根据继承关系和依赖类型排序
    function sortSCCByInheritanceAndUsage(scc) {
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

        // 构建SCC内部的依赖图（包括继承和值依赖）
        const localInheritance = new Map();
        const localValueDependencies = new Map();
        const localTypeDependencies = new Map();

        scc.forEach(file => {
            localInheritance.set(file, inheritanceRelations[file] || []);

            // 分析继承、值依赖和类型依赖
            const inheritanceDeps = new Set();
            const valueDeps = new Set();
            const typeDeps = new Set();

            if (fileDependencyDetails[file]) {
                const details = fileDependencyDetails[file];
                details.forEach((depInfo, depFile) => {
                    if (scc.includes(depFile)) {
                        if (depInfo.usage.has('value')) {
                            valueDeps.add(depFile);
                        }
                        if (depInfo.usage.has('type')) {
                            typeDeps.add(depFile);
                        }
                        // 默认情况下（无法确定类型）也当作依赖处理
                        if (depInfo.usage.size === 0) {
                            valueDeps.add(depFile);
                        }
                    }
                });
            }
            localValueDependencies.set(file, valueDeps);
            localTypeDependencies.set(file, typeDeps);
        });

        // 拓扑排序，确保依赖顺序正确
        const visited = new Set();
        const result = [];

        function visit(file) {
            if (visited.has(file)) return;

            visited.add(file);

            // 继承依赖
            const parents = localInheritance.get(file) || [];
            // 值依赖
            const valueDeps = localValueDependencies.get(file) || new Set();
            // 类型依赖
            const typeDeps = localTypeDependencies.get(file) || new Set();

            const deps = parents.length > 0 ? parents : valueDeps.size > 0 ? valueDeps : typeDeps;

            deps.forEach(dep => {
                if (scc.includes(dep) && !visited.has(dep)) {
                    visit(dep);
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

    // 计算SCC之间的依赖关系（区分值依赖和类型依赖）
    const sccDependencies = new Map();
    sccs.forEach((scc, sccIndex) => {
        const deps = new Set();
        scc.forEach(file => {
            // 处理普通依赖
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

    // 按照SCC顺序构建最终结果，并在SCC内部按依赖类型排序
    const finalResult = [];
    sccResult.forEach(sccIndex => {
        const scc = sccs[sccIndex];
        const sortedScc = sortSCCByInheritanceAndUsage(scc);
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
 * @param { Map<File>} allFiles - 所有文件信息映射
 * @returns {string[]} 依赖的文件路径列表
 */
function analyzeDependencies(sourceFile, allFiles) {
    if (importMap.has(sourceFile)) {
        const map = importMap.get(sourceFile);
        // 如果已有依赖详情，直接返回文件路径
        if (dependencyDetailsMap.has(sourceFile)) {
            const details = dependencyDetailsMap.get(sourceFile);
            return Array.from(details.keys());
        }
        return Array.from(map.values());
    }

    const dependencies = [];
    // 获取当前文件的目录路径
    const currentFilePath = sourceFile.fileName;
    const currentDir = path.dirname(currentFilePath);
    // 创建一个映射来存储导入的别名和对应的完整路径
    const nameMap = new Map();
    // 存储详细的依赖信息
    const dependencyDetails = new Map();

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
            
            // 统一路径分隔符，用于在 map 中查找
            const unifiedResolvedPath = unifyPath(resolvedPath).toLowerCase();

            // 查找对应的文件（尝试不同扩展名）
            const possiblePaths = [
                unifiedResolvedPath + ".ts",
                unifiedResolvedPath + ".tsx"
            ];

            let finalPath = "";
            for (const possiblePath of possiblePaths) {
                if (pathCaseMap.has(possiblePath)) {
                    finalPath = pathCaseMap.get(possiblePath);
                    break;
                }
            }

            if (!finalPath) {
                console.log(`[DEBUG MISSING DEP] source: ${currentFilePath}, import: ${importPath}, resolved: ${resolvedPath}`);
            }

            // 如果找到了对应的文件路径
            if (finalPath) {
                dependencies.push(finalPath);
                dependencyDetails.set(finalPath, {
                    path: finalPath,
                    usage: new Set()
                });

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
                    nameMap.set(finalPath, finalPath);
                }
            }
        }
    });

    // 分析符号使用情况
    if (nameMap.size > 0) {
        importMap.set(sourceFile, nameMap);
        const usageMap = analyzeSymbolUsage(sourceFile, nameMap);

        // 合并使用信息到依赖详情中
        usageMap.forEach((usages, filePath) => {
            if (dependencyDetails.has(filePath)) {
                const details = dependencyDetails.get(filePath);
                usages.forEach(usage => details.usage.add(usage));
            }
        });

        // 保存依赖详情供后续使用
        dependencyDetailsMap.set(sourceFile, dependencyDetails);
    }

    return dependencies;
}

/**
 * 分析导入符号在代码中的具体使用情况
 * @param {ts.SourceFile} sourceFile - TypeScript源文件
 * @param {Map<string, string>} importMap - 导入映射表
 * @returns {Map<string, Set<string>>} 符号使用情况映射
 */
function analyzeSymbolUsage(sourceFile, importMap) {
    const usageMap = new Map();

    function visit(node) {
        // 处理标识符使用情况
        if (ts.isIdentifier(node)) {
            const symbolName = node.text;
            if (importMap.has(symbolName)) {
                const filePath = importMap.get(symbolName);
                if (!usageMap.has(filePath)) {
                    usageMap.set(filePath, new Set());
                }

                // 确定使用上下文
                const usageContext = determineUsageContext(node);
                usageMap.get(filePath).add(usageContext);
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return usageMap;
}

/**
 * 分析TypeScript源文件的继承关系，并解析父类的完整路径
 * @param {ts.SourceFile} sourceFile - TypeScript源文件
 * @param {Map<File>} allFiles - 所有文件信息映射
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

/**
 * 确定符号的使用上下文
 * @param {ts.Node} node - 标识符节点
 * @returns {string} 使用上下文类型
 */
function determineUsageContext(node) {

    const parent = node.parent;

    // 类型引用上下文
    // 示例: let a: MyClass;  // MyClass 是类型引用
    if (ts.isTypeReferenceNode(parent) && parent.typeName === node) {
        return 'type';
    }

    // 变量声明中的类型注解
    // 示例: let a: MyClass;  // MyClass 是变量 a 的类型注解
    if (ts.isVariableDeclaration(parent) && parent.type === node.parent) {
        return 'type';
    }

    // 函数参数类型
    // 示例: function func(param: MyClass) {}  // MyClass 是参数 param 的类型
    if (ts.isParameter(parent) && parent.type === node.parent) {
        return 'type';
    }

    // 函数返回值类型
    // 示例: function func(): MyClass {}  // MyClass 是函数的返回值类型
    if ((ts.isFunctionDeclaration(parent) || ts.isMethodDeclaration(parent)) && parent.type === node.parent) {
        return 'type';
    }

    // 类型断言
    // 示例: let a = b as MyClass;  // MyClass 是类型断言
    if (ts.isAsExpression(parent) && parent.type === node.parent) {
        return 'type';
    }

    // 泛型类型参数
    // 示例: let arr: Array<MyClass> = [];  // MyClass 是泛型类型参数
    if (ts.isTypeReferenceNode(parent) && ts.isArrayLiteralExpression(node.parent)) {
        return 'type';
    }

    // 类继承
    // 示例: class Child extends Parent {}  // Parent 是类继承
    if (ts.isHeritageClause(parent)) {
        return 'value';
    }

    // instanceof 检查
    // 示例: if (a instanceof MyClass) {}  // MyClass 在 instanceof 检查中作为值使用
    if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword &&
        parent.right === node) {
        return 'value';
    }

    // new 表达式
    // 示例: let a = new MyClass();  // MyClass 在 new 表达式中作为值使用
    if (ts.isNewExpression(parent) && parent.expression === node) {
        return 'value';
    }

    // 属性访问
    // 示例: MyClass.staticProp;  // MyClass 在属性访问中作为值使用
    if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
        return 'value';
    }

    // 静态方法调用
    // 示例: MyClass.staticMethod();  // MyClass 在静态方法调用中作为值使用
    if (ts.isCallExpression(parent) && parent.expression === node) {
        return 'value';
    }

    // 函数调用参数
    // 示例: func([MyClass]);  // MyClass 在函数调用参数中作为值使用
    if (ts.isCallExpression(parent.parent) && ts.isArrayLiteralExpression(parent) &&
        parent.parent.arguments.includes(parent)) {
        return 'value';
    }

    // 赋值表达式右侧
    // 示例: let a = MyClass;  // MyClass 在赋值表达式右侧作为值使用
    if (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        parent.right === node) {
        return 'value';
    }

    // 默认视为值引用
    return 'value';
}

function clearCache() {
    importMap.clear();
    dependencyDetailsMap.clear();
    pathCaseMap.clear();
}


module.exports = function (files) {
    const result = sortFilesByDependencies(files)
    clearCache()
    return result
}