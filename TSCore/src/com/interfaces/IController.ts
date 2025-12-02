import {IProxy} from "./ICommon";
import {IView} from "./IView";

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
