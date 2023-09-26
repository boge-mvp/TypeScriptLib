import {ActionEvent, StringBlock, ViewBlock} from "../block/Block"

export class EButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GButton) {

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