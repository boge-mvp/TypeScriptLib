import GComponent = fgui.GComponent
import UIObjectFactory = fgui.UIObjectFactory
import UIPackage = fgui.UIPackage
import GImage = fgui.GImage
import GRoot = fgui.GRoot
import RelationType = fgui.RelationType
import GGraph = fgui.GGraph

/** 加载 */
export class WaitResult extends GComponent {

    private static _instance: WaitResult

    static get inst() {
        if (!this._instance) {
            UIObjectFactory.setPackageItemExtension("//gameCommon/WaitResult", WaitResult)
            this._instance = UIPackage.createObjectFromURL("//gameCommon/WaitResult") as WaitResult
        }
        return this._instance
    }

    private img: GImage
    private graph: GGraph

    protected override constructFromXML(xml: any): void {
        super.constructFromXML(xml)
        this.addRelation(GRoot.inst, RelationType.Size)
        this.setSize(GRoot.inst.width, GRoot.inst.height)

        this.img = this.getChild("n0").asImage
        this.graph = this.getChild("n1").asGraph

    }

    show(): void {
        this.graph.visible = this.img.visible = false
        GRoot.inst.addChild(this)
        Laya.timer.once(1000, this, this.showContent)
    }

    private showContent(): void {
        this.graph.visible = this.img.visible = true
    }

    hide(): void {
        Laya.timer.clear(this, this.showContent)
        this.removeFromParent()
    }

}

