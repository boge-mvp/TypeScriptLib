import Point = Laya.Point;

/**
 * 包装常用计算
 */
export class MathKit {

    /** 计算角度的公式  180 / Math.PI */
    static RAD_TO_DEG = 180 / Math.PI
    /** 计算弧度的公式  Math.PI / 180 */
    static DEG_TO_RAD = Math.PI / 180

    /**
     * 角度转弧度
     *
     * angle * Math.PI / 180
     *
     * @param angle 角度
     */
    static angleToRadians(angle: number) {
        return angle * MathKit.DEG_TO_RAD
    }

    /**
     * 弧度转角度
     *
     * radians * 180 / Math.PI
     *
     * @param radians 弧度
     */
    static radiansToAngle(radians: number) {
        return radians * MathKit.RAD_TO_DEG
    }

    /**
     * 计算两点之间的角度角度
     * @param x1 原始坐标X
     * @param y1 原始坐标Y
     * @param x2 新坐标X
     * @param y2 新坐标Y
     *
     */
    static angle(x1: number, y1: number, x2: number, y2: number) {
        let newX = x2 - x1
        let newY = y2 - y1
        let a = Math.atan2(newY, newX)
        return a * 180 / Math.PI
    }

    /**
     * 获取圆旋转到指定位置的长度函数
     * @param count 圆拆分份数
     * @param index 奖品所在奖区
     * @param [minLoop=0] 最少圈数
     * @param [maxLoop=0] 最多圈数
     * @param [skew=-0.5] 第一个奖区起始点与0点位置的偏移比例
     * @param [offset=0.5] 指针所停位置离奖区边缘的比例
     *
     */
    static roundLong(count: number, index: number, minLoop = 0, maxLoop = 0, skew = -.5, offset = .5) {
        let loop = 0
        if (minLoop > 0 && maxLoop >= minLoop) {
            loop = 360 * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop)//整圈长度
        }
        let _skew = (360 / count) * skew//第一个奖区起始点与0点位置的偏移量
        let _location = (360 / count) * index//目标奖区的起始点
        let _offset = Math.floor(Math.random() * (360 / count) * (1 - 2 * offset)) + (360 / count) * offset
        return loop + _skew + _location + _offset
    }

    /**
     * 获取滚动总长度
     * @param item 单个格子高度
     * @param count 转盘拆分份数
     * @param minLoop 最少圈数
     * @param maxLoop 最多圈数
     * @param location 奖品所在奖区
     * @return
     */
    static scrollLong(item: number, count: number, minLoop: number, maxLoop: number, location: number) {
        let totalLong = item * count
        let loop = totalLong * (Math.floor(Math.random() * (maxLoop - minLoop)) + minLoop) //整圈长度
        let _location = (totalLong / count) * location //目标奖区的起始点
        return loop + _location
    }

    /**
     * 计算两点之间的距离
     * @param x1 原始坐标X
     * @param y1 原始坐标Y
     * @param x2 新坐标X
     * @param y2 新坐标Y
     * @return
     *
     */
    static pointDistance(x1: number, y1: number, x2: number, y2: number) {
        let x = x1 - x2
        let y = y1 - y2
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    }

    /**
     * 获取两点中间点的坐标
     * @param x1 原始坐标X
     * @param y1 原始坐标Y
     * @param x2 新坐标X
     * @param y2 新坐标Y
     * @return
     */
    static getPointMiddle(x1: number, y1: number, x2: number, y2: number) {
        let tempX = (Math.max(x1, x2) - Math.min(x1, x2)) / 2
        let tempY = (Math.max(y1, y2) - Math.min(y1, y2)) / 2
        tempX += Math.min(x1, x2)
        tempY += Math.min(y1, y2)
        return new Point(tempX, tempY)
    }

    /**
     * 获取圆上一点的坐标，坐标起点从坐标系右下方向左计算
     * @param x 圆点X坐标
     * @param y 圆点Y坐标
     * @param radius 半径
     * @param radians 弧度(不是角度)
     */
    static roundPoint(x: number, y: number, radius: number, radians: number) {
        x = x + (Math.cos(radians) * radius)
        y = y + (Math.sin(radians) * radius)
        return new Laya.Point(x, y)
    }

    /**
     * 补全数字
     * @param data 要处理的数字、或字符串化的数字
     * @param len 数字总长度
     * @param [isLast=false] 是否补在尾部
     */
    static fillAVacancy(data: number | string, len: number, isLast = false) {
        let string = data + ""
        len = len - string.length
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                string = isLast ? string + "0" : "0" + string
            }
        }
        return string
    }

    /**
     * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
     * @param value 要处理的数字、或字符串化的数字
     * @param [p=0] 保留的小数位数
     * @return
     */
    static toFixed(value: number | string, p = 0) {
        let temp = value + ""
        let index = temp.indexOf(".")
        if (index == -1) return parseInt(temp)
        p = p > 0 ? p + 1 : 0
        return parseFloat(temp.substring(0, index + p))
    }

    /**
     * 精确小数点  如果有小数点 保留指定数量  如果没有,添加指定保留的小数值
     * @param value 要处理的数字、或字符串化的数字
     * @param [p=0] 保留的小数位数
     */
    static toFixedStr(value: number | string, p = 0) {
        value = MathKit.toFixed(value, p)
        let money = value + ""
        let moneyStr = money.split('.')
        let left = moneyStr[0]
        if (p == 0) return left
        let right = moneyStr.length > 1 ? moneyStr[1] : null
        if (right) {
            if (right.length >= p) {
                right = '.' + right.substring(0, p)
            } else {
                right = '.' + MathKit.fillAVacancy(right, p, true)
            }
        } else {
            right = '.' + MathKit.fillAVacancy("0", p)
        }
        return left + right
    }

    /**
     * 从数组中获取大于指定值的元素及其索引
     * @param nums 数值数组
     * @param value 指定的值
     * @param [includeEqual=true] 是否包括等于指定值的元素，默认为true
     * @returns 返回一个对象，包含找到的元素的索引和值，如果没有找到则索引为-1，值为undefined
     */
    static findFirstGreaterOrEqual(nums: number[], value: number, includeEqual = true) {
        let index = -1 // 初始化索引为-1，表示未找到
        let result = undefined // 初始化结果为undefined

        // 从数组末尾开始向前遍历
        for (let i = nums.length - 1; i >= 0; i--) {
            const num = nums[i] // 当前遍历的元素

            // 如果元素大于指定值，或者等于指定值且equal参数为true
            if (num > value || (includeEqual && num === value)) {
                index = i // 更新索引
                result = num // 更新结果
            } else break // 如果找到不满足条件的元素，则终止循环
        }

        return {index, value: result} // 返回结果对象
    }

    /**
     * 在给定的数字数组中，从后向前查找第一个小于等于指定值的元素。
     * @param nums 数字数组，作为查找范围。
     * @param value 指定的值，用于与数组元素进行比较。
     * @param [includeEqual=true] 是否包括等于指定值的元素，默认为true。
     * @returns 返回一个对象，包含找到的元素的索引和值。如果没有找到符合条件的元素，则索引为-1，值为undefined。
     */
    static findLastLessOrEqual(nums: number[], value: number, includeEqual = true) {
        let index = -1 // 初始化索引为-1，表示未找到
        let result = undefined // 初始化结果为undefined

        // 从数组末尾开始向前遍历
        for (let i = nums.length - 1; i >= 0; i--) {
            const num = nums[i] // 当前遍历的元素
            // 如果元素小于等于指定值
            if (num < value || (includeEqual && num === value)) {
                index = i // 更新索引
                result = num // 更新结果
                break // 找到第一个匹配项后立即退出循环
            }
        }

        return {index, value: result} // 返回结果对象
    }

    /**
     * 比较两个值  获得返回值   用于数组排序   从小到大
     * @param aPrice 第一个值
     * @param bPrice 第二个值
     * @return 大于第二个值  1   小于第二个值 -1 相等 0
     *
     */
    static compare(aPrice: number, bPrice: number) {
        if (aPrice > bPrice) {
            return 1
        } else if (aPrice < bPrice) {
            return -1
        } else {
            return 0
        }
    }

    /**
     * 比较两个值  获得返回值   用于数组排序   从大到小
     * @param aPrice 第一个值
     * @param bPrice 第二个值
     * @return 大于第二个值  1   小于第二个值 -1 相等 0
     *
     */
    static compareOn(aPrice: number, bPrice: number) {
        if (aPrice > bPrice) {
            return -1
        } else if (aPrice < bPrice) {
            return 1
        } else {
            return 0
        }
    }

    /**
     * 随机数  最小值  最大值(不包括)
     * @deprecated
     * @see global.random
     */
    static random(minNum: number, maxNum: number) {
        return (Math.floor(Math.random() * (maxNum - minNum)) + minNum)
    }

    /**
     * 随机数
     * @param minNum 最小值
     * @param maxNum 最大值(不包括)
     * @param [p=NaN] 保留尾数  默认NaN 表示全保留
     * @return
     * @deprecated
     * @see global.randomFloat
     */
    static randomFloat(minNum: number, maxNum: number, p = NaN) {
        let temp = (Math.random() * (maxNum - minNum) + minNum)
        if (!isNaN(p)) temp = MathKit.toFixed(temp, p)
        return temp
    }

}