import Stage = Laya.Stage;
import SoundManager = Laya.SoundManager;
import UIPackage = fgui.UIPackage;
import EProxy = tsCore.EProxy;
import Log = tsCore.Log;
import StringUtil = tsCore.StringUtil;
import Render = Laya.Render;
import {IGameModel} from "../interfaces/IGameModel"
import {IGameScene} from "../interfaces/IGameScene"
import {IGameServlet} from "../interfaces/IGameServlet"
import {IHomeModel} from "../interfaces/IHomeModel"
import {ActionLib} from "../ActionLib"
import {NoticeView} from "../view/NoticeView"
import {Player} from "../Player"
import {AppManager} from "../manager/AppManager"
import {SocketManager} from "../net/SocketManager"
import {SceneManager} from "../manager/SceneManager"
import {LibStr} from "../LibStr"
import {Cmd} from "../net/Common";
import {BaseGameData} from "./BaseGameData";
import {GameConfigKit} from "../kit/GameConfigKit";
import {LoaderConfig} from "../configs/LoaderConfig";
import {AssetsLoader} from "../manager/AssetsLoader";
import {IGameData} from "../Interfaces";
import {PromptWindow} from "../view/PromptWindow";

/**
 *
 * @author boge
 */
export class GameModel<T extends IGameData = BaseGameData> extends EProxy implements IGameModel {
    /**
     * @deprecated
     */
    protected _gameScene: IGameScene
    /**
     * @deprecated
     */
    protected _gameServlet: IGameServlet
    /** 游戏番号 */
    protected _gameCode: number
    /** 原始音乐备份 */
    protected musicBack: any
    /** 大厅model
     * @deprecated
     */
    private _homeModel: IHomeModel
    /** 当前屏幕方向 */
    gameScreenType = Stage.SCREEN_VERTICAL
    /** 任务 */
    protected tasks: { args: any, handler: ParamHandler }[] = []
    /** 延迟发送获得bonus通知
     * @default 200 ms
     */
    protected delayGetBonus = 200
    /** 延迟下一轮游戏开始通知
     * @default 200 ms
     */
    protected delayNextRound = 200

    protected constructor() {
        super()
        this.regGameAction(ActionLib.GAME_CLEAR_RES, this, this.clearRes)
        this.regGameAction(ActionLib.GAME_INIT_SOCKET_EVENT, this, this.initSocketEvent)
        this.regGameAction(ActionLib.GAME_INIT_DATA, this, this.initModel)
        this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose)
        this.regGameAction(ActionLib.GAME_LOTTERY_ANI_COMPLETE, this, this.lotteryComplete)

        this.sendAction(ActionLib.GAME_INSERT_EXTENSION)
        this.insertExtension()

    }

    initModel() {
        this.setupMusic()
    }

    initSocketEvent() {
        this.addSocketEvent(Cmd.SOCKET_MONEY_CHANGE, this.onMoneyChange.bind(this))
        this.addSocketEvent(Cmd.SOCKET_GOLD_CHANGE, this.onMoneyChange.bind(this))
        this.addSocketEvent(Cmd.SOCKET_TOP_UP_CHANGE, this.onMoneyChange.bind(this))
        // this.addSocketEvent(Cmd.SOCKET_NOTIFICATION, this.onNotification.bind(this))
        this.addSocketEvent(Cmd.SOCKET_SHOW_NOTICE, this.onNotice.bind(this))
    }

    private onNotice(obj) {
        let notice = this.getView(NoticeView)
        if (notice) (<NoticeView>notice).showText(obj.data)
    }

    /** 通知资金变化 */
    private onMoneyChange(obj: any) {
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
                    PromptWindow.inst.showTip([LibStr.RECHARGE_SUCCESS,
                        Player.inst.getCurrencyUnit() + " " + obj.amount])
                    break
                default:
                    break
            }
        }
    }

    /** 通知信息 */
    private onNotification(obj: { message: { title: string, text: string, subText: string, open: string } }) {
        const mes = obj.message
        if (!Render.isConchApp) {
            function show() {
                let notification = new Notification(mes.title, {body: mes.text, icon: "favicon.ico"})
                notification.onclick = function () {
                    notification.close()
                }
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
        this.tasks.forEach(value =>
            runFun(value.handler, value.args)
        )
        this.tasks.length = 0
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
        let configName = GameConfigKit.gameNameCanonical()
        if (StringUtil.isEmpty(configName)) return
        let loadObj = GameConfigKit.gameRes(configName)
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

    /**
     * 通知开奖结束  进入结束流程
     *
     * @example
     *
     * this.sendAction(ActionLib.GAME_UPDATE_WIN_VALUE)
     * Player.inst.money = this.gameData.currentBalance
     * if (this.gameData instanceof BaseSlotGameData) {
     *     if (this.gameData.hasReSpin) {
     *         Laya.timer.once(this.delayNextRound, this, function () {
     *             this.sendAction(ActionLib.GAME_START)
     *         })
     *         return
     *     }
     *     if (this.gameData.isFreeModel && this.gameData.freeCount > 0) { //如果在特殊场景里面
     *         Laya.timer.once(this.delayNextRound, this, function () {
     *             this.sendAction(ActionLib.GAME_START)
     *         })
     *         return
     *     }
     *     // 开出三个免费游戏启动项目  并且服务端告诉有免费游戏
     *     if (this.gameData.freeBoundsCount >= 3 && this.gameData.hasFreeSpin != 0) {
     *         this.gameData.tempServerWinMoney = this.gameData.serverWinMoney
     *         // 交给scene处理
     *         Laya.timer.once(this.delayGetBonus, this, () => {
     *             this.sendAction(ActionLib.GAME_START)
     *         })
     *         return
     *     }
     *     // 如果是开大奖结束  显示总共赢的钱
     *     if (this.gameData.hasFreeSpin != 0) {
     *         this.gameData.hasFreeSpin = 0
     *         this.sendAction(ActionLib.GAME_SHOW_FREE_OUT_WINDOW)
     *         return
     *     }
     * }
     * this.sendAction(ActionLib.GAME_ALL_BTN_CHANGE_STATE, false)
     * this.sendAction(ActionLib.GAME_START)
     *
     */
    protected lotteryComplete() {
        this.sendAction(ActionLib.GAME_UPDATE_WIN_VALUE)
        Player.inst.money = this.gameData.currentBalance
        // 保证所有按钮都在禁用状态
        this.sendAction(ActionLib.GAME_ALL_BTN_CHANGE_STATE, false)

        this.sendAction(ActionLib.GAME_START)
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
        this._gameScene ??= SceneManager.inst.starter.baseScene
        return this._gameScene
    }

    get gameServlet() {
        this._gameServlet ??= SceneManager.inst.starter.gameServlet
        return this._gameServlet
    }

    /**
     * 已做以下处理
     * @example
     * ● 清除该类所有的定时器
     * ● 还原默认的声音开关配置
     * ● super.dispose()
     *
     */
    override dispose() {
        Laya.timer.clearAll(this)
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

    /**
     * @deprecated
     */
    get homeModel() {
        return this._homeModel
    }

    /**
     * @deprecated
     */
    set gameScene(value: IGameScene) {
        this._gameScene = value
    }

    /**
     * @deprecated
     */
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