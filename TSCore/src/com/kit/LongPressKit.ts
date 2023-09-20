/**
 * 长按、点击组件绑定
 * @author boge
 */
export class LongPressKit {

    /** 按下判定长按的间隔时间 */
    private HOLD_TRIGGER_TIME = 500
    /** 被绑定的按钮 */
    private component: fgui.GComponent
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
     * @param component 绑定组件
     * @param callback 回调方法
     * @param args 执行回调方法  附带参数
     *
     */
    constructor(component: fgui.GComponent, callback: ParamHandler, ...args: any[]) {
        this.component = component
        this.args = args
        this.callback = callback
        component.displayObject.once(Laya.Event.MOUSE_DOWN, this, this.onDown)
        component.onClick(this, this.onClick)
    }

    /** 点下按钮 */
    private onDown(e: Laya.Event) {
        Laya.timer.once(this.HOLD_TRIGGER_TIME, this, this.onHold)
        Laya.stage.once(Laya.Event.MOUSE_UP, this, this.onUp)
    }

    /** 松开按钮 */
    private onUp() {
        this._isApeHold = false
        Laya.timer.clear(this, this.onLoopClick)
        // 如果未触发hold，终止触发hold
        Laya.timer.clear(this, this.onHold)
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onUp)

        this.component.displayObject?.once(Laya.Event.MOUSE_DOWN, this, this.onDown)
        this.component.onClick(this, this.onClick)
    }

    private onHold() {
        this._isApeHold = true
        Laya.timer.loop(100, this, this.onLoopClick)
        this.onLoopClick()
    }

    private onLoopClick() {
        if (this._isApeHold) {
            // 先清理单击事件
            this.component.offClick(this, this.onClick)
            // 执行一次点击
            this.onClick(null)
            // 单次执行  直接执行清理结束操作
            if (this.single) this.onUp()
        } else {
            Laya.timer.clear(this, this.onLoopClick)
        }
    }

    private onClick(e: Laya.Event) {
        if (e) e.stopPropagation()
        runFun.apply(null, [this.callback, ...this.args])
    }

    get isApeHold() {
        return this._isApeHold
    }

    public dispose() {
        Laya.timer.clearAll(this)
        this.component.off(Laya.Event.MOUSE_DOWN, this, this.onDown)
        this.component.offClick(this, this.onClick)
    }

}