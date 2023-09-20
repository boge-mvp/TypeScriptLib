import Browser = Laya.Browser
import Render = Laya.Render
import {AppManager} from "../manager/AppManager"
import {SceneManager} from "../manager/SceneManager"
import {Player} from "../Player"
import Log = tsCore.Log;

export class JSUtils {

    /**
     * 刷新页面  如果有父页面  刷新父页面
     */
    static reloadAll() {
        if (Browser.window.parent) {
            Browser.window.parent.location.reload()
        } else {
            Browser.window.location.reload()
        }
    }

    /** 刷新 */
    static reload() {
        Browser.window.location.reload()
    }

    /** 进入登录界面 */
    static login() {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.comeWebPage("/login")
        }
        AppManager.showWeb({javascript: "window.GameToHall.comeWebPage('/login')"})
        SceneManager.inst.closeGame()
    }

    /** 充值 */
    static deposit() {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.comeWebPage("/deposit")
        }
        AppManager.showWeb({javascript: "window.GameToHall.comeWebPage('/deposit')"})
        SceneManager.inst.closeGame()
    }

    /** 进入刮刮卡 */
    static jackpot() {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.comeWebPage("/jackpot")
        }
        AppManager.showWeb({javascript: "window.GameToHall.comeWebPage('/jackpot')"})
        SceneManager.inst.closeGame()
    }

    /** 关闭游戏
     * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
     * @param [data = null]
     * */
    static gameClose(type = 0, data = null) {
        SceneManager.inst.initComplete = false
        SceneManager.inst.isLoaderResComplete = false
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.gameClose(type, data)
        } else {
            if (!Render.isConchApp && Browser.window.location.protocol == "https:") {
                // 如果不是加速器 并且不是在非https下  那么直接返回大厅
                // Browser.window.location.href = Player.HOME_URL
                Browser.window.location.href = "//" + Browser.window.location.host
            }
        }
        AppManager.showWeb({javascript: "window.GameToHall.gameClose(" + type + ", " + data + ")"})
        SceneManager.inst.closeGame()
    }

    /** 弹窗 */
    static openModal(value: string) {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.openModal(value)
        }
        AppManager.showWeb({javascript: "window.GameToHall.openModal('" + value + "')"})
    }

    /** 打开指定的web页面 不关闭游戏的前提下 */
    static openWebPageWithoutLeaveGame(value: string) {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.openWebPageWithoutLeaveGame(value)
        }
        AppManager.showWeb({javascript: "window.GameToHall.openWebPageWithoutLeaveGame('" + value + "')"})
    }

    /** 进入游戏进度条 */
    static getProgress(value: number) {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.getProgress(value)
        }
        AppManager.executionJavascript("window.GameToHall.getProgress", value)
    }

    /** 通知进入游戏了 */
    static gameOnload() {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.gameOnload()
        }
        AppManager.executionJavascript("window.GameToHall.gameOnload", null)
    }

    /**
     * 通知服务器直接离开的房间
     */
    static outGameHttp() {
        if (Browser.window.parent.GameToHall)
            Browser.window.parent.GameToHall.outGameHttp(Player.inst.urlParam.roomId)
        else Log.debug("debug")
    }

    /**
     * 分析邀请
     * @param type 1 开  2 关
     */
    static shareDetail(type: number) {
        if (Browser.window.parent.GameToHall)
            Browser.window.parent.GameToHall.shareDetail(Player.inst.gameModel, type)
        else Log.debug("debug")
    }

    /** 上传头像 */
    static updateHead() {
        if (Browser.window.parent.GameToHall) {
            Browser.window.parent.GameToHall.openReviseAvatarNickNameDrawer()
        }
        AppManager.showWeb({javascript: "window.GameToHall.openReviseAvatarNickNameDrawer()"})
    }

}
