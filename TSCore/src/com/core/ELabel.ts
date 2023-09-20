import GLabel = fgui.GLabel;
import {ActionEvent, ViewBlock} from "../block/Block"

export class ELabel extends mixinExt(ViewBlock, ActionEvent, GLabel) {

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}

}