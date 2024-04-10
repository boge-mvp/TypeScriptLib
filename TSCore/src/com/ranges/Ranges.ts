export class Range {

    /**
     * 空范围
     */
    static EMPTY = new Range(1, 0)

    /**
     * 范围的起始值
     */
    readonly start: number

    /**
     * 范围的结束值（包含）
     */
    readonly endInclusive: number

    /**
     * 构造函数
     * @param start 范围的起始值
     * @param endInclusive 范围的结束值（包含）
     */
    constructor(start: number, endInclusive: number) {
        this.start = start
        this.endInclusive = endInclusive
    }

    /**
     * 判断给定值是否在范围内
     * @param value 给定值
     * @returns 如果在范围内返回true，否则返回false
     */
    contains(value: number) {
        return this.start <= value && value <= this.endInclusive
    }

    /**
     * 判断范围是否为空
     * @returns 如果为空返回true，否则返回false
     */
    isEmpty() {
        return this.start > this.endInclusive
    }

    /**
     * 将范围转换为数组
     * @returns 范围对应的数组
     */
    toArray(): number[] {
        const arr = []
        for (let i = this.start; i <= this.endInclusive; i++) {
            arr[arr.length] = i
        }
        return arr
    }

}
