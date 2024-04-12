import GLoader = fgui.GLoader;
import LoaderFillType = fgui.LoaderFillType;
import Pool = Laya.Pool;
import Tween = Laya.Tween;
import TimeLine = Laya.TimeLine;
import Event = Laya.Event;
import BezierCurves = tsCore.BezierCurves;

/**
 * 具有贝塞尔曲线运动的loader
 */
export class GoldLoader extends mixinExt(BezierCurves, GLoader) {

    static readonly NAME = "GoldLoaderPool"
    private _timeLine: TimeLine
    private playEndCallback: ParamHandler
    private playEndRecover = false

    /**
     * 从对象池获取一个 GoldLoader
     */
    static create() {
        return Pool.getItemByClass(GoldLoader.NAME, GoldLoader)
    }

    constructor() {
        super()
        this.fill = LoaderFillType.Scale
        this.setPivot(.5, .5)
    }

    /**
     * 将对象放到对应类型标识的对象池中。
     */
    override recover() {
        this._timeLine?.pause()
        this._timeLine?.reset()
        Tween.clearAll(this)
        Laya.timer.clearAll(this)
        this.removeFromParent()
        super.recover()
        // 还原属性初始值
        this.fill = LoaderFillType.Scale
        this.setPivot(.5, .5)
        this.autoSize = false
        this.rotation = 0
        this.setSkew(0, 0)
        this.setScale(1, 1)
        this.alpha = 1
        this.visible = true
        this.icon = null
        Pool.recover(GoldLoader.NAME, this)
    }

    override dispose() {
        this.recover()
        // super.dispose();
    }

    getTimeLine(callback?: ParamHandler) {
        if (!this._timeLine) {
            this._timeLine = new TimeLine()
            this._timeLine.on(Event.COMPLETE, this, this.onPlayEnd)
        } else this._timeLine.reset()
        this.playEndCallback = callback
        return this._timeLine
    }

    timeLine(callback?: ParamHandler) {
        this.getTimeLine(callback)
        return this
    }

    /**
     * 控制一个对象，从当前点移动到目标点。
     * @param props 要控制对象的属性。
     * @param duration 对象TWEEN的时间。
     * @param ease 缓动类型
     * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    to(props: any, duration: number, ease?: Function, offset?: number) {
        this._timeLine?.to(this, props, duration, ease, offset)
        return this
    }

    /**
     * 从 props 属性，缓动到当前状态。
     * @param props 要控制对象的属性。
     * @param duration 对象TWEEN的时间。
     * @param ease 缓动类型
     * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    from(props: any, duration: number, ease?: Function, offset?: number) {
        this._timeLine?.from(this, props, duration, ease, offset)
        return this
    }

    /**
     * 播放动画。
     * @param timeOrLabel 开启播放的时间点或标签名。
     * @param loop 是否循环播放。
     */
    play(timeOrLabel?: any, loop?: boolean) {
        this.playEndRecover = false
        this._timeLine?.play(timeOrLabel, loop)
        return this
    }

    /**
     * 播放动画。播放结束后回收自身
     * @param timeOrLabel 开启播放的时间点或标签名。
     * @param loop 是否循环播放。
     */
    playToRecover(timeOrLabel?: any, loop?: boolean) {
        this.playEndRecover = true
        this._timeLine?.play(timeOrLabel, loop)
        return this
    }

    private onPlayEnd() {
        runFun(this.playEndCallback)
        if (this.playEndRecover) this.recover()
    }
}