import {App} from "../App";

/**
 * 只有 getProxy 和 getView
 */
export class ViewProxy {

    getProxy<T>(name: string | { new(): T }): T {
        return App.inst.getProxy(name)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

}