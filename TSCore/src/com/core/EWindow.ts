import Point = Laya.Point;
import Ease = Laya.Ease;
import Tween = Laya.Tween;
import GRoot = fgui.GRoot;
import Handler = Laya.Handler;
import {HistoryManager} from "../manager/HistoryManager"
import {ActionEvent, StringBlock, ViewProxy} from "../block/Block"
import {IRecord} from "../interfaces/ICommon";
import {App} from "../App";

export class EWindow extends mixinExt(StringBlock, ViewProxy, ActionEvent, fgui.Window) implements IRecord {

    /** 动画显示或关闭 */
    protected isAction = true
    /** 是否加入后退记录 */
    joinRecord = true
    /** 动画起始点 */
    startPoint: Point

    protected override onInit() {
        let scale = App.inst.getEqualRatioScale()
        this.contentPane.setSize(this.width * scale, this.height * scale)
        this.setSize(this.contentPane.width, this.contentPane.height)
        if (this.isAction) {
            this.setPivot(0.5, 0.5)
        }
    }

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

    override getTransition(transName: string): fgui.Transition {
        return this.contentPane?.getTransition(transName) || super.getTransition(transName)
    }

    override getTransitionAt(index: number): fgui.Transition {
        return this.contentPane?.getTransitionAt(index) || super.getTransitionAt(index)
    }

    override getController(name: string): fgui.Controller {
        return this.contentPane?.getController(name) || super.getController(name)
    }

    override getControllerAt(index: number): fgui.Controller {
        return this.contentPane?.getControllerAt(index) || super.getControllerAt(index)
    }

    protected updateSizePoint() {
        this.center()
    }

    protected override doHideAnimation() {
        this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        if (this.isAction) {
            let tempX = this.x
            let tempY = this.y
            if (this.startPoint) {
                tempX = this.startPoint.x - this.contentPane.width / 2
                tempY = this.startPoint.y - this.contentPane.height / 2
            }
            Tween.to(this, {
                scaleX: 0.3,
                scaleY: 0.3,
                x: tempX,
                y: tempY
            }, 400, Ease.backIn, Handler.create(this, this.hideImmediately))
        } else {
            this.hideImmediately()
        }
    }

    protected override doShowAnimation() {
        this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        this.displayObject.stage.on(Laya.Event.RESIZE, this, this.updateSizePoint)
        this.touchable = true
        if (this.joinRecord) HistoryManager.addHistory(null, this)
        this.updateSizePoint()
        if (this.isAction) {
            this.setScale(.3, .3)
            let tempX = this.x
            let tempY = this.y
            if (this.startPoint) {
                this.setXY(this.startPoint.x - this.contentPane.width / 2, this.startPoint.y - this.contentPane.height / 2)
            }
            Tween.to(this, {scaleX: 1, scaleY: 1, x: tempX, y: tempY}, 400, Ease.backOut,
                Handler.create(this, this.onShown))
        } else {
            this.onShown()
        }
    }

    protected override closeEventHandler() {
        if (this.parent) {
            if (this.joinRecord) {
                HistoryManager.backHistory()
            } else {
                this.hideRecord()
            }
        }
    }

    protected override onHide() {
        HistoryManager.invalidHistory(this)
    }

    hideRecord() {
        this.touchable = false
        GRoot.inst.closeModalWait()
        this.hide()
    }

    showRecord() {

    }

    override dispose() {
        this.parent = null
        HistoryManager.invalidHistory(this)
        Tween.clearAll(this)
        this.displayObject?.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        if (!this.displayObject?.destroyed) super.dispose()
    }

}