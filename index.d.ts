/// <reference path="./bin/LayaAir.d.ts" />
/// <reference path="./bin/fairygui.d.ts" />
/// <reference path="./bin/cannon.d.ts" />
/// <reference path="./bin/cryptojs.d.ts" />
/// <reference path="./bin/ga.d.ts" />
/// <reference path="./bin/rawinflate.d.ts" />
/// <reference path="./bin/reflect.d.ts" />
/// <reference path="./bin/spine-core-3.8.d.ts" />
/// <reference path="./bin/tsCore.d.ts" />
/// <reference path="./bin/gameLib.d.ts" />

declare module "@boge-mvp/game-lib" {
    /** 压缩 JS 的 Terser 配置项定义 */
    export interface TerserMinifyOptions {
        mangle?: boolean | any;
        compress?: boolean | any;
        format?: any;
        [key: string]: any;
    }

    /** Sourcemaps 初始化配置项定义 */
    export interface SourcemapsInitOptions {
        loadMaps?: boolean;
        [key: string]: any;
    }

    /** Sourcemaps 写入配置项定义 */
    export interface SourcemapsWriteOptions {
        includeContent?: boolean;
        destPath?: string;
        [key: string]: any;
    }

    /** 构建配置 */
    export interface BuildConfig {
        src: {
            globs: string | string[];
            opt?: any;
        };
        outName: string;
        dist: string;
    }

    export const webp: {
        toWebp(src: string, dist: string, options?: any): Promise<void>;
        [key: string]: any;
    };

    /** 清理文件目录 */
    export function clean(patterns: string | string[]): Promise<string[]>;

    /** 合并默认配置与用户提供的配置 */
    export function defaults(args: any, defs: any, croak?: boolean, append?: boolean): any;

    /** 创建路径文件的所有目录 */
    export function createDirectory(filePath: string): void;

    /** 清理文件目录（Stream 形式） */
    export function cleanStream(patterns: string | string[], end?: Function): any;

    /** 压缩 JS */
    export function mJs(
        files: string[] | any,
        terserOpt?: TerserMinifyOptions,
        initMapsOpt?: SourcemapsInitOptions,
        writeMapsOpt?: string | SourcemapsWriteOptions
    ): any;

    export const log: any;

    /** 异步收集指定路径下的所有文件路径 */
    export function findFiles(url: string): Promise<string[]>;

    /** 同步收集指定路径下的所有文件路径 */
    export function findFilesSync(url: string): string[];

    /** 获取 AST 依赖元数据插件 */
    export function addMetadata(): any;

    /** 创建名称空间转换器 */
    export function createNamespaceTransformer(): any;

    /** 
     * 构建库主函数 
     * @param config 构建配置对象
     * @param done Gulp任务完成回调
     * @param opt 可选的 JS 压缩和 DTS 参数
     */
    export function buildLibrary(
        config: BuildConfig,
        done: () => void,
        opt?: {
            js?: {
                isMinify?: boolean;
                namespace?: string;
                plugs?: any[];
            };
            dts?: {
                globalDtsFile?: any;
                namespace?: any;
            };
        }
    ): void;

    /** 构建 JavaScript 文件的函数 */
    export function buildJs(tsResult: any, outName: string, dist: string, opt?: any): any;

    /** 构建声明文件的函数 */
    export function buildDts(tsResult: any, outName: string, dist: string, globalDtsFile?: any, namespace?: any): any;

    /** 
     * 使用 Rollup 打包库 
     * @param inputFile 入口 TS 文件路径
     * @param outName 输出包名
     * @param options 打包配置项
     */
    export function rollupPack(inputFile: string, outName: string, options?: any): Promise<void>;

    /** Rollup 重命名插件 */
    export function rollupRename(callback: Function): any;
}

// ------------------------------------------
// 兼容别名安装导入：使 require('game-lib') 完美获取全部类型
// ------------------------------------------
declare module "game-lib" {
    export * from "@boge-mvp/game-lib";
}
