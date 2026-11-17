'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

/**
 * 集中式 UI 布局合包编译工具 (UI Layout Bundler)
 *
 * 核心特性：
 * 1. 路径直驱扫描：只需传入目标文件夹路径 (如 "res/layout")，自动递归收集该路径下的全部 .json 布局；
 * 2. 纯路径精确寻址：100% 采用相对于项目基础目录的标准路径作为 Key (如 "res/layout/header.json")，绝无短名别名污染；
 * 3. 极速无损压缩：使用 DeflateRaw 算法，将纯文本 JSON 体积暴降 75% ~ 85%；
 * 4. 商业级 AES-GCM 带认证加密：自动生成 12 字节随机 IV 与 16 字节 AuthTag，杜绝传输拦截与恶意篡改；
 * 5. 自定义二进制后缀：支持自定义输出扩展名（如 .bin, .fui, .pak），深度联动官方 packageFileExtension；
 * 6. 零额外依赖：完全基于 Node.js 原生底层 C++ 模块 (zlib, crypto)，无需在 package.json 安装任何第三方 npm 包。
 *
 * @param {Object} options 打包参数配置
 * @param {string} options.inputDir 待扫描合并的目标布局文件夹路径 (如 "res/layout" 或 "demo/uifactory/res/layout")
 * @param {string} options.outputDir 合包输出目标目录 (如 "demo/uifactory/res")
 * @param {string} [options.bundleName="ui_bundle"] 输出文件主名
 * @param {string} [options.extension="bin"] 二进制文件后缀名 (如 "bin" 或 "fui")
 * @param {boolean} [options.outputBinary=true] 是否选择性编译并输出二进制包
 * @param {boolean} [options.outputJson=true] 是否同时输出明文 JSON 文件供调试查看
 * @param {string} [options.key="TypeScriptLib_UIFactory_2026_Key"] AES 对称加密密钥
 * @param {string} [options.baseDir] 相对路径的基准目录 (默认为 inputDir 的上一级或当前 cwd)
 * @returns {{ jsonPath?: string, binaryPath?: string, count: number, rawSize: number, binarySize: number }}
 */
function bundleLayouts(options) {
    if (!options || !options.inputDir || !options.outputDir) {
        throw new Error("[bundleLayouts] 缺少必填参数 inputDir 或 outputDir！");
    }

    const inputDir = path.resolve(process.cwd(), options.inputDir);
    const outputDir = path.resolve(process.cwd(), options.outputDir);
    const bundleName = options.bundleName || "ui_bundle";
    const extension = (options.extension || "bin").replace(/^\./, "");
    const outputBinary = options.outputBinary !== false;
    const outputJson = options.outputJson !== false;
    const key = options.key || "TypeScriptLib_UIFactory_2026_Key";

    if (!fs.existsSync(inputDir)) {
        throw new Error(`[bundleLayouts] 输入路径不存在: ${inputDir}`);
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const bundle = {
        version: "1.0.0",
        timestamp: Date.now(),
        layouts: {}
    };

    // 递归扫描目标目录，以标准相对路径作为唯一 Key
    let count = 0;
    const baseDir = options.baseDir ? path.resolve(process.cwd(), options.baseDir) : path.dirname(inputDir);

    function scan(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (item.endsWith('.json')) {
                const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                // 规范化相对路径为正斜杠格式 (例如 "res/layout/header.json")
                const relKey = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                bundle.layouts[relKey] = content;
                count++;
            }
        }
    }

    scan(inputDir);

    const jsonStr = JSON.stringify(bundle, null, outputJson ? 2 : 0);
    const rawBuffer = Buffer.from(jsonStr, 'utf8');
    const rawSize = rawBuffer.length;

    let jsonPath = null;
    let binaryPath = null;
    let binarySize = 0;

    // 1. 选择性输出明文调试 JSON
    if (outputJson) {
        jsonPath = path.join(outputDir, `${bundleName}.json`);
        fs.writeFileSync(jsonPath, jsonStr, 'utf8');
    }

    // 2. 选择性输出紧凑压缩与 AES 加密二进制包
    if (outputBinary) {
        // 第一步：无损 Raw Deflate 压缩 (纯文本 JSON 压缩率高达 75% ~ 85%)
        const minifiedJsonStr = JSON.stringify(bundle);
        const deflated = zlib.deflateRawSync(Buffer.from(minifiedJsonStr, 'utf8'));

        // 第二步：带认证的 AES-256-GCM 加密 (生成随机 12 字节 IV 与 16 字节 AuthTag)
        const keyHash = crypto.createHash('sha256').update(key).digest(); // 32 字节密钥
        const iv = crypto.randomBytes(12); // 12 字节 GCM IV

        const cipher = crypto.createCipheriv('aes-256-gcm', keyHash, iv);
        const encrypted = Buffer.concat([cipher.update(deflated), cipher.final()]);
        const tag = cipher.getAuthTag(); // 16 字节验签 Tag

        // 最终二进制流格式: [12 字节 IV] + [16 字节 AuthTag] + [加密的 Deflate 密文]
        const finalBinaryBuffer = Buffer.concat([iv, tag, encrypted]);
        binarySize = finalBinaryBuffer.length;

        binaryPath = path.join(outputDir, `${bundleName}.${extension}`);
        fs.writeFileSync(binaryPath, finalBinaryBuffer);
    }

    return {
        jsonPath,
        binaryPath,
        count,
        rawSize,
        binarySize,
        compressionRatio: rawSize > 0 ? ((1 - binarySize / rawSize) * 100).toFixed(1) + "%" : "0%"
    };
}

module.exports = { bundleLayouts };
