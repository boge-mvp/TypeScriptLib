
window["runFun"] = (func?: ParamHandler, ...args) => {
    if (func != null) return func instanceof Laya.Handler ? func.runWith(args) : func.apply(null, args)
    return null
}

// 使用交叉类型连接多个类型
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// 获取构造函数的实例类型
type InstanceTypeOfConstructor<T> = T extends new (...args: any[]) => infer R ? R : any

// 修改 mixin 函数
function mixin<T extends Constructor[]>(...classes: T): Constructor<UnionToIntersection<InstanceTypeOfConstructor<T[number]>>> {
    class MixinClass {
        // constructor() {
        //
        //     let superClassIndex = 0; // 根据需要更改这个索引，以指定哪一个父类的构造函数应该被调用
        //     const superClass = classes[superClassIndex];
        //
        //     // 通过调用 super() 函数在子类构造函数中调用指定父类的构造函数
        //     superClass.call()
        //     super(...arguments);
        //
        //     for (const Class of classes) {
        //         const instance = new Class()
        //         copyProperties(this, instance)
        //     }
        // }
    }
    // 将每个类的原型链添加到 MixinClass 的原型链上
    classes.forEach((BaseClass) => {
        MixinClass.prototype = Object.create(BaseClass.prototype, Object.getOwnPropertyDescriptors(MixinClass.prototype))
    })
    // for (const Class of classes) {
    //     copyProperties(MixinClass.prototype, Class.prototype)
    // }
    return MixinClass as any
}

function copyProperties(target: any, source: any) {
    for (const key of getAllPropertyNames(source)) {
        if (key !== "constructor" && key !== "prototype" && key !== "name") {
            const descriptor = getAllPropertyDescriptor(source, key)
            descriptor && Object.defineProperty(target, key, descriptor)
        }
    }
}

function getAllPropertyDescriptor(source: any, key: string | symbol) {
    let currentObj = source
    var descriptor = Object.getOwnPropertyDescriptor(currentObj, key)
    while (!descriptor && currentObj) {
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj)
        descriptor = Object.getOwnPropertyDescriptor(currentObj, key)
    }
    return descriptor
}

function getAllPropertyNames(obj) {
    const allPropertyNames = new Set<string | symbol>()
    let currentObj = obj
    while (currentObj !== null) {
        // 获取当前对象的所有属性键（不包括原型链上的属性）
        const propertyNames = Reflect.ownKeys(currentObj)
        // 将属性添加到集合中
        propertyNames.forEach(prop => allPropertyNames.add(prop))

        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj)
    }

    return Array.from(allPropertyNames)
}