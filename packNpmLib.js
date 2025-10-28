const fs = require('fs');
const path = require('path');

// 定义源目录和目标目录
const tsCoreDir = path.join(__dirname, 'TSCore/bin');
const gameLibDir = path.join(__dirname, 'GameLib/bin');
const binDir = path.join(__dirname, 'bin');
const libsDir = path.join(__dirname, 'libs');
const distDir = path.join(__dirname, 'dist');
const templateDir = path.join(__dirname, 'template');

// 确保目标目录存在
function ensureDirectoryExistence(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

// 删除目录及其内容
function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                removeDirectory(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

// 复制文件的函数
/**
 *
 * @param source {string}
 * @param destination {string}
 * @param files {string}
 */
function copyFiles(source, destination, ...files) {
    console.log(`正在将 ${source} 中的文件复制到 ${destination}`);
    ensureDirectoryExistence(destination);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
            // 递归复制子目录
            copyFiles(sourcePath, destPath);
        } else {
            // 复制文件
            fs.copyFileSync(sourcePath, destPath);
        }
    });
}

/**
 * 拷贝整个目录，支持排除特定文件
 * @param source {string} 源目录路径
 * @param destination {string} 目标目录路径
 * @param excludeFiles {string[]} 要排除的文件名数组
 */
function copyDirectory(source, destination, excludeFiles = []) {
    console.log(`正在将 ${source} 中的文件复制到 ${destination}`);

    // 确保目标目录存在
    ensureDirectoryExistence(destination);

    // 读取源目录中的所有文件和子目录
    const items = fs.readdirSync(source);

    items.forEach(item => {
        // 如果文件在排除列表中，则跳过
        if (excludeFiles.includes(item)) {
            console.log(`跳过排除的文件: ${item}`);
            return;
        }

        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);

        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
            // 递归复制子目录
            copyDirectory(sourcePath, destPath, excludeFiles);
        } else {
            // 复制文件
            fs.copyFileSync(sourcePath, destPath);
            console.log(`已复制文件: ${item}`);
        }
    });
}


// 主函数：执行复制操作
function packResources() {
    try {
        // 先删除 dist 目录
        removeDirectory(distDir);
        removeDirectory(binDir);
        // 确保 dist 目录存在
        ensureDirectoryExistence(distDir);
        // 检查源目录是否存在
        copyFiles(tsCoreDir, distDir, "tsCore.js", "tsCore.min.js", "tsCore.min.js.map");
        copyFiles(gameLibDir, distDir, "gameLib.js", "gameLib.min.js", "gameLib.min.js.map");

        copyFiles(tsCoreDir, binDir, "tsCore.d.ts");
        copyFiles(gameLibDir, binDir, "gameLib.d.ts");
        copyDirectory(libsDir, binDir);
        copyDirectory(templateDir, distDir);

    } catch (error) {
        console.error('复制文件时出错:', error);
    }
}

// 执行打包资源函数
packResources();