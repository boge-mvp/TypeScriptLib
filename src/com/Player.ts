import Browser = Laya.Browser
import Render = Laya.Render
import LocalStorage = Laya.LocalStorage
import {UrlParam} from "./net/UrlParam"
import {IGuestModel} from "./runtime/IGuestModel"
import {IData} from "./interfaces/IData"
import {UtilsTool} from "./utils/UtilsTool"
import {Cast} from "./utils/Cast"
import {StringUtil} from "./utils/StringUtil"
import {IExecuteData, IGameData, ILogin} from "./interfaces/ICommon";

/** 用户数据 */
export class Player {

    private static _instance: Player

    static get inst() {
        if (this._instance == null) this._instance = new Player()
        return this._instance
    }

    /** apk下载 */
    static DOWNLOAD_APK_URL: string
    /** 版本名字 */
    static VERSION: string
    /** 最新版本号 */
    static VERSION_CODE: string
    /** 进入大厅的地址 */
    static HOME_URL: string
    /** 渠道名字 */
    channelName = "wap"

    private _icon = "ui://cw0f8xaqgn9s6x"
    /** 玩家身上主账户的钱 */
    money = 0
    /** 金币 */
    coins = 0
    /** 玩家身上赠送的钱 */
    freeBet = 0
    /** 缓存玩家身上的钱 */
    cacheMoney = 0
    /** 玩家昵称 */
    nickname = "admin"
    /** 玩家id */
    userId = 110
    /** 客户端生成的唯一ID */
    uuid: string
    /** 用户身份码 */
    token: string = null
    /** 手机号 */
    mobile: string
    /** 设备号 */
    device: string
    /** url参数 */
    urlParam: UrlParam
    /** 游戏数据 */
    gameData: IGameData

    /** 游戏类型  id */
    gameModel = -1
    /** 游戏类型  id */
    gameName: string
    /** 是否是web端口 */
    isWeb = true
    /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
    private _status: number
    /** 游戏发布版本号 */
    codeVersion = 1
    /** 当前app游戏发布版本号 */
    currentAppVersion = 1
    /** 是否是游客模式 */
    isGuest: boolean
    /** 游客数据 */
    guestModel: IGuestModel
    /** 项目数据 */
    data: IData
    /** 登录接口 */
    login: ILogin
    /** 本玩家今日玩的次数 */
    playCount = 0
    /**
     * 用户持有的优惠劵
     **/
    private coupons: Coupons[] = []
    /** 缓存上一次网络请求返回数据 */
    resultData: any
    /** 解析的传入游戏的参数 */
    parseParam: IExecuteData
    // 大奖参数
    /** 用户拥有的奖金池  */
    jackpotData = []
    /** 用户的真实投注 */
    userReallyBet = 0
    /** 每次投注达到多少 就可以获得刮刮卡 */
    getTicketIncBet = 100
    /** 当前游戏的奖金池 */
    gamePool = UtilsTool.random(1000, 99999)
    /** 获得奖励的次数 */
    jackpotCount = 0

    /**
     * 获取游客模式的优惠券
     * @return
     */
    getGuestCoupons(): Coupons[] {
        return window["guestCoupons"]
    }

    /**
     * 设置当前拥有的优惠券
     * @param value 新优惠券
     */
    addCoupons(value: Coupons[]) {
        this.coupons = value
    }

    /** 获取所有的优惠券 */
    getCoupons() {
        return this.coupons
    }

    /**
     * 根据优惠劵类型  获取优惠劵
     * @param type 1抵用券 2投注劵
     * @return
     */
    getCoupon(type: number) {
        let temps: Coupons[] = []
        for (let i = 0; i < this.coupons.length; i++) {
            let arr = this.coupons[i]
            if (arr.type == type && arr.num > 0) {
                temps.push(arr)
            }
        }
        return temps
    }

    /**
     * 根据游戏ID  获取优惠劵
     * @param gameId 游戏ID
     * @return
     */
    getCouponGame(gameId: number) {
        let temps: Coupons[] = []
        for (let i = 0; i < this.coupons.length; i++) {
            let arr = this.coupons[i]
            if (arr.games.indexOf(gameId) != -1 && arr.num > 0) {
                temps.push(arr)
            }
        }
        return temps
    }

    /** 使用活动劵的次数 */
    useCouponNum() {
        let useObj = this.getUseCoupon()
        if (useObj && useObj.num > 0) {
            useObj.num -= 1
        }
    }

    /**
     * 获取正在使用的优惠劵
     * @return
     */
    getUseCoupon() {
        let useObj: Coupons = null
        for (let i = 0; i < this.coupons.length; i++) {
            let arr = this.coupons[i]
            if (arr.isUse) {
                useObj = arr
            }
        }
        return useObj
    }

    /**
     * 获取正在使用的优惠劵
     */
    removeCoupon(obj: Coupons) {
        for (let i = 0; i < this.coupons.length; i++) {
            let arr = this.coupons[i]
            if (arr.id == obj.id) {
                this.coupons.splice(i, 1)
                break
            }
        }
    }

    /**
     * 判断当前游戏可有使用的优惠券
     */
    getCanUseCoupon() {
        let betValue = Player.inst.gameData.getTotalBetMoney()
        let arr = Player.inst.getCouponGame(Player.inst.gameModel)
        for (let i = 0; i < arr.length; i++) {
            const useObj = arr[i]
            if (useObj.type == 1) {// 判断是否有可以使用的抵用券
                if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) {// 满足最低投注额
                    return true
                }
            } else if (useObj.type == 2) {
                return true
            }
        }
        return false
    }

    /** 停止所有的优惠价使用 */
    stopAllCoupon() {
        for (let i = 0; i < this.coupons.length; i++) {
            let obj = this.coupons[i]
            obj.isUse = false
        }
    }

    /** 获取请求发送的  token */
    getRequestToken() {
        return "token=" + this.token
    }

    /** 玩家头像 */
    get icon() {
        return this._icon
    }

    /**
     * @private
     */
    set icon(value: string) {
        this._icon = value
    }

    /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
    get status() {
        return this._status
    }

    /**
     * @private
     */
    set status(value: number) {
        this._status = value
    }


    windowOpen(url: string) {
        let window = Browser.window.open(url)
        if (!window) {
            Browser.window.location.href = url
        }
    }

    /**
     * 获取设备号
     * @return
     */
    getDevice() {
        let device: string
        if (Render.isConchApp) {
            device = Player.inst.device
        } else {
            device = Browser.userAgent
        }
        return device
    }

    /**
     * 保存账号密码
     * @param login
     * @param psd
     */
    saveUser(login: string, psd: string) {
        let user = {name: login, psd: psd}
        let s = Cast.encrypt(JSON.stringify(user))
        LocalStorage.setItem("userData", s)
    }

    /**
     * 获取渠道type
     * @return
     */
    getChannelType() {
        return Render.isConchApp ? 3 : 1;// 如果是app端 3
    }

    /**
     * 获取当前国家的货币单位(大写)
     */
    getCurrencyUnit() {
        let currencyMap = Browser.window.currencyUnit
        let unit = ""
        if (currencyMap != null) {
            let country = this.data.getCountry(this.urlParam)
            if (!StringUtil.isEmpty(country)) {
                unit = currencyMap[country]
            }
        }
        return unit
    }

    /**
     * 获取当前国家的货币单位(首字母大写格式化)
     */
    getCurrencyUnitFormat() {
        return this.getCurrencyUnit().toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
    }

}
