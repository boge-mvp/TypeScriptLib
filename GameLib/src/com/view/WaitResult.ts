import GComponent = fgui.GComponent;
import GImage = fgui.GImage;
import GRoot = fgui.GRoot;
import RelationType = fgui.RelationType;
import GGraph = fgui.GGraph;

/** 加载 */
export class WaitResult extends GComponent {

    private static _instance: WaitResult
    static get inst() {
        this._instance ??= createView(this.CREATE_FUI_URL, WaitResult)
        return this._instance
    }
    static CREATE_FUI_URL = "//gameCommon/WaitResult"
    static defaultDelay = 1000

    private img!: GImage
    private graph!: GGraph

    static show(delay = WaitResult.defaultDelay) {
        this.inst.show(delay)
    }

    static hide() {
        this._instance?.hide()
    }


    protected override onConstruct() {
        super.onConstruct();
        this.addRelation(GRoot.inst, RelationType.Size)
        this.setSize(GRoot.inst.width, GRoot.inst.height)

        this.img = this.getChild("n0")!
        this.graph = this.getChild("n1")!

    }

    show(delay = WaitResult.defaultDelay) {
        this.graph.visible = this.img.visible = false
        GRoot.inst.addChild(this)
        Laya.timer.once(delay, this, this.showContent)
    }

    private showContent() {
        this.graph.visible = this.img.visible = true
    }

    hide() {
        Laya.timer.clear(this, this.showContent)
        this.removeFromParent()
    }

}

