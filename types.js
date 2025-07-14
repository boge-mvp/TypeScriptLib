/**
 * @typedef {Object} Resource 加载资源配置
 * @property {string} url - 资源的 URL。
 * @property {string|"image"|"arraybuffer"|"spine"|"sound"} type - 资源的类型。
 * @property {string|"png"|"atlas"} ignoreSuffix - 忽略的后缀名。
 * @property {boolean} forceLoad - 是否强制加载资源。
 * @property {boolean} runLoad - 运行时加载。
 * @property {string[]} branch - 渠道资源解析。
 */

/**
 * @typedef {Object} ProjectConfig 项目属性配置
 * @property {Resource[]} res - 需要加载的资源数组。
 * @property {string[]} couponHelp - 优惠帮助资源路径。
 * @property {string} js - 项目的js名字。
 * @property {string[]} libs 要加载的额外库
 * @property {number[][] | any[][]} odds - 项目中的赔率配置。
 * @property {function} completeFun - 执行启动函数。
 * @property {any} startClass - 启动类 会使用runApplication启动这个类并创建相应的bean。
 * @property {string|string[]} guide - 引导图片资源路径。
 * @property {string|string[]} helpRes - 帮助文档资源路径。
 */