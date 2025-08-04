import {IKey, IProxy} from "../interfaces/ICommon";
import {App} from "../App";

export class ProxyBlock {

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean {
        return App.inst.addProxy(key, proxy)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return App.inst.getProxy(key)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        App.inst.removeProxy(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

}