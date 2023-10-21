import Handler = Laya.Handler;
import Browser = Laya.Browser;
import Render = Laya.Render;
import Utils = Laya.Utils;
import Log = tsCore.Log;
import App = tsCore.App;
import {IExecuteData} from "../Interfaces";
import {Player} from "../Player";
import {CommonCmd, HttpCode} from "../net/Common";
import {AppManager} from "./AppManager";
import {LibStr} from "../LibStr";
import {SocketManager} from "../net/SocketManager";
import {SceneManager} from "./SceneManager";
import {BaseScene} from "../core/BaseScene";
import {HtmlWindow} from "../view/HtmlWindow";
import {ActionLib} from "../ActionLib";

/**
 * app 访问记录管理
 * @author boge
 */
export class AppRecordManager extends tsCore.HistoryManager {


    /** 进入大厅后执行命令 */
    static executeJson: IExecuteData
    /** 退出点击上一次时间 */
    private static exitTimer = 0

    /**
     * 退出游戏
     * @param [isBack = false] 是否用的返回键（非项目内的）
     *
     */
    static backGame(isBack = false) {
        Log.debug(`backGame isBack=${isBack}`)
        if (AppRecordManager.pauseHistory) {
            if (isBack) {// 键盘返回
                if (!Browser.onLayaRuntime) AppRecordManager.addNewHistory()
            } else {
            }
//			    MessageTip.showTip(CommonCmd.NOT_EXIT_GAME)
            return
        }
        const history = AppRecordManager.history
        if (history.length === 0) return
        let array = history[history.length - 1]
        if (array?.newPage instanceof BaseScene) {
            AppRecordManager.back(isBack)
        } else {
            AppRecordManager.back(isBack)
            if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                AppRecordManager.backGame(isBack)
            }
        }
    }

    /**
     * 返回操作
     * @param isBack 是否用的返回键（非项目内的）
     * @internal
     */
    static _backHistory(isBack = false) {
        Log.debug(`_backHistory isBack=${isBack}`)
        const history = AppRecordManager.history
        if (history.length > 0 && (history[history.length - 1].newPage instanceof fgui.Window || !AppRecordManager.pauseHistory)) {
            let array = history[history.length - 1]
            if (isBack && array.newPage instanceof BaseScene) {
                AppRecordManager.backGame(isBack)
                return
            }
            AppRecordManager.back(isBack)
        } else {
            // 没有缓存页  退出游戏
            if (Render.isConchApp && isBack) {// 非网页版并且是在安卓设备上
                let timer = Browser.now()
                if (timer - AppRecordManager.exitTimer < 2000) {// 在指定的时间内
                    AppRecordManager.exitTimer = 0
                    AppManager.exit()
                    return
                }
                AppRecordManager.exitTimer = timer
                AppManager.toast(getString(LibStr.EXIT_APP))
            } else {
//					__JS__("window.history.back()")
            }
        }
    }

    /**
     * app手机调用js方法
     * @param action 执行动作
     * @param value 执行命令
     *
     */
    static appRunJs(action: number, ...value: any[]) {
        Log.debug(`appRunJs action=${action} values=${value.join(',')}`)
        switch (action) {
            case 1:// 返回
                if (Player.inst.gameId == CommonCmd.GAME_SPORTS && value[0] != "close") {
                    AppManager.IsBackHome()
                    return
                }
                AppRecordManager.backHistory(true)
                break
            case 2:// 获得手机图片数据
                App.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value)
                break
            case 3:// socket
                if (value.length > 0) {
                    if (Player.inst.gameId == CommonCmd.GAME_HOME || Player.inst.gameId == CommonCmd.GAME_SCRATCHER) {
                        SocketManager.inst.onMessageReceived(value[0])
                    } else {
                        SocketManager.inst.onMessageReceived(value[0])
                    }
                }
                break
            case 10008:
                SceneManager.inst.openGame(null, value[0])
                break
            case 1000:// 与java交互
                let str: string = value[0]
                Log.info(str)
                let json: IExecuteData = JSON.parse(str)
                let token: string = json.token
                if (token) {
                    Player.inst.token = token
                    Player.inst.login.loginToken((data: any) => {
                        if (data?.code == HttpCode.OK) {
                            if (Player.inst.gameId != -1) {
                                AppRecordManager.JavaSendOpen(json)
                            } else {
                                AppRecordManager.executeJson = json
                            }
                        }
                    })
                } else {
                    if (Player.inst.gameId != -1) {
                        AppRecordManager.JavaSendOpen(json)
                    } else {
                        AppRecordManager.executeJson = json
                    }
                }
                break
            default:
                break

        }
    }

    /**
     * 自定义 JavaSendOpen 处理  返回 true 表示已经处理 后续不再继续了
     */
    static customJavaSendOpen: (value: any) => boolean

    /**
     * java 传入要求打开的内容
     * @param json
     */
    static JavaSendOpen(json: IExecuteData) {
        if (!json) return
        if (typeof json === "string") {
            json = JSON.parse(json)
        }
        if (AppRecordManager.customJavaSendOpen && AppRecordManager.customJavaSendOpen(json)) {
            return
        }

        Player.inst.urlParam.parseData(json)
        Log.debug(`JavaSendOpen() type=${json.type}`)
        Log.debug(`JavaSendOpen() openGame=${json.openGame}`)
        Log.debug(`JavaSendOpen() gameName=${json.gameName}`)
        if (!Player.inst.isGuest && json.token) {
            Player.inst.login.loginToken(Handler.create(null, function (data: any) {
                AppRecordManager.open(json)
            }))
        } else {
            AppRecordManager.open(json)
        }
    }

    private static open(json: any) {
        Log.debug(`open() json=${JSON.stringify(json)}`)
        switch (json.type) {
            case 1:// 打开网页
                HtmlWindow.inst.showTip(json.data)
                AppRecordManager.executeJson = null
                break
            case 2:// 进入游戏
                SceneManager.inst.openGame(json.gameName, Utils.parseInt(json.data) || Utils.parseInt(json.openGame) || -1)
                // SceneManager.inst.changeScene(
                //     json.gameName,
                //     Utils.parseInt(json.data) || Utils.parseInt(json.openGame) || -1)
                break
            default:
                // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                if (SceneManager.inst.starter)
                    SceneManager.inst.starter.updateScreenOrientation()
                break
        }

    }

}

Object.defineProperty(tsCore.HistoryManager, "backHistory", {value: AppRecordManager._backHistory})