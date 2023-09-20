import GComponent = fgui.GComponent
import GTextField = fgui.GTextField
import GRoot = fgui.GRoot
import RelationType = fgui.RelationType
import {LibStr} from "../LibStr"
import LanguageUtils = tsCore.LanguageUtils;

export class GlobalWaiting extends GComponent {

    /** 显示内容 */
    private messageText: GTextField

    protected override constructFromXML(xml: any) {
        super.constructFromXML(xml)
        this.addRelation(GRoot.inst, RelationType.Size)
        this.onInit()
        this.setSize(GRoot.inst.width, GRoot.inst.height)
    }

    private onInit() {
        // this.getChild("n0")
        // this.getChild("n1").asMovieClip
        this.messageText = this.getChild("n2").asTextField
    }

    override set text(value: string) {
        value ??= LanguageUtils.inst.getStr(LibStr.LOADING)
        this.messageText.text = value
    }

}