import GRoot = fgui.GRoot
import UIPackage = fgui.UIPackage
import LocalStorage = Laya.LocalStorage
import {LanguageUtils} from "./LanguageUtils"
import {Player} from "../Player"
import {JSUtils} from "./JSUtils"
import {LoadingWindow} from "../view/LoadingWindow"
import {HtmlWindow} from "../view/HtmlWindow"
import {WaitResult} from "../view/WaitResult"
import {HomePrompt} from "../view/HomePrompt"
import {SceneManager} from "../manager/SceneManager"
import {LibStr} from "../LibStr"
import {Log} from "../Log";
import {PromptWindow} from "../view/PromptWindow";

/** 状态吗获取显示信息 */
export class StateCode {

    /**
     * 获取显示信息
     * @param data 一个object对象  如果带有message错误文字  直接使用 否则用code命令获取错误内容
     */
    static getShowMessage(data?: any) {
        if (data == null) return LanguageUtils.inst.getStr(LibStr.NET_ERROR)
        if (data.message?.length > 0) {
            return data.message
        } else if (data.msg?.length > 0) {
            return data.msg
        }
        return this.getInfo(data.code)
    }

    /**
     * 显示错误信息
     * @param code 错误代号
     */
    static getInfo(code: number) {
        let content = ""
        switch (code) {
            case 300: // 未登陆，请先登陆
                content = LanguageUtils.inst.getStr(LibStr.FIRST_LOG)
                break
            case 5002:// 资金不足
                content = LanguageUtils.inst.getStr(LibStr.RECHARGE)
                break
            case 8002:// 当前游戏状态不属于投注状态
                content = LanguageUtils.inst.getStr(LibStr.CANNOT_BET)
                break
            case 8003:// 游戏暂停中
                content = LanguageUtils.inst.getStr(LibStr.GAME_OFF)
                break
            case 8004:// 投注失败
                content = LanguageUtils.inst.getStr(LibStr.BET_FAIL)
                break
            default:
                content = LanguageUtils.inst.getStr(LibStr.NET_ERROR) + ". code:" + code
                break
        }
        return content
    }

    /** 此错误是后在执行范围内 */
    static execute(code: number, msg: string = null) {
        switch (code) {
            case 300:// 请登录
                Log.debug("StateCode.execute() 300")
                if (Player.inst.urlParam.isJumpPage()) {
                    JSUtils.login()
                    return true
                }
                GRoot.inst.closeModalWait()
                LoadingWindow.inst.hide()
                HtmlWindow.inst.hide()
                msg = msg ? msg : LanguageUtils.inst.getStr(LibStr.FIRST_LOG)
                if (UIPackage.getByName("gameCommon")) WaitResult.inst.hide()
                HomePrompt.instance.showTip(0, msg, function () {
                    if (Player.inst.gameModel == -1) {
                        LocalStorage.removeItem("token")
                        LocalStorage.removeItem("userData")
                        Player.inst.token = null
                        if (Player.inst.urlParam.isJumpPage()) {
                            Player.inst.urlParam.clearJumpPage()
//								SceneManager.inst.enterGame()
//								return
                        }
                        SceneManager.inst.showHomeScene()
                    } else {
                        SceneManager.inst.logout()
                    }
                }, null, {cancelName: LanguageUtils.inst.getStr(LibStr.OK)})
                return true
            case 8003:// 游戏暂停中
                Log.debug("StateCode.execute() 8003")
                this.showGameOff()
                return true
            default:
                if (typeof msg !== "string") msg = this.getShowMessage(msg)
                msg = msg ? msg : getString(LibStr.NET_ERROR)
                PromptWindow.inst.showTip(msg)
                return true
        }
        return false
    }

    /** 游戏暂停中，返回大厅 */
    static showGameOff() {
        JSUtils.openModal(LanguageUtils.inst.getStr(LibStr.GAME_OFF))
        JSUtils.gameClose()
    }

}