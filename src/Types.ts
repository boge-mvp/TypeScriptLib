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
        constructor() {
            for (const Class of classes) {
                const instance = new Class();
                copyProperties(this, instance);
            }
        }
    }
    for (const Class of classes) {
        copyProperties(MixinClass.prototype, Class.prototype);
    }
    return MixinClass as any;
}

function copyProperties(target: any, source: any) {
    for (const key of Reflect.ownKeys(source)) {
        if (key !== "constructor" && key !== "prototype" && key !== "name") {
            const descriptor = Object.getOwnPropertyDescriptor(source, key)
            Object.defineProperty(target, key, descriptor)
        }
    }
}