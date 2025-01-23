import Browser = Laya.Browser;
import Log = tsCore.Log;
import {AppManager} from "../manager/AppManager"
import {SceneManager} from "../manager/SceneManager"
import {Player} from "../Player";

export class JSUtils {

    /**
     * 在处理 /开头的url 是否自动转义 成完整路径
     */
    static autoEscapeURL = true

    /**
     * 刷新页面  如果有父页面  刷新父页面
     */
    static reloadAll() {
        if (Browser.window.parent) {
            Browser.window.parent.location.reload()
        } else {
            Browser.window.location.reload()
        }
    }

    /** 刷新 */
    static reload() {
        Browser.window.location.reload()
    }

    /** 进入登录界面 /login */
    static login() {
        JSUtils.openPage("/login")
    }

    /** 充值 /deposit */
    static deposit() {
        JSUtils.openPage("/deposit")
    }

    /** 进入刮刮卡 /jackpot */
    static jackpot() {
        JSUtils.openPage("/jackpot")
    }

    /**
     * 打开指定的web页面 不关闭游戏的前提下
     * @param value
     * @deprecated
     * @see openPage
     */
    static openWebPageWithoutLeaveGame(value: string) {
        JSUtils.openPage(value, false)
    }

    /** 关闭游戏
     * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
     * @param [data = null]
     * */
    static gameClose(type = 0, data = null) {
        Log.debug(`gameClose->${type} ${data}`)
        SceneManager.inst.initComplete = false
        SceneManager.inst.isLoaderResComplete = false
        AppManager.callIOS("gameClose", {
            type: type,
            data: data
        }) ? SceneManager.inst.closeGame() : Browser.window.APP?.gameClose?.(type, data)
            || Browser.window.parent?.GameToHall?.gameClose?.(type, data)
            // 如果不是加速器 并且不是在非https下  那么直接返回大厅
            || (!Browser.onLayaRuntime && window.location.protocol == "https:") && (window.location.href = `//${window.location.host}`)
        AppManager.showWeb({javascript: `window.GameToHall.gameClose(${type}, ${data})`})
        SceneManager.inst.closeGame()
    }

    /**
     * 弹窗
     * @param msg 内容文本
     * @param title 标题
     * @param okText ok文本
     * @param cancelText 取消文本
     */
    static alert(msg: string, title = "", okText = "", cancelText = "") {
        Log.debug(`alert-> msg:${msg}, title=${title}, okText=${okText}, cancelText=${cancelText}`)
        if (AppManager.callIOS("alert", {msg: msg, title: title, ensureTv: okText, cancelTv: cancelText})) return
        Browser.window.APP?.alert?.(msg, title, okText, cancelText) ||
        Browser.window.parent?.GameToHall?.alert?.(msg) ||
        Browser.window.parent?.GameToHall?.openModal?.(msg)
        AppManager.showWeb({javascript: `window.GameToHall.alert && window.GameToHall.alert('${msg}')`})
        AppManager.showWeb({javascript: `window.GameToHall.openModal && window.GameToHall.openModal('${msg}')`})
    }

    /**
     * 打开一个原生页面
     * @param page 页面 如： "/giftPage?token=***"
     * login,register,userSetting,webDetail,gameDetail,editNickName,forgetMain,changePwd,home,deposit,promotion,withdraw,profile
     * @param [isCloseGame=true] 是否关闭游戏
     *
     * @example
     *
     * openPage("//{host}/{lang}/page") = url= //www.google.com/en/page
     *
     *
     */
    static openPage(page: string | OpenPage, isCloseGame = true) {
        Log.debug(`openPage-> page:${page}, isCloseGame=${isCloseGame}`)
        if (typeof page === "string") {
            page = {page: page, isCloseGame: isCloseGame}
        }
        page.type ??= 0
        // 双斜杠开头  默认添加协议头
        if (page.page.startsWith("//"))
            page.page = window.location.protocol + page.page
        else if (JSUtils.autoEscapeURL && page.page.startsWith("/")) page.page = `${window.location.protocol}//{host}/{lang}` + page.page

        // 替换域名和 语言
        page.page = page.page.replace(/{host}/g, window.location.host)
            .replace(/\/{lang}/g, Player.inst.urlParam.language ? "/" + Player.inst.urlParam.language : "")


        if (AppManager.callIOS("openPage", page)) return
        Browser.window.APP?.openPage?.(page, isCloseGame)
        Browser.window.parent?.GameToHall?.openPage?.(page.page, isCloseGame)
        if (isCloseGame) {
            Browser.window.parent?.GameToHall?.comeWebPage?.(page.page)
            AppManager.showWeb({javascript: `window.GameToHall.openPage && window.GameToHall.openPage('${page.page}')`})
            AppManager.showWeb({javascript: `window.GameToHall.comeWebPage && window.GameToHall.comeWebPage('${page.page}')`})
            SceneManager.inst.closeGame()
        } else {
            Browser.window.parent?.GameToHall?.openWebPageWithoutLeaveGame?.(page.page)
            AppManager.showWeb({javascript: `window.GameToHall.openWebPageWithoutLeaveGame('${page.page}')`})
        }
    }

    static callMethod(methodName: string, args?: any[]) {
        Log.debug(`callMethod-> methodName:${methodName}, args=${args}`)
        if (AppManager.callIOS(methodName, args)) return
        Browser.window.APP?.[methodName]?.call(null, ...args)
        Browser.window.parent?.GameToHall?.[methodName]?.call(null, ...args)
    }

    /** 进入游戏进度条 */
    static progress(value: number) {
        Log.debug(`progress->${value}`)
        if (AppManager.callIOS("progress", {value: value}, false)) return
        Browser.window.parent?.GameToHall?.progress?.(value)
        Browser.window.parent?.GameToHall?.getProgress?.(value)
        Browser.window.APP?.progress?.(value)
        Laya.Browser.window.loadingView?.executionJavascript?.("window.GameToHall.getProgress(" + value + ")")
        Laya.Browser.window.loadingView?.loading?.(value)
        AppManager.executionJavascript("window.GameToHall.progress && window.GameToHall.progress", value)
        AppManager.executionJavascript("window.GameToHall.getProgress && window.GameToHall.getProgress", value)
    }

    /**
     * 原生应用获取顶部的刘海屏高度
     *
     */
    static getSafeAreaTop(): number {
        if (AppManager.callIOS("getSafeAreaTop"))
            return 0
        return Browser.window.APP?.getSafeAreaTop?.() ?? 0
    }

    static getProgress = JSUtils.progress

    /** 通知进入游戏了 */
    static gameOnload() {
        Log.debug("gameOnload->")
        if (AppManager.callIOS("gameOnload")) return
        Browser.window.parent?.GameToHall?.gameOnload?.()
        Browser.window.APP?.gameOnload?.()
        Browser.window.conchMarket?.gameOnload?.()
        AppManager.executionJavascript("window.GameToHall.gameOnload", null)

    }

    /** 上传头像 */
    static uploadAvatar() {
        Log.debug("uploadAvatar->")
        if (AppManager.callIOS("uploadAvatar")) return
        Browser.window.parent?.GameToHall?.uploadAvatar?.()
        Browser.window.parent?.GameToHall?.openReviseAvatarNickNameDrawer?.()
        AppManager.showWeb({javascript: "window.GameToHall.uploadAvatar && window.GameToHall.uploadAvatar()"})
        AppManager.showWeb({javascript: "window.GameToHall.openReviseAvatarNickNameDrawer && window.GameToHall.openReviseAvatarNickNameDrawer()"})
    }

    /**
     * @deprecated
     * @see JSUtils.uploadAvatar
     */
    static updateHead = JSUtils.uploadAvatar
    /**
     * @deprecated
     * @see JSUtils.alert
     */
    static openModal = JSUtils.alert

}
