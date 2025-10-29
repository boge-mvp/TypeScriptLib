const fs = require('fs')
const path = require('path')

const streamNode = require("node:stream")
const gulp = require("gulp")
const log = require("gulplog")
const gulpTerser = require("gulp-terser")
const inject = require("gulp-inject-string")
const concat = require('gulp-concat')
const del = require("del")
const each = require("gulp-each")
const sort = require('gulp-sort')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const gulpTs = require("gulp-typescript")
const through2 = require("through2").obj
const {Settings} = require("gulp-typescript")
const {MinifyOptions} = require("terser")
const webp = require("./webp/ToWebp")
const concatSource = require("./gulp-concat-source");
const sortDeclaration = require("./gulp-ts-sort-declaration");
const rollupRename = require("./rollup-rename-plugin");

const ts = require('typescript')

const rollup = require('rollup')
const File = require('vinyl')
const source = require('vinyl-source-stream')
const {globSync} = require('glob');
const glsl = require('rollup-plugin-glsl')
const typescriptRollup = require('@rollup/plugin-typescript')
const rollupTerser = require("@rollup/plugin-terser")
const {Options} = require("@rollup/plugin-terser")
const {SrcOptions} = require("vinyl-fs")

/***************************** 公共逻辑方法 *****************************/

/**
 * 创建一个命名空间转换器，用于处理 TypeScript 中的 import = 声明，
 * 并将简写的命名空间引用替换为完整的限定名路径。
 *
 * @returns 一个 Transformer 工厂函数，接受 TypeChecker 上下文并返回源文件转换函数。
 */
function createNamespaceTransformer() {
    return (context) => {
        return (sourceFile) => {
            // console.log(sourceFile.fileName)
            // 存储 import = 声明的映射关系：简写名称 -> 完整命名空间路径
            const namespaceMap = new Map();

            /**
             * 第一次遍历 AST，收集所有 import = 声明中的命名空间映射关系，
             * 并移除这些 import 声明。
             *
             * @param node 当前遍历到的 AST 节点
             * @returns {ts.Node} 转换后的节点（如果需要删除则返回 undefined）
             */
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

            // 应用第一次遍历，构建命名空间映射表并清理 import 声明
            sourceFile = ts.visitNode(sourceFile, visitFirstPass);

            /**
             * 第二次遍历 AST，根据已收集的命名空间映射关系，
             * 将使用简写名称的地方替换为完整限定名表达式。
             *
             * @param node 当前遍历到的 AST 节点
             * @returns {ts.Node|ts.TypeReferenceNode} 转换后的节点
             */
            function visitSecondPass(node) {
                // 替换标识符为完整的命名空间路径
                if (ts.isIdentifier(node) && namespaceMap.has(node.text)) {
                    const parent = node.parent;
                    if (!parent) return node
                    // 检查是否是独立的标识符使用（不是属性访问的一部分）
                    if (
                        ts.isTypeQueryNode(parent) && parent.exprName === node ||
                        // 变量声明类型: let a: Pool
                        ts.isVariableDeclaration(parent) && parent.type === node ||
                        // 函数参数类型: function test(a: Pool)
                        ts.isParameter(parent) && parent.type === node ||
                        // 返回值类型: function test(): Pool
                        ts.isFunctionDeclaration(parent) && parent.type === node ||
                        // 返回值类型: method test(): Pool (类中的方法)
                        ts.isMethodDeclaration(parent) && parent.type === node ||
                        // 泛型约束: <T extends Pool>
                        ts.isTypeReferenceNode(parent) && parent.typeArguments?.includes(node) ||
                        // 类型断言: obj as Pool
                        ts.isAsExpression(parent) && parent.type === node ||
                        // 数组类型等: Pool[]
                        ts.isArrayTypeNode(parent) && parent.elementType === node ||
                        // 联合类型: type MyType = A | Pool 虽然不常用于继承，但可能出现在类型定义中
                        ts.isUnionTypeNode(parent) && parent.types?.includes(node) ||
                        // 元组类型: let a: [Pool, OtherType]
                        ts.isTupleTypeNode(parent) && parent.elements?.includes(node) ||
                        // 条件类型: type A = Pool extends infer P ? P : never
                        (ts.isConditionalTypeNode(parent) &&
                            (parent.checkType === node || parent.extendsType === node)) ||
                        // 映射类型: type A = { [K in Pool]: OtherType }
                        (ts.isMappedTypeNode(parent) && parent.typeParameter?.constraint === node) ||
                        // 索引签名: { [key: Pool]: OtherType }
                        (ts.isIndexSignatureDeclaration(parent) && parent.parameters?.[0]?.type === node) ||
                        // 模板字面量类型: type A = `Hello ${Pool}`
                        (ts.isTemplateLiteralTypeNode(parent) && parent.types?.some(type => type === node)) ||
                        // 函数参数默认值中的类型: function test(skeleton: {new(): Pool} = PoolImpl)
                        (ts.isParameter(parent) && parent.type && ts.isTypeLiteralNode(parent.type) &&
                            parent.type.members?.some(member =>
                                ts.isConstructSignatureDeclaration(member) &&
                                member.type === node)) ||
                        // 构造签名返回类型: { new(): Pool }
                        (ts.isConstructSignatureDeclaration(parent) && parent.type === node)
                    ) {
                        const fullName = namespaceMap.get(node.text);
                        const qualifiedName = createQualifiedNameEntityName(fullName);
                        setParentRecursive(qualifiedName, parent);
                        return qualifiedName;
                    }

                    // 其他表达式上下文使用 PropertyAccessExpression
                    if (
                        // 新建实例: new Pool()
                        ts.isNewExpression(parent) && parent.expression === node ||
                        // 静态方法调用: Pool.method()
                        ts.isPropertyAccessExpression(parent) && parent.expression === node ||
                        // 函数调用参数: mixinExt(Pool, OtherClass)
                        ts.isCallExpression(parent) && parent.arguments.includes(node) ||
                        // 属性初始化器: static Pool = Pool
                        (ts.isPropertyDeclaration(parent) && parent.initializer === node) ||
                        // 变量赋值: let Pool = Pool
                        (ts.isVariableDeclaration(parent) && parent.initializer === node) ||
                        // 类继承: class UI extends Pool {}
                        ts.isHeritageClause(parent) && parent.types?.some(type => type.expression === node) ||
                        // 类继承中的类型参数: class UI extends Pool {}
                        ts.isExpressionWithTypeArguments(parent) && parent.expression === node ||
                        // 交叉继承类型: class UI extends A & B {}
                        ts.isIntersectionTypeNode(parent) && parent.types?.includes(node) ||
                        // 括号类型: class UI extends (Pool) {}
                        ts.isParenthesizedTypeNode(parent) && parent.type === node ||
                        // 索引访问继承类型: class UI extends Lib['BaseClass'] {}
                        ts.isIndexedAccessTypeNode(parent) && parent.objectType === node ||
                        // instanceof 表达式: t instanceof Pool
                        (ts.isBinaryExpression(parent) && parent.operatorToken.kind === ts.SyntaxKind.InstanceOfKeyword && parent.right === node) ||
                        // typeof 表达式: if (typeof obj === "object")
                        (ts.isTypeOfExpression(parent) && parent.expression === node) ||
                        // 等于比较表达式: value == Pool 或 value === Pool
                        (ts.isBinaryExpression(parent) &&
                            (parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken ||
                                parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
                                parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken ||
                                parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken) &&
                            (parent.left === node || parent.right === node)) ||
                        // 逗号表达式中的参数: func(arg1, Pool, arg3)
                        (ts.isCommaListExpression(parent) && parent.elements.includes(node)) ||
                        // 条件表达式: condition ? Pool : OtherClass
                        (ts.isConditionalExpression(parent) &&
                            (parent.condition === node || parent.whenTrue === node || parent.whenFalse === node)) ||
                        // 对象字面量属性值: { prop: Pool }
                        (ts.isPropertyAssignment(parent) && parent.initializer === node) ||
                        // 数组字面量元素: [Pool, OtherClass]
                        (ts.isArrayLiteralExpression(parent) && parent.elements.includes(node)) ||
                        // 元素访问表达式: Pool["property"] 或 Pool[variable]
                        (ts.isElementAccessExpression(parent) && parent.expression === node) ||
                        // 一元表达式: !Pool, +Pool, -Pool, ~Pool, ++Pool, --Pool
                        (ts.isPrefixUnaryExpression(parent) && parent.operand === node) ||
                        (ts.isPostfixUnaryExpression(parent) && parent.operand === node) ||
                        // 逻辑表达式: Pool && other, Pool || other
                        (ts.isBinaryExpression(parent) &&
                            (parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                                parent.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
                            (parent.left === node || parent.right === node)) ||
                        // Await表达式: await Pool
                        (ts.isAwaitExpression(parent) && parent.expression === node) ||
                        // Yield表达式: yield Pool
                        (ts.isYieldExpression(parent) && parent.expression === node) ||
                        // Spread表达式: ...Pool
                        (ts.isSpreadElement(parent) && parent.expression === node) ||
                        // Void表达式: void Pool
                        (ts.isVoidExpression(parent) && parent.expression === node) ||
                        // Delete表达式: delete Pool (虽然不常见，但语法上可能)
                        (ts.isDeleteExpression(parent) && parent.expression === node) ||
                        // in 表达式: prop in Pool
                        (ts.isBinaryExpression(parent) &&
                            parent.operatorToken.kind === ts.SyntaxKind.InKeyword &&
                            parent.right === node) ||
                        // 非空断言: Pool!
                        (ts.isNonNullExpression(parent) && parent.expression === node) ||
                        // 可选链: Pool?.method()
                        (ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.questionDotToken) ||
                        // 装饰器参数: @Decorator(Pool)
                        (ts.isDecorator(parent) && parent.expression.arguments?.includes(node)) ||
                        // 函数参数默认值: function test(a = Pool)
                        (ts.isParameter(parent) && parent.initializer === node)

                    ) {
                        const fullName = namespaceMap.get(node.text);
                        const qualifiedName = createQualifiedNameExpression(fullName);
                        setParentRecursive(qualifiedName, parent);
                        return qualifiedName;
                    }
                }

                // 处理类型引用节点，将简写的类型名替换为完整限定名 isTypeReferenceNode=173  isIdentifier=79
                if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)
                    && namespaceMap.has(node.typeName.text)) {
                    const fullName = namespaceMap.get(node.typeName.text);
                    const qualifiedName = createQualifiedNameEntityName(fullName);
                    const typeReferenceNode = ts.factory.createTypeReferenceNode(
                        qualifiedName,
                        node.typeArguments
                    );
                    setParentRecursive(typeReferenceNode, node.parent);
                    if (node.typeArguments) {
                        node.typeArguments.forEach(arg => setParentRecursive(arg, typeReferenceNode));
                    }
                    return typeReferenceNode;
                }

                // 处理 typeof 表达式中的命名空间引用
                if (ts.isTypeQueryNode(node) && ts.isQualifiedName(node.exprName)) {
                    // 检查是否是形如 typeof Path.formatUrl 的表达式
                    const leftmost = getLeftmostIdentifier(node.exprName);
                    if (leftmost && namespaceMap.has(leftmost.text)) {
                        const fullName = namespaceMap.get(leftmost.text);
                        const qualifiedName = createQualifiedNameEntityName(fullName);

                        // 重构整个表达式
                        let newExprName = replaceLeftmostInQualifiedName(node.exprName, leftmost.text, qualifiedName);
                        const newTypeQuery = ts.factory.createTypeQueryNode(newExprName);
                        setParentRecursive(newTypeQuery, node.parent);
                        return newTypeQuery;
                    }
                }

                return ts.visitEachChild(node, visitSecondPass, context);
            }


            // 应用第二次遍历，完成命名空间路径的替换
            /** @type ts.SourceFile */
            const newNode = ts.visitNode(sourceFile, visitSecondPass);
            // const text = ts.createPrinter().printFile(newNode)
            // newNode.text = text
            return newNode
        };

        // 辅助函数：获取限定名中最左边的标识符
        function getLeftmostIdentifier(qualifiedName) {
            if (ts.isIdentifier(qualifiedName)) {
                return qualifiedName;
            } else if (ts.isQualifiedName(qualifiedName)) {
                return getLeftmostIdentifier(qualifiedName.left);
            }
            return null;
        }

// 辅助函数：替换限定名中最左边的标识符
        function replaceLeftmostInQualifiedName(qualifiedName, oldName, newName) {
            if (ts.isIdentifier(qualifiedName) && qualifiedName.text === oldName) {
                return newName;
            } else if (ts.isQualifiedName(qualifiedName)) {
                const newLeft = replaceLeftmostInQualifiedName(qualifiedName.left, oldName, newName);
                return ts.factory.createQualifiedName(newLeft, qualifiedName.right);
            }
            return qualifiedName;
        }

        /**
         * 根据完整名称创建限定名表达式（如 a.b.c）。
         *
         * @param fullName 完整的命名空间路径字符串，以点号分隔
         * @returns {ts.Identifier} 表达式节点，表示该限定名
         */
        function createQualifiedNameExpression(fullName) {
            const parts = fullName.split('.');
            if (parts.length === 1) return ts.factory.createIdentifier(parts[0]);

            // 默认使用 PropertyAccessExpression，因为它在大多数上下文中都有效
            let result = ts.factory.createIdentifier(parts[0]);
            for (let i = 1; i < parts.length; i++) {
                result = ts.factory.createPropertyAccessExpression(
                    result,
                    ts.factory.createIdentifier(parts[i])
                );
            }
            return result;
        }

        /**
         * 根据完整名称创建限定名实体名称（如 a.b.c），用于类型引用上下文。
         *
         * @param fullName 完整的命名空间路径字符串，以点号分隔
         * @returns {ts.Identifier} 实体名称节点，表示该限定名
         */
        function createQualifiedNameEntityName(fullName) {
            const parts = fullName.split('.');
            if (parts.length === 1) return ts.factory.createIdentifier(parts[0]);

            // 在类型上下文中使用 QualifiedName
            let result = ts.factory.createIdentifier(parts[0]);
            for (let i = 1; i < parts.length; i++) {
                result = ts.factory.createQualifiedName(
                    result,
                    ts.factory.createIdentifier(parts[i])
                );
            }
            return result;
        }


        /**
         * 递归设置节点的 parent 属性
         * @param node 要设置 parent 的节点
         * @param parent 父节点
         */
        function setParentRecursive(node, parent) {
            if (node) {
                node.parent = parent;
                ts.forEachChild(node, child => {
                    setParentRecursive(child, node);
                });
            }
        }

    };
}

/**
 * 生成一个用于添加元数据的 TypeScript AST 转换器工厂函数。
 * 该函数会遍历 AST 中的类声明节点，如果类使用了指定装饰器（如 Component、FguiBindView、AppMain），
 * 则为其添加 Reflect.metadata 装饰器，并调整装饰器顺序，将 Component 装饰器移到最后。
 *
 * @returns {ts.TransformerFactory<ts.SourceFile>} 返回一个接收转换上下文 context 的函数，该函数返回实际的 AST 转换函数。
 */
function addMetadata() {
    return (context) => {
        const decoratorName = ["Component", "FguiBindView", "AppMain"]
        const printer = ts.createPrinter({
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed
        });

        /**
         * 遍历 AST 节点的访问器函数。
         * 主要处理类声明节点，为其添加元数据装饰器并重新排序装饰器。
         *
         * @param {ts.Node} node 当前遍历到的 AST 节点
         * @returns {ts.Node | ts.ClassDeclaration} 处理后的节点或原始节点
         */
        const visitor = (node) => {
            // 只处理类声明
            if (ts.isClassDeclaration(node)) {
                const name = node.name.text
                const decorators = ts.getDecorators(node)


                // 查看装饰器中是否有目标装饰器之一
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
                    setParent(metadataDecorator, node)
                    const modifiers = (node.modifiers || [])
                    modifiers.unshift(metadataDecorator)
                    // 添加 metadata 装饰器到 modifiers 列表中
                    const newModifiers = ts.canHaveDecorators(node) ? modifiers.toSorted((a, b) => {
                        if (a.kind === b.kind && a.kind === ts.SyntaxKind.Decorator) {
                            const aName = isNewNode(a) ?
                                printer.printNode(ts.EmitHint.Unspecified, a, a.getSourceFile()) :
                                a.getText()
                            const bName = isNewNode(b) ?
                                printer.printNode(ts.EmitHint.Unspecified, b, b.getSourceFile()) :
                                b.getText()
                            if (aName.startsWith("@Reflect.metadata") && !bName.startsWith("@Reflect.metadata"))
                                return 1
                            if (!aName.startsWith("@Reflect.metadata") && bName.startsWith("@Reflect.metadata"))
                                return -1
                            if (aName.startsWith("@Component") && !bName.startsWith("@Component"))
                                return 1
                            if (!aName.startsWith("@Component") && bName.startsWith("@Component"))
                                return -1
                        }
                        return 0
                    }) : [metadataDecorator];
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

        function isNewNode(node) {
            return !node.getSourceFile() || node.pos === -1 || node.end === -1 || (node.getFullStart() === 0 && node.getEnd() === 0)
        }

        function setParent(node, parent) {
            node.parent = parent
            ts.forEachChild(node, (child) => {
                setParent(child, node)
            })
        }

        /**
         *
         * @param {LeftHandSideExpression} exp
         * @return IdentifierObject
         */
        function getExpression(exp) {
            if (ts.isCallExpression(exp) && ts.isIdentifier(exp.expression)) {
                return getExpression(exp.expression)
            }
            return exp
        }

        /**
         * 实际执行 AST 转换的函数。
         * 接收源文件节点，使用 visitor 遍历并返回转换后的节点。
         *
         * @param {ts.SourceFile} sourceFile 源文件节点
         * @returns {ts.Node} 转换后的节点
         */
        return (sourceFile) => {
            /** @type ts.SourceFile */
            const newNode = ts.visitNode(sourceFile, visitor);
            // newNode.text = ts.createPrinter().printFile(newNode)
            return newNode
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
    return through2({objectMode: true}, function (chunk, encoding, callback) {
        // 判断condition类型并计算实际的布尔值
        let result = false;
        if (typeof condition === "boolean") {
            result = condition;
        } else if (typeof condition === "function") {
            // 当condition是函数时，传递chunk和encoding参数进行判断
            result = condition.apply(this, [chunk, encoding]);
        } else {
            return callback(new Error("condition must be a boolean or function"));
        }

        // 如果条件为真且提供了插件数组，则执行这些插件
        if (result && Array.isArray(plugins) && plugins.length > 0) {
            const resultFile = []
            // 创建初始流
            let stream = through2({objectMode: true});
            stream.myName = "stream name"
            // 构建插件管道
            let pipeline = stream;
            for (let plugin of plugins) {
                if (typeof plugin === 'function') {
                    pipeline = pipeline.pipe(plugin());
                } else {
                    pipeline = pipeline.pipe(plugin);
                }
            }

            // 跟踪是否已经回调，防止多次调用callback
            let hasCallback = false;
            const safeCallback = (err, data) => {
                if (!hasCallback) {
                    hasCallback = true;
                    callback(err, data);// 完成本次处理
                }
            };

            // 监听管道的结果
            pipeline.on('data', (resultChunk) => {
                resultFile.push(resultChunk)
            });

            pipeline.on('error', (err) => {
                safeCallback(err);
            });

            // 监听结束事件，确保即使没有数据也完成回调
            pipeline.on('end', () => {
                resultFile.forEach(value => {
                    safeCallback(null, value)
                })
            });
            // 写入数据并结束流以触发处理
            stream.write(chunk);
            stream.end();
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
        return stream.pipe(gulpTerser(terserOpt)).pipe(rename({extname: '.min.js', dirname: ""}))
    }
    return stream.pipe(sourcemaps.init())
        .pipe(gulpTerser(terserOpt))
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
 *
 * @type
 *
 * 配合gulp pipe 流执行，必须有返回非 undefined 的值 否则阻塞
 * @param func {function(chunk: Buffer | File, encoding: string, callback: function(Error|null, chunk: Buffer)): boolean}
 *        返回值不是 undefined 将会立即执行流传递，否则等待调用 callback
 * @param [end=null] {function(): void} 回调执行结束的方法，需要回调否则会阻塞
 * @param args {any} 附带的参数 会放在开头
 */
function runStream(func, end, ...args) {
    return through2(function (chunk, encoding, callback) {
        if (func) {
            let result = func.apply(this, [...args, chunk, encoding, callback])
            if (result !== undefined)
                callback(null, chunk)
        } else callback(null, chunk)
    }, end)
}

/**
 * 运行一次流处理 function中不要执行异步数据处理，否则执行顺序会混乱
 * @param func {({chunk},{enc})=>{}} 处理方法
 * @param [end=null] {function(()=>{}):{}} 回调流 参数方法需要回调不然会阻塞
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
    const tsProject = getProject(undefined, customTransformers)
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
 * @property {string} [namespace] - 命名空间名称
 * @property {{ isMinify?:boolean}} js
 * @property {{ globalDtsFile?:string[]}} dts
 */

/**
 * 构建库文件的主函数
 * @param config {BuildConfig} 构建配置对象
 * @param done - Gulp任务完成回调函数
 */
function buildLibrary(config, done) {
    const tsResult = createCompileStream(config.src.globs, config.src.opt, () => ({
        before: [
            addMetadata(),
            createNamespaceTransformer()
        ],
        afterDeclarations: [
            createNamespaceTransformer()
        ]
    }))
    const jsStream = function (done) {
        buildJs(tsResult, config.outName, config.dist, config.js.isMinify, config.namespace)
            .pipe(run(function () {
                done()
            }))
    }
    const dtsStream = function (done) {
        buildDts(tsResult, config.outName, config.dist, config.dts.globalDtsFile, config.namespace)
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
 * @param {boolean} isMinify - 是否压缩文件，默认为false
 * @param {string|null} namespace - 命名空间，默认为null
 * @returns {Stream} 返回 gulp 流对象，用于链式操作
 */
function buildJs(tsResult, outName, dist, isMinify = false, namespace = null) {
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
        .pipe(concatSource(`${outName}.js`, {namespace: namespace}))
        .pipe(gulp.dest(dist))
        .pipe(ifelse(isMinify, [
            sourcemaps.init(),
            gulpTerser(),
            rename({extname: '.min.js', dirname: ""}),
            sourcemaps.write(".", {addComment: false}),
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
            namespace: namespace,
            appendFile: globalFile
        }))
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
 * 创建一个 Rollup 构建流，用于处理多个构建选项并生成对应的文件流
 * @param {...rollup.RollupOptions} options - Rollup 构建选项数组，每个选项包含输入和输出配置
 * @returns {streamNode.Readable} 返回一个可读流，包含构建生成的文件
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
                const type = chunk.type
                // 处理 chunk 类型（JS）
                if (type === 'chunk') {
                    let content = chunk.code
                    const file = new File({
                        contents: Buffer.from(content),
                        path: fileName
                    });
                    result.push(file);
                } else if (type === 'asset') {
                    const source = chunk.source
                    const file = new File({
                        path: fileName,
                        contents: Buffer.from(source),
                    });
                    result.push(file);
                } else {
                    log.warn("Unknown type : " + type)
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

/**
 * @typedef {Object} RollupOptions
 * @property {string} [outDir] - 输出目录路径
 * @property {string} [tsconfig="tsconfig.json"] - TypeScript 配置文件路径
 * @property {boolean} [sourcemap=false] - 是否生成 sourcemap 文件
 * @property {boolean|Options} [minify=false] - 是否压缩代码，若为对象则作为 terser 压缩配置
 * @property {rollup.InputPluginOption} [plugins=[]] - rollup 插件
 */

/**
 * 使用 Rollup 打包指定的输入文件，并根据配置选项生成输出文件。
 *
 * @param {string} inputFile - 需要打包的入口文件路径
 * @param {string} outName - 输出模块的全局变量名（用于 IIFE 格式）
 * @param {RollupOptions?} options - 打包配置选项
 * @returns {NodeJS.ReadWriteStream} 返回一个 Gulp 流，用于后续处理或写入文件
 */
function rollupPack(inputFile, outName, options) {
    options = defaults(options, {
        tsconfig: "tsconfig.json",
        sourcemap: false,
        minify: false,
        plugins: []
    })
    const localPath = process.cwd()
    const outDir = path.resolve(localPath, options.outDir || "")

    const plugins = [
        glsl({
            include: /.*(.glsl|.vs|.fs)$/,
            sourceMap: false,
            compress: false
        }),
        typescriptRollup({
            transformers: {
                before: [
                    addMetadata(),
                    createNamespaceTransformer()
                ]
            },
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

    return rollupStream({
        input: inputFile,
        treeshake: false,// 删除无调用代码
        external: ["tslib"],// 排除 tslib，不将其打包进最终文件
        output: {
            // compact: true, // 去除多余缩进
            format: 'iife',
            file: outName + `${options.minify ? ".min" : ""}.js`,
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
            if (fs.existsSync(inputFile)) {
                // fs.unlinkSync(inputFile); // 构建完成后删除临时文件
            }
        })


}

const _webp = new webp.Webp()

exports = {
    webp: _webp,
    clean,
    defaults,
    createDirectory,
    cleanStream,
    runStream,
    run,
    mJs,

    log,

    findFiles,
    findFilesSync,
    addMetadata,
    createNamespaceTransformer,
    buildLibrary,
    ifelse,
    buildJs,
    buildDts,

    rollupStream,
    rollupPack,
    rollupRename
}
module.exports = exports