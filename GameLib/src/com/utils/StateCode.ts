import GRoot = fgui.GRoot;
import UIPackage = fgui.UIPackage;
import LocalStorage = Laya.LocalStorage;
import {Player} from "../Player"
import {JSUtils} from "./JSUtils"
import {LoadingWindow} from "../view/LoadingWindow"
import {HtmlWindow} from "../view/HtmlWindow"
import {WaitResult} from "../view/WaitResult"
import {HomePrompt} from "../view/HomePrompt"
import {SceneManager} from "../manager/SceneManager"
import {LibStr} from "../LibStr"
import {HttpCode} from "../net/Common";
import {ActionLib} from "../actions/ActionLib";
import LanguageUtils = tsCore.LanguageUtils;
import Log = tsCore.Log;
import App = tsCore.App;

/** 状态吗获取显示信息 */
export class StateCode {

    /**
     * 获取显示信息
     * @param data 一个object对象  如果带有message错误文字  直接使用 否则用code命令获取错误内容
     */
    static getShowMessage(data?: any) {
        if (!data) return LanguageUtils.inst.getStr(LibStr.NET_ERROR)
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
        let content: string
        switch (code) {
            case HttpCode.LOGIN_INVALIDITY: // 未登陆，请先登陆
                content = LanguageUtils.inst.getStr(LibStr.FIRST_LOG)
                break
            case HttpCode.GAME_INSUFFICIENT_BALANCE:// 资金不足
                content = LanguageUtils.inst.getStr(LibStr.RECHARGE)
                break
            case HttpCode.GAME_CANNOT_BET:// 当前游戏状态不属于投注状态
                content = LanguageUtils.inst.getStr(LibStr.CANNOT_BET)
                break
            case HttpCode.GAME_OFF:// 游戏暂停中
                content = LanguageUtils.inst.getStr(LibStr.GAME_OFF)
                break
            case HttpCode.GAME_BET_FAIL:// 投注失败
                content = LanguageUtils.inst.getStr(LibStr.BET_FAIL)
                break
            default:
                content = LanguageUtils.inst.getStr(LibStr.NET_ERROR) + ". code:" + code
                break
        }
        return content
    }

    /**
     * 此错误是后在执行范围内
     * @param code 执行错误代码
     * @param msg 提示文案或具有错误信息的object *.msg *.message
     */
    static execute(code: number, msg: string | any = null) {
        switch (code) {
            case HttpCode.OK:
                return false
            case HttpCode.LOGIN_INVALIDITY:// 请登录
                Log.debug("StateCode.execute() " + HttpCode.LOGIN_INVALIDITY)
                if (Player.inst.urlParam.isJumpPage()) {
                    JSUtils.login()
                    return true
                }
                GRoot.inst.closeModalWait()
                LoadingWindow.inst.hide()
                HtmlWindow.inst.hide()
                if (typeof msg === "object") msg = this.getShowMessage(msg)
                msg = msg ? msg : LanguageUtils.inst.getStr(LibStr.FIRST_LOG)
                if (UIPackage.getByName("gameCommon")) WaitResult.inst.hide()
                HomePrompt.instance.showTip(0, msg, function () {
                    if (Player.inst.gameId == -1) {
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
            case HttpCode.GAME_PAUSE:// 游戏暂停中
                Log.debug("StateCode.execute() 8003")
                this.showGameOff()
                return true
            default:
                if (typeof msg !== "string") msg = StateCode.getShowMessage(msg)
                msg = msg ? msg : getString(LibStr.NET_ERROR)
                App.inst.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg)
                return true
        }
    }

    /** 游戏暂停中，返回大厅 */
    static showGameOff() {
        JSUtils.openModal(LanguageUtils.inst.getStr(LibStr.GAME_OFF))
        JSUtils.gameClose()
    }

}