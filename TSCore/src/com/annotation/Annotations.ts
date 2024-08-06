/**
 * 初始化Bean对象
 * 该函数接受一个或多个类的构造函数，为每个类创建一个实例，并将其添加到应用程序的Bean管理器中
 * 如果应用程序的Bean管理器中尚不存在某个类的实例，则创建该类的实例并添加
 *
 * @param cls 一个或多个类的构造函数，这些类是准备初始化为Bean对象的
 */
function initBean(...cls: { new(): any }[]) {
    cls.forEach(value => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(value.name)) {
            const target = new value()
            // @ts-ignore
            tsCore.App.inst.addBean(value.name, target)
        }
    })
}

/**
 * 根据给定的名称或构造函数获取单例bean对象
 * 如果bean不存在，则根据名称或构造函数创建并添加bean对象
 *
 * @param name - bean的名称或构造函数
 * @param bean - 可选参数，bean的构造函数
 * @returns 返回获取到的bean对象
 */
function getBean<T>(name: string | { new(): T }, bean?: { new(): T }): T {
    if (typeof name !== "string") {
        name = name.name
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
 * 一个用于创建组件的高阶函数，它接受一个类作为参数，并返回一个继承了该类的新类。
 * 这个新类会在实例化时自动注册到应用的容器中，以便于依赖注入和管理。
 *
 * @param classTarget 被装饰的类。
 * @return 返回一个继承了传入类的新类。
 */
function Component<T extends { new(...args: any[]): {} }>(classTarget: T) {
    const classTemp = class extends classTarget {
        constructor(...args: any[]) {
            super(...args)
            const name = classTarget.name
            // @ts-ignore
            if (!tsCore.App.inst.hasBean(name)) {
                // @ts-ignore
                tsCore.App.inst.addBean(name, this)
            }
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
 * 一个装饰器函数，用于标记类的属性，该属性对应的对象会被自动实例化并注册到应用的容器中。
 * 这个函数主要解决了如何自动实例化和注册类的依赖，以便于在应用中使用时能够轻松地进行依赖注入。
 *
 * @param target 被装饰的类的实例。
 * @param propertyKey 被装饰的属性的键名。
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
 * Bean装饰器函数，用于自动注册带有该装饰器的类实例到应用容器中
 * 它通过反射机制获取类的返回类型，并将类实例注册为一个Bean
 *
 * @param target 被装饰的类的原型
 * @param propertyKey 被装饰的方法的属性名
 * @param descriptor 被装饰的方法的属性描述符
 */
function Bean(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const returnTarget = Reflect.getMetadata("design:returntype", target, propertyKey)
    if (returnTarget) {
        // @ts-ignore
        tsCore.App.beanClassFunction.set(propertyKey, descriptor.value)
    } else throw Error("class type null")
}