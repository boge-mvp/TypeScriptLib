import GLabel = fgui.GLabel;
import {ViewBlock} from "../block/ViewBlock";
import {ActionEvent} from "../block/ActionEvent";

export class ELabel extends mixinExt(ViewBlock, ActionEvent, GLabel) {

    protected override onConstruct() {
        super.onConstruct();
        this.onInit()
    }

    protected onInit() {}

}