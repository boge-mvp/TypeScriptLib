import {MathKit} from "./MathKit"
import {Log} from "../Log";
import {LongPressKit} from "./LongPressKit";
import {BindInputKit} from "./BindInputKit";

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
        if (!iframe) {
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
        let theRequest: { [key: string]: string } = {}
        if (url.indexOf("?") != -1) {
            let str = url.substring(1)
            let strs = str.split("&")
            for (let i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1])
            }
        }
        return theRequest
    }

    /** 绑定输入框和组件  当输入框中都存在值后  组件变成可点击 */
    static bindInputKit(confirmBtn: fgui.GComponent, ...panel: any[]) {
        return new BindInputKit(confirmBtn, ...panel)
    }

    /** 绑定按钮长按、点击 */
    static bindLongPressKit(confirmBtn: fgui.GComponent, callback: ParamHandler, ...args: any[]) {
        return new LongPressKit(confirmBtn, callback, ...args)
    }

    /** @deprecated */
    static bindInputBtn = UtilKit.bindInputKit
    /** @deprecated */
    static bindLongPressBtn = UtilKit.bindLongPressKit

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

    static evil(fn) {
        //一个变量指向Function，防止有些前端编译工具报错
        return new Function('return ' + fn)()
    }

    /**
     * 添加动态代码
     * @param content javascript字符串代码
     * @param removeLast 添加后立马删除
     * @param sourceURL 是否添加映射文件名
     */
    static loadScript(content: string, removeLast = true, sourceURL?: string) {
        if (sourceURL) content += '\n//@ sourceURL=' + sourceURL
        let script = document.createElement('script')
        script.type = "text/javascript"
        script.text = content
        document.getElementsByTagName('head')[0].appendChild(script)
        removeLast && document.head.removeChild(document.head.lastChild)
    }

    /**
     * 交换数组中的两个值的位置
     * @param value 数组
     * @param stateIndex 要被切换掉的值
     * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
     *
     */
    static swapValue(value: any[], stateIndex: number, endIndex: number) {
        if (stateIndex < value.length && endIndex < value.length) {
            let i = value[stateIndex]
            let i2 = value[endIndex]
            value.splice(endIndex, 1, i)
            value.splice(stateIndex, 1, i2)
        }
    }

    /**
     * 改变值的位置(将数组中的一个值修改到其它位置)
     * @param value 数组
     * @param stateIndex 要被切换掉的值
     * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
     *
     */
    static changeValue(value: any[], stateIndex: number, endIndex: number) {
        if (stateIndex < value.length && endIndex < value.length) {
            let i = value.splice(stateIndex, 1)
            value.splice(endIndex, 0, i[0])
        }
    }

    /**
     * 高度适配
     * @param obj 适配对象
     */
    static heightAdaptation(obj: fgui.GObject) {
        let scale = obj.width / obj.initWidth
        obj.height = obj.initHeight * scale
        // 如果有字体
    }

    /**
     * 去除重复值
     * @param array
     */
    static removeRepeat(array: any[]) {
        return array.filter((value, index, arr) => arr.indexOf(value) == index)
    }

    /**
     * aes加密
     * @deprecated
     */
    static encrypt(word, key = "abcdefgabcdefg12") {
        let keyWordArray = CryptoJS.enc.Utf8.parse(key)
        let srcs = CryptoJS.enc.Utf8.parse(word)
        let encrypted: any = CryptoJS.AES.encrypt(srcs, keyWordArray, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        })
        return encrypted.toString()
    }

    /**
     *  aes解密
     *  @deprecated
     */
    static decrypt(word, key = "abcdefgabcdefg12") {
        let keyWordArray = CryptoJS.enc.Utf8.parse(key)
        let decrypt = CryptoJS.AES.decrypt(word, keyWordArray, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        })
        return CryptoJS.enc.Utf8.stringify(decrypt).toString()
    }

    /**
     * 使用AES-GCM算法加密字符串，每次加密都应生成新的随机IV，不重复使用相同IV和密钥的组合
     * @param word 需要加密的明文字符串
     * @param key 用于加密的CryptoKey对象
     * @returns {{ArrayBuffer, Uint8Array<ArrayBuffer>}} 包含密文和初始化向量的对象
     */
    static async encryptAesGCM(word: string, key: CryptoKey) {
        const iv = crypto.getRandomValues(new Uint8Array(12)) // 12个uint 96位
        const encodedText = new TextEncoder().encode(word)
        const encrypted = await crypto.subtle.encrypt({
            name: "AES-GCM",
            iv,
            tagLength: 128
        }, key, encodedText)
        return {ciphertext: encrypted, iv}
    }

    /**
     * 生成AES-GCM加密算法所需的密钥
     * @returns {CryptoKey} 生成的CryptoKey对象，可用于加密和解密操作
     */
    static async generateKey() {
        return await crypto.subtle.generateKey({
            name: "AES-GCM",
            length: 256
        }, true, ["encrypt", "decrypt"])
    }

    /**
     * 使用AES-GCM算法解密密文
     * @param word 需要解密的密文数据
     * @param key 用于解密的CryptoKey对象
     * @param iv 初始化向量，必须与加密时使用的相同
     * @return {string} 解密后的明文字符串
     */
    static async decryptAesGCM(word: BufferSource, key: CryptoKey, iv: Uint8Array<ArrayBuffer>) {
        const decrypted = await crypto.subtle.decrypt({
                name: "AES-GCM",
                iv,
                tagLength: 128
            },
            key, word)
        return new TextDecoder().decode(decrypted)
    }


    /**
     * 文字长度省略
     * @param value 文字内容
     * @param len 最大长度
     * @param symbol 符号
     */
    static stringOmit(value: string, len: number, symbol = "...") {
        let str = value
        if (str && str.length > len) {
            str = str.substring(0, len)
            str += symbol
        }
        return str
    }

    /**
     * 打乱数组
     * @param array 要被打乱的数组
     * @deprecated
     * @see Array.shuffle()
     */
    static shuffle(array: any[]) {
        let rnd: number
        let tmp: any
        let len = array.length
        for (let i = 0; i < len; i++) {
            tmp = array[i]
            rnd = parseInt(Math.random() * len + "")
            array[i] = array[rnd]
            array[rnd] = tmp
        }
    }

    /**
     * 字格式
     * @param value 数值
     * @param beyondLimit 超过此值否才分隔 (默认 1000)
     * @param limit 分隔值 按照此值分隔 (默认 1000)
     * @param unit 单位  (默认 K)
     * @param fixed 最后保留几位小数 (默认 2)
     * @return
     */
    static numberConvert(value: number, beyondLimit = 1000, limit = 1000, unit = "K", fixed = 2) {
        if (value >= beyondLimit)
            return MathKit.toFixed(value / limit, fixed) + unit
        return MathKit.toFixed(value, fixed) + ""
    }

    /**
     * 将100000转为100,000.00形式
     * @param money
     * @param fixed 是否保留小数(默认false)
     * @return
     */
    static formatMoney(money: string | number, fixed = false) {
        if (money) {
            money = money + ""
            let left = money.split('.')[0]
            let right = money.split('.')[1]
            right = right ? (right.length >= 2 ? '.' + right.substring(0, 2) : '.' + right + '0') : '.00'
            if (!fixed) right = ""
            let temp = left.split('').reverse().join('').match(/(\d{1,3})/g)
            return (parseFloat(money) < 0 ? "-" : "") + temp.join(',').split('').reverse().join('') + right
        } else if (money === 0) {   //注意===在这里的使用，如果传入的money为0,if中会将其判定为boolean类型，故而要另外做===判断
            return fixed ? '0.00' : "0"
        } else {
            return fixed ? '0.00' : "0"
        }
    }

    /**
     * 将100,000.00转为100000形式
     * @param money
     * @param fixed 是否保留小数 (默认false)
     * @return
     */
    static formatMoney2(money: string | number, fixed = false) {
        if (money) {
            money = money + ""
            let group = money.split('.')
            let left = group[0].split(',').join('')
            return fixed ? parseFloat(left + "." + group[1]) : parseFloat(left)
        } else {
            return 0
        }
    }

}