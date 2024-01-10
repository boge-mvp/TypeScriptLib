/**
 * 游戏资源配置
 */
declare type ResConfig = {
    /** 加载的资源列表 */
    res: LoadRes[]
    /** 加载的js文件名字 */
    js: string
    /** 执行启动函数 */
    completeFun: Function
    /** 引导帮助文档 */
    couponHelp?: string[]
    /** 指引 */
    guide?: (string | LoadRes)[] | string | LoadRes
    /** 游戏赔率 */
    odds?: number[][] | any[][]
}

declare type OpenPage = {
    /** 打开指定界面 */
    page: string
    /** 是否关闭当前界面 */
    isCloseGame?: boolean
    /** 登录注册等成功后，需打开的界面 */
    fromUrl?: String
    /** 登录注册取消前往地圳 */
    cancelUrl?: String
    /** 打开界面是否横屏 */
    isHorizontalScreen?: boolean
    /** 0.打开web 1.打开游戏 */
    type?: number
}

/**
 * 优惠券
 */
declare type Coupons = {
    /** id */
    id: number
    /** 当前数量 */
    num: number
    /** 原总数量 */
    total_number: number
    /** 劵的面值 */
    faceValue: number
    /** 投注最低使用额度 */
    bet_limit: number
    /** 过期时间 */
    expire_time: number
    /** 1抵用券 2投注劵 */
    type: number
    /** 来源 */
    source?: number
    /** 支持的游戏 */
    games: number[]
    /** 是否正在使用 */
    isUse: boolean
}

/**
 * 对话框修改显示数据
 */
declare type IPromptData = {
    /** 按钮确定文案 */
    okName?: string
    /** 按钮取消文案 */
    cancelName?: string
}

declare type PromptData = {
    /** 文字或id */
    msg: string | number | any[]
    /** 标题 */
    title?: string
    /** 按钮名字修改 */
    obj?: IPromptData
    /** 取消按键 */
    callback?: ParamHandler
    /** 确认按键 */
    continue?: ParamHandler
    /** 是否动画弹出 默认true */
    isAction?: boolean
}

declare type HttpData = {
    /**
     * 游戏状态 非0 表示正常
     */
    game_status: number
    /** 当前游戏奖池 */
    game_pool: number
    /** 用户当前的bet值 */
    user_really_bet: number
    /** 距离下次获得奖励总共需要多少BET */
    get_ticket_inc_bet: number
    /** 已经获得的奖励 */
    scratcher_tickets: any[]
    [key: string]: any
}

declare type FreeSpinData<T = any> = {
    /** 免费游戏剩余次数 */
    left_times: number
    /** 游戏bet数据 */
    free_spin_data: T
    [key: string]: any
}

declare type GoldAniData = {
    x?: number, y?: number, scaleX?: number, scaleY?: number, duration?: number, delay?: number, ease?: Function
}

/**
 * 要播放的开奖数据
 */
declare type SlotLotteryData<T = any> = {
    /** 开奖数组 */
    arr: number[]
    /** 是否是快速模式 */
    isTurboMode: boolean
    /** 块有多少个 */
    itemCount: number
    /** 附带数据 */
    data?: T
}

/**
 * 执行命令数据
 */
declare type ExecuteData = {
    token?: string
    /** 执行类型 */
    type: number
    /** 执行数据 */
    data?: number | string
    /** 打开游戏名字 */
    gameName?: string
    /** 打开游戏id */
    openGame?: number
}