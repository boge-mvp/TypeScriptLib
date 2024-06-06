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
        for (let i = len - 1; i >= 0; i--) {
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
        return this
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

Object.defineProperty(Array.prototype, "removeIf", {
    value: function <T>(filter: (value: T) => boolean) {
        let removed = false
        for (let i = 0; i < this.length; i++) {
            if (filter(this[i])) {
                this.splice(i, 1)
                i--
                removed = true
            }
        }
        return removed
    }
})

Object.defineProperty(Array.prototype, "removeAll", {
    value: function <T>(predicate: (value: T) => boolean) {
        return filterInPlace(this,  predicate, true)
    }
})

Object.defineProperty(Array.prototype, "retainAll", {
    value: function <T>(predicate: (value: T) => boolean) {
        return filterInPlace(this,  predicate, false)
    }
})

/**
 * 在原数组上进行过滤操作，根据predicate函数的结果保留或移除元素。
 * 该函数尝试在原数组上进行过滤，避免创建新的数组实例，以提高性能和减少内存使用。
 *
 * @param array 原数组，将直接在该数组上进行过滤操作。
 * @param predicate 过滤条件函数，接受数组元素作为参数，返回一个布尔值。
 * @param predicateResultToRemove 指定过滤条件的结果，与该结果一致的元素将被移除。
 * @returns 如果数组发生了改变（有元素被移除），则返回true；否则返回false。
 */
function filterInPlace<T>(array: Array<T>, predicate: (value: T) => boolean, predicateResultToRemove: boolean): boolean {
    // 初始化写入索引，用于跟踪过滤后的新数组长度。
    let writeIndex = 0
    // 遍历原数组，对每个元素应用过滤条件。
    for (let i = 0; i < array.length; i++) {
        const element = array[i]
        // 如果元素满足移除条件，则跳过该元素。
        if (predicate(element) == predicateResultToRemove)
            continue
        // 如果当前元素的位置不等于写入索引，说明有元素被移除，需要更新数组。
        if (writeIndex != i)
            array[writeIndex] = element
        // 更新写入索引，准备写入下一个元素。
        writeIndex++
    }
    // 如果写入索引小于原数组长度，说明有元素被移除，需要进一步修剪数组。
    if (writeIndex < array.length) {
        // 使用splice方法移除剩余的元素，修剪数组。
        array.splice(writeIndex)
        // 返回true，表示数组发生了改变。
        return true
    } else {
        // 如果数组没有发生改变，返回false。
        return false
    }
}

