import {IAction} from "./IAction";

export enum Method {GET = "get", POST = "post"}

export interface IKey {

    /**
     * 设置标识
     * @param key
     */
    setKey(key: string): void

    /**
     * 获取当前的key值
     */
    getKey(): Nullable<string>

}

export interface IProxy extends IAction {


    /**
     * 获取代理对象
     * @param name 键值或类构造函数
     * @returns 代理对象
     */
    getProxy<T>(name?: string | { new(): T } | Nullish): Nullable<T>

    /**
     * 从缓存中移除代理对象
     * @param key 键值或类构造函数
     */
    removeProxy<T extends IProxy & IKey>(key?: string | T | Nullish): void

    /**
     * 添加代理对象到缓存
     * @param key 键值或类构造函数
     * @param proxy 代理对象
     * @returns 是否添加成功
     */
    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean

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
