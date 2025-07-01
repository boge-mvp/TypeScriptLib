String.prototype.firstLowerCase = function () {
    return this.charAt(0).toLowerCase() + this.slice(1)
}
String.prototype.firstUpperCase = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
String.prototype.startsWithAny = function (...search: string []) {
    return search.some((value) => this.startsWith(value))
}
String.prototype.startsWithAnyIgnore = function (...search: string []) {
    const lowerCase = this.toLowerCase()
    return search.some((value) => lowerCase.startsWith(value.toLowerCase()))
}

String.prototype.endsWithAny = function (...search: string []) {
    return search.some((value) => this.endsWith(value))
}
String.prototype.endsWithAnyIgnore = function (...search: string []) {
    const lowerCase = this.toLowerCase()
    return search.some((value) => lowerCase.endsWith(value.toLowerCase()))
}

String.prototype.equalsAny = function (...value: string []) {
    const that = this.valueOf()
    return value.some((it) => that === it)
}

String.prototype.equalsAnyIgnore = function (...value: string []) {
    const lowerCase = this.toLowerCase()
    return value.some((it) => lowerCase == it.toLowerCase())
}

String.prototype.contains = function (...search: string []) {
    return search.some((value) => this.includes(value))
}

String.prototype.containsIgnore = function (...search: string []) {
    const lowerCase = this.toLowerCase()
    return search.some((value) => lowerCase.includes(value.toLowerCase()))
}

String.prototype.substringAfter = function (separator: string) {
    if (!this || !separator) return this.toString()
    const pos = this.indexOf(separator)
    if (pos == -1) return this.toString()
    return this.substring(pos + separator.length)
}

String.prototype.substringAfterLast = function (separator: string) {
    if (!this || !separator) return this.toString()
    const pos = this.lastIndexOf(separator)
    if (pos == -1 || pos == this.length - separator.length) return this.toString()
    return this.substring(pos + separator.length)
}

String.prototype.substringBefore = function (separator: string) {
    if (!this || !separator) return this.toString()
    const pos = this.indexOf(separator)
    if (pos == -1) return this.toString()
    return this.substring(0, pos)
}

String.prototype.substringBeforeLast = function (separator: string) {
    if (!this || !separator) return this.toString()
    const pos = this.lastIndexOf(separator)
    if (pos == -1) return this.toString()
    return this.substring(0, pos)
}

String.prototype.substringBetween = function (open: string, close: string) {
    if (!this || !open || !close) return this.toString()
    const start = this.indexOf(open)
    if (start != -1) {
        const end = this.indexOf(close, start + open.length)
        if (end != -1) return this.substring(start + open.length, end)
    }
    return this.toString()
}

String.prototype.substringsBetween = function (open: string, close: string) {
    const list: string[] = []
    if (!this || !open || !close) return list
    const strLen = this.length
    if (strLen == 0) {
        return list
    }
    const closeLen = close.length
    const openLen = open.length
    let pos = 0
    while (pos < strLen - closeLen) {
        let start = this.indexOf(open, pos)
        if (start < 0) {
            break
        }
        start += openLen
        const end = this.indexOf(close, start)
        if (end < 0) {
            break
        }
        list.push(this.substring(start, end))
        pos = end + closeLen
    }
    return list
}

String.prototype.toBoolean = function () {
    return this !== null && this.trim().length > 0 && !this.equalsAnyIgnore("false", "0")
}

String.prototype.toInt = function () {
    let value = 0
    try {
        value = parseInt(this)
    } catch (e) {
    }
    return value
}