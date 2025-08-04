/**
 * 为Map对象定义一个getOrDefault方法，用于获取指定键对应的值，如果键不存在，则返回默认值。
 * @param key 指定的键
 * @param defaultValue 当键不存在时返回的默认值
 * @returns 返回键对应的值，如果键不存在则返回默认值
 */
Object.defineProperty(Map.prototype, "getOrDefault", {
    value: function <K, V>(key: K, defaultValue: V) {
        const value = this.get(key) // 尝试获取键对应的值
        return value ?? defaultValue // 如果值存在则返回该值，否则返回默认值
    }
})

/**
 * 为Map对象定义一个getOrPut方法，用于获取指定键对应的值，如果键不存在，则调用默认值生成函数，将生成的值设置到该键，并返回该值。
 * @param key 指定的键
 * @param defaultValue 一个函数，当键不存在时调用以生成默认值
 * @returns 返回键对应的值，如果键不存在则调用默认值生成函数并返回新设置的值
 */
Object.defineProperty(Map.prototype, "getOrPut", {
    value: function <K, V>(key: K, defaultValue: () => V) {
        const value = this.get(key) // 尝试获取键对应的值
        if (value == null) {
            const answer = defaultValue() // 如果键不存在，调用默认值生成函数并获取结果
            this.set(key, answer) // 将结果设置到该键
            return answer // 返回新设置的值
        } else {
            return value // 如果键存在，直接返回对应的值
        }
    }
})

