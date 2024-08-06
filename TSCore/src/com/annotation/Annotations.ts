/**
 * 获取一个指定名称或类型的Bean实例。
 * @param name - Bean的名称或构造函数。
 * @returns T 返回指定的Bean实例。
 */
function getBean<T>(name: string | { new(): T }): T {
    if (typeof name !== "string") {
        name = name.name.charAt(0).toLowerCase() + name.name.slice(1)
    }
    // @ts-ignore
    return tsCore.App.inst.getBean(name)
}
/**
 * 组件数据类，用于创建组件实例。
 */
class ComponentData {
    /**
     * 目标类的构造函数。
     */
    classTarget: { new(): any }
    /**
     * 创建UI的路径。
     */
    createUi?: string
    /**
     * 构造函数。
     * @param classTarget - 目标类的构造函数。
     * @param createUi - 创建UI的路径。
     */
    constructor(classTarget: { new(): any }, createUi?: string) {
        this.classTarget = classTarget
        this.createUi = createUi
    }
    /**
     * 创建组件实例。
     * @returns 返回创建的组件实例。
     */
    create() {
        if (this.createUi) {
            return fgui.UIPackage.createObjectFromURL(this.createUi, this.classTarget)
        }
        return new this.classTarget()
    }

}
/**
 * 组件装饰器，用于注册和创建组件实例。
 * @param value - 组件标识符或目标构造函数。 如果是null值 将不会被添加到依赖管理器中，默认使用类名 首字母大小写都有
 * @param uiUrl - UI资源的URL。
 * @returns any 返回装饰后的类。
 */
function Component<T extends { new(...args: any[]): {} }>(value: string | T = "", uiUrl?: string) {
    let decorator: any = function (classTarget: T) {
        if (value != null) {
            // @ts-ignore
            tsCore.App.beanClassComponent.set(typeof value === "string" && value.trim().length > 0 ? value : classTarget.name, new ComponentData(classTarget, uiUrl))
            return classTarget
        } else {
            const classTemp = class extends classTarget {
                constructor(...args: any[]) {
                    super(...args)
                    const name = classTarget.name
                    // @ts-ignore
                    let beanProperty = tsCore.App.beanClassProperty.get(name)
                    beanProperty?.forEach((value: string) => {
                        // @ts-ignore
                        const propertyClass = Reflect.getMetadata("design:type", this, value)
                        // @ts-ignore
                        this[value] = getBean(value, propertyClass)
                    })
                }
            }
            Object.defineProperty(classTemp, "name", {
                get(): any {
                    return classTarget.name
                }
            })
            return classTemp
        }
    }
    if (value && typeof value !== "string") {
        decorator = decorator(value)
    }
    return decorator
}
/**
 * 资源装饰器，标记类属性为资源依赖。
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 */
function Resource(target: any, propertyKey: string) {
    const classTarget = Reflect.getMetadata("design:type", target, propertyKey)
    if (classTarget) {
        // @ts-ignore
        let bean = tsCore.App.beanClassProperty.get(target.constructor.name) || []
        bean.push(propertyKey)
        // @ts-ignore
        tsCore.App.beanClassProperty.set(target.constructor.name, bean)
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
 * 运行应用程序，并初始化所有Bean实例。
 * @param classTarget - 应用程序主类的构造函数。
 */
function runApplication<T>(classTarget: { new(...args: any[]) : T }): T {
    const app = new classTarget()
    // @ts-ignore
    if (!tsCore.App.inst.hasBean(classTarget.name)) {
        // @ts-ignore
        tsCore.App.inst.addBean(classTarget.name.charAt(0).toLowerCase() + classTarget.name.slice(1), app)
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
    tsCore.App.beanClassComponent.forEach((value: ComponentData, key: string) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(key)) {
            const target = value.create()
            if (/^[A-Z]/.test(key.charAt(0)) && key.toLowerCase() == value.classTarget.name.toLowerCase()) {
                // @ts-ignore
                tsCore.App.inst.addBean(key.charAt(0).toLowerCase() + key.slice(1), target)
            } else {
                // @ts-ignore
                tsCore.App.inst.addBean(key, target, false)
            }
        }
    })
    // @ts-ignore
    for (const target of tsCore.App.inst._controller.cacheTarget.values()) {
        const name = target.constructor.name
        // @ts-ignore
        let beanProperty = tsCore.App.beanClassProperty.get(name)
        beanProperty?.forEach((value: string) => {
            // @ts-ignore
            // const propertyClass = Reflect.getMetadata("design:type", target, value)
            target[value] = getBean(value)
        })
    }

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