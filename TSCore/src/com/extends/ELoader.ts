import Handler = Laya.Handler
import Loader = Laya.Loader
import URL = Laya.URL
import {StringUtil} from "../utils/StringUtil"
import {IFormatVer} from "../interfaces/ICommon";
import Browser = Laya.Browser;
import {Log} from "../Log";

export class ELoader {

    /** 加载域名备用 */
    baseUrls: string[] = []
    private _infoPool: ResInfo[] = []
    static isWebp = false

    static loader = new ELoader()
    /** 检查baseUrl 如果需要设置baseUrls 可以在这里处理  例如： checkBaseUrl = function(url?:string):string[] {} */
    static checkBaseUrl: (url?: string) => string[]
    /** 获取所有的baseUrl 主要在多路径环境下，用来获取资源或者清理资源  例如： getAllBaseUrl = function():string[] {} */
    static getAllBaseUrl: () => string[]
    /** 加载路径格式化 */
    static format: IFormatVer[] = []

    constructor() {
        URL.customFormat = ELoader.formatUrl
    }

    static formatUrl(url: string) {
        let version: string = URL.version[url]
        for (let i = 0; i < ELoader.format.length; i++) {
            version = ELoader.format[i].call(url, version)
        }
        if (ELoader.isWebp && url.endsWithAny("png", "jpg")) url += ".webp"
        if (!Browser.onLayaRuntime && version) url += "?v=" + version
        return url
    }

    /**
     * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
     * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
     * @param    url            要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Loader.JSON,size:50,priority:1}]。
     * @param    complete    加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
     * @param    progress    加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
     * @param    type        资源类型。比如：Loader.IMAGE。
     * @param    priority    (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
     * @param    cache        是否缓存加载结果。
     * @param    group        分组，方便对资源进行管理。
     * @param    ignoreCache    是否忽略缓存，强制重新加载。
     * @param    useWorkerLoader (default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
     * @return 此 LoaderManager 对象本身。
     */
    load(url: string | (string | LoadRes)[], complete?: Handler, progress?: Handler, type?: string, priority = 1, cache = true, group?: string, ignoreCache = false, useWorkerLoader = false) {
        if (Array.isArray(url)) return this.loadAssets(url, complete, progress, type, priority, cache, group)
        let content = this.getRes(url)
        if (!ignoreCache && content) {
            //增加延迟回掉，防止快速回掉导致执行顺序错误
            Laya.systemTimer.frameOnce(1, null, function () {
                progress && progress.runWith(1)
                complete && complete.runWith(Array.isArray(content) ? [content] : content)
            })
        } else {
            let resInfo = this._infoPool.length ? this._infoPool.pop() : new ResInfo()
            resInfo.url = url
            resInfo.complete = complete
            resInfo.progress = progress
            resInfo.type = type
            resInfo.priority = priority
            resInfo.cache = cache
            resInfo.group = group
            resInfo.ignoreCache = ignoreCache
            resInfo.useWorkerLoader = useWorkerLoader
            resInfo.useIndex = 0
            this._load(url, resInfo, progress, type, priority, cache, group, ignoreCache, useWorkerLoader)
        }
    }

    private loadAssets(arr: (string | LoadRes)[], complete: Handler, progress: Handler, type: string, priority: number, cache: boolean, group: string) {
        let itemCount = arr.length
        let loadedCount = 0
        let totalSize = 0
        let items: LoadRes[] = []
        let success = true
        for (let i = 0; i < itemCount; i++) {
            let item = arr[i]
            if (typeof item === "string") item = {url: item, type: type, size: 1, priority: priority}
            if (!item.size) item.size = 1
            item.progress = 0
            totalSize += item.size
            items.push(item)
            let progressHandler = progress ? Handler.create(null, loadProgress, [item], false) : null
            let completeHandler = (complete || progress) ? Handler.create(null, loadComplete, [item]) : null
            this.load(item.url, completeHandler, progressHandler, item.type, item.priority || 1, cache, item.group || group, false, item.useWorkerLoader)
        }

        function loadComplete(item: LoadRes, content?) {
            loadedCount++
            item.progress = 1
            if (!content) success = false
            if (loadedCount === itemCount) {
                complete?.runWith(success)
            }
        }

        function loadProgress(item: LoadRes, value: number) {
            if (progress) {
                item.progress = value
                let num = 0
                for (let j = 0; j < items.length; j++) {
                    let item1 = items[j]
                    num += item1.size * item1.progress
                }
                let v = num / totalSize
                progress.runWith(v)
            }
        }
    }

    private _load(url: string, resInfo: ResInfo = null, progress: Handler = null, type: string = null, priority = 1, cache = true, group: string = null, ignoreCache = false, useWorkerLoader = false) {
        ELoader.loader.formatURL(url, resInfo)
        url = StringUtil.replace(url, "{host}", window.location.host)
        Laya.loader.load(url, Handler.create(this, this.onSingleComplete, [resInfo]), progress, type, priority, cache, group, ignoreCache, useWorkerLoader)
    }

    private onSingleComplete(resInfo: ResInfo, content?: any) {
        if (!content) {
            if (this.baseUrls) {
                resInfo.useIndex++
                if (resInfo.useIndex < this.baseUrls.length) {
                    this._load(resInfo.url, resInfo, resInfo.progress, resInfo.type,
                        resInfo.priority, resInfo.cache, resInfo.group, resInfo.ignoreCache,
                        resInfo.useWorkerLoader)
                    return
                }
            }
        }
        if (!content) Log.debug("load res fail : " + resInfo.url + " " + content)
        resInfo.complete?.runWith(content)
        this._infoPool.push(resInfo)
    }

    /**
     * 获取指定资源地址的资源。
     * @param    url 资源地址。
     * @return    返回资源。
     */
    getRes(url: string) {
        let content = null
        let allBaseUrl = this.baseUrls
        if (ELoader.getAllBaseUrl) allBaseUrl = ELoader.getAllBaseUrl()
        if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
            let tempUrl = null
            for (const baseUrl of allBaseUrl) {
                if (url.charAt(0) != "/")
                    tempUrl = baseUrl + URL.customFormat(url)
                content = Loader.getRes(tempUrl)
                if (content) {
                    return content
                }
            }
        }
        url = StringUtil.replace(url, "{host}", window.location.host)
        return Loader.getRes(url)
    }

    /**
     * 获取指定资源地址的资源。
     * @param    url 资源地址。
     * @return    返回资源。
     */
    clearRes(url: string) {
        let allBaseUrl = this.baseUrls
        if (ELoader.getAllBaseUrl) allBaseUrl = ELoader.getAllBaseUrl()
        if (url.indexOf(":") == -1 && allBaseUrl && allBaseUrl.length > 0) { // 不是完整路径走这里
            let tempUrl = null
            for (const baseUrl of allBaseUrl) {
                //如果不是全路径，处理url
                if (url.charAt(0) != "/")
                    tempUrl = baseUrl + URL.customFormat(url)
                Loader.clearRes(tempUrl)
            }
        }
        Loader.clearRes(url)
    }

    /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
    clearUnLoaded() {
        Laya.loader.clearUnLoaded()
    }

    private formatURL(url: string, resInfo: ResInfo) {
        if (ELoader.checkBaseUrl) this.baseUrls = ELoader.checkBaseUrl(url)
        if (this.baseUrls) {
            let index = resInfo.useIndex
            if (this.baseUrls.length <= index) {
                index = 0
            }
            let basePath = this.baseUrls[index]
            basePath = StringUtil.replace(basePath, "{host}", window.location.host)
            Laya.URL.basePath = basePath
        }
    }

}


class ResInfo {
    /** 当前单次加载文件使用的域名下标 */
    useIndex: number
    url: string
    complete: Laya.Handler
    progress: Laya.Handler
    type: string
    priority: number
    cache: boolean
    group: string
    ignoreCache: boolean
    useWorkerLoader: boolean
}
