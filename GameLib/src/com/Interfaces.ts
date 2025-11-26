import {UrlParam} from "./net/UrlParam";
import {GameType} from "./core/BaseGameData";

/**
 * 游戏数据
 */
export interface IGameData {

    /** 总共要投注的钱 */
    getTotalBetMoney(): number

    /** 上报错误数据 */
    reportError(): any

    /**
     * 附带调试数据
     */
    attachedDebugData: any

    /** 服务器发来的当前余额 */
    currentBalance: number
    /** 本次总共盈利 */
    totalWinMoney?: number
    /** 后端计算   当前盈利 */
    serverWinMoney?: number
    /** 玩的次数 计数 */
    playCount: number
    /** 是否已经弹出过一次推荐正式场的游戏 */
    isRecommend?: boolean
    /**
     * 当前是否在特殊模式
     * @default false
     */
    specialMode: boolean
    /**
     * 游戏类型
     * @default GameType.NORMAL
     */
    gameType: GameType
}

export interface IData {

    /** 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚 */
    country: string
    /** 语言 en zh-CN */
    language: string
    /** 渠道平台 */
    channel: string

    /** 用户昵称是否是第一次改名，0 是，1 不是  */
    isFirstNick: boolean
    /** 该账号是否是第一次登录，0 是，1 不是  */
    isFirstLogin: boolean
    /** 开奖时间戳(s) */
    lotteryTime: number
    /** 缓存初始化开奖期数  */
    initPeriod: number
    /** 当前开奖期数  */
    period: number

    /** 进入房间后  当前房间总投注信息  (只有进入房间的时候才使用) */
    initRoomTotalItem: any[]
    /** 进入房间后  当前房间自己投注信息  (只有进入房间的时候才使用) */
    initRoomCurBet: any[]
    /** 初始化奖金池数据(只有进入房间的时候才使用) */
    jackpot: number
    /** 上次发送聊天数据时间 s */
    oldSendChatTimer: number
    /** 开奖历史 */
    betHistory: any[]
    /** 当前历史次数 */
    betStatic: any[]

    /** 获取完整的wap请求url */
    getWapUrl(url: string): string

    /** 获取完整的game请求 带版本号  url */
    getGameUrl(url: string): string

    /**
     * 获取国家编码 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚
     * @param urlParam
     */
    getCountry(urlParam: UrlParam): string

    /**
     * 获取错误上传地址
     */
    getErrorUrl(): string

}

/**
 * 登录接口
 */
export interface ILogin {

    /** 使用Token登录 并获取用户数据 */
    loginToken(handler: (callback: HttpResponse) => void): void

}

/**
 * 游戏模式
 */
export interface IGuestModel {

    /** 游客id */
    guestUID: number
    /** 游客模式玩次数 */
    guestPlayCount: number
    /**
     * 游客初始金额
     */
    guestInitMoney: number

    /** 清除数据  */
    clearData(): void

    /**
     * post请求 返回数据  可以在这里对返回数据进行修改
     * @param url 访问网址
     * @param data 押注额度
     */
    playAdd(url: string, data: HttpData): void

}