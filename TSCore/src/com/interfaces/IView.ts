import {IAction} from "./IAction";
import {IKey} from "./ICommon";

export interface IView extends IAction {

    /**
     * 添加视图对象到缓存
     * @param key 键值或类构造函数
     * @param view 视图对象
     * @returns 是否添加成功
     */
    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean

    /**
     * 从缓存中移除视图对象
     * @param key 键值或类构造函数
     */
    removeView<T extends IView & IKey>(key: string | T): void

    /**
     * 获取视图对象
     * @param key 键值或类构造函数
     * @returns 视图对象
     */
    getView<T>(key: string | { new(): T }): T | Nullish

}