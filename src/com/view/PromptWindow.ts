import GTextField = fgui.GTextField;
import GButton = fgui.GButton;
import Controller = fgui.Controller;
import UIPackage = fgui.UIPackage;
import {BaseWindow} from "../core/BaseWindow"
import {ActionLib} from "../actions/ActionLib"
import {AppRecordManager} from "../manager/AppRecordManager"
import {LibStr} from "../LibStr"
import {StringUtil} from "../utils/StringUtil"

/** 提示框 */
export class PromptWindow extends BaseWindow {

    private static _instance: PromptWindow

    static get inst(): PromptWindow {
        if (PromptWindow._instance == null) PromptWindow._instance = new PromptWindow()
        return PromptWindow._instance
    }

    private content: GTextField
    private callback: ParamHandler
    /** 确定取消 */
    private cancelBtn: GButton
    /** 确定 */
    private continueBtn: GButton
    /** 提示框的击中类型 */
    private controller: Controller
    private continueFun: ParamHandler
    /** 缓存的提示框 */
    private cacheMessage: {
        msg: string,
        obj?: IPromptData,
        callback?: ParamHandler,
        continue?: ParamHandler,
        isAction?: boolean
    }[] = []

    constructor() {
        super()
        this.modal = true
        if (PromptWindow._instance == null) PromptWindow._instance = this
        this.regAction(ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW, this, this.showCancelTip)
        this.regAction(ActionLib.GAME_SHOW_PROMPT_WINDOW, this, this.showTip)
        this.regAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, this, this._showWindow)
    }

    protected onInit() {
        this.contentPane = UIPackage.createObjectFromURL("//common/PromptWindow").asCom

        super.onInit()
        this.content = this.contentPane.getChild("n2").asTextField
        this.cancelBtn = this.contentPane.getChild("n3").asButton
        this.continueBtn = this.contentPane.getChild("n4").asButton

        this.cancelBtn.getTextField().bold = true
        this.continueBtn.getTextField().bold = true

        this.controller = this.contentPane.getController("c1")

        this.cancelBtn.onClick(this, this.cancelHandler)
        this.continueBtn.onClick(this, this.continueHandler)

    }

    private continueHandler() {
        if (this.continueFun !== null) this.callback = null
        if (this.parent) AppRecordManager.backHistory()
    }

    private cancelHandler() {
        this.continueFun = null
        if (this.parent) AppRecordManager.backHistory()
    }

    protected onHide() {
        super.onHide()
        Laya.timer.callLater(this, this.endCallHandler)
    }

    /** 结束回调 */
    endCallHandler() {
        runFun(this.continueFun)
        runFun(this.callback)
        this.callback = null
        this.continueFun = null
        if (this.cacheMessage.length > 0) {
            let arr = this.cacheMessage.shift()
            this._showWindow.apply(this, arr)
        }
    }

    /** 清理缓存 */
    clearCache() {
        this.cacheMessage.splice(0, this.cacheMessage.length)
        if (this.parent) this.hideImmediately()
    }

    /**
     * 带确认按钮的提示框
     * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
     * @param callback 确定回调方法
     * @param isAction 动画显示或关闭
     *
     * @deprecated
     * @see LibStr
     * @see ActionLib.GAME_SHOW_PROMPT_WINDOW
     */
    showTip(msg: string | number | any[], callback?: ParamHandler, isAction = true) {
        this._showWindow(msg, {cancelName: this.getString(LibStr.OK)}, callback, null, isAction)
    }

    /**
     * 带确认 取消按钮的提示框
     * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
     * @param obj 附带设置 (okName:'', cancelName:'')
     * @param callback 取消回调方法
     * @param continueFun 确定回调方法
     * @param isAction 动画显示或关闭
     * @deprecated
     * @see LibStr
     * @see ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW
     */
    showCancelTip(msg: string | number | any[], obj?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction = true) {
        if (obj) {
            if (StringUtil.isEmpty(obj.okName)) {
                obj.okName = getString(LibStr.CONTINUE)
            }
            if (StringUtil.isEmpty(obj.cancelName)) {
                obj.cancelName = getString(LibStr.CANCEL)
            }
        } else {
            obj = {okName: getString(LibStr.CONTINUE), cancelName: getString(LibStr.CANCEL)}
        }
        this._showWindow(msg, obj, callback, continueFun, isAction)
    }

    private _showWindow(msg: string | number | any[], obj?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction = true) {
        if (Array.isArray(msg)) {
            msg = this.getString.apply(null, msg) as string
        } else {
            msg = this.getString(msg)
        }
        if (this.parent != null) {
            this.cacheMessage.push({msg: msg, obj: obj, callback: callback, continue: continueFun, isAction: isAction})
            return
        }
        this.isAction = isAction
        this.show()
        obj?.okName && (this.continueBtn.text = obj.okName)
        obj?.cancelName && (this.cancelBtn.text = obj.cancelName)
        this.controller.selectedIndex = continueFun == null ? 0 : 1
        this.content.text = msg
        this.callback = callback
        this.continueFun = continueFun
    }

    dispose() {
        this.clearCache()
        Laya.timer.clearAll(this)
        PromptWindow._instance = null
        super.dispose()
    }

}

