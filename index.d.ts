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

    /**
     * @typedef GlobsConfig
     */
    export interface GlobsConfig {
        /** 文件匹配模式，可以是字符串或字符串数组 */
        globs: string | string[];
        /** gulp.src 的选项配置对象 */
        opt?: {
            buffer?: boolean;
            read?: boolean;
            since?: Date | number;
            removeBOM?: boolean;
            allowEmpty?: boolean;
            base?: string;
            cwdbase?: boolean;
            [key: string]: any;
        };
    }

    /**
     * @typedef BuildConfig
     */
    export interface BuildConfig {
        /** 源文件配置 */
        src: GlobsConfig;
        /** 输出文件的名称（不包含扩展名） */
        outName: string;
        /** 输出目录路径 */
        dist: string;
    }

    /**
     * @typedef JSPlugin
     */
    export interface JSPlugin {
        /** 代码编译前回调 */
        onBeforeCodeCompile?: (file: any) => void;
        /** 代码编译后回调 */
        onAfterCodeCompile?: (file: any) => void;
        /** 代码处理结束前回调 */
        onBeforeFlush?: () => void;
        /** 代码处理结束后回调 */
        onAfterFlush?: () => void;
    }

    /** Terser 压缩参数配置 */
    export interface MinifyOptions {
        ecma?: any;
        parse?: any;
        compress?: boolean | any;
        mangle?: boolean | any;
        format?: any;
        sourceMap?: any;
        toplevel?: boolean;
        nameCache?: any;
        ie8?: boolean;
        keep_classnames?: boolean | RegExp;
        keep_fnames?: boolean | RegExp;
        safari10?: boolean;
    }

    /** Sourcemap 初始化选项 */
    export interface InitOptions {
        loadMaps?: boolean;
        identityMap?: boolean;
        [key: string]: any;
    }

    /** Sourcemap 写入参数 */
    export interface WriteOptions {
        addComment?: boolean;
        includeContent?: boolean;
        sourceRoot?: string | Function;
        sourceMappingURLPrefix?: string | Function;
        sourceMappingURL?: string | Function;
        mapFile?: string | Function;
        destPath?: string;
        [key: string]: any;
    }

    /**
     * @typedef JSOptions
     */
    export interface JSOptions {
        /** 是否压缩代码，默认值: false */
        isMinify?: boolean;
        /** 命名空间名称，默认值: undefined */
        namespace?: string;
        /** JS插件数组，默认值: [] */
        plugs?: JSPlugin[];
        /** map 初始化配置，默认值: undefined */
        initMapsOpt?: InitOptions;
        /** map 保存位置，默认值: undefined */
        writeMapsOpt?: string | WriteOptions;
    }

    /**
     * @typedef DTSOptions
     */
    export interface DTSOptions {
        /** 需要追加的全局文件列表，默认为空数组 */
        globalDtsFile?: string[];
        /** 命名空间名称，默认值: undefined */
        namespace?: string;
    }

    /**
     * @typedef {Object} RollupOptions
     */
    export interface RollupOptions {
        /** 输出目录路径 */
        outDir?: string;
        /** TypeScript 配置文件路径，默认值: "tsconfig.json"。当设置为 false 时，忽略配置文件中指定的任何选项。如果设置为与文件路径相对应的字符串，则指定的文件将用作配置文件。 */
        tsconfig?: string | false;
        /** 将额外的编译器选项传递给插件 (例如 PartialCompilerOptions) */
        compilerOptions?: any;
        /** 设置编译的根目录，默认值为 "false" */
        filterRoot?: string | false;
        /** 是否生成 sourcemap 文件，默认值为 false */
        sourcemap?: boolean | 'inline' | 'hidden';
        /** 是否压缩代码，若为对象则作为 terser 压缩配置，默认值为 false */
        minify?: boolean | MinifyOptions;
        /** rollup 插件列表，默认值为 [] */
        plugins?: any[];
        /** include 包括的文件，默认是 {,**\/*}.(cts|mts|ts|tsx) */
        include?: ReadonlyArray<string | RegExp> | string | RegExp | null;
        /** exclude 排除的文件 */
        exclude?: ReadonlyArray<string | RegExp> | string | RegExp | null;
    }

    /** Rollup 插件重命名时的路径分块信息 */
    export interface RenameFileParts {
        /** 目录路径 */
        dirname?: string;
        /** 完整文件名 (如 name.js) */
        basename?: string;
        /** 扩展名 (如 .js) */
        extname?: string;
        /** 纯文件名，不含扩展名 */
        filename?: string;
    }

    /** Webp 格式转换接口定义 */
    export interface Webp {
        /** 授予 cwebp/dwebp 等执行程序在 Linux 和 macOS 下的执行权限 (chmod 755) */
        grant_permission(): void;

        /** 将 base64 图像转换为 webp 格式的 base64 */
        str2webpstr(base64str: string, image_type: string, option: string | number, extra_path?: string): Promise<string>;

        /** 将 Buffer 图像转换为 webp 格式的 Buffer */
        buffer2webpbuffer(buffer: any, image_type: string, option: string | number, extra_path?: string): Promise<any>;

        /**
         * 将常规图片转换为 webp 格式
         * @param input_image 输入图片路径（如 .jpg, .png 等）
         * @param output_image 输出的 .webp 图片路径
         * @param option 转换选项或质量 (0-100)
         * @param logging 日志参数，默认值为 '-quiet'
         */
        cwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<any>;

        /** 将 .webp 转换为其他格式的图片 */
        dwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<any>;

        /** 将 .gif 图片转换为 .webp 格式 */
        gwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<any>;

        /** 添加 ICC profile、XMP 元数据和 EXIF 元数据 */
        webpmux_add(input_image: string, output_image: string, icc_profile: string, option: string, logging?: string): Promise<any>;

        /** 提取 ICC profile、XMP 元数据和 EXIF 元数据 */
        webpmux_extract(input_image: string, icc_profile: string, option: string, logging?: string): Promise<any>;

        /** 剥离 ICC profile、XMP 元数据和 EXIF 元数据 */
        webpmux_strip(input_image: string, output_image: string, option: string, logging?: string): Promise<any>;

        /**
         * 将多张 webp 图片合成动态 WebP
         * @param input_images 图片信息数组，每个成员为 { path: string, offset: string }
         * @param output_image 导出的动画 webp 路径
         * @param loop 循环次数
         * @param bgcolor 画布背景颜色
         * @param logging 日志参数
         */
        webpmux_animate(
            input_images: Array<{ path: string; offset: string }>,
            output_image: string,
            loop: number | string,
            bgcolor: string,
            logging?: string
        ): Promise<any>;

        /** 从动画 WebP 中提取某一帧 */
        webpmux_getframe(input_image: string, output_image: string, frame_number: number | string, logging?: string): Promise<any>;
    }

    /** 导出的单例 Webp 转换工具实例 */
    export const webp: Webp;

    /**
     * 清理文件目录
     * @param patterns 匹配路径模式，可以是字符串 or 字符串数组
     * @returns 返回清理后的路径 Promise 数组
     */
    export function clean(patterns: string | string[]): Promise<string[]>;

    /**
     * 合并默认配置与用户提供的配置
     *
     * 该函数用于将用户提供的参数与默认参数进行合并，生成最终的配置对象。如果用户未提供某项配置，
     * 则使用默认配置。如果用户配置了不支持的选项，并且设置了严格模式（croak为true），则抛出错误。
     *
     * @param args 用户提供的配置对象。如果为 true，则使用空对象作为配置
     * @param defs 默认配置对象
     * @param croak 是否启用严格模式，如果启用，当遇到不支持的选项时抛出错误，默认值为 false
     * @param append 是否在用户配置的基础上追加默认配置项，仅在用户配置和默认配置都存在该选项，且该选项为数组时有效，默认值为 false
     * @returns 合并后的配置对象
     */
    export function defaults(args: any, defs: any, croak?: boolean, append?: boolean): any;

    /**
     * 创建路径文件的所有目录
     * @param filePath 绝对或相对文件路径
     */
    export function createDirectory(filePath: string): void;

    /**
     * 清理文件目录（Stream 形式）
     * @param patterns 匹配路径模式
     * @param end 结束时的回调函数
     */
    export function cleanStream(patterns: string | string[], end?: Function): any;

    /**
     * 压缩 JS
     * @param files 需要压缩的文件路径数组或 Gulp 原始流
     * @param terserOpt Terser 压缩参数配置 (MinifyOptions)
     * @param initMapsOpt map 初始化选项 (InitOptions)
     * @param writeMapsOpt map 保存位置 (WriteOptions)
     */
    export function mJs(
        files: string[] | any,
        terserOpt?: MinifyOptions,
        initMapsOpt?: InitOptions,
        writeMapsOpt?: string | WriteOptions
    ): any;

    /** 全局的 GulpLog 日志记录器 */
    export const log: any;

    /**
     * 异步收集指定路径下的所有文件路径
     * @param url 相对路径或绝对路径
     * @returns 收集到的完整路径数据 Promise
     */
    export function findFiles(url: string): Promise<string[]>;

    /**
     * 同步收集指定路径下的所有文件路径
     * @param url 相对路径 or 绝对路径
     * @returns 收集到的完整路径数据数组
     */
    export function findFilesSync(url: string): string[];

    /** 获取 AST 依赖元数据插件 */
    export function addMetadata(): any;

    /** 创建名称空间转换器 */
    export function createNamespaceTransformer(): any;

    /**
     * 构建库文件的主函数
     * @param config 构建配置对象
     * @param done Gulp 任务完成回调函数
     * @param opt 可选配置项，定义了 JS 编译及 DTS 编译的各类详细控制属性
     */
    export function buildLibrary(
        config: BuildConfig,
        done: () => void,
        opt?: {
            js?: JSOptions;
            dts?: DTSOptions;
        }
    ): void;

    /**
     * 构建 JavaScript 文件的函数
     * @param tsResult TypeScript 编译流 or 其生成的属性
     * @param outName 输出文件的名称（不包含扩展名）
     * @param dist 输出目录路径
     * @param opt 可选配置项
     * @returns 返回 gulp 流对象，用于链式操作
     */
    export function buildJs(tsResult: GlobsConfig | any, outName: string, dist: string, opt?: JSOptions | null): any;

    /**
     * 构建 TypeScript 声明文件(.d.ts)
     * @param tsResult TypeScript 编译流 or 其生成的属性
     * @param outName 输出文件的名称（不包含扩展名）
     * @param dist 输出目录路径
     * @param globalFile 需要追加的全局文件列表，默认为空数组
     * @param namespace 命名空间名称，默认为 null
     * @returns 返回 gulp 流对象，用于链式操作
     */
    export function buildDts(
        tsResult: GlobsConfig | any,
        outName: string,
        dist: string,
        globalFile?: string[],
        namespace?: string | null
    ): any;

    /**
     * 使用 Rollup 打包指定的输入文件，并根据配置选项生成输出文件。
     *
     * @param inputFile 需要打包的入口文件路径
     * @param outName 输出模块的全局变量名（用于 IIFE 格式）
     * @param options 打包配置选项
     * @returns 返回一个 Promise，解析为 Gulp 流对象
     */
    export function rollupPack(inputFile: string, outName: string, options?: RollupOptions | null): Promise<any>;

    /**
     * 类似于 gulp-rename 的 Rollup 插件，可以修改输出文件的名称、目录和扩展名。
     * @param renamer 重命名规则：
     *   - string: 直接替换整个文件名。
     *   - object: 指定文件路径的各个部分：
     *     - dirname: 新的目录名
     *     - basename: 完整文件名 (包含扩展名)
     *     - filename: 文件名 (不包含扩展名)
     *     - extname: 扩展名
     *   - function: 动态计算新文件名的函数，接收 (fileParts, file, fileName) 参数并返回新的部分文件信息对象。
     * @returns 返回一个 Rollup 插件对象。
     */
    export function rollupRename(
        renamer: string | RenameFileParts | ((fileParts: RenameFileParts, file: any, fileName: string) => RenameFileParts | void)
    ): any;
}

declare module "game-lib" {
    export * from "@boge-mvp/game-lib";
}
