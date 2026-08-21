import {App} from "../App";

/**
 * 只有 getProxy 和 getView
 */
export class ViewProxy {

    getProxy<T>(name?: string | { new(): T }): Nullable<T> {
        return App.inst.getProxy(name)
    }

    getView<T>(key?: string | { new(): T }): Nullable<T> {
        return App.inst.getView(key)
    }

}