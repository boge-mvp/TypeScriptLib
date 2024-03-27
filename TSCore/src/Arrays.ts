Object.defineProperty(Array.prototype, "distinct", {
    value: function () {
        return [...new Set(this)]
    }
})

Object.defineProperty(Array.prototype, "distinctBy", {
    value: function (selector: (...args: any[]) => any) {
        const map = {}
        const list = []
        for (let e of this) {
            const key = selector.call(this, e)
            if (!map[key]) {
                map[key] = true
                list.push(e)
            }
        }
        return list
    }
})

Object.defineProperty(Array.prototype, "groupBy", {
    value: function <T, K, V>(keySelector: (value: T) => K, valueTransform?: (value: T) => V) {
        return this.groupByTo(new Map(), keySelector, valueTransform)
    }
})

Object.defineProperty(Array.prototype, "groupByTo", {
    value: function <T, K, V, M extends Map<K, V[]>>(destination: M, keySelector: (value: T) => K, valueTransform?: (value: T) => V) {
        let len = this.length
        for (let i = len - 1; i > 0; i--) {
            const key = keySelector(this[i])
            let list = destination.get(key)
            if (list == null) {
                list = []
                destination.set(key, list)
            }
            list.push(valueTransform ? valueTransform(this[i]) : this[i])
        }
        return destination
    }
})

Object.defineProperty(Array.prototype, "shuffle", {
    value: function () {
        let len = this.length
        for (let i = len - 1; i > 0; i--) {
            let rnd = Math.floor(Math.random() * (i + 1));
            [this[i], this[rnd]] = [this[rnd], this[i]]
        }
    }
})

Object.defineProperty(Array.prototype, "minBy", {
    value: function <T, R>(selector: (value: T) => R) {
        if (this.length == 0) return null
        let minElem = this[0]
        if (this.length == 1) return minElem
        let minValue = selector(minElem)
        for (let i = 1; i < this.length; i++) {
            const e = this[i]
            const v = selector(e)
            if (minValue > v) {
                minElem = e
                minValue = v
            }
        }
        return minElem
    }
})

Object.defineProperty(Array.prototype, "maxBy", {
    value: function <T, R>(selector: (value: T) => R) {
        if (this.length == 0) return null
        let minElem = this[0]
        if (this.length == 1) return minElem
        let minValue = selector(minElem)
        for (let i = 1; i < this.length; i++) {
            const e = this[i]
            const v = selector(e)
            if (minValue < v) {
                minElem = e
                minValue = v
            }
        }
        return minElem
    }
})

Object.defineProperty(Array.prototype, "count", {
    value: function <T>(predicate: (value: T) => boolean) {
        if (this.length == 0) return 0
        let count = 0
        for (let element of this) if (predicate(element)) ++count
        return count
    }
})

Object.defineProperty(Array.prototype, "sum", {
    value: function <T>() {
        let sum = 0
        for (let element of this) {
            sum += element
        }
        return sum
    }
})

Object.defineProperty(Array.prototype, "sumOf", {
    value: function <T>(selector: (value: T) => number) {
        let sum = 0
        for (let element of this) {
            sum += selector(element)
        }
        return sum
    }
})

Object.defineProperty(Array.prototype, "random", {
    value: function () {
        return this[random(0, this.length)]
    }
})
