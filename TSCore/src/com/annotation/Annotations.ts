/**
 * 组件数据类，用于创建组件实例。
 */
declare type ComponentData = {
    /**
     * 创建key
     */
    key?: string
    /**
     * 目标类的构造函数。
     */
    classTarget?: { new(): any }
    /**
     * 是否自动初始化 默认true
     */
    autoInit?: boolean
    /**
     * 自动创建顺序 默认0 越大越后创建
     * @type {number}
     */
    order?: number
    /**
     * 创建UI的路径。
     */
    createUi?: string
}

/**
 * 事件处理的绑定数据
 */
declare type ActionsData = {
    className: string
    fun: Function
    action: number | string
    group?: string
    order?: number
}

/**
 * 点击事件处理的绑定数据
 */
declare type EventData = {
    /**
     * 绑定注册事件 类的prototype
     */
    target?: any,
    className: string
    fun: Function
    /**
     * Laya.Event
     */
    eventName: string
    /**
     * this.getChild(childName)
     */
    childName?: string
    /**
     * 附带值
     */
    args?: any[]
}

/**
 * 获取一个指定名称或类型的Bean实例。
 * @param name - Bean的名称或构造函数。
 * @returns T 返回指定的Bean实例。
 */
function getBean<T>(name: string | { new(): T }): T {
    if (typeof name !== "string") {
        name = name.name.firstLowerCase()
    }
    // @ts-ignore
    return tsCore.App.inst.getBean(name)
}

/**
 * 组件装饰器，用于注册和创建组件实例。
 * @param value - 组件标识符或目标构造函数。 如果是null值 将不会自动初始化和添加到依赖管理器中，默认使用类名 首字母大小写都有
 * @returns any 返回装饰后的类。
 */
function Component<T extends { new(...args: any[]): {} }>(value: string | T | ComponentData = "") {

    let decorator: any = function (classTarget: T) {
        if (value != null) {
            let data: ComponentData = {}
            if (typeof value === "object") {
                data = value
                value = classTarget
            }
            data.autoInit ??= true
            const className = Reflect.getMetadata("class:name", classTarget) || classTarget.name
            data.key = typeof value === "string" && value.trim().length > 0 ? value : className.firstLowerCase()
            data.classTarget = classTarget

            if (!data.autoInit) {
                return proxyClass(classTarget, typeof value === "string" ? value : data.key)
            }
            // @ts-ignore
            tsCore.App.beanClassComponent.push(data)
            return classTarget
        } else {
            return proxyClass(classTarget)
        }
    }
    if (value && typeof value == "function") {
        decorator = decorator(value)
    }
    return decorator
}

/**
 * 资源装饰器，标记类属性为资源依赖。 只有被@Component加入依赖管理的类才会被绑定属性
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 */
function Resource(target: any, propertyKey: string) {
    const classTarget = Reflect.getMetadata("design:type", target, propertyKey)
    if (classTarget) {
        Object.defineProperty(target, propertyKey, {
            get(): any {
                return getBean(propertyKey)
            }
        })
    } else throw Error("class type null")
}

/**
 * Bean装饰器，标记类方法为返回Bean实例的方法。
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 * @param descriptor - 属性描述符。
 */
function Bean(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const returnTarget = Reflect.getMetadata("design:returntype", target, propertyKey)
    if (returnTarget) {
        // @ts-ignore
        tsCore.App.beanClassFunction.set(propertyKey, descriptor.value)
    } else throw Error("class type null")
}

/**
 * 注册事件
 * @param {number | string} action 事件名字
 * @param {string} group 分组集合
 * @param {number} order 值越大 越后执行 默认 100
 */
function Actions(action: number | string, group?: string, order?: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const className = target.constructor.name
        const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey)
        const fun = descriptor.value
        // @ts-ignore
        tsCore.App.beanActionsFunction.push({className, fun, action, group, order})
    }
}

/**
 * 点击事件装饰器
 *
 * 该装饰器用于在FGUI的GObject上注册点击事件监听，并将事件委托给特定的方法处理
 * 它会将相关信息（如类名、方法、事件名称、子节点名称和参数）推送到全局事件函数列表中
 * 并劫持GObject的constructFromResource方法以注册组件事件代理
 *
 * @param childName 子节点名称，可选
 * @param args 附加参数，可选
 */
function ClickOn(childName: string, args?: any[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 确保目标是一个FGUI的GObject实例
        if (target instanceof fgui.GObject) {
            const className = target.constructor.name
            const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey)
            const fun = descriptor.value
            const eventName = Laya.Event.CLICK
            // 将事件处理信息推送到全局列表中
            // @ts-ignore
            tsCore.App.beanEventFunction.push({target, className, fun, eventName, childName, args})
        } else {
            // 如果目标不是FGUI的GObject实例，输出调试日志
            // @ts-ignore
            tsCore.Log.debug("[click] Can only be used in fgui.GObject = " + data.childName)
        }
    }
}

/**
 * 通用事件监听装饰器
 *
 * 该装饰器允许开发者为FGUI的GObject动态添加各种事件监听，而不仅仅是点击事件
 * 它的工作原理类似于ClickOn装饰器，主要区别在于监听的事件类型可以自定义
 *
 * @param eventName 要监听的事件名称
 * @param childName 子节点名称，可选
 * @param args 附加参数，可选
 */
function EventOn(eventName: string, childName?: string, args?: any[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 确保目标是一个FGUI的GObject实例
        if (target instanceof fgui.GObject) {
            const className = target.constructor.name
            const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey)
            const fun = descriptor.value
            // 将事件处理信息推送到全局列表中
            // @ts-ignore
            tsCore.App.beanEventFunction.push({target, className, fun, eventName, childName, args})
        } else {
            // 如果目标不是FGUI的GObject实例，输出调试日志
            // @ts-ignore
            tsCore.Log.debug("[click] Can only be used in fgui.GObject = " + data.childName)
        }
    }
}


function initBean(target: any, name: string) {
    // @ts-ignore
    tsCore.App.beanActionsFunction
        .filter((actionData: ActionsData) => name == actionData.className)
        .forEach((actionData: ActionsData) => {
            // @ts-ignore
            tsCore.App.inst.regAction(actionData.action, target, actionData.fun, actionData.group || tsCore.App.GAME_GROUP, actionData.order)
        })
}


/**
 * 代理组件事件
 *
 * 此函数用于遍历事件数据数组，并为每个事件数据绑定相应的事件处理函数
 * 它主要通过检查事件数据中的子组件名称来决定是为子组件还是当前组件绑定事件
 *
 * @param events 事件数据数组，包含了需要绑定的事件信息
 * @param target 当前组件
 */
function proxyComponentEvent(events: EventData[], target: any) {
    // 遍历每个事件数据项
    events.forEach((data: EventData) => {
        // 检查事件数据中是否包含子组件名称
        if (data.childName) {
            // 根据子组件名称获取子组件实例
            const child = target.getChild(data.childName)
            // 如果找到子组件，则为子组件绑定事件处理函数
            if (child) child.on(data.eventName, data.target, data.fun)
            else {
                // 如果未找到子组件，则输出调试日志
                // @ts-ignore
                tsCore.Log.debug(`[${data.eventName}] not find child name = ${data.childName}`)
            }
        } else {
            // 如果事件数据中不包含子组件名称，则直接为当前组件绑定事件处理函数
            target.on(data.eventName, data.target, data.fun, data.args)
        }
    })
}

/**
 * 包装成代理类
 * @param {{new(...args: any[]): any}} classTarget
 * @param beanName 如果传入 将会被缓存到bean集合中 否则不存
 */
function proxyClass(classTarget: { new(...args: any[]): any }, beanName?: string): any {
    const classTemp = class extends classTarget {
        constructor(...args: any[]) {
            super(...args)
            const name = classTarget.name
            initBean(this, name)
            if (this.isBean) {
                // @ts-ignore
                tsCore.App.inst.addBean(beanName || name.firstLowerCase(), this)
            }
        }
    }
    Object.defineProperty(classTemp.prototype, "isBean", {
        get(): boolean {
            return beanName != null
        }
    })
    Object.defineProperty(classTemp, "name", {
        get(): any {
            return classTarget.name
        }
    })
    return classTemp
}

/**
 * 运行应用程序，并初始化所有Bean实例。
 * @param classTarget - 应用程序主类的构造函数。
 */
function runApplication<T>(classTarget: { new(...args: any[]): T }): T {
    // @ts-ignore
    const events: EventData[] = tsCore.App.beanEventFunction
    const eventMap = events.groupBy(value => value.target)
    eventMap.forEach((value, key) => {
        if (fgui.Window.prototype.isPrototypeOf(key)) { // 特殊处理window 因为他不走 constructFromResource
            const onInit = key.onInit
            Object.defineProperty(key, "onInit", {
                value: function () {
                    onInit.call(this)
                    proxyComponentEvent(value, this)
                }
            })
        } else {
            // 劫持constructFromResource方法以确保在构造GObject时注册事件
            const constructFromResource = key.constructFromResource
            Object.defineProperty(key, "constructFromResource", {
                value: function () {
                    constructFromResource.call(this)
                    proxyComponentEvent(value, this.constructor.name)
                }
            })
        }
    })

    const app = new classTarget()
    // @ts-ignore
    if (!tsCore.App.inst.hasBean(classTarget.name)) {
        // @ts-ignore
        tsCore.App.inst.addBean(classTarget.name.firstLowerCase(), app)
    }
    // @ts-ignore
    tsCore.App.beanClassFunction.forEach((value: () => any, key: string) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(key)) {
            const target = value()
            // @ts-ignore
            tsCore.App.inst.addBean(key, target, false)
        }
    })
    // @ts-ignore
    tsCore.App.beanClassComponent.sort((a, b) => a.order || 0 - b.order || 0).forEach((value: ComponentData) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(value.key)) {
            const classTargetName = value.classTarget.name
            let target: any
            if (value.createUi) {
                target = fgui.UIPackage.createObjectFromURL(this.createUi, this.classTarget)
            } else target = new value.classTarget()
            if (/^[A-Z]/.test(value.key.charAt(0)) && value.key.toLowerCase() == classTargetName.toLowerCase()) {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key.firstLowerCase(), target)
            } else {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key, target)
            }
            initBean(target, classTargetName)
        }
    })
    initBean(app, classTarget.name)
    if (typeof app["start"] == "function") {
        app["start"]()
    }

    return app

}

/**
 * 应用程序运行接口。
 */
interface IRunApplication {
    start(): void
}