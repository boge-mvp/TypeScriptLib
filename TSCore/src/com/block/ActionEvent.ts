import {IAction} from "../interfaces/IAction";
import {App} from "../App";

export class ActionEvent implements IAction {

    regAction(action: string | number, caller: any, method: Function, group?: string, order?: number) {
        App.inst.regAction(action, caller, method, group, order)
    }

    regActionHandler(action: string | number, handler: Laya.Handler, group?: string) {
        App.inst.regActionHandler(action, handler, group)
    }

    /** 注册游戏数据 */
    regGameAction(action: string | number, caller: any, method: Function, order?: number) {
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

    removeActionHandler(action: string | number, method: Function, group?: string) {
        App.inst.removeActionHandler(action, method, group)
    }

    removeFunction(groupObj: any, action: string | number, method: Function) {
        App.inst.removeFunction(groupObj, action, method)
    }

    removeTargetAll(caller: any) {
        App.inst.removeTargetAll(caller)
    }

    removeTarget(groupObj: any, caller: any) {
        App.inst.removeTarget(groupObj, caller)
    }

    sendAction(action: string | number, ...args) {
        args.unshift(action)
        App.inst.sendAction.apply(App.inst, args)
    }

    sendGroupAction(group: string, action: string | number, ...args) {
        args.unshift(action)
        args.unshift(group)
        App.inst.sendGroupAction.apply(App.inst, args)
    }

}