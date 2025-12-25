/**
 * @param value {number}
 */
onProgress = null

/**
 * @type {()=>void}
 */
onError = null

/**
 * @type {string|(()=>string)}
 */
crashUrl = null

/**
 * 上传错误验证函数
 * @type {(msg:Event|string, url:string)=>boolean}
 * @param msg {Event|string}
 * @param url {string}
 * @return {boolean} false 验证失败 true 验证成功可以上传
 */
sendErrorVerifies = null

/**
 * 已经完成的加载数量
 * @type {number}
 */
completeLoaderNum = 0
/**
 * 当前加载的总数
 * @type {number}
 */
loaderTotalNum = 0

/**
 * 获取路径名字的正则
 * @type {RegExp}
 */
pathNameRegExp = /\/([^\/?#]+)(?:\?.*)?(?:#.*)?$/

/**
 * 获取url路径的名字
 * @param url {string}
 * @returns {string}
 */
function pathName(url) {
    // 使用正则表达式提取文件名
    const fileNameMatch = pathNameRegExp.exec(url)
    if (fileNameMatch && fileNameMatch.length > 1) {
        /** @type {string} */
        const fileName = fileNameMatch[1]
        const index = fileName.lastIndexOf(".")
        url = fileName.substring(0, index)
        // console.log("fileName:", fileName)
    } else {
        console.log("file name not found", url)
    }
    return url.replace(/\./g, "_")
}

/**
 * 批量加载资源文件
 *
 * 此函数支持并行或顺序加载多种类型的资源文件，包括JavaScript文件和其他文本资源。
 * 对于非JS资源，会将其内容存储到全局参数对象中；对于JS资源，则通过动态创建script标签加载。
 *
 * @param {{ key:string, v:number} | { key:string, v:number}[]} url - 要加载的资源URL或URL对象数组
 *   - 当为字符串时，表示单一资源路径
 *   - 当为对象时，格式应为{key: string, v: number}，其中key是资源路径，v是版本号
 * @param {boolean} [parallel=true] - 是否并行加载JS文件
 *   - true: 并行加载所有JS文件
 *   - false: 顺序加载JS文件（仅对JS文件有效）
 * @param {Function} [onComplete=null] - 所有资源加载完成后的回调函数
 *   - 在所有资源都加载完毕后执行一次
 * @param {(data: string, url: string)=> boolean} [customParse=null] - 自定义解析函数，用于处理非JS资源的数据
 *   - 接收参数(data, url)，其中data是加载的资源内容，url是资源地址
 *   - 返回false可中断当前资源的后续处理流程
 *
 * @example
 * // 加载单个JS文件
 * loadBatch({key: "script/main.js", v: 1}, true, () => console.log("加载完成"))
 *
 * @example
 * // 并行加载多个资源
 * loadBatch([
 *   {key: "config/game.xml", v: 1},
 *   {key: "data/level.json", v: 1}
 * ], true, () => console.log("全部加载完成"))
 */
function loadBatch(url, parallel = true, onComplete = null, customParse = null) {
    if (!Array.isArray(url)) url = [url]
    const loadRes = url.map(value => getLoadUrl(value.key, value.v))
    let len = loadRes.length
    let completeIndex = 0
    const loadJs = []
    const loadText = []
    loadRes.forEach(value => {
        const isJs = value.split("?")[0].endsWith(".js")
        if (isJs) {
            loadJs.push(value)
        } else {
            loadText.push(value)
        }
    })
    // 非js
    for (const key of loadText) {
        loadContent(key, (data, url) => {
            if (customParse) {
                const result = customParse(data, url)
                if (!result) {
                    complete()
                    return
                }
            }
            const name = pathName(url)
            let parameter = window["$_parameter"]
            if (!parameter) {
                parameter = {}
                window["$_parameter"] = parameter
            }
            parameter[name] = [url, data]
            if (url.endsWith(".xml")) {
                window["$_crc"] = data
            }
            complete()
        }, [key.split("?")[0]], (e) => loadError(e))
    }
    loadScript(loadJs, parallel, complete.bind(this))

    function complete() {
        completeLoaderNum++
        let pro = parseFloat((completeLoaderNum / loaderTotalNum * 100).toFixed(2))
        onProgress && onProgress(pro)
        completeIndex++
        if (onComplete && completeIndex === len) onComplete()
    }
}

/**
 * 加载script标签
 * @param url {string | string[]}
 * @param parallel {boolean} 是否一起执行，false。顺序执行
 * @param callback {(ev?: Event)=>void}
 */
function loadScript(url, parallel = true, callback = null) {
    if (Array.isArray(url)) {
        if (parallel) {
            for (const key of url) {
                loadScript(key, parallel, callback)
            }
        } else {
            function next() {
                loadScript(url.shift(), parallel, () => {
                    callback()
                    url.length > 0 && next()
                })
            }

            next()
        }
        return
    }
    const name = pathName(url)

    function loadComplete() {
        let parameter = window["$_parameter"]
        if (!parameter) {
            parameter = {}
            window["$_parameter"] = parameter
        }
        parameter[name] = [url, "1"]
        callback()
    }

    const script = document.createElement("script")
    script.onerror = loadError
    script.id = "id_" + name
    script.async = true
    if (callback) script.onload = loadComplete
    script.src = url
    document.head.appendChild(script)
}

/**
 *
 * @param key {string}
 * @param v {number}
 */
function getLoadUrl(key, v) {
    key = key.replace("{host}", window.location.host)
    if (!window.conch && !window.conchMarket) {
        const ver = v || version(key)
        return ver ? `${key}?v=${ver}` : key
    } else {
        return key
    }
}

/**
 *
 * @param url {string}
 */
function version(url) {
    let version = window["$_version"]
    if (!version) {
        let crc = window["$_crc"]
        if (!crc) return
        if (typeof crc === "string") {
            const value = crc.replace(/>\s+</g, '><');
            crc = (new DOMParser()).parseFromString(value, 'text/xml');
            if (crc.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
                console.error(crc.firstChild.firstChild.textContent)
                return
            }
        }
        version = {}
        window["$_version"] = version
        if (crc.lastChild && crc.lastChild.childNodes) {
            let chills = crc.lastChild.childNodes
            for (let i = 0; i < chills.length; i++) {
                const child = chills[i]
                const url = child.getAttribute("url")
                if (url.endsWith(".js") && !url.endsWith(".min.js")) {
                    version[url.replace(".js", ".min.js")] = child.getAttribute("crc")
                }
                version[url] = child.getAttribute("crc")
            }
        } else return
    }
    if (!version) return

    const host = (Array.isArray(baseUrls) ? baseUrls[0] : baseUrls).replace("{host}", window.location.host)

    return version[url] || version[url.replace(host, "").replace(/_\w+\.min/, "")]
}

/**
 * 进度条
 * @param value 当前值
 * @param tempCount 第几个
 * @param totalCount 总输
 * @return {number}
 */
function getProgress(value, tempCount, totalCount) {
    let pieces = 100 / totalCount;
    let pro = value / 100 * pieces;
    return pieces * (tempCount - 1) + pro
}

function getQueryString(name) {
    if (!window.location || !window.location.search)
        return null;
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substring(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

/**
 *
 * @param url {string}
 * @param complete {(content:string, ...args:any[])=>void}
 * @param args {any[]}
 * @param error {(...args:any[])=>void}
 */
function loadContent(url, complete, args = [], error) {
    let http = new XMLHttpRequest()
    http.args = args
    http.open("get", url, true)
    http.onload = (e) => {
        http = e.target
        let status = http.status !== undefined ? http.status : 200
        if (status === 200 || status === 204 || status === 0) {
            if (http.responseType === "text/xml" || http.responseType === "application/xml") args.unshift(http.responseXML)
            else args.unshift(http.responseText)
            complete.apply(this, args)
        } else {
            error.apply(this, args)
        }
    }
    http.onerror = () => {
        error.apply(this, args)
    }
    http.send()
}

function loadError(e) {
    onError && onError(e)
}

/**
 * 错误上传
 * @param msg {Event | string}
 * @param url {string}
 * @param line {number}
 * @param column {number}
 * @param error {Error}
 */
window.onerror = (msg, url, line, column, error) => {
    if (sendErrorVerifies != null && !sendErrorVerifies(msg, url)) return
    if (error) {
        let errorLog = {
            codeVersion: codeVersion,
            gameId: getQueryString("gameId") || getQueryString("openGame") || getQueryString("gameName"),
            url: url,
            line: line,
            column: column,
            isGuest: getQueryString("isGuest") || getQueryString("demo"),
            content: msg,
            userAgent: window.navigator.userAgent,
            tack: error.stack,
        }
        sendError(errorLog)
    }
}

function sendError(data) {
    console.error(`error: ${data ? JSON.stringify(data) : "null"}`)
    // 大厅 web端不用上传任何日志
    if (data) {
        if (typeof data !== "string") {
            if (window.conch || window.conchMarket) {
                data = parseJson(data)
            } else {
                const formData = new FormData();
                for (let key in data) {
                    formData.append(key, data[key]);
                }
                data = formData
            }
        }
        let url = typeof crashUrl === "function" ? crashUrl() : crashUrl
        let http = new XMLHttpRequest();
        http.open("post", url, true)
        http.send(data)

    }
}

function parseJson(data) {
    if (!data) return null
    if (typeof data === "string") return data
    let value
    let v
    for (let key in data) {
        v = data[key]
        if (!value) {
            value = key + "=" + v
        } else {
            value += "&" + key + "=" + v
        }
    }
    return value
}

// ios

function onIos() {
    var u = window.navigator.userAgent
    var maxTouchPoints = window.navigator.maxTouchPoints || 0
    var platform = window.navigator.platform
    var onIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    var onIPhone = u.indexOf("iPhone") > -1;
    var onMac = u.indexOf("Mac OS X") > -1;
    var onIPad = u.indexOf("iPad") > -1 || (platform === 'MacIntel' && maxTouchPoints > 1);
    return onIOS || onIPad || onIPhone || onMac
}

/**
 * 判断是否是原生ios壳子
 */
function isIOS() {
    var msg = (typeof window.webkit !== 'undefined' && typeof window.webkit.messageHandlers !== 'undefined' && typeof window.webkit.messageHandlers.hasNativeMethod !== 'undefined') ? window.webkit.messageHandlers : null
    return msg ? msg.hasNativeMethod.postMessage("openPage") : false
}

/**
 * 执行调用ios方法
 * @param method 调用方法名
 * @param data 传递数据
 * @param [printDebug=true] 打印调用命令是否执行
 */
function callIOS(method, data, printDebug = true) {
    if (isIOS()) {
        data = data || {}
        const webkit = window.webkit.messageHandlers
        webkit[method].postMessage(JSON.stringify(data))
        return true
    }
    return false
}