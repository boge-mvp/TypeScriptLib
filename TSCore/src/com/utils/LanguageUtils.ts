
export class LanguageUtils {

    private static _instance: LanguageUtils

    static get inst(): LanguageUtils {
        LanguageUtils._instance ??= new LanguageUtils()
        return LanguageUtils._instance
    }

    /** 语言配置文件 */
    protected xml: XMLDocument
    /** 预解析的语言项缓存，以实现 O(1) 检索性能 */
    private _elementCache = new Map<string, Element>()
    /** 存储存在重复 name 的项，用于在检索时抛出 duplicate items 异常 */
    private _duplicateNames = new Set<string>()
    /**
     * 忽略大小写
     * @default true
     */
    ignoreCase = true
    /**
     * 自定义需要转换的特殊符号 <br/>
     *
     * @example
     * customConvert = (content:string) => {
     *      return content
     * }
     * <br/>
     */
    customConvert: (content: string) => string

    /**
     * 替换文案map
     */
    replaces: { [key: string]: string } = {}

    setXml(xml: XMLDocument) {
        this.xml = xml
        this._elementCache.clear()
        this._duplicateNames.clear()
        if (xml && xml.documentElement) {
            this.prebuildCache(xml.documentElement)
        }
    }

    private prebuildCache(node: Element | ChildNode) {
        if (!node) return
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = <Element>node
            const id = element.getAttribute("id")
            if (id) {
                const key = this.ignoreCase ? id.toLowerCase() : id
                this._elementCache.set(key, element)
            }
            const name = element.getAttribute("name")
            if (name) {
                const key = this.ignoreCase ? name.toLowerCase() : name
                if (this._elementCache.has(key)) {
                    this._duplicateNames.add(key)
                } else {
                    this._elementCache.set(key, element)
                }
            }
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i]
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                this.prebuildCache(childNode)
            }
        }
    }

    /**
     * 返回对应的语言
     * @see LibStr
     * @param str key
     */
    getStr(str: number | string) {
        if (typeof (str) == "number") {
            str = str + ""
        }
        let element = this.getElement(str)
        if (element?.nodeName == "array") {
            const arr = []
            for (let i = 0; i < element.childNodes.length; i++) {
                const childNode = element.childNodes[i]
                if (childNode.nodeType == Node.ELEMENT_NODE) {
                    arr.push(childNode)
                }
            }
            element = arr.random()
        }
        return this.__getStr(element) ?? str
    }

    getStringArray(str: number | string, out?: string[]) {
        if (typeof (str) == "number") {
            str = str + ""
        }
        out ??= []
        const element = this.getElement(str)
        if (element?.nodeName == "array") {
            for (let i = 0; i < element.childNodes.length; i++) {
                const childNode = element.childNodes[i]
                if (childNode.nodeType == Node.ELEMENT_NODE) {
                    out.push(this.__getStr(<Element>childNode))
                }
            }
        }
        return out
    }

    getElement(str: string) {
        if (this.xml) {
            const key = this.ignoreCase ? str.toLowerCase() : str
            if (this._duplicateNames.has(key)) {
                throw new Error("Language configuration has duplicate items：" + str)
            }
            const cached = this._elementCache.get(key)
            if (cached) {
                return cached
            }
        }
        return null
    }

    private __getStr(element: Element) {
        if (!element) return null
        let content = element.textContent
        if (this.customConvert) content = runFun(this.customConvert, content)
        return this.replaceLang(content)
    }

    /**
     * 使用预置的 LanguageUtils.replaces 替换文本内容
     * @param text
     *
     * @see LanguageUtils.replaces
     */
    replaceLang(text: string) {
        for (const key in this.replaces) {
            text = text.replace(new RegExp(`\\{${key}}`, "g"), this.replaces[key])
        }
        return text
    }

    /**
     * 获取忽略大小写的文案
     * @param node
     * @param name
     */
    getElementsByNameIgnoreCase(node: Element | ChildNode, name: string) {
        if (!node || !name) {
            return []
        }
        let result: Element[] = []
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = <Element>node
            const nodeName = element.getAttribute("name")?.toLowerCase()
            if (nodeName === name.toLowerCase()) {
                result.push(<Element>node)
            }
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i]
            if (childNode.nodeType == Node.ELEMENT_NODE) {
                const childResult = this.getElementsByNameIgnoreCase(childNode, name)
                result = result.concat(childResult);
            }
        }
        return result
    }

}