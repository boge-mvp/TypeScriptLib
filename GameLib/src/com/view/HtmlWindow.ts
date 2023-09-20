import GTextField = fgui.GTextField
import GButton = fgui.GButton
import Controller = fgui.Controller
import UIPackage = fgui.UIPackage
import GRoot = fgui.GRoot
import RelationType = fgui.RelationType
import Browser = Laya.Browser
import Utils = Laya.Utils
import {AppRecordManager} from "../manager/AppRecordManager"
import {Player} from "../Player"
import {AppManager} from "../manager/AppManager"
import {SceneManager} from "../manager/SceneManager"
import {ActionLib} from "../actions/ActionLib"
import {CommonCmd} from "../net/Common";
import IRecord = tsCore.IRecord;
import App = tsCore.App;
import StringUtil = tsCore.StringUtil;
import Log = tsCore.Log;
import HistoryManager = tsCore.HistoryManager;

export class HtmlWindow extends fgui.Window implements IRecord {

    private static _instance: HtmlWindow

    static get inst() {
        this._instance ??= new HtmlWindow
        return this._instance
    }

    private closeHandler: ParamHandler
    /** 页面名字 */
    private htmlText: GTextField
    private btn: GButton

    private obj: any = {
        "aboutus.html": "About us",
        "fair_payment.html": "FAQs",
        "common_problems.html": "Fair payouts",
        "user_agreement.html": "GameData Agreement",
        "privacy.html": "Privacy Policy",
        "a": ""
    }

    private tempX: number
    private tempY: number
    /** 加载动画控制器 */
    private loadMovieClip: Controller

    protected override onInit() {

        this.modal = true
        this.contentPane = UIPackage.createObject("common", "HtmlWindow").asCom

        this.contentPane.addRelation(GRoot.inst, RelationType.Size)
        this.loadMovieClip = this.contentPane.getController("c1")

        this.btn = this.contentPane.getChild("n1").asButton
        this.htmlText = this.contentPane.getChild("n5").asTextField

        this.contentPane.setSize(GRoot.inst.width, GRoot.inst.height)
        this.btn.onClick(this, this.hide)

    }


    protected override onShown() {
        GRoot.inst.displayObject.stage.on(Laya.Event.RESIZE, this, this.sizeChangeHandler)
        this.sizeChangeHandler()
        super.onShown()
    }

    private sizeChangeHandler() {
        this._syncInputTransform()
    }

    /**
     * 新打开一个html浏览窗口
     * @param url 加载地址
     * @param full 是否全屏
     * @param closeHandler 此界面关闭后回调
     */
    openHtml(url: string, full = false, closeHandler?: ParamHandler) {
        this.closeHandler = closeHandler
        HistoryManager.addHistory(null, this)
        this.show()
        App.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN)
        this.loadMovieClip.selectedIndex = 0

        // 是否要使用  默认的  url
        let isHtmlUrl: boolean = !StringUtil.beginsWith(url, "http")

        if (Player.inst.isWeb) {
            if (isHtmlUrl) {
                Player.inst.windowOpen(Browser.window.htmlUrl + url)
            } else {
                Player.inst.windowOpen(url)
            }
            this.hide()
        } else {
            let title: string = this.obj["a"]
            if (this.obj[url]) {
                title = this.obj[url]
            }

            let jsonObject: any = {
                webTitle: title,
                webHeadVisibility: !full,
                x: 0,
                y: 0,
                width: -1,
                height: -1
            }
            if (isHtmlUrl) {
                jsonObject.webUrl = Browser.window.htmlUrl + url
            } else {
                jsonObject.webUrl = url
            }

            AppManager.showWeb(jsonObject)
        }
    }

    /**
     * 弹出一个html浏览窗口
     * @param url 加载地址
     * @param full 是否全屏
     * @param closeHandler 此界面关闭后回调
     *
     */
    showTip(url: string, full = false, closeHandler?: ParamHandler) {
        this.closeHandler = closeHandler
        HistoryManager.addHistory(null, this)
        this.show()
        App.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN)

        this.loadMovieClip.selectedIndex = 0

        // 是否要使用  默认的  url
        let isHtmlUrl: boolean = !StringUtil.beginsWith(url, "http")

        if (Player.inst.isWeb) {
            this.btn.visible = this.htmlText.visible = !full

            let webElement = Browser.getElementById("webId")
            if (!webElement) {
                webElement = Browser.createElement("div")
                webElement.id = "webId"
                webElement.style.position = "absolute"
                webElement.style.left = "0px"
                webElement.style.top = "0px"
                webElement.style.width = "100%"
                webElement.style.height = "100%"
                webElement.style.Zindex = 110000

                // 创建一个 iframe 节点
                let elementFrame: any = Browser.createElement("iframe")
                elementFrame.id = "frameBox"
                elementFrame.name = "frameBox"
                elementFrame.src = ''
                elementFrame.marginwidth = "0px"
                elementFrame.marginheight = "0px"
                elementFrame.overflow = "hidden"
                elementFrame.scrolling = "auto"
                elementFrame.frameborder = "no"
                elementFrame.border = "0px"
                elementFrame.style.position = "absolute"
                elementFrame.style.Zindex = 100009
                elementFrame.style.border = "0px"
                elementFrame.style.width = "100%"
                elementFrame.style.height = "100%"
                elementFrame.style.display = "none"

                Browser.document.body.appendChild(webElement)

//			    Log.debug(Laya.stage.width, Render.canvas.width, Render._mainCanvas.width)
                webElement.appendChild(elementFrame)

            }

            let loadEnd = () => {
                this.loadMovieClip.selectedIndex = 1
                Log.debug("loadComplete")
            }

            Browser.window.regIFrame(loadEnd)

            if (isHtmlUrl) {
                this.popFullIframeHandler(Browser.window.htmlUrl + url, true)
            } else {
                this.popFullIframeHandler(url, true)
            }

            if (!full) {
                let tempH = (this.btn.y + this.btn.height + this.btn.y)
                webElement.style.height = ((GRoot.inst.height - tempH) * this.tempY) + "px"
                webElement.style.top = (tempH * this.tempY) + "px"
            }
        } else {
            let title: string = this.obj["a"]
            if (this.obj[url]) {
                title = this.obj[url]
            }

            let jsonObject: any = {
                webTitle: title,
                webHeadVisibility: !full,
                x: 0,
                y: 0,
                width: -1,
                height: -1
            }
            if (isHtmlUrl) {
                jsonObject.webUrl = Browser.window.htmlUrl + url
            } else {
                jsonObject.webUrl = url
            }

            AppManager.showWeb(jsonObject)
        }
    }

    // 弹出全屏显示的浏览窗口
    private popFullIframeHandler(url: string, isVisible: boolean) {
        let ifm: any = Browser.getElementById("frameBox")
        if (isVisible && ifm) {
            this._syncInputTransform()
            ifm.src = url
            ifm.style.display = "block"
        }
    }

    /** 修正宽高 */
    _syncInputTransform() {
        let frameBox = Browser.getElementById("webId")
        if (!frameBox) return
        let style = frameBox.style
        let transform = Utils.getTransformRelativeToWindow(this.displayObject, 0, 0)
        this.tempX = transform.x
        this.tempY = transform.y
        style.left = transform.tx + "px"
        style.width = GRoot.inst.width * transform.x + "px"
    }

    share(type: number, url: string, content: string) {

        // HomePrompt.instance.showTip(1, CommonCmd.DOWNLOAD_MSG,
        //     function () {
        //         UtilsTool.downloadURL(Player.DOWNLOAD_APK_URL)
        //     }, null, {okName: 'Continue', cancelName: 'Cancel'})

//			Intent intent = new Intent()
//			intent.setAction(GameAction.SHARE)
//			intent.putExtra("type", type)
//			intent.putExtra("url", url)
//			intent.putExtra("content", content)
//			getContext().sendBroadcast(intent)
    }

    override hide() {
        if (this.parent) AppRecordManager.backHistory()
    }

    hideRecord() {
        GRoot.inst.displayObject.stage.off(Laya.Event.RESIZE, this, this.sizeChangeHandler)
        if (Player.inst.isWeb) {
            Browser.removeElement(Browser.getElementById("webId"))
        } else {
            AppManager.closeHtml()
        }
        if (Player.inst.gameModel == CommonCmd.GAME_SPORTS) Player.inst.gameModel = CommonCmd.GAME_HOME
        super.hide()
        if (SceneManager.inst.starter) SceneManager.inst.starter.updateScreenOrientation()
        runFun(this.closeHandler)
    }

    showRecord() {

    }

}