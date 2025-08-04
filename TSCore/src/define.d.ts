declare module Laya {

// @ts-ignore
    interface Text {

        /** 是否绘制删除线
         * @default false */
        _isDrawRemoveLine: boolean
        /** 是否绘制删除线
         * @default false */
        isDrawRemoveLine: boolean
        /**
         * 是否倾斜
         * @default true */
        removeLineTilt: boolean
        /** 删除线宽度
         * @default 1 */
        removeLineWidth: number
        /** 删除线颜色
         * @default null */
        removeLineColor: string

    }


    interface HttpRequest {
        /** 设置是否异步请求 默认true */
        async: boolean
    }

    interface Stage {
        /**
         * 是否暂停更新所有的Laya.timer._update()
         * @default false
         */
        pauseUpdateTimer?: boolean
    }

    interface CallLater {

        /**
         * 清理对象身上所有的延迟
         * @param    caller 执行域(this)。
         */
        clear(caller: any)

        /**
         * 清理所有的延迟执行
         */
        clearAll()

    }

    interface Timer {

        /** 清空所有的计时器 */
        clearAllTimer()

    }

    interface Skeleton {
        /**
         * 通过动画名称得索引
         * @param name
         */
        getAniIndexByName(name: string): number

    }

    interface SpineTempletBase {
        /**
         * 当前正在使用纹理的加载url
         */
        loadResUrl?:string
    }

    interface Templet {
        /**
         * 所有动画
         */
        _anis: AnimationContent[]
    }

    interface Handler {

        /** 值越大 越后执行
         * @default 100
         */
        order: number

    }

}

declare module fgui {

    interface GLoader {

        /**
         * 加载重试次数
         * @default 0
         */
        loadRetryCount: number
        /**
         * 当前已经重复加载的次数
         * @default 0
         */
        loadCount: number

    }

    interface Window {

        /** 值越小 层级越高 */
        order: number

    }

}

//  **********************         扩展原生方法         *****************************

declare interface String {

    /**
     * 首字母强制小写
     */
    firstLowerCase(): string
    /**
     * 首字母强制大写
     */
    firstUpperCase(): string
    /**
     * 确定是否按指定字符串开始.满足一个返回 true
     * @param search
     */
    startsWithAny(...search: string []): boolean

    /**
     * 确定是否按指定字符串开始.满足一个返回 true 忽略大小
     * @param search
     */
    startsWithAnyIgnore(...search: string []): boolean

    /**
     * 确定是否按指定字符串结束.满足一个返回 true
     * @param search
     */
    endsWithAny(...search: string []): boolean

    /**
     * 确定是否按指定字符串结束.满足一个返回 true 忽略大小
     * @param search
     */
    endsWithAnyIgnore(...search: string []): boolean

    /**
     * 确定是否与指定数组中的某个值相等.满足一个返回 true
     * @param value
     */
    equalsAny(...value: string []): boolean

    /**
     * 确定是否与指定的值相等,忽略大小.满足一个返回 true
     * @param value
     */
    equalsAnyIgnore(...value: string []): boolean

    /**
     * 在字符串中检查是否包含指定的子字符串。
     * @param search 要搜索的子字符串数组。
     * @returns 如果找到任何一个子字符串，则返回true，否则返回false。
     */
    contains(...search: string[]): boolean

    /**
     * 在字符串中忽略大小写检查是否包含指定的子字符串。
     * @param search 要搜索的子字符串数组。
     * @returns 如果找到任何一个子字符串（忽略大小写），则返回true，否则返回false。
     */
    containsIgnore(...search: string[]): boolean

    /**
     * 获取指定符号之后的字符串
     * @param separator
     */
    substringAfter(separator: string): string

    /**
     * 获取指定符号之后的字符串 从最后一个符合的开始
     * @param separator
     */
    substringAfterLast(separator: string): string

    /**
     * 获取指定符号之前的字符串
     * @param separator
     */
    substringBefore(separator: string): string

    /**
     * 获取指定符号之前的字符串 从最后一个符合的开始
     * @param separator
     */
    substringBeforeLast(separator: string): string

    /**
     * 获取指定开始和结束的符号之间的字符串
     * @param open
     * @param close
     */
    substringBetween(open: string, close: string): string

    /**
     * 获取指定开始和结束的符号之间的所有字符串
     * @param open
     * @param close
     */
    substringsBetween(open: string, close: string): string[]

    /**
     * 将字符串转换为布尔值
     *
     * 会判断字符串是否为null，是否为空字符串，是否包含"false"或"0"
     * @returns {boolean} 转换后的布尔值
     */
    toBoolean(): boolean

    /**
     * 将字符串转换为整数
     * @returns {number} 转换后的整数
     */
    toInt(): number

}

declare interface Array<T> {

    /**
     * 返回一个新数组，该数组仅包含给定数组中的元素，这些元素具有不同的键，由给定 selector 函数返回。
     * 在具有相等键的给定数组的元素中，结果数组中仅存在第一个元素。结果数组中的元素的顺序与源数组中的顺序相同。
     */
    distinctBy<R>(selector: (value: T) => R): Array<T>

    /**
     * 返回一个新数组，该数组仅包含给定数组中的不同元素。
     * 结果数组中的元素的顺序与源数组中的顺序相同快速去除重复基础对象
     */
    distinct(): Array<T>

    /**
     * 将数组元素按指定键值进行分组，并可选地应用一个值转换器来变换每个元素的值。
     * @template T 元素类型
     * @template K 键类型
     * @template V 转换后元素的类型（若未提供 valueTransform，则与 T 类型相同）
     * @param {function(value: T): K} keySelector 用于提取元素键值的函数
     * @returns {Map<K, T[]>} 返回一个映射对象，键为 K 类型，值为包含相应键值元素的 V 类型数组
     */
    groupBy<K>(keySelector: (value: T) => K): Map<K, T[]>

    /**
     * 将数组元素按指定键值进行分组，并可选地应用一个值转换器来变换每个元素的值。
     * @template T 元素类型
     * @template K 键类型
     * @template V 转换后元素的类型（若未提供 valueTransform，则与 T 类型相同）
     * @param {function(value: T): K} keySelector 用于提取元素键值的函数
     * @param {function(value: T): V} [valueTransform] 可选的函数，用于将元素转换为新值
     * @returns {Map<K, V[]>} 返回一个映射对象，键为 K 类型，值为包含相应键值元素的 V 类型数组
     */
    groupBy<K, V>(keySelector: (value: T) => K, valueTransform: (value: T) => V): Map<K, V[]>

    /**
     * 将数组元素按指定键值进行分组并将结果添加到目标映射中，同时可选地应用一个值转换器来变换每个元素的值。
     * @template T 元素类型
     * @template K 键类型
     * @template V 转换后元素的类型（若未提供 valueTransform，则与 T 类型相同）
     * @template M 扩展自 Map<K, V[]> 的目标映射类型
     * @param {M} destination 目标映射对象，用于存储分组结果
     * @param {function(value: T): K} keySelector 用于提取元素键值的函数
     * @returns {M} 返回已填充了分组结果的目标映射对象
     */
    groupByTo<K, M extends Map<K, T[]>>(destination: M, keySelector: (value: T) => K): M

    /**
     * 将数组元素按指定键值进行分组并将结果添加到目标映射中，同时可选地应用一个值转换器来变换每个元素的值。
     * @template T 元素类型
     * @template K 键类型
     * @template V 转换后元素的类型（若未提供 valueTransform，则与 T 类型相同）
     * @template M 扩展自 Map<K, V[]> 的目标映射类型
     * @param {M} destination 目标映射对象，用于存储分组结果
     * @param {function(value: T): K} keySelector 用于提取元素键值的函数
     * @param {function(value: T): V} [valueTransform] 可选的函数，用于将元素转换为新值
     * @returns {M} 返回已填充了分组结果的目标映射对象
     */
    groupByTo<K, V, M extends Map<K, V[]>>(destination: M, keySelector: (value: T) => K, valueTransform: (value: T) => V): M

    /**
     * 随机洗牌此数组中的元素。
     */
    shuffle(): this

    /**
     * 返回产生给定函数的最小值的第一个元素。
     * @param selector
     */
    minBy<R>(selector: (value: T) => R): T | undefined

    /**
     * 返回产生给定函数的最大值的第一个元素。
     * @param selector
     */
    maxBy<R>(selector: (value: T) => R): T | undefined

    /**
     * 返回与给定 predicate 匹配的元素数
     * @param predicate
     */
    count(predicate: (value: T) => boolean): number

    /**
     * 返回数组中每个元素的函数生成 selector 的所有值的总和。
     * @param selector
     */
    sumOf(selector: (value: T) => number): number

    /**
     * 返回集合中所有元素的总和
     */
    sum(): number

    /**
     * 从数组中随机获取一个值
     */
    random(): T

    /**
     * 过滤数组中特定类型的元素。
     *
     * @param {Function} type - 一个构造函数，用于判断数组元素是否是这个类型的实例。
     * @returns {Array} 返回一个新的数组，其中包含了原数组中所有是传入类型实例的元素。
     */
    filterIsInstance<C>(type: { new(): C }) : Array<C>

    /**
     * 通过提供一个回调函数来定义移除元素的条件。
     * 如果数组中存在满足条件的元素，则移除该元素并返回true，否则返回false。
     *
     * @param filter 一个回调函数，用于测试每个元素是否应该被移除。
     *               回调函数接受数组的当前元素作为参数，并返回一个布尔值，
     *               表示该元素是否应该被移除。
     * @returns 如果成功移除了任何元素，则返回true；否则返回false。
     */
    removeIf(filter: (value: T) => boolean): boolean

    /**
     * 在原数组上进行过滤操作，根据predicate函数的结果移除元素。
     * 该函数尝试在原数组上进行过滤，避免创建新的数组实例，以提高性能和减少内存使用。
     *
     * @param predicate 过滤条件函数，接受数组元素作为参数，返回一个布尔值。
     * @returns 如果数组发生了改变（有元素被移除），则返回true；否则返回false。
     */
    removeAll(predicate: (value: T) => boolean): boolean

    /**
     * 在原数组上进行过滤操作，根据predicate函数的结果保留元素。
     * 该函数尝试在原数组上进行过滤，避免创建新的数组实例，以提高性能和减少内存使用。
     *
     * @param predicate 过滤条件函数，接受数组元素作为参数，返回一个布尔值。
     * @returns 如果数组发生了改变（有元素被移除），则返回true；否则返回false。
     */
    retainAll(predicate: (value: T) => boolean): boolean

    any(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean

    all(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean

    /**
     * 该方法会遍历数组中的每个元素，并使用给定的 transform 函数处理每个元素，
     * 然后将结果展平到一个新数组中返回。如果提供了可选参数 iterable，则结果会追加到此数组中。
     * @param transform - 用于处理每个数组元素的函数，返回一个数组。
     * @param iterable - 可选参数，指定一个数组用于累积结果，默认为空数组。
     * @returns 返回包含所有处理后元素的新数组。
     */
    flatMap(transform: (value: T, index: number) => T, iterable?: T): T

}

declare interface Map<K, V> {

    /**
     * 为Map对象定义一个getOrDefault方法，用于获取指定键对应的值，如果键不存在，则返回默认值。
     * @param key 指定的键
     * @param defaultValue 当键不存在时返回的默认值
     * @returns 返回键对应的值，如果键不存在则返回默认值
     */
    getOrDefault(key: K, defaultValue: V): V
    /**
     * 为Map对象定义一个getOrPut方法，用于获取指定键对应的值，如果键不存在，则调用默认值生成函数，将生成的值设置到该键，并返回该值。
     * @param key 指定的键
     * @param defaultValue 一个函数，当键不存在时调用以生成默认值
     * @returns 返回键对应的值，如果键不存在则调用默认值生成函数并返回新设置的值
     */
    getOrPut(key: K, defaultValue: () => V) :V

}
