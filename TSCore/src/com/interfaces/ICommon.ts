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
    getKey(): string

}

export interface IProxy extends IAction {

    getProxy<T>(key: string | { new(): T }): T

    removeProxy<T extends IProxy & IKey>(key: string | T): void

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
