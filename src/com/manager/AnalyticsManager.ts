import Browser = Laya.Browser;
import {Player} from "../Player"
import {AppManager} from "./AppManager"
import {ConfigUtils} from "../utils/ConfigUtils"
import {Log} from "../Log";
import {Environment, EnvType} from "../ConfigKit";

/**
 * 统计管理器
 * @author boge
 */
export class AnalyticsManager {

    /** 开启数据统计 */
    public static isOpenAnalytics = true

    /** 打开了一个游戏 */
    static openGame() {
    }

    /** 关闭了一个游戏 */
    static closeGame() {
    }

    /** 打开统计 */
    static openAnalysis(callback: Function) {
        if (callback) callback()
    }

    /**
     * 发送游戏事件
     * @param eventAction 互动类型 (默认会添加 _)
     * @param eventLabel 事件标签
     */
    static sendGameAnalysis(eventAction: string, eventLabel?: string) {
        // 获取当前的游戏配置
        let gameName = ConfigUtils.gameNameCanonical(null, "_")?.toLowerCase()
        if (gameName) {
            eventLabel ??= Player.inst.isGuest ? "demo" : "cash"
            AnalyticsManager.send(gameName + "_" + eventAction, eventLabel)
        } else {
            Log.warn("sendGameAnalysis : gameId=" + Player.inst.gameModel + " not exist")
        }
    }

    /**
     * 向Google Analytics 发送事件
     * @param eventAction 事件操作
     * @param eventLabel  事件标签
     */
    static send(eventAction: string, eventLabel = "") {
        AnalyticsManager.ga("event", "game" + (Environment.active == EnvType.DEV ? "_dev" : ""), eventAction, eventLabel)
    }

    /**
     * 向Google Analytics 发送用户用时
     * @param timingVar 用于标识要记录的变量
     * @param timingValue 向 Google Analytics（分析）报告的，以毫秒为单位的历时时间（例如 20）。
     *
     */
    static sendTiming(timingVar: string, timingValue: number) {
        this.isOpenAnalytics = ConfigUtils.get("openAnalytics")
        if (Player.inst.isWeb && this.isOpenAnalytics && Browser.window.ga)
            AnalyticsManager.ga('timing', 'game', timingVar, timingValue)
        if (!Player.inst.isWeb && this.isOpenAnalytics)
            AppManager.enterInvite({eventName: timingVar, eventValue: timingValue}, AppManager.nullFun)
    }

    /**
     * 向 Google Analytics 发送事件
     * @param type
     * @param category
     * @param action
     * @param label
     */
    static ga(type: gaType, category: string, action: string, label: string | number) {
        this.isOpenAnalytics = ConfigUtils.get("openAnalytics")
        // @ts-ignore
        if (this.isOpenAnalytics && Player.inst.isWeb && window.ga) window.ga('send', type, category, action, label)
        if (this.isOpenAnalytics && !Player.inst.isWeb)
            AppManager.enterFeedback({eventName: action, eventValue: label}, AppManager.nullFun)
    }

    // static ga("event", category: string, action: string, label: string | number)

}

declare type gaType = "pageview" | "event" | "timing" | "social" | "screenview" | "transaction" | "item" | "exception"