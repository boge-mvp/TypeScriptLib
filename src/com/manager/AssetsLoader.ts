import UIObjectFactory = fgui.UIObjectFactory
import Render = Laya.Render
import AssetProxy = fgui.AssetProxy
import UIPackage = fgui.UIPackage
import Browser = Laya.Browser
import Loader = Laya.Loader
import LocalStorage = Laya.LocalStorage
import Utils = Laya.Utils
import URL = Laya.URL
import {IFormatVer} from "../interfaces/IFormatVer"
import {MyLoader} from "../core/MyLoader"
import {StringUtil} from "../utils/StringUtil"
import {Player} from "../Player"
import {AnalyticsManager} from "./AnalyticsManager"
import {JSUtils} from "../utils/JSUtils"
import {AppManager} from "./AppManager"
import {LoadRes, ResConfig} from "../interfaces/ICommon"
import {LoadingWindow} from "../view/LoadingWindow"
import {ConfigUtils} from "../utils/ConfigUtils"
import {Cast} from "../utils/Cast"
import {SoundUtils} from "../utils/SoundUtils"
import {Factory} from "../Factory"
import {LanguageUtils} from "../utils/LanguageUtils"
import {ActionLib} from "../actions/ActionLib"
import {LibStr} from "../LibStr"

/**
 * 资源管理类
 */
export class AssetsLoader implements IFormatVer {

    private static _instance: AssetsLoader

    static get inst(): AssetsLoader {
        if (this._instance == null) this._instance = new AssetsLoader()
        return this._instance
    }

    static readonly ma = Browser.now()
    /** 资源配置文件名 */
    static CONFIG_RES_NAME = "resConfig.xml"
    /** 下载成功 */
    private handler: ParamHandler
    /** 下载失败 */
    private errorHandler: ParamHandler
    /** 加载对象 */
    private loadObj: any
    /** 是否是http  */
    readonly httpProtocol = Browser.window.location.protocol == "http:"
    /**
     * 自定义加载文件
     * @example
     * AssetsLoader.customLoader = (complete: ParamHandler, errorHandler: ParamHandler) => {
     *      ...
     *     runFun(complete)
     * }
     *
     *
     * Laya.Handler.create(this, function(complete: ParamHandler, errorHandler: ParamHandler) {
     *  ...
     *  runFun(complete)
     *
     * })
     */
    customLoader: ParamHandler

    constructor() {
        // 添加加载路径格式化
        MyLoader.format.push(this)
    }

    call(url: string, version): string {
        if (Render.isConchApp) return version
        if (StringUtil.contains(url, "configs/newConfig")) {
            return URL.version["configs/newConfig.js"]
        }
        return version
    }

    /**
     * 加载版本控制文件
     * @param complete
     * @param errorHandler
     */
    loadVersionXML(complete: ParamHandler, errorHandler: ParamHandler) {
        let resConfigUrl = AssetsLoader.CONFIG_RES_NAME + (Render.isConchApp ? "" : "?v=" + Browser.now())
        MyLoader.loader.load(resConfigUrl,
            Laya.Handler.create(this, this.loadXMLComplete, [complete, errorHandler, resConfigUrl]),
            null, Loader.XML)
    }

    private loadXMLComplete(complete: ParamHandler, errorHandler: ParamHandler, resConfigUrl: string, source: XMLDocument) {
        if (source == null) {
            runFun(errorHandler)
            return
        }
        MyLoader.loader.clearRes(resConfigUrl)
        this.parseUrl(source)
        if (this.customLoader != null) {
            runFun(this.customLoader, complete, errorHandler)
        } else {
            runFun(complete)
        }
    }

    /**
     * 加载主要的资源
     * @param handler
     */
    loadMain(handler: ParamHandler) {
        let loadXmlComplete = () => {
            let vUrl = Browser.window.versionUrl
            let loadInitJson = [{url: vUrl, type: Loader.JSON}]

            MyLoader.loader.load(loadInitJson, Laya.Handler.create(this, loadJsonComplete))

            function loadJsonComplete(success: boolean) {
                if (!success) {
                    loadErrorHandler()
                    return
                }
                let versionJson = AssetProxy.inst.getRes(vUrl)
                MyLoader.loader.clearRes(vUrl)
                Player.DOWNLOAD_APK_URL = versionJson.url
                Player.VERSION = versionJson.version
                Player.VERSION_CODE = versionJson.versionCode
                Player.HOME_URL = versionJson.appUrl
                // init 资源加载
                let loads: any[] = Browser.window.init
                MyLoader.loader.load(loads, Laya.Handler.create(this, loadBaseComplete))
            }
        }

        let loadErrorHandler = () => {
            MyLoader.loader.clearUnLoaded()
            AnalyticsManager.sendGameAnalysis("loader_main_res_error")
            if (!Render.isConchApp)
                JSUtils.openModal(LanguageUtils.inst.getStr(LibStr.NET_ERROR))
            JSUtils.gameClose()
            AppManager.gameRestart()
        }

        let loadBaseComplete = (success: boolean) => {
            if (!success) {
                loadErrorHandler()
                return
            }

            if (!this.addPackage("init/init")) {
                console.log("addPackage fail = init")
                loadErrorHandler()
                return
            }
            runFun(handler)
        }

        this.loadVersionXML(loadXmlComplete, loadErrorHandler)

    }


    /**
     * 加载公共资源
     * @param handler
     */
    loadCommon(handler: ParamHandler) {
        let assets: LoadRes[] = []
        // 公共资源
        let serverUrl = Browser.window.serverState
        let commonRes: LoadRes[] = Browser.window.common
        commonRes.push({url: serverUrl, type: Loader.TEXT})
        assets = assets.concat(commonRes)

        AssetsLoader.checkBranch(assets)


        function loadCommonErrorHandler() {
            MyLoader.loader.clearUnLoaded()
            if (!Render.isConchApp) JSUtils.openModal(LanguageUtils.inst.getStr(LibStr.NET_ERROR))
            JSUtils.gameClose()
            AppManager.gameRestart()
        }

        function progressCommonHandler(data: number) {
            let pro = parseInt(data * 100 + "")
            if (Render.isConchApp) {
//                AppManager.showLoadingPro(pro, 2, 4)
                LoadingWindow.inst.updateMsg(pro, 2, 4)
            } else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.inst.updateMsg(pro, 2, 4)
                } else {
                    LoadingWindow.inst.updateMsg(pro, 2, 2)
                }
            }
        }

        let loadCommonComplete = (success: boolean) => {
            if (!success) {
                loadCommonErrorHandler()
                return
            }
            if (!this.addPackage("common/common")) {
                loadCommonErrorHandler()
                return
            }
            runFun(handler)
        }

        MyLoader.loader.load(assets, Laya.Handler.create(this, loadCommonComplete),
            Laya.Handler.create(this, progressCommonHandler, null, false))

    }

    /**
     * 加载游戏代码
     * @param config 配置表
     * @param handler 加载完成
     * @param errorHandler 加载失败
     */
    loadJS(config: string, handler: ParamHandler, errorHandler?: ParamHandler) {
        let obj = ConfigUtils.gameRes(config)
        let jsName = "js/" + obj.js + ".min.js"
        this.loadJsProgress(0)
        MyLoader.loader.load(jsName, Laya.Handler.create(this, loadJsComplete),
            new Laya.Handler(this.loadJsProgress), Loader.TEXT)

        function loadJsComplete(success: boolean) {
            if (!success) {
                loadJsError()
                return
            }
            let jsContent = AssetProxy.inst.getRes(jsName)
            Cast.loadScript(jsContent + '\n//@ sourceURL=' + obj.js)
            MyLoader.loader.clearRes(jsName)
            runFun(handler)
        }

        function loadJsError() {
            MyLoader.loader.clearUnLoaded()
            AnalyticsManager.sendGameAnalysis("loader_js_res_error")
            runFun(errorHandler)
        }

    }

    private loadJsProgress(e: number) {
        let pro = Utils.parseInt(e * 100 + "")
        if (Render.isConchApp) {
//            AppManager.showLoadingPro(pro, 3, 4)
            LoadingWindow.inst.updateMsg(pro, 3, 4)
        } else {
            if (Player.inst.urlParam.isJumpPage()) {
                LoadingWindow.inst.updateMsg(pro, 3, 4)
            } else {
                LoadingWindow.inst.updateMsg(pro, 1, 1)
            }
        }
    }

    /**
     * 加载游戏资源
     * @param obj 游戏对象
     * @param handler 加载完成
     * @param errorHandler 加载失败
     */
    loadRes(obj: ResConfig, handler: ParamHandler, errorHandler?: ParamHandler) {
        this.handler = handler
        this.errorHandler = errorHandler
        this.loadObj = obj

        let res: LoadRes[] = obj.res

        let loadArray: LoadRes[] = []
        // 判断是否已经显示过引导页
        let guideRes = LocalStorage.getItem("GameGuide_" + Player.inst.gameModel)
        if (guideRes == null && obj.guide) {
            let temps: string[]
            if (typeof obj.guide === "string") {
                temps = [obj.guide]
            } else {
                temps = obj.guide
            }
            for (let i = 0; i < temps.length; i++) {
                let guide = temps[i]
                if (typeof guide === "string") {
                    loadArray.push({url: guide, type: Loader.IMAGE})
                } else {
                    loadArray.push(guide)
                }
            }
        }

        loadArray = loadArray.concat(this.parseRes(res))

        if (UIPackage.getByName("gameCommon/gameCommon") == null) {
            let gameCommonRes: LoadRes[] = Browser.window.gameCommon
            loadArray = loadArray.concat(gameCommonRes)
        }

        AssetsLoader.checkBranch(loadArray)

        // 分隔音频
        let soundLoads = []
        for (let i = 0; i < loadArray.length; i++) {
            let obj = loadArray[i]
            if (obj.type == Loader.SOUND && !obj.forceLoad) {
                loadArray.splice(i, 1)
                i--
                let chromeBrowser = Browser.userAgent.indexOf("Chrome") != -1
                // 清理苹果移动设备中 ogg 音频文件
                if (!chromeBrowser && (Browser.onMac || Browser.onIOS || Browser.onIPhone || Browser.onIPad)) {
                    if (!StringUtil.contains(obj.url, ".ogg")) {
                        soundLoads.push(obj)
                    }
                } else {
                    soundLoads.push(obj)
                }
            }
        }
        SoundUtils.addRes(soundLoads)

        // // 清理苹果移动设备中 ogg 音频文件
        // if (Browser.onIOS || Browser.onIPhone || Browser.onIPad) {
        //     for (let i = 0; i < loadArray.length; i++) {
        //         let obj = loadArray[i]
        //         if (StringUtil.contains(obj.url, ".ogg")) {
        //             loadArray.splice(i, 1)
        //             i--
        //         }
        //     }
        // }

        // 开始load
        MyLoader.loader.load(loadArray, Laya.Handler.create(this, this.loadComplete),
            new Laya.Handler(this, this.progressComplete))

    }

    /**
     * 处理资源
     * @param res
     * @private
     */
    private parseRes(res: LoadRes[]) {
        let data: LoadRes[] = res.concat()
        let sks = data.filter(function (value, index, array) {
            let temp
            return Utils.getFileExtension(value.url) === "sk" && value.type === "spine"
                && (temp = value.url.replace(".sk", ".png")) !== null
                && array.findIndex(function (value) {
                    return value === temp
                }) === -1
        })
        const spines = data.filter(function (value, index, array) {
            return Utils.getFileExtension(value.url) === "json" && value.type === "spine"
        })
        for (const value of sks) {
            value.type = Loader.BUFFER
            data.push({url: value.url.replace(".sk", ".png"), type: Loader.IMAGE, branch: value.branch})
        }
        for (const value of spines) {
            value.type = Loader.JSON
            let temp = value.url.replace(".json", ".atlas")
            if(data.findIndex(function (value, index, obj) {
                return temp === value.url
            }) === -1) {
                data.push({url: value.url.replace(".json", ".atlas"), type: Loader.ATLAS, branch: value.branch})
            }

            temp = value.url.replace(".json", ".png")
            if(data.findIndex(function (value, index, obj) {
                return temp === value.url
            }) === -1) {
                data.push({url: value.url.replace(".json", ".png"), type: Loader.IMAGE, branch: value.branch})
            }
        }
        return data
    }

    /**
     * 检查分支资源更换加载
     * @param loadRes 整理好的加载数据
     */
    static checkBranch(loadRes: LoadRes[]) {
        // 如果使用了分支
        if (!StringUtil.isEmpty(UIPackage.branch)) {
            // 检查是否有需要替换的分支资源
            for (let i = 0; i < loadRes.length; i++) {
                let resObj = loadRes[i]
                // 资源存在分支  并且url路径上不存在分支名字
                if (resObj.branch && !StringUtil.contains(resObj.url, "_" + UIPackage.branch)) {
                    let resBranch = resObj.branch
                    if (resBranch.indexOf(UIPackage.branch) != -1) { // 找到需要更换的资源
                        let url = resObj.url
                        let index = url.lastIndexOf(".")
                        if (index != -1) {
                            let head = url.substring(0, index)
                            let end = url.substring(index)
                            // 更换为分支资源
                            resObj.url = head + "_" + UIPackage.branch + end
                        }
                    }
                }
            }
        }
    }

    private progressComplete(e: number) {
        let pro = parseInt(e * 100 + "")
        if (Render.isConchApp) {
//            AppManager.showLoadingPro(pro, 4, 4)
            LoadingWindow.inst.updateMsg(pro, 4, 4)
        } else {
            if (Player.inst.urlParam.isJumpPage()) {
                LoadingWindow.inst.updateMsg(pro, 4, 4)
            } else {
                LoadingWindow.inst.updateMsg(pro, 1, 1)
            }
        }
    }

    private loadComplete(success: boolean) {
        if (!success) {
            this.loadErrorHandler()
            return
        }
        if (UIPackage.getByName("gameCommon/gameCommon") == null) {
            if (!this.addPackage("gameCommon/gameCommon")) {
                this.loadErrorHandler()
                return
            }
            // 通知开始注册游戏公共类 事件
            Factory.inst.sendAction(ActionLib.GAME_REG_GAME_COMMON_CLASS)
        }

        let fuiName: string
        let res = this.loadObj.res
        for (let k = 0; k < res.length; k++) {
            fuiName = res[k].url
            if (fuiName.indexOf("." + fairygui.UIConfig.packageFileExtension) != -1) {
                fuiName = StringUtil.remove(fuiName, "." + fairygui.UIConfig.packageFileExtension)
                if (!this.addPackage(fuiName)) {
                    console.log("addPackage fail = " + fuiName)
                    this.loadErrorHandler()
                    return
                }
            }
        }
        runFun(this.handler)
    }

    private loadErrorHandler() {
        MyLoader.loader.clearUnLoaded()
        JSUtils.gameClose()
        AnalyticsManager.sendGameAnalysis("loader_game_res_error")
        runFun(this.errorHandler)
    }


    /**
     * 添加游戏UI资源
     * @param resKey 资源名字
     * @return 成功与否
     */
    addPackage(resKey: string) {
        let descData: ArrayBuffer = AssetProxy.inst.getRes(resKey + "." + fairygui.UIConfig.packageFileExtension)
        if (!descData || descData.byteLength == 0) {
            return false
        }
        if (UIPackage.getByName(resKey) == null)
            UIPackage.addPackage(resKey)
        return true
    }

    /** 设置扩展 */
    protected insertExt(pkgName: string, resName: string, type: any) {
        this.insertExtUrl("//" + pkgName + "/" + resName, type)
    }

    protected insertExtUrl(url: string, type: any) {
        UIObjectFactory.setPackageItemExtension(url, type)
    }

    /**
     * 资源url解析
     * @param xmlDocument
     */
    parseUrl(xmlDocument: XMLDocument) {
        if (Render.isConchApp) return
        let chills = xmlDocument.lastChild.childNodes
        let child: any
        let url: string
        for (let i = 0; i < chills.length; i++) {
            child = chills[i]
            url = child.getAttribute("url")
            if (StringUtil.endsWith(url, ".js") && !StringUtil.endsWith(url, ".min.js")) {
                Laya.URL.version[StringUtil.replace(url, ".js", ".min.js")] = child.getAttribute("crc")
            }
            Laya.URL.version[url] = child.getAttribute("crc")
        }
    }

    /**
     * 合并两个xml
     * @param xml 如果有重复并且值不一样  以这个对象内的值为准
     * @param xml2
     * @private
     */
    mergeXml(xml: XMLDocument, xml2: XMLDocument) {
        let root = xml.lastChild as Element
        let element2 = xml2.lastChild.childNodes
        let tempName
        let isExist = false
        let addElement: Element[] = []
        let itemElement: Element
        for (let i = 0; i < element2.length; i++) {
            isExist = false
            itemElement = element2[i] as Element
            if (itemElement.nodeType == 1) { // 只检查 Element
                tempName = itemElement.getAttribute("name")
                let xmlList = xml.getElementsByName(tempName)
                if (xmlList.length > 0) {
                    if (itemElement.textContent == xmlList[0].textContent) {
                        console.log("xml-languages: name=" + tempName + " repeat")
                    } else {
                        // 发现有个存在一样的
                        console.warn("xml-languages: name=" + tempName + " repeat," +
                            " content=" + xmlList[0].textContent + ", content2=" + itemElement.textContent)
                    }
                } else {
                    addElement.push(itemElement)
                }
            } else {
                addElement.push(itemElement)
            }
        }
        for (let j = 0; j < addElement.length; j++) {// 添加
            root.appendChild(addElement[j])
        }
        return xml
    }

}