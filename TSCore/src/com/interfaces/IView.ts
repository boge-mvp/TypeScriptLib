import {IAction} from "./IAction";
import {IKey} from "./ICommon";

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