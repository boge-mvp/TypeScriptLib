import Handler = Laya.Handler;

/**
 * 数字变动动画
 */
export class NumberTween {

    static NAME = "NumberTween"
    private static nums: NumberTween[] = []
    private static _gid = 0

    private gid: number
    private value = 0
    private target: any
    private complete: ParamHandler
    private update: ((value: number) => void) | Handler
    /** 当前运行的动画 */
    tween: Laya.Tween

    /**
     * 创建一个动画
     * @param target 缓动动画绑定类  用于执行清楚动画
     * @param start 开始值
     * @param end 结束值
     * @param duration 执行时长
     * @param ease 执行缓动动画
     * @param complete 执行完成
     * @param update 执行更新
     * @param delay 延迟执行
     */
    static createTween(target: any, start = 0, end = 0, duration = 300,
                       ease: Function = null, complete?: ParamHandler, update?: ((value: number) => void) | Handler, delay = 0) {
        if (start == end) {
            runFun(update, end)
            runFun(complete)
            return
        }
        let numberTween = Laya.Pool.getItemByClass(this.NAME, NumberTween)
        numberTween.value = start
        numberTween.target = target
        numberTween.complete = complete
        numberTween.update = update
        numberTween.gid = this.getGID()
        numberTween.tween = Laya.Tween.to(numberTween,
            {value: end, update: new Laya.Handler(numberTween, numberTween.updateHandler)},
            duration,
            ease,
            Laya.Handler.create(numberTween, numberTween.completeHandler),
            delay)
        this.nums.push(numberTween)
    }

    /**
     * 清理并销毁指定的动画
     * @param target 绑定的执行对象
     */
    static clearTween(target: any) {
        for (let i = 0; i < this.nums.length; i++) {
            let numberTween = this.nums[i]
            if (numberTween.target == target) {
                numberTween.dispose()
            }
        }
    }

    /**
     * 提前完成动画
     * @param target 要提前完成动画的对象
     */
    static completeTween(target: any) {
        for (let i = 0; i < this.nums.length; i++) {
            let numberTween = this.nums[i]
            if (numberTween.target == target) {
                // let complete = numberTween.complete
                numberTween.completeTween()
                // complete?.run()
            }
        }
    }

    /**
     * 获取指定对象监听的所有动画
     * @param target 动画对象
     */
    static getTween(target: any) {
        let tween: NumberTween[] = []
        for (let i = 0; i < this.nums.length; i++) {
            let numberTween = this.nums[i]
            if (numberTween.target == target) {
                tween.push(numberTween)
            }
        }
        return tween
    }

    private static getGID() {
        return this._gid++
    }

    private updateHandler() {
        runFun(this.update, this.value)
    }

    private completeHandler() {
        this.removeTween(this.gid)
        runFun(this.complete)
        Laya.Pool.recover(NumberTween.NAME, this)
    }

    /** 直接完成动画 */
    completeTween() {
        this.tween?.complete()
        this.tween = null
    }

    /**
     * 销毁 并清理动画
     */
    dispose() {
        this.update = null
        this.complete = null
        this.tween = null
        Laya.Tween.clearAll(this)
        this.removeTween(this.gid)
        Laya.Pool.recover(NumberTween.NAME, this)
    }

    /**
     * 根据动画id删除一个缓动动画
     * @param gid 动画id
     */
    private removeTween(gid: number) {
        for (let i = 0; i < NumberTween.nums.length; i++) {
            let numberTween = NumberTween.nums[i]
            if (numberTween.gid == gid) {
                NumberTween.nums.splice(i, 1)
                break
            }
        }
    }

}