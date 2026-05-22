import {IKey} from "../interfaces/ICommon";
import {StringBlock} from "../block/StringBlock";
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";
import GComponent = fgui.GComponent;
import GObject = fgui.GObject;
import {IView} from "../interfaces/IView";

export class View extends mixinExt(ActionEvent, StringBlock, ViewBlock, GComponent) implements IView, IKey {

    protected key: string

    /**
     * 获取子组件
     * @param name 传入子组件多种命名方式
     * @deprecated
     * @see getChildByNames
     */
    override getChild<T = GObject>(...name: string[]): T {
        return this.getChildByNames(...name)
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

