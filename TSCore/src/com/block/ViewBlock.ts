import {App} from "../App";
import {IKey} from "../interfaces/ICommon";
import {IView} from "../interfaces/IView";

export class ViewBlock {

    getProxy<T>(name: string | { new(): T }): T {
        return App.inst.getProxy(name)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean {
        return App.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        App.inst.removeView(key)
    }

}