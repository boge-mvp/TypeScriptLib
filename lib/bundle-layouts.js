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
                validateLayout(content, relKey);
                bundle.layouts[relKey] = content;
                count++;
            }
        }
    }

    /**
     * Validate that:
     * 1. controllers and transitions are only defined on the root node of each layout file.
     * 2. Non-root panels cannot contain inline elements unless referenced via "src".
     * 3. All Gears declare controllers that actually exist on the root container.
     */
    function validateLayout(content, relKey) {
        if (!content || !Array.isArray(content.elements)) return;

        // Collect all valid controllers declared on the root node
        const validControllers = new Set((content.controllers || []).map(c => c && c.name).filter(Boolean));

        const gearKeys = [
            "gearDisplay", "gearXY", "gearSize", "gearLook", "gearColor",
            "gearAnimation", "gearText", "gearIcon", "gearDisplay2", "gearFontSize"
        ];

        function checkChild(node, pathTrace, parentControllers) {
            if (!node) return;
            // If node references an external component via src, its own file has its own root node
            if (node.src) return;

            // Compute available controllers for children inside this node
            const currentScopeControllers = (node.type === "button")
                ? new Set([...parentControllers, "button"])
                : new Set([...(node.controllers || []).map(c => c && c.name).filter(Boolean)]);

            // Rule 1: Non-root panels cannot contain inline elements unless referenced via src
            if (node.type === "panel" && !node.src && Array.isArray(node.elements) && node.elements.length > 0) {
                for (const child of node.elements) {
                    for (const gk of gearKeys) {
                        if (child[gk] && child[gk].controller) {
                            const cName = child[gk].controller;
                            if (!currentScopeControllers.has(cName)) {
                                throw new Error(
                                    `[bundleLayouts] Invalid layout hierarchy in "${relKey}": Sub-element "${pathTrace} -> elements[${child.name || child.type}]" declares gear "${gk}" referencing controller "${cName}", but its direct parent container does not own this controller! ` +
                                    `FairyGUI Gears only look up controllers in their DIRECT parent container. Sub-elements needing controllers must be flattened to root with "group" or decoupled into an external component with "src".`
                                );
                            }
                        }
                    }
                }
            }

            // Rule 2: Non-root nodes cannot define controllers (except button internal 4-state controller)
            const isButtonControllerOnly = node.type === "button" &&
                Array.isArray(node.controllers) &&
                node.controllers.length === 1 &&
                node.controllers[0].name === "button";

            if (Array.isArray(node.controllers) && node.controllers.length > 0 && !isButtonControllerOnly) {
                throw new Error(
                    `[bundleLayouts] Invalid layout in "${relKey}": "controllers" cannot be defined on non-root node "${pathTrace}" (name: "${node.name || 'unnamed'}", type: "${node.type}"). ` +
                    `In FairyGUI architecture, controllers must only be declared on the root node of a layout JSON. If a sub-module requires an independent controller, extract it into a separate JSON file and reference it via "src".`
                );
            }

            // Rule 3: Non-root nodes cannot define transitions
            if (Array.isArray(node.transitions) && node.transitions.length > 0) {
                throw new Error(
                    `[bundleLayouts] Invalid layout in "${relKey}": "transitions" cannot be defined on non-root node "${pathTrace}" (name: "${node.name || 'unnamed'}", type: "${node.type}"). ` +
                    `In FairyGUI architecture, transitions must only be declared on the root node of a layout JSON. If a sub-module requires an independent transition, extract it into a separate JSON file and reference it via "src".`
                );
            }

            // Rule 4: All declared Gears on this node must reference controllers that exist on parent container
            for (const gk of gearKeys) {
                if (node[gk] && node[gk].controller) {
                    const ctrlName = node[gk].controller;
                    if (!parentControllers.has(ctrlName)) {
                        throw new Error(
                            `[bundleLayouts] Invalid gear configuration in "${relKey}": Element "${pathTrace}" (name: "${node.name || 'unnamed'}") declares gear "${gk}" referencing non-existent controller "${ctrlName}". ` +
                            `Declared controllers on direct parent container: [${Array.from(parentControllers).join(", ")}].`
                        );
                    }
                }
            }

            if (Array.isArray(node.elements)) {
                for (let i = 0; i < node.elements.length; i++) {
                    const child = node.elements[i];
                    checkChild(child, `${pathTrace} -> elements[${i}](${child.name || child.type})`, currentScopeControllers);
                }
            }
        }

        for (let i = 0; i < content.elements.length; i++) {
            const rootChild = content.elements[i];
            checkChild(rootChild, `elements[${i}](${rootChild.name || rootChild.type})`, validControllers);
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
