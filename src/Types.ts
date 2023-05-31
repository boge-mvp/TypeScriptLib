
window["runFun"] = (func?: ParamHandler, ...args) => {
    if (func != null) return func instanceof Laya.Handler ? func.runWith(args) : func.apply(null, args)
    return null
}

/** 根据语言包id获取字符串 */
window["getString"] = (id: string | number, ...args) => {
    // @ts-ignore
    let content = coreLib.LanguageUtils.inst.getStr(id)
    args.unshift(content)
    // @ts-ignore
    return coreLib.StringUtil.format.apply(null, args)
}

// 使用交叉类型连接多个类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// 获取构造函数的实例类型
// type InstanceTypeOfConstructor<T> = T extends new (...args: any[]) => infer R ? R : any
type InstanceTypeOfConstructor<T> = T extends Constructor<infer R> ? R : never

// 修改 mixin 函数
/**
 * @deprecated
 * @param classes
 */
function mixin<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>> {
    class MixinClass {
        constructor() {
            for (const Class of classes) {
                const instance = new Class()
                copyProperties(this, instance)
            }
        }
    }
    for (const Class of classes) {
        copyProperties(MixinClass.prototype, Class.prototype)
    }
    return MixinClass as any
}

/**
 * 将后续传入的类的方法和属性复制到第一个类的匿名类上
 *
 * 注意 後面類的屬性值会覆盖之前的
 * @param classes
 */
function mixinProperty<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>> {
    let parentClass = classes[0]
    class MixinClass extends parentClass {
        constructor(...args: any[]) {
            super(...args)
        }
    }

    for (let i = 1; i < classes.length; i++) {
        const Class = classes[i]
        copyProperties(MixinClass.prototype, Class.prototype)
    }
    return MixinClass as any
}

/**
 * 相互继承实现
 *
 * 注意 如果有继承类A后面还有类B,那么A类的继承父类会被更换成类B,类A将失去原有的继承属性和方法
 * @param classes 继承序列  第一个是父类最后一个继承值，最后一个初始类
 */
function mixinExt<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>> {
    let parentClass = classes[classes.length - 1]
    let tempClass
    let resultClass
    const start = classes.length - 2
    for (let i = start; i >= 0; i--) {
        tempClass = class extends parentClass {
            constructor(...args: any[]) {
                super(...args)
            }
        }
        copyProperties(tempClass.prototype, classes[i].prototype, ["prototype"])
        parentClass = tempClass
    }
    resultClass = parentClass
    return resultClass as any
}

/**
 *
 * @param target
 * @param source
 * @param ignoreProperty
 * @param [containsSuperClasses=false] 是否包含 super类
 */
function copyProperties(target: any, source: any, ignoreProperty = ["constructor", "prototype", "name"], containsSuperClasses = false) {
    for (const key of getPropertyNames(source, containsSuperClasses)) {
        // 只要有一个满足的
        if (!ignoreProperty || ignoreProperty.every((value) => {
            return key !== value
        })) {
            const descriptor = getPropertyDescriptor(source, key, containsSuperClasses)
            descriptor && Object.defineProperty(target, key, descriptor)
        }
    }
}

/**
 * 获取属性标识符
 * @param source 对象
 * @param key 健名
 * @param [containsSuperClasses=false] 是否允许到父类去找
 */
function getPropertyDescriptor(source: any, key: string | symbol, containsSuperClasses = false) {
    let currentObj = source
    let descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
    while (containsSuperClasses && !descriptor && currentObj) { // 如果没找到  在允许在父类找的情况下 去父类找
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj)
        if (currentObj) descriptor = Object.getOwnPropertyDescriptor(currentObj, key)
    }
    return descriptor
}

/**
 * 获取方法或属性的名字
 * @param obj 对象
 * @param [containsSuperClasses=false] 是否要包含父类
 */
function getPropertyNames(obj, containsSuperClasses = false) {
    const allPropertyNames = new Set<string | symbol>()
    let currentObj = obj
    while (currentObj !== null) {
        // 获取当前对象的所有属性键（不包括原型链上的属性）
        const propertyNames = Reflect.ownKeys(currentObj)
        // 将属性添加到集合中
        propertyNames.forEach(prop => allPropertyNames.add(prop))
        if (!containsSuperClasses) {
            break;
        }
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj)
        if (typeof currentObj === "object") {
            break
        }
    }
    return Array.from(allPropertyNames)
}