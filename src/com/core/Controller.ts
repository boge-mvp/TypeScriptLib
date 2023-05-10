import Handler = Laya.Handler
import {StringUtil} from "../utils/StringUtil"
import {Factory} from "../Factory"
import {Log} from "../Log";
import {IController, IKey, IProxy, IView} from "../interfaces/ICommon";

export class Controller implements IController {

    /** 事件缓存的所有组 组名字->组object */
    private obj: { [key: string]: { [key: string]: Handler[] } } = {}
    /**
     * 键值的缓存对象
     */
    private cacheTarget: { [key: string]: any } = {}

    private static _CLSID = 0

    regActionHandler(action: string, handler: Laya.Handler, group?: string) {
        let groupObj = this.getGroup(group)
        // 获取此分组下  action 的执行函数存储数组
        if (groupObj[action] == null) groupObj[action] = []
        groupObj[action].push(handler)
    }

    /**
     * 分组存储对象
     * @param groupKey 分组key
     * @return
     */
    getGroup(groupKey: string) {
        if (StringUtil.isEmpty(groupKey)) {
            groupKey = Factory.DEFAULT_GROUP
        }
        let groupObj = this.obj[groupKey]
        if (groupObj == null) groupObj = {}
        this.obj[groupKey] = groupObj
        return groupObj
    }

    regAction(action: string, caller: any, method: Function, group?: string) {
        this.regActionHandler(action, new Laya.Handler(caller, method), group)
    }

    clearView() {
        this.cacheTarget = {}
        Controller._CLSID = 0
    }

    clearGroup() {
        this.obj = {}
    }

    removeAllAction(...args: string[]) {
        let temps: string[]
        for (let groupKey in this.obj) {// 获取key
            temps = args.concat()
            temps.unshift(groupKey)
            this.removeGroupActions.apply(this, temps)
        }
    }

    removeGroup(group: string) {
        delete this.obj[group]
    }

    removeGroupActions(groupKey: string, ...args) {
        let groupObj = this.getGroup(groupKey)
        for (let i = 0; i < args.length; i++) {
            delete groupObj[args[i]]
        }
    }

    removeActionHandler(action: string, method: Function, group?: string) {
        if (group == null) {
            for (let groupKey in this.obj) {
                this.removeFunction(<any>groupKey, action, method)
            }
            return
        }
        let groupObj = this.getGroup(group)
        this.removeFunction(groupObj, action, method)
    }

    removeFunction(groupObj: any, action: string, method: Function) {
        let arr: Laya.Handler[] = groupObj[action]
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                let h: Laya.Handler = arr[i]
                if (h.method == method) {
                    arr.splice(i, 1)
                    i--
                }
            }
            if (arr.length == 0) delete groupObj[action]
        }
    }

    removeTargetAll(caller: any) {
        for (let groupObj in this.obj) {
            this.removeTarget(this.obj[groupObj], caller)
        }
    }

    removeTarget(groupObj: any, caller: any) {
        for (let action in groupObj) {
            let arr: any[] = groupObj[action]
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    let h: Handler = arr[i]
                    if (h.caller == caller) {
                        arr.splice(i, 1)
                        i--
                    }
                }
                if (arr.length == 0) delete groupObj[action]
            }
        }
    }

    sendGroupAction(group: string, action: string, ...args) {
        args.unshift(action)
        args.unshift(group)
        let result: boolean = this.sendActionEvent.apply(this, args)
        if (!result) {
            Log.warn("group[" + group + "], action [" + action + "] not exist! Call failure")
        }
    }

    sendAction(action: string, ...args) {
        let temps: any[]
        let result: boolean
        for (let groupName in this.obj) {
            temps = args.concat()
            temps.unshift(action)
            temps.unshift(groupName)
            let tempResult: boolean = this.sendActionEvent.apply(this, temps)
            if (tempResult) result = true
        }
        if (!result)
            Log.warn("action [" + action + "] not exist! Call failure")
    }

    sendActionEvent(group: string, action: string, ...args) {
        let groupObj = this.getGroup(group)
        let arr = groupObj[action]
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                arr[i].runWith(args)
            }
            return true
        }
        return false
    }


    addView<T extends IView & IKey>(key: string | { new(): T }, view: T) {
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
        view.setKey(key)
        this.cacheTarget[key] = view
        return true
    }

    removeView<T extends IView & IKey>(key: string | T) {
        if (key == null) return
        if (typeof key !== "string") {
            key = key.getKey()
        }
        if (StringUtil.isEmpty(key)) return

        delete this.cacheTarget[key]
    }

    getView<T>(key: string | { new(): T }): T {
        if (key == null) return
        if (typeof key !== "string") {
            key = this._getClassSign(key)
        }
        return this.cacheTarget[key]
    }

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T) {
        if (typeof key !== "string") {
            key = this._getClassSign(key)
        }
        if (StringUtil.isEmpty(key)) {
            Log.warn("Proxy name cannot be empty!")
            return false
        }
        if (this.getProxy(key)) {
            Log.warn("already exist key = " + key + ", add failure!")
            // return false
        }
        proxy.setKey(key)
        this.cacheTarget[key] = proxy
        return true
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        if (key == null) return
        if (typeof key !== "string") {
            key = key.getKey()
        }
        if (StringUtil.isEmpty(key)) return
        delete this.cacheTarget[key]
    }

    getProxy<T>(name: string | { new(): T }): T {
        if (name == null) return
        if (!(typeof name === "string")) {
            name = this._getClassSign(name)
        }
        return this.cacheTarget[name]
    }

    getMap() {
        return this.cacheTarget
    }

    /**
     * 返回类的唯一标识
     */
    private _getClassSign(cla: any): string {
        let className = cla["__className"] || cla["_cacheId"]
        if (!className) {
            cla["_cacheId"] = className = Factory.DEFAULT_CACHE_HEAD + "_" + Controller._CLSID
            Controller._CLSID++
        }
        return className
    }

}
