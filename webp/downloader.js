const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const {execFile} = require('child_process');

const WEBP_VERSION = '1.6.0';
const BASE_URL = 'https://storage.googleapis.com/downloads.webmproject.org/releases/webp';
const REQUIRED_TOOLS = ['cwebp', 'dwebp', 'gif2webp', 'webpmux'];

//按平台与架构返回下载配置
function getDownloadConfig() {
    const {platform, arch} = process;
    if (platform === 'win32' && arch === 'x64')
        return {url: `${BASE_URL}/libwebp-${WEBP_VERSION}-windows-x64.zip`, archive: 'zip', binSuffix: '.exe'};
    if (platform === 'darwin' && arch === 'arm64')
        return {url: `${BASE_URL}/libwebp-${WEBP_VERSION}-mac-arm64.tar.gz`, archive: 'tar.gz', binSuffix: ''};
    if (platform === 'darwin' && arch === 'x64')
        return {url: `${BASE_URL}/libwebp-${WEBP_VERSION}-mac-x86-64.tar.gz`, archive: 'tar.gz', binSuffix: ''};
    if (platform === 'linux' && arch === 'x64')
        return {url: `${BASE_URL}/libwebp-${WEBP_VERSION}-linux-x86-64.tar.gz`, archive: 'tar.gz', binSuffix: ''};
    if (platform === 'linux' && arch === 'arm64')
        return {url: `${BASE_URL}/libwebp-${WEBP_VERSION}-linux-aarch64.tar.gz`, archive: 'tar.gz', binSuffix: ''};
    return null;
}

function getWebpHome() {
    return path.join(os.homedir(), '.webp');
}

function getBinDir() {
    return path.join(getWebpHome(), 'bin');
}

function getExePath(toolName) {
    const config = getDownloadConfig();
    const suffix = config ? config.binSuffix : (process.platform === 'win32' ? '.exe' : '');
    return path.join(getBinDir(), toolName + suffix);
}

function isReady() {
    if (!fs.existsSync(getBinDir())) return false;
    return REQUIRED_TOOLS.every(name => fs.existsSync(getExePath(name)));
}

let _ensurePromise = null;

//确保可执行文件就绪（带单例缓存，并发安全）
function ensureWebpBinaries() {
    if (isReady()) return Promise.resolve();
    if (_ensurePromise) return _ensurePromise;
    _ensurePromise = _downloadAndExtract().finally(() => {
        _ensurePromise = null;
    });
    return _ensurePromise;
}

//下载文件（处理 3xx 重定向）
function _download(url, dest) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                _download(res.headers.location, dest).then(resolve, reject);
                return;
            }
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`下载失败: HTTP ${res.statusCode}`));
                return;
            }
            const fileStream = fs.createWriteStream(dest);
            res.pipe(fileStream);
            fileStream.on('finish', () => fileStream.close(() => resolve()));
            fileStream.on('error', (err) => {
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                reject(err);
            });
        });
        req.on('error', (err) => {
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            reject(err);
        });
    });
}

//使用系统 tar 解压
function _extract(archivePath, destDir, archiveType) {
    return new Promise((resolve, reject) => {
        const args = archiveType === 'tar.gz'
            ? ['-xzf', archivePath, '-C', destDir]
            : ['-xf', archivePath, '-C', destDir];
        execFile('tar', args, {shell: false}, (error) => {
            if (error) reject(new Error(`解压失败: ${error.message}`));
            else resolve();
        });
    });
}

//在解压目录中递归查找 bin 目录
function _findBinDir(root) {
    const direct = path.join(root, 'bin');
    if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;

    function walk(dir) {
        const entries = fs.readdirSync(dir, {withFileTypes: true});
        for (const e of entries) {
            if (e.isDirectory()) {
                const candidate = path.join(dir, e.name, 'bin');
                if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
            }
        }
        for (const e of entries) {
            if (e.isDirectory()) {
                const found = walk(path.join(dir, e.name));
                if (found) return found;
            }
        }
        return null;
    }

    return walk(root);
}

//将所需工具从解压目录复制到 ~/.webp/bin/
function _moveBinTools(extractDir) {
    const srcBin = _findBinDir(extractDir);
    if (!srcBin) throw new Error('解压目录中未找到 bin 目录');
    const destBin = getBinDir();
    if (!fs.existsSync(destBin)) fs.mkdirSync(destBin, {recursive: true});
    const config = getDownloadConfig();
    const suffix = config ? config.binSuffix : '';
    REQUIRED_TOOLS.forEach(name => {
        const src = path.join(srcBin, name + suffix);
        const dest = path.join(destBin, name + suffix);
        if (!fs.existsSync(src)) throw new Error(`缺少可执行文件: ${name + suffix}`);
        fs.copyFileSync(src, dest);
    });
}

function _chmodAll() {
    REQUIRED_TOOLS.forEach(name => {
        const p = getExePath(name);
        if (fs.existsSync(p)) fs.chmodSync(p, 0o755);
    });
}

function _cleanup(extractDir, archivePath) {
    try {
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, {recursive: true, force: true});
    } catch (e) {
    }
    try {
        if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
    } catch (e) {
    }
}

async function _downloadAndExtract() {
    const config = getDownloadConfig();
    if (!config) throw new Error(`不支持的平台: ${process.platform}/${process.arch}`);
    const home = getWebpHome();
    if (!fs.existsSync(home)) fs.mkdirSync(home, {recursive: true});
    const archivePath = path.join(home, path.basename(config.url));
    console.log(`[webp] 开始下载: ${config.url}`);
    await _download(config.url, archivePath);
    console.log('[webp] 下载完成, 开始解压');
    const extractDir = path.join(home, '.tmp_extract');
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, {recursive: true, force: true});
    fs.mkdirSync(extractDir, {recursive: true});
    await _extract(archivePath, extractDir, config.archive);
    _moveBinTools(extractDir);
    _cleanup(extractDir, archivePath);
    if (process.platform !== 'win32') _chmodAll();
    if (!isReady()) throw new Error('webp 工具安装失败');
    console.log(`[webp] 工具就绪: ${getBinDir()}`);
}

module.exports = {
    getWebpHome,
    getBinDir,
    getExePath,
    isReady,
    ensureWebpBinaries,
    getDownloadConfig,
    REQUIRED_TOOLS,
    WEBP_VERSION
};
