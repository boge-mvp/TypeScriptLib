import Browser = Laya.Browser
import Utils = Laya.Utils
import LocalStorage = Laya.LocalStorage
import Render = Laya.Render
import SoundManager = Laya.SoundManager
import {Player} from "../Player"
import {UtilsTool} from "../utils/UtilsTool"
import {StringUtil} from "../utils/StringUtil"
import {AppRecordManager} from "../manager/AppRecordManager"
import {IExecuteData} from "../interfaces/ICommon";

/**
 * url 参数
 */
export class UrlParam {

    private _amount: string
    private _inviteCode: string
    private openGame: string

    /** 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚 */
    private _country = ""
    /** 语言 en zh-CN */
    private _language = ""
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

    constructor() {
        this.parseData(null)

        if (Player.inst.isWeb) {
            let url = Browser.window.location.href
            let newUrl = url.split("?")[0]
            let clearCache = Utils.getQueryString("clearCache")
            if (clearCache) {
                let request: any = UtilsTool.getRequest()
                delete request["clearCache"]
                LocalStorage.clear()

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
                Browser.window.location.href = newUrl + param
            }

//        if (Browser.window.location.protocol != "http:" && !Render.isConchApp)
//            Browser.window.history.pushState(null, null, newUrl)
        }

    }

    parseData(json: IExecuteData) {
        Player.inst.parseParam = json
        // 获取链接附带参数
        let isweb = this.getValue(json, "isweb")
        if (isweb == null) isweb = Render.isConchApp ? "false" : "true"
        Player.inst.isWeb = (isweb != "false")

        let isGuest = this.getValue(json, "isGuest")
        if (!StringUtil.isEmpty(isGuest)) {
            Player.inst.isGuest = isGuest == "true"
            Player.inst.guestModel.guestUID = UtilsTool.random(1, 99999999) * 1000
        }

        let debug = this.getValue(json, "debug")
        if (debug) {
            this.debug = debug == "true"
        }

        let token = this.getValue(json, "token")
        if (token) {
            Player.inst.token = token
        }

        let tempChannel = this.getValue(json, "channel")
        if (!StringUtil.isEmpty(tempChannel)) this.channel = tempChannel

        let tempCountry = this.getValue(json, "country")
        if (!StringUtil.isEmpty(tempCountry)) this._country = tempCountry

        let tempLanguage = this.getValue(json, "language")
        if (!StringUtil.isEmpty(tempLanguage)) this._language = tempLanguage

        let tempIsGift = this.getValue(json, "isGift")
        if (!StringUtil.isEmpty(tempIsGift)) this._isGift = Utils.parseInt(tempIsGift)

        let tempPlayWith = this.getValue(json, "playWith")
        if (!StringUtil.isEmpty(tempPlayWith)) this._playWith = tempPlayWith

        let tempRoomId = this.getValue(json, "roomId")
        if (!StringUtil.isEmpty(tempRoomId)) this._roomId = tempRoomId

        let tempRole = this.getValue(json, "role")
        if (!StringUtil.isEmpty(tempRole)) this._role = Utils.parseInt(tempRole)

        let tempAmount = this.getValue(json, "amount")
        if (!StringUtil.isEmpty(tempAmount)) this._amount = tempAmount

        let tempInviteCode = this.getValue(json, "invite_code")
        if (!StringUtil.isEmpty(tempInviteCode)) this._inviteCode = tempInviteCode

        let tempMusicMuted = this.getValue(json, "musicMuted")
        if (!StringUtil.isEmpty(tempMusicMuted)) SoundManager.musicMuted = tempMusicMuted == "true"

        let tempSoundMuted = this.getValue(json, "soundMuted")
        if (!StringUtil.isEmpty(tempSoundMuted)) SoundManager.soundMuted = tempSoundMuted == "true"
        // 游戏id
        let tempOpenGame = this.getValue(json, "openGame")
        // 游戏名字
        let tempGameName = this.getValue(json, "gameName")
        if (!StringUtil.isEmpty(tempOpenGame) || !StringUtil.isEmpty(tempGameName)) {
            this.openGame = tempOpenGame
            AppRecordManager.executeJson = {type: 2, data: Utils.parseInt(this.openGame), gameName: tempGameName}
        }

    }

    getValue(json: any, key: string) {
        let value = Utils.getQueryString(key)
        if (json != null && key in json) {
            value = json[key] + ""
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