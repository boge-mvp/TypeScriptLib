import Render = Laya.Render
import {SceneManager} from "./SceneManager"
import {HtmlWindow} from "../view/HtmlWindow"
import {AppManager} from "./AppManager"
import {Player} from "../Player"
import {AppRecordManager} from "./AppRecordManager"
import HTTPUtils = tsCore.HTTPUtils;

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
    openApp(packageName: string, uriPath: string, url: string, jsonData = null) {
        if (Render.isConchApp) {
            AppManager.openApp(packageName, uriPath, url, jsonData)
        } else {
            let json: string = HTTPUtils.parseJson(jsonData)
            Player.inst.windowOpen(url + (json ? "?" + json : ""))
        }
    }

    showGame(str: string) {
        let data = JSON.parse(str)
        AppRecordManager.JavaSendOpen(data)
    }


}