import Controller = fgui.Controller
import GButton = fgui.GButton
import GTextField = fgui.GTextField
import UIPackage = fgui.UIPackage
import {AppRecordManager} from "../manager/AppRecordManager"
import {LibStr} from "../LibStr"
import {BaseGameData} from "../core/BaseGameData";
import {BaseWindow} from "../core/BaseWindow";

/** 提示框 */
export class HomePrompt<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance: HomePrompt
    static get instance() {
        this._instance ??= new HomePrompt
        return this._instance
    }

    /** 当前显示面板控制器 */
    private controller: Controller
    /** ok按钮 */
    private okBtn: GButton
    /** 取消 */
    private cancelBtn: GButton
    /** 显示的内容 */
    private message: GTextField

    private callback: Function
    private cancelCallback: Function


    constructor() {
        super()
        this.modal = true
        this.isAction = false
    }

    protected override onInit() {

        this.contentPane = UIPackage.createObjectFromURL("//init/HomePrompt").asCom

        this.controller = this.contentPane.getController("c1")

        this.okBtn = this.contentPane.getChild("n15").asButton
        this.cancelBtn = this.contentPane.getChild("n16").asButton

        this.message = this.contentPane.getChild("message").asTextField

        this.cancelBtn.onClick(this, this.cancelHandler)
        this.okBtn.onClick(this, this.okHandler)

        super.onInit()

    }

    private cancelHandler() {
        if (this.parent) AppRecordManager.backHistory()
        if (this.cancelCallback) this.cancelCallback()
        this.cancelCallback = null
    }

    private okHandler() {
        if (this.parent) AppRecordManager.backHistory()
        if (this.callback) this.callback()
        this.callback = null
    }

    protected override onShown() {
//			AppRecordManager.addHistory(null, this)
    }

    /**
     * 显示提示框
     * @param code 0 公告提示框 1两个选择按钮提示
     * @param content 显示内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
     * @param callback 确定调用函数
     * @param cancelCallback 取消调用函数
     * @param obj 附带设置 (okName:'', cancelName:'')
     *
     */
    showTip(code: number, content: string | number | any[], callback: Function = null, cancelCallback: Function = null, obj: any = null) {
        this.offClick(this, AppRecordManager.backHistory)
        this.callback = callback
        this.cancelCallback = cancelCallback

        if (Array.isArray(content)) {
            content = getString.apply(null, content) as string
        } else {
            content = getString(content)
        }

        this.show()
        this.center()
        this.controller.selectedIndex = code
        if (obj?.okName) {
            this.okBtn.text = obj.okName
        } else {
            if (code == 0) {
                this.okBtn.text = getString(LibStr.OK)
            } else if (code == 1) {
                this.okBtn.text = getString(LibStr.RESEND)
            }
        }
        if (obj?.cancelName) {
            this.cancelBtn.text = obj.cancelName
        } else {
            this.cancelBtn.text = getString(LibStr.CANCEL)
        }
        this.message.text = content
    }

    override hideRecord() {
        this.hide()
    }

}