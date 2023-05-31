import {IAction} from "./interfaces/IAction"
import {DefineConfig} from "./DefineConfig"
import {Controller} from "./core/Controller"
import Handler = Laya.Handler;
import {MyLoader} from "./core/MyLoader";
import {ConfigKit, EnvType} from "./ConfigKit";
import {Log} from "./Log";
import {IController, IKey, IProxy, IView} from "./interfaces/ICommon";

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
    /**
     *  游戏公用组
     */
    static GAME_GROUP = "game_group"

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
        let envType = ConfigKit.env()
        Log.debug("env", EnvType[envType])
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

export class ViewProxy {

    getProxy<T>(name: string | { new(): T }): T {
        return Factory.inst.getProxy(name)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

}

export class ViewBlock {

    getProxy<T>(name: string | { new(): T }): T {
        return Factory.inst.getProxy(name)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean {
        return Factory.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        Factory.inst.removeView(key)
    }

}

export class ProxyBlock {

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean {
        return Factory.inst.addProxy(key, proxy)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return Factory.inst.getProxy(key)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        Factory.inst.removeProxy(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

}

export class StringBlock {
    /** 根据语言包id获取字符串 */
    getString(id: string | number, ...args): string {
        return window.getString(id, ...args)
    }
}

export class ActionEvent implements IAction {

    regAction(action: string, caller: any, method: Function, group?: string) {
        Factory.inst.regAction(action, caller, method, group)
    }

    regActionHandler(action: string, handler: Laya.Handler, group?: string) {
        Factory.inst.regActionHandler(action, handler, group)
    }

    /** 注册游戏数据 */
    regGameAction(action: string, caller: any, method: Function) {
        this.regAction(action, caller, method, Factory.GAME_GROUP)
    }

    removeAllAction(...args: string[]) {
        Factory.inst.removeAllAction.apply(Factory.inst, args)
    }

    removeGroup(group: string) {
        Factory.inst.removeGroup(group)
    }

    removeGroupActions(group: string, ...args: string[]) {
        args.unshift(group)
        Factory.inst.removeGroupActions.apply(Factory.inst, args)
    }

    removeActionHandler(action: string, method: Function, group?: string) {
        Factory.inst.removeActionHandler(action, method, group)
    }

    removeFunction(groupObj: any, action: string, method: Function) {
        Factory.inst.removeFunction(groupObj, action, method)
    }

    removeTargetAll(caller: any) {
        Factory.inst.removeTargetAll(caller)
    }

    removeTarget(groupObj: any, caller: any) {
        Factory.inst.removeTarget(groupObj, caller)
    }

    sendAction(action: string, ...args) {
        args.unshift(action)
        Factory.inst.sendAction.apply(Factory.inst, args)
    }

    sendGroupAction(group: string, action: string, ...args) {
        args.unshift(action)
        args.unshift(group)
        Factory.inst.sendGroupAction.apply(Factory.inst, args)
    }

}