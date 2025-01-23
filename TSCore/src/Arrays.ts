Object.defineProperty(Array.prototype, "distinct", {
    value: function () {
        return [...new Set(this)]
    }
})

Object.defineProperty(Array.prototype, "any", {value: Array.prototype.some})
Object.defineProperty(Array.prototype, "all", {value: Array.prototype.every})

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

/**
 * 过滤数组中特定类型的元素。
 *
 * @param {Function} type - 一个构造函数，用于判断数组元素是否是这个类型的实例。
 * @returns {Array} 返回一个新的数组，其中包含了原数组中所有是传入类型实例的元素。
 */
Object.defineProperty(Array.prototype, "filterIsInstance", {
    value: function <T>(type: { new(): T }) {
        /**
         * 使用Array的filter方法来过滤数组。
         * filter方法会创建一个新数组，其中包含了所有通过测试的元素。
         * 这里使用的测试是检查数组元素是否是传入的构造函数的实例。
         */
        return this.filter((value: any) => value instanceof type)
    }
})



/**
 * 通过提供一个回调函数来定义移除元素的条件。
 * 如果数组中存在满足条件的元素，则移除该元素并返回true，否则返回false。
 *
 * @param filter 一个回调函数，用于测试每个元素是否应该被移除。
 *               回调函数接受数组的当前元素作为参数，并返回一个布尔值，
 *               表示该元素是否应该被移除。
 * @returns 如果成功移除了任何元素，则返回true；否则返回false。
 */
Object.defineProperty(Array.prototype, "removeIf", {
    value: function <T>(filter: (value: T) => boolean) {
        let removed = false; // 初始化一个标志变量，用于记录是否成功移除了元素。

        // 遍历数组中的每个元素。
        for (let i = 0; i < this.length; i++) {
            // 使用提供的过滤函数检查当前元素是否应该被移除。
            if (filter(this[i])) {
                // 如果当前元素满足移除条件，则将其从数组中移除。
                this.splice(i, 1);
                // 由于元素被移除，数组长度减小，需要调整索引i以避免跳过下一个元素。
                i--;
                // 标记已移除元素。
                removed = true;
            }
        }
        // 返回是否成功移除了元素。
        return removed;
    }
})


Object.defineProperty(Array.prototype, "removeAll", {
    value: function <T>(predicate: (value: T) => boolean) {
        return filterInPlace(this, predicate, true)
    }
})

Object.defineProperty(Array.prototype, "retainAll", {
    value: function <T>(predicate: (value: T) => boolean) {
        return filterInPlace(this, predicate, false)
    }
})

Object.defineProperty(Array.prototype, "flatMap", {
    value: function <T>(transform: (value: T[], index: number) => T[], iterable?: T[]) {
        iterable ??= []
        this.forEach((value: T[], index: number) => {
            iterable.push(...transform(value, index))
        })
        return iterable
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

