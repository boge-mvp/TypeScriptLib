import GLabel = fgui.GLabel;
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";

export class ELabel extends mixinExt(ViewBlock, ActionEvent, GLabel) {

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}

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

}