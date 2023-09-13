import Stage = Laya.Stage;
import SoundManager = Laya.SoundManager;
import UIPackage = fgui.UIPackage;
import {BaseProxy} from "./BaseProxy"
import {IGameModel} from "../interfaces/IGameModel"
import {IGameScene} from "../interfaces/IGameScene"
import {IGameServlet} from "../interfaces/IGameServlet"
import {IHomeModel} from "../interfaces/IHomeModel"
import {ActionLib} from "../actions/ActionLib"
import {NoticeView} from "../view/NoticeView"
import {Player} from "../Player"
import {AppManager} from "../manager/AppManager"
import {SocketManager} from "../net/SocketManager"
import {ConfigUtils} from "../utils/ConfigUtils"
import {StringUtil} from "../utils/StringUtil"
import {AssetsLoader} from "../manager/AssetsLoader"
import {LoaderConfig} from "../configs/LoaderConfig"
import {SceneManager} from "../manager/SceneManager"
import {LibStr} from "../LibStr"
import {Log} from "../Log";
import {Cmd} from "../net/Common";
import {BaseGameData} from "./BaseGameData";

/**
 *
 * @author boge
 *
 */
export class GameModel<T = BaseGameData> extends BaseProxy implements IGameModel {

    protected _gameScene: IGameScene
    protected _gameServlet: IGameServlet
    /** 游戏番号 */
    protected _gameCode: number
    /** 原始音乐备份 */
    protected musicBack: any
    /** 大厅model */
    private _homeModel: IHomeModel
    /** 当前屏幕方向 */
    gameScreenType = Stage.SCREEN_VERTICAL
    /** 任务 */
    protected tasks: { args: any, handler: ParamHandler }[] = []

    protected constructor() {
        super()
        this.regGameAction(ActionLib.GAME_CLEAR_RES, this, this.clearRes)
        this.regGameAction(ActionLib.GAME_INSERT_EXTENSION, this, this.insertExtension)
        this.regGameAction(ActionLib.GAME_INIT_SOCKET_EVENT, this, this.initSocketEvent)
        this.regGameAction(ActionLib.GAME_INIT_MODEL, this, this.initModel)
        this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose)
        this.regGameAction(ActionLib.GAME_LOTTERY_ANI_COMPLETE, this, this.lotteryComplete)

    }

    initModel() {
        this.setupMusic()
    }

    initSocketEvent() {
        this.addSocketEvent(Cmd.SOCKET_MONEY_CHANGE, this.moneyChange.bind(this))
        this.addSocketEvent(Cmd.SOCKET_GOLD_CHANGE, this.moneyChange.bind(this))
        this.addSocketEvent(Cmd.SOCKET_TOP_UP_CHANGE, this.moneyChange.bind(this))
        // this.addSocketEvent(Cmd.SOCKET_NOTIFICATION, this.notificationHandler.bind(this))
        this.addSocketEvent(Cmd.SOCKET_SHOW_NOTICE, this.showNotice.bind(this))
    }

    private showNotice(obj) {
        let notice = this.getView(NoticeView)
        if (notice) (<NoticeView>notice).showText(obj.data)
    }

    /** 通知资金变化 */
    private moneyChange(obj: any) {
//        if (homeModel) homeModel.moneyChange(obj)
        if (Player.inst.isGuest) return; // 如果是游客  那就不调用资金更新
        if (obj && obj.balance) {
            switch (obj.type) {
                case Cmd.SOCKET_MONEY_CHANGE:
                    // Player.inst.setMoney(obj.balance)
                    // this.sendAction(Action.GAME_UPDATE_MONEY)
                    break
                case Cmd.SOCKET_GOLD_CHANGE:
                    // Player.inst.setMoney(obj.balance, 1)
                    break
                case Cmd.SOCKET_TOP_UP_CHANGE:
                    Player.inst.money = obj.balance
                    this.sendAction(ActionLib.GAME_UPDATE_MONEY)
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, [LibStr.RECHARGE_SUCCESS,
                        Player.inst.getCurrencyUnit() + " " + obj.amount])
                    break
                default:
                    break
            }
        }
    }

    /** 通知信息 */
    private notificationHandler(obj: any) {
        obj = obj.message
        // obj.title, obj.text, obj.ticker, obj.subText, obj.open
        if (Player.inst.isWeb) {
            function show() {
                let notification = new Notification(obj.title, {body: obj.text, icon: "favicon.ico"})
            }

            function regP() {
                Notification.requestPermission(function (status) {
                    if (Notification.permission !== status) {
                        // Notification.permission = status
                        if (Notification.permission === "granted") {
                            show()
                        }
                    }
                }).then(r => {

                })
            }

            if (Notification) {
                if (Notification.permission === "granted") {
                    show()
                } else {
                    regP()
                }
            }
//			__JS__("notification.onclick = function(){notification.close()}")
        } else {
            AppManager.sendNotification(obj)
        }
    }


    /**
     * 计划任务
     * @param args 参数
     * @param handler
     */
    addTask(args: any, handler: ParamHandler) {
        this.tasks.push({args: args, handler: handler})
    }

    /**
     * 执行一次预计划任务
     */
    runTask() {
        if (this.tasks.length > 0) {
            for (let i = 0; i < this.tasks.length; i++) {
                let task = this.tasks.shift()
                runFun(task.handler, task.args)
            }
        }
    }

    /**
     * 注册socket 事件
     * @param type
     * @param callback
     */
    addSocketEvent(type: number, callback: ParamHandler) {
        SocketManager.inst.addSocketEvent(type, callback)
    }

    removeSocketEvent(type: number) {
        SocketManager.inst.removeSocketEvent(type)
    }

    clearRes() {
        let configName = ConfigUtils.gameNameCanonical()
        if (StringUtil.isEmpty(configName)) return
        let loadObj = ConfigUtils.gameRes(configName)
        if (loadObj) {
            let fuiName: string
            let res = loadObj.res
            for (let k = 0; k < res.length; k++) {
                fuiName = res[k].url
                if (fuiName.indexOf(fgui.UIConfig.packageFileExtension) != -1) {
                    fuiName = StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension)
                    break
                }
            }

            let pack = UIPackage.getByName(fuiName)
            if (pack) UIPackage.removePackage(pack.id)
            AssetsLoader.checkBranch(res)
            LoaderConfig.clear(res)
            Log.debug("GameModel.clearRes() " + fuiName + " uninstall")
        }
    }

    /** 设置游戏音乐 */
    protected setupMusic() {
    }

    /** 还原游戏音乐 */
    protected resetMusic() {
        if (this.musicBack) {
            SoundManager.soundMuted = this.musicBack.soundMuted
            SoundManager.musicMuted = this.musicBack.musicMuted
        }
    }

    /** 子类实现 */
    insertExtension() {
    }

    /** 通知开奖结束  进入结束流程 */
    protected lotteryComplete() {
    }

    /** 游戏进入后台执行 */
    blurGame() {
        Log.debug("blurGame")
    }

    /** 游戏进入前台执行 */
    focusGame() {
        Log.debug("focusGame")
    }

    get gameScene() {
        if (this._gameScene == null) this._gameScene = SceneManager.inst.starter.baseScene
        return this._gameScene
    }

    get gameServlet() {
        this._gameServlet ??= SceneManager.inst.starter.gameServlet
        return this._gameServlet
    }

    override dispose() {
        super.dispose()
        this.resetMusic()
    }

    set gameCode(value: number) {
        this._gameCode = value
    }

    get gameCode() {
        return this._gameCode
    }

    socketHandler(obj: any) {
    }

    get homeModel() {
        return this._homeModel
    }

    set gameScene(value: IGameScene) {
        this._gameScene = value
    }

    set gameServlet(value: IGameServlet) {
        this._gameServlet = value
    }

    protected get gameData(): T {
        return Player.inst.gameData as T
    }
    /**
     * @deprecated
     */
    protected set gameData(value: T) {
        Log.debug(value)
    }

}