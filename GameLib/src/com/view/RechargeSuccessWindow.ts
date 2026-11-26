import GTextField = fgui.GTextField;
import GButton = fgui.GButton;
import GRoot = fgui.GRoot;
import Log = tsCore.Log;
import {BaseWindow} from "../core/BaseWindow"
import {AppRecordManager} from "../manager/AppRecordManager"
import {BaseGameData} from "../core/BaseGameData";

/** 提示框 */
export class RechargeSuccessWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance?: RechargeSuccessWindow

    static get inst() {
        RechargeSuccessWindow._instance ??= new RechargeSuccessWindow()
        return RechargeSuccessWindow._instance
    }

    static CREATE_FUI_URL: Nullable<string> = null

    private static checkCreateUrl(): boolean {
        if (!RechargeSuccessWindow.CREATE_FUI_URL) {
            Log.warn("[RechargeSuccessWindow] CREATE_FUI_URL is null, cannot create view.")
            return false
        }
        return true
    }

    override show() {
        if (!RechargeSuccessWindow.checkCreateUrl()) return
        super.show()
    }

    override showOn(root: GRoot) {
        if (!RechargeSuccessWindow.checkCreateUrl()) return
        super.showOn(root)
    }

    private content?: GTextField
    private callback?: ParamHandler
    /** 确定 */
    private continueBtn?: GButton
    /** 缓存的提示框 */
    private cacheMessage: any[] = []

    static show(msg: string,
                callback?: ParamHandler,
                isAction?: boolean) {
        this.inst.showTip(msg, callback, isAction)
    }

    static hide() {
        this._instance?.hide()
    }

    constructor() {
        super()
        this.modal = true
    }

    protected override onInit() {
        if (!RechargeSuccessWindow.checkCreateUrl()) return
        this.contentPane = createView(RechargeSuccessWindow.CREATE_FUI_URL!)
        if (!this.contentPane) return
        super.onInit()
        this.content = this.contentPane.getChild("n2")?.asTextField
        this.closeButton = this.contentPane.getChild("n3")!
        this.continueBtn = this.contentPane.getChild("n4")?.asButton

        this.continueBtn?.onClick(this, this.continueHandler)

    }

    private continueHandler() {
        if (this.parent) AppRecordManager.backHistory()
    }

    protected override onHide() {
        super.onHide()
        Laya.timer.callLater(this, this.endCallHandler)
    }

    /** 结束回调 */
    endCallHandler() {
        runFun(this.callback)
        this.callback = undefined
        if (this.cacheMessage.length > 0) {
            let arr = this.cacheMessage.shift()
            this.showTip.apply(this, arr)
        }
    }

    /** 清理缓存 */
    clearCache() {
        this.cacheMessage.splice(0, this.cacheMessage.length)
        if (this.parent) this.hideImmediately()
    }

    protected override doShowAnimation() {
        super.doShowAnimation()
    }

    /**
     * 带确认按钮的提示框
     * @param msg
     * @param callback
     * @param isAction
     */
    showTip(msg: string, callback?: ParamHandler, isAction = true) {
        if (this.parent) {
            this.cacheMessage.push([msg, callback, isAction])
            return
        }
        this.isAction = isAction
        this.show()
        if (!this.contentPane) return
        if (this.content) this.content.text = msg
        this.callback = callback
    }

    override dispose() {
        this.clearCache()
        Laya.timer.clearAll(this)
        RechargeSuccessWindow._instance = undefined
        super.dispose()
    }

}