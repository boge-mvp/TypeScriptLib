import GObject = fgui.GObject

/**
 * 闪烁动画
 */
export class TwinkleAniUtils {

    private callback: ParamHandler

    /**
     * 指定对象闪烁
     * @param target 对象
     * @param count 闪烁次数
     * @param callback 完成回调
     */
    play(target: GObject, count: number, callback: ParamHandler) {
        this.callback = callback
        target["twinkleAni"] = {count: 0, maxCount: count}
        Laya.timer.frameLoop(5, this, this.onTwinkle, [target])
    }

    private onTwinkle(target: GObject) {
        let obj = target["twinkleAni"]
        obj.count++
        if (obj.count % 2 == 0) {
            target.alpha = 1
        } else {
            target.alpha = .5
        }
        if (obj.count >= obj.maxCount) {
            Laya.timer.clear(this, this.onTwinkle)
            runFun(this.callback)
        }
    }

    dispose() {
        this.callback = null
        Laya.timer.clear(this, this.onTwinkle)
    }


}