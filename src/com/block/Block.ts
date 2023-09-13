import {Factory} from "../Factory";
import {IKey, IProxy, IView} from "../interfaces/ICommon";
import {IAction} from "../interfaces/IAction";

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

    /**
     * 根据语言包id获取字符串
     * @deprecated
     * @see window.getString
     */
    getString(id: string | number, ...args): string {
        return getString(id, ...args)
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