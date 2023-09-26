import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import {LongPressKit} from "../kit/LongPressKit"
import {UtilKit} from "../kit/UtilKit";

/**
 * 切换参数
 * @author boge
 *
 */
export class ChangeValue {

    /** 加号按钮 */
    private readonly addBtn: GButton
    /** 减号按钮 */
    private readonly minusBtn: GButton
    /** 数据变动显示对象 */
    private label: GTextField
    /** 变动数据的存储库 */
    private _nums: number[]
    /** 变更值后调用 */
    dateChange: ParamHandler
    /** 执行max min 或点击加减变化前调用 如果返回false 将停止继续执行 */
    dateChangeBefore: ((value: number) => boolean) | Laya.Handler
    /** 最近的值 */
    lastValue: number
    /** 是否启用到达最大值后禁用按钮 */
    autoEnabled: boolean
    /** 是否启用 */
    private isEnabled = true
    private addLongPressKit: LongPressKit
    private minusLongPressKit: LongPressKit
    /** 动态切换值 要在调用金额的方法使用前初始化 */
    dynamicHandler: (() => number) | Laya.Handler

    /**
     *
     * @param addBtn 加
     * @param minusBtn 减
     * @param label 文字
     *
     */
    constructor(addBtn: GButton, minusBtn: GButton, label: GTextField) {
        this.addBtn = addBtn
        this.minusBtn = minusBtn
        this.label = label
        this.openLong = false
    }

    /** 开通按钮长按 */
    set openLong(value: boolean) {
        if (value) {
            this.addBtn.offClick(this, this.onChangeAnte)
            this.minusBtn.offClick(this, this.onChangeAnte)
            this.addLongPressKit = UtilKit.bindLongPressKit(this.addBtn, this.onChangeAnte.bind(this), 1)
            this.minusLongPressKit = UtilKit.bindLongPressKit(this.minusBtn, this.onChangeAnte.bind(this), 2)
        } else {
            this.addBtn.onClick(this, this.onChangeAnte, [1])
            this.minusBtn.onClick(this, this.onChangeAnte, [2])
        }
    }

    /**
     * 设置到最大
     * @param [isEvent = true] 是否派发本次改变值的事件
     */
    max(isEvent = true) {
        if (!this.nums || !this.nums.length) return
        let ante = this.nums[this.nums.length - 1]
        if (this.dateChangeBefore) {
            if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                return
        }
        this.lastValue = parseFloat(this.label.text)
        this.label.text = ante + ""
        if (isEvent) this.sendEventValue(ante)
    }

    /**
     * 设置到最小
     * @param [isEvent = true] 是否派发本次改变值的事件
     */
    min(isEvent = true) {
        if (!this.nums || !this.nums.length) return
        let ante = this.nums[0]
        if (this.dateChangeBefore) {
            if (!runFun(this.dateChangeBefore, ante)) // 执行变化前的调用如果返回false 将停止继续执行
                return
        }
        this.lastValue = parseFloat(this.label.text)
        this.label.text = ante + ""
        if (isEvent) this.sendEventValue(ante)
    }


    set enabled(value: boolean) {
        this.isEnabled = value
        this.addBtn.enabled = this.minusBtn.enabled = this.isEnabled
        this.checkAutoEnabled()
    }

    /**
     * 设置切换值
     * @param value 值
     * @param [defaultValue = 1] 默认取值
     * @param [isEvent = true] 是否派发本次改变值的事件
     */
    setValues(value?: number[], defaultValue = 1, isEvent = true) {
        if (value) this._nums = value
        this.label.text = this.nums[defaultValue] + ""
        this.lastValue = parseFloat(this.label.text)
        if (isEvent) this.sendEventValue(this.nums[defaultValue])
        // 初始化的时候就判断是否可以点击
        this.checkAutoEnabled()
    }

    /**
     * @deprecated
     * @see setValues
     * @borrows ChangeValue#setValues
     */
    setAntes(value?: number[], defaultValue = 1, isEvent = true) {
        this.setValues(value, defaultValue, isEvent)
    }

    /**
     * 设置为数组中小于 value 并最接近的值
     * @param value 一个参考值
     * @param [isEvent = true] 是否派发本次改变值的事件
     */
    setClosest(value: number, isEvent = true) {
        if (!this.nums || !this.nums.length) return
        let tempAnte
        let ante = this.nums[0]
        for (let i = 0; i < this.nums.length; i++) {
            tempAnte = this.nums[i]
            if (tempAnte <= value) {
                ante = tempAnte
            } else {
                break
            }
        }
        this.lastValue = parseFloat(this.label.text)
        this.label.text = ante + ""
        if (isEvent) this.sendEventValue(ante)
    }

    /**
     * 返回上一个值
     * @param [isEvent = true] 是否派发本次改变值的事件
     */
    before(isEvent = true) {
        let tempAnte = parseFloat(this.label.text)
        if (tempAnte != this.lastValue) {
            this.label.text = this.lastValue + ""
            if (isEvent) this.sendEventValue(this.lastValue)
            this.checkAutoEnabled()
        }
    }

    /**
     * 设置切换到指定的位置
     * @param index 下标
     * @param [isEvent = true] 是否派发本次改变值的事件 如果值和当前的值相同 不派发事件
     */
    setPosition(index: number, isEvent = true) {
        if (index > -1 && index < this.nums.length) {
            let newValue = this.nums[index]
            let lastValue = parseFloat(this.label.text)
            // 值相等不发送
            if (newValue === lastValue) return
            this.lastValue = lastValue
            this.label.text = newValue + ""
            if (isEvent) this.sendEventValue(newValue)
        }
    }

    get nums(): number[] {
        return runFun(this.dynamicHandler) ?? this._nums
    }

    /**
     * @deprecated
     * 兼容老版本
     * @see nums
     */
    getAntes(): number[] {
        return this.nums
    }

    /**
     * 触发监听事件
     * @param ante 当前显示值
     */
    private sendEventValue(ante: number) {
        runFun(this.dateChange, ante)
    }

    private onChangeAnte(code: number) {
        let tempNums = this.nums
        if (!tempNums || tempNums.length == 0) return
        let tempValue = parseFloat(this.label.text)
        let value = tempValue
        let index = tempNums.indexOf(value)
        if (index == -1) {
            value = tempNums[0]
        } else {
            if (code == 1) {// 加
                index++
                if (index >= tempNums.length) {
                    index = tempNums.length - 1
                }
            } else if (code == 2) {// 减
                index--
                if (index < 0) {
                    index = 0
                }
            }
            value = tempNums[index]
        }

        if (this.dateChangeBefore) {
            if (!runFun(this.dateChangeBefore, value)) // 执行变化前的调用如果返回false 将停止继续执行
                return
        }

        this.lastValue = tempValue
        this.label.text = value + ""
        this.checkAutoEnabled()
        this.sendEventValue(value)
    }

    /** 获取当前显示文本的数字 */
    get textToNumber() {
        return parseFloat(this.text)
    }

    /**
     * @deprecated
     * 获取当前显示文本的数字
     * @see textToNumber
     */
    getTextToNumber() {
        return this.textToNumber
    }

    /** 获取当前显示文本 */
    get text() {
        return this.label.text
    }

    /**
     * @deprecated
     * @see text
     */
    getText() {
        return this.text
    }

    dispose() {
        this.addLongPressKit?.dispose()
        this.minusLongPressKit?.dispose()
    }

    /** 检查自动启用停止 */
    private checkAutoEnabled() {
        let index = this.nums.indexOf(this.textToNumber)
        if (this.isEnabled && this.autoEnabled) {
            this.addBtn.enabled = index < this.nums.length - 1
            this.minusBtn.enabled = index > 0
        }
    }

}