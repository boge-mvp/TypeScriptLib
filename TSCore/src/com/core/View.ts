import {IKey} from "../interfaces/ICommon";
import {StringBlock} from "../block/StringBlock";
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";
import {IView} from "../interfaces/IView";
import GComponent = fgui.GComponent;

export class View extends mixinExt(ActionEvent, StringBlock, ViewBlock, GComponent) implements IView, IKey {

    protected key: string

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

