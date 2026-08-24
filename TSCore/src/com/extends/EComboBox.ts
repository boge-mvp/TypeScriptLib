import {StringBlock} from "../block/StringBlock";
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";

export class EComboBox extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GComboBox) {

    /**
     * 是否根据选择数据改变 icon  text
     * @default true
     */
    isUpdateValue = true
    protected _updateValue = true

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}


    override set selectedIndex(val: number) {
        this._updateValue = this.isUpdateValue
        super.selectedIndex = val;
        this._updateValue = true
    }

    override set icon(value: string) {
        if (this._updateValue) super.icon = value;
    }

    override set text(value: string) {
        if (this._updateValue) super.text = value;
    }

}