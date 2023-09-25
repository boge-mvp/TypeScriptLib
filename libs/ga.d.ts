declare function ga(command: string, hitType: string, eventCategory: string, eventAction: string, eventLabel?: string, eventValue?: number, fieldsObject?: any)

declare function ga(command: CommandType | string, hitType: HitType | string, data: EventType | ExceptionType | TimingType): void

declare function gaSend(hitType: HitType, data: EventType | ExceptionType |TimingType)

declare function gaEvent(data: EventType): void

declare function gaException(data: ExceptionType): void

declare function gaTiming(data: TimingType): void


declare type CommandType = "set" | "send" | "create"
declare type HitType = "event" | "exception" | "timing"

/**
 * 事件
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=zh-cn#events
 */
declare type EventType = {
    /**
     * 指定事件类别。值不能为空。 <br/>
     * 长度上限: 150 字节 <br/>
     * 协议参数: ec
     */
    eventCategory: string,
    /**
     * 指定事件操作。值不能为空。 <br/>
     * 长度上限: 500 字节 <br/>
     * 协议参数: ea
     */
    eventAction: string,
    /**
     * 指定事件标签。 <br/>
     * 长度上限: 500 字节 <br/>
     * 协议参数: el
     */
    eventLabel?: string
    /**
     * 指定事件值。值不得为负数。 <br/>
     * 协议参数: ev
     */
    eventValue?: number
}

/**
 * 计时
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=zh-cn#timing
 */
declare type TimingType = {
    /**
     * 指定用户计时类别。 <br/>
     * 长度上限: 150 字节 <br/>
     * 协议参数: utc
     */
    timingCategory: string,
    /**
     * 指定用户计时变量。 <br/>
     * 长度上限: 500 字节 <br/>
     * 协议参数: utv
     */
    timingVar: string,
    /**
     * 指定用户计时值。值以毫秒为单位。 <br/>
     * 协议参数: utt
     */
    timingValue: number,
    /**
     * 指定用户计时标签。 <br/>
     * 长度上限: 500 字节 <br/>
     * 协议参数: utl
     */
    timingLabel?: string
}

/**
 * 异常
 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=zh-cn#exception
 */
declare type ExceptionType = {
    /**
     * 提供对异常情况的说明。<br/>
     * 长度上限: 150 字节<br/>
     * 协议参数: exd
     */
    exDescription?: string,
    /**
     * 指定异常是否严重 <br/>
     * 协议参数: exf
     * @default true
     */
    exFatal?: boolean
}
