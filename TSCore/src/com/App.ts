import {IAction} from "./interfaces/IAction"
import {DefineConfig} from "./DefineConfig"
import {EventController} from "./core/EventController"
import {ELoader} from "./extends/ELoader";
import {ConfigKit, EnvType} from "./kit/ConfigKit";
import {Log} from "./Log";
import {IController, IInitEngine, IKey, IProxy, IView} from "./interfaces/ICommon";
import {Path} from "./Path";
import Handler = Laya.Handler;

export class App implements IAction {

    private static _instance: App

    static get inst(): App {
        return this._instance
    }

    /** 默认的分组名
     * @default group
     * */
    static DEFAULT_GROUP = "group"
    /** 默认cacheId标记头
     * @default cache
     * */
    static DEFAULT_CACHE_HEAD = "cache"
    /**
     *  游戏公用组
     */
    static GAME_GROUP = "game_group"

    static initEngine?: IInitEngine
    options: InitApp
    private _controller: IController
    /**
     * 绑定的类属性
     * 类名 -> [属性名，属性名]
     */
    static beanClassProperty = new Map<string, string[]>()
    /**
     * 绑定的类
     * 类名 -> 类 class
     */
    static beanClassComponent: ComponentData[] = []
    /**
     * 绑定的方法
     * 类名 -> 生成方法
     */
    static beanClassFunction = new Map<string, Function>()
    /**
     * 绑定事件处理方法
     */
    static beanActionsFunction: ActionsData[] = []
    /**
     * 绑定监听事件处理方法
     */
    static beanEventFunction: EventData[] = []

    /**
     *
     * @param init
     * @param options
     */
    static run(init?: IInitEngine, options?: InitApp) {
        App.initEngine = init
        this._instance ??= new App()
        // 默认配置
        const def: InitApp = {
            laya: {renders: [Laya.WebGL], width: 720, height: 1280},
            init: {
                laya: true,
                fgui: true,
                coreLib: true
            },
            resize: true,
            isNotchEnable: false
        }

        App.inst.options = options = options ? defaults(options, def) : def
        options.init?.coreLib && App._init()
        init?.run?.()

        options.init?.laya && Laya.init(options.laya.width, options.laya.height, ...options.laya.renders)

        options.init?.fgui && Laya.stage.addChild(fgui.GRoot.inst.displayObject)

        init?.onEngine?.()

        Laya.timer.callLater(App.inst, App.inst.lastInit)
    }

    /** 设置默认竖屏布局 */
    static updateDefaultScreen() {
        // 设置竖屏
        const conchConfig: { setScreenOrientation: Function } = ConfigKit.get("conchConfig")
        // landscape: 0, portrait: 1, user: 2, behind: 3, sensor: 4, nosensor: 5, sensor_landscape: 6, sensor_portrait: 7, reverse_landscape: 8, reverse_portrait: 9, full_sensor: 10,
        conchConfig?.setScreenOrientation?.(1)
        //设置横竖屏
        if (Laya.Browser.onPC && !Laya.Browser.onLayaRuntime) {
            Laya.stage.alignV = Laya.Stage.ALIGN_TOP
            Laya.stage.alignH = Laya.Stage.ALIGN_CENTER
            Laya.stage.screenMode = Laya.Stage.SCREEN_NONE
            Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL
        } else {
            Laya.stage.alignV = Laya.Stage.ALIGN_TOP
            Laya.stage.alignH = Laya.Stage.ALIGN_LEFT
            Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL
            Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO
        }
    }

    /**
     * 初始化框架
     * @deprecated
     * @see run
     */
    static init() {
        App._init()
    }

    private static _init() {
        this._instance ??= new App()
        DefineConfig.init()
        let envType = ConfigKit.env()
        Log.debug("env", EnvType[envType])
        Laya.URL.customFormat = Path.formatUrl
        // 使用自定义加载器加载资源
        fgui.AssetProxy.inst.setAsset(ELoader.loader)
    }

    static initClass(...args: (new () => any)[]) {
        for (let i = 0; i < args.length; i++) {
            new args[i]()
        }
    }

    lastInit() {
        this.openResize()
        App.initEngine?.onEnd?.()
    }

    constructor() {
        this.initController()
    }

    /**
     * 开启屏幕大小自动调整
     */
    openResize() {
        if (this.options.resize && this.options.init?.fgui) {
            Laya.stage.on(Laya.Event.RESIZE, this, this.onResize)
            this.onResize()
        }
    }

    private onResize() {
        let screenWidth = Laya.stage.width
        let screenHeight = Laya.stage.height
        let dx = Laya.stage.designWidth
        let dy = Laya.stage.designHeight
        if (screenWidth > screenHeight && dx < dy || screenWidth < screenHeight && dx > dy) {
            //scale should not change when orientation change
            let tmp = dx
            dx = dy
            dy = tmp
        }
        let s1 = screenWidth / dx
        let s2 = screenHeight / dy
        let contentScaleFactor = Math.min(s1, s2)
        fgui.GRoot.inst.setSize(Math.round(screenWidth / contentScaleFactor), Math.round(screenHeight / contentScaleFactor))
        fgui.GRoot.inst.setScale(contentScaleFactor, contentScaleFactor)
        Log.debug(`onResize ${screenWidth} ${screenHeight} ${contentScaleFactor}`)
    }

    protected initController() {
        this._controller = new EventController()
    }

    regActionHandler(action: string | number, handler: Handler, group: string = null) {
        this._controller.regActionHandler(action, handler, group)
    }

    regAction(action: string | number, caller: any, method: Function, group: string = null, order?: number) {
        this._controller.regAction(action, caller, method, group, order)
    }

    removeAllAction(...args: string[]) {
        this._controller.removeAllAction.apply(this._controller, args)
    }

    removeGroup(group: string) {
        this._controller.removeGroup(group)
    }

    removeGroupActions(group: string, ...args) {
        args.unshift(group)
        this._controller.removeGroupActions.apply(this._controller, args)
    }

    removeActionHandler(action: string | number, method: Function, group: string = null) {
        this._controller.removeActionHandler(action, method, group)
    }

    removeFunction(groupObj: any, action: string | number, method: Function) {
        this._controller.removeFunction(groupObj, action, method)
    }

    removeTargetAll(caller: any) {
        this._controller.removeTargetAll(caller)
    }

    removeTarget(groupObj: any, caller: any) {
        this._controller.removeTarget(groupObj, caller)
    }

    sendAction(action: string | number, ...args) {
        args.unshift(action)
        this._controller.sendAction.apply(this._controller, args)
    }

    sendGroupAction(group: string, action: string | number, ...args) {
        args.unshift(action)
        args.unshift(group)
        this._controller.sendGroupAction.apply(this._controller, args)
    }


    addBean<T>(key: string | { new(): T }, bean: T, saveClassName?: boolean) {
        return this._controller.addBean(key, bean, saveClassName)
    }

    removeBean<T extends { new(...args: any[]) }>(key: string | T) {
        this._controller.removeBean(key)
    }

    getBean<T>(key: string | { new(): T }): T {
        return this._controller.getBean(key)
    }

    hasBean<T>(key: string | { new(): T }): boolean {
        return this._controller.hasBean(key)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
        return this._controller.addView(key, view)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        this._controller.removeView(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return this._controller.getView(key)
    }

    getProxy<T>(name: string | { new(): T }): T {
        return this._controller.getProxy(name)
    }

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T) {
        return this._controller.addProxy(key, proxy)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        this._controller.removeProxy(key)
    }

    /** 清除所有UI缓存 */
    clearView() {
        this._controller.clearView()
    }

    /** 清除所有分组和包含的事件 */
    clearGroup() {
        this._controller.clearGroup()
    }


    /** 获取当前屏幕等比例缩放系数 */
    getEqualRatioScale() {
        let point = this.getEqualRatioRatio(fgui.GRoot.inst.width, fgui.GRoot.inst.height)
        return Math.min(point.x, point.y)
    }

    /**
     * 获取当前屏幕等比例缩放系数
     * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
     * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
     */
    getEqualRatioRatio(w?: number, h?: number) {
        w ??= Laya.stage.width
        h ??= Laya.stage.height
        let s1 = w / Laya.stage.designWidth
        let s2 = h / Laya.stage.designHeight
        if (Laya.stage.screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
            s1 = w / Laya.stage.designHeight
            s2 = h / Laya.stage.designWidth
        }
        return new Laya.Point(s1, s2)
    }

    getStackTrace(): string {
        try {
            // 故意抛出一个错误来捕获堆栈信息
            throw new Error()
        } catch (error) {
            // 返回错误对象的堆栈信息
            return error.stack
        }
    }

}