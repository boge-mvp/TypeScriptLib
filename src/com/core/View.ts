import {Factory} from "../Factory"
import {IKey, IView} from "../interfaces/ICommon";

export class View extends fgui.GComponent implements IView, IKey {

    protected key: string

    regAction(action: string, caller: any, method: Function, group?: string) {
        Factory.inst.regAction(action, caller, method, group)
    }

    regActionHandler(action: string, handler: Laya.Handler, group?: string) {
        Factory.inst.regActionHandler(action, handler, group)
    }

    removeAllAction(...args: string[]) {
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

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean {
        return Factory.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        Factory.inst.removeView(key)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return Factory.inst.getProxy(key)
    }

    setKey(key: string) {
        this.key = key
    }

    getKey(): string {
        return this.key
    }

    dispose() {
        this.removeView(this.key)
        this.removeTargetAll(this)
        if (!this.isDisposed)
            super.dispose()
    }

}

