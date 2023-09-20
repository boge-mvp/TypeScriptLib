import {ActionEvent, StringBlock, ViewBlock} from "../block/Block"

export class EButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GButton) {

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}

}