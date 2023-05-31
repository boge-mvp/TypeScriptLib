import {ActionEvent, Factory} from "../Factory"
import {IKey, IView} from "../interfaces/ICommon";

export class View extends mixinExt(ActionEvent, fgui.GComponent) implements IView, IKey {

    protected key: string

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
        return Factory.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        Factory.inst.removeView(key)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return Factory.inst.getProxy(key)
    }

    setKey(key: string) {
        this.key = key
    }

    getKey(): string {
        return this.key
    }

    dispose() {
        this.removeView(this.key)
        this.removeTargetAll(this)
        if (!this.isDisposed)
            super.dispose()
    }

}

