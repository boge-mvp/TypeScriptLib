/**
 * 长按、点击按钮绑定
 * @author boge
 *
 */
export class LongPressBtn {

    /** 按下判定长按的间隔时间 */
    private HOLD_TRIGGER_TIME = 500
    /** 被绑定的按钮 */
    private btn: fgui.GButton
    /** 长按后回调方法 */
    private readonly callback: ParamHandler
    /** 玩家长时间按下 */
    private _isApeHold: boolean
    /** 执行回调方法  附带参数 */
    private readonly args: any[]
    /** 是否单次调用 */
    single = false

    /**
     * 创建一个监听
     * @param btn 绑定按钮
     * @param callback 回调方法
     * @param args 执行回调方法  附带参数
     *
     */
    constructor(btn: fgui.GButton, callback: ParamHandler, ...args) {
        this.btn = btn
        this.args = args
        this.callback = callback
        btn.displayObject.once(Laya.Event.MOUSE_DOWN, this, this.downHandler)
        btn.onClick(this, this.clickHandler)
    }

    /** 点下按钮 */
    private downHandler(e: Laya.Event) {
        Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold)
        Laya.stage.once(Laya.Event.MOUSE_UP, this, this.upHandler)
    }

    /** 松开按钮 */
    private upHandler() {
        this._isApeHold = false
        Laya.timer.clear(this, this.onLoopClick)
        // 如果未触发hold，终止触发hold
        Laya.timer.clear(this, this.onHold)
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.upHandler)

        this.btn.displayObject?.once(Laya.Event.MOUSE_DOWN, this, this.downHandler)
        this.btn.onClick(this, this.clickHandler)
    }

    private onHold() {
        this._isApeHold = true
        Laya.timer.loop(100, this, this.onLoopClick)
        this.onLoopClick()
    }

    private onLoopClick() {
        if (this._isApeHold) {
            // 先清理单击事件
            this.btn.offClick(this, this.clickHandler)
            // 执行一次点击
            this.clickHandler(null)
            // 单次执行  直接执行清理结束操作
            if (this.single) this.upHandler()
        } else {
            Laya.timer.clear(this, this.onLoopClick)
        }
    }

    private clickHandler(e: Laya.Event) {
        if (e != null) e.stopPropagation()
        let args = [this.callback].concat(this.args)
        runFun.apply(null, args)
    }

    get isApeHold() {
        return this._isApeHold
    }

    public dispose() {
        Laya.timer.clearAll(this)
        this.btn.off(Laya.Event.MOUSE_DOWN, this, this.downHandler)
        this.btn.offClick(this, this.clickHandler)
    }

}