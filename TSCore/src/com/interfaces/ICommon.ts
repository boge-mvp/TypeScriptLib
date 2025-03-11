import {IAction} from "./IAction";

export enum Method {GET = "get", POST = "post"}

/**
 * 初始化引擎接口
 * @example
 * App._init()
 * init?.run?.()
 *
 * Laya.init()
 * Laya.stage.addChild(fgui.GRoot.inst.displayObject)
 * init?.onEngine?.()
 * openResize()
 * App.initEngine?.onEnd?.()
 */
export interface IFormatPath {

    /**
     * 格式化路径
     * @param url 格式化后的路径
     */
    path?(url: string): string

    /**
     * 调用自定义的方法
     * @param url 原始请求地址
     * @param version 从版本控制中获取的版本号 可能为空
     * @return 返回处理后的版本号
     */
    version?(url: string, version: string | number): string | number

    /**
     * 调用自定义的方法
     * @param url 原始请求地址
     * @param version 从版本控制中获取的版本号 可能为空
     * @return 返回处理后的版本号
     * @deprecated
     * @see IFormatPath.version
     */
    call?(url: string, version: string | number): string | number

    /** 值越大 越后执行 默认:100 */
    order?: number

}

export interface IKey {

    /**
     * 设置标识
     * @param key
     */
    setKey(key: string): void

    /**
     * 获取当前的key值
     */
    getKey(): string

}

export interface IView extends IAction {

    /**
     * 添加一个view对象到缓存
     * @param key 键
     * @param view 值
     * @return 如果存在键 不会再存入
     */
    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean

    /**
     * 删除一个键值对
     * @param key 键
     */
    removeView<T extends IView & IKey>(key: string | T): void

    /**
     * 获取一个值
     * @param key 键
     * @return 值
     */
    getView<T>(key: string | { new(): T }): T

}

export interface IProxy extends IAction {

    getProxy<T>(key: string | { new(): T }): T

    removeProxy<T extends IProxy & IKey>(key: string | T): void

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean

}

export interface IController extends IView, IProxy {
    /**
     * 向缓存中添加一个bean实例
     *
     * @param {string | { new(): T }} key - bean的唯一标识符，可以是字符串或构造函数
     * @param {T} bean - 要添加的bean实例
     * @param {boolean} saveClassName
     * @returns {boolean} - 添加成功返回true，否则返回false
     */
    addBean<T>(key: string | { new(): T }, bean: T, saveClassName?: boolean): boolean

    /**
     * 从缓存中移除一个bean实例
     *
     * @param {string | T} key - 要移除的bean的唯一标识符，可以是字符串或构造函数
     */
    removeBean<T extends { new(...args: any[]) }>(key: string | T): void

    /**
     * 从缓存中获取一个bean实例
     *
     * @param {string | { new(): T }} key - 要获取的bean的唯一标识符，可以是字符串或构造函数
     * @returns {T} - 返回对应的bean实例，如果找不到则返回undefined
     */
    getBean<T>(key: string | { new(): T }): T

    /**
     * 检查指定的键是否存在于缓存中
     *
     * 此函数用于确定某个特定的键是否已经被缓存它支持传入一个字符串作为键，
     * 或者传入一个类的构造函数通过构造函数，它能够获取到类的标志（signature）作为键进行查询
     *
     * @param key {string | { new(): T }} - 要检查的键，可以是字符串，也可以是类的构造函数
     * @returns {boolean} - 如果键存在缓存中，则返回true；否则返回false
     */
    hasBean<T>(key: string | { new(): T }): boolean

    /** 清除所有UI缓存 */
    clearView(): void

    /** 清除所有分组和包含的事件 */
    clearGroup(): void

}

export interface IRecord {

    /**
     * 显示当前界面
     */
    showRecord(): void

    /**
     * 隐藏当前界面
     */
    hideRecord(): void

}
