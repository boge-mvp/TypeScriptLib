export class DateUtils {

    /** 星期 默认英文 */
    static weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    /**
     * 格式化时间
     * @param date 时间
     * @param fmt 格式
     * @param isUTC 使用国际时间
     * @example
     * fmt:
     * yyyy：年
     * MM：月
     * dd：
     * hh：1~12小时制(1-12)
     * HH：24小时制(0-23)
     * mm：分
     * ss：秒
     * S：毫秒
     * E：星期几
     * @return
     */
    static formatDate(date: number | Date, fmt: string, isUTC = false) {
        if (!(date instanceof Date)) {
            let date2: Date = new Date()
            date2.setTime(date)
            date = date2
        }
        // 时区
        //		var localOffset:number = date.getTimezoneOffset() * 60000
        //		Log.debug(localOffset)
        let tempStr = ""
        let match = fmt.match(/(y+)/)
        if (match?.length > 0) {
            tempStr = match[0]
            if (isUTC) {
                fmt = fmt.replace(tempStr, (date.getUTCFullYear() + '').substring(4 - tempStr.length))
            } else {
                fmt = fmt.replace(tempStr, (date.getFullYear() + '').substring(4 - tempStr.length))
            }
        }
        let o = {
            'M+': (isUTC ? date.getUTCMonth() : date.getMonth()) + 1,
            'd+': (isUTC ? date.getUTCDate() : date.getDate()),
            'h+': ((isUTC ? date.getUTCHours() : date.getHours()) % 12),
            'H+': (isUTC ? date.getUTCHours() : date.getHours()),
            'm+': (isUTC ? date.getUTCMinutes() : date.getMinutes()),
            's+': (isUTC ? date.getUTCSeconds() : date.getSeconds()),
            'S+': (isUTC ? date.getUTCMilliseconds() : date.getMilliseconds()),
            "E+": DateUtils.weekday[(isUTC ? date.getUTCDay() : date.getDay())]
        }
//		Log.debug(o)
        // 遍历这个对象
        for (let k in o) {
            match = fmt.match(new RegExp("(" + k + ")"))
            if (match?.length > 0) {
//				 Log.debug('${k}')
                tempStr = match[0]
                fmt = fmt.replace(tempStr, tempStr.length == 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length))
            }
        }
        return fmt
    }

    /**
     * 比较时间大小
     * time1>time2 return 1
     * time1<time2 return -1
     * time1==time2 return 0
     * @param time1
     * @param time2
     */
    static compareTime(time1, time2) {
        if (Date.parse(time1.replace(/-/g, "/")) > Date.parse(time2.replace(/-/g, "/"))) {
            return 1
        } else if (Date.parse(time1.replace(/-/g, "/")) < Date.parse(time2.replace(/-/g, "/"))) {
            return -1
        } else if (Date.parse(time1.replace(/-/g, "/")) == Date.parse(time2.replace(/-/g, "/"))) {
            return 0
        }
    }

    /**
     * 是否闰年
     * @param year 年份
     */
    static isLeapYear(year: number) {
        return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
    }

    /**
     * 获取某个月的天数，从0开始
     * @param year 年份
     * @param month 月份
     */
    static getDaysOfMonth(year: number, month: number) {
        return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
    }

    /**
     * 将天置为0，获取其上个月的最后一天
     * @param year 年份 如 1992
     * @param monthIndex 月份索引 0开始
     */
    static getDaysOfMonth2(year: number, monthIndex: number) {
        let date = new Date(year, monthIndex + 1, 0)
        return date.getDate()
    }

    /**
     * 距离现在几天的日期：
     * @param days 负数表示今天之前的日期，0表示今天，整数表示未来的日期。 如-1表示昨天的日期，0表示今天，2表示后天
     */
    static fromToday(days: number) {
        let today = new Date()
        today.setDate(today.getDate() + days)
        return today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    }

    /**
     * 计算一个日期是当年的第几天
     * @param date ms | 2023-09-01 12:00:00 | Date
     */
    static dayOfTheYear(date: number | string | Date) {
        let obj = new Date(date)
        let year = obj.getFullYear()
        let month = obj.getMonth(); //从0开始
        let days = obj.getDate()
        let daysArr = [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        for (let i = 0; i < month; i++) {
            days += daysArr[i]
        }
        return days
    }

    /**
     * 获得时区名和值
     * @param time ms | 2023-09-01 12:00:00 | Date
     */
    static getZoneNameValue(time: number | string | Date) {
        let date = new Date(time)
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        let arr = date.toString().match(/([A-Z]+)([-+]\d+:?\d+)/)
        return {'name': arr[1], 'value': arr[2]}
    }

    /**
     * 判断是否是同一天
     * @param date1 ms | 2023-09-01 12:00:00 | Date
     * @param date2 ms | 2023-09-01 12:00:00 | Date
     * @return
     */
    static isSameDay(date1: number | string | Date, date2: number | string | Date) {
        let _date1 = new Date(date1)
        let _date2 = new Date(date2)
        return (_date1.getFullYear() == _date2.getFullYear() &&
            _date1.getMonth() == _date2.getMonth() &&
            _date1.getDate() == _date2.getDate()
        )
    }

    /**
     * 判断传入的时间小于今天
     * @param time ms | 2023-09-01 12:00:00 | Date
     */
    static notTomorrow(time: number | string | Date) {
        let timeDate = new Date(time)
        let today = new Date()
        if (timeDate.getFullYear() < today.getFullYear()) {
            return true
        } else if (timeDate.getFullYear() == today.getFullYear()) {// 年份一样
            if (timeDate.getMonth() < today.getMonth()) {// 小于今天的月份
                return true
            } else if (timeDate.getMonth() == today.getMonth()) {// 月份一样
                if (timeDate.getDate() < today.getDate()) {// 日期小于今天
                    return true
                }
            }
        }
        return false
    }

    /**
     * 获取距离传入的时间还剩的时间
     *
     * @example
     *  const targetDate = new Date('2023-09-01 12:00:00')
     *  const timeDifference = calculateTimeDifference(targetDate)
     *  console.log(timeDifference)
     *
     * @param time ms | Date
     */
    calculateTimeDifference(time: number | Date) {
        if (time instanceof Date) time = time.getTime()
        // 计算时间差（毫秒）
        const timeDifference = time - Date.now()
        // 计算剩余的天数、小时数、分钟数和秒数
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)
        return {days, hours, minutes, seconds}
    }



}
