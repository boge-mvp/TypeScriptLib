import {IAction} from "./interfaces/IAction"
import {IController} from "./interfaces/IController"
import {DefineConfig} from "./DefineConfig"
import {IView} from "./interfaces/IView"
import {IProxy} from "./interfaces/IProxy"
import {IKey} from "./interfaces/IKey"
import {Controller} from "./core/Controller"
import Handler = Laya.Handler;
import {MyLoader} from "./core/MyLoader";
import {ConfigKit} from "./ConfigKit";

export class Factory implements IAction {

    private static _instance: Factory

    static get inst(): Factory {
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

    private controller: IController

    constructor() {
        this.initController()
    }

    /**
     * 初始化框架
     */
    static init() {
        this._instance = new Factory()
        DefineConfig.init()
        ConfigKit.env()
        // 使用自定义加载器加载资源
        fgui.AssetProxy.inst.setAsset(MyLoader.loader)
    }

    static initClass(...args) {
        for (let i = 0; i < args.length; i++) {
            new args[i]()
        }
    }

    protected initController() {
        this.controller = new Controller()
    }

    regActionHandler(action: string, handler: Handler, group: string = null) {
        this.controller.regActionHandler(action, handler, group)
    }

    regAction(action: string, caller: any, method: Function, group: string = null) {
        this.controller.regAction(action, caller, method, group)
    }

    removeAllAction(...args: string[]) {
        this.controller.removeAllAction.apply(this.controller, args)
    }

    removeGroup(group: string) {
        this.controller.removeGroup(group)
    }

    removeGroupActions(group: string, ...args) {
        args.unshift(group)
        this.controller.removeGroupActions.apply(this.controller, args)
    }

    removeActionHandler(action: string, method: Function, group: string = null) {
        this.controller.removeActionHandler(action, method, group)
    }

    removeFunction(groupObj: any, action: string, method: Function) {
        this.controller.removeFunction(groupObj, action, method)
    }

    removeTargetAll(caller: any) {
        this.controller.removeTargetAll(caller)
    }

    removeTarget(groupObj: any, caller: any) {
        this.controller.removeTarget(groupObj, caller)
    }

    sendAction(action: string, ...args) {
        args.unshift(action)
        this.controller.sendAction.apply(this.controller, args)
    }

    sendGroupAction(group: string, action: string, ...args) {
        args.unshift(action)
        args.unshift(group)
        this.controller.sendGroupAction.apply(this.controller, args)
    }


    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
        return this.controller.addView(key, view)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        this.controller.removeView(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return this.controller.getView(key)
    }

    getProxy<T>(name: string | { new(): T }): T {
        return this.controller.getProxy(name)
    }

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T) {
        return this.controller.addProxy(key, proxy)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        this.controller.removeProxy(key)
    }

    /** 清除所有UI缓存 */
    clearView() {
        this.controller.clearView()
    }

    /** 清除所有分组和包含的事件 */
    clearGroup() {
        this.controller.clearGroup()
    }

}
