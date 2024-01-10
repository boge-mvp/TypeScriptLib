/**
 * 动态参数 function 或 Laya.Handler
 */
declare type ParamHandler = ((...args) => any) | Laya.Handler

/**
 * 执行 ParamHandler 方法
 * @param func ParamHandler 对象
 * @param args 参数 传入数组会将数组当场一个参数传递
 */
declare function runFun(func: ParamHandler, ...args): any | null

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
declare function defaults(args: any, defs: any, croak ?: boolean, append?: boolean)


declare type Constructor<T = {}> = new (...args: any[]) => T

/** 使用交叉类型连接多个类型 */
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/** 获取构造函数的实例类型 */
declare type InstanceTypeOfConstructor<T> = T extends Constructor<infer R> ? R : never

/**
 * 根据语言包id获取字符串
 * @param id 获取文案的key
 * @param args 如果包含占位符，这里可传入占位符的替换文案
 */
declare function getString(id: string | number, ...args): string

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
     * 判断此字符串中是否包含
     * @param search
     */
    contains(...search: string[]): boolean

    /**
     * 判断此字符串中是否包含 忽略大小写
     * @param search
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
     * 随机洗牌此数组中的元素。
     */
    shuffle(): void

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
}