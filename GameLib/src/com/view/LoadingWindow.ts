import UIPackage = fgui.UIPackage;
import GLoader = fgui.GLoader;
import GTextField = fgui.GTextField;
import Controller = fgui.Controller;
import GRoot = fgui.GRoot;
import HistoryManager = tsCore.HistoryManager;
import {BaseView} from "../core/BaseView"
import {LibStr} from "../LibStr"
import {JSUtils} from "../utils/JSUtils"

/** 加载界面 */
export class LoadingWindow extends BaseView {

    private static _instance: LoadingWindow
    /**
     * 用来判断是否已经初始化一次了
     */
    static isInit = false

    static get inst() {
        if (this._instance == null && !this.isInit) {
            this._instance = UIPackage.createObjectFromURL("//init/LoadingWindow", LoadingWindow) as LoadingWindow
            this.isInit = true
        }
        return this._instance
    }

    static hide() {
        this.inst?.hide()
    }

    static show(index?: number, headText?: string) {
        this.inst?.show(index, headText)
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
     * 显示加载页
     * @param index 显示的形式
     * @param headText 使用头文本
     *
     */
    show(index = 0, headText?: string) {
        HistoryManager.pauseHistory = true
        this.changeView(index, headText)
        this.setSize(GRoot.inst.width, GRoot.inst.height)
        GRoot.inst.addChild(this)
    }

    /**
     * 切换显示状态
     * @param index 显示的形式
     * @param headText 使用头文本
     */
    changeView(index = 0, headText?: string) {
        headText ??= getString(LibStr.LOADING).split(".").join("")
        this.headText = headText
        this.controller.selectedIndex = index
        this.mesText.text = ""
//		loaderUrl("init_atlas_evpb2.jpg")
        Laya.timer.clear(this, this.changeHandler)
        Laya.timer.loop(500, this, this.changeHandler)
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
    static updateMsg(value: number, tempCount = 1, totalCount = 1) {
//			trace("LoadingWindow.updateMsg(vlaue)", value+"%")
        const temp = LoadingWindow.getProgress(value, tempCount, totalCount)
        if (this._instance) {
            this._instance.tempValue = temp
            this._instance.mesText.text = this._instance.getMsg() + temp.toFixed(2) + "%"
        }
        JSUtils.getProgress(temp)
    }

    /**
     * 更新进度
     * @param value 当前模块进度值
     * @param tempCount 当前加载进度模块 1 开始
     * @param totalCount 总共要加载的模块数
     */
    static getProgress(value: number, tempCount = 1, totalCount = 1) {
        // 先算出每一份 占用的百分比份量
        let pieces = 100 / totalCount
        // 得出当前加载所占百分比的数量
        let pro = value / 100 * pieces
        return pieces * (tempCount - 1) + pro
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
        let str = this.headText
        for (let i = 0; i < 3; i++) {
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