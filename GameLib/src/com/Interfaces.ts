import {UrlParam} from "./net/UrlParam";

/**
 * 游戏数据
 */
export interface IGameData {

    /** 总共要投注的钱 */
    getTotalBetMoney(): number

    /** 上报错误数据 */
    reportError(): any

    /** 本次总共盈利 */
    totalWinMoney?: number
    /** 玩的次数 计数 */
    playCount: number
    /** 是否是推荐游戏 */
    isRecommend?: boolean

}

export interface IData {

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
    loginToken(callback: ParamHandler)

}

/**
 * 开奖数据
 */
export interface ISlotLotteryData {

    /** 开奖数组 */
    arr: number[]
    /** 是否是快速模式 */
    isTurboMode: boolean
    /** 块有多少个 */
    itemCount: number
    /** 附带数据 */
    data?: any

}

/**
 * 执行命令数据
 */
export interface IExecuteData {

    token?: string
    /** 执行类型 */
    type: number
    /** 执行数据 */
    data?: number
    /** 打开游戏名字 */
    gameName?: string
    /** 打开游戏id */
    openGame?: number

}

/**
 * 游戏模式
 */
export interface IGuestModel {

    /** 游客id */
    guestUID: number
    /** 游客模式玩次数 */
    guestPlayCount

    /** 清除数据  */
    clearData()

    /**
     * post请求 返回数据  可以在这里对返回数据进行修改
     * @param url 访问网址
     * @param data 押注额度
     */
    playAdd(url: string, data: any)

}