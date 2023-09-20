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
    /** 超时时间 默认 10s */
    private overtime = 10000

    /**
     * 创建一个请求
     */
    constructor() {
        super()
        this.once(Laya.Event.COMPLETE, this, this.onResult)
        this.once(Laya.Event.ERROR, this, this.onHttpError)
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

    setOvertime(value: number) {
        this.overtime = value
    }

    override send(url: string, data?: any, method?: string, responseType?: string, headers?: string[] | null) {
        if (this.overtime > 0) Laya.timer.once(this.overtime, this, this.timeOut)
        super.send(url, data, method, responseType, headers)
    }

    private onHttpError(obj: any) {
        Laya.timer.clear(this, this.timeOut)
        runFun(this.errorHandler, obj)
        this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler)
        this.errorHandler = this.completeHandler = this.timerOutHandler = null
    }

    /** 请求返回结果数据 */
    private onResult(json: any) {
        Laya.timer.clear(this, this.timeOut)
        runFun(this.completeHandler, json)
        this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler)
        this.errorHandler = this.completeHandler = this.timerOutHandler = null
    }

    private timeOut() {
        Laya.timer.clear(this, this.timeOut)
        this.offAll(Laya.Event.COMPLETE)
        this.offAll(Laya.Event.ERROR)
        this.clear()
        runFun(this.timerOutHandler)
        this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler)
        this.errorHandler = this.completeHandler = this.timerOutHandler = null
    }

    /**
     * 终止请求
     */
    abort() {
        this.clearHandler(this.errorHandler, this.completeHandler, this.timerOutHandler)
        this.completeHandler = this.errorHandler = this.timerOutHandler = null
        this.clear()
        Laya.timer.clear(this, this.timeOut)
        this.offAll(Laya.Event.COMPLETE)
        this.offAll(Laya.Event.ERROR)
    }

    /** 清除处理器 */
    private clearHandler(...handler: (ParamHandler | null | undefined)[]) {
        for (const value of handler) {
            if (value instanceof Laya.Handler) value.recover()
        }
    }

}