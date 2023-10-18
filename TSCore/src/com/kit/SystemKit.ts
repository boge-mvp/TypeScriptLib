import {App} from "../App";
import {Log} from "../Log";
import Browser = Laya.Browser;

export class SystemKit {

    /**
     * 获取设备刘海屏高度
     */
    static get notchHeight() {
        return (window.innerHeight - document.documentElement.clientHeight) /* / Laya.Browser.pixelRatio */
    }

    /**
     * 在启用刘海屏模式下会调用指定方法并得到刘海屏信息
     * @param value
     */
    static set onNotch(value: (height: number) => any) {
        if (App.inst.options.isNotchEnable) {
            let cacheNotch = 0
            let startTime = Browser.now() // 首次执行时间
            function notchFun() {
                const notch = SystemKit.notchHeight
                if (notch > 0) {
                    Log.debug(`Successfully obtained the height of the bangs = ${notch}`)
                    Laya.timer.callLater(this, getNotchEnd)
                } else {
                    if (Browser.now() - startTime > 1000 * 10) {
                        // 如果10S 还未获取到刘海屏  延迟获取间隔
                        Log.debug("After 1 seconds, the height of the bangs screen is obtained again")
                        Laya.timer.once(1000, this, notchFun)
                    } else {
                        Log.debug("After 10 millisecond, the height of the bangs screen is obtained again")
                        Laya.timer.once(10, this, notchFun)
                    }
                }
            }

            function getNotchEnd() {
                cacheNotch = SystemKit.notchHeight
                Log.debug(`notchHeight2=${cacheNotch}`)
                value(cacheNotch)
            }

            Laya.timer.callLater(this, notchFun)
        }
    }

}