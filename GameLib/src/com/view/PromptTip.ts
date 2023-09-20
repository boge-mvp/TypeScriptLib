import GComponent = fgui.GComponent
import UIPackage = fgui.UIPackage
import Point = Laya.Point
import GRoot = fgui.GRoot
import {LibStr} from "../LibStr"
import {SceneManager} from "../manager/SceneManager"
import ELabel = tsCore.ELabel;

/** 文案提示 */
export class PromptTip extends ELabel {

    private target: GComponent
    private downward: any

    protected override onInit() {
        super.onInit();
        this.touchable = false
        this.text = getString(LibStr.CASH_GIFTS_AVAILABLE)
    }

    static createPromptTip(): PromptTip {
        return UIPackage.createObjectFromURL("//gameCommon/PromptTip", PromptTip) as PromptTip
    }

    /**
     * 显示提示文本
     * @param comp 绑定显示按钮位置
     * @param downward 是否在下面
     */
    show(comp: GComponent, downward = null) {
        if (parent) return
        this.target = comp
        this.downward = downward

//        this.getController("c1").selectedIndex = downward ? 1 : 0
        // 延迟到下次刷新显示
        Laya.timer.callLater(this, this.showViewHandler)
    }

    private showViewHandler() {
        let starter = SceneManager.inst.starter
        if (starter) {
            starter.baseScene?.addChild(this)
            this.updatePoint()
            Laya.timer.clearAll(this)
            Laya.timer.once(3000, this, this.hide)
        }
    }

    hide() {
        this.removeFromParent()
    }

    private updatePoint() {
        let pos: Point
        let sizeW = 0, sizeH = 0
        let maxWidth: number
        let maxHeight: number
        if (SceneManager.inst.starter && SceneManager.inst.starter.baseScene) {
            maxWidth = SceneManager.inst.starter.baseScene.width
            maxHeight = SceneManager.inst.starter.baseScene.height
        } else {
            maxWidth = GRoot.inst.width
            maxHeight = GRoot.inst.height
        }
        if (this.target) {
            pos = this.target.localToGlobal()
            sizeW = this.target.width
            sizeH = this.target.height
            this.parent.globalToLocal(pos.x, pos.y, pos)
        } else {
            pos = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY)
        }
        let xx: number, yy: number
        xx = pos.x
        // 判断是否超出边界
        let overstepBorder = xx + (sizeW / 2) + this.width > maxWidth
        if (overstepBorder) {
            xx = xx + (sizeW / 2) - this.width
        } else {
            xx = xx + (sizeW / 2)
        }
        yy = pos.y + sizeH
        if ((!this.downward && yy + sizeH + this.height > maxHeight) || this.downward == false) {
            // 在目标的上面
            yy = pos.y - this.height - 1
            if (yy < 0) {
                yy = 0
                xx += sizeW / 2
            }
            if (overstepBorder) {
                this.getController("c1").selectedIndex = 0
            } else {
                this.getController("c1").selectedIndex = 2
            }
        } else {
            // 在目标的下面
            if (overstepBorder) {
                this.getController("c1").selectedIndex = 1
            } else {
                this.getController("c1").selectedIndex = 3
            }
        }

        this.x = xx
        this.y = yy
    }

    override dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

}
