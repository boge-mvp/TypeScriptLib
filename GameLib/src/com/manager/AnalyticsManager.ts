import Log = tsCore.Log;
import Environment = tsCore.Environment;
import EnvType = tsCore.EnvType;
import ConfigKit = tsCore.ConfigKit;
import {Player} from "../Player"
import {AppManager} from "./AppManager"
import {GameConfigKit} from "../kit/GameConfigKit";
import Browser = Laya.Browser;

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
    static openAnalysis(callback: ParamHandler) {
        runFun(callback)
    }

    /**
     * 发送游戏事件
     * @param eventAction 互动类型 (默认会添加 _)
     * @param eventLabel 事件标签
     */
    static sendGameAnalysis(eventAction: string, eventLabel?: string) {
        // 获取当前的游戏配置
        let gameName = GameConfigKit.gameNameCanonical(null, "_")?.toLowerCase()
        if (gameName) {
            eventLabel ??= Player.inst.isGuest ? "demo" : "cash"
            AnalyticsManager.send(gameName + "_" + eventAction, eventLabel)
        } else {
            Log.warn("sendGameAnalysis : gameId=" + Player.inst.gameId + " not exist")
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
        this.isOpenAnalytics = ConfigKit.get("openAnalytics")
        if (!Browser.onLayaRuntime && this.isOpenAnalytics && window.ga) gaTiming({timingCategory: "game", timingVar: timingVar, timingValue: timingValue})
        if (Browser.onLayaRuntime && this.isOpenAnalytics)
            AppManager.enterInvite({eventName: timingVar, eventValue: timingValue}, AppManager.nullFun)
    }

    /**
     * 向 Google Analytics 发送事件
     * @param type
     * @param category
     * @param action
     * @param label
     */
    static ga(type: gaType, category: string, action: string, label: string) {
        this.isOpenAnalytics = ConfigKit.get("openAnalytics")
        if (Player.inst.urlParam.debug) {
            const encoder = new TextEncoder()
            const categoryLen = encoder.encode(category).length
            const actionLen = encoder.encode(action).length
            const labelLen = encoder.encode(label).length
            Log.debug(`category=${categoryLen} action=${actionLen} label=${labelLen}`)
        }
        // @ts-ignore
        if (this.isOpenAnalytics && !Browser.onLayaRuntime && window.ga) ga('send', type, category, action, label)
        if (this.isOpenAnalytics && Browser.onLayaRuntime)
            AppManager.enterFeedback({eventName: action, eventValue: label}, AppManager.nullFun)
    }

    // static ga("event", category: string, action: string, label: string | number)

}

declare type gaType = "pageview" | "event" | "timing" | "social" | "screenview" | "transaction" | "item" | "exception"