export class LanguageUtils {

    private static _instance: LanguageUtils

    static get inst(): LanguageUtils {
        LanguageUtils._instance ??= new LanguageUtils()
        return LanguageUtils._instance
    }

    /** 语言配置文件 */
    protected xml: XMLDocument
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
        const element = this.getElement(str)
        return this.__getStr(element) ?? str
    }

    getStrArray(str: number | string, out?: string[]) {
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
            let element = this.xml.getElementById(str)
            if (element) {
                return element
            }
            let elements = this.xml.getElementsByName(str)
            if (elements.length > 0) {
                if (elements.length > 1)
                    throw new Error("Language configuration has duplicate items：" + str)
                return elements.item(0)
            } else if (this.ignoreCase) {
                const els = this.getElementsByNameIgnoreCase(this.xml.documentElement, str)
                if (els.length > 0) {
                    return els[0]
                }
            }
        }
        return null
    }

    private __getStr(element: Element) {
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