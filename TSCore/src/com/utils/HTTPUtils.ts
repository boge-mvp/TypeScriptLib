import {IHttpFilter} from "../interfaces/IHttpFilter"
import {AjaxRequest} from "../net/AjaxRequest"
import {Method} from "../interfaces/ICommon";
import {Log} from "../Log";

export class HTTPUtils {

    static defaultResponseType = "text"
    /** 检查服务器时间间隔 */
    static checkTimer = 1000 * 60
    /** 差值 */
    static difference = 0
    /** 过滤器 */
    static filter: IHttpFilter

    private readonly ghr: AjaxRequest
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
    private static https: HTTPUtils[] = []

    private async = true
    /** 不管结果如何  执行完成后最后都会执行的方法 */
    private finally: ParamHandler;

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

    setMethod(data: Method | string): HTTPUtils {
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

    setHeaders(array: string[]): HTTPUtils {
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

    onFinally(handler: ParamHandler) {
        this.finally = handler
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

    onEvent(complete: (data: any) => void, error?: (err?: any) => void, finallyFun?: () => void): HTTPUtils {
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
        if (this.timeout) runFun(this.timeout)
        else if (this.error) runFun(this.error, "time out")
        runFun(this.finally)
        HTTPUtils.clear(this)
    }

    private errorHandler(e: any) {
        Log.debug("HTTPUtils.errorHandler()", e)
        HTTPUtils.filter?.errorResult(e, this.http)
        runFun(this.error, e)
        runFun(this.finally)
        HTTPUtils.clear(this)
    }


    private completeHandler(data: HttpResponse) {
        if (!data) {
            this.errorHandler(data)
            return
        }
        HTTPUtils.parseDate(data)
        HTTPUtils.filter && (data = HTTPUtils.filter.filterResultData(this.url, data, this.http))
        if (typeof data === "number") {// 如果是数字 将被阻止返回结果
            Log.info(data)
            return
        }
        runFun(this.complete, data)
        runFun(this.finally)
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

    /** 解析时间 */
    static parseDate(data: HttpResponse) {
        let serverTime = HTTPUtils.filter?.parseData(data) ?? 0
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
        if (!data) return null

        if (typeof data === "string") return data

        let value: string
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

}