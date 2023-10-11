import GTextField = fgui.GTextField;
import GButton = fgui.GButton;
import Controller = fgui.Controller;
import UIPackage = fgui.UIPackage;
import {BaseWindow} from "../core/BaseWindow"
import {ActionLib} from "../ActionLib"
import {AppRecordManager} from "../manager/AppRecordManager"
import {LibStr} from "../LibStr"
import {BaseGameData} from "../core/BaseGameData";

/** 提示框 */
export class PromptWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance: PromptWindow

    static get inst() {
        PromptWindow._instance ??= new PromptWindow()
        return PromptWindow._instance
    }

    private titleText?: fgui.GTextField
    private content?: GTextField
    /** 确定取消 */
    private cancelBtn?: GButton
    private closeBtn?: GButton
    /** 确定 */
    private continueBtn?: GButton
    /** 提示框的击中类型 */
    private controller: Controller
    private controller2: fgui.Controller
    private controller3: fgui.Controller
    private continueFun: ParamHandler
    private callback: ParamHandler
    /** 缓存的提示框 */
    private cacheMessage: PromptData[] = []

    constructor() {
        super()
        this.modal = true
        PromptWindow._instance ??= this
        this.regAction(ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW, this, this.showCancelTip)
        this.regAction(ActionLib.GAME_SHOW_PROMPT_WINDOW, this, this.showTip)
        this.regAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, this, this._showWindow)
    }

    protected override onInit() {
        this.contentPane = UIPackage.createObjectFromURL("//common/PromptWindow").asCom
        super.onInit()

        this.content = this.getChild("content")?.asTextField
        this.titleText = this.getChild("titleText")?.asTextField

        this.continueBtn = this.getChild("continue")?.asButton
        this.cancelBtn = this.getChild("cancel")?.asButton
        this.closeBtn = this.getChild("close")?.asButton

        // this.cancelBtn.getTextField().bold = true
        // this.continueBtn.getTextField().bold = true

        this.controller = this.getController("c1")
        this.controller2 = this.getController("c2")
        this.controller3 = this.getController("c3")

        this.closeBtn?.onClick(this, this.cancelHandler)
        this.cancelBtn?.onClick(this, this.cancelHandler)
        this.continueBtn?.onClick(this, this.continueHandler)

    }

    private continueHandler() {
        if (this.continueFun) this.callback = null
        if (this.parent) AppRecordManager.backHistory()
    }

    private cancelHandler() {
        this.continueFun = null
        if (this.parent) AppRecordManager.backHistory()
    }

    protected override onHide() {
        super.onHide()
        Laya.timer.callLater(this, this.endCallHandler)
    }

    /** 结束回调 */
    endCallHandler() {
        runFun(this.continueFun)
        runFun(this.callback)
        this.callback = this.continueFun = null
        if (this.cacheMessage.length > 0) {
            let arr = this.cacheMessage.shift()
            this._showWindow(arr.msg, arr.obj, arr.callback, arr.continue, arr.isAction)
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
    showTip(msg: string | number | any[] | PromptData, callback?: ParamHandler, isAction = true) {
        if (!this.isPromptData(msg)) msg = {
            msg: msg,
            callback: callback,
            obj: {cancelName: getString(LibStr.OK)},
            isAction: isAction
        }
        this._show(msg)
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
        this._show({msg: msg, obj: obj, callback: callback, continue: continueFun, isAction: isAction})
    }

    private _showWindow(msg: string | number | any[] | PromptData, obj?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction = true) {
        if (!this.isPromptData(msg)) msg = {
            msg: msg,
            obj: obj,
            callback: callback,
            continue: continueFun,
            isAction: isAction
        }
        this._show(msg)
    }

    private _show(data: PromptData) {
        let msg = data.msg
        if (Array.isArray(msg)) {
            msg = getString.apply(null, msg) as string
        } else {
            msg = getString(msg)
        }
        if (this.parent) {
            this.cacheMessage.push(data)
            return
        }

        // if (msg === CommonCmd.RECHARGE) {
        //     AnalyticsManager.sendGameAnalysis("NoBalance_Pop")
        // }

        let obj = data.obj
        obj ??= {okName: getString(LibStr.CONTINUE), cancelName: getString(LibStr.CANCEL)}
        obj.okName ??= getString(LibStr.CONTINUE)
        obj.cancelName ??= getString(LibStr.CANCEL)

        this.isAction = data.isAction || true
        this.show()
        if (this.continueBtn) this.continueBtn.text = obj.okName
        if (this.cancelBtn) this.cancelBtn.text = obj.cancelName
        if (this.controller) this.controller.selectedIndex = data.continue ? 1 : 0
        if (this.controller2) this.controller2.selectedIndex = data.title ? 1 : 0
        if (this.controller3) this.controller3.selectedIndex = data.continue ? 1 : 0

        this.content.text = msg
        if (this.titleText) this.titleText.text = data.title || ""
        this.callback = data.callback
        this.continueFun = data.continue
    }

    override dispose() {
        this.clearCache()
        Laya.timer.clearAll(this)
        PromptWindow._instance = null
        super.dispose()
    }

    /**
     * 判断是否是接口 用 prototype 是否存在判断
     * @param optional
     */
    isPromptData(optional: any): optional is PromptData {
        return typeof optional === "object" && ("msg" in optional)
    }

}

