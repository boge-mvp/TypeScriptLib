/**
 * 初始化多个类实例，并将它们作为 Bean 添加到应用上下文中。
 * @param cls 一个或多个类的数组，这些类将被实例化并注册为 Bean。
 */
function initBean(...cls: { new(): any }[]) {
    cls.forEach(value => {
        const name = value.name.charAt(0).toLowerCase() + value.name.slice(1)
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(name)) {
            const target = new value()
            // @ts-ignore
            tsCore.App.inst.addBean(name, target)
        }
    })
}
/**
 * 获取指定名称的 Bean 实例。
 * 如果 Bean 尚未创建，则根据提供的构造函数创建一个新的实例。
 * @param name Bean 的名称或构造函数。
 * @param bean 可选参数，用于指定构造函数。
 * @returns 返回指定名称的 Bean 实例。
 */
function getBean<T>(name: string | { new(): T }, bean?: { new(): T }): T {
    if (typeof name !== "string") {
        bean ??= name
        name = name.name.charAt(0).toLowerCase() + name.name.slice(1)
    }
    // @ts-ignore
    if (!tsCore.App.inst.hasBean(name)) {
        let newProperty: any
        // @ts-ignore
        if (tsCore.App.beanClassFunction.has(name)) {
            // @ts-ignore
            newProperty = tsCore.App.beanClassFunction.get(name)()
            console.log("function-> create class " + name)
        } else { // @ts-ignore
            if (bean && tsCore.App.beanClassComponent.has(bean.name)) {
                console.log("component-> create class " + bean.name)
                // @ts-ignore
                newProperty = new (tsCore.App.beanClassComponent.get(bean.name))()
            }
        }
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(name) && newProperty) {
            // @ts-ignore
            tsCore.App.inst.addBean(name, newProperty)
        }
    }
    // @ts-ignore
    return tsCore.App.inst.getBean(name)
}
/**
 * 一个装饰器，用于标记类作为组件。
 * 当此类被实例化时，它会自动注册其依赖项。
 * @param classTarget 要装饰的类。
 * @returns 返回经过装饰处理的新类。
 */
function Component<T extends { new(...args: any[]): {} }>(classTarget: T) {
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
    // @ts-ignore
    tsCore.App.beanClassComponent.set(classTemp.name, classTemp)
    return classTemp
}
/**
 * 一个装饰器，用于标记类成员变量为资源依赖。
 * 这些依赖将在类实例化时自动注入。
 * @param target 类的原型。
 * @param propertyKey 成员变量的键名。
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
 * 一个装饰器，用于标记方法返回值为 Bean。
 * @param target 类的原型。
 * @param propertyKey 方法的键名。
 * @param descriptor 属性描述符。
 */
function Bean(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const returnTarget = Reflect.getMetadata("design:returntype", target, propertyKey)
    if (returnTarget) {
        // @ts-ignore
        tsCore.App.beanClassFunction.set(propertyKey, descriptor.value)
    } else throw Error("class type null")
}