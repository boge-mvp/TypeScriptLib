import UIPackage = fgui.UIPackage
import GLoader = fgui.GLoader
import GTextField = fgui.GTextField
import Controller = fgui.Controller
import GRoot = fgui.GRoot
import {BaseView} from "../core/BaseView"
import {LibStr} from "../LibStr"
import {AppRecordManager} from "../manager/AppRecordManager"
import {JSUtils} from "../utils/JSUtils"
import HistoryManager = tsCore.HistoryManager;

/** 加载界面 */
export class LoadingWindow extends BaseView {

    private static _instance: LoadingWindow

    static get inst(): LoadingWindow {
        this._instance ??= UIPackage.createObjectFromURL("//init/LoadingWindow", LoadingWindow) as LoadingWindow
        return this._instance
    }

    private headText: string
    private loader: GLoader
    private mesText: GTextField
    /** 当前进度 */
    private tempValue = 0
    private dian: number

    private controller: Controller

    protected override onInit() {

        this.controller = this.getController("c1")

        this.loader = this.getChild("n0").asLoader
        this.mesText = this.getChild("n1").asTextField

        // this.visible = false
    }

    /**
     * 显示
     * @param index 显示的形式
     * @param headText 使用头文本
     *
     */
    show(index = 0, headText?: string) {
        headText ??= getString(LibStr.LOADING).split(".").join("")
        HistoryManager.pauseHistory = true
        this.headText = headText
        this.controller.selectedIndex = index
        this.mesText.text = ""
//		loaderUrl("init_atlas_evpb2.jpg")
        Laya.timer.clear(this, this.changeHandler)
        Laya.timer.loop(500, this, this.changeHandler)
        GRoot.inst.addChild(this)
    }

    private changeHandler() {
        this.mesText.text = this.getMsg() + this.tempValue + "%"
        this.dian++
        if (this.dian > 3) {
            this.dian = 0
        }
    }

    /**
     * 更新进度
     * @param value 当前模块进度值
     * @param tempCount 当前加载进度模块 1 开始
     * @param totalCount 总共要加载的模块数
     */
    updateMsg(value: number, tempCount = 1, totalCount = 1) {
//			trace("LoadingWindow.updateMsg(vlaue)", value+"%")
        this.tempValue = LoadingWindow.getProgress(value, tempCount, totalCount)
        JSUtils.getProgress(this.tempValue)
        this.mesText.text = this.getMsg() + this.tempValue + "%"
    }

    /**
     * 更新进度
     * @param value 当前模块进度值
     * @param tempCount 当前加载进度模块 1 开始
     * @param totalCount 总共要加载的模块数
     */
    static getProgress(value: number, tempCount = 1, totalCount = 1) {
        // 先算出每一份 占用的百分比份量
        let pieces: number = 100 / totalCount
        // 得出当前加载所占百分比的数量
        let pro: number = value / 100 * pieces
        let totalPro: number = pieces * (tempCount - 1) + pro
        let finalTotalPro: number = Math.ceil(totalPro)
        return finalTotalPro
    }

    /**
     * 显示加载错误提示
     * @param value
     *
     */
    showError(value: string) {
        Laya.timer.clear(this, this.changeHandler)
        this.mesText.text = value
    }

    private getMsg() {
        let str: string = this.headText
        for (let i: number = 0; i < 3; i++) {
            if (i < this.dian) {
                str += "."
            } else {
                str += " "
            }
        }
        return str
    }

    /** 替换加载图片 */
    loaderUrl(url: string) {
        this.loader.url = url
    }

    hide() {
        HistoryManager.pauseHistory = false
        Laya.timer.clear(this, this.changeHandler)
        this.removeFromParent()
    }

}