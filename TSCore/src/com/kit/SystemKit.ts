import {App} from "../App";
import {Log} from "../Log";
import Browser = Laya.Browser;
import {StringUtil} from "../utils/StringUtil";

export class SystemKit {

    /**
     * 获取移动设备的刘海屏高度
     * @example
     * 需要再html中注入css 用来获取环境值
     *
     * <style>
     *      .safe-area {
     *         padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)
     *       }
     * </style>
     */
    static get notchHeight() {
        // 获取元素
        const element = document.querySelector('.safe-area')
        let top = 0
        if (element) {
            // 获取计算样式
            let style = window.getComputedStyle(element)
            let paddingTop = style.getPropertyValue('padding-top')
            let paddingBottom = style.getPropertyValue('padding-bottom')
            top = StringUtil.getNumbers(paddingTop) + StringUtil.getNumbers(paddingBottom)
        }
        if (top <= 0) top = window.innerHeight - document.documentElement.clientHeight
        return top
    }

    /**
     * 在启用刘海屏模式下会调用指定方法并得到刘海屏信息
     * @param value
     */
    static set onNotch(value: (height: number) => any) {
        if (Browser.onMobile && App.inst.options.isNotchEnable) {
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


    private static _wakeLock: WakeLock

    /**
     * 锁定屏幕常量
     */
    static wakeLock() {
        SystemKit._wakeLock ??= new WakeLock()
        SystemKit._wakeLock.wakeLock()
    }

    /**
     * 释放常量
     */
    static wakeUnlock() {
        SystemKit._wakeLock?.wakeUnlock()
    }

}

class WakeLock {

    /**
     * create a reference for the wake lock
     * @type WakeLockSentinel
     */
    private _wakeLock: any = null

    /**
     * 锁定屏幕常量
     */
    wakeLock() {
        this.requestWakeLock().then()
    }

    /**
     * 释放常量
     */
    wakeUnlock() {
        this._wakeLock?.release().then(() => {
            this._wakeLock = null
            document.removeEventListener('visibilitychange', this.handleVisibilityChange)
        })
    }

    private async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this._wakeLock = await (navigator as any).wakeLock?.request('screen')
                this._wakeLock.onrelease = function (ev) {
                    console.log(ev)
                }
                this._wakeLock.addEventListener('release', (ev: Event) => {
                    console.log(ev)
                })
                document.addEventListener('visibilitychange', this.handleVisibilityChange)
            } catch (err) {
                // 如果唤醒锁定请求失败 - 通常与系统相关，例如电池
            }
        }
    }

    private handleVisibilityChange() {
        if (this._wakeLock !== null && document.visibilityState === 'visible') {
            this.requestWakeLock().then()
        }
    }

}