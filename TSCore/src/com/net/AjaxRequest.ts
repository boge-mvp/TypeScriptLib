/**
 * 网络请求
 * 封装的 XMLHttpRequest 类
 */
export class AjaxRequest extends Laya.HttpRequest {

    /** 请求数据完成 */
    private completeHandler: ParamHandler
    /** 请求错误 */
    private errorHandler: ParamHandler
    /** 超时 */
    private timerOutHandler: ParamHandler

    /**
     * 创建一个请求
     */
    constructor() {
        super()
        this.once(Laya.Event.COMPLETE, this, this.onResult)
        this.once(Laya.Event.ERROR, this, this.onHttpError)
        this.http.ontimeout = this.timeOut.bind(this)
    }

    onComplete(value: ParamHandler) {
        this.completeHandler = value
    }

    onTimerOut(value: ParamHandler) {
        this.timerOutHandler = value
    }

    onError(value: ParamHandler) {
        this.errorHandler = value
    }

    /**
     * 请求在自动终止之前可能需要的毫秒数。<br>
     * 值为 0，表示没有超时。
     * @default 0
     */
    setOvertime(value = 0) {
        this.http.timeout = value
    }

    override send(url: string, data?: any, method?: string, responseType?: string, headers?: string[] | null) {
        super.send(url, data, method, responseType, headers)
    }

    private onHttpError(obj: any) {
        runFun(this.errorHandler, obj)
        this.clearEvent()
    }

    /** 请求返回结果数据 */
    private onResult(json: HttpResponse) {
        runFun(this.completeHandler, json)
        this.clearEvent()
    }

    private timeOut() {
        this.offAll(Laya.Event.COMPLETE)
        this.offAll(Laya.Event.ERROR)
        this.clear()
        runFun(this.timerOutHandler)
        this.clearEvent()
    }

    /**
     * 终止请求
     */
    abort() {
        this.clearEvent()
        this.clear()
        this.offAll(Laya.Event.COMPLETE)
        this.offAll(Laya.Event.ERROR)
    }

    /** 清除处理器 */
    private clearHandler(...handler: (ParamHandler | null | undefined)[]) {
        for (const value of handler) {
            if (value instanceof Laya.Handler) value.recover()
        }
    }

    private clearEvent() {
        this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler)
        this.errorHandler = this.completeHandler = this.timerOutHandler = null
    }

    override get http(): XMLHttpRequest {
        return super.http;
    }
}