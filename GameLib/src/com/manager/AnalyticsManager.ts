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
    static isOpenAnalytics: Nullable<boolean> = true

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
     * @param eventParams
     */
    static sendGameAnalysis(eventAction: string, eventLabel?: string, eventParams?: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams) {
        // 获取当前的游戏配置
        let gameName = GameConfigKit.gameNameCanonical(undefined, "_")?.toLowerCase()
        if (gameName) {
            eventLabel ??= Player.inst.isGuest ? "demo" : "cash"
            AnalyticsManager.send(gameName + "_" + eventAction, eventLabel, eventParams)
        } else {
            Log.warn("sendGameAnalysis : gameId=" + Player.inst.gameId + " not exist")
        }
    }

    /**
     * 向Google Analytics 发送事件
     * @param eventAction 事件操作
     * @param eventLabel  事件标签
     * @param eventParams
     */
    static send(eventAction: string, eventLabel = "", eventParams?: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams) {
        AnalyticsManager.gtagEvent("game" + (Environment.active == EnvType.DEV ? "_dev" : ""), eventAction, eventLabel, eventParams)
    }

    /**
     * 向 Google Analytics 发送事件
     * @param type
     * @param category
     * @param action
     * @param label
     * @param params 附加键值对参数
     * @deprecated
     */
    static ga(type: any, category: string, action: string, label: string, params?: Record<string, any>) {
        if (AnalyticsManager.isEnableAnalytics() && !Browser.onLayaRuntime) {
            if (ConfigKit.get("gtag")) {
                const eventParams: Record<string, any> = {
                    event_category: category,
                    event_label: label,
                    ...params
                }
                gtag("event", action, eventParams)
            }
        }
        if (this.isOpenAnalytics && Browser.onLayaRuntime)
            AppManager.enterFeedback({eventName: action, eventValue: label}, AppManager.nullFun)
    }

    static gtagConfig(targetId: string, config?: Gtag.ControlParams | Gtag.EventParams | Gtag.ConfigParams | Gtag.CustomParams) {
        if (AnalyticsManager.isEnableAnalytics()) gtag("config", targetId, config)
    }

    static gtagEvent(eventCategory: string, eventName: string, eventValue: string, eventParams?: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams) {
        if (AnalyticsManager.isEnableAnalytics()) {
            if (Browser.onLayaRuntime) {
                AppManager.enterFeedback({eventName: eventName, eventValue: eventValue})
            } else {
                const params: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams = {
                    event_category: eventCategory,
                    event_label: eventValue,
                    ...eventParams
                }
                if (!params["send_to"]) {
                    const ids = dataLayer.find((it) => it[0] == "config")
                    if (ids && ids[1]) params["send_to"] = ids[1]
                }
                gtag("event", eventName, params)
            }
        }
    }

    static isEnableAnalytics() {
        this.isOpenAnalytics ??= ConfigKit.get("openAnalytics")
        return this.isOpenAnalytics ?? false
    }

}