declare type InitApp = {
    /** 初始化Laya */
    laya: {
        /** 是否初始化Laya 默认true */
        init: boolean,
        /** 渲染模式 默认 Laya.WebGL */
        renders: any[]
    },
    /** 是否让GRoot 自适应大小 默认true */
    resize?: boolean
}

/**
 * 历史页面导航
 */
declare type PageNavigator = {
    /** 当前的面板 */
    current: tsCore.IRecord,
    /** 要跳转的新面板 */
    newPage: tsCore.IRecord
}

declare type AnimationNodeContent = {
    name: string
    parentIndex: number
    parent: AnimationNodeContent
    keyframeWidth: number
    lerpType: number
    interpolationMethod: any[]
    childs: any[]
    keyFrame: Laya.KeyFramesContent[]// = new Vector.<KeyFramesContent>
    playTime: number
    extenData: ArrayBuffer
    dataOffset: number
}

declare type SkinData = {
    name: string
    slotArr: SlotData[]
}

declare type SlotData = {
    name: string
    displayArr: Laya.SkinSlotDisplayData[]
    /**
     * 通过附件名称获取位置
     * @param name
     */
    getDisplayByName(name: string): number
}

declare type AnimationContent = {
    nodes: AnimationNodeContent[]
    name: string
    /**
     * 播放时长
     */
    playTime: number
    bone3DMap: any
    totalKeyframeDatasLength: number
}

declare type ISkeletonData = {
    /**
     * 加载url地址
     */
    url?: string
    x?: number
    y?: number
    /** 播放结束调用 */
    playComplete?: ParamHandler
    /** 加载完成调用 */
    loaderComplete?: ParamHandler
    /** 关联对象 */
    relation?: ISKRelation
    /** 播放数据 */
    play?: ISkeletonPlay
    scaleX?: number
    scaleY?: number
    /** xy 公用的缩放值 */
    scale?: number
    /**
     * 动画模式 GSkeleton 专用
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
    aniMode?: number
    /**
     * GSpineSkeleton 专用
     * 创建spine版本
     * @default 3.8
     */
    ver?: Laya.SpineVersion
    /**
     * 旋转骨骼动画
     */
    rotation?: number,
    /**
     * 当要创建一个不传入url的骨骼动画的时候,可在这里设置骨骼动画类
     */
    classType?: { new(): tsCore.GSkeleton | tsCore.GSpineSkeleton }
}

/**
 * 单帧播放控制
 */
declare type PlaySkeletonFrame = {
    /**
     * 播放某个动画
     * ```
     * 传入-1表示不自动播放
     * ```
     * @default 0
     */
    nameOrIndex: string | number
    /**
     * 单次循环次数 当设置此值后  可以让本次动画播放到指定的次数后 在继续后续动作
     * @default 0
     * */
    loopCount?: number
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?: number
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    end?: number
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?: number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean
    /**
     * 播放完成回调
     */
    playComplete?: ParamHandler
}

/**
 * skeleton 播放参数
 */
declare type ISkeletonPlay = {
    /**
     * 播放某个动画
     * ```
     * 传入-1表示不自动播放
     * ```
     * @default 0
     */
    nameOrIndex?: string | number | (string | number | PlaySkeletonFrame)[]
    /**
     * 控制单个或数组动画循环播放
     * @default true
     * */
    loop?: boolean
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?: number
    /**
     * loop 播放延迟(单位为毫秒)
     * @default 0
     */
    delayLoopPlay?: number
    /**
     * 当nameOrIndex是数组并且全局loop为false，此设置才有效
     * @default -1 循环播放动画数组的下标 -1表示不循环
     */
    loopPlayIndex?: number
    /** 加载完成调用
     * @deprecated 只能在ISkeletonData中配置
     * */
    loaderComplete?: ParamHandler
    /**
     * 全波播放结束回调
     */
    playComplete?: ParamHandler
    /**
     * 当前播放动画的进度
     *
     * 默认是播放结束， 可以设置 before 播放之前和 after之后
     */
    progress?: ParamHandler | { before: ParamHandler, after: ParamHandler }
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    end?: number
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?: number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean

}

declare type ISKRelation = {

    /** 关联对象 单独设置此值  将自动上下左右关联 */
    target?: fgui.GObject
    /** 左右关联对象 */
    lr?: fgui.GObject
    /** 上下关联对象 */
    ud?: fgui.GObject
    /** 是否使用百分比关联  默认true */
    usePercent?: boolean,
    /**
     * 自定义关联
     */
    types?: Relations[]

}

declare type Relations = {
    /** 关联对象 */
    target: fgui.GObject
    /** 关联方式 */
    relationType: fgui.RelationType | fgui.RelationType[]
    /** 是否使用百分比关联 默认false */
    usePercent?: boolean
}

/**
 * 资源加载数据
 */
declare type LoadRes = {

    /** 加载地址 */
    url: string
    /**
     * 类型字符串 复合类型  spine  可以配合
     * @see Laya.Loader.IMAGE
     */
    type?: string
    /**
     * 忽略复合加载类型中的后缀
     * @example
     * png   jpg
     */
    ignoreSuffix?: string
    /** 强制加载 */
    forceLoad?: boolean
    /** 分支 */
    branch?: string
    /** 运行时加载 */
    runLoad?: boolean
    //------------  Laya 的数据

    size?: number

    priority?: number

    useWorkerLoader?: boolean

    progress?: number

    group?: string

}