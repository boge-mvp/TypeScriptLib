import {IKey, IProxy, IView} from "../interfaces/ICommon";
import {IAction} from "../interfaces/IAction";
import {App} from "../App";

export class BezierCurves {

    /** 经过时间 */
    private _t = -1
    private p1: Laya.Point
    private p2: Laya.Point
    private p3: Laya.Point
    private p4: Laya.Point

    get t() {

        return this._t
    }

    set t(value: number) {
        if (value < 0) return
        this._t = value
        // @ts-ignore
        this.setXY(this.getX(), this.getY())
    }

    getX() {
        return Math.pow((1 - this._t), 3) * this.p1.x
            + 3 * this.p2.x * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.x * this._t * this._t * (1 - this._t)
            + this.p4.x * Math.pow(this._t, 3)
    }

    getY() {
        return Math.pow((1 - this._t), 3) * this.p1.y
            + 3 * this.p2.y * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.y * this._t * this._t * (1 - this._t)
            + this.p4.y * Math.pow(this._t, 3)
    }

    setStartPoint(x: number, y: number) {
        this.p1 = Laya.Point.create().setTo(x, y)
        this._t = -1
    }

    setMiddlePoint(x: number, y: number) {
        this.p3 = this.p2 = Laya.Point.create().setTo(x, y)
    }

    setMiddlePoint2(x1: number, y1: number, x2: number, y2: number) {
        this.p2 = Laya.Point.create().setTo(x1, y1)
        this.p3 = Laya.Point.create().setTo(x2, y2)
    }

    setEndPoint(x: number, y: number) {
        this.p4 = Laya.Point.create().setTo(x, y)
    }

    /**
     * 释放曲线数据
     */
    recover() {
        this._t = -1
        this.p1?.recover()
        this.p2?.recover()
        this.p3?.recover()
        this.p4?.recover()
    }

}

/**
 * 只有 getProxy 和 getView
 */
export class ViewProxy {

    getProxy<T>(name: string | { new(): T }): T {
        return App.inst.getProxy(name)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

}

export class ViewBlock {

    getProxy<T>(name: string | { new(): T }): T {
        return App.inst.getProxy(name)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean {
        return App.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        App.inst.removeView(key)
    }

}

export class ProxyBlock {

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean {
        return App.inst.addProxy(key, proxy)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return App.inst.getProxy(key)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        App.inst.removeProxy(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return App.inst.getView(key)
    }

}

export class StringBlock {

    /**
     * 根据语言包id获取字符串
     * @deprecated
     * @see window.getString
     */
    getString(id: string | number, ...args: any[]): string {
        return getString(id, ...args)
    }
}

export class ActionEvent implements IAction {

    regAction(action: string, caller: any, method: Function, group?: string, order?: number) {
        App.inst.regAction(action, caller, method, group, order)
    }

    regActionHandler(action: string, handler: Laya.Handler, group?: string) {
        App.inst.regActionHandler(action, handler, group)
    }

    /** 注册游戏数据 */
    regGameAction(action: string, caller: any, method: Function, order?: number) {
        this.regAction(action, caller, method, App.GAME_GROUP, order)
    }

    removeAllAction(...args: string[]) {
        App.inst.removeAllAction.apply(App.inst, args)
    }

    removeGroup(group: string) {
        App.inst.removeGroup(group)
    }

    removeGroupActions(group: string, ...args: string[]) {
        args.unshift(group)
        App.inst.removeGroupActions.apply(App.inst, args)
    }

    removeActionHandler(action: string, method: Function, group?: string) {
        App.inst.removeActionHandler(action, method, group)
    }

    removeFunction(groupObj: any, action: string, method: Function) {
        App.inst.removeFunction(groupObj, action, method)
    }

    removeTargetAll(caller: any) {
        App.inst.removeTargetAll(caller)
    }

    removeTarget(groupObj: any, caller: any) {
        App.inst.removeTarget(groupObj, caller)
    }

    sendAction(action: string, ...args) {
        args.unshift(action)
        App.inst.sendAction.apply(App.inst, args)
    }

    sendGroupAction(group: string, action: string, ...args) {
        args.unshift(action)
        args.unshift(group)
        App.inst.sendGroupAction.apply(App.inst, args)
    }

}