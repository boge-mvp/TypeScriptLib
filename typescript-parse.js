const ts = require("typescript");


/**
 * https://astexplorer.net/
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



function scanNode() {
    return (context) => {

        /**
         * 遍历 AST 节点的访问器函数。
         * 主要处理类声明节点，为其添加元数据装饰器并重新排序装饰器。
         *
         * @param {ts.Node} node 当前遍历到的 AST 节点
         * @returns {ts.Node | ts.ClassDeclaration} 处理后的节点或原始节点
         */
        const visitor = (node) => {

            return ts.visitEachChild(node, visitor, context)
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


module.exports = {
    addMetadata, createNamespaceTransformer, scanNode
}