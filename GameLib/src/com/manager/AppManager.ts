import Browser = Laya.Browser
import IPlatform = tsCore.IPlatform;
import StringUtil = tsCore.StringUtil;
import Log = tsCore.Log;
import NativeUtils = tsCore.NativeUtils;

/** app管理器 */
export class AppManager {

    private static jsToJava: IPlatform

    /** 关闭app自定义返回 */
    static closeAppBack() {
        if(AppManager.callIOS("runJs", {js: "appKeyBack()"})) return
        // @ts-ignore
        window.conch?.setOnBackPressedFunction(function () {})
    }

    /** 进入游戏 */
    static sendAppData() {
        this.log("sendAppData")
        if (Browser.onLayaRuntime)
            this.LP_enterBBS(JSON.stringify(''), this.nullFun)
    }

    /**
     * Firebase 上报事件，事件数据为字符串
     * @param sData {'eventName' : "faqpage",  ‘eventValue’: "value"}
     * @param callback
     *
     */
    static enterFeedback(sData: { eventName: string, eventValue?: string }, callback: Function) {
        if (AppManager.callIOS("reportFbEmpEvent", {eventName: sData.eventName, eventValue: sData.eventValue})) return
        if (Browser.onLayaRuntime)
            this.LP_enterFeedback(JSON.stringify(sData), callback)
    }

    /**
     * Firebase 上报事件，事件数据为数字
     * @param sData { eventName : "gametime", eventValue: 1000}
     * @param callback
     *
     */
    static enterInvite(sData: any, callback: Function) {
        if (Browser.onLayaRuntime)
            this.LP_enterInvite(JSON.stringify(sData), callback)
    }

    /** Toast 提示 */
    static toast(sData: string) {
        let obj = {action: 10005, value: sData}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /** 退出APP */
    static exit() {
        if (AppManager.callIOS("exitApp")) return
        let obj = {action: 10008}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /** 上传头像 */
    static UpdateHead(token: string) {
        // type 1.返回选择的图片路径  2.返回图片base64数据
        let obj = {action: 10004, value: token, type: 1}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /** 游戏重启 */
    static gameRestart() {
        let obj = {action: 10021}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /** 关闭网页 */
    static closeHtml() {
        let obj = {action: 10000}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 获取设备唯一id
     * @param callback
     */
    static getIMEI(callback: Function) {
        // if (AppManager.isIOS("getDeviceID")) return
        let obj = {action: 10001}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), callback)
    }


    static IsBackHome() {
        let obj = {action: 10002}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 发送推送
     * @param value
     */
    static sendNotification(value: any) {
        let obj = {action: 10003, data: value}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 调用分享窗口
     * @param content 文本内容
     * @param url 网址
     * @param type 0.调用公用分享窗口 1.facebook 2.whatsapp 3.instagram 4.sms 5.twitter
     */
    static openShare(content: string, url = "", type = 0) {
        if (AppManager.callIOS("showShareBySystem", {
            type: type,
            text: content + (url ? "" : "\n" + url)
        })) return
        if (!Browser.onLayaRuntime) return
        let obj: any = {}
        if (type === 0) {
            obj.content = content + (StringUtil.isEmpty(url) ? "" : "\n" + url)
            this.LP_enterShareAndFeed(JSON.stringify(obj), this.nullFun)
        } else {
            let obj = {action: 10027, data: content + (StringUtil.isEmpty(url) ? "" : "\n" + url)}
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
        }
    }

    /**
     * 执行 javascript
     * @param method 执行方法体
     * @param value 方法传入的方法
     */
    static executionJavascript(method: string, value: any) {
        if (!(typeof value == "string")) value = JSON.stringify(value)
        let obj = {action: 10009, method: method, data: value}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * android 打印
     * @param value
     */
    static log(value: string) {
        if (Browser.onLayaRuntime) {
            let obj = {action: 10010, data: value}
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
        } else {
            Log.info(value)
        }
    }

    /**
     * 用默认浏览器打开url
     * @param url
     */
    static openBrowser(url: string) {
        if (AppManager.callIOS("openBrowser", {url: url})) return
        let obj = {action: 10012, data: url}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 拷贝字符串到剪贴板
     * @param data
     */
    static clipData(data: string) {
        let obj = {action: 10013, data: data}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 下载文件
     * @param url 文件地址
     * @param title 标题
     * @param des 介绍
     */
    static downloadFile(url: string, title: string, des: string) {
        let obj = {action: 10014, data: url, title: title, des: des}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 设置角标数字
     * @param value 显示的数字
     */
    static sendShortcutBadger(value: number) {
        let obj = {action: 10015, data: value}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 打开app
     * @param packageName 包名
     * @param uriPath 网页打开app方式 "gamemania://com.casino.gamemania/path"
     * @param url url
     * @param jsonData 传送的json数据
     */
    static openApp(packageName: string, uriPath: string, url: string, jsonData = null) {
        let obj = {
            action: 10016,
            packageName: packageName,
            uriPath: uriPath,
            url: url,
            jsonData: JSON.stringify(jsonData)
        }
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun)
    }

    /**
     * 获取 application meta-data 配置
     * @param key
     * @param callback
     */
    static getMetaData(key: string, callback: Function) {
        let obj = {action: 10017, key: key}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), callback)
    }

    /** 显示游戏 */
    static showGame(value: any) {
        let obj = {action: 10018, data: value}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    /** 显示网页 */
    static showWeb(value: any) {
        let obj = {action: 10019, data: value}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    static umengTest() {
        let obj = {action: -100, method: "test", data: ["s", "2"]}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    /**
     * 统计用户账号
     * @param Provider 账号来源。如果用户通过第三方账号登陆，可以调用此接口进行统计。支持自定义，不能以下划线”_”开头，使用大写字母和数字标识，长度小于32 字节; 如果是上市公司，建议使用股票代码。
     * @param ID 用户账号ID，长度小于64字节
     */
    static onProfileSignIn(Provider: string, ID: string) {
        let obj = {action: -100, method: "onProfileSignIn", data: [Provider, ID]}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    /**
     * 账号登出
     */
    static onProfileSignOff() {
        let obj = {action: -100, method: "onProfileSignIn", data: []}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    /**
     * 真实消费
     * 这部分API用来统计用户(或者玩家) 在游戏内付费的统计，包括购买虚拟币，道具等。
     * @param money 本次消费金额(非负数)。
     * @param coin 本次消费的等值虚拟币(非负数)。
     * @param source 支付渠道, 1 ~ 99 之间的整数， 1-8 已经被预先定义, 9~99 之间需要在网站设置。
     */
    static pay(money: number, coin: number, source: number) {
        let obj = {action: -100, method: "pay", data: [money, coin, source]}
        if (Browser.onLayaRuntime)
            this.LP_SendMessageToPlatform(JSON.stringify(obj), null)
    }

    /**
     * 显示加载进度
     * @param value 当前加载进度
     * @param tempCount 当前加载进度模块 1 开始
     * @param totalCount 总共要加载的模块数
     */
    static showLoadingPro(value: number, tempCount: number, totalCount: number) {
        if (Browser.window.loadingView) {
            // 先算出每一份 占用的百分比份量
            let pieces = 100 / totalCount
            // 得出当前加载所占百分比的数量
            let pro = value / 100 * pieces
            let totalPro = pieces * (tempCount - 1) + pro
            let finalTotalPro = Math.ceil(totalPro)
            Browser.window.loadingView.loading(finalTotalPro)
        }
    }

    // /** 关闭加载界面 */
    // static hideLoadingView() {
    //     if (Browser.window.loadingView)
    //         Browser.window.loadingView.hideLoadingView()
    // }

    static LP_SendMessageToPlatform(json: string, callback: Function) {
        if (Browser.window.conchMarket) {
            Browser.window.conchMarket.sendMessageToPlatform(json, callback)
            return
        }
        this.LP_init()
        this.jsToJava.callWithBack(callback, "LP_sendMessageToPlatform", json)
    }

    static LP_enterBBS(json: string, callback: Function) {
        if (Browser.window.conchMarket) {
            Browser.window.conchMarket.enterBBS(json, callback)
            return
        }
        this.LP_init()
        this.jsToJava.callWithBack(callback, "LP_enterBBS", json)
    }

    static LP_enterFeedback(json: string, callback: Function) {
        if (Browser.window.conchMarket) {
            Browser.window.conchMarket["enterFeedback"](json, callback)
            return
        }
        this.LP_init()
        this.jsToJava.callWithBack(callback, "LP_enterFeedback", json)
    }

    static LP_enterInvite(json: string, callback: Function) {
        if (Browser.window.conchMarket) {
            Browser.window.conchMarket.enterInvite(json, callback)
            return
        }
        this.LP_init()
        this.jsToJava.callWithBack(callback, "LP_enterInvite", json)
    }

    static LP_enterShareAndFeed(json: string, callback: Function) {
        if (Browser.window.conchMarket) {
            Browser.window.conchMarket.enterShareAndFeed(json, callback)
            return
        }
        this.LP_init()
        this.jsToJava.callWithBack(callback, "LP_enterShareAndFeed", json)
    }

    static LP_init() {
        if (!this.jsToJava) {
//            let pc:* = __JS__("PlatformClass.clsMap")
//            log(pc+"")
//
////            let obj:any = Browser.window.PlatformClass.clsMap
////            log(obj+"")
//            if (pc) {
//                for (let key:string in pc) {
//                    log(key)
//                }
//            }
            this.jsToJava = NativeUtils.PlatformClass.createClass("layaair.game.Market.MarketTest").newObject()
            this.jsToJava.call("LP_Init")
        }
    }

    /** 空方法 */
    static nullFun(data: any) {
    }

    static get isIOS() {
        // @ts-ignore
        return (typeof window.webkit !== 'undefined' && typeof window.webkit.messageHandlers !== 'undefined') ? window.webkit.messageHandlers : null
    }

    static callIOS(method: string, data?: any) {
        const webkit = AppManager.isIOS
        if (webkit) {
            data ??= {}
            webkit?.[method]?.postMessage?.(JSON.stringify(data))
            return true
        }
        return false
    }

}
