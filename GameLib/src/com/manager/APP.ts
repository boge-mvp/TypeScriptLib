import Render = Laya.Render
import HTTPUtils = tsCore.HTTPUtils
import HistoryManager = tsCore.HistoryManager;
import Log = tsCore.Log;
import {SceneManager} from "./SceneManager"
import {HtmlWindow} from "../view/HtmlWindow"
import {AppManager} from "./AppManager"
import {Player} from "../Player"
import {AppRecordManager} from "./AppRecordManager"
import {IExecuteData} from "../Interfaces";

export class APP {

    private static _instance: APP

    static get inst(): APP {
        this._instance ??= new APP()
        return this._instance
    }

    openGame(gameId: number) {
        SceneManager.inst.openGame(null, gameId)
    }

    hide() {
        HtmlWindow.inst.hide()
    }

    share(type: number, url: string, content: string) {
        HtmlWindow.inst.share(type, url, content)
    }

    /** 打开app */
    openApp(packageName: string, uriPath: string, url: string, jsonData?: any) {
        if (Render.isConchApp) {
            AppManager.openApp(packageName, uriPath, url, jsonData)
        } else {
            let json = HTTPUtils.parseJson(jsonData)
            Player.inst.windowOpen(url + (json ? "?" + json : ""))
        }
    }

    showGame(str: string) {
        AppRecordManager.JavaSendOpen(JSON.parse(str))
    }

    closeGame() {
        SceneManager.inst.closeGame()
    }

    guest(value = true) {
        SceneManager.inst.showGameToView(value)
    }

    /**
     * 返回键
     */
    appKeyBack(value = true) {
        HistoryManager.backHistory(value)
    }

    // /**
    //  * app手机调用js方法
    //  * @param action 执行动作
    //  * @param value 执行命令
    //  *
    //  */
    // appRunJs(action: number, ...value) {
    //     switch (action) {
    //         case 2:// 获得手机图片数据
    //             App.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value)
    //             break
    //         default:
    //             break
    //
    //     }
    // }

    /**
     * app回调数据
     * @param json
     */
    callback(json: IExecuteData) {
        if (!json) return
        if (typeof json === "string") {
            json = JSON.parse(json)
        }
        if (AppRecordManager.customJavaSendOpen && AppRecordManager.customJavaSendOpen(json)) return

        Player.inst.urlParam.parseData(json)
        Log.debug("JavaSendOpen() type = " + json.type)
        Log.debug("JavaSendOpen() openGame = " + json.openGame)
        Log.debug("JavaSendOpen() gameName = " + json.gameName)
        if (!Player.inst.isGuest && json.token) {
            Player.inst.login.loginToken((data: any) => {
                this.open(json)
            })
        } else {
            this.open(json)
        }
    }

    open(json: IExecuteData) {
        switch (json.type) {
            case 1:// 打开网页
                if (typeof json.data !== "string") return
                HtmlWindow.inst.showTip(json.data)
                AppRecordManager.executeJson = null
                break
            case 2:// 进入游戏
                if (typeof json.data === "number")
                    SceneManager.inst.changeScene(json.gameName, json.data || -1)
                else if (typeof json.openGame === "number")
                    SceneManager.inst.changeScene(json.gameName, json.openGame || -1)
                break
            default:
                // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                SceneManager.inst.starter?.updateScreenOrientation()
                break
        }

    }


}