import {StringUtil} from "../utils/StringUtil"
import {App} from "../App"
import {Log} from "../Log";
import {IController, IKey, IProxy, IView} from "../interfaces/ICommon";

export class EventController implements IController {

    /** 事件缓存的所有组 组名字->组object */
    private eventGroup = new Map<string, Map<string | number, Laya.Handler[]>>()
    /**
     * 缓存key -> 实例
     */
    private cacheTarget = new Map<string, any>()
    /**
     * 缓存类名 -> 实例
     */
    private cacheClassTarget = new Map<string, any>()

    private static _CLSID = 0

    regActionHandler(action: string | number, handler: Laya.Handler, group?: string, order?: number) {
        handler.order = order
        let groupObj = this.getGroup(group)
        // 获取此分组下  action 的执行函数存储数组
        groupObj.getOrPut(action, () => []).push(handler)
    }

    /**
     * 分组存储对象
     * @param groupKey 分组key
     * @return
     */
    getGroup(groupKey: string) {
        if (StringUtil.isEmpty(groupKey)) {
            groupKey = App.DEFAULT_GROUP
        }
        return this.eventGroup.getOrPut(groupKey, () => new Map())
    }

    regAction(action: string | number, caller: any, method: Function, group?: string, order?: number) {
        const handler = new Laya.Handler(caller, method)
        this.regActionHandler(action, handler, group, order)
    }

    clearView() {
        this.cacheTarget.clear()
        EventController._CLSID = 0
    }

    clearGroup() {
        this.eventGroup.clear()
        Log.debug("clear eventGroup")
    }

    removeAllAction(...args: string[]) {
        for (const key of this.eventGroup.keys()) {// 获取key
            this.removeGroupActions.apply(this, [key, ...args])
        }
    }

    removeGroup(groupKey: string) {
        Log.debug(`removeGroup ${groupKey}`)
        this.eventGroup.delete(groupKey)
    }

    removeGroupActions(groupKey: string, ...args) {
        let groupObj = this.getGroup(groupKey)
        args.forEach(value => groupObj.delete(value))
    }

    removeActionHandler(action: string | number, method: Function, group?: string) {
        if (!group) {
            for (let groupKey of this.eventGroup.values()) {
                this.removeFunction(groupKey, action, method)
            }
            return
        }
        let groupObj = this.getGroup(group)
        this.removeFunction(groupObj, action, method)
    }

    removeFunction(groupObj: Map<string | number, Laya.Handler[]>, action: string | number, method: Function) {
        let arr = groupObj.get(action)
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                let h = arr[i]
                if (h.method == method) {
                    arr.splice(i, 1)
                    i--
                }
            }
            if (arr.length == 0) groupObj.delete(action)
        }
    }

    removeTargetAll(caller: any) {
        for (let groupObj of this.eventGroup.keys()) {
            this.removeTarget(this.eventGroup.get(groupObj), caller)
        }
    }

    removeTarget(groupObj: Map<string | number, Laya.Handler[]>, caller: any) {
        for (const [key, value] of groupObj.entries()) {
            for (let i = 0; i < value.length; i++) {
                let h = value[i]
                if (h.caller == caller) {
                    value.splice(i, 1)
                    i--
                }
            }
            if (value.length == 0) groupObj.delete(key)
        }
    }

    sendGroupAction(group: string, action: string | number, ...args: any[]) {
        let result: boolean = this.sendActionEvent.apply(this, [group, action, ...args])
        if (!result) {
            Log.debug("group[" + group + "], action [" + action + "] not exist! Call failure")
        }
    }

    sendAction(action: string | number, ...args: any[]) {
        let result: boolean
        for (const groupName of this.eventGroup.keys()) {
            let tempResult: boolean = this.sendActionEvent.apply(this, [groupName, action, ...args])
            if (tempResult) result = true
        }
        if (!result)
            Log.debug("action [" + action + "] not exist! Call failure")
    }

    sendActionEvent(group: string, action: string | number, ...args: any[]) {
        let groupObj = this.getGroup(group)
        let arr = groupObj.get(action)
        if (arr) {
            arr.sort((a, b) => a.order || 100 - b.order || 100)
                .forEach(value =>
                    value.runWith(args)
                )
            return true
        }
        return false
    }

    addBean<T>(key: string | { new(): T }, bean: T, saveClassName = true) {
        if (typeof key !== "string") {
            key = this._getClassSign(key)
        }
        if (StringUtil.isEmpty(key)) {
            Log.warn("cannot be empty, key = " + key)
            return false
        }
        if (this.getView(key)) {
            Log.warn("already exist key = " + key + ", add failure!")
            return false
        }
        this.cacheTarget.set(key, bean)
        if (saveClassName) {
            this.cacheClassTarget.set(bean.constructor.name, bean)
        }
        return true
    }

    removeBean<T extends { new(...args: any[]) }>(key: string | T) {
        if (!key) return
        if (typeof key !== "string") {
            key = this._getClassSign(key, false)
        }
        if (StringUtil.isEmpty(key)) return
        this.cacheTarget.delete(key)
        this.cacheClassTarget.delete(key.charAt(0).toUpperCase() + key.slice(1))
    }

    getBean<T>(key: string | { new(): T }): T {
        if (!key) return
        if (typeof key !== "string") {
            key = this._getClassSign(key, false)
        }
        return this.cacheTarget.get(key) ?? this.cacheClassTarget.get(key)
    }

    hasBean<T>(key: string | { new(): T }): boolean {
        if (typeof key !== "string") {
            key = this._getClassSign(key, false)
        }
        if (!key) return false
        return this.cacheTarget.has(key) || this.cacheClassTarget.has(key)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
        if (this.addBean(key, view)) {
            if (typeof key !== "string") {
                key = this._getClassSign(key)
            }
            view.setKey(key)
            return true
        }
        return false
    }

    removeView<T extends IView & IKey>(key: string | T) {
        if (!key) return
        if (typeof key !== "string") {
            key = key.getKey()
        }
        this.removeBean(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return this.getBean(key)
    }

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T) {
        if (this.addBean(key, proxy)) {
            if (typeof key !== "string") {
                key = this._getClassSign(key)
            }
            proxy.setKey(key)
            return true
        }
        return false
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        if (!key) return
        if (typeof key !== "string") {
            key = key.getKey()
        }
        this.removeBean(key)
    }

    getProxy<T>(name: string | { new(): T }): T {
        return this.getBean(name)
    }

    getMap() {
        return this.cacheTarget
    }

    /**
     * 返回类的唯一标识
     */
    private _getClassSign<T>(cla: { new(): T }, create = true): string {
        let className = cla["__className"] || cla["_cacheId"] || cla.name
        if (!className && create) {
            cla["_cacheId"] = className = `${App.DEFAULT_CACHE_HEAD}_${EventController._CLSID}`
            EventController._CLSID++
        }
        return className
    }

}
