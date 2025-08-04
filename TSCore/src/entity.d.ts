
// 通用装饰器类型定义
// type PropertyDecorator = (target: any, propertyKey: string) => PropertyDescriptor | void;
// type ClassDecorator = <T extends Function>(constructor: T) => T | void;
// type MethodDecorator = <T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
// type MethodDecorator2 = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor | void;
//

/**
 * 动态参数 function 或 Laya.Handler
 *
 * 可使用 runFun 运行
 *
 * @see runFun
 */
declare type ParamHandler = ((...args) => any) | Laya.Handler

declare type Constructor<T = {}> = new (...args: any[]) => T

/** 使用交叉类型连接多个类型 */
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/** 获取构造函数的实例类型 */
declare type InstanceTypeOfConstructor<T> = T extends Constructor<infer R> ? R : never

declare type InitApp = {
    /** 初始化Laya */
    laya?: {
        /**
         * 渲染模式
         * @default Laya.WebGL
         */
        renders?: any[],
        /**
         * 初始化引擎的宽
         * @default 720
         */
        width?: number,
        /**
         * 初始化引擎的高
         * @default 1280
         */
        height?: number
    }
    init?: {
        /**
         * 是否初始化 Laya
         * @default true
         */
        laya?: boolean,
        /**
         * 是否初始化 fgui 如: Laya.stage.addChild(GRoot.inst.displayObject)
         * @default true
         */
        fgui?: boolean,
        /**
         * 是否初始化引擎 手动调用 App.init()
         * @default true
         * @see App.init
         */
        coreLib?: boolean
    }
    /**
     * 是否让GRoot 自适应大小 需要初始化fgui保持开启状态 否则需手动调用 App.inst.openResize
     * @default true
     * @see App.openResize
     */
    resize?: boolean
    /**
     * 是否启用刘海屏模式
     * @default false
     */
    isNotchEnable?: boolean
}

/**
 * 初始化引擎接口
 * @example
 * App._init()
 * init?.run?.()
 *
 * Laya.init()
 * Laya.stage.addChild(fgui.GRoot.inst.displayObject)
 * init?.onEngine?.()
 * openResize()
 * App.initEngine?.onEnd?.()
 */
declare type IInitEngine = {
    /**
     * 引擎初始化前
     */
    onRun?: () => Promise<boolean | void>

    /**
     * 引擎初始化结束
     * Laya fgui
     */
    onEngine?: () => Promise<boolean | void>

    /**
     * 所有初始化完成，包括延迟执行
     */
    onEnd?: () => void
    /**
     * 因为某修情况初始化失败
     */
    onFail?: () => void
}

/**
 * 组件数据类，用于创建组件实例。
 */
declare type ComponentData = {
    /**
     * 创建key
     */
    key?: string
    /**
     * 目标类的构造函数。
     */
    classTarget?: { new(): any }
    /**
     * 是否自动初始化 默认true
     */
    autoInit?: boolean
    /**
     * 自动创建顺序 默认0 越大越后创建
     * @type {number}
     */
    order?: number
    /**
     * 创建UI的路径。
     */
    createUi?: string
    /**
     * 是否加入bean缓存中 默认true
     *
     * 当设置为false后，·autoInit·设置将失效，不会自动初始化
     */
    isJoinBean?: boolean
}

/**
 * 事件处理的绑定数据
 */
declare type ActionsData = {
    className: string
    fun: Function
    action: number | string
    group?: string
    order?: number
}

/**
 * 点击事件处理的绑定数据
 */
declare type EventData = {
    /**
     * 绑定注册事件 类的prototype
     */
    target?: any,
    className: string
    fun: Function
    /**
     * Laya.Event
     */
    eventName: string
    /**
     * this.getChild(childName)
     */
    childName?: string
    /**
     * 附带值
     */
    args?: any[]
}

/**
 * 应用程序运行接口。
 */
declare interface IRunApplication {
    start(): void
}
declare type PointType = { x?: number, y?: number }
declare type RectangleType = { x?: number, y?: number, width?: number, height?: number }

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
     * 起始时间 毫秒
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间 毫秒
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
     * 播放完成一次会回调一次
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
    readonly loaderComplete?: ParamHandler
    /**
     * 全部动画播放结束后回调
     */
    playComplete?: ParamHandler
    /**
     * 当前播放动画的进度
     *
     * 默认是播放结束， 可以设置 before 播放之前和 after之后 会带传入的`nameOrIndex: string | number`参数，默认播放传入的是0
     */
    progress?: ParamHandler | { before?: ParamHandler, after?: ParamHandler }
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间 毫秒
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间 毫秒
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
    ignoreSuffix?: string | "png" | "atlas"
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

/**
 * http请求数据返回
 */
declare type HttpResponse<T = any> = {
    code: number
    data: T,
    message: string,
    [key: string]: any
}

/**
 * 自定义返回数据格式
 */
declare type CustomResult<T = any> = {
    /** 执行成功 */
    succeed?: boolean,
    /** 描述文案 */
    msg?: string,
    /** 附带属性 */
    data?: T
}