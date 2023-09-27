import Render = Laya.Render;
import LocalStorage = Laya.LocalStorage;
import GRoot = fgui.GRoot;
import Handler = Laya.Handler;
import Point = Laya.Point;
import Browser = Laya.Browser;
import UIPackage = fgui.UIPackage;
import SoundManager = Laya.SoundManager;
import Stage = Laya.Stage;
import Loader = Laya.Loader;
import URL = Laya.URL;
import Templet = Laya.Templet;
import {BaseStarter} from "../core/BaseStarter"
import {Player} from "../Player"
import {AppManager} from "./AppManager"
import {AppRecordManager} from "./AppRecordManager"
import {LoadingWindow} from "../view/LoadingWindow"
import {JSUtils} from "../utils/JSUtils"
import {SocketManager} from "../net/SocketManager"
import {ActionLib} from "../actions/ActionLib"
import {LibStr} from "../LibStr"
import {HtmlWindow} from "../view/HtmlWindow"
import {AnalyticsManager} from "./AnalyticsManager"
import {PromptWindow} from "../view/PromptWindow"
import {WaitResult} from "../view/WaitResult"
import {Cmd, CommonCmd} from "../net/Common";
import EProxy = tsCore.EProxy;
import Log = tsCore.Log;
import HistoryManager = tsCore.HistoryManager;
import HTTPUtils = tsCore.HTTPUtils;
import App = tsCore.App;
import {GameConfigKit} from "../kit/GameConfigKit";
import ELoader = tsCore.ELoader;
import UtilKit = tsCore.UtilKit;
import StringUtil = tsCore.StringUtil;
import MessageTip = tsCore.MessageTip;
import SoundUtils = tsCore.SoundUtils;
import {AssetsLoader} from "./AssetsLoader";
import {StateCode} from "../utils/StateCode";
import MouseManager = Laya.MouseManager;
import TouchManager = Laya.TouchManager;
import KeyBoardManager = Laya.KeyBoardManager;

/**
 * 舞台
 */
export class SceneManager extends EProxy {

    private static _instance: SceneManager

    static get inst(): SceneManager {
        this._instance ??= new SceneManager()
        return this._instance
    }

    /** 游戏设计面板宽度 */
    gameWidth: number
    /** 游戏设计面板高度 */
    gameHeight: number
    // 获取失去焦点的时间
    private blurTimer: number
    /** 当前游戏的 Starter */
    private _starter: BaseStarter
    /** 是否已经初始化完成 等待外部调用 */
    initComplete = false
    /** 是否已经初始化完成 等待外部调用 */
    isLoaderResComplete = false
    /** 是否需要唤醒进入游戏 */
    isCall = false
    /**
     * 判断是否已关闭游戏
     */
    private isCloseGame: boolean

    showHomeScene() {
        Player.inst.gameId = CommonCmd.GAME_HOME
        if (!Render.isConchApp) {
            Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange)
            Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange)
        }
        Log.debug("SceneManager.showHomeScene")
        AppManager.sendAppData()
        if (AppRecordManager.executeJson) {
            AppRecordManager.JavaSendOpen(AppRecordManager.executeJson)
        } else {
            LoadingWindow.inst.hide()
        }

//		    GRoot.inst.addChild(GlodSprayScene.inst)
    }

    /** 显示登录界面 */
    showLogin() {
        if (Player.inst.urlParam.isJumpPage())
            JSUtils.login()
    }

    /** 退出登录 */
    logout() {
        LocalStorage.removeItem("token")
        LocalStorage.removeItem("userData")

        Player.inst.token = null

        SocketManager.inst.close()
        SoundManager.stopAll()

        Player.inst.money = 0
        Player.inst.freeBet = 0

        if (Player.inst.gameId != CommonCmd.GAME_HOME) {
            // 不在大厅
            this.closeGame()
            Player.inst.gameId = CommonCmd.GAME_HOME
            this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN)
        }
        HistoryManager.clearHistory()

        JSUtils.login()
    }

    private visibleId = 0
    private visibles: (() => void)[] = []

    onVisibleChange(fun: () => void) {
        fun["$vid"] = this.visibleId++
        this.visibles.push(fun)
    }

    offVisibleChange(fun: () => void) {
        if (fun["$vid"]) {
            let index = this.visibles.findIndex((value) => fun["$vid"] === value["$vid"])
            this.visibles.splice(index, 1)
        }
    }

    /** 游戏是否进入后台 */
    private visibilityChange() {
//		Log.debug("visibilityChange="+Laya.stage.isVisibility)
        if (!this.isCloseGame) this.visibles.forEach((value) => value())
        if (Laya.stage.isVisibility) {
            this.focusHandler()
        } else {
            this.blurHandler()
        }
    }

    /** 得到焦点开始渲染 */
    private focusHandler() {
        if (Player.inst.isGuest) return
        GRoot.inst.showModalWait(getString(LibStr.WAITING))
        if (Player.inst.gameId != CommonCmd.GAME_HOME && Player.inst.gameId != CommonCmd.GAME_SCRATCHER) {
            // 告诉当前游戏进来了
            SceneManager.inst.starter?.gameModel?.focusGame()
            if (HTTPUtils.getTimerSecond() - this.blurTimer >= 3) { // 超过3秒离开焦点
                // 检查当前游戏
                SceneManager.inst.starter?.gameServlet?.checkGamePeriod((sc: boolean) => {
                    GRoot.inst.closeModalWait()
                    if (!sc) {
                        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.SYSTEM_BACK_LOBBY, null, Handler.create(this, JSUtils.gameClose))
                    }
                })
            } else {
                GRoot.inst.closeModalWait()
            }
        } else {
            if (Player.inst.token) {
                Player.inst.login?.loginToken(Handler.create(this, function () {
                    GRoot.inst.closeModalWait()
                }))
            } else {
                GRoot.inst.closeModalWait()
            }
        }
    }

    /** 失去焦点停止渲染 */
    private blurHandler() {
        if (Player.inst.isGuest) return
        this.blurTimer = HTTPUtils.getTimerSecond()
        if (!SceneManager.inst.isAloneGame()
            && Player.inst.gameId != CommonCmd.GAME_HOME
            && Player.inst.gameId != CommonCmd.GAME_SCRATCHER
        ) {
            // 告诉当前游戏离开了
            SceneManager.inst.starter?.gameModel?.blurGame()
        }
    }

    /**
     * 登录提示框
     * @deprecated
     */
    showloginTip() {
        this.showLoginTip()

    }

    showLoginTip() {
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.LOGIN, null, Handler.create(this, () => {
            this.showLogin()
        }))
    }

    /** 获取当前屏幕等比例缩放系数 */
    getEqualRatioScale() {
        let point: Point = this.getEqualRatioRatio(GRoot.inst.width, GRoot.inst.height)
        return Math.min(point.x, point.y)
    }

    /** 获取当前屏幕等比例缩放系数 */
    getEqualRatioRatio(w: number, h: number) {
        let s1 = w / this.gameWidth
        let s2 = h / this.gameHeight
        if (Laya.stage.screenMode == Stage.SCREEN_HORIZONTAL) {
            s1 = w / this.gameHeight
            s2 = h / this.gameWidth
        }
        return new Point(s1, s2)
    }


    /**
     * 开启游戏 两个参数二选一  如果使用id第一个必须设置null
     * @param config 游戏配置文件名
     * @param code 游戏id
     */
    openGame(config: string, code = -1) {
        Log.info("openGame -> " + config + " " + code)
        Laya.stage.pauseUpdateTimer = false
        this.removeGroup(App.GAME_GROUP)
        Player.inst.guestModel.clearData()
        HtmlWindow.inst.hide()
        // 处理房间名字
        if (code > 0 || !config) config = GameConfigKit.gameNameCanonical(code)
        // 处理房间号
        if (code <= 0 && config) code = GameConfigKit.gameCode(config)
        if (!config || code <= 0) {
            Log.error("config = " + config, "code = " + code)
            LoadingWindow.inst.hide()
            JSUtils.openModal(getString(LibStr.GAME_NOT_FOUND))
            JSUtils.gameClose()
            return
        }
        Player.inst.gameName = config
        this.isCloseGame = false
        //		// 如果是未登陆状态
//		if (!Player.inst.isGuest && !Player.inst.token) {
//			LoadingWindow.inst.hide()
//			SceneManager.inst.showLogin()
//			return
//		}

        if (!Player.inst.urlParam.isJumpPage())
            GRoot.inst.showModalWait(getString(LibStr.WAITING))

        Player.inst.gameId = code

        // 游戏脚本加载
        let gameResJS = "configs/gameRes" + (AssetsLoader.inst.httpProtocol ? "" : ".min") + ".js"
        let content = ELoader.loader.getRes(gameResJS)
        if (!content) {
            ELoader.loader.load(gameResJS,
                Handler.create(this, this.loadGameResComplete), null, Loader.TEXT)
        } else {
            this.loadGameJs()
        }

    }

    private loadGameResComplete(content: string) {
        if (!content) {
            this.loadResErrorHandler()
            return
        }
        UtilKit.loadScript(content, true, Render.isConchApp ? null : "gameRes.js")
        this.loadGameJs()
    }

    private loadGameJs() {
        let obj = GameConfigKit.gameRes()
        let res = obj.res
        let resName = Player.inst.gameName
        let tempStr: string
        for (let i = 0; i < res.length; i++) {
            tempStr = res[i].url
            if (StringUtil.endsWith(tempStr, fgui.UIConfig.packageFileExtension)) {
                resName = StringUtil.remove(tempStr, "." + fgui.UIConfig.packageFileExtension)
            }
        }

        // 加载游戏的js文件
        AssetsLoader.inst.loadJS(Player.inst.gameName, Handler.create(this, this.loadJsComplete),
            Handler.create(this, this.loadResErrorHandler))
    }

    private loadJsComplete() {
        let obj = GameConfigKit.gameRes()
        // 延迟执行初始化  否则isCall  将失去意义
        // this._starter = obj.completeFun()
        // 已经加载的游戏代码
        if (!Player.inst.urlParam.isJumpPage())
            GRoot.inst.closeModalWait()
        LoadingWindow.inst.show(1, getString(LibStr.LOADING))
        AssetsLoader.inst.loadRes(obj, Handler.create(this, this.loadResComplete),
            Handler.create(this, this.loadResErrorHandler))
    }

    /**
     * 加载资源完成
     */
    private loadResComplete() {
        this.isLoaderResComplete = true
        Log.debug("loadResComplete")
        this.startGameProcess()
    }

    /** 供外部调用 */
    public showGameToView(isDemo: boolean) {
        if (this.initComplete) {
            return
        }
        this.initComplete = true
        Log.debug("showGameToView -> isDemo=" + isDemo)
        Player.inst.isGuest = isDemo
        this.startGameProcess()
    }

    /** 启动游戏进程，继续进入游戏 */
    private startGameProcess() {
        if (this.initComplete && this.isLoaderResComplete || !this.isCall) {
            // 不是游客模式 检查token
            if (!Player.inst.isGuest && Player.inst.token) {
                Player.inst.login.loginToken(this.checkGameState.bind(this))
            } else {
                this.checkGameState({code: 0})
            }
        }
    }

    /** 检查游戏状态 */
    private checkGameState(data: any) {
        if (data?.code == -1) {
            LoadingWindow.inst.hide()
            JSUtils.openModal(StateCode.getShowMessage(data))
            JSUtils.gameClose()
            return
        }
        let obj = GameConfigKit.gameRes()
        this._starter = obj.completeFun()
        AnalyticsManager.openGame()
        Player.inst.status = 1
        // 如果是游客模式
        if (Player.inst.isGuest) {
            Player.inst.cacheMoney = Player.inst.money
            Player.inst.money = Browser.window.demoFreeMoney || 10000
        }
        this.sendAction(ActionLib.GAME_CHECK_STATE, Handler.create(this, this.checkComplete))
    }

    /**
     * 游戏检查完成
     * @private
     */
    private checkComplete() {
        // 初始化用户数据
        this.sendAction(ActionLib.GAME_INIT_SERVLET, Handler.create(this, this.showGameScene))
    }

    /**
     * 显示游戏到舞台上
     *
     */
    private showGameScene() {
        AnalyticsManager.openGame()
        Player.inst.status = 1
        this.sendAction(ActionLib.GAME_CONNECT_SOCKET)
        this.sendAction(ActionLib.GAME_INSERT_EXTENSION)

        MessageTip.clearAll()
        this.sendAction(ActionLib.GAME_INIT_SOCKET_EVENT)
        SoundUtils.stopMusic();// 关闭进入游戏前的音乐
        Log.debug("create scene")
        // 创建游戏到舞台上
        this.sendAction(ActionLib.GAME_CREATE_SCENE_SHOW, Handler.create(this, function () {
            Log.debug("init model and load sound")
            GRoot.inst.closeModalWait()
            this.sendAction(ActionLib.GAME_INIT_MODEL)
            AppRecordManager.executeJson = null
            // 开始加载运行加载的声音
            SoundUtils.load()
            // 开始加载运行加载的资源
            AssetsLoader.inst.runLoad()
            // 启动按键
            TouchManager.I.enable = MouseManager.enabled = KeyBoardManager.enabled = true
//                // 放到下一帧去播放  不然 进入需要旋转的游戏 渲染跟不上
            Laya.timer.callLater(this, function () {
                Log.debug("call close loading")
                LoadingWindow.inst.hide()
                JSUtils.gameOnload()
                Player.inst.guestModel.guestPlayCount = 0
            })
        }))
    }

    /** 加载资源失败 */
    private loadResErrorHandler() {
        GRoot.inst.closeModalWait()
        if (Player.inst.urlParam.isJumpPage()) {
            if (!Render.isConchApp)
                JSUtils.openModal(getString(LibStr.NET_ERROR))
            JSUtils.gameClose()
            AppManager.gameRestart()
            Player.inst.gameId = CommonCmd.GAME_HOME
            return
        }
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.NET_ERROR, null, Handler.create(this, function () {
            LoadingWindow.inst.hide()
            JSUtils.gameClose()
            Player.inst.gameId = CommonCmd.GAME_HOME
        }))
    }

    /** 游戏内部返回按钮被点击 */
    backHandler() {
        JSUtils.gameClose()
        SoundUtils.clear()
        Laya.timer.callLater(this, function () {
            Player.inst.urlParam.clearJumpPage()
        })
    }

    /** 关闭当前的游戏 */
    closeGame() {
        Log.debug("SceneManager.closeGame")
        if (!Laya.loader) return
        this.isCloseGame = true
        // 关闭所有按键
        TouchManager.I.enable = MouseManager.enabled = KeyBoardManager.enabled = false
        Laya.stage.pauseUpdateTimer = true
        Laya.timer.clearAllTimer()

        Laya.loader.clearUnLoaded()
        SoundManager.stopAll()
        AnalyticsManager.closeGame()
        MessageTip.clearAll()
        PromptWindow.inst.clearCache()

        if (SocketManager.inst.roomId != Cmd.PROT_HOME)
            SocketManager.inst.close()

        this.sendAction(ActionLib.GAME_DISPOSE)
        this.sendAction(ActionLib.GAME_CLEAR_RES)
        this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN)

        if (UIPackage.getByName("gameCommon"))
            WaitResult.inst.hide()

        if (Player.inst.gameId != CommonCmd.GAME_HOME) {
            if (Player.inst.isGuest)
                Player.inst.money = Player.inst.cacheMoney

            Player.inst.cacheMoney = 0
            Player.inst.gameData = null
            Player.inst.isGuest = false
            Player.inst.gameId = CommonCmd.GAME_HOME
        }
        // 退出游戏后  可能会导致访问资源变化  这里在调用一次资源路径设置
        if (ELoader.checkBaseUrl) URL.basePath = ELoader.checkBaseUrl()[0]
        AppManager.onProfileSignOff()

        Templet["TEMPLET_DICTIONARY"] = {}
        this.removeGroup(App.GAME_GROUP)
    }

    /**
     * 切换游戏
     * @param config 游戏名字
     * @param code 游戏id
     *
     */
    changeScene(config: string, code: number) {
        if (Player.inst.gameId != code) {
            this.closeGame()
            this.openGame(config, code)
        } else {
            // 有可能是从游戏中弹出的网页  然后从游戏中返回到游戏 app专有操作
            this._starter?.updateScreenOrientation()
        }
    }

    /** 当前游戏是否是单机版 */
    isAloneGame() {
        if (Player.inst.gameId == CommonCmd.GAME_HOME) {
            return false
        }
        return this.checkAloneGame(Player.inst.gameId)
    }

    /**
     * 检查是否是单机版
     * @param gameId 游戏id
     * @return
     *
     */
    checkAloneGame(gameId: number) {
        return true
    }

    /** 获取游戏开奖结果超时退出游戏 */
    gameGameTimeOutExit() {
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.GET_GAME_RESULTS_TIME_OUT, null, Handler.create(this, function () {
            this.sendAction(ActionLib.GAME_RECONNECTION_NET, Handler.create(this, function () {
                Laya.timer.callLater(this, function () {
                    if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                        AppRecordManager.backHistory()
                        AnalyticsManager.send("exit_game_net_timeout_error_" + Player.inst.gameId)
                    }
                })
            }))
        }))
    }

    /** 游戏报错 退出游戏 */
    gameErrorExit() {
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.GAME_ERROR, null, Handler.create(this, function () {
            this.sendAction(ActionLib.GAME_RECONNECTION_NET, Handler.create(this, function () {
                Laya.timer.callLater(this, function () {
                    if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                        AnalyticsManager.send("exit_game_net_error_" + Player.inst.gameId)
                        JSUtils.gameClose()
                    }
                })
            }))
        }))
    }

    /**
     * 出乎意料的退出游戏
     * @param msg
     * @param callback
     */
    unexpectedExitGame(msg?: string, callback?: ParamHandler) {
        msg = msg ? msg : getString(LibStr.GAME_ERROR)
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg, null, Handler.create(this, function () {
            Laya.timer.callLater(this, function () {
                if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                    AppRecordManager.backHistory()
                }
                runFun(callback)
            })
        }))
    }

    /** 更新当前游戏中的游戏金币 */
    public updateGlod() {
        this.sendAction(ActionLib.GAME_UPDATE_MONEY)
    }

    get starter() {
        return this._starter
    }

    get scene() {
        return this._starter.baseScene
    }

    /**
     * 上传错误日志
     * @param data json格式的错误数据
     */
    sendErrorLog(data: any) {
        let postUrl = Player.inst.data.getErrorUrl()
        if (StringUtil.isEmpty(postUrl) || !StringUtil.beginsWith(postUrl, "http")) {
            return
        }
        HTTPUtils.create()
            .setMethod("post")
            .setOvertime(0)
            .setUrl(postUrl)
            .setData(data)
            .call()
    }


}

