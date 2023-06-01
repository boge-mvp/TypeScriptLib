import {IHttpFilter} from "../net/IHttpFilter"
import {GameHttpRequest} from "../net/GameHttpRequest"
import {Method} from "../interfaces/ICommon";
import {Log} from "../Log";
import {HttpCode} from "../net/Common";

export class HTTPUtils {

    static defaultResponseType = "text"
    /** 检查服务器时间间隔 */
    static checkTimer = 1000 * 60
    /** 差值 */
    static difference = 0
    /**
     * 检查服务器时间 CheckServerTimer
     */
    static serverTimerUrl: string
    /** 过滤器 */
    static filter: IHttpFilter

    private readonly ghr: GameHttpRequest
    /**
     * 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
     */
    private url: string
    /**
     * (default = null)发送的数据。
     */
    private data: any
    /**
     * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @default null
     */
    private method: string = null
    /**
     * (default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     */
    private responseType = HTTPUtils.defaultResponseType
    /**
     * (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     */
    private headers: string[]
    /** 完成 */
    private complete: ParamHandler
    /** 错误 */
    private error: ParamHandler
    /** 超时 */
    private timeout: ParamHandler

    constructor() {
        this.ghr = new GameHttpRequest()
    }

    static create(): HTTPUtils {
        return new HTTPUtils()
    }

    setUrl(url: string): HTTPUtils {
        this.url = url
        return this
    }

    setData(data: any): HTTPUtils {
        this.data = data
        return this
    }

    setMethod(data: Method | string): HTTPUtils {
        this.method = data
        return this
    }

    setResponseType(data: string): HTTPUtils {
        this.responseType = data
        return this
    }

    setHeaders(array: string[]): HTTPUtils {
        this.headers = array
        return this
    }

    setOvertime(value: number): HTTPUtils {
        this.ghr.setOvertime(value)
        return this
    }

    onComplete(handler: ParamHandler): HTTPUtils {
        this.complete = handler
        return this
    }

    onError(handler: ParamHandler): HTTPUtils {
        this.error = handler
        return this
    }

    onTimeout(handler: ParamHandler): HTTPUtils {
        this.timeout = handler
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
        if (HTTPUtils.filter?.interceptSend(this.url, this.data, onComplete, onError, onTimeOut)) return

        // 判断是否有解析数据格式
        let value = this.data
        HTTPUtils.filter && (value = HTTPUtils.filter.filterSendData(this.url, this.data))

        this.ghr.onComplete(onComplete)
        this.ghr.onError(onError)
        this.ghr.onTimerOut(onTimeOut)
        if (this.method == null) {
            if (value == null) {
                this.method = Method.GET
            } else {
                this.method = Method.POST
            }
        }
        this.ghr.send(this.url, value, this.method, this.responseType, this.headers)
    }

    private timeOutHandler() {
        Log.debug("HTTPUtils.timeOutHandler()")
        if (this.timeout != null) runFun(this.timeout)
        else if (this.error != null) runFun(this.error, "time out")
    }

    private errorHandler(e: any) {
        Log.debug("HTTPUtils.errorHandler()", e)
        HTTPUtils.filter?.errorResult(e)
        runFun(this.error, e)
    }

    private completeHandler(data: any) {
        if (data == null) {
            this.errorHandler(data)
            return
        }
        HTTPUtils.parseDate(data)
        HTTPUtils.filter && (data = HTTPUtils.filter.filterResultData(this.url, data))
        runFun(this.complete, data)
    }

    abort() {
        this.ghr.abort()
    }

    getHttp() {
        return this.ghr
    }


    /** 解析时间 */
    static parseDate(data: any) {
        let serverTime = HTTPUtils.filter ? HTTPUtils.filter.parseData(data) : 0
        this.castDifference(serverTime)
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

    /** 当前时间  毫秒 */
    static getTimer() {
        return (Laya.Browser.now() - HTTPUtils.difference)
    }

    /** 当前时间  秒 */
    static getTimerSecond() {
        return Math.floor((Laya.Browser.now() - HTTPUtils.difference) / 1000)
    }


    /** 解析json数据格式 */
    static parseJson(data?: any) {
        if (data == null) {
            return null
        }
        if (typeof data === "string") {
            return data
        }
        let value: string = null
        let v: any
        for (let key in data) {
            v = data[key]
            if (value == null) {
                value = key + "=" + v
            } else {
                value += "&" + key + "=" + v
            }
        }
        return value
    }


    /** 开启服务器时间检查 */
    static openCheckServerTimer(value: string) {
        HTTPUtils.serverTimerUrl = value
        this.serverTimerHandler()
        this.closeCheckServerTimer()
        Laya.timer.loop(this.checkTimer, this, this.serverTimerHandler)
    }

    /** 关闭服务器时间检查 */
    static closeCheckServerTimer() {
        Laya.timer.clear(this, this.serverTimerHandler)
    }

    private static serverTimerHandler() {
        this.create().onComplete((data: any) => {
            if (data.code == HttpCode.OK) {
                data = data.data
                HTTPUtils.parseDate(data)
            }
        }).setUrl(this.serverTimerUrl).call()
    }

}