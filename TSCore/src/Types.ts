/**
 * 执行提供的 ParamHandler 函数。
 * @param func 可选，要执行的函数或Laya.Handler实例。如果提供，它将根据其类型执行。
 * @param args 可变参数，传递给函数的参数。
 * @returns 如果func存在且不为null，则根据func的类型执行并返回相应的结果；否则返回null。
 */
function runFun(func?: ParamHandler, ...args: any[]) {
    if (func) return func instanceof Laya.Handler ? func.runWith(args) : func.apply(null, args)
    return null
}

/**
 * 根据语言包id获取字符串
 * @param id 获取文案的key
 * @param args 如果包含占位符，这里可传入占位符的替换文案
 */
function getString(id: string | number, ...args: any[]) {
    // @ts-ignore
    let content = tsCore.LanguageUtils.inst.getStr(id)
    if (args.length == 0) return content
    // @ts-ignore
    return tsCore.StringUtil.format(content, ...args)
}

/**
 * 延迟指定时间执行方法
 * @param delay 延迟时间
 * @param fun 方法
 * @param args 方法参数
 */
function delayCall(delay: number, fun: Function, ...args: any[]) {
    Laya.timer.once(delay, this, fun, args)
}

/**
 * 延迟到下一帧执行方法
 * @param fun 方法
 * @param args 方法参数
 */
function callLater(fun: Function, ...args: any[]) {
    Laya.timer.callLater(this, fun, args)
}

/**
 * 配置定义
 *
 * @param args 自定义的配置
 * @param defs 默认配置
 * @param [croak=false] 验证配置在默认中存在否 如果原型中不存在将抛出错误
 * @param [append=false] 如果存在键，如果值是数组是否追加在尾部，排除存在的
 *
 *
 * @example
 *
 * const defs = {a: [0], c: {c:"c", a: 0}, s: "s"}
 * const config = {a: [18], c: {a: 66}, s: "d", e:"e"}
 *
 * defaults(config, defs)
 * result:  {a:[18], c: {c: "c", a: 66}, s: "d", e:"e"}
 *
 * defaults(config, defs, true)
 * result: throw error -> `e` is not a supported option, {a: 0, c: {c:"c", a: 0}, s: "s"}
 *
 * defaults(config, defs, false, true)
 * result: {a:[18, 0], c: {c: "c", a: 66}, s: "d", e:"e"}
 */
function defaults(args: any, defs: any, croak = false, append = false) {
    if (args === true) {
        args = {}
    } else if (args && typeof args === "object") {
        args = {...args}
    }

    const ret = args || {}
    if (croak)
        for (const i in ret) {
            if (has(ret, i) && !has(defs, i)) {
                throw new Error("`" + i + "` is not a supported option", defs)
            }
        }

    for (const key in defs) {
        if (has(defs, key)) { // 原型中存在此值
            if (!args || !has(args, key)) {
                // 当新配置不存在 或 新配置中不存在key
                ret[key] = defs[key] // 从原型中取值 赋值
            } else {// 新配置存在 或有 配置key

                ret[key] = (args && has(args, key)) ? (() => {
                    // 新配置中存在key
                    // 获取新的值
                    let value = args[key]
                    // 如果 不存在值 直接返回
                    if (!value) return value
                    // 如果值是数组 并且允许追击到尾部
                    if (Array.isArray(value) && append) {
                        for (const defValue of defs[key]) {
                            // 如果不存在此值 添加到数组末尾
                            if (!value.includes(defValue)) value.push(defValue)
                        }
                    } else if (typeof value === "object") {
                        // 如果是个对象
                        value = defaults(value, defs[key], croak, append)
                    }
                    return value
                })() : defs[key] // 新配置中不存在key  直接赋默认值
            }
        }
    }
    return ret
}

/**
 *
 * @param obj
 * @param prop
 */
function has(obj: any, prop: any) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}


/**
 * 修改 mixin 函数
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
 * 注意 后面类的屬性值会覆盖之前的
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
 *
 * @example
 * 以下用 : 代替 extends
 * BaseClass
 * ClassA:BaseClass
 * BlockA
 * BlockB
 *
 * mixinExt(ClassA:BaseClass, BlockA, BlockB) = newClass -> ClassA:BlockA:BlockB  BaseClass父类丢失
 * mixinExt(BlockA, ClassA:BaseClass, BlockB) = newClass -> BlockA:ClassA:BlockB  BaseClass父类丢失
 * mixinExt(BlockA, BlockB, ClassA:BaseClass) = newClass -> BlockA:BlockB:(ClassA:BaseClass) BaseClass父类还在
 *
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
    descriptor.value
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
    while (currentObj) {
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

/**
 * 包装一个 windowMy
 */
const windowMy = window.self !== window.top ? window.top : window


/** 随机数  最小值  最大值(不包括)  */
function random(minNum: number, maxNum: number) {
    return (Math.floor(Math.random() * (maxNum - minNum)) + minNum)
}

/**
 * 随机数
 * @param minNum 最小值
 * @param maxNum 最大值(不包括)
 * @param p 保留尾数  默认NAN 表示全保留
 * @return
 */
function randomFloat(minNum: number, maxNum: number, p = NaN) {
    let temp = (Math.random() * (maxNum - minNum) + minNum)
    if (!isNaN(p)) temp = parseFloat(temp.toFixed(p))
    return temp
}


function gaSend(hitType: HitType, data: EventType | ExceptionType | TimingType) {
    ga("send", hitType, data)
}

function gaEvent(data: EventType) {
    gaSend("event", data)
}

function gaException(data: ExceptionType) {
    gaSend("exception", data)
}

function gaTiming(data: TimingType) {
    gaSend("timing", data)
}