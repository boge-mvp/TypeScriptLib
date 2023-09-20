import {App} from "../App"
import {ActionEvent, StringBlock} from "../block/Block"
import {IKey, IView} from "../interfaces/ICommon";

export class View extends mixinExt(ActionEvent, StringBlock, fgui.GComponent) implements IView, IKey {

    protected key: string


    /**
     * 获取子组件
     * @param name 传入子组件多种命名方式
     */
    override getChild(...name: string[]): fgui.GObject {
        let child = null
        for (const key of name) {
            child = super.getChild(key)
            if (child) return child
        }
        return child
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
        return App.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        App.inst.removeView(key)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return App.inst.getProxy(key)
    }

    setKey(key: string) {
        this.key = key
    }

    getKey(): string {
        return this.key
    }

    override dispose() {
        this.removeView(this.key)
        this.removeTargetAll(this)
        if (!this.isDisposed)
            super.dispose()
    }

}

