import GTextField = fgui.GTextField;
import LocalStorage = Laya.LocalStorage;
import Browser = Laya.Browser;
import Events = fgui.Events;
import Tween = Laya.Tween;
import {ActionLib} from "../actions/ActionLib"
import {Player} from "../Player"
import {LibStr} from "../LibStr"
import {SceneManager} from "../manager/SceneManager"
import EButton = tsCore.EButton;
import StringUtil = tsCore.StringUtil;
import DateUtils = tsCore.DateUtils;

export class ActivityButton extends EButton {

    private tempValue = 0
    private clickInvalid: boolean
    callback: ParamHandler
    private contentText: GTextField
    /** 当没有优惠卷使用的时候 是否自动隐藏 */
    isAutoHide = true
    /** 自定义更新文字显示 */
    updateText: ParamHandler

    protected override constructFromXML(xml: any) {
        super.constructFromXML(xml)
        this.draggable = false

        if (this.getChild("n10")) {
            this.contentText = this.getChild("n10").asTextField
        } else {
            this.contentText = this._titleObject.asTextField
        }
        this.on(Laya.Event.ADDED, this, this.addedHandler)
        this.onClick(this, this.clickHandler)

        this.regGameAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE, this, this.updateShow)
        this.regGameAction(ActionLib.GAME_USE_ACTIVITY, this, this.useActivityHandler)
        this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.stopUseActivityHandler)
        this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.stopUseActivityHandler)

    }

    private stopUseActivityHandler() {
        this.getController("c1").selectedIndex = 0
    }

    private useActivityHandler() {
        let useActivity = Player.inst.getUseCoupon()
        if (useActivity) {
            this.sendAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE)
            this.getController("c1").selectedIndex = 1
        }
    }

    private updateShow() {
        let useActivity = Player.inst.getUseCoupon()
        if (this.updateText) {
            runFun(this.updateText, useActivity)
            return
        }
        if (useActivity) {
            this.text = Player.inst.getCurrencyUnit() + " " + useActivity.faceValue
        } else {
            this.text = ""
        }
    }

    /**
     * 设置角标
     * @param value 剩余数量
     */
    setCorner(value: number) {
        this.tempValue = value
        if (value > 0) {
            this.contentText.text = getString(LibStr.USE_IN_GIFT, value)
        } else {
            this.contentText.text = getString(LibStr.NOT_GIFT)
        }
        if (this.isAutoHide) this.visible = value > 0
    }

    private clickHandler() {
        if (!this.clickInvalid) {
            runFun(this.callback)
            // 判断是否是今天第一次打开  如果是 弹出帮助文档
            let giftOpenTimerStr = LocalStorage.getItem("action_help" + Player.inst.gameModel)
            let giftOpenTimer: number
            giftOpenTimerStr ??= "0"
            giftOpenTimer = parseFloat(giftOpenTimerStr)
            if (!DateUtils.isSameDay(giftOpenTimer, Browser.now())) {
                this.sendAction(ActionLib.GAME_ACTIVITY_HELP_WINDOW_SHOW)
                LocalStorage.setItem("action_help" + Player.inst.gameModel, Browser.now() + "")
            }
        }
        this.clickInvalid = false
    }

    private addedHandler() {
    }

    /** 打开拖动 */
    openDrag() {
        this.draggable = true
        this.off(Events.DRAG_START, this, this.onDragStart)
        this.off(Events.DRAG_END, this, this.onDragEnd)
        this.on(Events.DRAG_START, this, this.onDragStart)
        this.on(Events.DRAG_END, this, this.onDragEnd)
        let arr: number[] = LocalStorage.getJSON("activity_" + Player.inst.gameModel)
        if (arr) {
            this.setXY(arr[0], arr[1])
        }
        this.onDragEnd()
        this.clickInvalid = false
    }

    private onDragEnd() {
        this.clickInvalid = true
        let tempX = this.x
        let tempY = this.y
        if (this.x > (this.parent.width >> 1)) {
            tempX = this.parent.width - this.x - this.width
            if (this.y > (this.parent.height >> 1)) {
                tempX = this.parent.width - this.x - this.width
                tempY = this.parent.height - this.y - this.height
                if (tempX < tempY) {
                    tempX = this.parent.width - this.width
                    tempY = this.y
                } else {
                    tempY = this.parent.height - this.height
                    tempX = this.x
                }
            } else {
                if (this.y < this.parent.width - this.x - this.width) {
                    tempY = 0
                    tempX = this.x
                } else {
                    tempY = this.y
                    tempX = this.parent.width - this.width
                }
            }
        } else {
            if (this.y > (this.parent.height >> 1)) {
                if (this.x < this.parent.height - this.y - this.height) {
                    tempX = 0
                    tempY = this.y
                } else {
                    tempX = this.x
                    tempY = this.parent.height - this.height
                }
            } else {
                if (this.x < this.y) {
                    tempX = 0
                    tempY = this.y
                } else {
                    tempY = 0
                    tempX = this.x
                }
            }
        }
        Tween.to(this, {x: tempX, y: tempY}, 300)
        LocalStorage.setJSON("activity_" + Player.inst.gameModel, [tempX, tempY])
    }

    private onDragStart() {
        if (SceneManager.inst.starter.baseScene.promptTip)
            SceneManager.inst.starter.baseScene.promptTip.hide()
    }

}
