import {ActionEvent, StringBlock, ViewBlock} from "../block/Block"
import {IKey, IView} from "../interfaces/ICommon";

export class View extends mixinExt(ActionEvent, StringBlock, ViewBlock, fgui.GComponent) implements IView, IKey {

    protected key: string

    /**
     * 获取子组件
     * @param name 传入子组件多种命名方式
     */
    override getChild<T = fgui.GObject>(...name: string[]): T {
        let child = null
        for (const key of name) {
            child = super.getChild(key)
            if (child) return child
        }
        return child
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

