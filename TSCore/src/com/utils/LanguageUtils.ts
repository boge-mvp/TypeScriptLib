
export class LanguageUtils {

    private static _instance: LanguageUtils

    static get inst(): LanguageUtils {
        LanguageUtils._instance ??= new LanguageUtils()
        return LanguageUtils._instance
    }

    /** 语言配置文件 */
    protected xml?: XMLDocument
    /** 预解析的语言项缓存，以实现 O(1) 检索性能 */
    private _elementCache = new Map<string, Element>()
    /** 存储存在重复 name 的项，用于在检索时抛出 duplicate items 异常 */
    private _duplicateNames = new Set<string>()
    /** 运行时替换文案覆盖表（key 已按 ignoreCase 规范化），检索优先于语言包 */
    private _overrides = new Map<string, string>()
    /** 已删除的文案key黑名单（key 已按 ignoreCase 规范化），命中后语言包原文永远不可见 */
    private _removedKeys = new Set<string>()
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
    customConvert?: (content: string) => string

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
     * 根据key直接替换文案
     * 覆盖语言包中该key对应的文案；key 在语言包中不存在时同样生效（新增）
     * 若该key此前已被删除，重新设置后将再次生效
     * @param key 文案的key（语言包的 id/name）
     * @param value 替换后的文案
     */
    setStr(key: string, value: string) {
        const k = this.ignoreCase ? key.toLowerCase() : key
        this._removedKeys.delete(k)
        this._overrides.set(k, value)
    }

    /**
     * 根据key删除已有的文案
     * 删除该key的全部文案来源：包括代码中 setStr 添加的覆盖值与语言包中的原文
     * 删除后 getStr / getStringArray 永远获取不到该key的文案
     * @param key 文案的key
     */
    removeStr(key: string) {
        const k = this.ignoreCase ? key.toLowerCase() : key
        this._overrides.delete(k)
        this._removedKeys.add(k)
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
        const override = this._overrides.get(this.ignoreCase ? str.toLowerCase() : str)
        if (override !== undefined) return this.__convert(override)
        let element = this.getElement(str)
        if (element?.nodeName == "array") {
            const arr: Element[] = []
            for (let i = 0; i < element.childNodes.length; i++) {
                const childNode = element.childNodes[i]
                if (childNode.nodeType == Node.ELEMENT_NODE) {
                    arr.push(childNode as Element)
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
                    const str = this.__getStr(<Element>childNode)
                    if (str) {
                        out.push(str)
                    }
                }
            }
        }
        return out
    }

    getElement(str: string) {
        if (this.xml) {
            const key = this.ignoreCase ? str.toLowerCase() : str
            if (this._removedKeys.has(key)) {
                return null
            }
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

    private __getStr(element: Nullable<Element>) {
        if (!element) return null
        return this.__convert(element.textContent)
    }

    private __convert(content: any) {
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