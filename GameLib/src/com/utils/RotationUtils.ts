import Tween = Laya.Tween
import MathKit = tsCore.MathKit;

export class RotationUtils {

    /** 当前速度 */
    private speed: number
    /** 加速度 */
    private addSpeed: number
    /** 要被旋转的对象 */
    private comp: fgui.GObject
    /** 总的角位移 */
    private rotationTotal: number
    /** 最终停止的位置 */
    private runEndIndex: number
    /** 旋转结束后调用函数 */
    private endCall: ParamHandler
    /** 转动开始消弱后调用函数 */
    private proCall: ParamHandler
    /** 缓动 */
    private tween: Laya.Tween

    /** 速度最大值 */
    public maxSpeed = 10
    /** 减速后最小值 */
    public minSpeed = 0
    /** 格子数量 */
    public count = 20
    /** 第一个奖区起始点与0点位置的偏移比例 */
    public skew = -0.5
    /** 最少圈数 */
    public minCircle = 5
    /** 最多圈数 */
    public maxCircle = 8
    /** 指针所停位置离奖区边缘的比例 */
    public offset = 0.5
    /** 旋转花费的时间，单位毫秒。 只有tween有用 */
    public duration = 1000 * 5

    /**
     *
     * @param comp 要旋转的对象
     * @param runEndIndex 最终停止的位置
     * @param callback 转动停止后调用函数
     * @param proCall 转动开始消弱后调用函数
     * @param isClockwise 是否是顺时针方向转动
     *
     */
    rollFrame(comp: fgui.GObject, runEndIndex: number, callback: ParamHandler, proCall?: ParamHandler, isClockwise = true) {
        this.roll(comp, runEndIndex, callback, proCall, true, isClockwise)
    }

    /**
     *
     * @param comp 要旋转的对象
     * @param runEndIndex 最终停止的位置
     * @param callback 转动停止后调用函数
     * @param proCall 转动开始消弱后调用函数
     * @param isClockwise 是否是顺时针方向转动
     *
     */
    rollTween(comp: fgui.GObject, runEndIndex: number, callback: ParamHandler, proCall?: ParamHandler, isClockwise = true) {
        this.roll(comp, runEndIndex, callback, proCall, false, isClockwise)
    }

    /**
     *
     * @param comp 要旋转的对象
     * @param runEndIndex 最终停止的位置
     * @param callback 转动停止后调用函数
     * @param proCall 转动开始消弱后调用函数
     * @param isFrame 是否使用帧动画播放
     * @param isClockwise 是否是顺时针方向转动
     *
     */
    private roll(comp: fgui.GObject, runEndIndex: number, callback: ParamHandler, proCall: ParamHandler, isFrame: boolean, isClockwise: boolean) {
        this.comp = comp
        this.endCall = callback
        this.proCall = proCall
        comp.rotation = comp.rotation % 360;//初始化角度

        this.runEndIndex = runEndIndex
        this.rotationTotal = MathKit.roundLong(this.count, runEndIndex, this.minCircle, this.maxCircle, this.skew, this.offset) //获取总长度
        if (isFrame) {
            this.rotationTotal -= comp.rotation
            if (!isClockwise) this.rotationTotal *= -1
            this.addSpeed = (this.maxSpeed * this.maxSpeed - this.minSpeed * this.minSpeed) / this.rotationTotal //获取加速度
            this.speed = 0;//初始化速度
            Laya.timer.frameLoop(1, this, this.runHandler)
        } else {
            if (!isClockwise) this.rotationTotal *= -1
            this.tween = Laya.Tween.to(comp, {
                rotation: this.rotationTotal,
                ease: Laya.Ease.expoInOut, complete: Laya.Handler.create(this, this.onRollEndHandler),
                update: new Laya.Handler(this, this.updateHandler)
            }, this.duration)

//				Ease.sineInOut
//				Ease.expoInOut
//				Ease.quadInOut
//				Ease.quartInOut
//				Ease.circInOut
//				Ease.cubicInOut

        }
    }

    private updateHandler() {
        let rt = this.rotationTotal - this.rotationTotal / 3
        if (rt <= this.comp.rotation) {
            runFun(this.proCall)
            this.proCall = null
        }
    }

    private onRollEndHandler() {
        this.tween = null
        runFun(this.endCall)
        this.endCall = null
    }

    private runHandler() {
        //如果速度到达最大速度开始减速
        if (this.speed >= this.maxSpeed) {
            this.speed = 2 * this.maxSpeed - this.speed;//最大速度超范围后修正回来!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!关键
            this.addSpeed = -this.addSpeed
            runFun(this.proCall)
            this.proCall = null
        }

        this.speed += this.addSpeed

        if (this.speed > 0) {
            this.comp.rotation += this.speed
        } else {
            Laya.timer.clear(this, this.runHandler)
            this.onRollEndHandler()
        }
    }

    /** 销毁动画 */
    diapose() {
        this.tween?.clear()
        this.tween = null
        this.endCall = null
        this.proCall = null
        if (this.comp) Laya.Tween.clearAll(this.comp)
        Laya.timer.clear(this, this.runHandler)
    }

    /** 立即停止到结束为止 */
    stop() {
        this.tween?.complete()
        this.tween = null
        this.endCall = null
        this.proCall = null
        if (this.comp) Tween.clearAll(this.comp)
        Laya.timer.clear(this, this.runHandler)
    }

}