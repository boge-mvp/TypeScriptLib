const path = require('path')

/**
 * 类似于 gulp-rename 的 Rollup 插件
 * 可以修改输出文件的名称、目录和扩展名
 *
 * @param {string|{dirName?:string, basename?:string, filename?:string, extname?:string}|function} renamer - 重命名规则
 *   - string: 直接替换整个文件名
 *   - object: 指定文件路径的各个部分
 *     - dirname: 新的目录名
 *     - basename: 完整文件名(包含扩展名)
 *     - filename: 文件名(不包含扩展名)
 *     - extname: 扩展名
 *   - function: 动态计算新文件名的函数，接收(fileParts, file, fileName)参数
 * @returns {import('rollup').Plugin} 返回一个 Rollup 插件对象
 *
 * @example
 * // 字符串方式重命名
 * rollupRename('new-filename.js')
 *
 * @example
 * // 对象方式重命名
 * rollupRename({
 *   dirname: 'new-directory',
 *   filename: 'new-filename',
 *   extname: '.mjs'
 * })
 *
 * @example
 * // 函数方式重命名
 * rollupRename((fileParts, file, fileName) => {
 *   return {
 *     filename: fileParts.filename + '.min',
 *     extname: '.js'
 *   };
 * })
 */
function rollupRename(renamer) {
    return {
        name: 'rollup-rename',
        generateBundle(outputOptions, bundle) {
            // 遍历所有生成的文件
            for (const fileName in bundle) {
                const file = bundle[fileName];

                // 解析原始文件信息
                const parsedPath = path.parse(fileName)
                const fileParts = {
                    dirname: parsedPath.dir,
                    basename: parsedPath.base,
                    extname: parsedPath.ext,
                    filename: parsedPath.name
                };

                // 应用重命名规则
                const newFileParts = applyRename(renamer, fileParts, file, fileName);

                // 构建新文件名
                const newFileName = buildFileName(newFileParts);

                // 如果文件名有变化，则更新
                if (newFileName !== fileName) {
                    // 更新文件对象的fileName属性
                    file.fileName = newFileName;

                    // 从bundle中移除旧的条目并添加新的条目
                    delete bundle[fileName];
                    bundle[newFileName] = file;
                }
            }
        }
    };
}

/**
 * 应用重命名规则
 * @param {string|object|function} renamer - 重命名规则
 * @param {object} fileParts - 原始文件信息
 * @param {object} file - 文件对象
 * @param {string} fileName - 原始文件名
 * @returns {object} 新的文件信息
 */
function applyRename(renamer, fileParts, file, fileName) {
    const newFileParts = Object.assign({}, fileParts);

    if (typeof renamer === 'string') {
        // 直接字符串替换
        newFileParts.basename = renamer;
        newFileParts.filename = renamer.replace(/\.[^.]*$/, ''); // 移除扩展名
        newFileParts.extname = renamer.match(/\.[^.]*$/)?.[0] || fileParts.extname;
    } else if (typeof renamer === 'object') {
        // 对象形式的重命名规则
        if (renamer.dirname) {
            newFileParts.dirname = renamer.dirname;
        }
        if (renamer.basename) {
            newFileParts.basename = renamer.basename;
            // 同时更新filename和extname
            newFileParts.filename = renamer.basename.replace(/\.[^.]*$/, '');
            newFileParts.extname = renamer.basename.match(/\.[^.]*$/)?.[0] || fileParts.extname;
        }
        if (renamer.filename) {
            newFileParts.filename = renamer.filename;
            newFileParts.basename = renamer.filename + newFileParts.extname;
        }
        if (renamer.extname) {
            newFileParts.extname = renamer.extname;
            newFileParts.basename = newFileParts.filename + renamer.extname;
        }
    } else if (typeof renamer === 'function') {
        // 函数形式的重命名规则
        const result = renamer(Object.assign({}, fileParts), file, fileName);
        if (result) {
            Object.assign(newFileParts, result);
            // 确保basename与filename/extname一致
            if (newFileParts.filename && newFileParts.extname && !newFileParts.basename) {
                newFileParts.basename = newFileParts.filename + newFileParts.extname;
            }
        }
    }

    return newFileParts;
}

/**
 * 构建新的文件名
 * @param {object} fileParts - 文件信息
 * @returns {string} 新的文件名
 */
function buildFileName(fileParts) {
    // 如果有目录名，则构建完整路径
    if (fileParts.dirname) {
        return path.join(fileParts.dirname, fileParts.basename);
    }

    // 否则只返回文件名
    return fileParts.basename;
}

module.exports = rollupRename;