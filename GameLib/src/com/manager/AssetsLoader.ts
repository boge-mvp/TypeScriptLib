import UIObjectFactory = fgui.UIObjectFactory;
import Render = Laya.Render;
import AssetProxy = fgui.AssetProxy;
import UIPackage = fgui.UIPackage;
import Browser = Laya.Browser;
import Loader = Laya.Loader;
import LocalStorage = Laya.LocalStorage;
import Utils = Laya.Utils;
import URL = Laya.URL;
import IFormatPath = tsCore.IFormatPath;
import ELoader = tsCore.ELoader;
import StringUtil = tsCore.StringUtil;
import Log = tsCore.Log;
import UtilKit = tsCore.UtilKit;
import SoundUtils = tsCore.SoundUtils;
import App = tsCore.App;
import ConfigKit = tsCore.ConfigKit;
import Path = tsCore.Path;
import {Player} from "../Player"
import {AnalyticsManager} from "./AnalyticsManager"
import {JSUtils} from "../utils/JSUtils"
import {AppManager} from "./AppManager"
import {LoadingWindow} from "../view/LoadingWindow"
import {ActionLib} from "../ActionLib"
import {LibStr} from "../LibStr"
import {GameConfigKit} from "../kit/GameConfigKit";
import {ILoadSoundFilter} from "../interfaces/IGame";
import {ResUtils} from "../utils/ResUtils";
import UIConfig = fgui.UIConfig;

/**
 * 资源管理类
 */
export class AssetsLoader implements IFormatPath {

    private static _instance: AssetsLoader

    static get inst(): AssetsLoader {
        this._instance ??= new AssetsLoader()
        return this._instance
    }

    static readonly ma = Browser.now()
    /** 资源配置文件名 */
    static CONFIG_RES_NAME = "resConfig.xml"

    /** 资源配置文件名 */
    static DEFAULT_INIT_RES_NAME = null
    /**
     * 版本加载路径
     * @example
     * https://res.game.co/assetsversion.json
     */
    static VERSION_RES_URL = null
    /**
     * 公共组件的配置信息
     * @property packageName 包名字 UIPackage.getByName(commonRes.packageName) this.addPackage(commonRes.packageName)
     * @property configName 获取公共配置信息的名字  ConfigKit.get(commonRes.configName)
     *
     * @example
     *
     * config.js
     * common = [
     *     {url: "", type:""},
     *     {url: "", type:""},
     *     {url: "", type:""}
     * ]
     *
     * 要解析的数据
     * commonRes = {
     *     packageName: "game/common",
     *     configName: "common"
     * }
     *
     * 配置这个属性的时候 configName 必须有，而packageName 可以自动根据数组中的数据url的后缀等于 UIConfig.packageFileExtension 进行推断出来
     *
     */
    commonRes: { packageName?: string, configName: string } = null

    /** 下载成功 */
    private handler: ParamHandler
    /** 下载失败 */
    private errorHandler: ParamHandler
    /** 加载对象 */
    private loadObj: ResConfig
    /** 是否是http  */
    readonly httpProtocol = Browser.window.location.protocol == "http:"
    private runLoads: LoadRes[] = []

    /**
     * 音频排除格式
     */
    static soundFilter: ILoadSoundFilter

    /**
     * 自定义额外加载操作
     * 在加载 versionXml 的时候  额外加载的
     * @example
     * AssetsLoader.customLoader = (complete: ParamHandler, errorHandler: ParamHandler) => {
     *      ...
     *     runFun(complete)
     * }
     *
     * AssetsLoader.customLoader = Laya.Handler.create(this, function(complete: ParamHandler, errorHandler: ParamHandler) {
     *  ...
     *  runFun(complete)
     *
     * })
     */
    customLoader: ParamHandler
    /**
     * 自定义扩展加载资源处理
     *  @example
     * AssetsLoader.customLoaderRes = (loadRes: LoadRes[]) => {
     *      ...
     * }
     *
     * AssetsLoader.customLoaderRes = Laya.Handler.create(this, function(loadRes: LoadRes[]) {
     *  ...
     *
     * })
     */
    customLoaderRes: ParamHandler

    /**
     * 加载路径格式化
     * @deprecated
     * @see Path.formatPath
     */
    static loadPathFormat = Path.formatPath

    constructor() {
        // 添加加载路径格式化
        Path.formatPath.push(this)
    }

    /**
     * @deprecated
     * @see Path.formatPath
     */
    static formatUrl = Path.formatUrl

    version(url: string, version: string | number): string | number {
        if (Browser.onLayaRuntime) return version
        // 一个兼容处理
        if (url.contains("configs/newConfig")) {
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
        ELoader.loader.load(resConfigUrl,
            Laya.Handler.create(this, this.loadXMLComplete, [complete, errorHandler, resConfigUrl]),
            null, Loader.XML)
    }

    private loadXMLComplete(complete: ParamHandler, errorHandler: ParamHandler, resConfigUrl: string, source: XMLDocument) {
        if (!source) {
            runFun(errorHandler)
            return
        }
        ELoader.loader.clearRes(resConfigUrl)
        this.parseUrl(source)
        if (this.customLoader) {
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
            if (AssetsLoader.VERSION_RES_URL) {
                let loadInitJson = [{url: AssetsLoader.VERSION_RES_URL, type: Loader.JSON}]
                ELoader.loader.load(loadInitJson, Laya.Handler.create(this, loadJsonComplete))
            } else {
                loadInit()
            }

            function loadJsonComplete(success: boolean) {
                if (!success) {
                    loadErrorHandler()
                    return
                }
                let versionJson = AssetProxy.inst.getRes(AssetsLoader.VERSION_RES_URL)
                ELoader.loader.clearRes(AssetsLoader.VERSION_RES_URL)
                Player.DOWNLOAD_APK_URL = versionJson.url
                Player.VERSION = versionJson.version
                Player.VERSION_CODE = versionJson.versionCode
                Player.HOME_URL = versionJson.appUrl
                loadInit()
            }

            function loadInit() {
                if (StringUtil.isEmpty(AssetsLoader.DEFAULT_INIT_RES_NAME)) {
                    runFun(handler)
                } else {
                    // init 资源加载
                    let loads: LoadRes[] = Browser.window[AssetsLoader.DEFAULT_INIT_RES_NAME]
                    ELoader.loader.load(loads, Laya.Handler.create(this, loadBaseComplete, [loads]))
                }
            }
        }

        let loadErrorHandler = () => {
            ELoader.loader.clearUnLoaded()
            AnalyticsManager.sendGameAnalysis("loader_main_res_error")
            if (!Render.isConchApp) JSUtils.alert(getString(LibStr.NET_ERROR))
            JSUtils.gameClose()
            AppManager.gameRestart()
        }

        let loadBaseComplete = (loads: LoadRes[], success: boolean) => {
            if (!success) {
                loadErrorHandler()
                return
            }
            if (!this.addPackages(loads)) {
                Log.debug("addPackage fail = init")
                loadErrorHandler()
                return
            }
            runFun(handler)
        }

        if (AssetsLoader.CONFIG_RES_NAME) {
            this.loadVersionXML(loadXmlComplete, loadErrorHandler)
        } else {
            if (this.customLoader) {
                runFun(this.customLoader, loadXmlComplete, loadErrorHandler)
            } else {
                loadXmlComplete()
            }
        }


    }


    /**
     * 加载公共资源
     * @param handler
     * @param assets
     */
    loadCommon(handler: ParamHandler, assets: LoadRes[] = null) {
        if (!assets) {
            assets = []
            // 公共资源
            let commonRes: LoadRes[] = Browser.window.common
            let serverUrl = Browser.window.serverState
            assets = assets.concat(commonRes)
            assets.push({url: serverUrl, type: Loader.TEXT})
        }

        AssetsLoader.checkBranch(assets)

        function loadCommonErrorHandler() {
            ELoader.loader.clearUnLoaded()
            if (!Render.isConchApp) JSUtils.alert(getString(LibStr.NET_ERROR))
            JSUtils.gameClose()
            AppManager.gameRestart()
        }

        function progressCommonHandler(data: number) {
            let pro = parseInt(data * 100 + "")
            if (Render.isConchApp) {
//                AppManager.showLoadingPro(pro, 2, 4)
                LoadingWindow.updateMsg(pro, 2, 4)
            } else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.updateMsg(pro, 2, 4)
                } else {
                    LoadingWindow.updateMsg(pro, 2, 2)
                }
            }
        }

        let loadCommonComplete = (success: boolean) => {
            if (!success) {
                loadCommonErrorHandler()
                return
            }
            if (!this.addPackages(assets)) {
                loadCommonErrorHandler()
                return
            }
            runFun(handler)
        }

        ELoader.loader.load(assets, Laya.Handler.create(this, loadCommonComplete),
            Laya.Handler.create(this, progressCommonHandler, null, false))

    }

    /**
     * 加载游戏代码
     * @param config 配置表
     * @param handler 加载完成
     * @param errorHandler 加载失败
     */
    loadJS(config: string, handler: ParamHandler, errorHandler?: ParamHandler) {
        let obj = GameConfigKit.gameRes(config)
        if (obj?.js == null) {
            runFun(errorHandler)
            return
        }
        let jsName = "js/" + obj.js + ".min.js"
        this.loadJsProgress(0)
        ELoader.loader.load(jsName, Laya.Handler.create(this, loadJsComplete),
            new Laya.Handler(this.loadJsProgress), Loader.TEXT)

        function loadJsComplete(success: boolean) {
            if (!success) {
                loadJsError()
                return
            }
            const jsCode = AssetProxy.inst.getRes(jsName)
            UtilKit.loadScript(jsCode, true, Render.isConchApp ? null : URL.formatURL(jsName))
            ELoader.loader.clearRes(jsName)
            runFun(handler)
        }

        function loadJsError() {
            ELoader.loader.clearUnLoaded()
            AnalyticsManager.sendGameAnalysis("loader_js_res_error")
            runFun(errorHandler)
        }

    }

    private loadJsProgress(e: number) {
        let pro = Utils.parseInt(e * 100 + "")
        if (Render.isConchApp) {
//            AppManager.showLoadingPro(pro, 3, 4)
            LoadingWindow.updateMsg(pro, 3, 4)
        } else {
            if (Player.inst.urlParam.isJumpPage()) {
                LoadingWindow.updateMsg(pro, 3, 4)
            } else {
                LoadingWindow.updateMsg(pro, 1, 1)
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

        let res = obj.res

        let loadArray: LoadRes[] = []
        // 判断是否已经显示过引导页
        let guideRes = LocalStorage.getItem("GameGuide_" + Player.inst.gameId)
        if (!guideRes && obj.guide) {
            let temps: (string | LoadRes)[]
            if (Array.isArray(obj.guide)) {
                temps = obj.guide
            } else {
                temps = [obj.guide]
            }
            ResUtils.parseRes(temps)
            for (let i = 0; i < temps.length; i++) {
                let guide = temps[i]
                if (typeof guide === "string") {
                    loadArray.push({url: guide, type: Loader.IMAGE})
                } else {
                    loadArray.push(guide)
                }
            }
        }

        if (this.customLoaderRes) {
            runFun(this.customLoaderRes, loadArray)
        }

        if (this.commonRes) {
            let gameCommonRes: LoadRes[] = ConfigKit.get(this.commonRes.configName)
            if (gameCommonRes) {
                const exte = "." + UIConfig.packageFileExtension
                const loadRes = gameCommonRes.find(value => value.url.endsWith(exte))
                this.commonRes.packageName = loadRes?.url?.replace(exte, "")
                if (this.commonRes.packageName && !UIPackage.getByName(this.commonRes.packageName)) {
                    loadArray = loadArray.concat(gameCommonRes)
                }
            }
        }

        // 解析资源判断是否需要特殊处理的加载文件
        loadArray = loadArray.concat(this.parseRes(res))
        // 渠道资源检查
        AssetsLoader.checkBranch(loadArray)

        // 分隔音频
        let soundLoads = []
        for (let i = 0; i < loadArray.length; i++) {
            let obj = loadArray[i]
            if (obj.type == Loader.SOUND) {

                // 如果在自定义过滤中 返回false 不再需要那么排除音频
                if (AssetsLoader.soundFilter && !AssetsLoader.soundFilter.filter(obj.url, obj)) {
                    Log.debug(`clean ogg audio files from apple mobile devices. ${obj.url}`)
                } else {
                    // 此音频是要强制加载到初始化
                    if (obj.forceLoad) {
                        continue
                    } else soundLoads.push(obj)
                }
                // let chromeBrowser = Browser.userAgent.indexOf("Chrome") != -1
                // // 处理苹果移动设备中 ogg 音频文件
                // if (!chromeBrowser && (Browser.onMac || Browser.onIOS || Browser.onIPhone || Browser.onIPad)) {
                //     // 不是ogg格式的文件 或 ios app应用
                //     if (!obj.url.contains(".ogg")) {
                //         soundLoads.push(obj)
                //     } else {
                //         soundLoads.push(obj.url.replace(/\.ogg$/, ".m4a"))
                //         Log.debug(`clean ogg audio files from apple mobile devices. ${obj.url}`)
                //     }
                // } else {
                //     soundLoads.push(obj)
                // }
                // // 此文件是要强制加载的音频文件 并且在预加载中
                // if (obj.forceLoad && soundLoads.includes(obj)) {
                //     continue
                // }
                // 默认 剔除音频
                loadArray.splice(i, 1)
                i--
            }
        }
        SoundUtils.addRes(soundLoads)

        // 分隔资源
        this.runLoads.length = 0
        for (let i = 0; i < loadArray.length; i++) {
            let obj = loadArray[i]
            // 不是音乐，并且是运行时加载
            if (obj.type !== Loader.SOUND && obj.runLoad) {
                loadArray.splice(i, 1)
                i--
                this.runLoads.push(obj)
            }
        }
        // 开始load
        ELoader.loader.load(loadArray, Laya.Handler.create(this, this.loadComplete),
            new Laya.Handler(this, this.progressComplete))
    }

    /**
     * 处理资源
     * @param res
     * @private
     */
    private parseRes(res: LoadRes[]) {
        let data: LoadRes[] = res.concat()
        // 先检查批量加载
        ResUtils.parseRes(data)
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
            // 判断是否忽略图片
            if (value.ignoreSuffix !== "png") {
                let temp = value.url.replace(".sk", ".png")
                // 如果未配置 png 则添加
                if (data.findIndex((value) => temp == value.url) === -1) {
                    data.push({url: temp, type: Loader.IMAGE, branch: value.branch})
                }
            }
        }
        // spine json格式 进行忽略判断
        for (const value of spines) {
            value.type = Loader.JSON
            // atlas 纹理文件
            if (value.ignoreSuffix !== "atlas") {
                let temp = value.url.replace(".json", ".atlas")
                // 如果未配置 atlas 则添加
                if (data.findIndex((value) => temp == value.url) === -1) {
                    data.push({url: temp, type: Loader.TEXT, branch: value.branch})
                }
            }
            // png 图片
            if (value.ignoreSuffix !== "png") {
                let temp = value.url.replace(".json", ".png")
                // 如果未配置 png 则添加
                if (data.findIndex((value) => temp == value.url) === -1) {
                    data.push({url: temp, type: Loader.IMAGE, branch: value.branch})
                }
            }
        }
        return data
    }

    /**
     * 检查分支资源更换加载
     * @param loadRes 整理好的 加载数据
     */
    static checkBranch(loadRes: LoadRes[]) {
        // 如果使用了分支
        if (!StringUtil.isEmpty(UIPackage.branch)) {
            // 检查是否有需要替换的分支资源
            for (let i = 0; i < loadRes.length; i++) {
                let resObj = loadRes[i]
                // 资源存在分支  并且url路径上不存在分支名字
                if (resObj.branch && !resObj.url.contains("_" + UIPackage.branch)) {
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
        if (LoadingWindow.inst == null) {
            const tempValue = LoadingWindow.getProgress(pro, 4, 4)
            JSUtils.getProgress(tempValue)
            return
        }
        if (Render.isConchApp) {
//            AppManager.showLoadingPro(pro, 4, 4)
            LoadingWindow.updateMsg(pro, 4, 4)
        } else {
            if (Player.inst.urlParam.isJumpPage()) {
                LoadingWindow.updateMsg(pro, 4, 4)
            } else {
                LoadingWindow.updateMsg(pro, 1, 1)
            }
        }
    }

    private loadComplete(success: boolean) {
        if (!success) {
            this.loadErrorHandler()
            return
        }

        if (this.commonRes?.packageName) {
            if (!UIPackage.getByName(this.commonRes.packageName)) {
                if (!this.addPackage(this.commonRes.packageName)) {
                    this.loadErrorHandler()
                    return
                }
                // 通知开始注册游戏公共类 事件
                App.inst.sendAction(ActionLib.GAME_REG_GAME_COMMON_CLASS)
            }
        }

        if (!this.addPackages(this.loadObj.res)) {
            this.loadErrorHandler()
            return
        }

        runFun(this.handler)
    }


    private loadErrorHandler() {
        ELoader.loader.clearUnLoaded()
        JSUtils.gameClose()
        AnalyticsManager.sendGameAnalysis("loader_game_res_error")
        runFun(this.errorHandler)
    }

    /**
     * 将一个 loadRes数组对象  添加资源
     * @param res
     */
    addPackages(res: LoadRes[]) {
        let fuiName: string
        for (let k = 0; k < res.length; k++) {
            fuiName = res[k].url
            if (fuiName.indexOf("." + fgui.UIConfig.packageFileExtension) != -1) {
                fuiName = StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension)
                if (!this.addPackage(fuiName)) {
                    Log.debug("addPackage fail = " + fuiName)
                    return false
                }
            }
        }
        return true
    }


    /**
     * 添加游戏UI资源
     * @param resKey 资源名字
     * @return 成功与否
     */
    addPackage(resKey: string) {
        let descData: ArrayBuffer = AssetProxy.inst.getRes(resKey + "." + fgui.UIConfig.packageFileExtension)
        if (!descData || descData.byteLength == 0) {
            return false
        }
        if (!UIPackage.getByName(resKey)) UIPackage.addPackage(resKey)
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
            if (url.endsWith(".js") && !url.endsWith(".min.js")) {
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
                        Log.debug("xml-languages: name=" + tempName + " repeat")
                    } else {
                        // 发现有个存在一样的
                        Log.warn("xml-languages: name=" + tempName + " repeat," +
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

    /**
     * 运行加载资源
     */
    runLoad() {
        if (this.runLoads.length > 0) {
            ELoader.loader.load(this.runLoads)
        }
    }

}