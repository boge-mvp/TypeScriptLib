import Browser = Laya.Browser;
import {Log} from "../Log";
import {IRecord} from "../interfaces/ICommon";

/**
 * app 访问记录管理
 * @author boge
 */
export class HistoryManager {

    /**
     * 访问记录
     */
    private static history: PageNavigator[] = []
    /** 暂停返回上一页 */
    static pauseHistory = false

    /**
     * 添加一个记录
     * @param currentPage 当前的面板
     * @param newPage 添加的新面板
     */
    static addHistory(currentPage: IRecord, newPage: IRecord) {
        // Log.debug("addHistory")
        HistoryManager.history.push({current: currentPage, newPage: newPage})
    }

    /**
     * 作废指定的记录
     * @param value 记录页面
     *
     */
    static invalidHistory(value: IRecord) {
        // Log.debug("invalidHistory")
        if (HistoryManager.history.length > 0) {
            for (let i = 0; i < HistoryManager.history.length; i++) {
                if (HistoryManager.history[i]?.newPage == value) {
                    HistoryManager.history.splice(i, 1)
                    break
                }
            }
        }
    }

    /**
     * 返回操作
     * @param isBack 是否用的返回键（非项目内的）
     *
     */
    static backHistory(isBack = false) {
        HistoryManager.back(isBack)
    }

    /** 执行非大厅后退 */
    static back(isBack = false) {
        // 取出最后一个页面关闭
        let array = HistoryManager.history.pop()
        // 新页面隐藏
        array?.newPage?.hideRecord()
        // 显示切换页
        array?.current?.showRecord()
        if (isBack) {
            // 键盘返回
            if (!Browser.onLayaRuntime) Browser.window.addNewHistory()
        } else {

        }
    }

    /**
     * 长度
     * @return
     */
    static len() {
        return HistoryManager.history.length
    }

    /** 清理所有页面缓存 */
    static clearHistory() {
        Log.debug("clearHistory")
//		for (let i = 0; i < history.length; i++) {
//			let historyElement:IRecord = history[i]
//			historyElement.hideRecord()
//		}
        HistoryManager.history.splice(0, HistoryManager.history.length)
    }

    static init() {
        if (!Laya.Browser.onLayaRuntime) {
            HistoryManager.addNewHistory()
            window.addEventListener("popstate", function (e) {
                HistoryManager.backHistory(true)
            }, false)
        }
    }

    /** 添加新的记录 */
    static addNewHistory() {
        HistoryManager.pushHistory("title", "#")
    }

    /** 添加历史记录 */
    static pushHistory(title: string, url: string) {
        const state = {title: title, url: url}
        window.history.pushState(state, title, url)
    }

}
