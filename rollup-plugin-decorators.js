/**
 * 使用正则处理
 */


const path = require('path');
const fs = require('fs-extra');

class FileData {
    constructor(path = "", relativePath="", code = "") {
        this.path = path
        this.relativePath = relativePath
        this.code = code
        /**
         * @type {string[]}
         */
        this.imports = []
    }
}

/**
 * 分析项目依赖并处理装饰器
 * @param {string} entryFile - 入口文件路径
 * @returns {Promise<string>}
 */
async function analyzeAndProcessDecorators(entryFile) {
    // 获取入口文件所在目录
    const srcDir = path.dirname(entryFile);

    // 收集所有 ts 文件
    const allTsFiles = await collectTsFiles(srcDir);

    // 构建依赖图
    const dependencyGraph = buildDependencyGraph(allTsFiles, srcDir);

    // 找出未被依赖的文件
    const unreferencedFiles = findUnreferencedFiles(dependencyGraph);

    // 检查未被依赖文件中是否有使用装饰器的
    const filesWithDecorators = checkForDecorators(unreferencedFiles);

    let code
    // 向主文件添加导入语句
    if (filesWithDecorators.length > 0) {
        code = await addImportsToMainFile(entryFile, filesWithDecorators);
    } else code = await fs.readFile(entryFile)

    console.log("强制导入文件", filesWithDecorators.map(value => value.relativePath).join(" "))

    return code
}

/**
 * 构建依赖图
 * @param files {string[]}
 * @param baseDir {string}
 * @returns {FileData[]}
 */
function buildDependencyGraph(files, baseDir) {
    const graph = []

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativeFilePath = path.relative(baseDir, file).replace(/\\/g, '/');
        const fileData = new FileData(file, relativeFilePath, content)
        graph.push(fileData)

        const imports = fileData.imports

        // 匹配 import 语句
        const importRegex = /import\s+['"]([^'"]+)['"]|from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content))) {
            const importPath = match[1] || match[2];
            if (importPath && importPath.startsWith('.')) {
                const currentDir = path.dirname(file);
                let resolvedPath = path.resolve(currentDir, importPath);
                // 添加 .ts 扩展名（如果需要）
                if (!resolvedPath.endsWith('.ts')) {
                    if (fs.existsSync(resolvedPath + '.ts')) {
                        resolvedPath += '.ts';
                    } else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
                        resolvedPath = path.join(resolvedPath, 'index.ts');
                    }
                }
                if (fs.existsSync(resolvedPath)) {
                    const relativeImportPath = path.relative(baseDir, resolvedPath).replace(/\\/g, '/');
                    imports.push(relativeImportPath);
                }
            }
        }
    }

    return graph

}

/**
 * 检查文件是否使用了装饰器
 * @param files {FileData[]}
 * @returns {FileData[]}
 */
function checkForDecorators(files) {
    const filesWithDecorators = [];
    for (const file of files) {
        // 使用正则表达式检测装饰器
        // 匹配 @ 开头的装饰器语法，排除注释中的 @ 符号
        const decoratorRegex = /(?<!\/\/.*|\/\*.*?\*\/.*)@\w+/g;

        if (decoratorRegex.test(file.code)) {
            filesWithDecorators.push(file);
        }
    }
    return filesWithDecorators;
}

/**
 * 向主文件添加导入语句
 * @param mainFile {string}
 * @param decoratorFiles {FileData[]}
 * @returns {Promise<string>}
 */
async function addImportsToMainFile(mainFile, decoratorFiles) {
    let content = await fs.readFile(mainFile)
    // 生成导入语句
    let importStatements = '';
    for (const file of decoratorFiles) {
        const relativePath = file.relativePath.replace(/\.ts$/, '');

        // 确保相对路径以 ./ 或 ../ 开头
        const normalizedPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
        importStatements += `import "${normalizedPath}";\n`;
    }

    // 将导入语句添加到文件顶部
    content = importStatements + content;

    return content
}


/**
 * 查找未被任何文件依赖的文件
 * @param dependencyGraph {FileData[]}
 * @returns {FileData[]}
 */
function findUnreferencedFiles(dependencyGraph) {
    const referenced = new Set();

    for (const file of dependencyGraph) {
        for (const dep of file.imports) {
            referenced.add(dep);
        }
    }

    const unreferenced = [];
    for (const file of dependencyGraph) {

        const relativePath = path.relative(path.dirname(dependencyGraph[0].path), file.path).replace(/\\/g, '/');
        if (!referenced.has(relativePath)) {
            unreferenced.push(file);
        }
    }

    return unreferenced;
}


/**
 * 收集指定目录下的所有 .ts 文件
 */
async function collectTsFiles(dir) {
    const files = [];

    const items = await fs.readdir(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            files.push(...await collectTsFiles(fullPath));
        } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
            files.push(fullPath);
        }
    }

    return files;
}


module.exports = analyzeAndProcessDecorators