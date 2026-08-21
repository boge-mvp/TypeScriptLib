import {IAction} from "../interfaces/IAction";
import {App} from "../App";

export class ActionEvent implements IAction {

    regAction(action: string | number, caller: any, method: Function, group?: string, order?: number) {
        App.inst.regAction(action, caller, method, group, order)
    }

    regActionHandler(action: string | number, handler: Laya.Handler, group?: string, order?: number) {
        App.inst.regActionHandler(action, handler, group, order)
    }

    /** 注册游戏数据 */
    regGameAction(action: string | number, caller: any, method: Function, order?: number) {
        this.regAction(action, caller, method, App.GAME_GROUP, order)
    }

    removeAllAction(...args: string[]) {
        App.inst.removeAllAction(...args)
    }

    removeGroup(group: string) {
        App.inst.removeGroup(group)
    }

    removeGroupActions(group: string, ...args: string[]) {
        App.inst.removeGroupActions(group, ...args)
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

    hasAction(action: string | number): boolean {
        return App.inst.hasAction(action)
    }

    sendAction(action: string | number, ...args: any[]) {
        App.inst.sendAction(action, ...args)
    }

    sendGroupAction(group: string, action: string | number, ...args: any[]) {
        App.inst.sendGroupAction(group, action, ...args)
    }

}