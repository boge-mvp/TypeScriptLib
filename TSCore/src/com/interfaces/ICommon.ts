import {IAction} from "./IAction";

export enum Method {GET = "get", POST = "post"}


export interface IInitEngine {
    run(): void
}

export interface IFormatVer {

    /**
     * 调用自定义的方法
     * @param url 原始请求地址
     * @param version 从版本控制中获取的版本号 可能为空
     * @return 返回处理后的版本号
     */
    call(url: string, version): string

}

export interface IKey {

    /**
     * 设置标识
     * @param key
     */
    setKey(key: string)

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
    removeView<T extends IView & IKey>(key: string | T)

    /**
     * 获取一个值
     * @param key 键
     * @return 值
     */
    getView<T>(key: string | { new(): T }): T

}

export interface IProxy extends IAction {

    getProxy<T>(key: string | { new(): T }): T

    removeProxy<T extends IProxy & IKey>(key: string | T)

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean

}

export interface IController extends IView, IProxy {

    /** 清除所有UI缓存 */
    clearView()

    /** 清除所有分组和包含的事件 */
    clearGroup()

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
