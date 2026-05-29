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
     * @property {string|string[]} globs - 文件匹配模式，可以是字符串或字符串数组
     * @property {SrcOptions} [opt] - gulp.src的选项配置对象
     */
    export interface GlobsConfig {
        /** 文件匹配模式，可以是字符串或字符串数组 */
        globs: string | string[];
        /** gulp.src的选项配置对象 */
        opt?: import("vinyl-fs").SrcOptions;
    }

    /**
     * @typedef BuildConfig
     * @property {GlobsConfig} src - 源文件配置
     * @property {string} outName - 输出文件的名称（不包含扩展名）
     * @property {string} dist - 输出目录路径
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
     * @property {(file:File)=>void} [onBeforeCodeCompile] - 代码编译前
     * @property {(file:File)=>void} [onAfterCodeCompile] - 代码编译后
     * @property {()=>void} [onBeforeFlush] - 代码处理结束前
     * @property {()=>void} [onAfterFlush] - 代码处理结束后
     */
    export interface JSPlugin {
        /** 代码编译前 */
        onBeforeCodeCompile?: (file: import("vinyl")) => void;
        /** 代码编译后 */
        onAfterCodeCompile?: (file: import("vinyl")) => void;
        /** 代码处理结束前 */
        onBeforeFlush?: () => void;
        /** 代码处理结束后 */
        onAfterFlush?: () => void;
    }

    /**
     * @typedef JSOptions
     * @property {boolean} [isMinify] 默认值: false - 是否压缩代码
     * @property {string} [namespace] 默认值: undefined - 命名空间名称
     * @property {JSPlugin[]} [plugs] 默认值: [] - JS插件数组
     * @property {InitOptions} [initMapsOpt] 默认值: undefined - map初始化
     * @property {string|WriteOptions} [writeMapsOpt] 默认值: undefined - map保存位置
     */
    export interface JSOptions {
        /** 默认值: false - 是否压缩代码 */
        isMinify?: boolean;
        /** 默认值: undefined - 命名空间名称 */
        namespace?: string;
        /** 默认值: [] - JS插件数组 */
        plugs?: JSPlugin[];
        /** 默认值: undefined - map初始化 */
        initMapsOpt?: import("gulp-sourcemaps").InitOptions;
        /** 默认值: undefined - map保存位置 */
        writeMapsOpt?: string | import("gulp-sourcemaps").WriteOptions;
    }

    /**
     * @typedef DTSOptions
     * @property {string[]} [globalDtsFile]
     * @property {string} [namespace] 默认值: undefined - 命名空间名称
     */
    export interface DTSOptions {
        globalDtsFile?: string[];
        /** 默认值: undefined - 命名空间名称 */
        namespace?: string;
    }

    /**
     * @typedef {Object} RollupOptions
     * @property {string} [outDir] - 输出目录路径
     * @property {string|false} [tsconfig="tsconfig.json"] - TypeScript 配置文件路径 当设置为 false 时，忽略配置文件中指定的任何选项。如果设置为与文件路径相对应的字符串，则指定的文件将用作配置文件。
     * @property {PartialCompilerOptions} [compilerOptions] - 将额外的编译器选项传递给插件
     * @property {string|false} [filterRoot="false"] - 设置编译的根目录
     * @property {boolean | 'inline' | 'hidden'} [sourcemap=false] - 是否生成 sourcemap 文件
     * @property {boolean|Options} [minify=false] - 是否压缩代码，若为对象则作为 terser 压缩配置
     * @property {InputPluginOption} [plugins=[]] - rollup 插件
     * @property {ReadonlyArray<string | RegExp> | string | RegExp | null} [include=undefined] - include 包括的文件 默认是 {,**\/*}.(cts|mts|ts|tsx)
     * @property {ReadonlyArray<string | RegExp> | string | RegExp | null} [exclude=undefined] - exclude 排除的文件
     */
    export interface RollupOptions {
        /** 输出目录路径 */
        outDir?: string;
        /** TypeScript 配置文件路径 当设置为 false 时，忽略配置文件中指定的任何选项。如果设置为与文件路径相对应的字符串，则指定的文件将用作配置文件。 */
        tsconfig?: string | false;
        /** 将额外的编译器选项传递给插件 */
        compilerOptions?: import("typescript").CompilerOptions;
        /** 设置编译的根目录 */
        filterRoot?: string | false;
        /** 是否生成 sourcemap 文件 */
        sourcemap?: boolean | 'inline' | 'hidden';
        /** 是否压缩代码，若为对象则作为 terser 压缩配置 */
        minify?: boolean | import("terser").MinifyOptions;
        /** rollup 插件 */
        plugins?: import("rollup").Plugin[];
        /** include 包括的文件 默认是 {,**\/*}.(cts|mts|ts|tsx) */
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
        //permission issue in Linux and macOS
        grant_permission(): void;

        //convert base64 to webp base64
        str2webpstr(base64str: string, image_type: string, option: string | number, extra_path?: string): Promise<string>;

        //convert buffer to webp buffer
        buffer2webpbuffer(buffer: Buffer, image_type: string, option: string | number, extra_path?: string): Promise<Buffer>;

        /**
         * now convert image to .webp format
         * @param input_image input image(.jpeg, .pnp ....)
         * @param output_image output image .webp
         * @param option options and quality,it should be given between 0 to 100
         * @param logging
         */
        cwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<string>;

        //now convert .webp to other image format
        dwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<string>;

        //now convert .gif image to .webp format
        gwebp(input_image: string, output_image: string, option: string | number, logging?: string): Promise<string>;

        //%%%%%%%%%%% Add ICC profile,XMP metadata and EXIF metadata
        webpmux_add(input_image: string, output_image: string, icc_profile: string, option: string, logging?: string): Promise<string>;

        //%%%%%%%%%%%%% Extract ICC profile,XMP metadata and EXIF metadata
        webpmux_extract(input_image: string, icc_profile: string, option: string, logging?: string): Promise<string>;

        //%%%%%%%% Strip ICC profile,XMP metadata and EXIF metadata
        webpmux_strip(input_image: string, output_image: string, option: string, logging?: string): Promise<string>;

        //%%%%%%%%%%% Create an animated WebP file from Webp images
        webpmux_animate(
            input_images: Array<{ path: string; offset: string }>,
            output_image: string,
            loop: number | string,
            bgcolor: string,
            logging?: string
        ): Promise<string>;

        //%%%%%%%%%%%% Get the a frame from an animated WebP file
        webpmux_getframe(input_image: string, output_image: string, frame_number: number | string, logging?: string): Promise<string>;
    }

    /** 导出的单例 Webp 转换工具实例 */
    export const webp: Webp;

    /**
     * 清理文件目录
     * @param patterns {string | string[]}
     * @return {Promise<string[]>}
     */
    export function clean(patterns: string | string[]): Promise<string[]>;

    /**
     * 合并默认配置与用户提供的配置
     *
     * 该函数用于将用户提供的参数与默认参数进行合并，生成最终的配置对象如果用户未提供某项配置，
     * 则使用默认配置如果用户配置了不支持的选项，并且设置了严格模式（croak为true），则抛出错误
     *
     * @param {Object|boolean} args - 用户提供的配置对象如果为true，则使用空对象作为配置
     * @param {Object} defs - 默认配置对象
     * @param {boolean} [croak=false] - 是否启用严格模式，如果启用，当遇到不支持的选项时抛出错误
     * @param {boolean} [append=false] - 是否在用户配置的基础上追加默认配置项，仅在用户配置和默认配置都存在该选项，且该选项为数组时有效
     * @returns {Object} - 合并后的配置对象
     */
    export function defaults<T = Record<string, unknown>>(
        args: Record<string, unknown> | boolean | null | undefined,
        defs: T,
        croak?: boolean,
        append?: boolean
    ): T;

    /**
     * 创建路径文件的所有目录
     * @param filePath
     */
    export function createDirectory(filePath: string): void;

    /**
     * 清理文件目录
     * @param patterns {string | string[]}
     * @param [end=null] {function(()=>{}):{}}
     */
    export function cleanStream(patterns: string | string[], end?: () => void): NodeJS.ReadWriteStream;

    /**
     * 压缩js
     * @param files {string[] | File}
     * @param [terserOpt=undefined] {MinifyOptions}
     * @param [initMapsOpt=undefined] {InitOptions} map初始化
     * @param [writeMapsOpt=undefined] {string|WriteOptions} map保存位置
     * @return {NodeJS.ReadWriteStream}
     */
    export function mJs(
        files: string[] | import("vinyl"),
        terserOpt?: import("terser").MinifyOptions,
        initMapsOpt?: import("gulp-sourcemaps").InitOptions,
        writeMapsOpt?: string | import("gulp-sourcemaps").WriteOptions
    ): NodeJS.ReadWriteStream;

    /** 全局的 GulpLog 日志记录器 */
    export const log: typeof import("gulplog");

    /**
     * 收集指定路径下的所有文件路径
     * @param url {string} 相对路径或绝对路径
     * @return {Promise<string[]>} 完整路径数据
     */
    export function findFiles(url: string): Promise<string[]>;

    /**
     * 收集指定路径下的所有文件路径
     * @param url {string} 相对路径或绝对路径
     * @return {string[]} 完整路径数据
     */
    export function findFilesSync(url: string): string[];

    /** 获取 AST 依赖元数据插件 */
    export function addMetadata(): import("typescript").TransformerFactory<import("typescript").SourceFile>;

    /** 创建名称空间转换器 */
    export function createNamespaceTransformer(): import("typescript").TransformerFactory<import("typescript").SourceFile>;

    /**
     * 构建库文件的主函数
     * @param config {BuildConfig} 构建配置对象
     * @param done {()=>void} - Gulp任务完成回调函数
     * @param [opt] { {js?:JSOptions, dts?:DTSOptions} } 可选配置
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
     * 构建JavaScript文件的函数
     * @param {GlobsConfig | gulpTs.CompileStream} tsResult - TypeScript编译流或是其生成需要的包含globs和opt的属性
     * @param {string} outName - 输出文件的名称（不包含扩展名）
     * @param {string} dist - 输出目录路径
     * @param {JSOptions | null} opt - 可选配置
     * @returns {Stream} 返回 gulp 流对象，用于链式操作
     */
    export function buildJs(
        tsResult: GlobsConfig | NodeJS.ReadWriteStream,
        outName: string,
        dist: string,
        opt?: JSOptions | null
    ): NodeJS.ReadWriteStream;

    /**
     * 构建 TypeScript 声明文件(.d.ts)
     * @param {GlobsConfig | gulpTs.CompileStream} tsResult - TypeScript编译流或是其生成需要的包含globs和opt的属性
     * @param {string} outName - 输出文件的名称（不包含扩展名）
     * @param {string} dist - 输出目录路径
     * @param {Array} globalFile - 需要追加的全局文件列表，默认为空数组
     * @param {string|null} namespace - 命名空间名称，默认为 null
     * @returns {Stream} 返回 gulp 流对象，用于链式操作
     */
    export function buildDts(
        tsResult: GlobsConfig | NodeJS.ReadWriteStream,
        outName: string,
        dist: string,
        globalFile?: string[],
        namespace?: string | null
    ): NodeJS.ReadWriteStream;

    /**
     * 使用 Rollup 打包指定的输入文件，并根据配置选项生成输出文件。
     *
     * @param {string} inputFile - 需要打包的入口文件路径
     * @param {string} outName - 输出模块的全局变量名（用于 IIFE 格式）
     * @param {RollupOptions?} options - 打包配置选项
     * @returns {Promise<NodeJS.ReadWriteStream>} 返回一个 Gulp 流，用于后续处理或写入文件
     */
    export function rollupPack(inputFile: string, outName: string, options?: RollupOptions | null): Promise<void>;

    /**
     * 类似于 gulp-rename 的 Rollup 插件
     * 可以修改输出文件的名称、目录 and 扩展名
     *
     * @param {string|{dirName?:string, basename?:string, filename?:string, extname?:string}|((fileParts:any, file:any, fileName:string)=>any)} renamer - 重命名规则
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
    export function rollupRename(
        renamer: string | RenameFileParts | ((fileParts: RenameFileParts, file: unknown, fileName: string) => RenameFileParts | void)
    ): import("rollup").Plugin;
}

declare module "game-lib" {
    export * from "@boge-mvp/game-lib";
}
