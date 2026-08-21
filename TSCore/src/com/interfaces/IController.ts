import {IProxy} from "./ICommon";
import {IView} from "./IView";

export interface IController extends IView, IProxy {

    /**
     * 添加Bean对象到缓存
     * @param key 键值或类构造函数
     * @param bean Bean对象
     * @param saveClassName 是否保存类名映射
     * @returns {boolean} 是否添加成功
     */
    addBean<T extends object>(key: string | { new(): T }, bean: T, saveClassName?: boolean): boolean

    /**
     * 从缓存中移除Bean对象
     * @param key 键值或类构造函数
     */
    removeBean<T extends { new(...args: any[]): object }>(key: string | T): void

    /**
     * 获取Bean对象
     * @param key 键值或类构造函数
     * @returns Bean对象
     */
    getBean<T>(key: string | { new(): T }): T | Nullish

    /**
     * 检查是否包含指定的Bean对象
     * @param key 键值或类构造函数
     * @returns 是否包含
     */
    hasBean<T>(key: string | { new(): T }): boolean

    /**
     * 清空视图缓存
     */
    clearView(): void

    /**
     * 清空事件分组
     */
    clearGroup(): void

}
