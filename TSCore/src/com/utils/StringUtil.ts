import Utils = Laya.Utils

/**
 * 字符串一些常用方法。
 * @author boge
 *
 */
export class StringUtil {

    /** 验证是否是有效的html标签 */
    static HTML_TAG_REG = /<[^>]*>/g
    /** 验证是否是有效的网址 */
    static HTML_URL_REG = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/g
    /** 根据大写字母分隔 */
    static UPPERCASE_SPLIT = /(?=[A-Z])/
    /* 删除指定标签 */
    static removeTag = /<\/?TEXTFORMAT[^>]*>/gi

    /**
     * 支持字符串格式 ("{0}"). 格式化
     * @param format 带占位符的字符串
     * @param args 替换文本，如果只有一个值，将会被用来替换所有的占位符
     */
    static format(format: string, ...args: string[]) {
        if (args.length == 1) {
            format = format.replace(/\{(\d+)}/g, args[0])
        } else {
            for (let i = 0; i < args.length; ++i)
                format = format.replace(new RegExp("\\{" + i + "\\}", "g"), args[i])
        }
        return format
    }

    /**
     * 忽略大小字母比较字符是否相等
     * @param char1 字符串一
     * @param char2 字符串二
     * @return
     */
    static equalsIgnoreCase(char1: string, char2: string) {
        return char1.toLowerCase() == char2.toLowerCase()
    }

    /**
     * 是否是数值字符串
     * @param char 指定字符串
     * @return
     */
    static isNumber(char: string) {
        if (!char) {
            return false
        }
        return !isNaN(parseFloat(char))
    }

    /**
     * 去除所有html 标签形式
     * @param value
     * @return
     *
     */
    static removeHtml(value: string) {
        let str = value.replace(this.HTML_TAG_REG, "")
        return str ? str.trim() : value
    }

    /**
     * 是否为合法 Email
     * @param char 指定字符串
     * @return
     */
    static isEmail(char: string) {
        let reg = new RegExp("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$")
        return this.checkChar(char, reg)
    }

    /**
     * 是否是 Double 型数据
     * @param    char    指定字符串
     * @return
     */
    static isDouble(char: string) {
        let pattern = new RegExp("^[+\-]?\d+(\.\d+)?$")
        return this.checkChar(char, pattern)
    }

    /**
     * 是否是整数
     * @param    char    指定字符串
     * @return
     */
    static isInteger(char: string) {
        let pattern = new RegExp("^[-\+]?\d+$")
        return this.checkChar(char, pattern)
    }

    /**
     * 是否是英文字符（包括大小写）
     * @param    char    指定字符串
     * @return
     */
    static isEnglish(char: string) {
        let pattern = new RegExp("^[A-Za-z]+$")
        return this.checkChar(char, pattern)
    }

    /**
     * 是否是中文
     * @param    char    指定字符串
     * @return
     */
    static isChinese(char: string) {
        let pattern = new RegExp("^[\u0391-\uFFE5]+$")
        return this.checkChar(char, pattern)
    }

    /**
     * 万军从中取数字
     * @param char
     * @return
     */
    static getNumbers(char: string) {
        let pattern = /\d+/g
        let value = ""
        if (pattern.test(char)) {
            value = char.match(pattern).join("")
        }
        return parseFloat(value)
    }

    /**
     * 万军从中取非数字
     * @param char
     * @return
     */
    static getNotNumbers(char: string) {
        let pattern = /\D+/g
        let value = ""
        if (pattern.test(char)) {
            value = char.match(pattern).join("")
        }
        return value
    }

    /**
     * 是否是双字节
     * @param    char    指定字符串
     * @return
     */
    static isDoubleChar(char: string) {
        let pattern = new RegExp("^[^\x00-\xff]+$")
        return this.checkChar(char, pattern)
    }

    /**
     * 是否是 url 地址
     * @param    char    指定字符串
     * @return
     */
    static isURL(char: string) {
        if (!char) {
            return false
        }
        char = char.toLowerCase()
//		let pattern:RegExp = /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
        return this.checkChar(char, this.HTML_URL_REG)
    }

    /**
     * 是否为空
     * @param    char    指定字符串
     * @return
     */
    static isEmpty(char: string) {
        switch (char) {
            case null:
            case "":
            case "\t":
            case "\r":
            case "\n":
            case "\f":
            case undefined:
                return true
            default:
                return false
        }
    }

    /**
     * 是否不是空
     * @param    char    指定字符串
     * @return
     */
    static isNotEmpty(char: string) {
        return !this.isEmpty(char)
    }

    /**
     * 是否包含中文
     * @param    char    指定字符串
     * @return
     */
    static hasChineseChar(char: string) {
        return this.checkChar(char, /[^\x00-\xff]/)
    }

    /**
     * 检测指定字符串是否匹配指定模式
     * @param    char    指定字符串
     * @param    pattern    指定模式
     * @return
     */
    static checkChar(char: string, pattern: RegExp) {
        return char ? pattern.test(char.trim()) : false
    }

    /**
     * 比较两个字符串是否相等
     * @param s1 第一个比较字符串。
     * @param s2 第二个比较字符串。
     * @param caseSensitive 是否区分大小写  默认不区分
     * @return
     */
    static stringsAreEqual(s1: string, s2: string, caseSensitive = false) {
        if (caseSensitive) {
            return (s1 == s2)
        } else {
            return (s1.toUpperCase() == s2.toUpperCase())
        }
    }

    /**
     * 去除首位的空白部分
     * @param input 要被处理的字符串
     * @deprecated
     * @see String.trim
     */
    static trim(input: string) {
        return input?.trim()
    }

    /**
     * 去除所有的空白部分
     * @param input 要被处理的字符串
     * @return
     *
     */
    static trimAll(input: string | null) {
        if (!input) return null
        let value = ""
        let size = input.length
        for (let i = 0; i < size; i++) {
            if (input.charCodeAt(i) > 32) {
                value += input.charAt(i)
            }
        }
        return value
    }

    /**
     * 从前面指定的字符串中删除空格。
     * @param input 输入字符串开始的空白将被删除。
     * @deprecated
     * @see trimStart()
     *
     */
    static ltrim(input: string) {
        return input?.trimStart()
    }

    /**
     *
     * 从指定的字符串的结尾删除空格。
     *
     * @param input 输入字符串结尾的空白将被删除。
     * @deprecated
     * @see trimEnd()
     */
    static rtrim(input: string) {
        return input?.trimEnd()
    }

    /**
     * 确定是否按指定字符串开始。
     * @param input 要被处理的字符串
     * @param prefix 字符串的前缀
     * @deprecated
     * @see startsWith
     */
    static beginsWith(input: string, prefix: string) {
        return input?.startsWith(prefix)
    }

    /**
     * 确定是否按指定字符串开始。
     * @param input 要被处理的字符串
     * @param prefix 字符串的前缀
     * @deprecated
     * @see String.startsWithAny
     */
    static beginsWithAny(input: string, ...prefix: string[]) {
        return input?.startsWithAny(...prefix)
    }

    /**
     * 确定是否按指定字符串结束。
     * @param input 要被处理的字符串
     * @param suffix 字符串的后缀
     * @deprecated
     * @see String.endsWith
     */
    static endsWith(input: string, suffix: string) {
        return input?.endsWith(suffix)
    }

    /**
     * 确定是否按指定字符串结束。  只要满足一个就返回 true
     * @param input 要被处理的字符串
     * @param prefix 字符串的后缀
     * @deprecated
     * @see String.endsWithAny
     */
    static endsWithAny(input: string, ...prefix: string[]) {
        return input?.endsWithAny(...prefix)
    }

    /**
     * 删除在输入字符串中删除字符串的所有实例。
     * @param input 要被处理的字符串
     * @param remove 要删除的字符串
     * @return
     */
    static remove(input: string, remove: string) {
        return this.replace(input, remove, "")
    }

    /**
     * 字符串内容替换
     * @param input 要被处理的字符串
     * @param replace 要被替换掉的字符串
     * @param replaceWith 用来替换的新字符串
     */
    static replace(input: string, replace: string, replaceWith: string) {
        return input.split(replace).join(replaceWith)
    }

    /**
     * 获取指定符号之后的字符串
     * @param input 要处理的字符串
     * @param suffix 要做为依据的最后一个符号
     * @param retain 是否要保留作为依据的符号 (默认不保留)
     * @param direction 是从前开始还是从后开始 (默认从后)
     * <br>
     * @example
     * var str = "ssdw/aa"
     * StringUtils.endsCode(str, "/") = aa
     *
     * @deprecated
     * @see String.substringAfter
     * @see String.substringAfterLast
     */
    static endsCode(input: string, suffix: string, retain = false, direction = false) {
        let index: number
        if (direction) {
            index = input.indexOf(suffix)
        } else {
            index = input.lastIndexOf(suffix)
        }
        if (index != -1) {
            if (retain) {
                input = input.substring(index, input.length)
            } else {
                input = input.substring(index + (suffix.length), input.length)
            }
        }
        return input
    }

    /**
     * 获取指定符号之前的字符串
     * @param input 要处理的字符串
     * @param suffix 要做为依据的最后一个符号
     * @param retain 是否要保留作为依据的符号 (默认不保留)
     * @param direction 是从前开始还是从后开始 (默认从后)
     *
     * @deprecated
     * @see String.substringBefore
     * @see String.substringBeforeLast
     *
     */
    static beginsCode(input: string, suffix: string, retain = false, direction = false) {
        let index: number
        if (direction) {
            index = input.indexOf(suffix)
        } else {
            index = input.lastIndexOf(suffix)
        }
        if (index != -1) {
            if (retain) {
                input = input.substring(0, index + 1)
            } else {
                input = input.substring(0, index)
            }
        }
        return input
    }

    /**
     * 字符串与对象进行比较。按字典顺序比较两个字符串
     * @param value 源字符串
     * @param anotherString 要比较的字符串
     * @return number 返回值是整型，它是先比较对应字符的大小(ASCII码顺序)，如果第一个字符和参数的第一个字符不等，结束比较，返回他们之间的长度差值，如果第一个字符和参数的第一个字符相等，则以第二个字符和参数的第二个字符做比较，以此类推,直至比较的字符或被比较的字符有一方结束。
     * <br>如果参数字符串等于此字符串，则返回值 0；<br>如果此字符串小于字符串参数，则返回一个小于 0 的值；<br>如果此字符串大于字符串参数，则返回一个大于 0 的值。
     */
    static compareTo(value: string, anotherString: string) {
        let len1 = value.length
        let len2 = anotherString.length
        let lim = Math.min(len1, len2)
        let k = 0
        while (k < lim) {
            let c1 = value.charCodeAt(k)
            let c2 = anotherString.charCodeAt(k)
            if (c1 != c2) {
                return c1 - c2
            }
            k++
        }
        return len1 - len2
    }

    /**
     * 获取资源文件的名字
     * @param url 路径名
     * @param retain 是否去掉尾部标签 默认true
     * @return
     */
    static urlName(url: string, retain = true) {
        // 先同意替换符号
        if (url.indexOf("\\") != -1) {
            url = url.replace(/\\/g, "/")
        }
        let index = url.lastIndexOf("/")
        if (retain) {
            url = url.substring(index + 1, url.lastIndexOf("."))
        } else {
            url = url.substring(index + 1, url.length)
        }
        return url
    }

    /**
     * 判断此字符串中是否包含
     * @param value
     * @param arge
     * @deprecated
     * @see String.contains
     */
    static contains(value: string, ...arge) {
        return value?.contains(...arge)
    }

    /**
     * 将 Uint8Array 转换成16进制颜色值  至少保证3个值
     * @param value 数据
     * @param defaultColor 默认值  如果不满足要求  直接返回的值 默认#ffffff
     */
    static colorRgb(value: Uint8Array, defaultColor = "#ffffff") {
        if (value.length < 3) return defaultColor
        // 转成16进制
        let strHex = "#"
        for (let i = 0; i < 3; i++) {
            let hex = value[i].toString(16)
            if (hex === "0") {
                hex += hex
            }
            strHex += hex
        }
        return strHex
    }

    /**
     * 转换数据类型
     * @param value 数据
     * @param type 类型
     * @return
     */
    static changeType(value: any, type: string) {
        let tempValue = value
        switch (type) {
            case "int":
            case "uint":
            case "number":
                tempValue = parseFloat(value)
                break
            case "boolean":
                if (this.isNumber(value)) {
                    tempValue = Utils.parseInt(value) > 0
                } else {
                    tempValue = value == "true"
                }
                break
            case "array":
                tempValue = value.split(",")
                break
            case "array,int":
                tempValue = value.split(",")
                for (let j = 0, len = tempValue.length; j < len; j++) {
                    tempValue[j] = this.changeType(tempValue[j], "int")
                }
                break
            case "array,number":
                tempValue = value.split(",")
                for (let j = 0, len = tempValue.length; j < len; j++) {
                    tempValue[j] = this.changeType(tempValue[j], "number")
                }
                break
            case "array,uint":
                tempValue = value.split(",")
                for (let j = 0, len = tempValue.length; j < len; j++) {
                    tempValue[j] = this.changeType(tempValue[j], "uint")
                }
                break
        }
        return tempValue
    }


}
