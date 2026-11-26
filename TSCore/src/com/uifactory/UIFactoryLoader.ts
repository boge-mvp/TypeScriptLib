import { ELoader } from "../extends/ELoader";
import { IElementConfig } from "./IElementConfig";
import { IPanelConfig } from "./IPanelConfig";
import { IUILayoutBundle } from "./IUILayoutBundle";
import { UIFactory } from "./UIFactory";

/**
 * UIFactory 布局配置校验与资源合包加载器 (从 UIFactory 抽离以保持门面精简)
 */
export class UIFactoryLoader {

    /**
     * 校验声明式布局配置的架构规范性与控制器/齿轮引用合法性
     */
    public static validateLayoutConfig(config: IPanelConfig, pagePath: string = "root"): void {
        if (!config || !config.elements || !Array.isArray(config.elements)) return;

        const validControllers = new Set<string>((config.controllers || []).map(c => c && c.name).filter(Boolean));
        const gearKeys = [
            "gearDisplay", "gearXY", "gearSize", "gearLook", "gearColor",
            "gearAnimation", "gearText", "gearIcon", "gearDisplay2", "gearFontSize"
        ];

        const checkChild = (node: IElementConfig, pathTrace: string, parentControllers: Set<string>) => {
            if (!node) return;
            if (node.src) return;

            const anyNode = node as Record<string, any>;

            const currentScopeControllers = (node.type === "button")
                ? new Set<string>([...Array.from(parentControllers), "button"])
                : new Set<string>([...(anyNode.controllers || []).map((c: any) => c && c.name).filter(Boolean)]);

            if (node.type === "panel" && Array.isArray(anyNode.elements) && anyNode.elements.length > 0) {
                console.warn(
                    `[UIFactory] Invalid layout in "${pagePath}": Non-root panel "${pathTrace}" (name: "${node.name || 'unnamed'}") contains inline "elements". ` +
                    `In UIFactory clean code architecture, page-level functional partitioning must use "type: 'group'" (GGroup) to keep depth strictly at 1. ` +
                    `If sub-container requires independent hierarchy, extract it into a separate layout JSON and reference it via "src".`
                );
            }

            const isButtonControllerOnly = node.type === "button" &&
                Array.isArray(anyNode.controllers) &&
                anyNode.controllers.length === 1 &&
                anyNode.controllers[0].name === "button";

            if (Array.isArray(anyNode.controllers) && anyNode.controllers.length > 0 && !isButtonControllerOnly) {
                console.warn(
                    `[UIFactory] Invalid layout in "${pagePath}": "controllers" cannot be defined on non-root node "${pathTrace}" (name: "${node.name || 'unnamed'}", type: "${node.type}"). ` +
                    `Controllers must only be declared on the root node of a layout JSON. If a sub-module requires an independent controller, extract it into a separate JSON file and reference it via "src".`
                );
            }

            if (Array.isArray(anyNode.transitions) && anyNode.transitions.length > 0) {
                console.warn(
                    `[UIFactory] Invalid layout in "${pagePath}": "transitions" cannot be defined on non-root node "${pathTrace}" (name: "${node.name || 'unnamed'}", type: "${node.type}"). ` +
                    `Transitions must only be declared on the root node of a layout JSON. If a sub-module requires an independent transition, extract it into a separate JSON file and reference it via "src".`
                );
            }

            for (const gk of gearKeys) {
                if (anyNode[gk] && anyNode[gk].controller) {
                    const ctrlName = anyNode[gk].controller;
                    if (!parentControllers.has(ctrlName)) {
                        console.warn(
                            `[UIFactory] Invalid gear configuration in "${pagePath}": Element "${pathTrace}" (name: "${node.name || 'unnamed'}") declares gear "${gk}" referencing non-existent controller "${ctrlName}". ` +
                            `Declared controllers on direct parent container: [${Array.from(parentControllers).join(", ")}].`
                        );
                    }
                }
            }

            if (anyNode.elements && Array.isArray(anyNode.elements)) {
                for (let i = 0; i < anyNode.elements.length; i++) {
                    const child = anyNode.elements[i];
                    checkChild(child, `${pathTrace} -> elements[${i}](${child.name || child.type})`, currentScopeControllers);
                }
            }
        };

        for (let i = 0; i < config.elements.length; i++) {
            const rootChild = config.elements[i];
            checkChild(rootChild, `elements[${i}](${rootChild.name || rootChild.type})`, validControllers);
        }
    }

    /**
     * 依托 TSCore ELoader 发起异步数据请求
     */
    public static requestData<T>(
        url: string,
        responseType: "arraybuffer" | "json" | "text" = "text",
        progress?: (ratio: number) => void
    ): Promise<Nullable<T>> {
        return new Promise((resolve) => {
            const layaType = responseType === "arraybuffer"
                ? Laya.Loader.BUFFER
                : (responseType === "json" ? Laya.Loader.JSON : Laya.Loader.TEXT);

            const progressHandler = progress ? Laya.Handler.create(null, (p: number) => progress(p), null, false) : undefined;

            ELoader.loader.load(
                url,
                Laya.Handler.create(null, (data: any) => {
                    resolve(data);
                }),
                progressHandler,
                layaType
            );
        });
    }

    /**
     * 一次性异步加载 UI 布局文件或加密合包并自动注入内存注册表
     */
    public static async loadBundle(
        bundleUrl: string,
        options?: { key?: string; extension?: string; onProgress?: (ratio: number) => void }
    ): Promise<Nullable<IUILayoutBundle | IPanelConfig>> {
        let finalUrl = bundleUrl;
        const hasDotExt = finalUrl.lastIndexOf(".") > finalUrl.lastIndexOf("/");
        if (!hasDotExt) {
            const ext = options?.extension || (fgui.UIConfig && fgui.UIConfig.packageFileExtension) || "bin";
            finalUrl = `${finalUrl}.${ext.replace(/^\./, "")}`;
        }

        const fullUrl = UIFactory.formatResUrl(finalUrl);
        const isBinary = !finalUrl.endsWith(".json");
        let resultData: any = null;

        try {
            if (isBinary) {
                const arrayBuf = await UIFactoryLoader.requestData<ArrayBuffer>(fullUrl, "arraybuffer", options?.onProgress);
                if (!arrayBuf || arrayBuf.byteLength < 28) {
                    console.warn(`[UIFactory] Binary bundle file is missing, empty or corrupted (< 28 bytes header): ${fullUrl}`);
                    return null;
                }
                const uint8 = new Uint8Array(arrayBuf);
                const iv = uint8.slice(0, 12);
                const tag = uint8.slice(12, 28);
                const cipherBytes = uint8.slice(28);

                const combinedCipher = new Uint8Array(cipherBytes.length + tag.length);
                combinedCipher.set(cipherBytes, 0);
                combinedCipher.set(tag, cipherBytes.length);

                const secret = options?.key || UIFactory.bundleKey;
                const enc = new TextEncoder();
                const keyHash = await crypto.subtle.digest("SHA-256", enc.encode(secret));
                const cryptoKey = await crypto.subtle.importKey("raw", keyHash, { name: "AES-GCM" }, false, ["decrypt"]);

                let decryptedBuf: ArrayBuffer;
                try {
                    decryptedBuf = await crypto.subtle.decrypt(
                        { name: "AES-GCM", iv, tagLength: 128 },
                        cryptoKey,
                        combinedCipher
                    );
                } catch (decryptErr: any) {
                    console.warn(`[UIFactory] Failed to decrypt bundle via AES-GCM, invalid key or corrupted payload: ${fullUrl}`, decryptErr);
                    return null;
                }

                let jsonStr = "";
                try {
                    if (typeof DecompressionStream !== "undefined") {
                        const ds = new DecompressionStream("deflate-raw");
                        const decompressedStream = new Response(decryptedBuf).body!.pipeThrough(ds);
                        jsonStr = await new Response(decompressedStream).text();
                    } else if (typeof Zlib !== "undefined" && Zlib.RawInflate) {
                        const inflater = new Zlib.RawInflate(new Uint8Array(decryptedBuf));
                        const decompressedBytes = inflater.decompress();
                        if (typeof TextDecoder !== "undefined") {
                            jsonStr = new TextDecoder().decode(decompressedBytes);
                        } else if (typeof Laya !== "undefined" && Laya.Byte) {
                            const lb = new Laya.Byte(decompressedBytes.buffer);
                            jsonStr = lb.readUTFBytes();
                        }
                    } else if (typeof TextDecoder !== "undefined") {
                        jsonStr = new TextDecoder().decode(decryptedBuf);
                    } else if (typeof Laya !== "undefined" && Laya.Byte) {
                        const lb = new Laya.Byte(decryptedBuf);
                        jsonStr = lb.readUTFBytes();
                    }
                } catch (decompressErr: any) {
                    console.warn(`[UIFactory] Failed to decompress Deflate payload: ${fullUrl}`, decompressErr);
                    return null;
                }

                try {
                    resultData = JSON.parse(jsonStr);
                } catch (jsonErr: any) {
                    console.warn(`[UIFactory] Failed to parse JSON content from decrypted bundle: ${fullUrl}`, jsonErr);
                    return null;
                }
            } else {
                const jsonOrData = await UIFactoryLoader.requestData(fullUrl, "json", options?.onProgress);
                if (!jsonOrData) {
                    console.warn(`[UIFactory] Layout JSON file is missing or empty: ${fullUrl}`);
                    return null;
                }
                resultData = typeof jsonOrData === "string" ? JSON.parse(jsonOrData) : jsonOrData;
            }
        } catch (err: any) {
            console.warn(`[UIFactory] loadBundle encountered an error: ${fullUrl}`, err);
            return null;
        }

        Laya.Loader.cacheRes(finalUrl, resultData);
        if (finalUrl !== bundleUrl) {
            Laya.Loader.cacheRes(bundleUrl, resultData);
        }

        if (resultData && typeof resultData === "object") {
            if ("layouts" in resultData && typeof resultData.layouts === "object") {
                UIFactory.registerBundle(resultData as IUILayoutBundle);
            } else {
                const normalizedFinal = finalUrl.replace(/\\/g, "/");
                const normalizedOrigin = bundleUrl.replace(/\\/g, "/");

                UIFactory.registerConfig(normalizedFinal, resultData as IElementConfig);
                if (normalizedOrigin !== normalizedFinal) {
                    UIFactory.registeredConfigs[normalizedOrigin] = resultData as IElementConfig;
                }
                if (resultData.name && !UIFactory.registeredConfigs[resultData.name]) {
                    UIFactory.registeredConfigs[resultData.name] = resultData as IElementConfig;
                }

                const missingDeps = UIFactoryLoader.extractMissingDependencies(resultData as IElementConfig);
                if (missingDeps.length > 0) {
                    await Promise.all(missingDeps.map(depUrl => UIFactoryLoader.loadBundle(depUrl, options)));
                }
            }
        }

        return resultData;
    }

    /**
     * 递归收集声明式配置中所有尚未载入内存的外部 src 组件依赖
     */
    public static extractMissingDependencies(
        config: IElementConfig,
        gathered: Set<string> = new Set<string>()
    ): string[] {
        if (!config || typeof config !== "object") return Array.from(gathered);

        if (config.src && !UIFactory.getConfig(config.src)) {
            gathered.add(config.src);
        }

        const anyConfig = config as Record<string, any>;
        if (Array.isArray(anyConfig.elements)) {
            for (const child of anyConfig.elements) {
                UIFactoryLoader.extractMissingDependencies(child, gathered);
            }
        }
        return Array.from(gathered);
    }
}
