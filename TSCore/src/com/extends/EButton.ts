import {StringBlock} from "../block/StringBlock";
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";

export class EButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GButton) {

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}

}