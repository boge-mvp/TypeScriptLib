import {IHttpFilter} from "../interfaces/IHttpFilter"
import {AjaxRequest} from "../net/AjaxRequest"
import {Method} from "../interfaces/ICommon";
import {Log} from "../Log";

export class HTTPUtils {

    /**
     * @default text
     */
    static defaultResponseType = "text"
    /**
     * 检查服务器时间间隔
     * @default 1000 * 60
     */
    static checkServerTimeDelta = 1000 * 60
    /** 差值 */
    static difference = 0
    /**
     *
     * 时间加速比 (倍数)
     * @internal
     */
    private static _timeAccelerationRatio = 1.0
    /**
     * 本地最后执行同步的时间
     * @internal
     */
    private static _lastLocalTime = 0
    /**
     * 最后收到的服务器时间
     * @internal
     */
    private static _lastServerTime = 0
    /** 过滤器 */
    static filter: IHttpFilter

    private readonly ghr: AjaxRequest
    /**
     * 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
     */
    private url!: string
    /**
     * 发送的数据。
     * @default null
     */
    private data: any
    /**
     * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @default null
     */
    private method: Nullable<string> = null
    /**
     * Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     * @default text
     */
    private responseType = HTTPUtils.defaultResponseType
    /**
     * HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     * @default null
     */
    private headers: Nullable<string[]>
    /** 完成 */
    private complete: Nullable<HttpOnComplete>
    /** 错误 */
    private error: Nullable<HttpOnError>
    /** 超时 */
    private timeout: Nullable<HttpOnTimeout>
    private static https: HTTPUtils[] = []

    private async = true
    /**
     * 不管结果如何  执行完成后最后都会执行的方法
     */
    private finally: Nullable<HttpOnFinally>

    constructor() {
        this.ghr = new AjaxRequest()
    }

    /**
     * 创建新的http请求
     */
    static create(): HTTPUtils {
        const http = new HTTPUtils()
        HTTPUtils.https.push(http)
        return http
    }

    /**
     * 清除所有正在执行的请求已经监听方法
     */
    static clear(http?: HTTPUtils) {
        if (http) {
            const index = HTTPUtils.https.findIndex((value) => value === http)
            HTTPUtils.https.splice(index, 1)
            return
        }
        if (HTTPUtils.https.length < 1) return
        const runs = [...HTTPUtils.https]
        HTTPUtils.https.length = 0
        for (const http of runs) http.abort()
    }

    setUrl(url: string): HTTPUtils {
        this.url = url
        return this
    }

    setData(data: any): HTTPUtils {
        this.data = data
        return this

    }

    setMethod(data: Method | string | Nullish): HTTPUtils {
        this.method = data
        return this
    }

    setAsync(async: boolean): HTTPUtils {
        this.async = async
        return this
    }

    setResponseType(data: string): HTTPUtils {
        this.responseType = data
        return this
    }

    setHeaders(array: Nullable<string[]>): HTTPUtils {
        this.headers = array
        return this
    }

    /**
     * 请求在自动终止之前可能需要的毫秒数。<br>
     * 值为 0，表示没有超时。
     * @default 0
     */
    setOvertime(value: number): HTTPUtils {
        this.ghr.setOvertime(value)
        return this
    }

    onFinally(handler: Nullable<HttpOnFinally>) {
        this.finally = handler
        return this
    }

    onComplete(handler: Nullable<HttpOnComplete>): HTTPUtils {
        this.complete = handler
        return this
    }

    onError(handler: Nullable<HttpOnError>): HTTPUtils {
        this.error = handler
        return this
    }

    onTimeout(handler: Nullable<HttpOnTimeout>): HTTPUtils {
        this.timeout = handler
        return this
    }

    onEvent(complete: (response: HttpResponse, request: AjaxRequest) => void, error?: (err: any, request: AjaxRequest) => void, finallyFun?: (request: AjaxRequest) => void): HTTPUtils {
        this.complete = complete
        this.error = error
        this.finally = finallyFun
        return this
    }

    /**
     *
     */
    call() {
        let onComplete = this.completeHandler?.bind(this)
        let onError = this.errorHandler?.bind(this)
        let onTimeOut = this.timeOutHandler?.bind(this)
        // 判断是否需要拦截发送
        if (HTTPUtils.filter?.interceptSend(this.url, this.data, onComplete, onError, onTimeOut, this.http)) return

        // 判断是否有解析数据格式
        let value = this.data
        HTTPUtils.filter && (value = HTTPUtils.filter.filterSendData(this.url, this.data))

        this.ghr.async = this.async
        this.ghr.onComplete(onComplete)
        this.ghr.onError(onError)
        this.ghr.onTimerOut(onTimeOut)
        if (!this.method) {
            if (!value) {
                this.method = Method.GET
            } else {
                this.method = Method.POST
            }
        }
        this.ghr.send(this.url, value, this.method, this.responseType, this.headers)
    }

    private timeOutHandler() {
        Log.debug("HTTPUtils.timeOutHandler()")
        HTTPUtils.filter?.timeout(this.http)
        if (this.timeout) runFun(this.timeout, this.http)
        else if (this.error) runFun(this.error, "time out", this.http)
        runFun(this.finally, this.http)
        HTTPUtils.clear(this)
    }

    private errorHandler(e: any) {
        Log.debug("HTTPUtils.errorHandler()", e)
        HTTPUtils.filter?.errorResult(e, this.http)
        runFun(this.error, e, this.http)
        runFun(this.finally, this.http)
        HTTPUtils.clear(this)
    }


    private completeHandler(data: HttpResponse) {
        if (!data) {
            this.errorHandler(data)
            return
        }
        HTTPUtils.syncServerTime(data)
        HTTPUtils.filter && (data = HTTPUtils.filter.filterResultData(this.url, data, this.http))
        if (typeof data === "number") {// 如果是数字 将被阻止返回结果
            Log.info(data)
            return
        }
        runFun(this.complete, data, this.http)
        runFun(this.finally, this.http)
        HTTPUtils.clear(this)
    }

    /**
     * 终止请求
     */
    abort() {
        this.ghr.abort()
    }


    get http() {
        return this.ghr
    }

    getHttp() {
        return this.http
    }

    /**
     * 解析时间
     * @deprecated
     * @see HttpUtils.syncServerTime
     */
    static parseDate(data: HttpResponse) {
        this.syncServerTime(data)
    }

    /**
     * 同步服务器时间，计算本地与服务器的时间差以及检测时间加速情况
     *
     * 此方法的主要功能包括：
     * 1. 从HTTP响应中提取服务器时间戳
     * 2. 计算本地时间和服务器时间的基准差值
     * 3. 检测是否存在时间加速现象（本地时间流逝速度与服务器不同）
     * 4. 更新时间同步相关的时间记录点
     *
     * @param data 服务器返回的HTTP响应数据，应包含服务器时间信息
     *
     * 实现原理：
     * - 首先通过HTTP过滤器提取服务器时间戳
     * - 调用castDifference记录基础时间差
     * - 对比本次和上次的时间同步点，计算本地和服务器的时间流逝速率差异
     * - 如果发现显著的时间加速（超过10%偏差），则输出警告日志
     * - 更新_lastLocalTime和_lastServerTime作为下次计算的基准点
     */
    static syncServerTime(data: HttpResponse) {
        let serverTime = HTTPUtils.filter?.parseData(data) ?? 0
        if (serverTime > 0) {
            this.castDifference(serverTime)

            const currentLocalTime = Laya.Browser.now()
            if (this._lastServerTime > 0 && this._lastLocalTime > 0) {
                // 计算本地时间和服务器时间的流逝差异
                const localDelta = currentLocalTime - this._lastLocalTime;
                const serverDelta = serverTime - this._lastServerTime;

                // 计算加速倍数
                if (serverDelta > 0) {
                    this._timeAccelerationRatio = localDelta / serverDelta;
                    // console.log(`time acceleration multiplier: ${this.timeAccelerationRatio.toFixed(2)}x`);

                    if (Math.abs(this._timeAccelerationRatio - 1.0) > 0.1) {
                        Log.warn(`Time acceleration detected! Acceleration multiplier: ${this._timeAccelerationRatio.toFixed(2)}x`);
                    }
                }
            }

            this._lastLocalTime = currentLocalTime;
            this._lastServerTime = serverTime;

        }
    }

    /**
     * 获取经过时间加速调整后的当前时间戳（毫秒级）
     *
     * 此方法提供了一个统一的时间获取接口，能够自动补偿以下情况：
     * 1. 服务器与客户端的基础时间差
     * 2. 本地时间流逝速率与服务器不一致的情况（时间加速）
     *
     * 工作机制：
     * - 如果尚未进行过时间同步（_lastServerTime为0），则直接返回本地时间
     * - 否则基于最后一次同步的时间点进行推算：
     *   a) 计算自上次同步以来本地经过的时间
     *   b) 根据_timeAccelerationRatio调整这段时间（补偿时间加速影响）
     *   c) 在服务器时间基础上加上调整后的时间增量
     *
     * 使用场景：
     * - 游戏中的定时逻辑
     * - 需要精确服务器时间的功能模块
     * - 跨设备时间一致性要求较高的业务逻辑
     *
     * @returns {number} 经过校准的当前时间戳（毫秒）
     */
    static getTimer(): number {
        if (this._lastServerTime === 0) {
            // 还没有从服务器获得初始时间，暂时使用本地时间
            return Laya.Browser.now();
        }

        const now = Laya.Browser.now();
        const elapsed = now - this._lastLocalTime;
        // 应用时间加速比率调整
        const adjustedElapsed = elapsed / this._timeAccelerationRatio;

        return this._lastServerTime + adjustedElapsed;
    }

    /** 当前时间  秒 */
    static getTimerSecond() {
        return Math.floor(this.getTimer() / 1000)
    }

    static castDifference(serverTime: number) {
        if (!isNaN(serverTime) && serverTime > 0) {
//		    trace("HTTPUtils.parseDate(data)",
//			Cast.timerFrom(serverTime),
//			Cast.timerFrom(parseInt((Browser.now()/1000)+"")))
            HTTPUtils.difference = Laya.Browser.now() - serverTime
        }

    }

    /** 获取差值 */
    static getDifference() {
        return HTTPUtils.difference
    }

    /** 解析json数据格式 */
    static parseJson(data?: any) {
        if (!data) return null

        if (typeof data === "string") return data

        let value: Nullable<string>
        let v: any
        for (let key in data) {
            v = data[key]
            if (!value) {
                value = key + "=" + v
            } else {
                value += "&" + key + "=" + v
            }
        }
        return value
    }

    /**
     * 时间加速比 (倍数)
     * @returns {number}
     */
    static get timeAccelerationRatio(): number {
        return this._timeAccelerationRatio;
    }

    /**
     * 本地最后执行同步的时间
     * @returns {number}
     */
    static get lastLocalTime(): number {
        return this._lastLocalTime;
    }

    /**
     * 最后收到的服务器时间
     * @returns {number}
     */
    static get lastServerTime(): number {
        return this._lastServerTime;
    }

}