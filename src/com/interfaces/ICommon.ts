/**
 * 对话框修改显示数据
 */
export interface IPromptData {

    /** 按钮确定文案 */
    okName?: string
    /** 按钮取消文案 */
    cancelName?: string

}

/**
 * 资源加载数据
 */
export interface LoadRes {

    /** 加载地址 */
    url: string
    /**
     * 类型字符串
     * @see Laya.Loader.IMAGE
     */
    type?: string
    /** 强制加载 */
    forceLoad?: boolean
    /** 分支 */
    branch?: string

    //------------  Laya 的数据

    size?: number

    priority?: number

    useWorkerLoader?: boolean

    progress?: number

    group?: string

}

/**
 * 游戏资源配置
 */
export interface ResConfig {
    /** 加载的资源列表 */
    res: LoadRes[]
    /** 加载的js文件名字 */
    js: string
    /** 执行启动函数 */
    completeFun: Function
    /** 引导帮助文档 */
    couponHelp?: string[]
    /** 指引 */
    guide?: string[] | string
    /** 游戏赔率 */
    odds?: number[][] | any[][]
}

/**
 * 优惠券
 */
export interface Coupons {
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

export interface ISkeletonData {

    x?: number,
    y?: number,
    /** 关联对象 */
    relation?: ISKRelation,
    /** 播放数据 */
    play?: ISkeletonPlay,
    scaleX?: number,
    scaleY?: number,
    /** xy 公用的缩放值 */
    scale?: number,
    /**
     * 动画模式
     * <table>
     *    <tr><th>模式</th><th>描述</th></tr>
     *    <tr>
     *        <td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存    （内存开销大，计算开销小，支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
     * </tr>
     * </table>
     * @default GSkeleton.aniMode
     */
    aniMode?: number,
    rot?

}

/**
 * skeleton 播放参数
 */
export interface ISkeletonPlay {
    /**
     * 播放某个动画
     * ````
     * 传入-1或null表示不自动播放
     * ````
     * @default 0
     */
    nameOrIndex?: string | number | (string | number)[],
    /** 循环播放
     * @default true
     * */
    loop?: boolean,
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?:number,
    /**
     * loop 播放延迟(单位为毫秒)
     * @default 0
     */
    delayLoopPlay?:number,
    /** 播放结束调用 */
    playComplete?: ParamHandler,
    /** 加载完成调用 */
    loaderComplete?: ParamHandler,
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效,
     * true,强制生效
     * @default true
     */
    force?: boolean,
    /**
     * 起始时间
     * 只有 nameOrIndex 为非数组才有用
     * @default 0
     */
    start?: number,
    /**
     * 结束时间
     * 只有 nameOrIndex 为非数组才有用
     * @default 0
     */
    end?: number,
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean,
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?:number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean

}

export interface ISKRelation {

    /** 上下左右关联对象 */
    target?: any,
    /** 左右关联对象 */
    lr?: any,
    /** 上下关联对象 */
    ud?: any
    /** 是否使用百分比关联  默认true */
    usePercent?: boolean,

}

export enum Method {GET = "get", POST = "post"}