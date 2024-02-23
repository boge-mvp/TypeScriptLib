import Utils = Laya.Utils;
import Render = Laya.Render;
import SoundManager = Laya.SoundManager;
import UtilKit = tsCore.UtilKit;
import Log = tsCore.Log;
import {Player} from "../Player"
import {AppRecordManager} from "../manager/AppRecordManager"
import {SceneManager} from "../manager/SceneManager";

/**
 * url 参数
 */
export class UrlParam {

    private _amount: string
    private _inviteCode: string
    private openGame: string

    /** 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚 */
    private _country: string
    /** 语言 en zh-CN */
    private _language: string
    /** 渠道平台 */
    public channel: string
    /** 0:ai  1:people 2:friend */
    private _playWith = "1"
    private _roomId: string
    /** 1 守门员  2 踢球 */
    private _role: number
    /** 是否是赠送金 0 没有 1 有 */
    private _isGift = 0
    /** 是否是debug模式 */
    debug = false

    constructor(defaults?: { country?: string, language?: string, channel?: string, debug?: boolean }) {

        this._country = defaults?.country
        this._language = defaults?.language
        this.channel = defaults?.channel
        this.debug = !!defaults?.debug

        this.parseData(null)

        if (Player.inst.isWeb) {
            let url = window.location.href
            let newUrl = url.split("?")[0]
            let clearCache = Utils.getQueryString("clearCache")
            if (clearCache) {
                let request = UtilKit.getRequest()
                delete request["clearCache"]
                localStorage.clear()

                let param = "?"
                let index = 0
                for (let key in request) {
                    if (index == 0) {
                        param += key + "=" + request[key]
                    } else {
                        param += "&" + key + "=" + request[key]
                    }
                    index++
                }
                Log.debug(`clear cache reload ${newUrl + param}`)
                window.location.replace(newUrl + param)
            }

//        if (Browser.window.location.protocol != "http:" && !Render.isConchApp)
//            Browser.window.history.pushState(null, null, newUrl)
        }

    }

    parseData(json: ExecuteData) {
        Player.inst.parseParam = json
        // 获取链接附带参数
        let isweb = this.getValue(json, "isweb")
        isweb ??= Render.isConchApp ? "false" : "true"
        Player.inst.isWeb = (isweb != "false")

        this.getQueryBoolean(json, v => Player.inst.isGuest = v, "isGuest", "guest", "demo")
        this.getQueryBoolean(json, v => this.debug = v, "debug")
        this.getQuery(json, v=> Player.inst.token = v, "token")
        this.getQuery(json, v=> this.channel = v, "channel")
        this.getQuery(json, v=> this._country = v, "country")
        this.getQuery(json, v=> this._language = v, "language", "lang")
        this.getQuery(json, v=> this._playWith = v, "playWith")
        this.getQuery(json, v=> this._roomId = v, "roomId")
        this.getQuery(json, v=> this._role = Utils.parseInt(v), "role")
        this.getQuery(json, v=> this._amount = v, "amount")
        this.getQuery(json, v=> this._inviteCode = v, "invite_code")
        this.getQueryBoolean(json, v=> this._isGift = v ? 1 : 0, "isGift", "gift")
        this.getQueryBoolean(json, v=> SceneManager.inst.isCall = v, "isCall", "call")
        this.getQueryBoolean(json, v=> SoundManager.musicMuted = v, "musicMuted")
        this.getQueryBoolean(json, v=> SoundManager.soundMuted = v, "soundMuted")
        // 游戏id
        this.getQuery(json, v=> this.openGame = v, "openGame", "gameId")
        const tempGameName = this.getValue(json, "gameName")
        // 游戏名字
        if (this.openGame || tempGameName) {
            AppRecordManager.executeJson = {type: 2, data: Utils.parseInt(this.openGame), gameName: tempGameName}
        }

    }

    /**
     * 该函数用于从给定的json对象中通过一系列键名路径获取对应的值，并将这个值转化为布尔类型后传递给回调函数进行处理。
     * 具体转化逻辑为：若获取到的值存在且不等于"false"或"0"（忽略大小写），则将其转换为true并传入回调函数；否则转换为false。
     *
     * @param json - 需要从中查询数据的json对象
     * @param fun - 处理查询结果的回调函数，接受一个布尔值作为参数
     * @param keys - 用于定位json对象内目标值的一系列键名组成的数组
     */
    getQueryBoolean(json: any | null, fun: (value: boolean) => void, ...keys: string[]) {
        const value = this.getValue(json, ...keys)
        // 判断获取的值是否存在且不等同于"false"或"0"
        if (value) {
            fun(!value.equalsAnyIgnore("false", "0"))
        } else fun(false)
    }

    /**
     * 执行参数设置 如果存在将调用fun 如果不存在或是空 将不会调用fun
     * @param json
     * @param fun
     * @param keys
     */
    getQuery(json: any | null, fun: (value: string) => void, ...keys: string[]) {
        const value = this.getValue(json, ...keys)
        if (value) {
            fun(value)
        }
    }

    /**
     * 获取指定的key的布尔值 空值、false、0 都将返回false
     * @param json
     * @param keys
     */
    getValueBoolean(json: any | null, ...keys: string[]) {
        const value = this.getValue(json, ...keys)
        return !(!value || value.equalsAnyIgnore("false", "0"))
    }

    /**
     * 获取url上的参数key=value
     * @param json
     * @param keys
     */
    getValue(json: any | null, ...keys: string[]): string | undefined {
        let value: string = undefined
        for (const key of keys) {
            if (json && key in json) {
                value = json[key] + ""
                break
            } else {
                value = Utils.getQueryString(key)
                if (value) break
            }
        }
        return value
    }


    get amount() {
        return this._amount
    }

    get inviteCode() {
        return this._inviteCode
    }

    /**
     * 是否是直接指定页面
     * @return
     */
    isJumpPage() {
        return AppRecordManager.executeJson != null
    }

    /**
     * 清理跳转记录
     */
    clearJumpPage() {
        this.openGame = null
    }

    get country() {
        return this._country
    }

    get language() {
        return this._language
    }

    get playWith() {
        return this._playWith
    }

    set playWith(value: string) {
        this._playWith = value
    }

    set roomId(value: string) {
        this._roomId = value
    }

    get roomId() {
        return this._roomId
    }

    get role() {
        return this._role
    }

    set role(value: number) {
        this._role = value
    }

    get isGift(): number {
        return this._isGift
    }

    set isGift(value: number) {
        this._isGift = value
    }

}