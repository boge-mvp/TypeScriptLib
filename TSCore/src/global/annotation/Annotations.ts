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
 * Lazy装饰器工厂函数
 * 用于延迟初始化类的属性，仅在属性值首次被访问时执行初始化
 *
 * @param {() => T} callback 一个无参数的回调函数，用于生成属性的值
 */
function Lazy<T>(callback: () => T): any {
    return function (targetPrototype: any, propertyKey: string): PropertyDescriptor {
        return {
            configurable: false,
            get() {
                const bean = callback.call(this)
                Object.defineProperty(this, propertyKey, {
                    value: bean,
                    configurable: false,
                    writable: false
                })
                if (!bean) {
                    // @ts-ignore
                    tsCore.Log.warn(`[Lazy] Callback for property "${propertyKey}" returned null.`);
                }
                return bean
            }
        }
    }
}

/**
 * 使用CallLater装饰器来延迟执行方法
 * 这个装饰器会修改方法的执行方式，使其在当前逻辑帧结束后执行
 *
 * @param targetPrototype 被装饰的类的原型
 * @param propertyKey 被装饰的方法的名称
 * @param descriptor 方法的属性描述符
 * @returns 返回修改后的属性描述符
 */
function CallLater(targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        Laya.timer.callLater(this, originalMethod, args)
    }
    return descriptor;
}

/**
 * 使用CallDelay装饰器来延迟执行方法
 * 这个装饰器会修改方法的执行方式，使其在指定的毫秒数后执行
 *
 * @param num 延迟的毫秒数
 * @returns 返回一个装饰器，用于装饰方法
 */
function CallDelay(num: number | RandomTimer) {
    return function (targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        let delay: number
        descriptor.value = function (...args: any[]) {
            if (typeof num !== "number") {
                delay = num.getNumber()
            } else delay = num
            Laya.timer.once(delay, this, originalMethod, args)
        }
        return descriptor;
    }
}

/**
 * 使用CallDelayByFrame装饰器来延迟执行方法
 * 这个装饰器会修改方法的执行方式，使其在指定的帧数后执行
 *
 * @param num 延迟的帧数
 * @returns 返回一个装饰器，用于装饰方法
 */
function CallDelayByFrame(num: number | RandomTimer) {
    return function (targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        let delay: number
        descriptor.value = function (...args: any[]) {
            if (typeof num !== "number") {
                delay = num.getNumber()
            } else delay = num
            Laya.timer.frameOnce(delay, this, originalMethod, args)
        }
        return descriptor;
    }
}


/**
 * 设置应用程序的主类
 *
 * @param value - 一个构造函数类型，用于创建实现IRunApplication接口的应用实例
 *                该构造函数可以接受任意数量和类型的参数
 */
function AppMain(value: { new(...args: any[]): IRunApplication }) {
    // @ts-ignore
    tsCore.App.appMainClass = value
}


/**
 * 组件装饰器函数，用于创建和配置组件类
 * @template T 限制为构造函数类型
 * @param {string | T | ComponentData} value - 组件标识符或目标构造函数。默认使用类名 首字母大小写都有.值如果是`null`或`{isJoinBean:false}`,将不会自动初始化和添加到依赖管理器中.
 * @returns any 返回装饰后的类。
 */
function Component<T extends { new(...args: any[]): {} }>(value: string | T | ComponentData = "") {
    let decorator: any = function (classTarget: T) {
        if (value == null) {
            return proxyClass(classTarget)
        }
        let data: ComponentData = {}
        if (typeof value === "object") {
            data = value
            value = classTarget
        }
        data.isJoinBean ??= true
        if (!data.isJoinBean) {
            return proxyClass(classTarget)
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
    }
    if (value && typeof value == "function") {
        decorator = decorator(value)
    }
    return decorator
}

/**
 * 资源注入装饰器，用于自动解析并绑定 Bean 实例到类属性上。
 *
 * ### 支持以下写法：
 * - `@Resource`                         // 直接装饰属性，使用属性名作为 Bean 名称
 * - `@Resource()`                       // 与无括号写法等效
 * - `@Resource("customName")`           // 使用指定名称查找 Bean
 *
 * ### 使用说明：
 * - 该装饰器只能用在被 `@Component` 注解管理的类中。
 * - 在类初始化时，会自动从全局 Bean 池中查找对应名称或类型的 Bean，并将其赋值给目标属性。
 * - 如果找到对应的 Bean，则会在当前实例上定义一个同名属性，并将 Bean 实例赋值给它。
 *
 * ### 注意事项：
 * - 目标属性必须有类型注解（TypeScript 编译时元数据需要）
 * - 如果找不到对应的 Bean，返回值为 undefined，不会抛出异常。
 *
 * ### 示例代码：
 * ```
 * // 假设已经有一个组件类 MyService 并且已经被注册为 Bean
 *  @Component
 *  class MyService {
 *      sayHello() {
 *          console.log("Hello from MyService");
 *      }
 *  }
 *
 * // 使用 Resource 注入 MyService
 *  @Component
 *  class MyComponent {
 *      @Resource // 使用默认属性名 "myService" 查找 Bean
 *      private myService: MyService;
 *      init() {
 *          this.myService.sayHello(); // 输出：Hello from MyService
 *      }
 *  }
 *
 * // 或者自定义 Bean 名称
 *  @Component
 *  class MyCustomNamedComponent {
 *      @Resource("customName") // 使用指定名称 "customName" 查找 Bean
 *      private service: MyService;
 *  }
 * ```
 * @param args
 */
function Resource(...args: any[]): any {
    // 作为装饰器工厂调用 @Resource("name")
    if (args.length === 1 && typeof args[0] === 'string') {
        const name = args[0];
        return function (target: any, propertyKey: string) {
            return _Resource(name, target, propertyKey)
        };
    }
    // 作为直接装饰器调用 @Resource
    if (args.length >= 2 && typeof args[0] === 'object' && typeof args[1] === 'string') {
        const [targetPrototype, propertyKey] = args;
        return _Resource(null, targetPrototype, propertyKey)
    }
}

/**
 * @internal
 */
function _Resource(name: string, targetPrototype: any, propertyKey: string): PropertyDescriptor {
    const classTarget = Reflect.getMetadata("design:type", targetPrototype, propertyKey)
    if (classTarget) {
        return {
            configurable: true,
            get() {
                // 从bean池中获取指定的值 || 长度为0的字符串也会跳过
                const bean = getBean<any>(name || propertyKey)
                // 在类实例上定义属性，值为获取到底bean，以便后续调用
                Object.defineProperty(this, propertyKey, {
                    value: bean,
                    configurable: true,
                    writable: true
                })
                if (!bean) {
                    // @ts-ignore
                    tsCore.Log.warn(`[Resource] Failed to resolve bean for property "${propertyKey}".`);
                }
                return bean
            }
        }
    } else throw Error("class type null")
}

/**
 * @BindThis 装饰器，用于自动绑定类方法中的this上下文
 *
 * 当一个方法被`@BindThis`装饰器装饰时，该方法会被自动绑定到类的实例上
 * 这意味着在该方法内部，this将始终指向类的实例，而不会因为函数的调用方式不同而改变
 * @throws {TypeError} 如果装饰的不是方法，抛出类型错误
 */
function BindThis<T extends Function>(targetPrototype: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    // 检查descriptor是否存在且为函数，因为只有函数可以被此装饰器装饰
    if (!descriptor || (typeof descriptor.value !== 'function')) {
        throw new TypeError(`Only methods can be decorated with @BindThis. <${propertyKey}> is not a method!`);
    }
    return {
        configurable: true,
        get(this: T): T {
            // 将方法绑定到当前类实例，确保方法内的this指向正确
            const bound: T = descriptor.value.bind(this)
            // 在类实例上定义属性，值为绑定后的函数，以便后续调用
            Object.defineProperty(this, propertyKey, {
                value: bound,
                configurable: true,
                writable: true
            })
            // 返回绑定后的函数
            return bound
        }
    }
}

/**
 * Bean装饰器，标记类方法为返回Bean实例的方法。
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 * @param descriptor - 属性描述符。
 */
function Bean(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!descriptor || (typeof descriptor.value !== 'function')) {
        throw new TypeError(`Only methods can be decorated with @Bean. <${propertyKey}> is not a method!`);
    }
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
    return function (targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!descriptor || (typeof descriptor.value !== 'function')) {
            throw new TypeError(`Only methods can be decorated with @Actions. <${propertyKey}> is not a method!`);
        }
        const className = targetPrototype.constructor.name
        const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", targetPrototype, propertyKey)
        const fun = descriptor.value
        // @ts-ignore
        tsCore.App.beanActionsFunction.push({className, fun, action, group, order})
    }
}

/**
 * 点击事件装饰器
 *
 * 该装饰器用于在FGUI的GObject上注册点击事件`Laya.Event.CLICK`监听，并将事件委托给特定的方法处理
 * 它会将相关信息（如类名、方法、事件名称、子节点名称和参数）推送到全局事件函数列表中
 * 并劫持GObject的constructFromResource方法以注册组件事件代理
 *
 * @param childName 子节点名称，可选
 * @param args 附加参数，可选
 */
function ClickOn(childName?: string | any, args?: string | any[]) {
    // 作为装饰器工厂调用 @ClickOn("name") 或者  @ClickOn("name", [1,2])
    if (
        (arguments.length == 1 && typeof arguments[0] === 'string') ||
        (arguments.length == 2 && typeof arguments[0] === 'string' && Array.isArray(arguments[1]))
    ) {
        return EventOn(Laya.Event.CLICK, childName, args as any[])
    }
    // 作为直接装饰器调用 @ClickOn
    if (arguments.length > 2 && typeof arguments[0] === 'object' && typeof arguments[1] === 'string') {
        const [targetPrototype, propertyKey, descriptor] = arguments;
        _eventOn(targetPrototype, propertyKey, descriptor, Laya.Event.CLICK)
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
function EventOn(eventName: string, childName?: string, args?: any[]): any {
    return function (targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor) {
        _eventOn(targetPrototype, propertyKey, descriptor, eventName, childName, args)
    }
}

/**
 * @internal
 */
function _eventOn(targetPrototype: any, propertyKey: string, descriptor: PropertyDescriptor, eventName: string, childName?: string, args?: any[]) {
    if (!descriptor || (typeof descriptor.value !== 'function')) {
        throw new TypeError(`Only methods can be decorated with @EventOn. <${propertyKey}> is not a method!`);
    }
    // 确保目标是一个FGUI的GObject实例
    if (targetPrototype instanceof fgui.GObject) {
        const className = targetPrototype.constructor.name
        const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", targetPrototype, propertyKey)
        const fun = descriptor.value
        // 将事件处理信息推送到全局列表中
        // @ts-ignore
        tsCore.App.beanEventFunction.push({target: targetPrototype, className, fun, eventName, childName, args})
    } else {
        // 如果目标不是FGUI的GObject实例，输出调试日志
        // @ts-ignore
        tsCore.Log.debug("[click] Can only be used in fgui.GObject = " + targetPrototype)
    }
}


/**
 * @internal
 */
function initBean(target: any, name: string) {
    // @ts-ignore
    tsCore.App.beanActionsFunction
        .filter((actionData: ActionsData) => name == actionData.className)
        .forEach((actionData: ActionsData) => {
            // @ts-ignore
            tsCore.App.inst.regAction(actionData.action, target, actionData.fun, actionData.group || tsCore.App.GAME_GROUP, actionData.order)
        })


    // @ts-ignore
    tsCore.TimerKit.REG_TASK.groupBy(value => value.handler)
        .values()
        .forEach(value => {
                const task = value.filter(value =>
                    value.targetClassProperty.constructor.name == name && value.target == null
                )
                if (task.length > 0) {
                    task.forEach(t => {
                        const ta = t.copy()
                        ta.target = target
                        // @ts-ignore
                        tsCore.TimerKit.addTask(ta)
                    })
                }
            }
        )

}


/**
 * 代理组件事件
 *
 * 此函数用于遍历事件数据数组，并为每个事件数据绑定相应的事件处理函数
 * 它主要通过检查事件数据中的子组件名称来决定是为子组件还是当前组件绑定事件
 *
 * @param events 事件数据数组，包含了需要绑定的事件信息
 * @param target 当前组件
 * @internal
 */
function proxyComponentEvent(events: EventData[], target: any) {
    // 遍历每个事件数据项
    events.forEach((data: EventData) => {
        // 检查事件数据中是否包含子组件名称
        if (data.childName) {
            // 根据子组件名称获取子组件实例
            const child = target.getChild(data.childName)
            // 如果找到子组件，则为子组件绑定事件处理函数
            if (child) child.on(data.eventName, target, data.fun)
            else {
                // 如果未找到子组件，则输出调试日志
                // @ts-ignore
                tsCore.Log.debug(`[${data.eventName}] not find child name = ${data.childName}`)
            }
        } else {
            // 如果事件数据中不包含子组件名称，则直接为当前组件绑定事件处理函数
            target.on(data.eventName, target, data.fun, data.args)
        }
    })
}

/**
 * 包装成代理类
 * @param {{new(...args: any[]): any}} classTarget
 * @param beanName 如果传入 将会被缓存到bean集合中 否则不存
 * @internal
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
function runApplication<T>(classTarget?: { new(...args: any[]): T }): T {
    // @ts-ignore
    const appRunListeners = tsCore.App.appRunListeners

    // 通知开始初始化
    appRunListeners.forEach(listener => listener.onStartInitialize?.());

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
                    proxyComponentEvent(value, this)
                }
            })
        }
    })

    appRunListeners.forEach(listener => listener.onProxyComponentComplete?.());

    // @ts-ignore
    const mainClass: any = classTarget ?? tsCore.App.appMainClass;
    if (!mainClass) {
        // 应用程序的主类未定义，请使用 @AppMain 装饰器指定主类
        throw new Error("Application main class is not defined. Please use @AppMain to specify the main class.");
    }


    const app = new mainClass()
    const mainName: string = Reflect.getMetadata("class:name", mainClass) || mainClass.name
    // @ts-ignore
    if (!tsCore.App.inst.hasBean(mainName)) {
        // @ts-ignore
        tsCore.App.inst.addBean(mainName.firstLowerCase(), app)
    }

    appRunListeners.forEach(listener => listener.onCreateMain?.(app));

    appRunListeners.forEach(listener => listener.onBeanFuncInitializing?.());

    // @ts-ignore
    tsCore.App.beanClassFunction.forEach((value: () => any, key: string) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(key)) {
            const target = value()
            // @ts-ignore
            tsCore.App.inst.addBean(key, target, false)
        }
    })

    appRunListeners.forEach(listener => listener.onComponentInitializing?.());

    // @ts-ignore
    tsCore.App.beanClassComponent.sort((a, b) => a.order || 0 - b.order || 0).forEach((value: ComponentData) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(value.key)) {
            const classTargetName = value.classTarget.name
            let target: any
            if (value.createUi) {
                target = fgui.UIPackage.createObjectFromURL(value.createUi, value.classTarget)
            } else target = new value.classTarget()
            if (/^[A-Z]/.test(value.key.charAt(0)) && value.key.toLowerCase() == classTargetName.toLowerCase()) {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key.firstLowerCase(), target)
            } else {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key, target)
            }
            initBean(target, classTargetName)

            appRunListeners.forEach(listener => listener.onComponentProgress?.(target));

        }
    })

    // 通知主应用即将初始化
    appRunListeners.forEach(listener => listener.onMainAppInitializing?.());

    initBean(app, mainName)
    if (typeof app["start"] == "function") {
        app["start"]()
    }

    // 通知完成
    appRunListeners.forEach(listener => listener.onComplete?.());

    return app

}
