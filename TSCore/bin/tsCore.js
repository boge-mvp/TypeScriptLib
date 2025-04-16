window.tsCore = {};
/**
 * 执行提供的 ParamHandler 函数。
 * @param func 可选，要执行的函数或Laya.Handler实例。如果提供，它将根据其类型执行。
 * @param args 可变参数，传递给函数的参数。
 * @returns 如果func存在且不为null，则根据func的类型执行并返回相应的结果；否则返回null。
 */
function runFun(func, ...args) {
    if (func)
        return func instanceof Laya.Handler ? func.runWith(args) : func.apply(null, args);
    return null;
}
/**
 * 根据语言包id获取字符串
 * @param id 获取文案的key
 * @param args 如果包含占位符，这里可传入占位符的替换文案
 */
function getString(id, ...args) {
    // @ts-ignore
    let content = tsCore.LanguageUtils.inst.getStr(id);
    if (args.length == 0)
        return content;
    // @ts-ignore
    return tsCore.StringUtil.format(content, ...args);
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
function defaults(args, defs, croak = false, append = false) {
    if (args === true) {
        args = {};
    }
    else if (args && typeof args === "object") {
        args = Object.assign({}, args);
    }
    const ret = args || {};
    if (croak)
        for (const i in ret) {
            if (has(ret, i) && !has(defs, i)) {
                throw new Error("`" + i + "` is not a supported option", defs);
            }
        }
    for (const key in defs) {
        if (has(defs, key)) { // 原型中存在此值
            if (!args || !has(args, key)) {
                // 当新配置不存在 或 新配置中不存在key
                ret[key] = defs[key]; // 从原型中取值 赋值
            }
            else { // 新配置存在 或有 配置key
                ret[key] = (args && has(args, key)) ? (() => {
                    // 新配置中存在key
                    // 获取新的值
                    let value = args[key];
                    // 如果 不存在值 直接返回
                    if (!value)
                        return value;
                    // 如果值是数组 并且允许追击到尾部
                    if (Array.isArray(value) && append) {
                        for (const defValue of defs[key]) {
                            // 如果不存在此值 添加到数组末尾
                            if (!value.includes(defValue))
                                value.push(defValue);
                        }
                    }
                    else if (typeof value === "object") {
                        // 如果是个对象
                        value = defaults(value, defs[key], croak, append);
                    }
                    return value;
                })() : defs[key]; // 新配置中不存在key  直接赋默认值
            }
        }
    }
    return ret;
}
/**
 *
 * @param obj
 * @param prop
 */
function has(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
/**
 * 修改 mixin 函数
 * @deprecated
 * @param classes
 */
function mixin(...classes) {
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
    return MixinClass;
}
/**
 * 将后续传入的类的方法和属性复制到第一个类的匿名类上
 *
 * 注意 后面类的屬性值会覆盖之前的
 * @param classes
 */
function mixinProperty(...classes) {
    let parentClass = classes[0];
    class MixinClass extends parentClass {
        constructor(...args) {
            super(...args);
        }
    }
    for (let i = 1; i < classes.length; i++) {
        const Class = classes[i];
        copyProperties(MixinClass.prototype, Class.prototype);
    }
    return MixinClass;
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
function mixinExt(...classes) {
    let parentClass = classes[classes.length - 1];
    let tempClass;
    let resultClass;
    const start = classes.length - 2;
    for (let i = start; i >= 0; i--) {
        tempClass = class extends parentClass {
            constructor(...args) {
                super(...args);
            }
        };
        copyProperties(tempClass.prototype, classes[i].prototype, ["prototype"]);
        parentClass = tempClass;
    }
    resultClass = parentClass;
    return resultClass;
}
/**
 *
 * @param target
 * @param source
 * @param ignoreProperty
 * @param [containsSuperClasses=false] 是否包含 super类
 */
function copyProperties(target, source, ignoreProperty = ["constructor", "prototype", "name"], containsSuperClasses = false) {
    for (const key of getPropertyNames(source, containsSuperClasses)) {
        // 只要有一个满足的
        if (!ignoreProperty || ignoreProperty.every((value) => {
            return key !== value;
        })) {
            const descriptor = getPropertyDescriptor(source, key, containsSuperClasses);
            descriptor && Object.defineProperty(target, key, descriptor);
        }
    }
}
/**
 * 获取属性标识符
 * @param source 对象
 * @param key 健名
 * @param [containsSuperClasses=false] 是否允许到父类去找
 */
function getPropertyDescriptor(source, key, containsSuperClasses = false) {
    let currentObj = source;
    let descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
    descriptor.value;
    while (containsSuperClasses && !descriptor && currentObj) { // 如果没找到  在允许在父类找的情况下 去父类找
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj);
        if (currentObj)
            descriptor = Object.getOwnPropertyDescriptor(currentObj, key);
    }
    return descriptor;
}
/**
 * 获取方法或属性的名字
 * @param obj 对象
 * @param [containsSuperClasses=false] 是否要包含父类
 */
function getPropertyNames(obj, containsSuperClasses = false) {
    const allPropertyNames = new Set();
    let currentObj = obj;
    while (currentObj) {
        // 获取当前对象的所有属性键（不包括原型链上的属性）
        const propertyNames = Reflect.ownKeys(currentObj);
        // 将属性添加到集合中
        propertyNames.forEach(prop => allPropertyNames.add(prop));
        if (!containsSuperClasses) {
            break;
        }
        // 沿着原型链向上查找
        currentObj = Object.getPrototypeOf(currentObj);
        if (typeof currentObj === "object") {
            break;
        }
    }
    return Array.from(allPropertyNames);
}
/**
 * 包装一个 windowMy
 */
const windowMy = window.self !== window.top ? window.top : window;
/** 随机数  最小值  最大值(不包括)  */
function random(minNum, maxNum) {
    return (Math.floor(Math.random() * (maxNum - minNum)) + minNum);
}
/**
 * 随机数
 * @param minNum 最小值
 * @param maxNum 最大值(不包括)
 * @param p 保留尾数  默认NAN 表示全保留
 * @return
 */
function randomFloat(minNum, maxNum, p = NaN) {
    let temp = (Math.random() * (maxNum - minNum) + minNum);
    if (!isNaN(p))
        temp = parseFloat(temp.toFixed(p));
    return temp;
}
function gaSend(hitType, data) {
    ga("send", hitType, data);
}
function gaEvent(data) {
    gaSend("event", data);
}
function gaException(data) {
    gaSend("exception", data);
}
function gaTiming(data) {
    gaSend("timing", data);
}
Object.defineProperty(Array.prototype, "distinct", {
    value: function () {
        return [...new Set(this)];
    }
});
Object.defineProperty(Array.prototype, "any", { value: Array.prototype.some });
Object.defineProperty(Array.prototype, "all", { value: Array.prototype.every });
Object.defineProperty(Array.prototype, "distinctBy", {
    value: function (selector) {
        const map = {};
        const list = [];
        for (let e of this) {
            const key = selector.call(this, e);
            if (!map[key]) {
                map[key] = true;
                list.push(e);
            }
        }
        return list;
    }
});
Object.defineProperty(Array.prototype, "groupBy", {
    value: function (keySelector, valueTransform) {
        return this.groupByTo(new Map(), keySelector, valueTransform);
    }
});
Object.defineProperty(Array.prototype, "groupByTo", {
    value: function (destination, keySelector, valueTransform) {
        let len = this.length;
        for (let i = len - 1; i >= 0; i--) {
            const key = keySelector(this[i]);
            let list = destination.get(key);
            if (list == null) {
                list = [];
                destination.set(key, list);
            }
            list.push(valueTransform ? valueTransform(this[i]) : this[i]);
        }
        return destination;
    }
});
Object.defineProperty(Array.prototype, "shuffle", {
    value: function () {
        let len = this.length;
        for (let i = len - 1; i > 0; i--) {
            let rnd = Math.floor(Math.random() * (i + 1));
            [this[i], this[rnd]] = [this[rnd], this[i]];
        }
        return this;
    }
});
Object.defineProperty(Array.prototype, "minBy", {
    value: function (selector) {
        if (this.length == 0)
            return null;
        let minElem = this[0];
        if (this.length == 1)
            return minElem;
        let minValue = selector(minElem);
        for (let i = 1; i < this.length; i++) {
            const e = this[i];
            const v = selector(e);
            if (minValue > v) {
                minElem = e;
                minValue = v;
            }
        }
        return minElem;
    }
});
Object.defineProperty(Array.prototype, "maxBy", {
    value: function (selector) {
        if (this.length == 0)
            return null;
        let minElem = this[0];
        if (this.length == 1)
            return minElem;
        let minValue = selector(minElem);
        for (let i = 1; i < this.length; i++) {
            const e = this[i];
            const v = selector(e);
            if (minValue < v) {
                minElem = e;
                minValue = v;
            }
        }
        return minElem;
    }
});
Object.defineProperty(Array.prototype, "count", {
    value: function (predicate) {
        if (this.length == 0)
            return 0;
        let count = 0;
        for (let element of this)
            if (predicate(element))
                ++count;
        return count;
    }
});
Object.defineProperty(Array.prototype, "sum", {
    value: function () {
        let sum = 0;
        for (let element of this) {
            sum += element;
        }
        return sum;
    }
});
Object.defineProperty(Array.prototype, "sumOf", {
    value: function (selector) {
        let sum = 0;
        for (let element of this) {
            sum += selector(element);
        }
        return sum;
    }
});
Object.defineProperty(Array.prototype, "random", {
    value: function () {
        return this[random(0, this.length)];
    }
});
/**
 * 过滤数组中特定类型的元素。
 *
 * @param {Function} type - 一个构造函数，用于判断数组元素是否是这个类型的实例。
 * @returns {Array} 返回一个新的数组，其中包含了原数组中所有是传入类型实例的元素。
 */
Object.defineProperty(Array.prototype, "filterIsInstance", {
    value: function (type) {
        /**
         * 使用Array的filter方法来过滤数组。
         * filter方法会创建一个新数组，其中包含了所有通过测试的元素。
         * 这里使用的测试是检查数组元素是否是传入的构造函数的实例。
         */
        return this.filter((value) => value instanceof type);
    }
});
/**
 * 通过提供一个回调函数来定义移除元素的条件。
 * 如果数组中存在满足条件的元素，则移除该元素并返回true，否则返回false。
 *
 * @param filter 一个回调函数，用于测试每个元素是否应该被移除。
 *               回调函数接受数组的当前元素作为参数，并返回一个布尔值，
 *               表示该元素是否应该被移除。
 * @returns 如果成功移除了任何元素，则返回true；否则返回false。
 */
Object.defineProperty(Array.prototype, "removeIf", {
    value: function (filter) {
        let removed = false; // 初始化一个标志变量，用于记录是否成功移除了元素。
        // 遍历数组中的每个元素。
        for (let i = 0; i < this.length; i++) {
            // 使用提供的过滤函数检查当前元素是否应该被移除。
            if (filter(this[i])) {
                // 如果当前元素满足移除条件，则将其从数组中移除。
                this.splice(i, 1);
                // 由于元素被移除，数组长度减小，需要调整索引i以避免跳过下一个元素。
                i--;
                // 标记已移除元素。
                removed = true;
            }
        }
        // 返回是否成功移除了元素。
        return removed;
    }
});
Object.defineProperty(Array.prototype, "removeAll", {
    value: function (predicate) {
        return filterInPlace(this, predicate, true);
    }
});
Object.defineProperty(Array.prototype, "retainAll", {
    value: function (predicate) {
        return filterInPlace(this, predicate, false);
    }
});
Object.defineProperty(Array.prototype, "flatMap", {
    value: function (transform, iterable) {
        iterable !== null && iterable !== void 0 ? iterable : (iterable = []);
        this.forEach((value, index) => {
            iterable.push(...transform(value, index));
        });
        return iterable;
    }
});
/**
 * 在原数组上进行过滤操作，根据predicate函数的结果保留或移除元素。
 * 该函数尝试在原数组上进行过滤，避免创建新的数组实例，以提高性能和减少内存使用。
 *
 * @param array 原数组，将直接在该数组上进行过滤操作。
 * @param predicate 过滤条件函数，接受数组元素作为参数，返回一个布尔值。
 * @param predicateResultToRemove 指定过滤条件的结果，与该结果一致的元素将被移除。
 * @returns 如果数组发生了改变（有元素被移除），则返回true；否则返回false。
 */
function filterInPlace(array, predicate, predicateResultToRemove) {
    // 初始化写入索引，用于跟踪过滤后的新数组长度。
    let writeIndex = 0;
    // 遍历原数组，对每个元素应用过滤条件。
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        // 如果元素满足移除条件，则跳过该元素。
        if (predicate(element) == predicateResultToRemove)
            continue;
        // 如果当前元素的位置不等于写入索引，说明有元素被移除，需要更新数组。
        if (writeIndex != i)
            array[writeIndex] = element;
        // 更新写入索引，准备写入下一个元素。
        writeIndex++;
    }
    // 如果写入索引小于原数组长度，说明有元素被移除，需要进一步修剪数组。
    if (writeIndex < array.length) {
        // 使用splice方法移除剩余的元素，修剪数组。
        array.splice(writeIndex);
        // 返回true，表示数组发生了改变。
        return true;
    }
    else {
        // 如果数组没有发生改变，返回false。
        return false;
    }
}
String.prototype.firstLowerCase = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};
String.prototype.startsWithAny = function (...search) {
    return search.some((value) => this.startsWith(value));
};
String.prototype.startsWithAnyIgnore = function (...search) {
    const lowerCase = this.toLowerCase();
    return search.some((value) => lowerCase.startsWith(value.toLowerCase()));
};
String.prototype.endsWithAny = function (...search) {
    return search.some((value) => this.endsWith(value));
};
String.prototype.endsWithAnyIgnore = function (...search) {
    const lowerCase = this.toLowerCase();
    return search.some((value) => lowerCase.endsWith(value.toLowerCase()));
};
String.prototype.equalsAny = function (...value) {
    const that = this.valueOf();
    return value.some((it) => that === it);
};
String.prototype.equalsAnyIgnore = function (...value) {
    const lowerCase = this.toLowerCase();
    return value.some((it) => lowerCase == it.toLowerCase());
};
String.prototype.contains = function (...search) {
    return search.some((value) => this.includes(value));
};
String.prototype.containsIgnore = function (...search) {
    const lowerCase = this.toLowerCase();
    return search.some((value) => lowerCase.includes(value.toLowerCase()));
};
String.prototype.substringAfter = function (separator) {
    if (!this || !separator)
        return this.toString();
    const pos = this.indexOf(separator);
    if (pos == -1)
        return this.toString();
    return this.substring(pos + separator.length);
};
String.prototype.substringAfterLast = function (separator) {
    if (!this || !separator)
        return this.toString();
    const pos = this.lastIndexOf(separator);
    if (pos == -1 || pos == this.length - separator.length)
        return this.toString();
    return this.substring(pos + separator.length);
};
String.prototype.substringBefore = function (separator) {
    if (!this || !separator)
        return this.toString();
    const pos = this.indexOf(separator);
    if (pos == -1)
        return this.toString();
    return this.substring(0, pos);
};
String.prototype.substringBeforeLast = function (separator) {
    if (!this || !separator)
        return this.toString();
    const pos = this.lastIndexOf(separator);
    if (pos == -1)
        return this.toString();
    return this.substring(0, pos);
};
String.prototype.substringBetween = function (open, close) {
    if (!this || !open || !close)
        return this.toString();
    const start = this.indexOf(open);
    if (start != -1) {
        const end = this.indexOf(close, start + open.length);
        if (end != -1)
            return this.substring(start + open.length, end);
    }
    return this.toString();
};
String.prototype.substringsBetween = function (open, close) {
    const list = [];
    if (!this || !open || !close)
        return list;
    const strLen = this.length;
    if (strLen == 0) {
        return list;
    }
    const closeLen = close.length;
    const openLen = open.length;
    let pos = 0;
    while (pos < strLen - closeLen) {
        let start = this.indexOf(open, pos);
        if (start < 0) {
            break;
        }
        start += openLen;
        const end = this.indexOf(close, start);
        if (end < 0) {
            break;
        }
        list.push(this.substring(start, end));
        pos = end + closeLen;
    }
    return list;
};
String.prototype.toBoolean = function () {
    return this !== null && this.trim().length > 0 && !this.equalsAnyIgnore("false", "0");
};
String.prototype.toInt = function () {
    let value = 0;
    try {
        value = parseInt(this);
    }
    catch (e) {
    }
    return value;
};
/**
 * 获取一个指定名称或类型的Bean实例。
 * @param name - Bean的名称或构造函数。
 * @returns T 返回指定的Bean实例。
 */
function getBean(name) {
    if (typeof name !== "string") {
        name = name.name.firstLowerCase();
    }
    // @ts-ignore
    return tsCore.App.inst.getBean(name);
}
/**
 * 组件装饰器，用于注册和创建组件实例。
 * @param value - 组件标识符或目标构造函数。 如果是null值 将不会自动初始化和添加到依赖管理器中，默认使用类名 首字母大小写都有
 * @returns any 返回装饰后的类。
 */
function Component(value = "") {
    let decorator = function (classTarget) {
        var _a;
        if (value != null) {
            let data = {};
            if (typeof value === "object") {
                data = value;
                value = classTarget;
            }
            (_a = data.autoInit) !== null && _a !== void 0 ? _a : (data.autoInit = true);
            const className = Reflect.getMetadata("class:name", classTarget) || classTarget.name;
            data.key = typeof value === "string" && value.trim().length > 0 ? value : className.firstLowerCase();
            data.classTarget = classTarget;
            if (!data.autoInit) {
                return proxyClass(classTarget, typeof value === "string" ? value : data.key);
            }
            // @ts-ignore
            tsCore.App.beanClassComponent.push(data);
            return classTarget;
        }
        else {
            return proxyClass(classTarget);
        }
    };
    if (value && typeof value == "function") {
        decorator = decorator(value);
    }
    return decorator;
}
/**
 * 资源装饰器，标记类属性为资源依赖。 只有被@Component加入依赖管理的类才会被绑定属性
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 */
function Resource(target, propertyKey) {
    const classTarget = Reflect.getMetadata("design:type", target, propertyKey);
    if (classTarget) {
        // @ts-ignore
        let bean = tsCore.App.beanClassProperty.get(target.constructor.name) || [];
        bean.push(propertyKey);
        // @ts-ignore
        tsCore.App.beanClassProperty.set(target.constructor.name, bean);
    }
    else
        throw Error("class type null");
}
/**
 * Bean装饰器，标记类方法为返回Bean实例的方法。
 * @param target - 类的原型。
 * @param propertyKey - 属性键名。
 * @param descriptor - 属性描述符。
 */
function Bean(target, propertyKey, descriptor) {
    const returnTarget = Reflect.getMetadata("design:returntype", target, propertyKey);
    if (returnTarget) {
        // @ts-ignore
        tsCore.App.beanClassFunction.set(propertyKey, descriptor.value);
    }
    else
        throw Error("class type null");
}
/**
 * 注册事件
 * @param {number | string} action 事件名字
 * @param {string} group 分组集合
 * @param {number} order 值越大 越后执行 默认 100
 */
function Actions(action, group, order) {
    return function (target, propertyKey, descriptor) {
        const className = target.constructor.name;
        const paramtypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        const fun = descriptor.value;
        // @ts-ignore
        tsCore.App.beanActionsFunction.push({ className, fun, action, group, order });
    };
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
function ClickOn(childName, args) {
    return function (target, propertyKey, descriptor) {
        // 确保目标是一个FGUI的GObject实例
        if (target instanceof fgui.GObject) {
            const className = target.constructor.name;
            const paramtypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
            const fun = descriptor.value;
            const eventName = Laya.Event.CLICK;
            // 将事件处理信息推送到全局列表中
            // @ts-ignore
            tsCore.App.beanEventFunction.push({ className, fun, eventName, childName, args });
            // 劫持constructFromResource方法以确保在构造GObject时注册事件
            const constructFromResource = target.constructFromResource;
            Object.defineProperty(target, "constructFromResource", {
                value: function () {
                    constructFromResource.call(this);
                    proxyComponentEvent(this, this.constructor.name);
                }
            });
        }
        else {
            // 如果目标不是FGUI的GObject实例，输出调试日志
            // @ts-ignore
            tsCore.Log.debug("[click] Can only be used in fgui.GObject = " + data.childName);
        }
    };
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
function EventOn(eventName, childName, args) {
    return function (target, propertyKey, descriptor) {
        // 确保目标是一个FGUI的GObject实例
        if (target instanceof fgui.GObject) {
            const className = target.constructor.name;
            const paramtypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
            const fun = descriptor.value;
            // 将事件处理信息推送到全局列表中
            // @ts-ignore
            tsCore.App.beanEventFunction.push({ className, fun, eventName, childName, args });
            // 劫持constructFromResource方法以确保在构造GObject时注册事件
            const constructFromResource = target.constructFromResource;
            Object.defineProperty(target, "constructFromResource", {
                value: function () {
                    constructFromResource.call(this);
                    proxyComponentEvent(this, this.constructor.name);
                }
            });
        }
        else {
            // 如果目标不是FGUI的GObject实例，输出调试日志
            // @ts-ignore
            tsCore.Log.debug("[click] Can only be used in fgui.GObject = " + data.childName);
        }
    };
}
function initBean(target, name) {
    // @ts-ignore
    let beanProperty = tsCore.App.beanClassProperty.get(name);
    beanProperty === null || beanProperty === void 0 ? void 0 : beanProperty.forEach((value) => {
        // @ts-ignore
        // const propertyClass = Reflect.getMetadata("design:type", target, value)
        target[value] = getBean(value);
    });
    // @ts-ignore
    tsCore.App.beanActionsFunction
        .filter((actionData) => name == actionData.className)
        .forEach((actionData) => {
        // @ts-ignore
        tsCore.App.inst.regAction(actionData.action, target, actionData.fun, actionData.group || tsCore.App.GAME_GROUP, actionData.order);
    });
}
/**
 * 代理组件事件函数
 *
 * 该函数的作用是将事件绑定从目标对象代理到其子对象或自身
 * 它通过事件数据过滤出需要绑定的事件，并根据事件数据中的信息
 * 决定将事件绑定到目标对象的子对象还是目标对象自身
 *
 * @param target 事件的目标对象
 * @param name 组件的名称，用于过滤事件数据
 */
function proxyComponentEvent(target, name) {
    // @ts-ignore
    tsCore.App.beanEventFunction
        .filter((data) => name == data.className)
        .forEach((data) => {
        if (data.childName) {
            const child = target.getChild(data.childName);
            if (child)
                child.on(data.eventName, target, data.fun);
            else { // @ts-ignore
                tsCore.Log.debug(`[${data.eventName}] not find child name = ${data.childName}`);
            }
        }
        else
            target.on(data.eventName, target, data.fun, data.args);
    });
}
/**
 * 包装成代理类
 * @param {{new(...args: any[]): any}} classTarget
 * @param beanName 如果传入 将会被缓存到bean集合中 否则不存
 */
function proxyClass(classTarget, beanName) {
    const classTemp = class extends classTarget {
        constructor(...args) {
            super(...args);
            const name = classTarget.name;
            initBean(this, name);
            if (this.isBean) {
                // @ts-ignore
                tsCore.App.inst.addBean(beanName || name.firstLowerCase(), this);
            }
        }
    };
    Object.defineProperty(classTemp.prototype, "isBean", {
        get() {
            return beanName != null;
        }
    });
    Object.defineProperty(classTemp, "name", {
        get() {
            return classTarget.name;
        }
    });
    return classTemp;
}
/**
 * 运行应用程序，并初始化所有Bean实例。
 * @param classTarget - 应用程序主类的构造函数。
 */
function runApplication(classTarget) {
    const app = new classTarget();
    // @ts-ignore
    if (!tsCore.App.inst.hasBean(classTarget.name)) {
        // @ts-ignore
        tsCore.App.inst.addBean(classTarget.name.firstLowerCase(), app);
    }
    // @ts-ignore
    tsCore.App.beanClassFunction.forEach((value, key) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(key)) {
            const target = value();
            // @ts-ignore
            tsCore.App.inst.addBean(key, target, false);
        }
    });
    // @ts-ignore
    tsCore.App.beanClassComponent.sort((a, b) => a.order || 0 - b.order || 0).forEach((value) => {
        // @ts-ignore
        if (!tsCore.App.inst.hasBean(value.key)) {
            const classTargetName = value.classTarget.name;
            let target;
            if (value.createUi) {
                target = fgui.UIPackage.createObjectFromURL(this.createUi, this.classTarget);
            }
            else
                target = new value.classTarget();
            if (/^[A-Z]/.test(value.key.charAt(0)) && value.key.toLowerCase() == classTargetName.toLowerCase()) {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key.firstLowerCase(), target);
            }
            else {
                // @ts-ignore
                tsCore.App.inst.addBean(value.key, target);
            }
            initBean(target, classTargetName);
        }
    });
    initBean(app, classTarget.name);
    if (typeof app["start"] == "function") {
        app["start"]();
    }
    return app;
}

(function (tsCore) {
    class App {
        static get inst() {
            return this._instance;
        }
        /**
         *
         * @param init
         * @param options
         */
        static run(init, options) {
            var _a, _b;
            App.initEngine = init;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new App());
            // 默认配置
            const def = {
                laya: { renders: [Laya.WebGL], width: 720, height: 1280 },
                init: {
                    laya: true,
                    fgui: true,
                    coreLib: true
                },
                resize: true,
                isNotchEnable: false
            };
            App.inst.options = options = options ? defaults(options, def) : def;
            ((_b = options.init) === null || _b === void 0 ? void 0 : _b.coreLib) && App._init();
            const asyncInit = () => __awaiter(this, void 0, void 0, function* () {
                var _c, _d, _e, _f;
                yield ((_c = init === null || init === void 0 ? void 0 : init.onRun) === null || _c === void 0 ? void 0 : _c.call(init));
                ((_d = options.init) === null || _d === void 0 ? void 0 : _d.laya) && Laya.init(options.laya.width, options.laya.height, ...options.laya.renders);
                ((_e = options.init) === null || _e === void 0 ? void 0 : _e.fgui) && Laya.stage.addChild(fgui.GRoot.inst.displayObject);
                yield ((_f = init === null || init === void 0 ? void 0 : init.onEngine) === null || _f === void 0 ? void 0 : _f.call(init));
            });
            asyncInit().then(() => {
                Laya.timer.callLater(App.inst, App.inst.lastInit);
            });
        }
        /** 设置默认竖屏布局 */
        static updateDefaultScreen() {
            var _a;
            // 设置竖屏
            const conchConfig = ConfigKit.get("conchConfig");
            // landscape: 0, portrait: 1, user: 2, behind: 3, sensor: 4, nosensor: 5, sensor_landscape: 6, sensor_portrait: 7, reverse_landscape: 8, reverse_portrait: 9, full_sensor: 10,
            (_a = conchConfig === null || conchConfig === void 0 ? void 0 : conchConfig.setScreenOrientation) === null || _a === void 0 ? void 0 : _a.call(conchConfig, 1);
            //设置横竖屏
            if (Laya.Browser.onPC && !Laya.Browser.onLayaRuntime) {
                Laya.stage.alignV = Laya.Stage.ALIGN_TOP;
                Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
                Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
                Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
            }
            else {
                Laya.stage.alignV = Laya.Stage.ALIGN_TOP;
                Laya.stage.alignH = Laya.Stage.ALIGN_LEFT;
                Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
                Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
            }
        }
        /**
         * 初始化框架
         * @deprecated
         * @see run
         */
        static init() {
            App._init();
        }
        static _init() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new App());
            DefineConfig.init();
            let envType = ConfigKit.env();
            Log.debug("env", EnvType[envType]);
            Laya.URL.customFormat = Path.formatUrl;
            // 使用自定义加载器加载资源
            fgui.AssetProxy.inst.setAsset(ELoader.loader);
        }
        static initClass(...args) {
            for (let i = 0; i < args.length; i++) {
                new args[i]();
            }
        }
        lastInit() {
            var _a, _b;
            this.openResize();
            (_b = (_a = App.initEngine) === null || _a === void 0 ? void 0 : _a.onEnd) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        constructor() {
            this.initController();
        }
        /**
         * 开启屏幕大小自动调整
         */
        openResize() {
            var _a;
            if (this.options.resize && ((_a = this.options.init) === null || _a === void 0 ? void 0 : _a.fgui)) {
                Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
                this.onResize();
            }
        }
        onResize() {
            let screenWidth = Laya.stage.width;
            let screenHeight = Laya.stage.height;
            let dx = Laya.stage.designWidth;
            let dy = Laya.stage.designHeight;
            if (screenWidth > screenHeight && dx < dy || screenWidth < screenHeight && dx > dy) {
                //scale should not change when orientation change
                let tmp = dx;
                dx = dy;
                dy = tmp;
            }
            let s1 = screenWidth / dx;
            let s2 = screenHeight / dy;
            let contentScaleFactor = Math.min(s1, s2);
            fgui.GRoot.inst.setSize(Math.round(screenWidth / contentScaleFactor), Math.round(screenHeight / contentScaleFactor));
            fgui.GRoot.inst.setScale(contentScaleFactor, contentScaleFactor);
            Log.debug(`onResize ${screenWidth} ${screenHeight} ${contentScaleFactor}`);
        }
        initController() {
            this._controller = new EventController();
        }
        regActionHandler(action, handler, group = null) {
            this._controller.regActionHandler(action, handler, group);
        }
        regAction(action, caller, method, group = null, order) {
            this._controller.regAction(action, caller, method, group, order);
        }
        removeAllAction(...args) {
            this._controller.removeAllAction.apply(this._controller, args);
        }
        removeGroup(group) {
            this._controller.removeGroup(group);
        }
        removeGroupActions(group, ...args) {
            args.unshift(group);
            this._controller.removeGroupActions.apply(this._controller, args);
        }
        removeActionHandler(action, method, group = null) {
            this._controller.removeActionHandler(action, method, group);
        }
        removeFunction(groupObj, action, method) {
            this._controller.removeFunction(groupObj, action, method);
        }
        removeTargetAll(caller) {
            this._controller.removeTargetAll(caller);
        }
        removeTarget(groupObj, caller) {
            this._controller.removeTarget(groupObj, caller);
        }
        sendAction(action, ...args) {
            args.unshift(action);
            this._controller.sendAction.apply(this._controller, args);
        }
        sendGroupAction(group, action, ...args) {
            args.unshift(action);
            args.unshift(group);
            this._controller.sendGroupAction.apply(this._controller, args);
        }
        addBean(key, bean, saveClassName) {
            return this._controller.addBean(key, bean, saveClassName);
        }
        removeBean(key) {
            this._controller.removeBean(key);
        }
        getBean(key) {
            return this._controller.getBean(key);
        }
        hasBean(key) {
            return this._controller.hasBean(key);
        }
        addView(key, view) {
            return this._controller.addView(key, view);
        }
        removeView(key) {
            this._controller.removeView(key);
        }
        getView(key) {
            return this._controller.getView(key);
        }
        getProxy(name) {
            return this._controller.getProxy(name);
        }
        addProxy(key, proxy) {
            return this._controller.addProxy(key, proxy);
        }
        removeProxy(key) {
            this._controller.removeProxy(key);
        }
        /** 清除所有UI缓存 */
        clearView() {
            this._controller.clearView();
        }
        /** 清除所有分组和包含的事件 */
        clearGroup() {
            this._controller.clearGroup();
        }
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioScale() {
            let point = this.getEqualRatioRatio(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            return Math.min(point.x, point.y);
        }
        /**
         * 获取当前屏幕等比例缩放系数
         * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
         * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
         */
        getEqualRatioRatio(w, h) {
            w !== null && w !== void 0 ? w : (w = Laya.stage.width);
            h !== null && h !== void 0 ? h : (h = Laya.stage.height);
            let s1 = w / Laya.stage.designWidth;
            let s2 = h / Laya.stage.designHeight;
            if (Laya.stage.screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
                s1 = w / Laya.stage.designHeight;
                s2 = h / Laya.stage.designWidth;
            }
            return new Laya.Point(s1, s2);
        }
        getStackTrace() {
            try {
                // 故意抛出一个错误来捕获堆栈信息
                throw new Error();
            }
            catch (error) {
                // 返回错误对象的堆栈信息
                return error.stack;
            }
        }
    }
    /** 默认的分组名
     * @default group
     * */
    App.DEFAULT_GROUP = "group";
    /** 默认cacheId标记头
     * @default cache
     * */
    App.DEFAULT_CACHE_HEAD = "cache";
    /**
     *  游戏公用组
     */
    App.GAME_GROUP = "game_group";
    /**
     * 绑定的类属性
     * 类名 -> [属性名，属性名]
     */
    App.beanClassProperty = new Map();
    /**
     * 绑定的类
     * 类名 -> 类 class
     */
    App.beanClassComponent = [];
    /**
     * 绑定的方法
     * 类名 -> 生成方法
     */
    App.beanClassFunction = new Map();
    /**
     * 绑定事件处理方法
     */
    App.beanActionsFunction = [];
    /**
     * 绑定监听事件处理方法
     */
    App.beanEventFunction = [];
    /**
     * 启动历史记录监听
     */
    App.enableHistory = false;
    tsCore.App = App;
    class BezierCurves {
        constructor() {
            /** 经过时间 */
            this._t = -1;
        }
        get t() {
            return this._t;
        }
        set t(value) {
            if (value < 0)
                return;
            this._t = value;
            // @ts-ignore
            this.setXY(this.getX(), this.getY());
        }
        getX() {
            return Math.pow((1 - this._t), 3) * this.p1.x
                + 3 * this.p2.x * this._t * (1 - this._t) * (1 - this._t)
                + 3 * this.p3.x * this._t * this._t * (1 - this._t)
                + this.p4.x * Math.pow(this._t, 3);
        }
        getY() {
            return Math.pow((1 - this._t), 3) * this.p1.y
                + 3 * this.p2.y * this._t * (1 - this._t) * (1 - this._t)
                + 3 * this.p3.y * this._t * this._t * (1 - this._t)
                + this.p4.y * Math.pow(this._t, 3);
        }
        setStartPoint(x, y) {
            this.p1 = Laya.Point.create().setTo(x, y);
            this._t = -1;
        }
        setMiddlePoint(x, y) {
            this.p3 = this.p2 = Laya.Point.create().setTo(x, y);
        }
        setMiddlePoint2(x1, y1, x2, y2) {
            this.p2 = Laya.Point.create().setTo(x1, y1);
            this.p3 = Laya.Point.create().setTo(x2, y2);
        }
        setEndPoint(x, y) {
            this.p4 = Laya.Point.create().setTo(x, y);
        }
        /**
         * 释放数据
         * 这里回收了所有坐标信息 Point.recover()
         */
        recover() {
            var _a, _b, _c, _d;
            this._t = -1;
            (_a = this.p1) === null || _a === void 0 ? void 0 : _a.recover();
            (_b = this.p2) === null || _b === void 0 ? void 0 : _b.recover();
            (_c = this.p3) === null || _c === void 0 ? void 0 : _c.recover();
            (_d = this.p4) === null || _d === void 0 ? void 0 : _d.recover();
        }
    }
    tsCore.BezierCurves = BezierCurves;
    /**
     * 只有 getProxy 和 getView
     */
    class ViewProxy {
        getProxy(name) {
            return App.inst.getProxy(name);
        }
        getView(key) {
            return App.inst.getView(key);
        }
    }
    tsCore.ViewProxy = ViewProxy;
    class ViewBlock {
        getProxy(name) {
            return App.inst.getProxy(name);
        }
        addView(key, view) {
            return App.inst.addView(key, view);
        }
        getView(key) {
            return App.inst.getView(key);
        }
        removeView(key) {
            App.inst.removeView(key);
        }
    }
    tsCore.ViewBlock = ViewBlock;
    class ProxyBlock {
        addProxy(key, proxy) {
            return App.inst.addProxy(key, proxy);
        }
        getProxy(key) {
            return App.inst.getProxy(key);
        }
        removeProxy(key) {
            App.inst.removeProxy(key);
        }
        getView(key) {
            return App.inst.getView(key);
        }
    }
    tsCore.ProxyBlock = ProxyBlock;
    class StringBlock {
        /**
         * 根据语言包id获取字符串
         * @deprecated
         * @see window.getString
         */
        getString(id, ...args) {
            return getString(id, ...args);
        }
    }
    tsCore.StringBlock = StringBlock;
    class ActionEvent {
        regAction(action, caller, method, group, order) {
            App.inst.regAction(action, caller, method, group, order);
        }
        regActionHandler(action, handler, group) {
            App.inst.regActionHandler(action, handler, group);
        }
        /** 注册游戏数据 */
        regGameAction(action, caller, method, order) {
            this.regAction(action, caller, method, App.GAME_GROUP, order);
        }
        removeAllAction(...args) {
            App.inst.removeAllAction.apply(App.inst, args);
        }
        removeGroup(group) {
            App.inst.removeGroup(group);
        }
        removeGroupActions(group, ...args) {
            args.unshift(group);
            App.inst.removeGroupActions.apply(App.inst, args);
        }
        removeActionHandler(action, method, group) {
            App.inst.removeActionHandler(action, method, group);
        }
        removeFunction(groupObj, action, method) {
            App.inst.removeFunction(groupObj, action, method);
        }
        removeTargetAll(caller) {
            App.inst.removeTargetAll(caller);
        }
        removeTarget(groupObj, caller) {
            App.inst.removeTarget(groupObj, caller);
        }
        sendAction(action, ...args) {
            args.unshift(action);
            App.inst.sendAction.apply(App.inst, args);
        }
        sendGroupAction(group, action, ...args) {
            args.unshift(action);
            args.unshift(group);
            App.inst.sendGroupAction.apply(App.inst, args);
        }
    }
    tsCore.ActionEvent = ActionEvent;
    class View extends mixinExt(ActionEvent, StringBlock, ViewBlock, fgui.GComponent) {
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            let child = null;
            for (const key of name) {
                child = super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
        setKey(key) {
            this.key = key;
        }
        getKey() {
            return this.key;
        }
        /*@override*/
        dispose() {
            this.removeView(this.key);
            this.removeTargetAll(this);
            if (!this.isDisposed)
                super.dispose();
        }
    }
    tsCore.View = View;
    class Proxys extends mixinExt(StringBlock, ProxyBlock, ActionEvent) {
        setKey(value) {
            this.key = value;
        }
        getKey() {
            return this.key;
        }
        /**
         * 已做以下处理
         * ```
         * ● 删除 addProxy 添加的缓存
         * ● 删除本身注册的通知
         * ```
         */
        dispose() {
            this.removeProxy(this.key);
            this.removeTargetAll(this);
        }
    }
    tsCore.Proxys = Proxys;
    /** 全屏显示基类 */
    class EView extends View {
        constructor() {
            super(...arguments);
            /** 自动设置关联 默认false */
            this.autoSetupRelation = false;
        }
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.on(Laya.Event.ADDED, this, this.addedHandler);
            if (this.autoSetupRelation) {
                this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
                this.onInit();
                this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
                return;
            }
            this.onInit();
        }
        addedHandler() {
        }
        /** 初始化UI */
        onInit() {
        }
        /** 返回按钮处理事件 */
        backHandler() {
            if (this.parent)
                HistoryManager.backHistory();
        }
        hideRecord() {
            HistoryManager.invalidHistory(this);
        }
        showRecord() {
        }
        /*@override*/
        dispose() {
            HistoryManager.invalidHistory(this);
            // 删除 laya 中的所有延迟
            let gid = this["$_GID"];
            if (gid) { // 是否有使用过延迟 使用延迟执行的都有这个标记
                let map = Laya.CallLater.I["_map"];
                let handler = Laya.CallLater.I["_laters"];
                for (const mapKey in map) {
                    let cid = mapKey.split(".")[0];
                    if (cid == gid) {
                        delete map[mapKey];
                    }
                }
                for (let i = 0; i < handler.length; i++) {
                    let value = handler[i];
                    let cid = value["key"].split(".")[0];
                    if (cid == gid) {
                        handler.splice(i, 1);
                        i--;
                    }
                }
            }
            super.dispose();
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, clas) {
            this.insertExtUrl("//" + pkgName + "/" + resName, clas);
        }
        /** 设置扩展 */
        insertExtUrl(url, clas) {
            fgui.UIObjectFactory.setPackageItemExtension(url, clas);
        }
        /** 注册游戏数据 */
        /*@override*/
        regGameAction(action, caller, method) {
            super.regAction(action, caller, method, App.GAME_GROUP);
        }
    }
    tsCore.EView = EView;
    /**
     * 切换参数
     * @author boge
     *
     */
    class ChangeValue {
        /**
         *
         * @param addBtn 加
         * @param minusBtn 减
         * @param label 文字
         *
         */
        constructor(addBtn, minusBtn, label) {
            /** 是否启用 */
            this.isEnabled = true;
            this.addBtn = addBtn;
            this.minusBtn = minusBtn;
            this.label = label;
            this.openLong = false;
        }
        /** 开通按钮长按 */
        set openLong(value) {
            this.addBtn.offClick(this, this.onChangeAnte);
            this.minusBtn.offClick(this, this.onChangeAnte);
            if (value) {
                if (!this.addLongPressKit)
                    this.addLongPressKit = UtilKit.bindLongPressKit(this.addBtn, this.onChangeAnte.bind(this), 1);
                if (!this.minusLongPressKit)
                    this.minusLongPressKit = UtilKit.bindLongPressKit(this.minusBtn, this.onChangeAnte.bind(this), 2);
            }
            else {
                this.addLongPressKit = this.minusLongPressKit = null;
                this.addBtn.onClick(this, this.onChangeAnte, [1]);
                this.minusBtn.onClick(this, this.onChangeAnte, [2]);
            }
        }
        setOpenLong(value) {
            this.openLong = value;
        }
        /**
         * 设置到最大
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        max(isEvent = true) {
            if (!this.nums || !this.nums.length)
                return;
            let ante = this.nums[this.nums.length - 1];
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            if (isEvent)
                this.sendEventValue(ante);
        }
        /**
         * 设置到最小
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        min(isEvent = true) {
            if (!this.nums || !this.nums.length)
                return;
            let ante = this.nums[0];
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            if (isEvent)
                this.sendEventValue(ante);
        }
        set enabled(value) {
            this.isEnabled = value;
            this.addBtn.enabled = this.minusBtn.enabled = this.isEnabled;
            this.checkAutoEnabled();
        }
        setEnabled(value) {
            this.enabled = value;
        }
        /**
         * 设置切换值
         * @param value 值
         * @param [defaultValue = 1] 默认取值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setValues(value, defaultValue = 1, isEvent = true) {
            if (value)
                this._nums = value;
            this.label.text = this.nums[defaultValue] + "";
            this.lastValue = parseFloat(this.label.text);
            if (isEvent)
                this.sendEventValue(this.nums[defaultValue]);
            // 初始化的时候就判断是否可以点击
            this.checkAutoEnabled();
        }
        /**
         * 设置切换值 setValues的简版
         * @param value 值
         * @see setValues
         */
        set values(value) {
            this.setValues(value);
        }
        /**
         * @deprecated
         * @see setValues
         */
        setAntes(value, defaultValue = 1, isEvent = true) {
            this.setValues(value, defaultValue, isEvent);
        }
        /**
         * 设置为数组中小于 value 并最接近的值
         * @param value 一个参考值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setClosest(value, isEvent = true) {
            if (!this.nums || !this.nums.length)
                return;
            let tempAnte;
            let ante = this.nums[0];
            for (let i = 0; i < this.nums.length; i++) {
                tempAnte = this.nums[i];
                if (tempAnte <= value) {
                    ante = tempAnte;
                }
                else {
                    break;
                }
            }
            this.lastValue = parseFloat(this.label.text);
            this.label.text = ante + "";
            this.checkAutoEnabled();
            if (isEvent)
                this.sendEventValue(ante);
        }
        /**
         * 返回上一个值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        before(isEvent = true) {
            let tempAnte = parseFloat(this.label.text);
            if (tempAnte != this.lastValue) {
                this.label.text = this.lastValue + "";
                if (isEvent)
                    this.sendEventValue(this.lastValue);
                this.checkAutoEnabled();
            }
        }
        /**
         * 设置切换到指定的位置
         * @param index 下标
         * @param [isEvent = true] 是否派发本次改变值的事件 如果值和当前的值相同 不派发事件
         */
        setPosition(index, isEvent = true) {
            if (index > -1 && index < this.nums.length) {
                let newValue = this.nums[index];
                let lastValue = parseFloat(this.label.text);
                // 值相等不发送
                if (newValue === lastValue)
                    return;
                this.lastValue = lastValue;
                this.label.text = newValue + "";
                this.checkAutoEnabled();
                if (isEvent)
                    this.sendEventValue(newValue);
            }
        }
        get nums() {
            var _a;
            return (_a = runFun(this.dynamicHandler)) !== null && _a !== void 0 ? _a : this._nums;
        }
        /**
         * @deprecated
         * 兼容老版本
         * @see nums
         */
        getAntes() {
            return this.nums;
        }
        /**
         * 触发监听事件
         * @param ante 当前显示值
         */
        sendEventValue(ante) {
            runFun(this.dateChange, ante);
        }
        onChangeAnte(code) {
            let tempNums = this.nums;
            if (!tempNums || tempNums.length == 0)
                return;
            let tempValue = parseFloat(this.label.text);
            let value = tempValue;
            let index = tempNums.indexOf(value);
            if (index == -1) {
                value = tempNums[0];
            }
            else {
                if (code == 1) { // 加
                    index++;
                    if (index >= tempNums.length) {
                        index = tempNums.length - 1;
                    }
                }
                else if (code == 2) { // 减
                    index--;
                    if (index < 0) {
                        index = 0;
                    }
                }
                value = tempNums[index];
            }
            if (this.dateChangeBefore) {
                if (!runFun(this.dateChangeBefore, value)) // 执行变化前的调用如果返回false 将停止继续执行
                    return;
            }
            this.lastValue = tempValue;
            this.label.text = value + "";
            this.checkAutoEnabled();
            this.sendEventValue(value);
        }
        /** 获取当前显示文本的数字 */
        get textToNumber() {
            return parseFloat(this.text);
        }
        /**
         * @deprecated
         * 获取当前显示文本的数字
         * @see textToNumber
         */
        getTextToNumber() {
            return this.textToNumber;
        }
        /** 获取当前显示文本 */
        get text() {
            return this.label.text;
        }
        /**
         * @deprecated
         * @see text
         */
        getText() {
            return this.text;
        }
        dispose() {
            var _a, _b;
            (_a = this.addLongPressKit) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this.minusLongPressKit) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        /** 检查自动启用停止 */
        checkAutoEnabled() {
            let index = this.nums.indexOf(this.textToNumber);
            if (this.isEnabled && this.autoEnabled) {
                this.addBtn.enabled = index < this.nums.length - 1;
                this.minusBtn.enabled = index > 0;
            }
        }
    }
    tsCore.ChangeValue = ChangeValue;
    /**
     * 包装常用方法
     */
    class UtilKit {
        /**
         * 下载文件
         * @param url
         */
        static downloadURL(url) {
            let iframe = document.getElementById(this.hiddenIFrameID);
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = this.hiddenIFrameID;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = url;
        }
        /**
         * 获取浏览器传入的参数
         * @param name 参数名字
         *
         */
        static getQueryString(name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = window.location.search.substring(1).match(reg);
            if (r)
                return decodeURI(r[2]);
            return null;
        }
        /**
         * 获取浏览器传入的所有参数
         * @return 所有的参数key=value
         */
        static getRequest() {
            let url = window.location.search; //获取url中"?"符后的字串
            let theRequest = {};
            if (url.indexOf("?") != -1) {
                let str = url.substring(1);
                let strs = str.split("&");
                for (let i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        }
        /** 绑定输入框和组件  当输入框中都存在值后  组件变成可点击 */
        static bindInputKit(confirmBtn, ...panel) {
            return new BindInputKit(confirmBtn, ...panel);
        }
        /** 绑定按钮长按、点击 */
        static bindLongPressKit(confirmBtn, callback, ...args) {
            return new LongPressKit(confirmBtn, callback, ...args);
        }
        /**
         * 随机生成字符串
         */
        static randomChar() {
            let x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
            let tmp = "";
            for (let i = 0; i < 32; i++) {
                tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
            }
            //            tmp += Browser.now()
            return tmp;
        }
        /**
         * 检查谷歌当前版本是否满足最小的版本
         * @param checkVersion 最小的版本号
         * @return
         */
        static checkChromeBrowserVersion(checkVersion) {
            let agent = window.navigator.userAgent.toLowerCase();
            if (agent.indexOf("applewebkit") > -1) {
                if (/chrome\/(\d+\.\d)/i.test(agent)) {
                    let ver = +RegExp['\x241'];
                    Log.debug("check browser version = " + ver);
                    if (ver >= checkVersion) {
                        return true;
                    }
                }
            }
            return false;
        }
        static evil(fn) {
            //一个变量指向Function，防止有些前端编译工具报错
            return new Function('return ' + fn)();
        }
        /**
         * 添加动态代码
         * @param content javascript字符串代码
         * @param removeLast 添加后立马删除
         * @param sourceURL 是否添加映射文件名
         */
        static loadScript(content, removeLast = true, sourceURL) {
            if (sourceURL)
                content += '\n//@ sourceURL=' + sourceURL;
            let script = document.createElement('script');
            script.type = "text/javascript";
            script.text = content;
            document.getElementsByTagName('head')[0].appendChild(script);
            removeLast && document.head.removeChild(document.head.lastChild);
        }
        /**
         * 交换数组中的两个值的位置
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static swapValue(value, stateIndex, endIndex) {
            if (stateIndex < value.length && endIndex < value.length) {
                let i = value[stateIndex];
                let i2 = value[endIndex];
                value.splice(endIndex, 1, i);
                value.splice(stateIndex, 1, i2);
            }
        }
        /**
         * 改变值的位置(将数组中的一个值修改到其它位置)
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static changeValue(value, stateIndex, endIndex) {
            if (stateIndex < value.length && endIndex < value.length) {
                let i = value.splice(stateIndex, 1);
                value.splice(endIndex, 0, i[0]);
            }
        }
        /**
         * 高度适配
         * @param obj 适配对象
         */
        static heightAdaptation(obj) {
            let scale = obj.width / obj.initWidth;
            obj.height = obj.initHeight * scale;
            // 如果有字体
        }
        /**
         * 去除重复值
         * @param array
         */
        static removeRepeat(array) {
            return array.filter((value, index, arr) => arr.indexOf(value) == index);
        }
        /** aes加密 */
        static encrypt(word, key = "abcdefgabcdefg12") {
            let keyWordArray = CryptoJS.enc.Utf8.parse(key);
            let srcs = CryptoJS.enc.Utf8.parse(word);
            let encrypted = CryptoJS.AES.encrypt(srcs, keyWordArray, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        }
        /** aes解密 */
        static decrypt(word, key = "abcdefgabcdefg12") {
            let keyWordArray = CryptoJS.enc.Utf8.parse(key);
            let decrypt = CryptoJS.AES.decrypt(word, keyWordArray, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return CryptoJS.enc.Utf8.stringify(decrypt).toString();
        }
        /**
         * 文字长度省略
         * @param value 文字内容
         * @param len 最大长度
         * @param symbol 符号
         */
        static stringOmit(value, len, symbol = "...") {
            let str = value;
            if (str && str.length > len) {
                str = str.substring(0, len);
                str += symbol;
            }
            return str;
        }
        /**
         * 打乱数组
         * @param array 要被打乱的数组
         * @deprecated
         * @see Array.shuffle()
         */
        static shuffle(array) {
            let rnd;
            let tmp;
            let len = array.length;
            for (let i = 0; i < len; i++) {
                tmp = array[i];
                rnd = parseInt(Math.random() * len + "");
                array[i] = array[rnd];
                array[rnd] = tmp;
            }
        }
        /**
         * 字格式
         * @param value 数值
         * @param beyondLimit 超过此值否才分隔 (默认 1000)
         * @param limit 分隔值 按照此值分隔 (默认 1000)
         * @param unit 单位  (默认 K)
         * @param fixed 最后保留几位小数 (默认 2)
         * @return
         */
        static numberConvert(value, beyondLimit = 1000, limit = 1000, unit = "K", fixed = 2) {
            if (value >= beyondLimit)
                return MathKit.toFixed(value / limit, fixed) + unit;
            return MathKit.toFixed(value, fixed) + "";
        }
        /**
         * 将100000转为100,000.00形式
         * @param money
         * @param fixed 是否保留小数(默认false)
         * @return
         */
        static formatMoney(money, fixed = false) {
            if (money) {
                money = money + "";
                let left = money.split('.')[0];
                let right = money.split('.')[1];
                right = right ? (right.length >= 2 ? '.' + right.substring(0, 2) : '.' + right + '0') : '.00';
                if (!fixed)
                    right = "";
                let temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
                return (parseFloat(money) < 0 ? "-" : "") + temp.join(',').split('').reverse().join('') + right;
            }
            else if (money === 0) { //注意===在这里的使用，如果传入的money为0,if中会将其判定为boolean类型，故而要另外做===判断
                return fixed ? '0.00' : "0";
            }
            else {
                return fixed ? '0.00' : "0";
            }
        }
        /**
         * 将100,000.00转为100000形式
         * @param money
         * @param fixed 是否保留小数 (默认false)
         * @return
         */
        static formatMoney2(money, fixed = false) {
            if (money) {
                money = money + "";
                let group = money.split('.');
                let left = group[0].split(',').join('');
                return fixed ? parseFloat(left + "." + group[1]) : parseFloat(left);
            }
            else {
                return 0;
            }
        }
    }
    UtilKit.hiddenIFrameID = 'hiddenDownloader';
    /** @deprecated */
    UtilKit.bindInputBtn = UtilKit.bindInputKit;
    /** @deprecated */
    UtilKit.bindLongPressBtn = UtilKit.bindLongPressKit;
    tsCore.UtilKit = UtilKit;
    /**
     * @deprecated
     * @see UtilKit
     */
    tsCore.UtilsTool = UtilKit;
    class EventController {
        constructor() {
            /** 事件缓存的所有组 组名字->组object */
            this.eventGroup = new Map();
            /**
             * 缓存key -> 实例
             */
            this.cacheTarget = new Map();
            /**
             * 缓存类名 -> 实例
             */
            this.cacheClassTarget = new Map();
        }
        regActionHandler(action, handler, group) {
            let groupObj = this.getGroup(group);
            // 获取此分组下  action 的执行函数存储数组
            groupObj.getOrPut(action, () => []).push(handler);
        }
        /**
         * 分组存储对象
         * @param groupKey 分组key
         * @return
         */
        getGroup(groupKey) {
            if (StringUtil.isEmpty(groupKey)) {
                groupKey = App.DEFAULT_GROUP;
            }
            return this.eventGroup.getOrPut(groupKey, () => new Map());
        }
        regAction(action, caller, method, group, order) {
            const handler = new Laya.Handler(caller, method);
            handler.order = order;
            this.regActionHandler(action, handler, group);
        }
        clearView() {
            this.cacheTarget.clear();
            EventController._CLSID = 0;
        }
        clearGroup() {
            this.eventGroup.clear();
            Log.debug("clear eventGroup");
        }
        removeAllAction(...args) {
            for (const key of this.eventGroup.keys()) { // 获取key
                this.removeGroupActions.apply(this, [key, ...args]);
            }
        }
        removeGroup(groupKey) {
            Log.debug(`removeGroup ${groupKey}`);
            this.eventGroup.delete(groupKey);
        }
        removeGroupActions(groupKey, ...args) {
            let groupObj = this.getGroup(groupKey);
            args.forEach(value => groupObj.delete(value));
        }
        removeActionHandler(action, method, group) {
            if (!group) {
                for (let groupKey of this.eventGroup.values()) {
                    this.removeFunction(groupKey, action, method);
                }
                return;
            }
            let groupObj = this.getGroup(group);
            this.removeFunction(groupObj, action, method);
        }
        removeFunction(groupObj, action, method) {
            let arr = groupObj.get(action);
            if (arr) {
                for (let i = 0; i < arr.length; i++) {
                    let h = arr[i];
                    if (h.method == method) {
                        arr.splice(i, 1);
                        i--;
                    }
                }
                if (arr.length == 0)
                    groupObj.delete(action);
            }
        }
        removeTargetAll(caller) {
            for (let groupObj of this.eventGroup.keys()) {
                this.removeTarget(this.eventGroup.get(groupObj), caller);
            }
        }
        removeTarget(groupObj, caller) {
            for (const [key, value] of groupObj.entries()) {
                for (let i = 0; i < value.length; i++) {
                    let h = value[i];
                    if (h.caller == caller) {
                        value.splice(i, 1);
                        i--;
                    }
                }
                if (value.length == 0)
                    groupObj.delete(key);
            }
        }
        sendGroupAction(group, action, ...args) {
            let result = this.sendActionEvent.apply(this, [group, action, ...args]);
            if (!result) {
                Log.debug("group[" + group + "], action [" + action + "] not exist! Call failure");
            }
        }
        sendAction(action, ...args) {
            let result;
            for (const groupName of this.eventGroup.keys()) {
                let tempResult = this.sendActionEvent.apply(this, [groupName, action, ...args]);
                if (tempResult)
                    result = true;
            }
            if (!result)
                Log.debug("action [" + action + "] not exist! Call failure");
        }
        sendActionEvent(group, action, ...args) {
            let groupObj = this.getGroup(group);
            let arr = groupObj.get(action);
            if (arr) {
                arr.sort((a, b) => a.order || 100 - b.order || 100)
                    .forEach(value => value.runWith(args));
                return true;
            }
            return false;
        }
        addBean(key, bean, saveClassName = true) {
            if (typeof key !== "string") {
                key = this._getClassSign(key);
            }
            if (StringUtil.isEmpty(key)) {
                Log.warn("cannot be empty, key = " + key);
                return false;
            }
            if (this.getView(key)) {
                Log.warn("already exist key = " + key + ", add failure!");
                return false;
            }
            this.cacheTarget.set(key, bean);
            if (saveClassName) {
                this.cacheClassTarget.set(bean.constructor.name, bean);
            }
            return true;
        }
        removeBean(key) {
            if (!key)
                return;
            if (typeof key !== "string") {
                key = this._getClassSign(key, false);
            }
            if (StringUtil.isEmpty(key))
                return;
            this.cacheTarget.delete(key);
            this.cacheClassTarget.delete(key.charAt(0).toUpperCase() + key.slice(1));
        }
        getBean(key) {
            var _a;
            if (!key)
                return;
            if (typeof key !== "string") {
                key = this._getClassSign(key, false);
            }
            return (_a = this.cacheTarget.get(key)) !== null && _a !== void 0 ? _a : this.cacheClassTarget.get(key);
        }
        hasBean(key) {
            if (typeof key !== "string") {
                key = this._getClassSign(key, false);
            }
            if (!key)
                return false;
            return this.cacheTarget.has(key) || this.cacheClassTarget.has(key);
        }
        addView(key, view) {
            if (this.addBean(key, view)) {
                if (typeof key !== "string") {
                    key = this._getClassSign(key);
                }
                view.setKey(key);
                return true;
            }
            return false;
        }
        removeView(key) {
            if (!key)
                return;
            if (typeof key !== "string") {
                key = key.getKey();
            }
            this.removeBean(key);
        }
        getView(key) {
            return this.getBean(key);
        }
        addProxy(key, proxy) {
            if (this.addBean(key, proxy)) {
                if (typeof key !== "string") {
                    key = this._getClassSign(key);
                }
                proxy.setKey(key);
                return true;
            }
            return false;
        }
        removeProxy(key) {
            if (!key)
                return;
            if (typeof key !== "string") {
                key = key.getKey();
            }
            this.removeBean(key);
        }
        getProxy(name) {
            return this.getBean(name);
        }
        getMap() {
            return this.cacheTarget;
        }
        /**
         * 返回类的唯一标识
         */
        _getClassSign(cla, create = true) {
            let className = cla.name || cla["__className"] || cla["_cacheId"];
            if (!className && create) {
                cla["_cacheId"] = className = `${App.DEFAULT_CACHE_HEAD}_${EventController._CLSID}`;
                EventController._CLSID++;
            }
            return className;
        }
    }
    EventController._CLSID = 0;
    tsCore.EventController = EventController;
    /**
     * 碰撞类
     */
    class OBB extends View {
        constructor() {
            super();
            /** 轴心 0 X轴 1 Y轴 */
            this._axes = [];
            this._point = new Vector2();
            this.rotation = 0;
        }
        /**
         * 碰撞检测 判断2矩形最终是否碰撞，需要依次检测4个分离轴，如果在一个轴上没有碰撞，则2个矩形就没有碰撞。
         * @param obb 要参与检测的对象
         * @return
         */
        detectorOBBvsOBB(obb) {
            let nv = this._point.sub(obb.point);
            let axisA1 = this._axes[0];
            if (this.getProjectionRadius(axisA1) + obb.getProjectionRadius(axisA1) <= Math.abs(nv.dot(axisA1)))
                return false;
            let axisA2 = this._axes[1];
            if (this.getProjectionRadius(axisA2) + obb.getProjectionRadius(axisA2) <= Math.abs(nv.dot(axisA2)))
                return false;
            let axisB1 = obb.axes[0];
            if (this.getProjectionRadius(axisB1) + obb.getProjectionRadius(axisB1) <= Math.abs(nv.dot(axisB1)))
                return false;
            let axisB2 = obb.axes[1];
            return this.getProjectionRadius(axisB2) + obb.getProjectionRadius(axisB2) > Math.abs(nv.dot(axisB2));
        }
        /*@override*/
        setSize(wv, hv, ignorePivot) {
            this._extents = [wv >> 1, hv >> 1];
            super.setSize(wv, hv, ignorePivot);
        }
        /**
         * 通过旋转设置x轴和y轴
         * @param value 0-360
         */
        /*@override*/
        set rotation(value) {
            super.rotation = value;
            value = MathKit.angleToRadians(value);
            this._axes[0] = new Vector2(Math.cos(value), Math.sin(value));
            this._axes[1] = new Vector2(-1 * Math.sin(value), Math.cos(value));
        }
        /*@override*/
        setXY(xv, yv) {
            super.setXY(xv, yv);
            this._point.setXY(this.displayObject.x, this.displayObject.y);
        }
        /**
         * 获取轴上的axisX和axisY投影半径距离
         * @param axis
         */
        getProjectionRadius(axis) {
            return this._extents[0] * Math.abs(axis.dot(this._axes[0])) +
                this._extents[1] * Math.abs(axis.dot(this._axes[1]));
        }
        get axes() {
            return this._axes;
        }
        get point() {
            return this._point;
        }
    }
    tsCore.OBB = OBB;
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.setXY(x, y);
        }
        setXY(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        sub(v) {
            return new Vector2(this.x - v.x, this.y - v.y);
        }
        /**
         * 算出自己在参数v上投影的长度
         * @param v
         */
        dot(v) {
            return this.x * v.x + this.y * v.y;
        }
    }
    class DefineConfig {
        static init() {
            DefineConfig.defineLaya();
            DefineConfig.defineFairy();
        }
        static defineLaya() {
            Object.defineProperty(Laya.Stage.prototype, "_changeCanvasSize", {
                value: function () {
                    // Log.debug("_changeCanvasSize = " + Laya.Browser.clientWidth + " | " + Laya.Browser.clientHeight)
                    if (Laya.Browser.clientHeight == Laya.Browser.clientWidth) {
                        Log.debug("refuse =!");
                        this.setScreenSize(this._width, this._height);
                        return;
                    }
                    this.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio);
                }
            });
            // @ts-ignore
            const temp_updateTimers = Laya.Stage.prototype._updateTimers;
            Object.defineProperty(Laya.Stage.prototype, "_updateTimers", {
                value: function () {
                    if (!this.pauseUpdateTimer)
                        temp_updateTimers();
                }
            });
            Object.defineProperty(Laya.KeyBoardManager, "_addEvent", {
                value: function (type) {
                    windowMy.addEventListener(type, function (e) {
                        Laya.KeyBoardManager["_dispatch"](e, type);
                    });
                }
            });
            // @ts-ignore
            Object.defineProperty(Laya.SoundManager, "autoStopMusic", {
                set(v) {
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur);
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.FOCUS, null, _stageOnFocus);
                    // @ts-ignore
                    Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange);
                    // @ts-ignore
                    Laya.SoundManager._autoStopMusic = v;
                    if (v) {
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur);
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.FOCUS, null, _stageOnFocus);
                        // @ts-ignore
                        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange);
                    }
                }
            });
            function _stageOnFocus() {
                // @ts-ignore
                Laya.SoundManager._stageOnFocus();
                // @ts-ignore
                if (!Laya.SoundManager._blurPaused && Laya.SoundManager._musicChannel) {
                    // @ts-ignore
                    if (Laya.SoundManager._musicChannel.isStopped)
                        Laya.SoundManager._musicChannel.resume();
                    return;
                }
                let bgMusic = Laya.SoundManager["_bgMusic"];
                // @ts-ignore
                Laya.SoundManager._blurPaused = false;
                // @ts-ignore
                if (Laya.SoundManager._musicChannel) {
                    // @ts-ignore
                    if (Laya.SoundManager._musicChannel.isStopped) {
                        // @ts-ignore
                        Laya.SoundManager._musicChannel.resume();
                    }
                    else {
                        // @ts-ignore
                        Laya.SoundManager._musicChannel.play();
                    }
                }
                else if (bgMusic && !Laya.SoundManager.musicMuted) {
                    // 没有正在播放的声音  并且背景音乐又存在 不是静音状态
                    Laya.SoundManager["_bgMusic"] = null;
                    SoundUtils.playMusic(bgMusic);
                }
            }
            function _visibilityChange() {
                if (Laya.stage.isVisibility) {
                    _stageOnFocus();
                }
                else {
                    // @ts-ignore
                    Laya.SoundManager._stageOnBlur();
                }
            }
            Object.defineProperty(Laya.DrawTextureCmd, "create", {
                value: function (texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
                    const cmd = Laya.Pool.getItemByClass("DrawTextureCmd", EDrawTextureCmd);
                    cmd.texture = texture;
                    texture["_addReference"]();
                    cmd.x = x;
                    cmd.y = y;
                    cmd.width = width;
                    cmd.height = height;
                    cmd.matrix = matrix;
                    cmd.alpha = alpha;
                    cmd.color = color;
                    cmd.blendMode = blendMode;
                    cmd.uv = uv == undefined ? null : uv;
                    if (color) {
                        cmd.colorFlt = new Laya.ColorFilter();
                        cmd.colorFlt.setColor(color);
                    }
                    return cmd;
                }
            });
            Object.defineProperty(Laya.GraphicsAni, "create", {
                value: GGraphicsAni.create
            });
            Object.defineProperty(Laya.GraphicsAni.prototype, "_renderAll", {
                value: function (sprite, context, x, y) {
                    const cmds = this.cmds;
                    const obj = fgui.GObject.cast(sprite);
                    let cmd;
                    let i = 0, n = cmds.length;
                    for (; i < n; i++) {
                        cmd = cmds[i];
                        if (cmd instanceof EDrawTextureCmd) {
                            if (obj instanceof GSkeleton && obj.blendBoneSlotNames.indexOf(cmd.name) > -1) {
                                // cmd.blendMode = BlendMode.ADD
                                //#__NO_MANGLE_PROP_START__
                                cmd.blendMode = "add";
                            }
                        }
                        cmd.run(context, x, y);
                        if (cmd instanceof EDrawTextureCmd && this._sp && this._sp.hasListener(GSkeleton.UPDATE_BONE_SLOT + cmd.name)) {
                            this._sp.event(GSkeleton.UPDATE_BONE_SLOT + cmd.name, cmd);
                        }
                    }
                }
            });
            // 更改值 并保留调用原始的
            Object.defineProperty(Laya.GraphicsAni.prototype, "tempSaveToCmd", {
                value: Laya.GraphicsAni.prototype["_saveToCmd"]
            });
            Object.defineProperty(Laya.GraphicsAni.prototype, "_saveToCmd", {
                value: function (fun, args) {
                    if (args instanceof EDrawTextureCmd) {
                        let sk;
                        if (this._sp && (sk = fgui.GObject.cast(this._sp)) !== null && sk instanceof GSkeleton) {
                            if (sk.clearBoneSlotOffset.indexOf(this.boneSlotName) >= 0) {
                                args.x = 0;
                                args.y = 0;
                            }
                            else if (sk.clearBoneSlotOffsetX.indexOf(this.boneSlotName) >= 0) {
                                args.x = 0;
                            }
                            else if (sk.clearBoneSlotOffsetY.indexOf(this.boneSlotName) >= 0) {
                                args.y = 0;
                            }
                        }
                        args.name = this.boneSlotName || "";
                    }
                    return this.tempSaveToCmd.call(this, fun, args);
                }
            });
            Object.defineProperties(Laya.HttpRequest.prototype, {
                async: {
                    value: true,
                    writable: true
                }
            });
            Object.defineProperty(Laya.HttpRequest.prototype, "send", {
                value: function (url, data = null, method = "get", responseType = "text", headers = null) {
                    this._responseType = responseType;
                    this._data = null;
                    if (Laya.Browser.onVVMiniGame || Laya.Browser.onQGMiniGame || Laya.Browser.onQQMiniGame || Laya.Browser.onAlipayMiniGame || Laya.Browser.onBLMiniGame || Laya.Browser.onHWMiniGame || Laya.Browser.onTTMiniGame || Laya.Browser.onTBMiniGame) {
                        // @ts-ignore
                        url = Laya.HttpRequest._urlEncode(url);
                    }
                    this._url = url;
                    var _this = this;
                    var http = this._http;
                    //临时，因为微信不支持以下文件格式
                    // this.async ? console.log(`httpAsync_${method}: ${url}`) : console.log(`httpSync_${method}: ${url}`)
                    http.open(method, url, this.async);
                    let isJson = false;
                    if (headers) {
                        for (var i = 0; i < headers.length; i++) {
                            http.setRequestHeader(headers[i++], headers[i]);
                        }
                    }
                    else if (!(window.conch)) {
                        if (!data || typeof (data) == 'string')
                            http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                        else {
                            http.setRequestHeader("Content-Type", "application/json");
                            if (!(data instanceof ArrayBuffer) && typeof data !== "string") {
                                isJson = true;
                            }
                        }
                    }
                    let restype = responseType !== "arraybuffer" ? "text" : "arraybuffer";
                    this.async && (http.responseType = restype);
                    if (this.async && http.dataType) { //for Ali
                        http.dataType = restype;
                    }
                    http.onerror = function (e) {
                        // @ts-ignore
                        _this._onError(e);
                    };
                    http.onabort = function (e) {
                        // @ts-ignore
                        _this._onAbort(e);
                    };
                    http.onprogress = function (e) {
                        // @ts-ignore
                        _this._onProgress(e);
                    };
                    http.onload = function (e) {
                        // @ts-ignore
                        _this._onLoad(e);
                    };
                    if (Laya.Browser.onBLMiniGame && Laya.Browser.onAndroid && !data)
                        data = {};
                    http.send(isJson ? JSON.stringify(data) : data);
                }
            });
            DefineConfig.defineSpineSkeleton();
            DefineConfig.defineSkeleton();
            DefineConfig.defineText();
            DefineConfig.defineTimer();
        }
        static defineFairy() {
            Object.defineProperty(fgui.GRoot.prototype, "playOneShotSound", {
                value: function (url, volumeScale) {
                    if (fgui.ToolSet.startsWith(url, "ui://"))
                        return;
                    if (!volumeScale)
                        volumeScale = 1;
                    SoundUtils.playSound(url, 1, null, volumeScale);
                }
            });
            Object.defineProperty(fgui.GButton.prototype, "__click", {
                value: function (evt) {
                    if (this._sound) {
                        let pi = fgui.UIPackage.getItemByURL(this._sound);
                        if (pi)
                            fgui.GRoot.inst.playOneShotSound(pi.file, this._soundVolumeScale);
                        else
                            fgui.GRoot.inst.playOneShotSound(this._sound, this._soundVolumeScale);
                    }
                    if (this._mode == fgui.ButtonMode.Check) {
                        if (this._changeStateOnClick) {
                            this.selected = !this._selected;
                            fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                        }
                    }
                    else if (this._mode == fgui.ButtonMode.Radio) {
                        if (this._changeStateOnClick && !this._selected) {
                            this.selected = true;
                            fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                        }
                    }
                    else {
                        if (this._relatedController)
                            this._relatedController.selectedPageId = this._relatedPageId;
                    }
                }
            });
            // 给window添加排序  order
            Object.defineProperty(fgui.GRoot.prototype, "showWindow", {
                value: function (win) {
                    this.addChild(win);
                    const cnt = this.numChildren;
                    let wins = [];
                    for (let i = cnt - 1; i >= 0; i--) {
                        const g = this.getChildAt(i);
                        if ((g instanceof fgui.Window) && g.modal) {
                            wins.push(g);
                        }
                    }
                    let pos = -1;
                    const winOrder = win.order || 0;
                    for (let i = 0; i < wins.length; i++) {
                        let order = wins[i].order || 0;
                        if (winOrder > order) {
                            pos = i;
                            this.setChildIndexBefore(win, this.getChildIndex(wins[i]));
                        }
                    }
                    if (pos == -1) {
                        win.requestFocus();
                    }
                    if (win.x > this.width)
                        win.x = this.width - win.width;
                    else if (win.x + win.width < 0)
                        win.x = 0;
                    if (win.y > this.height)
                        win.y = this.height - win.height;
                    else if (win.y + win.height < 0)
                        win.y = 0;
                    this.adjustModalLayer();
                }
            });
            Object.defineProperty(fgui.PopupMenu.prototype, "__clickItem2", {
                value: function (itemObject) {
                    if (!(itemObject instanceof fgui.GButton))
                        return;
                    if (itemObject.grayed) {
                        this._list.selectedIndex = -1;
                        return;
                    }
                    let c = itemObject.asCom.getController("checked");
                    if (c && c.selectedIndex != 0) {
                        if (c.selectedIndex == 1)
                            c.selectedIndex = 2;
                        else
                            c.selectedIndex = 1;
                    }
                    let r = (this._contentPane.parent);
                    r === null || r === void 0 ? void 0 : r.hidePopup(this.contentPane);
                    runFun(itemObject.data);
                }
            });
            Object.defineProperties(fgui.GLoader.prototype, {
                loadRetryCount: {
                    value: 0,
                    writable: true
                },
                loadCount: {
                    value: 0,
                    writable: true
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "temp_loadExternal", {
                value: function () {
                    fgui.AssetProxy.inst.load(this._url, Laya.Handler.create(this, (url, tex) => {
                        if (this._url === url)
                            this.__getResCompleted(tex);
                    }, [this._url]), null, Laya.Loader.IMAGE);
                }
            });
            Object.defineProperty(fgui.GLoader.prototype, "loadExternal", {
                value: function () {
                    this.loadCount = 0;
                    this.temp_loadExternal();
                }
            });
            const GLoader_onExternalLoadSuccess = fgui.GLoader.prototype["onExternalLoadSuccess"];
            Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadSuccess", {
                value: function (texture) {
                    var _a;
                    GLoader_onExternalLoadSuccess.call(this, texture);
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
            const GLoader_loadFromPackage = fgui.GLoader.prototype["loadFromPackage"];
            Object.defineProperty(fgui.GLoader.prototype, "loadFromPackage", {
                value: function (itemURL) {
                    var _a;
                    GLoader_loadFromPackage.call(this, itemURL);
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
            const GLoader_onExternalLoadFailed = fgui.GLoader.prototype["onExternalLoadFailed"];
            Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadFailed", {
                value: function () {
                    var _a;
                    if (this.loadRetryCount > 0 && this.loadCount < this.loadRetryCount) {
                        this.loadCount++;
                        this.temp_loadExternal();
                        return;
                    }
                    GLoader_onExternalLoadFailed.call(this);
                    (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.event(Laya.Event.COMPLETE);
                }
            });
            // 修复 HTML 富文本空格被清除的问题
            const regExp = /(?<=\s|\S)\s+(?=\[\w{0,10}=.{0,10}])|(?<=\s|\S)\s+(?=\[\/\w{0,6}])|(?<=\[\w{0,10}=.{0,10}])\s+(?=\s|\S)|(?<=\[\/\w{0,10}])\s+(?=\s|\S)/g;
            const UBBParser_parse = fgui.UBBParser.prototype.parse;
            Object.defineProperty(fgui.UBBParser.prototype, "parse", {
                value: function (text, remove) {
                    text = text.replace(regExp, "&nbsp;");
                    return UBBParser_parse.call(this, text, remove);
                }
            });
        }
        static defineText() {
            Object.defineProperties(Laya.Text.prototype, {
                _isDrawRemoveLine: {
                    value: false,
                    writable: true,
                    enumerable: true
                },
                removeLineColor: {
                    value: null,
                    writable: true
                },
                removeLineWidth: {
                    value: 1,
                    writable: true
                },
                removeLineTilt: {
                    value: true,
                    writable: true
                }
            });
            Object.defineProperty(Laya.Text.prototype, "isDrawRemoveLine", {
                get() {
                    return this._isDrawRemoveLine;
                },
                set(v) {
                    this.underline = v;
                    this._isDrawRemoveLine = v;
                }
            });
            Object.defineProperty(Laya.Text.prototype, "_drawUnderline", {
                value: function (align, x, y, lineIndex) {
                    let lineWidth = this._lineWidths[lineIndex];
                    switch (align) {
                        case 'center':
                            x -= lineWidth / 2;
                            break;
                        case 'right':
                            x -= lineWidth;
                            break;
                        case 'left':
                        default:
                            break;
                    }
                    if (this.isDrawRemoveLine) {
                        if (this.removeLineTilt) {
                            y += this._charSize.height;
                            this._graphics.drawLine(x, 0, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth);
                        }
                        else {
                            y += this._charSize.height / 2;
                            this._graphics.drawLine(x, y, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth);
                        }
                    }
                    else {
                        y += this._charSize.height;
                        this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1);
                    }
                }
            });
            //修复单行文本对齐异常
            Object.defineProperty(Laya.HTMLDivElement.prototype, "_updateGraphic", {
                value: function () {
                    this._doClears();
                    this.graphics.clear(true);
                    this._repaintState = 0;
                    this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
                    const bounds = this._element.getBounds();
                    if (bounds)
                        this.setSelfBounds(bounds);
                    //this.hitArea = bounds;
                    const sizeW = bounds.width > this.width ? bounds.width : this.width;
                    this.size(sizeW, bounds.height);
                }
            });
            // 修复 宽高设置无用
            Object.defineProperty(Laya.HTMLDivElement.prototype, "width", {
                get() {
                    if (this.contextWidth > super.width) {
                        return this.contextWidth;
                    }
                    return super.width;
                },
                set(value) {
                    super.width = value;
                    this.style.width = value;
                }
            });
            Object.defineProperty(Laya.HTMLDivElement.prototype, "height", {
                get() {
                    if (this.contextHeight > super.height) {
                        return this.contextHeight;
                    }
                    return super.height;
                },
                set(value) {
                    super.height = value;
                    this.style.height = value;
                }
            });
        }
        static defineTimer() {
            // 清理所有数据
            Object.defineProperty(Laya.CallLater.prototype, "clear", {
                value: function (caller) {
                    for (let i = 0; i < this._laters.length; i++) {
                        const handler = this._laters[i];
                        if (handler.caller == caller) {
                            handler.clear();
                        }
                    }
                }
            });
            // 清理所有数据
            Object.defineProperty(Laya.CallLater.prototype, "clearAll", {
                value: function () {
                    for (let i = 0; i < this._laters.length; i++) {
                        if (this._laters.length > i)
                            this._laters[i].clear();
                    }
                }
            });
            Object.defineProperty(Laya.Timer.prototype, "tempClearAll", {
                value: Laya.Timer.prototype.clearAll
            });
            Object.defineProperty(Laya.Timer.prototype, "clearAll", {
                value: function (caller) {
                    this.tempClearAll(caller);
                    Laya.CallLater.I.clear(caller);
                }
            });
            Object.defineProperty(Laya.Timer.prototype, "clearAllTimer", {
                value: function () {
                    //处理handler
                    for (let i = 0; i < this._handlers.length; i++) {
                        if (i < this._handlers.length)
                            this._handlers[i].clear();
                    }
                    Laya.CallLater.I.clearAll();
                }
            });
        }
        static defineSkeleton() {
            Object.defineProperty(Laya.Skeleton.prototype, "getAniIndexByName", {
                value: function (name) {
                    let index = -1;
                    let i = 0, n = this._templet.getAnimationCount();
                    for (; i < n; i++) {
                        const animation = this._templet.getAnimation(i);
                        if (animation && name == animation.name) {
                            index = i;
                            break;
                        }
                    }
                    return index;
                }
            });
            Object.defineProperty(Laya.Skeleton.prototype, "getBoneCoords", {
                value: function (nameOrIndex, boneName) {
                    const arrCoords = [];
                    let aniClipIndex;
                    if (typeof nameOrIndex === "string") {
                        aniClipIndex = this.getAniIndexByName(nameOrIndex);
                    }
                    else {
                        aniClipIndex = nameOrIndex;
                    }
                    const curOriginalData = new Float32Array(this._templet.getTotalkeyframesLength(aniClipIndex));
                    const interval = 1000.0 / this._player.cacheFrameRate;
                    const playTime = this._templet.getAniDuration(aniClipIndex);
                    const lenJ = playTime / interval;
                    for (let j = 0; j < lenJ; j++) {
                        const curTime = j * this._player.cacheFrameRateInterval;
                        this._templet.getOriginalData(aniClipIndex, curOriginalData, this._player.templet._fullFrames[aniClipIndex], j, curTime);
                        let tStartIndex = 0;
                        let tParentTransform;
                        let tSrcBone;
                        const boneCount = this._templet.srcBoneMatrixArr.length;
                        const tSectionArr = this._aniSectionDic[aniClipIndex];
                        let i = 0, n = 0;
                        for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
                            tSrcBone = this._boneList[i];
                            tParentTransform = this._templet.srcBoneMatrixArr[i];
                            tStartIndex++;
                            tStartIndex++;
                            tStartIndex++;
                            tStartIndex++;
                            const boneX = tParentTransform.x + curOriginalData[tStartIndex++];
                            const boneY = tParentTransform.y + curOriginalData[tStartIndex++];
                            if (tSrcBone.name == boneName) {
                                arrCoords.push(boneX);
                                arrCoords.push(boneY);
                                break;
                            }
                            if (this._templet.tMatrixDataLen === 8) {
                                tStartIndex++;
                                tStartIndex++;
                            }
                        }
                    }
                    return arrCoords;
                }
            });
            Object.defineProperty(Laya.BoneSlot.prototype, "tempDraw", {
                value: Laya.BoneSlot.prototype.draw
            });
            Object.defineProperty(Laya.BoneSlot.prototype, "draw", {
                value: function (graphics, boneMatrixArray, noUseSave = false, alpha = 1) {
                    graphics.boneSlotName = this.name;
                    this.tempDraw.call(this, graphics, boneMatrixArray, noUseSave, alpha);
                }
            });
            Object.defineProperty(Laya.Templet.prototype, "_parseTexturePath", {
                value: function () {
                    if (this._isDestroyed) {
                        this.destroy();
                        return;
                    }
                    let i = 0;
                    this._loadList = [];
                    let tByte = new Laya.Byte(this.getPublicExtData());
                    let tX = 0, tY = 0, tWidth = 0, tHeight = 0;
                    let tFrameX = 0, tFrameY = 0, tFrameWidth = 0, tFrameHeight = 0;
                    let tTempleData = 0;
                    let tTextureLen = tByte.getInt32();
                    let tTextureName = tByte.readUTFString();
                    let tTextureNameArr = tTextureName.split("\n");
                    let tSrcTexturePath;
                    for (i = 0; i < tTextureLen; i++) {
                        tSrcTexturePath = this._path + tTextureNameArr[i * 2];
                        tTextureName = tTextureNameArr[i * 2 + 1];
                        tX = tByte.getFloat32();
                        tY = tByte.getFloat32();
                        tWidth = tByte.getFloat32();
                        tHeight = tByte.getFloat32();
                        tTempleData = tByte.getFloat32();
                        tFrameX = isNaN(tTempleData) ? 0 : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameY = isNaN(tTempleData) ? 0 : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData;
                        tTempleData = tByte.getFloat32();
                        tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData;
                        if (this._loadList.indexOf(tSrcTexturePath) == -1) {
                            this._loadList.push(tSrcTexturePath);
                        }
                    }
                    let loadFile = this._loadList.filter(function (loadPath) {
                        const content = Laya.loader.getRes(loadPath);
                        return !content;
                    });
                    if (loadFile.length > 0) {
                        Laya.loader.load(loadFile, Laya.Handler.create(this, this._textureComplete));
                    }
                    else {
                        this._textureComplete();
                    }
                }
            });
            Object.defineProperty(Laya.Templet.prototype, "deleteAniData", {
                value: function (aniIndex) {
                }
            });
        }
        static defineSpineSkeleton() {
            Object.defineProperties(Laya.SpineTempletBase.prototype, {
                loadResUrl: {
                    value: null,
                    writable: true
                }
            });
            // @ts-ignore
            const SpineTemplet_3_x_loadAni = Laya.SpineTemplet_3_x.prototype.loadAni;
            // @ts-ignore
            Object.defineProperty(Laya.SpineTemplet_3_x.prototype, "loadAni", {
                value: function (jsonOrSkelUrl) {
                    this.loadResUrl = jsonOrSkelUrl;
                    SpineTemplet_3_x_loadAni.call(this, jsonOrSkelUrl);
                }
            });
            // @ts-ignore
            const SpineTemplet_4_0_loadAni = Laya.SpineTemplet_4_0.prototype.loadAni;
            // @ts-ignore
            Object.defineProperty(Laya.SpineTemplet_4_0.prototype, "loadAni", {
                value: function (jsonOrSkelUrl) {
                    this.loadResUrl = jsonOrSkelUrl;
                    SpineTemplet_4_0_loadAni.call(this, jsonOrSkelUrl);
                }
            });
            // 修改4.0
            if (spine.AssetManager.prototype["success"]) {
                // @ts-ignore
                const SpineAssetManager_success = spine.AssetManager.prototype.success;
                Object.defineProperty(Laya.SpineAssetManager.prototype, "success", {
                    value: function (callback, path, data) {
                        SpineAssetManager_success.call(this, callback, path, data);
                        if (!callback) {
                            if (typeof data !== "string") {
                                data = JSON.stringify(data);
                            }
                            this.assets[path] = data.replace(/3\.8\.75/g, "3.8");
                        }
                    }
                });
            }
            else {
                // 修改3.x
                const AssetManager_loadText = spine.AssetManager.prototype.loadText;
                Object.defineProperty(spine.AssetManager.prototype, "loadText", {
                    value: function (path, success, error) {
                        if (!success) {
                            AssetManager_loadText.call(this, path, (path, text) => {
                                if (typeof text !== "string") {
                                    text = JSON.stringify(text);
                                }
                                this.assets[path] = text.replace(/3\.8\.75/g, "3.8");
                            });
                        }
                        else
                            AssetManager_loadText.call(this, path, success, error);
                    }
                });
            }
            // 销毁 templet 检查判断
            const SpineSkeleton_destroy = Laya.SpineSkeleton.prototype.destroy;
            Object.defineProperty(Laya.SpineSkeleton.prototype, "destroy", {
                value: function (destroyChild = true) {
                    var _a, _b;
                    (_a = this._templet) !== null && _a !== void 0 ? _a : (this._templet = new Laya.SpineTempletBase());
                    (_b = this.state) !== null && _b !== void 0 ? _b : (this.state = new spine.AnimationState(null));
                    SpineSkeleton_destroy.call(this, destroyChild);
                }
            });
            const SpineSkeleton_init = Laya.SpineSkeleton.prototype.init;
            Object.defineProperty(Laya.SpineSkeleton.prototype, "init", {
                value: function (templet) {
                    let that = this;
                    SpineSkeleton_init.call(this, templet);
                    this.state.listeners[0].event = function (entry, event) {
                        let eventData = {
                            audioValue: event.data.audioPath,
                            audioPath: event.data.audioPath,
                            floatValue: event.floatValue,
                            intValue: event.intValue,
                            name: event.data.name,
                            stringValue: event.stringValue,
                            time: event.time * 1000,
                            balance: event.balance,
                            volume: event.volume
                        };
                        // console.log("event:", entry, event);
                        that.event(Laya.Event.LABEL, eventData);
                        if (that._playAudio && eventData.audioValue) {
                            let time = (that.currentPlayTime * 1000 - eventData.time) / 1000;
                            if (time < 0)
                                time = 0;
                            SoundUtils.playSound(templet["_textureDic"].root + eventData.audioValue, 1, null, 1, time);
                            Laya.SoundManager.playbackRate = that._playbackRate;
                        }
                    };
                }
            });
            Object.defineProperty(Laya.SpineSkeleton.prototype, "_onAniSoundStoped", {
                value: function (force) {
                    let _channel;
                    for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                        _channel = this._soundChannelArr[i];
                        if (_channel && (_channel.isStopped || force)) {
                            !_channel.isStopped && _channel.stop();
                            this._soundChannelArr.splice(i, 1);
                            // SoundManager.removeChannel(_channel); //  是否需要? 去掉有什么好处? 是否还需要其他操作?
                            len--;
                            i--;
                        }
                    }
                }
            });
            // 添加动画渲染通知
            // @ts-ignore
            const SpineSkeleton_update = Laya.SpineSkeleton.prototype._update;
            Object.defineProperty(Laya.SpineSkeleton.prototype, "_update", {
                value: function () {
                    var _a;
                    SpineSkeleton_update.call(this);
                    let events = this._events;
                    let slot = [];
                    let slots = [];
                    let bones = [];
                    for (const key in events) {
                        if (key.startsWith(GSkeleton.UPDATE_BONE_SLOT)) {
                            slot.push(StringUtil.remove(key, GSkeleton.UPDATE_BONE_SLOT));
                        }
                        else if (key.startsWith(GSkeleton.UPDATE_BONE_RENDER)) {
                            bones.push(StringUtil.remove(key, GSkeleton.UPDATE_BONE_RENDER));
                        }
                        else if (key.startsWith(GSkeleton.UPDATE_SLOT_RENDER)) {
                            slots.push(StringUtil.remove(key, GSkeleton.UPDATE_SLOT_RENDER));
                        }
                    }
                    let skeleton = this.skeleton;
                    if (slot.length > 0) {
                        for (const value of skeleton.slots) {
                            if (slot.indexOf((_a = value.data) === null || _a === void 0 ? void 0 : _a.name) > -1) {
                                this.event(GSkeleton.UPDATE_BONE_SLOT + value.data.name, value);
                            }
                        }
                    }
                    if (slots.length > 0) {
                        skeleton.slots
                            .filter(value => { var _a; return slots.includes((_a = value.data) === null || _a === void 0 ? void 0 : _a.name); })
                            .forEach(value => this.event(GSkeleton.UPDATE_SLOT_RENDER + value.data.name, value));
                    }
                    if (bones.length > 0) {
                        skeleton.bones
                            .filter(value => { var _a; return bones.includes((_a = value.data) === null || _a === void 0 ? void 0 : _a.name); })
                            .forEach(value => this.event(GSkeleton.UPDATE_BONE_RENDER + value.data.name, value));
                    }
                }
            });
        }
    }
    tsCore.DefineConfig = DefineConfig;
    class EButton extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GButton) {
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.onInit();
        }
        onInit() { }
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            let child = null;
            for (const key of name) {
                child = super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
    }
    tsCore.EButton = EButton;
    class EComboBox extends mixinExt(StringBlock, ViewBlock, ActionEvent, fgui.GComboBox) {
        constructor() {
            super(...arguments);
            /**
             * 是否根据选择数据改变 icon  text
             * @default true
             */
            this.isUpdateValue = true;
            this._updateValue = true;
        }
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.onInit();
        }
        onInit() { }
        /*@override*/
        set selectedIndex(val) {
            this._updateValue = this.isUpdateValue;
            super.selectedIndex = val;
            this._updateValue = true;
        }
        /*@override*/
        set icon(value) {
            if (this._updateValue)
                super.icon = value;
        }
        /*@override*/
        set text(value) {
            if (this._updateValue)
                super.text = value;
        }
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            let child = null;
            for (const key of name) {
                child = super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
    }
    tsCore.EComboBox = EComboBox;
    class EDrawTextureCmd extends Laya.DrawTextureCmd {
        /*@override*/
        recover() {
            this.colorFlt = null; // 自己修改的 Laya Bug
            super.recover();
        }
    }
    tsCore.EDrawTextureCmd = EDrawTextureCmd;
    class ELabel extends mixinExt(ViewBlock, ActionEvent, fgui.GLabel) {
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.onInit();
        }
        onInit() { }
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            let child = null;
            for (const key of name) {
                child = super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
    }
    tsCore.ELabel = ELabel;
    class ELoader {
        constructor() {
            /** 加载域名备用 */
            this.baseUrls = [];
            this._infoPool = [];
        }
        /**
         * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
         * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
         * @param    url            要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Laya.Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Laya.Loader.JSON,size:50,priority:1}]。
         * @param    complete    加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
         * @param    progress    加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
         * @param    type        资源类型。比如：Loader.IMAGE。
         * @param    priority    (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
         * @param    cache        是否缓存加载结果。
         * @param    group        分组，方便对资源进行管理。
         * @param    ignoreCache    是否忽略缓存，强制重新加载。
         * @param    useWorkerLoader (default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
         * @return 此 LoaderManager 对象本身。
         */
        load(url, complete, progress, type, priority = 1, cache = true, group, ignoreCache = false, useWorkerLoader = false) {
            if (Array.isArray(url))
                return this.loadAssets(url, complete, progress, type, priority, cache, group);
            let content = this.getRes(url);
            if (!ignoreCache && content) {
                //增加延迟回掉，防止快速回掉导致执行顺序错误
                Laya.systemTimer.frameOnce(1, null, function () {
                    progress && progress.runWith(1);
                    complete && complete.runWith(Array.isArray(content) ? [content] : content);
                });
            }
            else {
                let resInfo = this._infoPool.length ? this._infoPool.pop() : new ResInfo();
                resInfo.url = url;
                resInfo.complete = complete;
                resInfo.progress = progress;
                resInfo.type = type;
                resInfo.priority = priority;
                resInfo.cache = cache;
                resInfo.group = group;
                resInfo.ignoreCache = ignoreCache;
                resInfo.useWorkerLoader = useWorkerLoader;
                resInfo.useIndex = 0;
                this._load(url, resInfo, progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
            }
        }
        loadAssets(arr, complete, progress, type, priority, cache, group) {
            let itemCount = arr.length;
            let loadedCount = 0;
            let totalSize = 0;
            let items = [];
            let success = true;
            for (let i = 0; i < itemCount; i++) {
                let item = arr[i];
                if (typeof item === "string")
                    item = { url: item, type: type, size: 1, priority: priority };
                if (!item.size)
                    item.size = 1;
                item.progress = 0;
                totalSize += item.size;
                items.push(item);
                let progressHandler = progress ? Laya.Handler.create(null, loadProgress, [item], false) : null;
                let completeHandler = (complete || progress) ? Laya.Handler.create(null, loadComplete, [item]) : null;
                this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader);
            }
            function loadComplete(item, content) {
                loadedCount++;
                item.progress = 1;
                if (!content)
                    success = false;
                if (loadedCount === itemCount) {
                    complete === null || complete === void 0 ? void 0 : complete.runWith(success);
                }
            }
            function loadProgress(item, value) {
                if (progress) {
                    item.progress = value;
                    let num = 0;
                    for (let j = 0; j < items.length; j++) {
                        let item1 = items[j];
                        num += item1.size * item1.progress;
                    }
                    let v = num / totalSize;
                    progress.runWith(v);
                }
            }
        }
        _load(url, resInfo = null, progress = null, type = null, priority = 1, cache = true, group = null, ignoreCache = false, useWorkerLoader = false) {
            ELoader.loader.formatURL(url, resInfo);
            url = StringUtil.replace(url, "{host}", window.location.host);
            Laya.loader.load(url, Laya.Handler.create(this, this.onSingleComplete, [resInfo]), progress, type, priority, cache, group, ignoreCache, useWorkerLoader);
        }
        onSingleComplete(resInfo, content) {
            var _a;
            if (!content) {
                if (this.baseUrls) {
                    resInfo.useIndex++;
                    if (resInfo.useIndex < this.baseUrls.length) {
                        this._load(resInfo.url, resInfo, resInfo.progress, resInfo.type, resInfo.priority, resInfo.cache, resInfo.group, resInfo.ignoreCache, resInfo.useWorkerLoader);
                        return;
                    }
                }
            }
            if (!content)
                Log.debug("load res fail : " + resInfo.url + " " + content);
            (_a = resInfo.complete) === null || _a === void 0 ? void 0 : _a.runWith(content);
            this._infoPool.push(resInfo);
        }
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        getRes(url) {
            let content = null;
            let allBaseUrl = this.baseUrls;
            if (ELoader.getAllBaseUrl)
                allBaseUrl = ELoader.getAllBaseUrl();
            if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
                let tempUrl = null;
                for (const baseUrl of allBaseUrl) {
                    if (url.charAt(0) != "/")
                        tempUrl = baseUrl + Laya.URL.customFormat(url);
                    content = Laya.Loader.getRes(tempUrl);
                    if (content) {
                        return content;
                    }
                }
            }
            url = StringUtil.replace(url, "{host}", window.location.host);
            return Laya.Loader.getRes(url);
        }
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        clearRes(url) {
            let allBaseUrl = this.baseUrls;
            if (ELoader.getAllBaseUrl)
                allBaseUrl = ELoader.getAllBaseUrl();
            if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
                let tempUrl = null;
                for (const baseUrl of allBaseUrl) {
                    //如果不是全路径，处理url
                    if (url.charAt(0) != "/")
                        tempUrl = baseUrl + Laya.URL.customFormat(url);
                    Laya.Loader.clearRes(tempUrl);
                }
            }
            Laya.Loader.clearRes(url);
        }
        /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
        clearUnLoaded() {
            Laya.loader.clearUnLoaded();
        }
        formatURL(url, resInfo) {
            if (ELoader.checkBaseUrl)
                this.baseUrls = ELoader.checkBaseUrl(url);
            if (this.baseUrls) {
                let index = resInfo.useIndex;
                if (this.baseUrls.length <= index) {
                    index = 0;
                }
                let basePath = this.baseUrls[index];
                basePath = StringUtil.replace(basePath, "{host}", window.location.host);
                Laya.URL.basePath = basePath;
            }
        }
    }
    ELoader.isWebp = false;
    ELoader.loader = new ELoader();
    tsCore.ELoader = ELoader;
    class ResInfo {
    }
    class EProxy extends Proxys {
        /** 注册游戏数据 */
        /*@override*/
        regGameAction(action, caller, method) {
            super.regAction(action, caller, method, App.GAME_GROUP);
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, clas) {
            this.insertExtUrl("//" + pkgName + "/" + resName, clas);
        }
        /** 设置扩展 */
        insertExtUrl(url, clas) {
            fgui.UIObjectFactory.setPackageItemExtension(url, clas);
        }
    }
    /**
     *  游戏公用组
     * @deprecated
     * @see App.GAME_GROUP
     */
    EProxy.GAME_GROUP = App.GAME_GROUP;
    tsCore.EProxy = EProxy;
    class ESkeleton extends mixinExt(BezierCurves, ActionEvent, fgui.GComponent) {
        constructor() {
            super(...arguments);
            /** 播放动画数组的索引 */
            this.playGroupIndex = 0;
            /** 播放结束执行函数 */
            this.stoppedHandler = [];
            /**
             * 动画播放速率 1为标准速率
             * @default 1
             */
            this.playbackRate = 1;
            /**
             * 播放循环次数
             * @private
             */
            this._loopCount = 0;
        }
        get aniPath() {
            return this._aniPath;
        }
        get spineResPath() {
            return this._spineResPath;
        }
        /**
         * 播放动画
         *
         * @param    nameOrIndex    动画名字或者索引 如果此值是ISkeletonPlay对象，后面设置的全部将失效
         * @param    [loop=true]        是否循环播放
         * @param    [force=true]        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    [start=0]        起始时间 毫秒
         * @param    [end=0]            结束时间 毫秒
         * @param    [freshSkin=true]    是否刷新皮肤数据
         * @param    [playAudio=true]    是否播放音频
         */
        play(nameOrIndex, loop = true, force = true, start = 0, end = 0, freshSkin = true, playAudio = true) {
            if (!this.asSkeleton.templet)
                return;
            // 如果不是数组 而是一个 object
            if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
                if (nameOrIndex.nameOrIndex && (typeof nameOrIndex.nameOrIndex === "number" && nameOrIndex.nameOrIndex < 0))
                    return;
                this.playAni(nameOrIndex, 0);
                return;
            }
            if (typeof nameOrIndex === "number" && nameOrIndex < 0)
                return;
            this.playAni({
                nameOrIndex: nameOrIndex, loop: loop, force: force,
                start: start, end: end, freshSkin: freshSkin, playAudio: playAudio
            }, Array.isArray(nameOrIndex) ? 0 : -1);
        }
        /**
         * 播放动画
         * @param skeletonPlay 播放数据
         * @param [playGroupIndex=-1] 如果是播放数组动画 需要要播放动画的位置
         */
        playAni(skeletonPlay, playGroupIndex = -1) {
            var _a, _b;
            if (!this.asSkeleton.templet)
                return;
            if (!skeletonPlay && !this.skeletonPlay) {
                Log.debug("not found play data " + skeletonPlay);
                return;
            }
            this.playGroupIndex = playGroupIndex;
            if (skeletonPlay) {
                (_a = skeletonPlay.loop) !== null && _a !== void 0 ? _a : (skeletonPlay.loop = true);
                this.skeletonPlay = skeletonPlay;
            }
            let delayPlay = this.skeletonPlay.delayPlay;
            if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
                playGroupIndex = playGroupIndex < 0 ? 0 : playGroupIndex;
                let play = this.skeletonPlay.nameOrIndex[playGroupIndex];
                if (typeof play === "object") {
                    if (play.delayPlay)
                        delayPlay = play.delayPlay;
                    play = play.nameOrIndex;
                }
                this.nameOrIndex = play;
            }
            else {
                this.nameOrIndex = (_b = this.skeletonPlay.nameOrIndex) !== null && _b !== void 0 ? _b : 0;
            }
            if (delayPlay && delayPlay > 0) {
                Laya.timer.once(delayPlay, this, this._play);
            }
            else {
                this._play();
            }
        }
        _play() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            if (this.skeletonPlay.progress) {
                if ("before" in this.skeletonPlay.progress) {
                    runFun(this.skeletonPlay.progress.before, this.nameOrIndex);
                }
            }
            let force = (_a = this.skeletonPlay.force) !== null && _a !== void 0 ? _a : true;
            let start = (_b = this.skeletonPlay.start) !== null && _b !== void 0 ? _b : 0;
            let end = (_c = this.skeletonPlay.end) !== null && _c !== void 0 ? _c : 0;
            let freshSkin = (_d = this.skeletonPlay.freshSkin) !== null && _d !== void 0 ? _d : true;
            let playAudio = (_e = this.skeletonPlay.playAudio) !== null && _e !== void 0 ? _e : true;
            let playbackRate = (_f = this.skeletonPlay.playbackRate) !== null && _f !== void 0 ? _f : this.playbackRate;
            if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
                let play = this.skeletonPlay.nameOrIndex[this.playGroupIndex];
                if (typeof play === "object") {
                    force = (_g = play.force) !== null && _g !== void 0 ? _g : force;
                    start = (_h = play.start) !== null && _h !== void 0 ? _h : start;
                    end = (_j = play.end) !== null && _j !== void 0 ? _j : end;
                    freshSkin = (_k = play.freshSkin) !== null && _k !== void 0 ? _k : freshSkin;
                    playAudio = (_l = play.playAudio) !== null && _l !== void 0 ? _l : playAudio;
                    playbackRate = (_m = play.playbackRate) !== null && _m !== void 0 ? _m : playbackRate;
                }
            }
            this.asSkeleton.playbackRate(playbackRate);
            this.asSkeleton.play(this.nameOrIndex, false, force, start, end, freshSkin, playAudio);
        }
        /**
         * 当动画停止时的回调函数 或 使用 skeleton.stop()
         */
        onPlayStopped() {
            var _a, _b, _c, _d, _e;
            if (this.skeletonPlay) {
                // 检查播放进度信息，如果存在则执行相应的“after”或“before”回调函数
                if (this.skeletonPlay.progress) {
                    if ("after" in this.skeletonPlay.progress) {
                        runFun(this.skeletonPlay.progress.after, this.nameOrIndex);
                    }
                    else if (typeof this.skeletonPlay.progress === "function") {
                        runFun(this.skeletonPlay.progress, this.nameOrIndex);
                    }
                }
                // 如果当前动画播放队列（nameOrIndex）是一个数组且长度大于0，则进行如下处理：
                if (Array.isArray(this.skeletonPlay.nameOrIndex) && this.skeletonPlay.nameOrIndex.length > 0) {
                    // 获取当前播放索引对应的动画数据
                    const playData = this.skeletonPlay.nameOrIndex[this.playGroupIndex];
                    // 当前动画播放完成后需要循环播放的次数
                    let loopCount = 0;
                    if (typeof playData === "object") {
                        loopCount = (_a = playData.loopCount) !== null && _a !== void 0 ? _a : loopCount;
                        runFun(playData.playComplete, this._loopCount);
                    }
                    // 更新循环播放计数器并判断是否需要切换到下一个动画
                    if (loopCount > 0 && loopCount != this._loopCount) {
                        this._loopCount++;
                    }
                    else {
                        this.playGroupIndex++;
                        this._loopCount = 0;
                    }
                    // 判断是否需要开始新的动画序列或循环播放
                    let isNewPro = false;
                    if (this.skeletonPlay.nameOrIndex.length > this.playGroupIndex
                        || (this.skeletonPlay.loop && (isNewPro = true) && (this.playGroupIndex = 0) === 0)) {
                        // 若是新序列且设置有延迟循环播放时间，则延时后播放
                        if (isNewPro && this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                            // 循环播放有延迟的时候  单独处理
                            Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex]);
                        }
                        else {
                            this.playAni(this.skeletonPlay, this.playGroupIndex);
                        }
                        return;
                    }
                    // 当全局数组动画loop是false loopPlayIndex > -1
                    if (this.skeletonPlay.loopPlayIndex > -1 && this.skeletonPlay.loopPlayIndex < this.skeletonPlay.nameOrIndex.length) {
                        this.playGroupIndex = this.skeletonPlay.loopPlayIndex;
                        this.playAni(this.skeletonPlay, this.playGroupIndex);
                        return;
                    }
                }
                else {
                    // 当播放队列不是数组时，根据loop属性和动画时长来决定是否循环播放当前动画
                    if (this.skeletonPlay.loop && this.getAnimDuration((_b = this.nameOrIndex) !== null && _b !== void 0 ? _b : 0) > 0) {
                        let len = 0;
                        if (this instanceof GSpineSkeleton) {
                            len = this.getAnimation((_c = this.nameOrIndex) !== null && _c !== void 0 ? _c : 0).timelines[0].getFrameCount();
                        }
                        else if (this instanceof GSkeleton) {
                            len = this.getAnimation((_d = this.nameOrIndex) !== null && _d !== void 0 ? _d : 0).totalKeyframeDatasLength;
                        }
                        if (this.getAnimFrame((_e = this.nameOrIndex) !== null && _e !== void 0 ? _e : 0) > 1 || len > 1) {
                            // 若设置了延迟循环播放时间，则延时后播放；否则立即播放
                            if (this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                                Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex]);
                            }
                            else {
                                this.playAni(this.skeletonPlay, this.playGroupIndex);
                            }
                            return;
                        }
                    }
                }
                const fun = this.skeletonPlay.playComplete;
                // 执行播放结束 并且没有循环播放 那么清理播放数据源
                this.skeletonPlay = null;
                // 执行播放完成的回调函数
                runFun(fun);
            }
            // 执行播放完成的回调函数
            this.stoppedHandler.forEach(value => value.run());
        }
        paused() {
            this.asSkeleton.paused();
        }
        resume() {
            this.asSkeleton.resume();
        }
        stop() {
            this.skeletonPlay = null;
            Laya.timer.clearAll(this);
            this.asSkeleton.stop();
        }
        getAniNameByIndex(index) {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.getAniNameByIndex(index);
        }
        getSkeletonPlay() {
            return this.skeletonPlay;
        }
    }
    tsCore.ESkeleton = ESkeleton;
    class ESocket {
        constructor() {
            /** 是否已经连接 */
            this.isConnect = false;
            /** socket类型注册监听 */
            this.eventManager = {};
        }
        /** 关闭链接 */
        close() {
            this.isConnect = false;
            this.eventManager = {};
        }
        /**
         * 删除socket 事件
         * @param type
         */
        removeSocketEvent(type) {
            delete this.eventManager["event_" + type];
        }
        /**
         * 注册socket 事件
         * @param type
         * @param handler
         */
        addSocketEvent(type, handler) {
            this.eventManager["event_" + type] = handler;
        }
        /**
         * 发送socket type事件
         * @param type
         * @param obj
         */
        sendEventManager(type, ...obj) {
            let fun = this.eventManager["event_" + type];
            if (fun) {
                obj.unshift(fun);
                runFun.apply(null, obj);
            }
        }
    }
    tsCore.ESocket = ESocket;
    /**
     * 实现了 fgui.Window 的窗口
     * 默认会添加新的路由到历史中，可通过 joinRecord 处理
     */
    class EWindow extends mixinExt(StringBlock, ViewProxy, ActionEvent, fgui.Window) {
        constructor() {
            super(...arguments);
            /** 动画显示或关闭 */
            this.isAction = true;
            /** 是否加入后退记录 */
            this.joinRecord = true;
        }
        /*@override*/
        onInit() {
            let scale = App.inst.getEqualRatioScale();
            Log.debug(`window scale ratio ${scale}`);
            this.contentPane.setSize(this.width * scale, this.height * scale);
            this.setSize(this.contentPane.width, this.contentPane.height);
            if (this.isAction) {
                this.setPivot(0.5, 0.5);
            }
        }
        /**
         * 获取子组件
         * @param name 传入子组件多种命名方式
         */
        /*@override*/
        getChild(...name) {
            var _a;
            let child = null;
            for (const key of name) {
                child = ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getChild(key)) || super.getChild(key);
                if (child)
                    return child;
            }
            return child;
        }
        /*@override*/
        getTransition(transName) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getTransition(transName)) || super.getTransition(transName);
        }
        /*@override*/
        getTransitionAt(index) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getTransitionAt(index)) || super.getTransitionAt(index);
        }
        /*@override*/
        getController(name) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getController(name)) || super.getController(name);
        }
        /*@override*/
        getControllerAt(index) {
            var _a;
            return ((_a = this.contentPane) === null || _a === void 0 ? void 0 : _a.getControllerAt(index)) || super.getControllerAt(index);
        }
        updateSizePoint() {
            this.center();
        }
        /*@override*/
        doHideAnimation() {
            this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            if (this.isAction) {
                let tempX = this.x;
                let tempY = this.y;
                if (this.startPoint) {
                    tempX = this.startPoint.x - this.contentPane.width / 2;
                    tempY = this.startPoint.y - this.contentPane.height / 2;
                }
                Laya.Tween.to(this, {
                    scaleX: 0.3,
                    scaleY: 0.3,
                    x: tempX,
                    y: tempY
                }, 400, Laya.Ease.backIn, Laya.Handler.create(this, this.hideImmediately));
            }
            else {
                this.hideImmediately();
            }
        }
        /*@override*/
        doShowAnimation() {
            this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            this.displayObject.stage.on(Laya.Event.RESIZE, this, this.updateSizePoint);
            this.touchable = true;
            if (this.joinRecord)
                HistoryManager.addHistory(null, this);
            this.updateSizePoint();
            if (this.isAction) {
                this.setScale(.3, .3);
                let tempX = this.x;
                let tempY = this.y;
                if (this.startPoint) {
                    this.setXY(this.startPoint.x - this.contentPane.width / 2, this.startPoint.y - this.contentPane.height / 2);
                }
                Laya.Tween.to(this, { scaleX: 1, scaleY: 1, x: tempX, y: tempY }, 400, Laya.Ease.backOut, Laya.Handler.create(this, this.onShown));
            }
            else {
                this.onShown();
            }
        }
        /*@override*/
        closeEventHandler() {
            if (this.parent) {
                if (this.joinRecord) {
                    HistoryManager.backHistory();
                }
                else {
                    this.hideRecord();
                }
            }
        }
        /*@override*/
        onHide() {
            HistoryManager.invalidHistory(this);
        }
        hideRecord() {
            this.touchable = false;
            fgui.GRoot.inst.closeModalWait();
            this.hide();
        }
        showRecord() {
        }
        /*@override*/
        dispose() {
            var _a, _b;
            this.parent = null;
            HistoryManager.invalidHistory(this);
            Laya.Tween.clearAll(this);
            (_a = this.displayObject) === null || _a === void 0 ? void 0 : _a.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint);
            if (!((_b = this.displayObject) === null || _b === void 0 ? void 0 : _b.destroyed))
                super.dispose();
        }
    }
    tsCore.EWindow = EWindow;
    let Method;
    (function (Method) {
        Method["GET"] = "get";
        Method["POST"] = "post";
    })(Method = tsCore.Method || (tsCore.Method = {}));
    class BindInputKit {
        /**
         *
         * @param component 被约束的组件
         * @param array 起到约束作用的组件
         */
        constructor(component, ...array) {
            this.component = component;
            this.array = array;
            let value;
            let input;
            let gbtn;
            for (let i = 0; i < array.length; i++) {
                value = array[i];
                if (value instanceof fgui.GTextInput) {
                    input = value;
                    input.on(Laya.Event.INPUT, this, this.onStateChanged);
                }
                else if (value instanceof fgui.GButton) {
                    gbtn = value;
                    gbtn.on(fgui.Events.STATE_CHANGED, this, this.onStateChanged);
                }
            }
        }
        onStateChanged() {
            let enabled = true; // 注释
            for (const value of this.array) {
                if (value instanceof fgui.GTextInput && (value.text.length == 0 || value.text == value.promptText)) {
                    enabled = false;
                }
                else if (value instanceof fgui.GButton && !value.selected) {
                    enabled = false;
                }
            }
            this.component.enabled = enabled;
            runFun(this.callback);
        }
        /** 检查一次状态 */
        check() {
            this.onStateChanged();
        }
    }
    tsCore.BindInputKit = BindInputKit;
    let EnvType;
    (function (EnvType) {
        EnvType[EnvType["PROD"] = 0] = "PROD";
        EnvType[EnvType["DEV"] = 1] = "DEV";
        EnvType[EnvType["TEST"] = 2] = "TEST";
    })(EnvType = tsCore.EnvType || (tsCore.EnvType = {}));
    /**
     * 配置工具
     */
    class ConfigKit {
        /**
         * 从 window 中获取指定的对象
         */
        static get(key) {
            return window[key];
        }
        /**
         * 将自动检测当前环境是否支持webp图片
         *
         * 如果网址携带参数webp将会强制使用webp图片
         */
        static useWebp() {
            var _a, _b;
            let isWebp = false;
            if (!Laya.Render.isConchApp && window.location.protocol != "http:") {
                isWebp = ((_b = (_a = window.document.createElement('canvas')) === null || _a === void 0 ? void 0 : _a.toDataURL('image/webp')) === null || _b === void 0 ? void 0 : _b.indexOf('data:image/webp')) == 0;
            }
            if (isWebp || Laya.Utils.getQueryString("webp")) {
                ELoader.isWebp = true;
                Log.info("Support webp");
            }
            return isWebp;
        }
        /**
         * 运行环境检测
         * @param url 检测地址
         * @param [isPathName=true] 是否检测路径
         */
        static env(url, isPathName = true) {
            let value = Laya.Utils.getQueryString("env");
            if (StringUtil.isNotEmpty(value)) {
                const valueEnv = Environment.findEnv(value);
                if (valueEnv) {
                    Environment.active = valueEnv;
                    return valueEnv;
                }
            }
            let checkUrl = url !== null && url !== void 0 ? url : window.location.host;
            Environment.active = Environment.DEFAULT_ENV;
            if (!ConfigKit._check(checkUrl) && !url && isPathName) {
                ConfigKit._check(window.location.pathname);
            }
            return Environment.active;
        }
        /**
         * 检测
         * @param url
         */
        static _check(url) {
            if (Environment.verify(url, Environment.TEST)) {
                Environment.active = EnvType.TEST;
                return true;
            }
            else if (Environment.verify(url, Environment.DEV)) {
                Environment.active = EnvType.DEV;
                return true;
            }
            else if (Environment.verify(url, Environment.PROP)) {
                Environment.active = EnvType.PROD;
                return true;
            }
            return false;
        }
    }
    tsCore.ConfigKit = ConfigKit;
    class Environment {
        /**
         * 验证环境
         * @param url url window.location.host
         * @param value 判断条件
         */
        static verify(url, value) {
            if (StringUtil.isEmpty(url) || (value === null || value === void 0 ? void 0 : value.length) < 1)
                return false;
            // 后行断言在旧版本的 JavaScript 以及某些浏览器和环境中是不支持的，因此使用非捕获组更具有兼容性。
            return new RegExp(`\\b(${value.join("|")})\\b`).test(url);
            // return new RegExp("(?<=\\/|-|(\\.))" + value.join("|") + "(?=(\\.)|-)").test(url)
        }
        /**
         * 查询指定的环境是否存在
         * @param value test, debug, localhost, dev, staging, prod, production, release
         */
        static findEnv(value) {
            if (Environment.TEST.indexOf(value) != -1)
                return EnvType.TEST;
            if (Environment.DEV.indexOf(value) != -1)
                return EnvType.DEV;
            return Environment.PROP.indexOf(value) != -1 ? EnvType.PROD : null;
        }
    }
    Environment.TEST = ["test", "debug", "localhost"];
    Environment.DEV = ["dev", "staging"];
    Environment.PROP = ["prod", "production", "release"];
    /**
     * 默认环境
     * @default EnvType.PROD
     */
    Environment.DEFAULT_ENV = EnvType.PROD;
    /**
     * 当前运行环境，默认有三个环境
     * ```
     * dev:开发环境|test:测试环境|prod:生产环境
     * 根据域名判断环境
     * prod: prod|production|release
     * dev : dev|staging
     * test: test|debug
     * 判断依据：
     * https://www.game-prod.com prod 环境
     * https://www.game-prod-info.com prod环境
     * https://www.game-prod-info.dev prod环境
     *
     * https://www.game-dev-prod-info.com dev环境
     * https://dev.game-prod-test-info.com dev环境
     * https://www.dev.game-prod.com dev环境
     * https://www.dev-data.game.com dev环境
     *
     * ```
     * 默认使用 window.location.host 判断环境
     * @default EnvType.PROD
     */
    Environment.active = Environment.DEFAULT_ENV;
    tsCore.Environment = Environment;
    /**
     * 贴边工具
     */
    class EdgeFloatKit {
        /**
         * 获取指定目标在可视范围内的最终位置
         * @param target 目标组件
         * @param range 可视大小
         */
        static moveXY(target, range) {
            const { width, height } = range;
            const enableNotch = App.inst.options.isNotchEnable && Laya.stage.screenMode === Laya.Stage.SCREEN_HORIZONTAL;
            const notchH = SystemKit.notchHeight;
            let [tempX, tempY] = [target.x, target.y];
            if (target.x > (width >> 1)) { // 大于可视范围宽度一半
                tempX = width - target.x - target.width;
                if (target.y > (height >> 1)) { // 大于可视范围高度一半  Y位置偏下
                    tempX = width - target.x - target.width; // 右边距
                    tempY = height - target.y - target.height; // 底边距
                    if (tempX < tempY) { // 右边距小于向下的边距
                        // 向右靠边 y不变
                        tempX = width - target.width;
                        tempY = Math.max(target.y, enableNotch ? notchH : 0);
                    }
                    else {
                        // 向下靠边 x不变
                        tempY = height - target.height;
                        tempX = Math.max(target.x, enableNotch ? notchH : 0);
                    }
                }
                else { // Y位置偏上
                    if (target.y < width - target.x - target.width) { // 组件 右边距 大于顶边距
                        // 向上靠边 x不变
                        tempY = enableNotch ? notchH : 0;
                        tempX = Math.max(target.x, enableNotch ? notchH : 0);
                    }
                    else {
                        // 向右靠边 y不变
                        tempX = width - target.width;
                        tempY = Math.max(target.y, enableNotch ? notchH : 0);
                    }
                }
            }
            else { // 小于可视范围宽度一半
                if (target.y > (height >> 1)) { // 大于可视范围高度一半   Y位置偏下
                    if (target.x < height - target.y - target.height) { // X位置偏左
                        // 向左靠边 Y不变
                        tempX = enableNotch ? notchH : 0;
                        tempY = Math.max(target.y, enableNotch ? notchH : 0);
                    }
                    else {
                        // 向下靠边 X不变
                        tempY = height - target.height;
                        tempX = Math.max(target.x, enableNotch ? notchH : 0);
                    }
                }
                else {
                    if (target.x < target.y) { // X位置偏右
                        // 向左靠边 Y不变
                        tempX = enableNotch ? notchH : 0;
                        tempY = Math.max(target.y, enableNotch ? notchH : 0);
                    }
                    else {
                        // 向上靠边 X不变
                        tempY = enableNotch ? notchH : 0;
                        tempX = Math.max(target.x, enableNotch ? notchH : 0);
                    }
                }
            }
            return { x: tempX, y: tempY };
        }
    }
    tsCore.EdgeFloatKit = EdgeFloatKit;
    /**
     * 长按、点击组件绑定
     * @author boge
     */
    class LongPressKit {
        /**
         * 创建一个监听
         * @param component 绑定组件
         * @param callback 回调方法
         * @param args 执行回调方法  附带参数
         *
         */
        constructor(component, callback, ...args) {
            var _a;
            /** 按下判定长按的间隔时间 */
            this.HOLD_TRIGGER_TIME = 500;
            /** 是否单次调用 */
            this.single = false;
            this.component = component;
            this.args = args;
            this.callback = callback;
            this.clearEvent();
            (_a = component.displayObject) === null || _a === void 0 ? void 0 : _a.once(Laya.Event.MOUSE_DOWN, this, this.onDown);
            component.onClick(this, this.onClick);
        }
        /** 点下按钮 */
        onDown(e) {
            Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold);
            Laya.stage.once(Laya.Event.MOUSE_UP, this, this.onUp);
        }
        /** 松开按钮 */
        onUp() {
            var _a;
            this._isApeHold = false;
            this.clearEvent();
            (_a = this.component.displayObject) === null || _a === void 0 ? void 0 : _a.once(Laya.Event.MOUSE_DOWN, this, this.onDown);
            this.component.onClick(this, this.onClick);
        }
        onHold() {
            this._isApeHold = true;
            // 先清理单击事件
            this.component.offClick(this, this.onClick);
            Laya.timer.loop(100, this, this.onLoopClick);
            this.onLoopClick();
        }
        onLoopClick() {
            if (this._isApeHold) {
                // 执行一次点击
                this.onClick(null);
                // 单次执行  直接执行清理结束操作
                if (this.single)
                    this.onUp();
            }
            else {
                Laya.timer.clear(this, this.onLoopClick);
            }
        }
        onClick(e) {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            runFun.apply(null, [this.callback, ...this.args]);
        }
        clearEvent() {
            var _a;
            Laya.timer.clear(this, this.onLoopClick);
            // 如果未触发hold，终止触发hold
            Laya.timer.clear(this, this.onHold);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onUp);
            (_a = this.component.displayObject) === null || _a === void 0 ? void 0 : _a.off(Laya.Event.MOUSE_DOWN, this, this.onDown);
            this.component.offClick(this, this.onClick);
        }
        get isApeHold() {
            return this._isApeHold;
        }
        dispose() {
            Laya.timer.clearAll(this);
            this.component.off(Laya.Event.MOUSE_DOWN, this, this.onDown);
            this.component.offClick(this, this.onClick);
        }
    }
    tsCore.LongPressKit = LongPressKit;
    /**
     * 包装常用计算
     */
    class MathKit {
        /**
         * 角度转弧度
         *
         * angle * Math.PI / 180
         *
         * @param angle 角度
         */
        static angleToRadians(angle) {
            return angle * MathKit.DEG_TO_RAD;
        }
        /**
         * 弧度转角度
         *
         * radians * 180 / Math.PI
         *
         * @param radians 弧度
         */
        static radiansToAngle(radians) {
            return radians * MathKit.RAD_TO_DEG;
        }
        /**
         * 计算两点之间的角度角度
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         *
         */
        static angle(x1, y1, x2, y2) {
            let newX = x2 - x1;
            let newY = y2 - y1;
            let a = Math.atan2(newY, newX);
            return a * 180 / Math.PI;
        }
        /**
         * 获取圆旋转到指定位置的长度函数
         * @param count 圆拆分份数
         * @param index 奖品所在奖区
         * @param [minLoop=0] 最少圈数
         * @param [maxLoop=0] 最多圈数
         * @param [skew=-0.5] 第一个奖区起始点与0点位置的偏移比例
         * @param [offset=0.5] 指针所停位置离奖区边缘的比例
         *
         */
        static roundLong(count, index, minLoop = 0, maxLoop = 0, skew = -.5, offset = .5) {
            let loop = 0;
            if (minLoop > 0 && maxLoop >= minLoop) {
                loop = 360 * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop); //整圈长度
            }
            let _skew = (360 / count) * skew; //第一个奖区起始点与0点位置的偏移量
            let _location = (360 / count) * index; //目标奖区的起始点
            let _offset = Math.floor(Math.random() * (360 / count) * (1 - 2 * offset)) + (360 / count) * offset;
            return loop + _skew + _location + _offset;
        }
        /**
         * 获取滚动总长度
         * @param item 单个格子高度
         * @param count 转盘拆分份数
         * @param minLoop 最少圈数
         * @param maxLoop 最多圈数
         * @param location 奖品所在奖区
         * @return
         */
        static scrollLong(item, count, minLoop, maxLoop, location) {
            let totalLong = item * count;
            let loop = totalLong * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop); //整圈长度
            let _location = (totalLong / count) * location; //目标奖区的起始点
            return loop + _location;
        }
        /**
         * 计算两点之间的距离
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         *
         */
        static pointDistance(x1, y1, x2, y2) {
            let x = x1 - x2;
            let y = y1 - y2;
            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        }
        /**
         * 获取两点中间点的坐标
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         */
        static getPointMiddle(x1, y1, x2, y2) {
            let tempX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
            let tempY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2;
            tempX += Math.min(x1, x2);
            tempY += Math.min(y1, y2);
            return new Laya.Point(tempX, tempY);
        }
        /**
         * 获取圆上一点的坐标，坐标起点从坐标系右下方向左计算
         * @param x 圆点X坐标
         * @param y 圆点Y坐标
         * @param radius 半径
         * @param radians 弧度(不是角度)
         */
        static roundPoint(x, y, radius, radians) {
            x = x + (Math.cos(radians) * radius);
            y = y + (Math.sin(radians) * radius);
            return new Laya.Point(x, y);
        }
        /**
         * 补全数字
         * @param data 要处理的数字、或字符串化的数字
         * @param len 数字总长度
         * @param isLast 是否补在尾部
         */
        static fillAVacancy(data, len, isLast = false) {
            let string = data + "";
            len = len - string.length;
            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    string = isLast ? string + "0" : "0" + string;
                }
            }
            return string;
        }
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         * @return
         */
        static toFixed(value, p = 0) {
            let temp = value + "";
            let index = temp.indexOf(".");
            if (index == -1)
                return parseInt(temp);
            p = p > 0 ? p + 1 : 0;
            return parseFloat(temp.substring(0, index + p));
        }
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有,添加指定保留的小数值
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         */
        static toFixedStr(value, p = 0) {
            value = MathKit.toFixed(value, p);
            let money = value + "";
            let moneyStr = money.split('.');
            let left = moneyStr[0];
            if (p == 0)
                return left;
            let right = moneyStr.length > 1 ? moneyStr[1] : null;
            if (right) {
                if (right.length >= p) {
                    right = '.' + right.substring(0, p);
                }
                else {
                    right = '.' + MathKit.fillAVacancy(right, p, true);
                }
            }
            else {
                right = '.' + MathKit.fillAVacancy("0", p);
            }
            return left + right;
        }
        /**
         * 从数组中获取大于指定值的元素及其索引
         * @param nums 数值数组
         * @param value 指定的值
         * @param includeEqual 是否包括等于指定值的元素，默认为true
         * @returns 返回一个对象，包含找到的元素的索引和值，如果没有找到则索引为-1，值为undefined
         */
        static findFirstGreaterOrEqual(nums, value, includeEqual = true) {
            let index = -1; // 初始化索引为-1，表示未找到
            let result = undefined; // 初始化结果为undefined
            // 从数组末尾开始向前遍历
            for (let i = nums.length - 1; i >= 0; i--) {
                const num = nums[i]; // 当前遍历的元素
                // 如果元素大于指定值，或者等于指定值且equal参数为true
                if (num > value || (includeEqual && num === value)) {
                    index = i; // 更新索引
                    result = num; // 更新结果
                }
                else
                    break; // 如果找到不满足条件的元素，则终止循环
            }
            return { index, value: result }; // 返回结果对象
        }
        /**
         * 在给定的数字数组中，从后向前查找第一个小于等于指定值的元素。
         * @param nums 数字数组，作为查找范围。
         * @param value 指定的值，用于与数组元素进行比较。
         * @param includeEqual 是否包括等于指定值的元素，默认为true。
         * @returns 返回一个对象，包含找到的元素的索引和值。如果没有找到符合条件的元素，则索引为-1，值为undefined。
         */
        static findFirstLessOrEqual(nums, value, includeEqual = true) {
            let index = -1; // 初始化索引为-1，表示未找到
            let result = undefined; // 初始化结果为undefined
            // 从数组末尾开始向前遍历
            for (let i = nums.length - 1; i >= 0; i--) {
                const num = nums[i]; // 当前遍历的元素
                // 如果元素大于指定值，或者等于指定值且equal参数为true
                if (num > value || (includeEqual && num === value)) {
                    index = i; // 更新索引
                    result = num; // 更新结果
                }
                else
                    break; // 如果找到不满足条件的元素，则终止循环
            }
            return { index, value: result }; // 返回结果对象
        }
        /**
         * 比较两个值  获得返回值   用于数组排序   从小到大
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compare(aPrice, bPrice) {
            if (aPrice > bPrice) {
                return 1;
            }
            else if (aPrice < bPrice) {
                return -1;
            }
            else {
                return 0;
            }
        }
        /**
         * 比较两个值  获得返回值   用于数组排序   从大到小
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compareOn(aPrice, bPrice) {
            if (aPrice > bPrice) {
                return -1;
            }
            else if (aPrice < bPrice) {
                return 1;
            }
            else {
                return 0;
            }
        }
        /**
         * 随机数  最小值  最大值(不包括)
         * @deprecated
         * @see global.random
         */
        static random(minNum, maxNum) {
            return (Math.floor(Math.random() * (maxNum - minNum)) + minNum);
        }
        /**
         * 随机数
         * @param minNum 最小值
         * @param maxNum 最大值(不包括)
         * @param p 保留尾数  默认NAN 表示全保留
         * @return
         * @deprecated
         * @see global.randomFloat
         */
        static randomFloat(minNum, maxNum, p = NaN) {
            let temp = (Math.random() * (maxNum - minNum) + minNum);
            if (!isNaN(p))
                temp = MathKit.toFixed(temp, p);
            return temp;
        }
    }
    /** 计算角度的公式  180 / Math.PI */
    MathKit.RAD_TO_DEG = 180 / Math.PI;
    /** 计算弧度的公式  Math.PI / 180 */
    MathKit.DEG_TO_RAD = Math.PI / 180;
    /**
     * @deprecated
     * @see findFirstGreaterOrEqual
     */
    MathKit.getGreater = MathKit.findFirstGreaterOrEqual;
    /**
     * @deprecated
     * @see findFirstLessOrEqual
     */
    MathKit.getLess = MathKit.findFirstLessOrEqual;
    tsCore.MathKit = MathKit;
    /**
     * @deprecated
     * @see MathKit
     */
    tsCore.Cast = MathKit;
    class SystemKit {
        /**
         * 获取移动设备的刘海屏高度
         * @example
         * 需要再html中注入css 用来获取环境值
         *
         * <style>
         *      .safe-area {
         *         padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)
         *       }
         * </style>
         */
        static get notchHeight() {
            // 获取元素
            const element = document.querySelector('.safe-area');
            let top = 0;
            if (element) {
                // 获取计算样式
                let style = window.getComputedStyle(element);
                let paddingTop = style.getPropertyValue('padding-top');
                let paddingBottom = style.getPropertyValue('padding-bottom');
                top = StringUtil.getNumbers(paddingTop) + StringUtil.getNumbers(paddingBottom);
            }
            if (top <= 0)
                top = window.innerHeight - document.documentElement.clientHeight;
            return top;
        }
        /**
         * 在启用刘海屏模式下会调用指定方法并得到刘海屏信息
         * @param value
         */
        static set onNotch(value) {
            if (Laya.Browser.onMobile && App.inst.options.isNotchEnable) {
                let cacheNotch = 0;
                let startTime = Laya.Browser.now(); // 首次执行时间
                function notchFun() {
                    const notch = SystemKit.notchHeight;
                    if (notch > 0) {
                        Log.debug(`Successfully obtained the height of the bangs = ${notch}`);
                        Laya.timer.callLater(this, getNotchEnd);
                    }
                    else {
                        if (Laya.Browser.now() - startTime > 1000 * 10) {
                            // 如果10S 还未获取到刘海屏  延迟获取间隔
                            Log.debug("After 1 seconds, the height of the bangs screen is obtained again");
                            Laya.timer.once(1000, this, notchFun);
                        }
                        else {
                            Log.debug("After 10 millisecond, the height of the bangs screen is obtained again");
                            Laya.timer.once(10, this, notchFun);
                        }
                    }
                }
                function getNotchEnd() {
                    cacheNotch = SystemKit.notchHeight;
                    Log.debug(`notchHeight2=${cacheNotch}`);
                    value(cacheNotch);
                }
                Laya.timer.callLater(this, notchFun);
            }
        }
        /**
         * 锁定屏幕常量
         */
        static wakeLock() {
            var _a;
            (_a = SystemKit._wakeLock) !== null && _a !== void 0 ? _a : (SystemKit._wakeLock = new WakeLock());
            SystemKit._wakeLock.wakeLock();
        }
        /**
         * 释放常量
         */
        static wakeUnlock() {
            var _a;
            (_a = SystemKit._wakeLock) === null || _a === void 0 ? void 0 : _a.wakeUnlock();
        }
    }
    tsCore.SystemKit = SystemKit;
    class WakeLock {
        constructor() {
            /**
             * create a reference for the wake lock
             * @type WakeLockSentinel
             */
            this._wakeLock = null;
        }
        /**
         * 锁定屏幕常量
         */
        wakeLock() {
            this.requestWakeLock().then();
        }
        /**
         * 释放常量
         */
        wakeUnlock() {
            var _a;
            (_a = this._wakeLock) === null || _a === void 0 ? void 0 : _a.release().then(() => {
                this._wakeLock = null;
                document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            });
        }
        requestWakeLock() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if ('wakeLock' in navigator) {
                    try {
                        this._wakeLock = yield ((_a = navigator.wakeLock) === null || _a === void 0 ? void 0 : _a.request('screen'));
                        this._wakeLock.onrelease = function (ev) {
                            console.log(ev);
                        };
                        this._wakeLock.addEventListener('release', (ev) => {
                            console.log(ev);
                        });
                        document.addEventListener('visibilitychange', this.handleVisibilityChange);
                    }
                    catch (err) {
                        // 如果唤醒锁定请求失败 - 通常与系统相关，例如电池
                    }
                }
            });
        }
        handleVisibilityChange() {
            if (this._wakeLock !== null && document.visibilityState === 'visible') {
                this.requestWakeLock().then();
            }
        }
    }
    let LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["ALL"] = 0] = "ALL";
        /**
         * 跟踪
         */
        LogLevel[LogLevel["TRACE"] = 100] = "TRACE";
        LogLevel[LogLevel["DEBUG"] = 200] = "DEBUG";
        LogLevel[LogLevel["INFO"] = 300] = "INFO";
        LogLevel[LogLevel["WARN"] = 400] = "WARN";
        LogLevel[LogLevel["ERROR"] = 500] = "ERROR";
        /**
         * 致命错误
         */
        LogLevel[LogLevel["FATAL"] = 600] = "FATAL";
        LogLevel[LogLevel["OFF"] = 700] = "OFF";
    })(LogLevel = tsCore.LogLevel || (tsCore.LogLevel = {}));
    /**
     * 定义日志格式
     */
    class Log {
        static trace(...value) {
            Log.append({ level: LogLevel.TRACE, data: value });
            if (Environment.active === EnvType.PROD || Log.level > LogLevel.TRACE)
                return;
            // Log._log(value)
            Laya.Browser.onLayaRuntime ? console.log(...value) : console.trace(...value);
        }
        static debug(...value) {
            Log.append({ level: LogLevel.DEBUG, data: value });
            if (Environment.active === EnvType.PROD || Log.level > LogLevel.DEBUG)
                return;
            Laya.Browser.onLayaRuntime ? console.log(...value) : console.debug(...value);
        }
        static info(...value) {
            Log.append({ level: LogLevel.INFO, data: value });
            if (Log.level > LogLevel.INFO)
                return;
            console.log(...value);
        }
        static warn(...value) {
            Log.append({ level: LogLevel.INFO, data: value });
            if (Log.level > LogLevel.WARN)
                return;
            Laya.Browser.onLayaRuntime ? console.log(...value) : console.warn(...value);
        }
        /**
         * 错误
         * @param value
         */
        static error(...value) {
            Log.append({ level: LogLevel.ERROR, data: value });
            if (Log.level > LogLevel.ERROR)
                return;
            Laya.Browser.onLayaRuntime ? console.log(...value) : console.error(...value);
        }
        /**
         * 致命的错误
         * @param value
         */
        static fatal(...value) {
            Log.append({ level: LogLevel.FATAL, data: value });
            if (Log.level > LogLevel.FATAL)
                return;
            Laya.Browser.onLayaRuntime ? console.log(...value) : console.error(...value);
        }
        /**
         * @internal
         */
        static log(fmt = "[HH:mm:ss]") {
            const logs = [...Log.history];
            let time;
            for (const value of logs) {
                time = [DateUtils.formatDate(value.time, fmt), LogLevel[value.level]];
                console.log.apply(window, time.concat(value.data));
            }
        }
        /**
         * @internal
         */
        static append(data) {
            var _a;
            if (Laya.Render.isConchApp)
                return;
            (_a = data.time) !== null && _a !== void 0 ? _a : (data.time = Date.now());
            Log.history.push(data);
            if (Log.history.length > Log.MAX_HISTORY + 500) {
                Log.history.splice(0, 500);
            }
        }
    }
    /**
     * @default LogLevel.ALL
     */
    Log.level = LogLevel.ALL;
    /**
     * 最大保存日志条数
     * @default 1000
     */
    Log.MAX_HISTORY = 1000;
    Log.history = [];
    tsCore.Log = Log;
    /**
     * app 访问记录管理
     * @author boge
     */
    class HistoryManager {
        /**
         * 添加一个记录
         * @param currentPage 当前的面板
         * @param newPage 添加的新面板
         */
        static addHistory(currentPage, newPage) {
            Log.debug("history add currentPage and newPage", currentPage, newPage);
            HistoryManager.history.push({ current: currentPage, newPage: newPage });
        }
        /**
         * 作废指定的记录
         * @param value 记录页面
         *
         */
        static invalidHistory(value) {
            var _a;
            Log.debug("history invalidHistory value", value);
            if (HistoryManager.history.length > 0) {
                for (let i = 0; i < HistoryManager.history.length; i++) {
                    if (((_a = HistoryManager.history[i]) === null || _a === void 0 ? void 0 : _a.newPage) == value) {
                        HistoryManager.history.splice(i, 1);
                        break;
                    }
                }
            }
        }
        /**
         * 返回操作
         * @param isBack 是否用的返回键（非项目内的）
         *
         */
        static backHistory(isBack = false) {
            Log.debug(`history backHistory isBack=${isBack}`);
            HistoryManager.back(isBack);
        }
        /** 执行非大厅后退 */
        static back(isBack = false) {
            var _a, _b;
            Log.debug(`history back isBack=${isBack}`);
            // 取出最后一个页面关闭
            let array = HistoryManager.history.pop();
            // 新页面隐藏
            (_a = array === null || array === void 0 ? void 0 : array.newPage) === null || _a === void 0 ? void 0 : _a.hideRecord();
            // 显示切换页
            (_b = array === null || array === void 0 ? void 0 : array.current) === null || _b === void 0 ? void 0 : _b.showRecord();
            if (isBack) {
                // 键盘返回
                if (!Laya.Browser.onLayaRuntime)
                    HistoryManager.addNewHistory();
            }
            else {
            }
        }
        /**
         * 长度
         * @return
         */
        static len() {
            return HistoryManager.history.length;
        }
        /** 清理所有页面缓存 */
        static clearHistory() {
            Log.debug("clearHistory");
            //		for (let i = 0; i < history.length; i++) {
            //			let historyElement:IRecord = history[i]
            //			historyElement.hideRecord()
            //		}
            HistoryManager.history.splice(0, HistoryManager.history.length);
        }
        static init() {
            if (!App.enableHistory)
                return;
            if (!Laya.Browser.onLayaRuntime) {
                HistoryManager.initCreateHistory && HistoryManager.addNewHistory();
                Log.debug("history add event Listener");
                if (HistoryManager.historyManager.call) {
                    HistoryManager.historyManager.call.call(null, HistoryManager.nativeBack);
                }
                else
                    window.addEventListener("popstate", HistoryManager.nativeBack, false);
            }
        }
        static nativeBack() {
            HistoryManager.backHistory(true);
        }
        /** 添加新的记录 */
        static addNewHistory() {
            if (!App.enableHistory)
                return;
            HistoryManager.pushHistory("title", "#");
        }
        /** 添加历史记录 */
        static pushHistory(title, url) {
            if (!App.enableHistory)
                return;
            Log.debug(`history push state title=${title} url=${url}`);
            const state = { title: title, url: url };
            HistoryManager.historyManager.history.pushState(state, title, url);
        }
    }
    /**
     * 访问记录
     */
    HistoryManager.history = [];
    /** 暂停返回上一页 */
    HistoryManager.pauseHistory = false;
    /** 初始化是否创建一个历史页 默认 true */
    HistoryManager.initCreateHistory = true;
    HistoryManager.historyManager = { history: window.history, call: null };
    tsCore.HistoryManager = HistoryManager;
    /**
     * 网络请求
     * 封装的 XMLHttpRequest 类
     */
    class AjaxRequest extends Laya.HttpRequest {
        /**
         * 创建一个请求
         */
        constructor() {
            super();
            this.once(Laya.Event.COMPLETE, this, this.onResult);
            this.once(Laya.Event.ERROR, this, this.onHttpError);
            this.http.ontimeout = this.timeOut.bind(this);
        }
        onComplete(value) {
            this.completeHandler = value;
        }
        onTimerOut(value) {
            this.timerOutHandler = value;
        }
        onError(value) {
            this.errorHandler = value;
        }
        /**
         * 请求在自动终止之前可能需要的毫秒数。<br>
         * 值为 0，表示没有超时。
         * @default 0
         */
        setOvertime(value = 0) {
            this.http.timeout = value;
        }
        /*@override*/
        send(url, data, method, responseType, headers) {
            // super.send(url, data, method, responseType, headers)
            this._responseType = responseType;
            this._data = null;
            if (Laya.Browser.onVVMiniGame || Laya.Browser.onQGMiniGame || Laya.Browser.onQQMiniGame || Laya.Browser.onAlipayMiniGame || Laya.Browser.onBLMiniGame || Laya.Browser.onHWMiniGame || Laya.Browser.onTTMiniGame || Laya.Browser.onTBMiniGame) {
                // @ts-ignore
                url = Laya.HttpRequest._urlEncode(url);
            }
            this._url = url;
            var http = this._http;
            //临时，因为微信不支持以下文件格式
            http.open(method, url, this.async || true);
            let isJson = false;
            if (headers) {
                for (let i = 0; i < headers.length; i++) {
                    http.setRequestHeader(headers[i++], headers[i]);
                }
            }
            else if (!(window.conch)) {
                if (!data || typeof (data) == 'string')
                    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                else {
                    http.setRequestHeader("Content-Type", "application/json");
                    if (!(data instanceof ArrayBuffer) && typeof data !== "string") {
                        isJson = true;
                    }
                }
            }
            let restype = responseType !== "arraybuffer" ? "text" : "arraybuffer";
            http.responseType = restype;
            if (http.dataType) { //for Ali
                http.dataType = restype;
            }
            http.onerror = (e) => {
                this._onError(e);
            };
            http.onabort = (e) => {
                this._onAbort(e);
            };
            http.onprogress = (e) => {
                this._onProgress(e);
            };
            http.onload = (e) => {
                this._onLoad(e);
            };
            if (Laya.Browser.onBLMiniGame && Laya.Browser.onAndroid && !data)
                data = {};
            http.send(isJson ? JSON.stringify(data) : data);
        }
        onHttpError(obj) {
            runFun(this.errorHandler, obj);
            this.clearEvent();
        }
        /** 请求返回结果数据 */
        onResult(json) {
            runFun(this.completeHandler, json);
            this.clearEvent();
        }
        timeOut() {
            this.offAll(Laya.Event.COMPLETE);
            this.offAll(Laya.Event.ERROR);
            this.clear();
            runFun(this.timerOutHandler);
            this.clearEvent();
        }
        /**
         * 终止请求
         */
        abort() {
            this.clearEvent();
            this.clear();
            this.offAll(Laya.Event.COMPLETE);
            this.offAll(Laya.Event.ERROR);
        }
        /** 清除处理器 */
        clearHandler(...handler) {
            for (const value of handler) {
                if (value instanceof Laya.Handler)
                    value.recover();
            }
        }
        clearEvent() {
            this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler);
            this.errorHandler = this.completeHandler = this.timerOutHandler = null;
        }
        /*@override*/
        get http() {
            return super.http;
        }
    }
    tsCore.AjaxRequest = AjaxRequest;
    class SocketClient extends Laya.EventDispatcher {
        /**
         * 创建一个socket
         * @param options 参数 url 连接地址 notify 回调方法 auth 认证
         */
        constructor(options) {
            super();
            this.MAX_CONNECT_TIME = 10;
            this.DELAY = 15000;
            this.alive = true;
            this.options = options;
            this.createConnect();
        }
        createConnect() {
            if (this.MAX_CONNECT_TIME <= 0) {
                return;
            }
            this.connect();
        }
        connect() {
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
                this.socket = NativeUtils.PlatformClass.createClass(SocketClient.SOCKET_CLASS_PATH).newObject();
                this.socket.call("connect", this.options.url);
            }
            else {
                this.socket = new Laya.Socket();
                this.socket.disableInput = true;
                this.auth = false;
                this.socket.on(Laya.Event.OPEN, this, this.openHandler);
                this.socket.on(Laya.Event.ERROR, this, this.errorHandler);
                this.socket.on(Laya.Event.MESSAGE, this, this.messageHandler);
                this.socket.on(Laya.Event.CLOSE, this, this.closeHandler);
                this.socket.connectByUrl(this.options.url);
            }
        }
        closeHandler(msg) {
            if (typeof msg !== "string") {
                msg = msg.data;
            }
            Log.debug("GameSocket.closeHandler()", msg);
            Laya.timer.clear(this, this.heartbeat);
            Laya.timer.once(this.DELAY, this, this.reConnect);
        }
        messageHandler(evt) {
            //		    AppManager.log(evt)
            try {
                if (typeof evt == "string") {
                    evt = JSON.parse(evt);
                }
                // app 端的socket 发送过来的数据会被data 包裹
                if (evt.data) {
                    evt = evt.data;
                }
                for (let i = 0; i < evt.length; i++) {
                    let data = evt[i];
                    if (data.op == 8) {
                        this.auth = true;
                        this.heartbeat();
                        Laya.timer.loop(4 * 60 * 1000, this, this.heartbeat);
                    }
                    if (!this.auth) {
                        Laya.timer.once(this.DELAY, this, this.getAuth);
                    }
                    if (this.auth && data.op == 5) {
                        let notify = this.options.notify;
                        if (notify)
                            notify(data.body);
                    }
                }
            }
            catch (e) {
                Log.error("error socket data", e + ' *** ' + evt);
            }
        }
        errorHandler(e) {
            if (typeof e !== "string") {
                e = e.data;
            }
            Log.debug("GameSocket.errorHandler() " + e);
            Laya.timer.clear(this, this.heartbeat);
            Laya.timer.once(this.DELAY, this, this.reConnect);
        }
        openHandler() {
            Log.debug("GameSocket.openHandler()");
            this.getAuth();
            this.event(Laya.Event.OPEN);
        }
        reConnect() {
            --this.MAX_CONNECT_TIME;
            this.DELAY *= 2;
            if (this.alive)
                this.createConnect();
        }
        heartbeat() {
            this.send({
                'ver': 1,
                'op': 2,
                'seq': 2,
                'body': {}
            });
        }
        getAuth() {
            this.send({
                'ver': 1,
                'op': 7,
                'seq': 1,
                'body': this.options.auth
            });
        }
        send(data) {
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
                this.socket.call("send", JSON.stringify(data));
            }
            else {
                this.socket.send(JSON.stringify(data));
            }
        }
        close() {
            this.MAX_CONNECT_TIME = 0;
            if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
                this.socket.call("close");
            }
            else {
                this.socket.close();
            }
        }
    }
    SocketClient.SOCKET_CLASS_PATH = null;
    tsCore.SocketClient = SocketClient;
    class Path {
        constructor(base, ...subpaths) {
            this.path = base;
            subpaths.forEach((value) => {
                if (value.startsWith("/")) {
                    this.path += value;
                }
                else
                    this.path += `/${value}`;
            });
        }
        /**
         * 格式化路径
         * ```
         * 1.当ELoader.isWebp为true的时候，自动将后缀为png/jpg的路径 添加.webp
         * 2.在未使用加速器的环境中，将启用version控制 会自动在url后面添加版本号
         * 3.执行顺序是先执行全路径格式 path()方法，在执行version()版本号方法，最后兼容执行call()方法。
         * ```
         * @param url 要格式化的路径
         * @return 格式化后可直接使用的路径
         */
        static formatUrl(url) {
            var _a, _b, _c, _d, _e, _f;
            url = url.split("?")[0];
            let version = Laya.URL.version[url];
            Path.formatPath.sort((a, b) => a.order - a.order);
            for (const format of Path.formatPath) {
                url = (_b = (_a = format.path) === null || _a === void 0 ? void 0 : _a.call(format, url)) !== null && _b !== void 0 ? _b : url;
                version = (_d = (_c = format.version) === null || _c === void 0 ? void 0 : _c.call(format, url, version)) !== null && _d !== void 0 ? _d : version;
                version = (_f = (_e = format.call) === null || _e === void 0 ? void 0 : _e.call(format, url, version)) !== null && _f !== void 0 ? _f : version;
            }
            if (ELoader.isWebp && url.endsWithAny("png", "jpg"))
                url += ".webp";
            if (!Laya.Browser.onLayaRuntime && version)
                url = `${url}?v=${version}`;
            return url;
        }
        static of(base, ...subpaths) {
            return new Path(base, ...subpaths);
        }
        string() {
            return this.path;
        }
    }
    /** 路径格式化 */
    Path.formatPath = [];
    tsCore.Path = Path;
    class Range {
        /**
         * 构造函数
         * @param start 范围的起始值
         * @param endInclusive 范围的结束值（包含）
         */
        constructor(start, endInclusive) {
            this.start = start;
            this.endInclusive = endInclusive;
        }
        /**
         * 判断给定值是否在范围内
         * @param value 给定值
         * @returns 如果在范围内返回true，否则返回false
         */
        contains(value) {
            return this.start <= value && value <= this.endInclusive;
        }
        /**
         * 判断范围是否为空
         * @returns 如果为空返回true，否则返回false
         */
        isEmpty() {
            return this.start > this.endInclusive;
        }
        /**
         * 将范围转换为数组
         * @returns 范围对应的数组
         */
        toArray() {
            const arr = [];
            for (let i = this.start; i <= this.endInclusive; i++) {
                arr[arr.length] = i;
            }
            return arr;
        }
    }
    /**
     * 空范围
     */
    Range.EMPTY = new Range(1, 0);
    tsCore.Range = Range;
    class NativeUtils {
    }
    /**@private Market对象 只有加速器模式下才有值*/
    NativeUtils.conchMarket = window["conch"] ? window["conchMarket"] : null;
    /**@private PlatformClass类，只有加速器模式下才有值 */
    NativeUtils.PlatformClass = window["PlatformClass"];
    tsCore.NativeUtils = NativeUtils;
    class DateUtils {
        /**
         * 格式化时间
         * @param date 时间
         * @param fmt 格式
         * @param isUTC 使用国际时间
         * @example
         * fmt:
         * yyyy：年
         * MM：月
         * dd：
         * hh：1~12小时制(1-12)
         * HH：24小时制(0-23)
         * mm：分
         * ss：秒
         * S：毫秒
         * E：星期几
         * @return
         */
        static formatDate(date, fmt, isUTC = false) {
            if (!(date instanceof Date)) {
                let date2 = new Date();
                date2.setTime(date);
                date = date2;
            }
            // 时区
            //		var localOffset:number = date.getTimezoneOffset() * 60000
            //		Log.debug(localOffset)
            let tempStr = "";
            let match = fmt.match(/(y+)/);
            if ((match === null || match === void 0 ? void 0 : match.length) > 0) {
                tempStr = match[0];
                if (isUTC) {
                    fmt = fmt.replace(tempStr, (date.getUTCFullYear() + '').substring(4 - tempStr.length));
                }
                else {
                    fmt = fmt.replace(tempStr, (date.getFullYear() + '').substring(4 - tempStr.length));
                }
            }
            let o = {
                'M+': (isUTC ? date.getUTCMonth() : date.getMonth()) + 1,
                'd+': (isUTC ? date.getUTCDate() : date.getDate()),
                'h+': ((isUTC ? date.getUTCHours() : date.getHours()) % 12),
                'H+': (isUTC ? date.getUTCHours() : date.getHours()),
                'm+': (isUTC ? date.getUTCMinutes() : date.getMinutes()),
                's+': (isUTC ? date.getUTCSeconds() : date.getSeconds()),
                'S+': (isUTC ? date.getUTCMilliseconds() : date.getMilliseconds()),
                "E+": DateUtils.weekday[(isUTC ? date.getUTCDay() : date.getDay())]
            };
            //		Log.debug(o)
            // 遍历这个对象
            for (let k in o) {
                match = fmt.match(new RegExp("(" + k + ")"));
                if ((match === null || match === void 0 ? void 0 : match.length) > 0) {
                    //				 Log.debug('${k}')
                    tempStr = match[0];
                    fmt = fmt.replace(tempStr, tempStr.length == 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length));
                }
            }
            return fmt;
        }
        /**
         * 比较时间大小
         * time1>time2 return 1
         * time1<time2 return -1
         * time1==time2 return 0
         * @param time1
         * @param time2
         */
        static compareTime(time1, time2) {
            if (Date.parse(time1.replace(/-/g, "/")) > Date.parse(time2.replace(/-/g, "/"))) {
                return 1;
            }
            else if (Date.parse(time1.replace(/-/g, "/")) < Date.parse(time2.replace(/-/g, "/"))) {
                return -1;
            }
            else if (Date.parse(time1.replace(/-/g, "/")) == Date.parse(time2.replace(/-/g, "/"))) {
                return 0;
            }
        }
        /**
         * 是否闰年
         * @param year 年份
         */
        static isLeapYear(year) {
            return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
        }
        /**
         * 获取某个月的天数，从0开始
         * @param year 年份
         * @param month 月份
         */
        static getDaysOfMonth(year, month) {
            return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        }
        /**
         * 将天置为0，获取其上个月的最后一天
         * @param year 年份 如 1992
         * @param monthIndex 月份索引 0开始
         */
        static getDaysOfMonth2(year, monthIndex) {
            let date = new Date(year, monthIndex + 1, 0);
            return date.getDate();
        }
        /**
         * 距离现在几天的日期：
         * @param days 负数表示今天之前的日期，0表示今天，整数表示未来的日期。 如-1表示昨天的日期，0表示今天，2表示后天
         */
        static fromToday(days) {
            let today = new Date();
            today.setDate(today.getDate() + days);
            return today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        }
        /**
         * 计算一个日期是当年的第几天
         * @param date ms | 2023-09-01 12:00:00 | Date
         */
        static dayOfTheYear(date) {
            let obj = new Date(date);
            let year = obj.getFullYear();
            let month = obj.getMonth(); //从0开始
            let days = obj.getDate();
            let daysArr = [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            for (let i = 0; i < month; i++) {
                days += daysArr[i];
            }
            return days;
        }
        /**
         * 获得时区名和值
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static getZoneNameValue(time) {
            let date = new Date(time);
            date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            let arr = date.toString().match(/([A-Z]+)([-+]\d+:?\d+)/);
            return { 'name': arr[1], 'value': arr[2] };
        }
        /**
         * 判断是否是同一天
         * @param date1 ms | 2023-09-01 12:00:00 | Date
         * @param date2 ms | 2023-09-01 12:00:00 | Date
         * @return
         */
        static isSameDay(date1, date2) {
            let _date1 = new Date(date1);
            let _date2 = new Date(date2);
            return (_date1.getFullYear() == _date2.getFullYear() &&
                _date1.getMonth() == _date2.getMonth() &&
                _date1.getDate() == _date2.getDate());
        }
        /**
         * 判断传入的时间小于今天
         * @param time ms | 2023-09-01 12:00:00 | Date
         */
        static notTomorrow(time) {
            let timeDate = new Date(time);
            let today = new Date();
            if (timeDate.getFullYear() < today.getFullYear()) {
                return true;
            }
            else if (timeDate.getFullYear() == today.getFullYear()) { // 年份一样
                if (timeDate.getMonth() < today.getMonth()) { // 小于今天的月份
                    return true;
                }
                else if (timeDate.getMonth() == today.getMonth()) { // 月份一样
                    if (timeDate.getDate() < today.getDate()) { // 日期小于今天
                        return true;
                    }
                }
            }
            return false;
        }
        /**
         * 获取距离传入的时间还剩的时间
         *
         * @example
         *  const targetDate = new Date('2023-09-01 12:00:00')
         *  const timeDifference = calculateTimeDifference(targetDate)
         *  console.log(timeDifference)
         *
         *  是timeDifference 总时间差 毫秒
         * @param time ms | Date
         */
        static calculateTimeDifference(time) {
            if (time instanceof Date)
                time = time.getTime();
            // 计算时间差（毫秒）
            const diff = time - Date.now();
            return DateUtils.calculateTimeByMillisecond(diff);
        }
        /**
         * 根据剩余毫秒 计算具体时间
         * @param time
         */
        static calculateTimeByMillisecond(time) {
            // 如果diff已经是负数，意味着时间已经过去，这里假设我们只处理未来的时间
            if (time <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            // 计算剩余的天数、小时数、分钟数和秒数
            const days = Math.floor(time / (1000 * 60 * 60 * 24));
            const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((time % (1000 * 60)) / 1000);
            return { days, hours, minutes, seconds, timeDifference: time };
        }
    }
    /** 星期 默认英文 */
    DateUtils.weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    tsCore.DateUtils = DateUtils;
    class HTTPUtils {
        constructor() {
            /**
             * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
             * @default null
             */
            this.method = null;
            /**
             * (default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
             */
            this.responseType = HTTPUtils.defaultResponseType;
            this.async = true;
            this.ghr = new AjaxRequest();
        }
        /**
         * 创建新的http请求
         */
        static create() {
            const http = new HTTPUtils();
            HTTPUtils.https.push(http);
            return http;
        }
        /**
         * 清除所有正在执行的请求已经监听方法
         */
        static clear(http) {
            if (http) {
                const index = HTTPUtils.https.findIndex((value) => value === http);
                HTTPUtils.https.splice(index, 1);
                return;
            }
            if (HTTPUtils.https.length < 1)
                return;
            const runs = [...HTTPUtils.https];
            HTTPUtils.https.length = 0;
            for (const http of runs)
                http.abort();
        }
        setUrl(url) {
            this.url = url;
            return this;
        }
        setData(data) {
            this.data = data;
            return this;
        }
        setMethod(data) {
            this.method = data;
            return this;
        }
        setAsync(async) {
            this.async = async;
            return this;
        }
        setResponseType(data) {
            this.responseType = data;
            return this;
        }
        setHeaders(array) {
            this.headers = array;
            return this;
        }
        /**
         * 请求在自动终止之前可能需要的毫秒数。<br>
         * 值为 0，表示没有超时。
         * @default 0
         */
        setOvertime(value) {
            this.ghr.setOvertime(value);
            return this;
        }
        onFinally(handler) {
            this.finally = handler;
            return this;
        }
        onComplete(handler) {
            this.complete = handler;
            return this;
        }
        onError(handler) {
            this.error = handler;
            return this;
        }
        onTimeout(handler) {
            this.timeout = handler;
            return this;
        }
        onEvent(complete, error, finallyFun) {
            this.complete = complete;
            this.error = error;
            this.finally = finallyFun;
            return this;
        }
        /**
         *
         */
        call() {
            var _a, _b, _c, _d;
            let onComplete = (_a = this.completeHandler) === null || _a === void 0 ? void 0 : _a.bind(this);
            let onError = (_b = this.errorHandler) === null || _b === void 0 ? void 0 : _b.bind(this);
            let onTimeOut = (_c = this.timeOutHandler) === null || _c === void 0 ? void 0 : _c.bind(this);
            // 判断是否需要拦截发送
            if ((_d = HTTPUtils.filter) === null || _d === void 0 ? void 0 : _d.interceptSend(this.url, this.data, onComplete, onError, onTimeOut, this.http))
                return;
            // 判断是否有解析数据格式
            let value = this.data;
            HTTPUtils.filter && (value = HTTPUtils.filter.filterSendData(this.url, this.data));
            this.ghr.async = this.async;
            this.ghr.onComplete(onComplete);
            this.ghr.onError(onError);
            this.ghr.onTimerOut(onTimeOut);
            if (!this.method) {
                if (!value) {
                    this.method = Method.GET;
                }
                else {
                    this.method = Method.POST;
                }
            }
            this.ghr.send(this.url, value, this.method, this.responseType, this.headers);
        }
        timeOutHandler() {
            var _a;
            Log.debug("HTTPUtils.timeOutHandler()");
            (_a = HTTPUtils.filter) === null || _a === void 0 ? void 0 : _a.timeout(this.http);
            if (this.timeout)
                runFun(this.timeout);
            else if (this.error)
                runFun(this.error, "time out");
            runFun(this.finally);
            HTTPUtils.clear(this);
        }
        errorHandler(e) {
            var _a;
            Log.debug("HTTPUtils.errorHandler()", e);
            (_a = HTTPUtils.filter) === null || _a === void 0 ? void 0 : _a.errorResult(e, this.http);
            runFun(this.error, e);
            runFun(this.finally);
            HTTPUtils.clear(this);
        }
        completeHandler(data) {
            if (!data) {
                this.errorHandler(data);
                return;
            }
            HTTPUtils.parseDate(data);
            HTTPUtils.filter && (data = HTTPUtils.filter.filterResultData(this.url, data, this.http));
            if (typeof data === "number") { // 如果是数字 将被阻止返回结果
                Log.info(data);
                return;
            }
            runFun(this.complete, data);
            runFun(this.finally);
            HTTPUtils.clear(this);
        }
        /**
         * 终止请求
         */
        abort() {
            this.ghr.abort();
        }
        get http() {
            return this.ghr;
        }
        getHttp() {
            return this.http;
        }
        /** 解析时间 */
        static parseDate(data) {
            var _a, _b;
            let serverTime = (_b = (_a = HTTPUtils.filter) === null || _a === void 0 ? void 0 : _a.parseData(data)) !== null && _b !== void 0 ? _b : 0;
            this.castDifference(serverTime);
        }
        static castDifference(serverTime) {
            if (!isNaN(serverTime) && serverTime > 0) {
                //		    trace("HTTPUtils.parseDate(data)",
                //			Cast.timerFrom(serverTime),
                //			Cast.timerFrom(parseInt((Browser.now()/1000)+"")))
                HTTPUtils.difference = Laya.Browser.now() - serverTime;
            }
        }
        /** 获取差值 */
        static getDifference() {
            return HTTPUtils.difference;
        }
        /** 当前时间  毫秒 */
        static getTimer() {
            return (Laya.Browser.now() - HTTPUtils.difference);
        }
        /** 当前时间  秒 */
        static getTimerSecond() {
            return Math.floor((Laya.Browser.now() - HTTPUtils.difference) / 1000);
        }
        /** 解析json数据格式 */
        static parseJson(data) {
            if (!data)
                return null;
            if (typeof data === "string")
                return data;
            let value;
            let v;
            for (let key in data) {
                v = data[key];
                if (!value) {
                    value = key + "=" + v;
                }
                else {
                    value += "&" + key + "=" + v;
                }
            }
            return value;
        }
    }
    HTTPUtils.defaultResponseType = "text";
    /** 检查服务器时间间隔 */
    HTTPUtils.checkTimer = 1000 * 60;
    /** 差值 */
    HTTPUtils.difference = 0;
    HTTPUtils.https = [];
    tsCore.HTTPUtils = HTTPUtils;
    class LanguageUtils {
        constructor() {
            /**
             * 忽略大小写
             * @default true
             */
            this.ignoreCase = true;
            /**
             * 替换文案map
             */
            this.replaces = {};
        }
        static get inst() {
            var _a;
            (_a = LanguageUtils._instance) !== null && _a !== void 0 ? _a : (LanguageUtils._instance = new LanguageUtils());
            return LanguageUtils._instance;
        }
        setXml(xml) {
            this.xml = xml;
        }
        /**
         * 返回对应的语言
         * @see LibStr
         * @param str key
         */
        getStr(str) {
            var _a;
            if (typeof (str) == "number") {
                str = str + "";
            }
            const element = this.getElement(str);
            return (_a = this.__getStr(element)) !== null && _a !== void 0 ? _a : str;
        }
        getStrArray(str, out) {
            if (typeof (str) == "number") {
                str = str + "";
            }
            out !== null && out !== void 0 ? out : (out = []);
            const element = this.getElement(str);
            if ((element === null || element === void 0 ? void 0 : element.nodeName) == "array") {
                element.childNodes.forEach(value => {
                    if (value instanceof Element) {
                        out.push(this.__getStr(value));
                    }
                });
            }
            return out;
        }
        getElement(str) {
            if (this.xml) {
                let element = this.xml.getElementById(str);
                if (element) {
                    return element;
                }
                let elements = this.xml.getElementsByName(str);
                if (elements.length > 0) {
                    if (elements.length > 1)
                        throw new Error("Language configuration has duplicate items：" + str);
                    return elements.item(0);
                }
                else if (this.ignoreCase) {
                    const els = this.getElementsByNameIgnoreCase(this.xml.documentElement, str);
                    if (els.length > 0) {
                        return els[0];
                    }
                }
            }
            return null;
        }
        __getStr(element) {
            let content = element.textContent;
            if (this.customConvert)
                content = runFun(this.customConvert, content);
            return this.replaceLang(content);
        }
        /**
         * 使用预置的 LanguageUtils.replaces 替换文本内容
         * @param text
         *
         * @see LanguageUtils.replaces
         */
        replaceLang(text) {
            for (const key in this.replaces) {
                text = text.replace(new RegExp(`\\{${key}}`, "g"), this.replaces[key]);
            }
            return text;
        }
        /**
         * 获取忽略大小写的文案
         * @param node
         * @param name
         */
        getElementsByNameIgnoreCase(node, name) {
            var _a;
            if (!node || !name) {
                return [];
            }
            let result = [];
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                const nodeName = (_a = element.getAttribute("name")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (nodeName === name.toLowerCase()) {
                    result.push(node);
                }
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i];
                if (childNode.nodeType == Node.ELEMENT_NODE) {
                    const childResult = this.getElementsByNameIgnoreCase(childNode, name);
                    result = result.concat(childResult);
                }
            }
            return result;
        }
    }
    tsCore.LanguageUtils = LanguageUtils;
    /**
     * 数字变动动画
     */
    class NumberTween {
        constructor() {
            this.value = 0;
        }
        /**
         * 创建一个动画
         * @param target 缓动动画绑定类  用于执行清楚动画
         * @param start 开始值
         * @param end 结束值
         * @param duration 执行时长
         * @param ease 执行缓动动画
         * @param complete 执行完成
         * @param update 执行更新
         * @param delay 延迟执行
         */
        static createTween(target, start = 0, end = 0, duration = 300, ease = null, complete, update, delay = 0) {
            if (start == end) {
                runFun(update, end);
                runFun(complete);
                return;
            }
            let numberTween = Laya.Pool.getItemByClass(this.NAME, NumberTween);
            numberTween.value = start;
            numberTween.target = target;
            numberTween.complete = complete;
            numberTween.update = update;
            numberTween.gid = this.getGID();
            numberTween.tween = Laya.Tween.to(numberTween, { value: end, update: new Laya.Handler(numberTween, numberTween.updateHandler) }, duration, ease, Laya.Handler.create(numberTween, numberTween.completeHandler), delay);
            this.nums.push(numberTween);
        }
        /**
         * 清理并销毁指定的动画
         * @param target 绑定的执行对象
         */
        static clearTween(target) {
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    numberTween.dispose();
                }
            }
        }
        /**
         * 提前完成动画
         * @param target 要提前完成动画的对象
         */
        static completeTween(target) {
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    // let complete = numberTween.complete
                    numberTween.completeTween();
                    // complete?.run()
                }
            }
        }
        /**
         * 获取指定对象监听的所有动画
         * @param target 动画对象
         */
        static getTween(target) {
            let tween = [];
            for (let i = 0; i < this.nums.length; i++) {
                let numberTween = this.nums[i];
                if (numberTween.target == target) {
                    tween.push(numberTween);
                }
            }
            return tween;
        }
        static getGID() {
            return this._gid++;
        }
        updateHandler() {
            runFun(this.update, this.value);
        }
        completeHandler() {
            this.removeTween(this.gid);
            runFun(this.complete);
            Laya.Pool.recover(NumberTween.NAME, this);
        }
        /** 直接完成动画 */
        completeTween() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.complete();
            this.tween = null;
        }
        /**
         * 销毁 并清理动画
         */
        dispose() {
            this.update = null;
            this.complete = null;
            this.tween = null;
            Laya.Tween.clearAll(this);
            this.removeTween(this.gid);
            Laya.Pool.recover(NumberTween.NAME, this);
        }
        /**
         * 根据动画id删除一个缓动动画
         * @param gid 动画id
         */
        removeTween(gid) {
            for (let i = 0; i < NumberTween.nums.length; i++) {
                let numberTween = NumberTween.nums[i];
                if (numberTween.gid == gid) {
                    NumberTween.nums.splice(i, 1);
                    break;
                }
            }
        }
    }
    NumberTween.NAME = "NumberTween";
    NumberTween.nums = [];
    NumberTween._gid = 0;
    tsCore.NumberTween = NumberTween;
    class SoundUtils {
        /**
         * 添加需要使用 SoundUtils.load() 加载的资源文件
         * @param res
         * @see SoundUtils.load
         */
        static addRes(res) {
            Laya.SoundManager.autoReleaseSound = false;
            SoundUtils.loadAsset = Array.isArray(res) ? res : [res];
        }
        /**
         * 执行加载音频文件
         * @param url 加载文件地址  默认使用 SoundUtils.loadAsset
         * @see SoundUtils.loadAsset
         */
        static load(url) {
            Laya.loader.load(url !== null && url !== void 0 ? url : SoundUtils.loadAsset, Laya.Handler.create(null, SoundUtils.onLoader));
        }
        static onLoader() {
            for (let i = 0; i < SoundUtils.autoPlay.length; i++) {
                let url = SoundUtils.autoPlay[i];
                if (SoundUtils.autoPlayUrl == url) {
                    SoundUtils.playMusic(url, SoundUtils.bgMusicLoop, SoundUtils.bgComplete, SoundUtils.bgVolume, SoundUtils.bgStartTime);
                    Log.info("auto play = " + url);
                    SoundUtils.autoPlayUrl = null;
                }
            }
            SoundUtils.autoPlay.length = 0;
        }
        /**
         *
         * @param url 声音文件地址
         * @param [loops=0] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=-1] 音量范围从 0（静音）至 1（最大音量）。 -1表示不调整
         * @param [startTime=0] 声音播放起始时间 单位秒
         * @param [coverBefore=false] 地址相同，是否覆盖正在播放的音乐
         */
        static playMusic(url, loops = 0, complete, volume = -1, startTime = 0, coverBefore = false) {
            if (Laya.SoundManager["_bgMusic"] == Laya.URL.formatURL(url) && Laya.SoundManager["_musicChannel"] && !coverBefore) {
                if (Laya.SoundManager["_musicChannel"].isStopped) {
                    Laya.SoundManager["_musicChannel"].resume();
                    return Laya.SoundManager["_musicChannel"];
                }
                return null;
            }
            let sound = Laya.loader.getRes(url);
            SoundUtils.bgMusicLoop = loops;
            SoundUtils.bgVolume = volume;
            SoundUtils.bgComplete = complete;
            SoundUtils.bgStartTime = startTime;
            if (sound) {
                let channel = Laya.SoundManager.playMusic(url, loops, (loops > 0 && complete) ? Laya.Handler.create(this, this.onPlayMusicEnd, [complete]) : null, startTime);
                if (!channel)
                    return null;
                if (volume > -1)
                    channel.volume = volume;
                return channel;
            }
            else {
                Log.info("sound not load " + url);
                this.autoPlayUrl = url;
                if (SoundUtils.autoPlay.indexOf(url) == -1)
                    SoundUtils.autoPlay.push(url);
                const index = SoundUtils.loadAsset.findIndex(function (value) {
                    return value.url == url;
                });
                if (index < 0) {
                    SoundUtils.load(url);
                }
            }
            return null;
        }
        static onPlayMusicEnd(complete) {
            Laya.SoundManager["_bgMusic"] = null;
            complete === null || complete === void 0 ? void 0 : complete.run();
        }
        /**
         *
         * @param url 声音文件地址。
         * @param [loops=1] 循环次数,0表示无限循环
         * @param complete 声音播放完成回调 Handler对象。
         * @param [volume=1] 音量范围从 0（静音）至 1（最大音量）。
         * @param [startTime=0] 声音播放起始时间。 单位秒
         */
        static playSound(url, loops = 1, complete, volume = 1, startTime = 0) {
            let sound = Laya.loader.getRes(url);
            if (sound) {
                let channel = Laya.SoundManager.playSound(url, loops, complete, null, startTime);
                if (!channel)
                    return null;
                if (volume > -1)
                    channel.volume = volume;
                return channel;
            }
            else {
                let index = SoundUtils.loadAsset.findIndex(function (value) {
                    return value.url == url;
                });
                if (index < 0) {
                    SoundUtils.load(url);
                }
                Log.info("sound not load " + url);
            }
            return null;
        }
        static clear() {
            SoundUtils.autoPlay.length = 0;
            while (SoundUtils.loadAsset.length > 0) {
                let loadRes = SoundUtils.loadAsset.shift();
                Laya.loader.cancelLoadByUrl(loadRes.url);
                Laya.SoundManager.destroySound(loadRes.url);
            }
            Log.info("clear sound");
            SoundUtils.loadAsset.length = 0;
        }
        static stopSound(url) {
            Laya.SoundManager.stopSound(url);
        }
        /**
         * 停止播放所有音效（不包括背景音乐）。
         */
        static stopAllSound() {
            Laya.SoundManager.stopAllSound();
        }
        /**
         * 停止播放所有声音（包括背景音乐和音效）。
         */
        static stopAll() {
            Laya.SoundManager.stopAll();
        }
        /**
         * 停止播放背景音乐（不包括音效）。
         */
        static stopMusic() {
            Laya.SoundManager.stopMusic();
        }
    }
    /** 需要立即播放的 */
    SoundUtils.autoPlay = [];
    /** 需要使用load加载的资源 */
    SoundUtils.loadAsset = [];
    SoundUtils.bgMusicLoop = 0;
    SoundUtils.bgVolume = 1;
    SoundUtils.bgStartTime = 0;
    tsCore.SoundUtils = SoundUtils;
    class SpineUtils {
        /**
         * 对指定 skeleton 进行设置
         * @param skeleton
         * @param url
         * @param [nameOrIndex = 0] 播放名字或位置
         * @param [loop = true] 循环
         * @param playComplete
         * @param loaderComplete
         * @param [aniMode = -1]
         */
        static playSpine(skeleton, url, nameOrIndex = 0, loop = true, playComplete, loaderComplete, aniMode = -1) {
            skeleton.off(Laya.Event.STOPPED, this, SpineUtils.onStopped);
            skeleton.on(Laya.Event.STOPPED, this, SpineUtils.onStopped, [playComplete]);
            if (skeleton instanceof GSpineSkeleton) {
                if (skeleton.aniPath == url && skeleton.spineResPath == url && skeleton.asSkeleton) {
                    if (skeleton.asSkeleton.templet) {
                        // loaderComplete && loaderComplete.run()
                        SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete);
                    }
                    // 表示加载中 等待返回结果
                    return;
                }
                // 界面显示了  在加载资源
                skeleton.load(url, Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]));
                return;
            }
            if (skeleton.asSkeleton.url == url && skeleton.asSkeleton.templet) {
                // loaderComplete && loaderComplete.run()
                SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete, null);
                return;
            }
            if (aniMode == -1)
                aniMode = skeleton.aniMode;
            // 界面显示了  在加载资源
            skeleton.load(url, Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]), aniMode);
        }
        static onStopped(handler) {
            runFun(handler);
        }
        static parseComplete(skeleton, nameOrIndex, loop, loaderComplete, fac) {
            runFun(loaderComplete);
            if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
                runFun(nameOrIndex.loaderComplete);
            }
            if (skeleton && (typeof nameOrIndex === "number" ? nameOrIndex >= 0 : nameOrIndex))
                skeleton.play(nameOrIndex, loop);
        }
        /**
         * 创建spine 骨骼动画组件
         * @param url 根据传入的json或sk自动创建实现类GSpineSkeleton、GSkeleton。如果为null，skeletonClass参数必须传入
         * @param optional
         * @param skeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
         */
        static createSpine(url, optional, skeletonClass) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (optional && !this.isInterface(optional)) {
                skeletonClass = optional;
                optional = null;
            }
            if (typeof url !== "string") {
                optional = url;
                url = optional.url;
            }
            // 配置属性为null 或者不是配置属性
            if (!optional || !this.isInterface(optional)) {
                optional = { url: url };
            }
            if (optional.classType && !skeletonClass) {
                // @ts-ignore
                skeletonClass = optional.classType;
            }
            if (!url && !skeletonClass) {
                throw "The url or skeletonClass must have a non-null";
            }
            // @ts-ignore
            skeletonClass !== null && skeletonClass !== void 0 ? skeletonClass : (skeletonClass = Laya.Utils.getFileExtension(url) === "json" ? GSpineSkeleton : GSkeleton);
            let skeleton = new skeletonClass();
            if (optional.ver && skeleton instanceof GSpineSkeleton) {
                skeleton.ver = optional.ver;
            }
            optional.rotation && (skeleton.rotation = optional.rotation);
            if (optional.scale) {
                skeleton.setScale(optional.scale, optional.scale);
            }
            else {
                skeleton.setScale((_a = optional.scaleX) !== null && _a !== void 0 ? _a : skeleton.scaleX, (_b = optional.scaleY) !== null && _b !== void 0 ? _b : skeleton.scaleY);
            }
            skeleton.setXY((_c = optional.x) !== null && _c !== void 0 ? _c : 0, (_d = optional.y) !== null && _d !== void 0 ? _d : 0);
            let onLoadComplete = optional.loaderComplete;
            if (optional.relation) {
                let relation = optional.relation;
                const types = relation.types;
                if (types) {
                    for (const type of types) {
                        let reTypes = type.relationType;
                        if (!Array.isArray(reTypes))
                            reTypes = [reTypes];
                        reTypes.forEach(value => {
                            skeleton.addRelation(type.target, value, type.usePercent);
                        });
                    }
                }
                if (relation.target) {
                    (_e = relation.lr) !== null && _e !== void 0 ? _e : (relation.lr = relation.target);
                    (_f = relation.ud) !== null && _f !== void 0 ? _f : (relation.ud = relation.target);
                }
                relation.lr && skeleton.addRelation(relation.lr, fgui.RelationType.Center_Center, (_g = relation.usePercent) !== null && _g !== void 0 ? _g : true);
                relation.ud && skeleton.addRelation(relation.ud, fgui.RelationType.Middle_Middle, (_h = relation.usePercent) !== null && _h !== void 0 ? _h : true);
            }
            const _onComplete = () => {
                var _a, _b;
                Log.debug("loader spine complete", url);
                if (Log.level <= LogLevel.DEBUG)
                    Log.debug("all animation name and skins", (_a = skeleton.getAllAnimation()) === null || _a === void 0 ? void 0 : _a.map(item => item.name), (_b = skeleton.getAllSkin()) === null || _b === void 0 ? void 0 : _b.map(item => item.name));
                runFun(onLoadComplete);
            };
            if (url)
                SpineUtils.playSpine(skeleton, url, optional.play, (_j = optional.play) === null || _j === void 0 ? void 0 : _j.loop, optional.playComplete, _onComplete, optional.aniMode);
            return skeleton;
        }
        /**
         * 判断是否是接口 用 prototype 是否存在判断
         * @param optional
         */
        static isInterface(optional) {
            return !("prototype" in optional);
        }
    }
    tsCore.SpineUtils = SpineUtils;
    /**
     * 字符串一些常用方法。
     * @author boge
     *
     */
    class StringUtil {
        /**
         * 支持字符串格式 ("{0}"). 格式化
         * @param format 带占位符的字符串
         * @param args 替换文本，如果只有一个值，将会被用来替换所有的占位符
         */
        static format(format, ...args) {
            if (args.length == 1) {
                format = format.replace(/\{(\d+)}/g, args[0]);
            }
            else {
                for (let i = 0; i < args.length; ++i)
                    format = format.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
            }
            return format;
        }
        /**
         * 忽略大小字母比较字符是否相等
         * @param char1 字符串一
         * @param char2 字符串二
         * @return
         */
        static equalsIgnoreCase(char1, char2) {
            return char1.toLowerCase() == char2.toLowerCase();
        }
        /**
         * 是否是数值字符串
         * @param char 指定字符串
         * @return
         */
        static isNumber(char) {
            if (!char) {
                return false;
            }
            return !isNaN(parseFloat(char));
        }
        /**
         * 去除所有html 标签形式
         * @param value
         * @return
         *
         */
        static removeHtml(value) {
            let str = value.replace(this.HTML_TAG_REG, "");
            return str ? str.trim() : value;
        }
        /**
         * 是否为合法 Email
         * @param char 指定字符串
         * @return
         */
        static isEmail(char) {
            let reg = new RegExp("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$");
            return this.checkChar(char, reg);
        }
        /**
         * 是否是 Double 型数据
         * @param    char    指定字符串
         * @return
         */
        static isDouble(char) {
            let pattern = new RegExp("^[+\-]?\d+(\.\d+)?$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是整数
         * @param    char    指定字符串
         * @return
         */
        static isInteger(char) {
            let pattern = new RegExp("^[-\+]?\d+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是英文字符（包括大小写）
         * @param    char    指定字符串
         * @return
         */
        static isEnglish(char) {
            let pattern = new RegExp("^[A-Za-z]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是中文
         * @param    char    指定字符串
         * @return
         */
        static isChinese(char) {
            let pattern = new RegExp("^[\u0391-\uFFE5]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 万军从中取数字
         * @param input
         * @param [defaultValue=0]
         */
        static getNumbers(input, defaultValue = 0) {
            let pattern = /\d+/g;
            const matches = input.match(pattern);
            const value = matches ? matches.join("") : "0";
            return parseFloat(value);
        }
        /**
         * 万军从中取非数字
         * @param char
         * @return
         */
        static getNotNumbers(char) {
            let pattern = /\D+/g;
            let value = "";
            if (pattern.test(char)) {
                value = char.match(pattern).join("");
            }
            return value;
        }
        /**
         * 是否是双字节
         * @param    char    指定字符串
         * @return
         */
        static isDoubleChar(char) {
            let pattern = new RegExp("^[^\x00-\xff]+$");
            return this.checkChar(char, pattern);
        }
        /**
         * 是否是 url 地址
         * @param    char    指定字符串
         * @return
         */
        static isURL(char) {
            if (!char) {
                return false;
            }
            char = char.toLowerCase();
            //		let pattern:RegExp = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
            return this.checkChar(char, this.HTML_URL_REG);
        }
        /**
         * 是否为空
         * @param    char    指定字符串
         * @return
         */
        static isEmpty(char) {
            switch (char) {
                case null:
                case "":
                case "\t":
                case "\r":
                case "\n":
                case "\f":
                case undefined:
                    return true;
                default:
                    return false;
            }
        }
        /**
         * 是否不是空
         * @param    char    指定字符串
         * @return
         */
        static isNotEmpty(char) {
            return !this.isEmpty(char);
        }
        /**
         * 是否包含中文
         * @param    char    指定字符串
         * @return
         */
        static hasChineseChar(char) {
            return this.checkChar(char, /[^\x00-\xff]/);
        }
        /**
         * 检测指定字符串是否匹配指定模式
         * @param    char    指定字符串
         * @param    pattern    指定模式
         * @return
         */
        static checkChar(char, pattern) {
            return char ? pattern.test(char.trim()) : false;
        }
        /**
         * 比较两个字符串是否相等
         * @param s1 第一个比较字符串。
         * @param s2 第二个比较字符串。
         * @param caseSensitive 是否区分大小写  默认不区分
         * @return
         */
        static stringsAreEqual(s1, s2, caseSensitive = false) {
            if (caseSensitive) {
                return (s1 == s2);
            }
            else {
                return (s1.toUpperCase() == s2.toUpperCase());
            }
        }
        /**
         * 去除首位的空白部分
         * @param input 要被处理的字符串
         * @deprecated
         * @see String.trim
         */
        static trim(input) {
            return input === null || input === void 0 ? void 0 : input.trim();
        }
        /**
         * 去除所有的空白部分
         * @param input 要被处理的字符串
         * @return
         *
         */
        static trimAll(input) {
            if (!input)
                return null;
            let value = "";
            let size = input.length;
            for (let i = 0; i < size; i++) {
                if (input.charCodeAt(i) > 32) {
                    value += input.charAt(i);
                }
            }
            return value;
        }
        /**
         * 从前面指定的字符串中删除空格。
         * @param input 输入字符串开始的空白将被删除。
         * @deprecated
         * @see trimStart()
         *
         */
        static ltrim(input) {
            return input === null || input === void 0 ? void 0 : input.trimStart();
        }
        /**
         *
         * 从指定的字符串的结尾删除空格。
         *
         * @param input 输入字符串结尾的空白将被删除。
         * @deprecated
         * @see trimEnd()
         */
        static rtrim(input) {
            return input === null || input === void 0 ? void 0 : input.trimEnd();
        }
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         * @deprecated
         * @see startsWith
         */
        static beginsWith(input, prefix) {
            return input === null || input === void 0 ? void 0 : input.startsWith(prefix);
        }
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         * @deprecated
         * @see String.startsWithAny
         */
        static beginsWithAny(input, ...prefix) {
            return input === null || input === void 0 ? void 0 : input.startsWithAny(...prefix);
        }
        /**
         * 确定是否按指定字符串结束。
         * @param input 要被处理的字符串
         * @param suffix 字符串的后缀
         * @deprecated
         * @see String.endsWith
         */
        static endsWith(input, suffix) {
            return input === null || input === void 0 ? void 0 : input.endsWith(suffix);
        }
        /**
         * 确定是否按指定字符串结束。  只要满足一个就返回 true
         * @param input 要被处理的字符串
         * @param prefix 字符串的后缀
         * @deprecated
         * @see String.endsWithAny
         */
        static endsWithAny(input, ...prefix) {
            return input === null || input === void 0 ? void 0 : input.endsWithAny(...prefix);
        }
        /**
         * 删除在输入字符串中删除字符串的所有实例。
         * @param input 要被处理的字符串
         * @param remove 要删除的字符串
         * @return
         */
        static remove(input, remove) {
            return this.replace(input, remove, "");
        }
        /**
         * 字符串内容替换
         * @param input 要被处理的字符串
         * @param replace 要被替换掉的字符串
         * @param replaceWith 用来替换的新字符串
         */
        static replace(input, replace, replaceWith) {
            return input.split(replace).join(replaceWith);
        }
        /**
         * 获取指定符号之后的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         * <br>
         * @example
         * var str = "ssdw/aa"
         * StringUtils.endsCode(str, "/") = aa
         *
         * @deprecated
         * @see String.substringAfter
         * @see String.substringAfterLast
         */
        static endsCode(input, suffix, retain = false, direction = false) {
            let index;
            if (direction) {
                index = input.indexOf(suffix);
            }
            else {
                index = input.lastIndexOf(suffix);
            }
            if (index != -1) {
                if (retain) {
                    input = input.substring(index, input.length);
                }
                else {
                    input = input.substring(index + (suffix.length), input.length);
                }
            }
            return input;
        }
        /**
         * 获取指定符号之前的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         *
         * @deprecated
         * @see String.substringBefore
         * @see String.substringBeforeLast
         *
         */
        static beginsCode(input, suffix, retain = false, direction = false) {
            let index;
            if (direction) {
                index = input.indexOf(suffix);
            }
            else {
                index = input.lastIndexOf(suffix);
            }
            if (index != -1) {
                if (retain) {
                    input = input.substring(0, index + 1);
                }
                else {
                    input = input.substring(0, index);
                }
            }
            return input;
        }
        /**
         * 字符串与对象进行比较。按字典顺序比较两个字符串
         * @param value 源字符串
         * @param anotherString 要比较的字符串
         * @return number 返回值是整型，它是先比较对应字符的大小(ASCII码顺序)，如果第一个字符和参数的第一个字符不等，结束比较，返回他们之间的长度差值，如果第一个字符和参数的第一个字符相等，则以第二个字符和参数的第二个字符做比较，以此类推,直至比较的字符或被比较的字符有一方结束。
         * <br>如果参数字符串等于此字符串，则返回值 0；<br>如果此字符串小于字符串参数，则返回一个小于 0 的值；<br>如果此字符串大于字符串参数，则返回一个大于 0 的值。
         */
        static compareTo(value, anotherString) {
            let len1 = value.length;
            let len2 = anotherString.length;
            let lim = Math.min(len1, len2);
            let k = 0;
            while (k < lim) {
                let c1 = value.charCodeAt(k);
                let c2 = anotherString.charCodeAt(k);
                if (c1 != c2) {
                    return c1 - c2;
                }
                k++;
            }
            return len1 - len2;
        }
        /**
         * 获取资源文件的名字
         * @param url 路径名
         * @param retain 是否去掉尾部标签 默认true
         * @return
         */
        static urlName(url, retain = true) {
            // 先同意替换符号
            if (url.indexOf("\\") != -1) {
                url = url.replace(/\\/g, "/");
            }
            let index = url.lastIndexOf("/");
            if (retain) {
                url = url.substring(index + 1, url.lastIndexOf("."));
            }
            else {
                url = url.substring(index + 1, url.length);
            }
            return url;
        }
        /**
         * 判断此字符串中是否包含
         * @param value
         * @param arge
         * @deprecated
         * @see String.contains
         */
        static contains(value, ...arge) {
            return value === null || value === void 0 ? void 0 : value.contains(...arge);
        }
        /**
         * 将 Uint8Array 转换成16进制颜色值  至少保证3个值
         * @param value 数据
         * @param defaultColor 默认值  如果不满足要求  直接返回的值 默认#ffffff
         */
        static colorRgb(value, defaultColor = "#ffffff") {
            if (value.length < 3)
                return defaultColor;
            // 转成16进制
            let strHex = "#";
            for (let i = 0; i < 3; i++) {
                let hex = value[i].toString(16);
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            return strHex;
        }
        /**
         * 转换数据类型
         * @param value 数据
         * @param type 类型
         * @return
         */
        static changeType(value, type) {
            let tempValue = value;
            switch (type) {
                case "int":
                case "uint":
                case "number":
                    tempValue = parseFloat(value);
                    break;
                case "boolean":
                    if (this.isNumber(value)) {
                        tempValue = Laya.Utils.parseInt(value) > 0;
                    }
                    else {
                        tempValue = value == "true";
                    }
                    break;
                case "array":
                    tempValue = value.split(",");
                    break;
                case "array,int":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "int");
                    }
                    break;
                case "array,number":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "number");
                    }
                    break;
                case "array,uint":
                    tempValue = value.split(",");
                    for (let j = 0, len = tempValue.length; j < len; j++) {
                        tempValue[j] = this.changeType(tempValue[j], "uint");
                    }
                    break;
            }
            return tempValue;
        }
    }
    /** 验证是否是有效的html标签 */
    StringUtil.HTML_TAG_REG = /<[^>]*>/g;
    /** 验证是否是有效的网址 */
    StringUtil.HTML_URL_REG = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/g;
    /** 根据大写字母分隔 */
    StringUtil.UPPERCASE_SPLIT = /(?=[A-Z])/;
    /* 删除指定标签 */
    StringUtil.removeTag = /<\/?TEXTFORMAT[^>]*>/gi;
    tsCore.StringUtil = StringUtil;
    /**
     * 文字动画
     */
    class TextAniUtils {
        constructor(defaultText, textField) {
            /** 保存播放文字动画的位置 */
            this.textObj = [];
            /** 当前清楚完的数量 */
            this.clearCount = 0;
            /** 当前播放结束的数量 */
            this.playEndCount = 0;
            /** 数组文字位置 */
            this.playIndex = 0;
            this._defaultText = defaultText;
            this._textField = textField;
        }
        /**
         * 要播放的一组文字
         * @param tests
         */
        plays(tests) {
            if (this.playTexts == tests)
                return;
            this.clean(false);
            this.playTexts = tests;
            this.playIndex = 0;
            if (this.playTexts && this.playTexts.length > 0) {
                let playText = this.playTexts[this.playIndex];
                this._play(playText);
            }
        }
        /**
         * 播放文字
         * @param playText
         */
        play(playText) {
            if (this._playText == playText)
                return;
            this.playTexts = null;
            this._play(playText);
        }
        /** 直接设置文本 */
        setText(text) {
            Laya.timer.clearAll(this);
            while (this.textObj.length > 0) {
                Laya.Tween.clearAll(this.textObj.shift());
            }
            text = text.toUpperCase();
            this._playText = text;
            let msgLen = this._textField.text.length;
            let tempPlayText = StringUtil.replace(text, " ", ",");
            let showTextLen = tempPlayText.length;
            let start = Math.floor((msgLen - showTextLen) / 2);
            let tempText = "";
            for (let i = 0; i < start; i++) {
                tempText += this._defaultText;
            }
            tempText += tempPlayText;
            if (tempText.length > msgLen) {
                tempText = tempText.substring(0, msgLen);
            }
            else if (tempText.length < msgLen) {
                let len = msgLen - tempText.length;
                for (let i = 0; i < len; i++) {
                    tempText += this._defaultText;
                }
            }
            this._textField.text = tempText;
        }
        _play(playText) {
            if (this._playText) {
                this._playClean(playText);
                return;
            }
            this._playAni(playText);
        }
        _playClean(playText = null) {
            if (this._playText.length != this.textObj.length) {
                return;
            }
            Laya.timer.clearAll(this);
            this.playTwinkle(2, Laya.Handler.create(this, (playText) => {
                let showTextLen = this._playText.length;
                let charData;
                this.clearCount = 0;
                for (let i = 0; i < showTextLen; i++) {
                    charData = this.textObj[i];
                    Laya.Tween.to(charData, {
                        count: 0,
                        update: new Laya.Handler(this, this.onChangeText, [charData, this._playText.charAt(i)])
                    }, 300, null, Laya.Handler.create(this, this.onCleanTextEnd, [playText]), 300);
                }
            }, [playText]));
        }
        /**
         * 清理播放的文字
         * @param ani 是否需要动画清理
         */
        clean(ani = true) {
            this.playTexts = null;
            if (ani) {
                this._playClean();
            }
            else {
                Laya.timer.clearAll(this);
                while (this.textObj.length > 0) {
                    Laya.Tween.clearAll(this.textObj.shift());
                }
                this._playText = null;
                let msgLen = this._textField.text.length;
                let text = "";
                for (let i = 0; i < msgLen; i++) {
                    text += this._defaultText;
                }
                this._textField.text = text;
            }
        }
        /** 清除结束 */
        onCleanTextEnd(playText) {
            this.clearCount++;
            if (this.clearCount < this.textObj.length)
                return;
            this.textObj.splice(0, this.textObj.length);
            this._playText = null;
            if (!StringUtil.isEmpty(playText)) {
                Laya.timer.once(300, this, this._play, [playText]);
            }
        }
        _playAni(playText) {
            if (StringUtil.isEmpty(playText))
                return;
            this.textObj.splice(0, this.textObj.length);
            this._playText = playText.toUpperCase();
            let msgLen = this._textField.text.length;
            let showTextLen = this._playText.length;
            let start = Math.ceil((msgLen + 1 - showTextLen) / 2); // +1 是为了保证数据左右均匀 和字符串substring 取值位置有关
            this.aniText = "";
            for (let i = 0; i < msgLen; i++) {
                this.aniText += this._defaultText;
            }
            //        Log.debug("default Text : " + this.aniText, "len = " + this.aniText.length)
            let charData;
            this.playEndCount = 0;
            for (let i = 0; i < showTextLen; i++) {
                charData = { count: msgLen + 1, tempCount: -1 };
                this.textObj.push(charData);
                Laya.Tween.to(charData, {
                    count: start + i,
                    update: new Laya.Handler(this, this.onChangeText, [charData, this._playText.charAt(i)])
                }, 200, null, Laya.Handler.create(this, this.onChangeTextEnd), 15 * i);
            }
        }
        /** 显示文字完成 */
        onChangeTextEnd() {
            this.playEndCount++;
            if (this.playEndCount < this.textObj.length)
                return;
            runFun(this._endCallBack);
            if (this.playTexts && this.playTexts.length > 0) {
                this.playIndex++;
                if (this.playIndex >= this.playTexts.length) {
                    this.playIndex = 0;
                }
                Laya.timer.once(1000, this, this._play, [this.playTexts[this.playIndex]]);
            }
        }
        onChangeText(charData, txt) {
            if (StringUtil.trimAll(txt).length == 0) {
                txt = this._defaultText;
            }
            let index = Math.floor(charData.count);
            if (charData.tempCount == index)
                return;
            if (charData.tempCount != -1)
                this.aniText = this.replacePos(this.aniText, charData.tempCount, charData.tempCount, this._defaultText);
            charData.tempCount = index;
            if (index > 0) {
                this.aniText = this.replacePos(this.aniText, index, index, txt);
            }
            //        Log.debug("changeTextHandler="+this.aniText, index, this.aniText.length)
            this._textField.text = this.aniText;
        }
        replacePos(text, start, end, replaceText) {
            //        Log.debug("replacePos", text, start, replaceText)
            return text.substring(0, start - 1) + replaceText + text.substring(end);
        }
        /**
         * 播放闪烁
         * @param count 文字闪烁次数
         * @param callback
         */
        playTwinkle(count = 2, callback = null) {
            this.twinkleCount = count;
            this.twinkleCallHandler = callback;
            //        if (this.textObj.length > 0) {
            Laya.timer.loop(100, this, this.onTwinkle);
            //        }
        }
        onTwinkle() {
            if (this.isTwinkle) {
                let msgLen = this._textField.text.length;
                let tempPlayText = StringUtil.replace(this._playText, " ", ",");
                let showTextLen = tempPlayText.length;
                let start = Math.floor((msgLen - showTextLen) / 2);
                let tempText = "";
                for (let i = 0; i < start; i++) {
                    tempText += this._defaultText;
                }
                tempText += tempPlayText;
                if (tempText.length > msgLen) {
                    tempText = tempText.substring(0, msgLen);
                }
                else if (tempText.length < msgLen) {
                    let len = msgLen - tempText.length;
                    for (let i = 0; i < len; i++) {
                        tempText += this._defaultText;
                    }
                }
                //                Log.debug(tempText, tempText.length)
                this._textField.text = tempText;
                this.twinkleCount--;
            }
            else {
                let msgLen = this._textField.text.length;
                let tempText = "";
                for (let i = 0; i < msgLen; i++) {
                    tempText += this._defaultText;
                }
                this._textField.text = tempText;
            }
            this.isTwinkle = !this.isTwinkle;
            if (this.twinkleCount == 0) {
                Laya.timer.clear(this, this.onTwinkle);
                runFun(this.twinkleCallHandler);
            }
        }
        dispose() {
            this._playText = null;
            this._textField = null;
            this._endCallBack = null;
            this._defaultText = null;
            this.twinkleCallHandler = null;
            this.playTexts = null;
            Laya.timer.clearAll(this);
            while (this.textObj.length > 0) {
                Laya.Tween.clearAll(this.textObj.shift());
            }
        }
        get playText() {
            return this._playText;
        }
    }
    tsCore.TextAniUtils = TextAniUtils;
    /**
     * 闪烁动画
     */
    class TwinkleAniUtils {
        /**
         * 指定对象闪烁
         * @param target 对象
         * @param count 闪烁次数
         * @param callback 完成回调
         */
        play(target, count, callback) {
            this.callback = callback;
            target["twinkleAni"] = { count: 0, maxCount: count };
            Laya.timer.frameLoop(5, this, this.onTwinkle, [target]);
        }
        onTwinkle(target) {
            let obj = target["twinkleAni"];
            obj.count++;
            if (obj.count % 2 == 0) {
                target.alpha = 1;
            }
            else {
                target.alpha = .5;
            }
            if (obj.count >= obj.maxCount) {
                Laya.timer.clear(this, this.onTwinkle);
                runFun(this.callback);
            }
        }
        dispose() {
            this.callback = null;
            Laya.timer.clear(this, this.onTwinkle);
        }
    }
    tsCore.TwinkleAniUtils = TwinkleAniUtils;
    class VerifyUtil {
        /**
         * 验证指定的键今日已经使用过
         * @param key 键
         * @param callback 自定义在未使用的情况下调用的方法.如果此值为null,那么将不会自动更改使用状态
         * @return boolean 返回指定键在检查前是否已经被使用
         */
        static verifyData(key, callback) {
            const value = Laya.LocalStorage.getJSON(key);
            let time = Date.now();
            if (!value || !DateUtils.isSameDay(value, time)) {
                (callback === null || callback === void 0 ? void 0 : callback.call(null)) && Laya.LocalStorage.setJSON(key, time);
                return false;
            }
            return true;
        }
    }
    tsCore.VerifyUtil = VerifyUtil;
    class GamePopupMenu extends fgui.PopupMenu {
        constructor(resourceURL) {
            super(resourceURL);
            this._contentPane.on(Laya.Event.UNDISPLAY, this, this.onUnDisplay);
        }
        onUnDisplay() {
            runFun(this.closeHandler);
            Laya.timer.once(100, this, () => {
                if (this.target && this.target.selected)
                    this.target.selected = false;
            });
        }
        /**
         * 显示菜单
         * @param target 在指定的对象上显示
         * @param options 详细配置
         */
        showInScene(target, options) {
            this.show(target, options === null || options === void 0 ? void 0 : options.dir);
            if (this.contentPane && target && (options === null || options === void 0 ? void 0 : options.center)) {
                const w = (this.contentPane.width - target.width) / 2;
                this.contentPane.setXY(this.contentPane.x + w, this.contentPane.y);
            }
        }
        /*@override*/
        show(target, dir) {
            if (target instanceof fgui.GButton && target.mode == fgui.ButtonMode.Check)
                this.target = target;
            super.show(target, dir);
        }
        addIconItem(caption, handler) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.data = handler;
            item.grayed = false;
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        addSelectIconItem(caption, select, handler = null) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.selectedIcon = select;
            item.data = handler;
            item.grayed = false;
            if (select) {
                item.mode = fgui.ButtonMode.Check;
            }
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        addIconTitleItem(title, caption, select, handler) {
            let item = this._list.addItemFromPool().asButton;
            item.icon = caption;
            item.selectedIcon = select;
            item.text = title;
            item.data = handler;
            item.grayed = false;
            if (select) {
                item.mode = fgui.ButtonMode.Check;
            }
            let c = item.getController("checked");
            if (c)
                c.selectedIndex = 0;
            return item;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    tsCore.GamePopupMenu = GamePopupMenu;
    class GGraphicsAni extends Laya.GraphicsAni {
        constructor() {
            super(...arguments);
            this.boneSlotName = "";
        }
        /*@override*/
        static create() {
            // 这里处理缓存动画
            let rs = Laya.GraphicsAni["_caches"].pop();
            return rs || new GGraphicsAni();
        }
        /*@override*/
        drawTexture(texture, x, y, width, height, matrix, alpha, color, blendMode, uv) {
            if (this["_sp"] && !blendMode && this["_sp"]["$owner"] && this["_sp"]["$owner"] instanceof GSkeleton) {
                let skeleton = this["_sp"]["$owner"];
                if (skeleton.isBlendModeAdd) {
                    // blendMode = BlendMode.ADD
                    blendMode = "add";
                }
            }
            return super.drawTexture(texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
        }
        /*@override*/
        clear(recoverCmds = true) {
            super.clear(recoverCmds);
            this.boneSlotName = "";
        }
    }
    tsCore.GGraphicsAni = GGraphicsAni;
    class GLoader3D extends fgui.GObject {
        constructor() {
            super();
            this._frame = 0;
            this._updatingLayout = false;
            /** 是否有描点 */
            this.isAnchor = true;
            this._playing = true;
            this._url = "";
            this._fill = fgui.LoaderFillType.None;
            this._align = "left";
            this._verticalAlign = "top";
            this._color = "#FFFFFF";
        }
        /*@override*/
        createDisplayObject() {
            super.createDisplayObject();
            this._container = new Laya.Sprite();
            this._displayObject.addChild(this._container);
        }
        /*@override*/
        dispose() {
            this.clearContent();
            super.dispose();
        }
        get url() {
            return this._url;
        }
        set url(value) {
            if (this._url == value)
                return;
            this._url = value;
            this.loadContent();
            this.updateGear(7);
        }
        /*@override*/
        get icon() {
            return this._url;
        }
        /*@override*/
        set icon(value) {
            this.url = value;
        }
        get align() {
            return this._align;
        }
        set align(value) {
            if (this._align != value) {
                this._align = value;
                this.updateLayout();
            }
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        set verticalAlign(value) {
            if (this._verticalAlign != value) {
                this._verticalAlign = value;
                this.updateLayout();
            }
        }
        get fill() {
            return this._fill;
        }
        set fill(value) {
            if (this._fill != value) {
                this._fill = value;
                this.updateLayout();
            }
        }
        get shrinkOnly() {
            return this._shrinkOnly;
        }
        set shrinkOnly(value) {
            if (this._shrinkOnly != value) {
                this._shrinkOnly = value;
                this.updateLayout();
            }
        }
        get autoSize() {
            return this._autoSize;
        }
        set autoSize(value) {
            if (this._autoSize != value) {
                this._autoSize = value;
                this.updateLayout();
            }
        }
        get playing() {
            return this._playing;
        }
        set playing(value) {
            if (this._playing != value) {
                this._playing = value;
                this.updateGear(5);
                this.onChange();
            }
        }
        get frame() {
            return this._frame;
        }
        set frame(value) {
            if (this._frame != value) {
                this._frame = value;
                this.updateGear(5);
                this.onChange();
            }
        }
        get animationName() {
            return this._animationName;
        }
        set animationName(value) {
            if (this._animationName != value) {
                this._animationName = value;
                this.onChange();
            }
        }
        get skinName() {
            return this._skinName;
        }
        set skinName(value) {
            if (this._skinName != value) {
                this._skinName = value;
                this.onChange();
            }
        }
        get loop() {
            return this._loop;
        }
        set loop(value) {
            if (this._loop != value) {
                this._loop = value;
                this.onChange();
            }
        }
        get color() {
            return this._color;
        }
        set color(value) {
            if (this._color != value) {
                this._color = value;
                this.updateGear(4);
            }
        }
        get content() {
            return null;
        }
        loadContent() {
            this.clearContent();
            if (!this._url)
                return;
            this.loadExternal();
        }
        setSkeleton(skeleton, anchor = null) {
            this.url = null;
            let bones = skeleton.templet.boneSlotArray;
            let tempW = 0;
            let tempH = 0;
            for (let i = 0; i < bones.length; i++) {
                let boneSlot = bones[i];
                if (boneSlot.currTexture) {
                    boneSlot.currTexture.sourceWidth > tempW && (tempW = boneSlot.currTexture.sourceWidth);
                    boneSlot.currTexture.sourceHeight > tempH && (tempH = boneSlot.currTexture.sourceHeight);
                }
            }
            this.sourceWidth = tempW * skeleton.scaleX;
            this.sourceHeight = tempH * skeleton.scaleY;
            this._content = skeleton;
            this._container.addChild(this._content);
            if (this.isAnchor && !anchor) {
                anchor = new Laya.Point(this.sourceWidth / 2, this.sourceHeight / 2);
            }
            if (anchor)
                this._content.pos(anchor.x, anchor.y);
            // 添加事件
            this._content.on(Laya.Event.PLAYED, this, this.onPlayed);
            this._content.on(Laya.Event.STOPPED, this, this.onStopped);
            this._content.on(Laya.Event.PAUSED, this, this.onPaused);
            this._content.on(Laya.Event.LABEL, this, this.onLabel);
            this.onChange();
            this.updateLayout();
        }
        onPlayed() {
            this.displayObject.event(Laya.Event.PLAYED);
        }
        onStopped() {
            this.displayObject.event(Laya.Event.STOPPED);
        }
        onPaused() {
            this.displayObject.event(Laya.Event.PAUSED);
        }
        onLabel() {
            this.displayObject.event(Laya.Event.LABEL);
        }
        /**
         * 播放动画
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         */
        play(nameOrIndex, loop) {
            if (typeof (nameOrIndex) === "string") {
                if (loop)
                    this._playing = true;
                this._loop = loop;
                this.animationName = nameOrIndex;
            }
            else {
                if (this._content)
                    this._content.play(nameOrIndex, loop);
            }
        }
        /**
         * 停止动画
         */
        stop() {
            if (this._content)
                this._content.stop();
        }
        onChange() {
            if (!this._content)
                return;
            if (this._animationName) {
                if (this._playing)
                    this._content.play(this._animationName, this._loop);
                else
                    this._content.play(this._animationName, false, true, this._frame, this._frame);
            }
            else {
                this._content.stop();
            }
            if (this._skinName)
                this._content.showSkinByName(this._skinName);
            else
                this._content.showSkinByIndex(0);
            Laya.timer.callLater(this.displayObject, this.displayObject.event, [Laya.Event.CHANGE]);
        }
        loadExternal() {
            var _a;
            (_a = this.loadSkeleton) !== null && _a !== void 0 ? _a : (this.loadSkeleton = new Laya.Skeleton());
            this.loadSkeleton.load(this.url, Laya.Handler.create(this, this.loadEndHandler));
        }
        loadEndHandler() {
            if (this.loadSkeleton) {
                this._url = null;
                this.setSkeleton(this.loadSkeleton);
                this.loadSkeleton = null;
            }
        }
        updateLayout() {
            let cw = this.sourceWidth;
            let ch = this.sourceHeight;
            if (this._autoSize) {
                this._updatingLayout = true;
                if (cw == 0)
                    cw = 50;
                if (ch == 0)
                    ch = 30;
                this.setSize(cw, ch);
                this._updatingLayout = false;
                if (cw == this._width && ch == this._height) {
                    this._container.scale(1, 1);
                    this._container.pos(0, 0);
                    return;
                }
            }
            let sx = 1, sy = 1;
            if (this._fill != fgui.LoaderFillType.None) {
                sx = this.width / this.sourceWidth;
                sy = this.height / this.sourceHeight;
                if (sx != 1 || sy != 1) {
                    if (this._fill == fgui.LoaderFillType.ScaleMatchHeight)
                        sx = sy;
                    else if (this._fill == fgui.LoaderFillType.ScaleMatchWidth)
                        sy = sx;
                    else if (this._fill == fgui.LoaderFillType.Scale) {
                        if (sx > sy)
                            sx = sy;
                        else
                            sy = sx;
                    }
                    else if (this._fill == fgui.LoaderFillType.ScaleNoBorder) {
                        if (sx > sy)
                            sy = sx;
                        else
                            sx = sy;
                    }
                    if (this._shrinkOnly) {
                        if (sx > 1)
                            sx = 1;
                        if (sy > 1)
                            sy = 1;
                    }
                    cw = this.sourceWidth * sx;
                    ch = this.sourceHeight * sy;
                }
            }
            this._container.scale(sx, sy);
            let nx, ny;
            if (this._align == "center")
                nx = Math.floor((this.width - cw) / 2);
            else if (this._align == "right")
                nx = this.width - cw;
            else
                nx = 0;
            if (this._verticalAlign == "middle")
                ny = Math.floor((this.height - ch) / 2);
            else if (this._verticalAlign == "bottom")
                ny = this.height - ch;
            else
                ny = 0;
            this._container.pos(nx, ny);
        }
        clearContent() {
            this._contentItem = null;
            if (this._content) {
                this._container.removeChild(this._content);
                this._content.destroy();
                this._content = null;
            }
            if (this.loadSkeleton)
                this.loadSkeleton.destroy();
            this.loadSkeleton = null;
        }
        /*@override*/
        handleSizeChanged() {
            super.handleSizeChanged();
            if (!this._updatingLayout)
                this.updateLayout();
        }
    }
    tsCore.GLoader3D = GLoader3D;
    class GSkeleton extends ESkeleton {
        constructor(aniMode = 0) {
            super();
            /** 是否使用混合模式 */
            this.isBlendModeAdd = false;
            /** 使用混合模式的插槽 */
            this.blendBoneSlotNames = [];
            /** 指定的骨骼忽略XY偏移量 */
            this.clearBoneSlotOffset = [];
            /** 指定的骨骼忽略X偏移量 */
            this.clearBoneSlotOffsetX = [];
            /** 指定的骨骼忽略Y偏移量 */
            this.clearBoneSlotOffsetY = [];
            this.aniMode = 0;
            this._loadAniMode = 0;
            /** 自定义缓存的Templet名字 */
            this.cacheName = "";
            this.aniMode = aniMode;
        }
        /*@override*/
        createDisplayObject() {
            // super.createDisplayObject()
            this._displayObject = new Laya.Skeleton(null, this.aniMode);
            this._displayObject["$owner"] = this;
            this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false;
            this._displayObject.on(Laya.Event.STOPPED, this, this.onPlayStopped);
            this._container = this._displayObject;
        }
        get asSkeleton() {
            return this._displayObject;
        }
        /**
         * 通过加载直接创建动画
         * @param    url        要加载的动画文件路径
         * @param    handler    加载完成的回调函数
         * @param    aniMode        与<code>Laya.Skeleton.init</code>的<code>aniMode</code>作用一致
         */
        load(url, handler, aniMode = 0) {
            this.displayObject["_skinIndex"] = 0;
            this.displayObject["_skinName"] = "default";
            this._aniPath = url;
            this.asSkeleton["_aniPath"] = url;
            this._complete = handler;
            this._loadAniMode = aniMode;
            const content = Laya.Loader.getRes(url);
            if (!content) {
                Laya.loader.load([{ url: url, type: Laya.Loader.BUFFER }], Laya.Handler.create(this, this._onLoaded, [url]));
            }
            else {
                this._onLoaded();
            }
            // (<Laya.Skeleton>this._displayObject).load(url, handler, aniMode)
        }
        /**
         * 加载完成
         */
        _onLoaded(url) {
            var _a;
            var _b;
            if (url) {
                this._spineResPath = url;
            }
            const arraybuffer = Laya.Loader.getRes(this._aniPath);
            if (!arraybuffer) {
                this._spineResPath = this._aniPath = null;
                return;
            }
            (_a = (_b = Laya.Templet)["TEMPLET_DICTIONARY"]) !== null && _a !== void 0 ? _a : (_b["TEMPLET_DICTIONARY"] = {});
            let tFactory;
            tFactory = Laya.Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName];
            if (tFactory) {
                if (tFactory.isParseFail) {
                    this._parseFail();
                }
                else {
                    if (tFactory.isParserComplete) {
                        this._parseComplete();
                    }
                    else {
                        tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                        tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                    }
                }
            }
            else {
                tFactory = new Laya.Templet();
                tFactory._setCreateURL(this._aniPath);
                Laya.Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName] = tFactory;
                tFactory.on(Laya.Event.COMPLETE, this, this._parseComplete);
                tFactory.on(Laya.Event.ERROR, this, this._parseFail);
                tFactory.isParserComplete = false;
                tFactory.parseData(null, arraybuffer);
            }
        }
        /**
         * 解析完成
         */
        _parseComplete() {
            var _a;
            if (this.isDisposed)
                return;
            const tTemple = (_a = Laya.Templet["TEMPLET_DICTIONARY"]) === null || _a === void 0 ? void 0 : _a[this._aniPath + this.cacheName];
            if (tTemple) {
                this.asSkeleton.init(tTemple, this._loadAniMode);
                // this.play(0, true)
            }
            runFun(this._complete, this);
        }
        /**
         * 解析失败
         */
        _parseFail() {
            Log.error("[Error]:" + this._aniPath + " Parsing failed");
        }
        /**
         * 延迟播放动画
         * @param    playDelay    延迟时间
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    start        起始时间
         * @param    end            结束时间
         * @param    freshSkin    是否刷新皮肤数据
         */
        playDelay(playDelay, nameOrIndex, loop, force = true, start = 0, end = 0, freshSkin = true) {
            if (!this.asSkeleton.templet)
                return;
            Laya.timer.once(playDelay, this, this.play, [nameOrIndex, loop, force, start, end, freshSkin]);
        }
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByName(name, freshSlotIndex = true) {
            this.asSkeleton.showSkinByName(name, freshSlotIndex);
        }
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByIndex(skinIndex, freshSlotIndex = true) {
            this.asSkeleton.showSkinByIndex(skinIndex, freshSlotIndex);
        }
        getAniIndexByName(name) {
            return this.asSkeleton.getAniIndexByName(name);
        }
        getAllAnimation() {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a._anis;
        }
        getAllSkin() {
            var _a;
            return (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.skinDataArray;
        }
        // AnimationContent
        getAnimation(aniIndex) {
            if (typeof aniIndex === "string") {
                return this.getAllAnimation().find(value => value.name === aniIndex);
            }
            return this.getAllAnimation()[aniIndex];
        }
        /**
         * 获取动画时长 毫秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex) {
            var _a;
            if (Array.isArray(aniIndex)) {
                let duration = 0;
                for (let i = 0; i < aniIndex.length; i++) {
                    duration += this.getAnimDuration(aniIndex[i]);
                }
                return duration;
            }
            return ((_a = this.getAnimation(aniIndex)) === null || _a === void 0 ? void 0 : _a.playTime) || 0;
        }
        getAnimFrame(aniIndex) {
            return this.getAnimation(aniIndex).totalKeyframeDatasLength;
        }
        get currAniIndex() {
            return this.asSkeleton["_currAniIndex"];
        }
        /**
         * 根据动作名和插槽骨骼名,来获取该骨骼在该动作播放时,每一帧该骨骼坐标位置,返回所有帧数骨骼坐标位置组成的列表
         * @param nameOrIndex
         * @param boneName
         */
        getBoneCoords(nameOrIndex, boneName) {
            return this.asSkeleton["getBoneCoords"](nameOrIndex, boneName);
        }
        getSlotXByName(name) {
            const slot = this.getBoneSlotByName(name);
            return slot ? slot.currDisplayData.transform.x : 0;
        }
        getSlotYByName(name) {
            const slot = this.getBoneSlotByName(name);
            return slot ? -slot.currDisplayData.transform.y : 0;
        }
        getSlotPointByName(name) {
            const slot = this.getBoneSlotByName(name);
            return slot ? new Laya.Point(slot.currDisplayData.transform.x, -slot.currDisplayData.transform.y) : null;
        }
        getBoneSlotByName(name) {
            let slot = null;
            if (this.asSkeleton.templet) {
                slot = this.asSkeleton.getSlotByName(name);
            }
            return slot;
        }
        static get emptyTexture() {
            var _a;
            (_a = GSkeleton._emptyTexture) !== null && _a !== void 0 ? _a : (GSkeleton._emptyTexture = Laya.Texture.create(Laya.HTMLImage.create(50, 50, Laya.TextureFormat.R8G8B8A8), 0, 0, 50, 50));
            return GSkeleton._emptyTexture;
        }
        /**
         * 设置插槽的某个皮肤
         * @param slotName 插槽名字
         * @param skin Laya.Texture 或 fairy gui 的路径  如：//package/skin
         */
        setSlotSkin(slotName, skin = GSkeleton.emptyTexture) {
            let texture = null;
            if (skin && typeof skin === "string") {
                const packageItem = fgui.UIPackage.getItemByURL(skin);
                if (packageItem) {
                    texture = packageItem.load();
                }
            }
            else {
                texture = skin;
            }
            let slot = this.getBoneSlotByName(slotName);
            if (this.aniMode > 0) {
                this.asSkeleton.setSlotSkin(slotName, texture);
                return;
            }
            slot = this.getBoneSlotByName(slotName);
            if (slot) {
                if (texture && texture != GSkeleton.emptyTexture) {
                    slot.currDisplayData.width = texture.width;
                    slot.currDisplayData.height = texture.height;
                    slot.currDisplayData.transform.scY = -1;
                }
                slot.currDisplayData.texture = texture;
                slot.currTexture = texture;
                this.clearCache();
            }
            else {
                Log.debug("not found Laya.BoneSlot name = " + slotName);
            }
        }
        /**
         * 换装的时候，需要清一下缓冲区
         */
        clearCache() {
            if (this.aniMode == 0) {
                const _graphicsCache = this.asSkeleton.templet["_graphicsCache"];
                for (let i = 0, n = _graphicsCache.length; i < n; i++) {
                    for (let j = 0, len = _graphicsCache[i].length; j < len; j++) {
                        let gp = _graphicsCache[i][j];
                        if (gp && gp != this.displayObject.graphics) {
                            Laya.GraphicsAni.recycle(gp);
                        }
                    }
                    _graphicsCache[i].length = 0;
                }
            }
        }
        /*@override*/
        on(type, thisObject, listener, args = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args));
                return;
            }
            super.on(type, thisObject, listener, args);
        }
        /*@override*/
        off(type, thisObject, listener) {
            if (type == Laya.Event.STOPPED) {
                for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                    const handler = this.stoppedHandler[i];
                    if (handler.caller == thisObject && handler.method == listener) {
                        handler.clear();
                        this.stoppedHandler.splice(i, 1);
                    }
                }
                return;
            }
            super.off(type, thisObject, listener);
        }
        offAll(type = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.length = 0;
                return;
            }
            this.displayObject.offAll(type);
        }
        /*@override*/
        dispose() {
            const obj = Laya.Templet["TEMPLET_DICTIONARY"];
            if (obj) {
                const tTemple = obj[this._aniPath + this.cacheName];
                if (tTemple)
                    delete obj[this._aniPath + this.cacheName];
            }
            // tTemple?.destroy()
            while (this.stoppedHandler.length) {
                this.stoppedHandler.shift().clear();
            }
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    /**
     * 骨骼更新
     * ````
     * GSkeleton cmd:DrawTextureCmd
     * GSpineSkeleton spine.Slot
     * ````
     */
    GSkeleton.UPDATE_BONE_SLOT = "update_bone_slot";
    /**
     * 骨骼更新
     * ````
     * GSkeleton cmd:DrawTextureCmd
     * GSpineSkeleton spine.Bone
     * ````
     */
    GSkeleton.UPDATE_BONE_RENDER = "update_bone_render";
    /**
     * 插槽更新
     * ````
     * GSkeleton cmd:DrawTextureCmd
     * GSpineSkeleton spine.Slot
     * ````
     */
    GSkeleton.UPDATE_SLOT_RENDER = "update_slot_render";
    tsCore.GSkeleton = GSkeleton;
    class GSpineSkeleton extends ESkeleton {
        constructor(ver = Laya.SpineVersion.v3_8) {
            super();
            this.ver = ver;
        }
        /*@override*/
        createDisplayObject() {
            super.createDisplayObject();
            this._displayObject = new Laya.SpineSkeleton();
            this._displayObject["$owner"] = this;
            this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false;
            this._displayObject.on(Laya.Event.STOPPED, this, this.onPlayStopped);
            this._container = this._displayObject;
        }
        get asSkeleton() {
            return this._displayObject;
        }
        /**
         * 获取spine的Skeleton对象
         */
        getSkeletonNative() {
            // @ts-ignore
            return this.asSkeleton.getSkeleton();
        }
        /**
         * 加载json 或 skel格式的骨骼文件
         * @param jsonOrSkelUrl
         * @param handler 回调方法
         * @param ver
         */
        load(jsonOrSkelUrl, handler, ver) {
            this._complete = handler;
            this._aniPath = jsonOrSkelUrl;
            if (!this.template || (ver && this.ver != ver)) {
                this.template = new Laya.SpineTemplet(this.ver);
                this.template.on(Laya.Event.COMPLETE, this, this.onComplete);
                this.template.on(Laya.Event.ERROR, this, this.onError);
            }
            this.template.loadAni(jsonOrSkelUrl);
        }
        onError() {
            this._spineResPath = null;
        }
        onComplete(spine) {
            if (spine.loadResUrl != this.aniPath)
                return;
            this._spineResPath = spine.loadResUrl;
            const template = spine !== null && spine !== void 0 ? spine : this.template;
            this.asSkeleton.init(template);
            // 销毁已有的动画
            // for (let i = this.displayObject.numChildren - 1; i >= 0; i--) {
            //     let temp = this.displayObject.getChildAt(i)
            //     if (temp instanceof SpineSkeleton) {
            //         temp.destroy(true)
            //     }
            // }
            // if (this.spineSkeleton) {
            //     this.spineSkeleton.hitArea = this.displayObject.hitArea
            // }
            // this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
            // this.displayObject.addChild(this.spineSkeleton)
            runFun(this._complete, this);
        }
        /*@override*/
        set touchable(value) {
            // if (this.spineSkeleton) this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
            super.touchable = value;
        }
        /*@override*/
        get touchable() {
            return super.touchable;
        }
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         */
        showSkinByName(name) {
            this.asSkeleton.showSkinByName(name);
        }
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         */
        showSkinByIndex(skinIndex) {
            this.asSkeleton.showSkinByIndex(skinIndex);
        }
        getAniIndexByName(aniName) {
            let animations = this.asSkeleton.templet.skeletonData.animations;
            let index = -1;
            for (let i = 0, n = animations.length; i < n; i++) {
                let animation = animations[i];
                if (animation && aniName == animation.name) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        getAllAnimation() {
            var _a, _b;
            return (_b = (_a = this.getSkeletonNative()) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.animations;
        }
        getAllSkin() {
            var _a, _b;
            return (_b = (_a = this.asSkeleton.templet) === null || _a === void 0 ? void 0 : _a.skeletonData) === null || _b === void 0 ? void 0 : _b.skins;
        }
        getAnimation(aniIndex) {
            let animation;
            if (typeof aniIndex === "string") {
                animation = this.getAllAnimation().find(value => value.name === aniIndex);
            }
            else
                animation = this.getAllAnimation()[aniIndex];
            return animation;
        }
        /**
         * 获取动画时长 秒
         * @param aniIndex
         */
        getAnimDuration(aniIndex) {
            var _a;
            let duration = 0;
            if (Array.isArray(aniIndex)) {
                for (let i = 0; i < aniIndex.length; i++) {
                    duration += this.getAnimDuration(aniIndex[i]);
                }
            }
            else
                duration = ((_a = this.getAnimation(aniIndex)) === null || _a === void 0 ? void 0 : _a.duration) || 0;
            return duration;
        }
        getAnimFrame(aniIndex) {
            return this.getAnimation(aniIndex).timelines.length;
        }
        get currAniIndex() {
            let _currAniName = this.asSkeleton["_currAniName"];
            if (!_currAniName)
                return -1;
            return this.getAniIndexByName(_currAniName);
        }
        set hitArea(rec) {
            // if (this.spineSkeleton) {
            //     this.spineSkeleton.hitArea = rec
            //     return
            // }
            this.displayObject.hitArea = rec;
        }
        /*@override*/
        on(type, thisObject, listener, args = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args));
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.on(type, thisObject, listener, args);
                return;
            }
            super.on(type, thisObject, listener, args);
        }
        /*@override*/
        off(type, thisObject, listener) {
            if (type == Laya.Event.STOPPED) {
                for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                    const handler = this.stoppedHandler[i];
                    if (handler.caller == thisObject && handler.method == listener) {
                        handler.clear();
                        this.stoppedHandler.splice(i, 1);
                    }
                }
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.off(type, thisObject, listener);
                return;
            }
            super.off(type, thisObject, listener);
        }
        offAll(type = null) {
            if (type == Laya.Event.STOPPED) {
                this.stoppedHandler.length = 0;
                return;
            }
            if (this.asSkeleton) {
                this.asSkeleton.offAll(type);
                return;
            }
            this.displayObject.offAll(type);
        }
        /*@override*/
        dispose() {
            super.dispose();
        }
    }
    tsCore.GSpineSkeleton = GSpineSkeleton;
    /** 消息提示框 */
    class MessageTip extends fgui.GComponent {
        /*@override*/
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this.touchable = false;
            this.content = this.getChild("n1").asTextField;
            this.tempFontSize = this.content.fontSize;
        }
        /**
         * 设置显示文本字体大小
         * @param value 大小
         */
        set fontSize(value) {
            this.content.fontSize = value;
        }
        get fontSize() {
            return this.content.fontSize;
        }
        /**
         * 显示文本提示框
         * @see LibStr
         * @param value 内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param [duration = 1800ms] 提示内容展示时长
         */
        static showTip(value, duration = MessageTip.displayTime) {
            if (!fgui.UIPackage.getByName("common") || !value)
                return;
            if (Array.isArray(value)) {
                value[0] = LanguageUtils.inst.getStr(value[0]);
                value = StringUtil.format.apply(null, value);
            }
            else {
                value = LanguageUtils.inst.getStr(value);
            }
            MessageTip.cacheContent.push({ time: duration, content: value });
            if (MessageTip.cacheContent.length > 5) { // 最多缓存5条
                MessageTip.cacheContent.shift();
            }
            MessageTip.createMsgTip();
        }
        static createMsgTip() {
            var _a;
            if (MessageTip.cacheContent.length < 1)
                return;
            const tipData = MessageTip.cacheContent.shift();
            let mt = Laya.Pool.getItemByCreateFun(MessageTip.NAME, this.createHandler);
            mt.showMes(tipData.content, tipData.time);
            // 已经显示2个或以上  加消失
            if (MessageTip.usePool.length < 2)
                return;
            let len = MessageTip.usePool.length - 2;
            for (let i = len; i >= 0; i--) {
                const msg = MessageTip.usePool[i];
                if (len === i) {
                    if (msg.steps == 1) {
                        (_a = msg.tween) === null || _a === void 0 ? void 0 : _a.complete();
                        msg.movePoint();
                    }
                    else if (msg.steps == 2) {
                        msg.movePoint();
                    }
                }
                else { // 至少有3个值了
                    if (msg.steps < 3) {
                        Laya.Tween.clearAll(msg);
                        msg.tween = null;
                        msg.movePoint(((fgui.GRoot.inst.height - msg.height) >> 1) - msg.moveUpStep * 2);
                        if (msg.steps === 1)
                            msg.alpha = msg.scaleX = 1;
                        msg.showEnd(400);
                    }
                }
            }
        }
        static createHandler() {
            return fgui.UIPackage.createObjectFromURL("//common/MessageTip", MessageTip);
        }
        /**
         * 显示弹窗内容
         */
        showMes(msg, duration) {
            this["applyPivot"]();
            this.width = fgui.GRoot.inst.width;
            //		this.fontSize = Math.floor(this.tempFontSize * AlertPanel.inst.width / this.initWidth)
            this.content.text = msg;
            this.alpha = .1;
            this.setXY(0, (fgui.GRoot.inst.height - this.height) >> 1);
            this.scaleX = .5;
            this.addRelation(fgui.GRoot.inst, fgui.RelationType.Width);
            this.getParent().addChild(this);
            MessageTip.usePool.push(this);
            this.steps = 1;
            this.tween = Laya.Tween.to(this, { alpha: 1, scaleX: 1 }, 400, null, Laya.Handler.create(this, this.showEnd, [duration]));
        }
        /**
         * 向上移动一次的距离
         * @private
         */
        get moveUpStep() {
            return this.height; /* + 5 */
        }
        movePoint(moveY = -1) {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.pause(); // 移动过程中先暂停
            if (moveY === -1)
                moveY = this.y - this.moveUpStep;
            Laya.Tween.to(this, { y: moveY }, 300, null, Laya.Handler.create(this, () => {
                var _a;
                (_a = this.tween) === null || _a === void 0 ? void 0 : _a.resume();
            }), 0, false);
        }
        showEnd(delay = 0) {
            this.steps = delay === 0 ? 3 : 2;
            this.tween = Laya.Tween.to(this, {
                alpha: 0,
                scaleX: .5,
                y: this.y - 100
            }, 400, null, Laya.Handler.create(this, this.hideEnd), delay);
        }
        hideEnd() {
            this.steps = 3;
            Laya.Tween.clearAll(this);
            this.tween = null;
            this.removeRelation(fgui.GRoot.inst, fgui.RelationType.Width);
            this.removeFromParent();
            Laya.Pool.recover(MessageTip.NAME, this);
            let index = MessageTip.usePool.indexOf(this);
            MessageTip.usePool.splice(index, 1);
            MessageTip.createMsgTip();
        }
        /** 清楚所有提示 */
        static clearAll() {
            MessageTip.cacheContent.splice(0, MessageTip.cacheContent.length);
            while (MessageTip.usePool.length) {
                MessageTip.usePool.shift().hideEnd();
            }
        }
        getParent() {
            return this.rootParent || fgui.GRoot.inst;
        }
    }
    MessageTip.NAME = "MessageTip";
    /** 使用中的 */
    MessageTip.usePool = [];
    /** 缓存的内容 */
    MessageTip.cacheContent = [];
    /** 展示时间
     * @default 1800
     */
    MessageTip.displayTime = 1800;
    tsCore.MessageTip = MessageTip;
    class NumButton extends EButton {
        constructor() {
            super(...arguments);
            /** 偏移位置 */
            this.offX = 0;
            /** 偏移位置 */
            this.offY = 0;
            this.tempValue = 0;
        }
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.bindObject = this;
            this.component = new fgui.GLoader();
            this.component.url = "ui://gameCommon/numCC";
            this.component.height = 28;
            this.component.fill = fgui.LoaderFillType.ScaleFree;
            this.addChild(this.component);
            this.cornerMarker = new fgui.GBasicTextField();
            this.cornerMarker.color = "#ffffff";
            this.cornerMarker.fontSize = 16;
            this.cornerMarker.text = "99+";
            this.cornerMarker.valign = Laya.Stage.ALIGN_MIDDLE;
            this.cornerMarker.align = Laya.Stage.ALIGN_CENTER;
            this.cornerMarker.height = this.component.height;
            this.cornerMarker.autoSize = fgui.AutoSizeType.None;
            this.component.displayObject.addChild(this.cornerMarker.displayObject);
            this.component.visible = false;
            this.cornerMarker.width = this.component.width = 50;
            this.getController("c1").on(fgui.Events.STATE_CHANGED, this, this.stateChangedHandler);
            this.updateBindPoint();
        }
        stateChangedHandler() {
            if (this.getController("c1").selectedIndex == 0) {
                this.component.visible = this.tempValue > 0;
            }
            else {
                this.component.visible = false;
            }
        }
        /** 更新绑定位置 */
        updateBindPoint() {
            this.component.x = this.bindObject.width - this.component.width + this.offX;
            //        component.y = -component.height / 2 + offY
        }
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value) {
            this.tempValue = value;
            this.component.visible = value > 0;
            if (value < 10) {
                this.cornerMarker.width = this.component.width = 28;
            }
            else {
                this.cornerMarker.width = this.component.width = 50;
            }
            this.updateBindPoint();
            if (value > 99) {
                this.cornerMarker.text = "99+";
            }
            else {
                this.cornerMarker.text = value + "";
            }
        }
    }
    tsCore.NumButton = NumButton;
    class ProgressBar extends mixinExt(ActionEvent, ViewBlock, fgui.GProgressBar) {
        tweenValue2(value, duration, complete) {
            let oldValule;
            let tweener = fgui.GTween.getTween(this, this.update);
            if (tweener) {
                oldValule = tweener.value.x;
                tweener.kill();
            }
            else
                oldValule = this.value;
            this["_value"] = value;
            return fgui.GTween.to(oldValule, this.value, duration)
                .setTarget(this, this.update)
                .onComplete(() => {
                runFun(complete);
            })
                .setEase(fgui.EaseType.Linear);
        }
        /*@override*/
        update(newValue) {
            // super.update(newValue);
            var _a, _b, _c, _d;
            // @ts-ignore
            var percent = fgui.ToolSet.clamp01((newValue - this._min) / (this._max - this._min));
            // @ts-ignore
            const titleObject = this._titleObject;
            // @ts-ignore
            const max = this._max;
            // @ts-ignore
            if (this._titleObject) {
                // @ts-ignore
                switch (this._titleType) {
                    case fgui.ProgressTitleType.Percent:
                        if (titleObject.templateVars && titleObject.text.contains("{num=")) {
                            titleObject
                                .setVar("num", Math.floor(newValue) + "")
                                .flushVars();
                        }
                        else
                            titleObject.text = Math.floor(percent * 100) + "%";
                        break;
                    case fgui.ProgressTitleType.ValueAndMax:
                        if (titleObject.templateVars && ((_a = titleObject.text) === null || _a === void 0 ? void 0 : _a.contains("{num=", "{max="))) {
                            titleObject
                                .setVar("num", Math.floor(newValue) + "")
                                .setVar("max", max)
                                .flushVars();
                        }
                        else
                            titleObject.text = Math.floor(newValue) + "/" + Math.floor(max);
                        break;
                    case fgui.ProgressTitleType.Value:
                        if (titleObject.templateVars && ((_b = titleObject.text) === null || _b === void 0 ? void 0 : _b.contains("{num="))) {
                            titleObject
                                .setVar("num", Math.floor(newValue) + "")
                                .flushVars();
                        }
                        else
                            titleObject.text = "" + Math.floor(newValue);
                        break;
                    case fgui.ProgressTitleType.Max:
                        if (titleObject.templateVars && ((_c = titleObject.text) === null || _c === void 0 ? void 0 : _c.contains("{max="))) {
                            titleObject
                                .setVar("max", Math.floor(max) + "")
                                .flushVars();
                        }
                        else
                            titleObject.text = "" + Math.floor(max);
                        break;
                }
            }
            // @ts-ignore
            var fullWidth = this.width - this._barMaxWidthDelta;
            // @ts-ignore
            var fullHeight = this.height - this._barMaxHeightDelta;
            // @ts-ignore
            if (!this._reverse) {
                // @ts-ignore
                if (this._barObjectH) {
                    // @ts-ignore
                    if (!this.setFillAmount(this._barObjectH, percent))
                        this._barObjectH.width = Math.round(fullWidth * percent);
                }
                // @ts-ignore
                if (this._barObjectV) {
                    // @ts-ignore
                    if (!this.setFillAmount(this._barObjectV, percent))
                        this._barObjectV.height = Math.round(fullHeight * percent);
                }
            }
            else {
                // @ts-ignore
                if (this._barObjectH) {
                    // @ts-ignore
                    if (!this.setFillAmount(this._barObjectH, 1 - percent)) {
                        // @ts-ignore
                        this._barObjectH.width = Math.round(fullWidth * percent);
                        // @ts-ignore
                        this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                    }
                }
                // @ts-ignore
                if (this._barObjectV) {
                    // @ts-ignore
                    if (!this.setFillAmount(this._barObjectV, 1 - percent)) {
                        // @ts-ignore
                        this._barObjectV.height = Math.round(fullHeight * percent);
                        // @ts-ignore
                        this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                    }
                }
            }
            // @ts-ignore
            (_d = this._aniObject) === null || _d === void 0 ? void 0 : _d.setProp(fgui.ObjectPropID.Frame, Math.floor(percent * 100));
        }
    }
    tsCore.ProgressBar = ProgressBar;
    /**
     * 带 Skeleton 动画
     */
    class SkeletonWindow extends EWindow {
        constructor() {
            super(...arguments);
            this.loadComplete = false;
            this.waitShow = false;
        }
        /*@override*/
        onInit(data) {
            super.onInit();
            if (data) {
                this.skeletonData = data;
                const newData = Object.create(data);
                newData.loaderComplete = this._onLoadComplete.bind(this);
                this.skeleton = SpineUtils.createSpine(newData);
                this.addChild(this.skeleton);
            }
            else
                throw Error("error data null");
        }
        get sk() {
            return this.skeleton;
        }
        get spine() {
            return this.skeleton;
        }
        _onLoadComplete() {
            this.loadComplete = true;
            this.onLoadComplete();
            runFun(this.skeletonData.loaderComplete);
            if (this.waitShow) {
                this.waitShow = false;
                this.doShowAnimation();
            }
        }
        /**
         * 骨骼动画加载完成,加载一次骨骼动画会被调用一次
         * @protected
         */
        onLoadComplete() {
        }
        /**
         * 当初始化程序结束  但是加载程序尚未完成 执行
         */
        customLoader() {
        }
        /**
         * @deprecated
         * @see onShowAnimation
         */
        /*@override*/
        doShowAnimation() {
            if (!this.loadComplete) {
                this.visible = false;
                this.waitShow = true;
                this.customLoader();
                return;
            }
            this.visible = true;
            this.onShowAnimation();
        }
        /**
         * ```
         * 初始化以及加载的骨骼动画都准备接续
         * 代替 doShowAnimation 重写  务必保留 super.onShowAnimation()
         * ```
         */
        onShowAnimation() {
            super.doShowAnimation();
        }
    }
    tsCore.SkeletonWindow = SkeletonWindow;
    /**
     * 上传组件
     * @author boge
     */
    class Upload {
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new Upload);
            return this._instance;
        }
        get nativeFile() {
            var _a;
            (_a = this._file) !== null && _a !== void 0 ? _a : (this._file = Laya.Browser.getElementById("upload"));
            return this._file;
        }
        /**
         * 在输入期间，如果 Input 实例的位置改变，调用该方法同步输入框的位置。
         */
        _syncInputTransform() {
            if (!this.target)
                return;
            let style = this.nativeFile.style;
            let transform = Laya.Utils.getTransformRelativeToWindow(this.target, 0, 0);
            this.inputWidth = this.target.width;
            this.inputHeight = this.target.height;
            this.setSize(this.inputWidth, this.inputHeight);
            this.setScale(transform.tx, transform.ty);
        }
        setScale(sx, sy) {
            this.setSize(this.inputWidth * sx, this.inputHeight * sy);
        }
        setSize(w, h) {
            this.nativeFile.style.width = w + "px";
            this.nativeFile.style.height = h + "px";
        }
        setPos(x, y) {
            this.nativeFile.style.left = x + "px";
            this.nativeFile.style.top = y + "px";
        }
        hide() {
            this.setSize(0, 0);
            this.setPos(0, 0);
            this.nativeFile.onchange = null;
            Laya.Browser.removeElement(Laya.Browser.getElementById("upload"));
            this.focus = false;
            this.target = null;
            this._file = null;
            Laya.stage.off(Laya.Event.FOCUS, this, this.focusHandler);
            Laya.stage.off(Laya.Event.BLUR, this, this.blurHandler);
            this.target2.off(Laya.Event.UNDISPLAY, this, this.hide);
        }
        show(target, target2) {
            this.target = target;
            this.target2 = target2;
            this.focus = true;
            Laya.stage.on(Laya.Event.FOCUS, this, this.focusHandler);
            Laya.stage.on(Laya.Event.BLUR, this, this.blurHandler);
            target2.once(Laya.Event.UNDISPLAY, this, this.hide);
        }
        blurHandler() {
            this.focus = false;
        }
        focusHandler() {
            this.focus = true;
        }
        // 移动平台最后单击画布才会调用focus
        // 因此 调用focus接口是无法都在移动平台立刻弹出键盘的
        set focus(value) {
            if (value) {
                this._syncInputTransform();
                this.nativeFile.style.display = "block";
                if (!Laya.Render.isConchApp && Laya.Browser.onPC)
                    Laya.timer.frameLoop(1, this, this._syncInputTransform);
            }
            else {
                // 只有PC会注册此事件。
                Laya.Browser.onPC && Laya.timer.clear(this, this._syncInputTransform);
                this.nativeFile.style.display = "none";
            }
        }
    }
    tsCore.Upload = Upload;
    /**
     * 为Map对象定义一个getOrDefault方法，用于获取指定键对应的值，如果键不存在，则返回默认值。
     * @param key 指定的键
     * @param defaultValue 当键不存在时返回的默认值
     * @returns 返回键对应的值，如果键不存在则返回默认值
     */
    Object.defineProperty(Map.prototype, "getOrDefault", {
        value: function (key, defaultValue) {
            const value = this.get(key); // 尝试获取键对应的值
            return value !== null && value !== void 0 ? value : defaultValue; // 如果值存在则返回该值，否则返回默认值
        }
    });
    /**
     * 为Map对象定义一个getOrPut方法，用于获取指定键对应的值，如果键不存在，则调用默认值生成函数，将生成的值设置到该键，并返回该值。
     * @param key 指定的键
     * @param defaultValue 一个函数，当键不存在时调用以生成默认值
     * @returns 返回键对应的值，如果键不存在则调用默认值生成函数并返回新设置的值
     */
    Object.defineProperty(Map.prototype, "getOrPut", {
        value: function (key, defaultValue) {
            const value = this.get(key); // 尝试获取键对应的值
            if (value == null) {
                const answer = defaultValue(); // 如果键不存在，调用默认值生成函数并获取结果
                this.set(key, answer); // 将结果设置到该键
                return answer; // 返回新设置的值
            }
            else {
                return value; // 如果键存在，直接返回对应的值
            }
        }
    });
})(tsCore || (tsCore = {}));
