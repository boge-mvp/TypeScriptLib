import {MathKit} from "./MathKit"
import {BindInputButton} from "./BindInputButton"
import {LongPressBtn} from "./LongPressBtn"
import {Log} from "../Log";

/**
 * 包装常用方法
 */
export class UtilKit {

    private static hiddenIFrameID = 'hiddenDownloader'

    /**
     * 下载文件
     * @param url
     */
    static downloadURL(url: string) {
        let iframe: any = document.getElementById(this.hiddenIFrameID)
        if (iframe === null) {
            iframe = document.createElement('iframe')
            iframe.id = this.hiddenIFrameID
            iframe.style.display = 'none'
            document.body.appendChild(iframe)
        }
        iframe.src = url

    }

    /**
     * 获取浏览器传入的参数
     * @param name 参数名字
     *
     */
    static getQueryString(name: string) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
        let r = window.location.search.substring(1).match(reg)
        if (r) return decodeURI(r[2])
        return null
    }

    /**
     * 获取浏览器传入的所有参数
     * @return 所有的参数key=value
     */
    static getRequest() {
        let url = window.location.search; //获取url中"?"符后的字串
        let theRequest: any = {}
        if (url.indexOf("?") != -1) {
            let str = url.substring(1)
            let strs = str.split("&")
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1])
            }
        }
        return theRequest
    }

    /** 随机数  最小值  最大值(不包括)  */
    static random(minNum: number, maxNum: number) {
        return (Math.floor(Math.random() * (maxNum - minNum)) + minNum)
    }

    /**
     * 随机数
     * @param minNum 最小值
     * @param maxNum 最大值(不包括)
     * @param p 保留尾数  默认NAN 表示全保留
     * @return
     */
    static randomFloat(minNum: number, maxNum: number, p = NaN) {
        let temp = (Math.random() * (maxNum - minNum) + minNum)
        if (!isNaN(p)) temp = MathKit.toFixed(temp, p)
        return temp
    }

    /** 绑定输入框和按钮  当输入框中都存在值后  按钮变成可点击 */
    static bindInputBtn(confirmBtn: fgui.GButton, ...goldText: any[]) {
        return new BindInputButton(confirmBtn, goldText)
    }

    /** 绑定按钮长按、点击 */
    static bindLongPressBtn(confirmBtn: fgui.GButton, callback: ParamHandler, ...args: any[]) {
        return new LongPressBtn(confirmBtn, callback, ...args)
    }

    /**
     * 比较两个值  获得返回值   用于数组排序   从小到大
     * @param aPrice 第一个值
     * @param bPrice 第二个值
     * @return 大于第二个值  1   小于第二个值 -1 相等 0
     *
     */
    static compare(aPrice: number, bPrice: number) {
        if (aPrice > bPrice) {
            return 1
        } else if (aPrice < bPrice) {
            return -1
        } else {
            return 0
        }
    }

    /**
     * 比较两个值  获得返回值   用于数组排序   从大到小
     * @param aPrice 第一个值
     * @param bPrice 第二个值
     * @return 大于第二个值  1   小于第二个值 -1 相等 0
     *
     */
    static compareOn(aPrice: number, bPrice: number) {
        if (aPrice > bPrice) {
            return -1
        } else if (aPrice < bPrice) {
            return 1
        } else {
            return 0
        }
    }

    /**
     * 随机生成字符串
     */
    static randomChar() {
        let x: string = "0123456789qwertyuioplkjhgfdsazxcvbnm"
        let tmp: string = ""
        for (let i = 0; i < 32; i++) {
            tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length)
        }
//            tmp += Browser.now()
        return tmp
    }

    /**
     * 检查谷歌当前版本是否满足最小的版本
     * @param checkVersion 最小的版本号
     * @return
     */
    static checkChromeBrowserVersion(checkVersion: number) {
        let agent = window.navigator.userAgent.toLowerCase()
        if (agent.indexOf("applewebkit") > -1) {
            if (/chrome\/(\d+\.\d)/i.test(agent)) {
                let ver = +RegExp['\x241']
                Log.debug("check browser version = " + ver)
                if (ver >= checkVersion) {
                    return true
                }
            }
        }
        return false
    }

}

/**
 * @deprecated
 * @see UtilKit
 */
export const UtilsTool = UtilKit