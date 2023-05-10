import GLabel = fgui.GLabel
import Handler = Laya.Handler
import {Factory} from "../Factory"
import {BaseProxy} from "./BaseProxy"
import {LanguageUtils} from "../utils/LanguageUtils"
import {StringUtil} from "../utils/StringUtil"
import {IKey, IView} from "../interfaces/ICommon";

export class BaseLabel extends GLabel implements IView {

    regAction(action: string, caller: any, method: Function, group?: string) {
        Factory.inst.regAction(action, caller, method, group)
    }

    regActionHandler(action: string, handler: Handler, group?: string) {
        Factory.inst.regActionHandler(action, handler, group)
    }

    removeAllAction(...args: any[]) {
        Factory.inst.removeAllAction.apply(Factory.inst, args)
    }

    removeGroup(group: string) {
        Factory.inst.removeGroup(group)
    }

    removeGroupActions(group: string, ...args) {
        args.unshift(group)
        Factory.inst.removeGroupActions.apply(Factory.inst, args)
    }

    removeActionHandler(action: string, method: Function, group?: string) {
        Factory.inst.removeActionHandler(action, method, group)
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

    /** 注册游戏数据 */
    regGameAction(action: string, caller: any, method: Function) {
        this.regAction(action, caller, method, BaseProxy.GAME_GROUP)
    }

    /** 根据语言包id获取字符串 */
    getString(id: string | number, ...args): string {
        let content = LanguageUtils.inst.getStr(id)
        args.unshift(content)
        return StringUtil.format.apply(null, args)
    }

    removeFunction(groupObj: any, action: string, method: Function): void {
        Factory.inst.removeFunction(groupObj, action, method)
    }

    removeTarget(groupObj: any, caller: any): void {
        Factory.inst.removeTarget(groupObj, caller)
    }

    removeTargetAll(caller: any): void {
        Factory.inst.removeTargetAll(caller)
    }

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