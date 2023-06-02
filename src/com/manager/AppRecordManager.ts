import Handler = Laya.Handler
import Browser = Laya.Browser
import Render = Laya.Render
import Utils = Laya.Utils
import {BaseScene} from "../core/BaseScene"
import {Player} from "../Player"
import {AppManager} from "./AppManager"
import {Factory} from "../Factory"
import {SocketManager} from "../net/SocketManager"
import {SceneManager} from "./SceneManager"
import {HtmlWindow} from "../view/HtmlWindow"
import {LanguageUtils} from "../utils/LanguageUtils"
import {ActionLib} from "../actions/ActionLib"
import {LibStr} from "../LibStr"
import {Log} from "../Log";
import {IExecuteData, IRecord} from "../interfaces/ICommon";
import {CommonCmd, HttpCode} from "../net/Common";

/**
 * app 访问记录管理
 * @author boge
 */
export class AppRecordManager {

    /**
     * 访问记录
     */
    private static history: {
        /** 当前的面板 */
        current: IRecord,
        /** 要跳转的新面板 */
        newPage: IRecord
    }[] = []
    /** 退出点击上一次时间 */
    private static exitTimer = 0
    /** 暂停返回上一页 */
    static pauseHistory = false
    /** 进入大厅后执行命令 */
    static executeJson: IExecuteData

    /**
     * 添加一个记录
     * @param currentPage 当前的面板
     * @param newPage 添加的新面板
     */
    static addHistory(currentPage: IRecord, newPage: IRecord) {
        // Log.debug("addHistory")
        AppRecordManager.history.push({current: currentPage, newPage: newPage})
    }

    /**
     * 作废指定的记录
     * @param value 记录页面
     *
     */
    static invalidHistory(value: IRecord) {
        // Log.debug("invalidHistory")
        if (AppRecordManager.history.length > 0) {
            for (let i = 0; i < AppRecordManager.history.length; i++) {
                if (AppRecordManager.history[i]?.newPage == value) {
                    AppRecordManager.history.splice(i, 1)
                    break
                }
            }
        }
    }

    /**
     * 退出游戏
     * @param [isBack = false] 是否用的返回键（非项目内的）
     *
     */
    static backGame(isBack = false) {
        if (AppRecordManager.pauseHistory) {
            if (isBack) {// 键盘返回
                if (!Render.isConchApp) Browser.window.addNewHistory()
            } else {
            }
//			    MessageTip.showTip(CommonCmd.NOT_EXIT_GAME)
            return
        }
        if (history.length === 0) return
        let array = AppRecordManager.history[AppRecordManager.history.length - 1]
        if (array?.newPage instanceof BaseScene) {
            AppRecordManager.back(isBack)
        } else {
            AppRecordManager.back(isBack)
            if (Player.inst.gameModel != CommonCmd.GAME_HOME) {
                AppRecordManager.backGame(isBack)
            }
        }
    }

    /**
     * 返回操作
     * @param isBack 是否用的返回键（非项目内的）
     *
     */
    static backHistory(isBack = false) {
        if (AppRecordManager.history.length > 0 && (AppRecordManager.history[AppRecordManager.history.length - 1].newPage instanceof fgui.Window || !AppRecordManager.pauseHistory)) {
            let array = AppRecordManager.history[AppRecordManager.history.length - 1]
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
                AppManager.toast(LanguageUtils.inst.getStr(LibStr.EXIT_APP))
            } else {
//					__JS__("window.history.back()")
            }
        }
    }

    /** 执行非大厅后退 */
    private static back(isBack = false) {
        if (AppRecordManager.history.length > 0) {
            let array = AppRecordManager.history.pop()
            array?.newPage?.hideRecord()
            array?.current?.showRecord()
            if (isBack) {// 键盘返回
                if (!Render.isConchApp)
                    Browser.window.addNewHistory()
            } else {
            }
        }
    }

    /**
     * app手机调用js方法
     * @param action 执行动作
     * @param value 执行命令
     *
     */
    static appRunJs(action: number, ...value) {
        switch (action) {
            case 1:// 返回
                if (Player.inst.gameModel == CommonCmd.GAME_SPORTS && value[0] != "close") {
                    AppManager.IsBackHome()
                    return
                }
                AppRecordManager.backHistory(true)
                break
            case 2:// 获得手机图片数据
                Factory.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value)
                break
            case 3:// socket
                if (value.length > 0) {
                    if (Player.inst.gameModel == CommonCmd.GAME_HOME || Player.inst.gameModel == CommonCmd.GAME_SCRATCHER) {
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
                            if (Player.inst.gameModel != -1) {
                                AppRecordManager.JavaSendOpen(json)
                            } else {
                                AppRecordManager.executeJson = json
                            }
                        }
                    })
                } else {
                    if (Player.inst.gameModel != -1) {
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
        if (json == null) return
        if (typeof json === "string") {
            json = JSON.parse(json)
        }
        if (AppRecordManager.customJavaSendOpen != null && AppRecordManager.customJavaSendOpen(json)) {
            return
        }

        Player.inst.urlParam.parseData(json)
        Log.info("JavaSendOpen() type = " + json.type)
        Log.info("JavaSendOpen() openGame = " + json.openGame)
        Log.info("JavaSendOpen() gameName = " + json.gameName)
        if (!Player.inst.isGuest && json.token) {
            Player.inst.login.loginToken(Handler.create(null, function (data: any) {
                AppRecordManager.open(json)
            }))
        } else {
            AppRecordManager.open(json)
        }
    }

    private static open(json: any) {
        switch (json.type) {
            case 1:// 打开网页
                HtmlWindow.inst.showTip(json.data)
                AppRecordManager.executeJson = null
                break
            case 2:// 进入游戏
                SceneManager.inst.changeScene(json.gameName, Utils.parseInt(json.data) || Utils.parseInt(json.openGame) || -1)
                break
            default:
                // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                if (SceneManager.inst.starter)
                    SceneManager.inst.starter.updateScreenOrientation()
                break
        }

    }

    /**
     * 长度
     * @return
     */
    static len() {
        return AppRecordManager.history.length
    }

    /** 清理所有页面缓存 */
    static clearHistory() {
        Log.debug("clearHistory")
//		for (let i:number = 0; i < history.length; i++) {
//			let historyElement:IRecord = history[i]
//			historyElement.hideRecord()
//		}
        AppRecordManager.history.splice(0, AppRecordManager.history.length)
    }

}
