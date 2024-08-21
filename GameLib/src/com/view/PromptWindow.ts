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

    protected static _instance: PromptWindow

    static get inst() {
        PromptWindow._instance ??= new PromptWindow()
        return PromptWindow._instance
    }

    protected titleText?: fgui.GTextField
    protected content?: GTextField
    /** 确定取消 */
    protected cancelBtn?: GButton
    protected closeBtn?: GButton
    /** 确定 */
    protected continueBtn?: GButton
    /** 提示框的击中类型 */
    protected buttonController: Controller
    /** 标题显示控制器 */
    protected titleDisplayController: fgui.Controller
    /**
     * 关闭按钮显示控制器
     */
    protected closeButtonDisplayController: fgui.Controller
    protected closeFun: ParamHandler
    protected continueFun: ParamHandler
    protected callback: ParamHandler
    /** 缓存的提示框 */
    protected cacheMessage: PromptData[] = []

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
        this.buttonController = this.getController("c1")
        this.titleDisplayController = this.getController("c2")
        this.closeButtonDisplayController = this.getController("c3")

        this.closeBtn?.onClick(this, this.closeHandler)
        this.cancelBtn?.onClick(this, this.cancelHandler)
        this.continueBtn?.onClick(this, this.continueHandler)

    }

    protected continueHandler() {
        this.callback = null
        this.closeFun = null
        if (this.parent) AppRecordManager.backHistory()
    }

    protected closeHandler() {
        this.continueFun = null
        this.callback = null
        if (this.parent) AppRecordManager.backHistory()
    }

    protected cancelHandler() {
        this.closeFun = null
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
        runFun(this.closeFun)
        this.callback = this.continueFun = this.closeFun = null
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
     * @param options 附带设置 (okName:'', cancelName:'')
     * @param callback 取消回调方法
     * @param continueFun 确定回调方法
     * @param isAction 动画显示或关闭
     * @see LibStr
     * @see ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW
     */
    showCancelTip(msg: string | number | any[], options?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction = true) {
        this._show({msg: msg, obj: options, callback: callback, continue: continueFun, isAction: isAction})
    }

    protected _showWindow(msg: string | number | any[] | PromptData, options?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction = true) {
        if (!this.isPromptData(msg)) msg = {
            msg: msg,
            obj: options,
            callback: callback,
            continue: continueFun,
            isAction: isAction
        }
        this._show(msg)
    }

    protected _show(data: PromptData) {
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
        this.setControllers(data)
        this.content.text = msg
        if (this.titleText) this.titleText.text = data.title || ""
        this.callback = data.callback
        this.continueFun = data.continue
        this.closeFun = data.close
    }

    protected setControllers(data: PromptData) {
        if (this.buttonController) this.buttonController.selectedIndex = data.continue ? 1 : 0
        if (this.titleDisplayController) this.titleDisplayController.selectedIndex = data.title ? 1 : 0
        if (this.closeButtonDisplayController) this.closeButtonDisplayController.selectedIndex = data.close ? 1 : 0
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

