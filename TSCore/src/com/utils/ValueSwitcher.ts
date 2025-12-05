import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import {LongPressKit} from "../kit/LongPressKit"
import {UtilKit} from "../kit/UtilKit";

/**
 * 泛型值切换器类
 *
 * 用于通过按钮控制在预设值集合中进行切换显示的通用组件。
 * 支持增加/减少按钮切换、循环切换、长按连续切换等功能。
 *
 * @example
 *
 * // 创建值切换器
 * const switcher = new ValueSwitcher(increaseBtn, decreaseBtn, displayLabel);
 * // 设置值列表
 * switcher.values = [10, 20, 30, 40, 50];
 * // 监听值变更
 * switcher.onValueChange = (value) => {
 *     console.log("当前值:", value);
 * };
 * // 启用长按功能
 * switcher.enableLongPress = true;
 *
 * @author boge
 */
export class ValueSwitcher<T> {

    /** 增加按钮 */
    readonly increaseBtn: GButton
    /** 减少按钮 */
    readonly decreaseBtn: GButton
    /** 值显示对象 */
    readonly displayLabel: GTextField
    /** 变动数据的存储库 */
    private _values: T[]
    /** 值变更回调 */
    onValueChange: ((value: T) => void) | Laya.Handler
    /** 值变更前回调 如果返回false 将停止继续执行 */
    onValueChangeBefore: ((value: T, index: number) => boolean) | Laya.Handler
    /** 是否启用到达边界后禁用按钮 默认false */
    autoDisableButtons: boolean
    /** 当前正在读取值的下标 */
    protected valueIndex = 0
    /** 上一个值的下班 */
    protected previousIndex = 0
    /** 是否启用 */
    private isEnabled = true
    private increaseLongPressKit: LongPressKit
    private decreaseLongPressKit: LongPressKit
    /** 动态值获取器 */
    dynamicValueProvider: (() => T) | Laya.Handler
    /**
     * 通过按钮进行切换值是否循环
     */
    loop = false

    /**
     * 值比较 默认实现是
     * ```
     * value <= target
     * ```
     */
    compareValues: (value: T, target: T) => boolean = function (value, target) {
        return value <= target
    }

    /**
     * @param increaseBtn 增加按钮
     * @param decreaseBtn 减少按钮
     * @param displayLabel 显示文本
     */
    constructor(increaseBtn: GButton, decreaseBtn: GButton, displayLabel: GTextField) {
        this.increaseBtn = increaseBtn
        this.decreaseBtn = decreaseBtn
        this.displayLabel = displayLabel
        this.enableLongPress = false
    }

    /** 启用长按功能 */
    set enableLongPress(value: boolean) {
        if (value) {
            if (!this.increaseLongPressKit)
                this.increaseLongPressKit = UtilKit.bindLongPressKit(this.increaseBtn, this.onValueChangeHandler.bind(this), 1)

            if (!this.decreaseLongPressKit)
                this.decreaseLongPressKit = UtilKit.bindLongPressKit(this.decreaseBtn, this.onValueChangeHandler.bind(this), 2)
        } else {
            this.increaseLongPressKit?.dispose()
            this.decreaseLongPressKit?.dispose()
            this.increaseLongPressKit = this.decreaseLongPressKit = null
            this.increaseBtn.offClick(this, this.onValueChangeHandler)
            this.decreaseBtn.offClick(this, this.onValueChangeHandler)
            this.increaseBtn.onClick(this, this.onValueChangeHandler, [1])
            this.decreaseBtn.onClick(this, this.onValueChangeHandler, [2])
        }
    }

    setEnableLongPress(value: boolean) {
        this.enableLongPress = value
        return this
    }

    /**
     * 设置为最大值
     * @param [triggerEvent = true] 是否触发变更事件 , {@link onValueChange}
     */
    setToMax(triggerEvent = true) {
        if (!this.values?.length) return
        this.setPosition(this.values.length - 1, triggerEvent)
    }

    /**
     * 设置为最小值
     * @param [triggerEvent = true] 是否触发变更事件 , {@link onValueChange}
     */
    setToMin(triggerEvent = true) {
        if (!this.values?.length) return
        this.setPosition(0, triggerEvent)
    }

    set enabled(value: boolean) {
        this.isEnabled = value
        this.increaseBtn.enabled = this.decreaseBtn.enabled = this.isEnabled
        this.checkAutoDisable()
    }

    setEnabled(value: boolean) {
        this.enabled = value
    }

    /**
     * 设置可切换的值集合
     * @param value 值集合
     * @param [selectIndex = 1] 默认选中索引
     * @param [triggerEvent = true] 是否触发变更事件
     */
    setValues(value?: T[], selectIndex = 1, triggerEvent = true) {
        if (value) this._values = value
        this.setPosition(selectIndex, triggerEvent)
    }

    /**
     * 设置可切换的值集合 简化版本
     * @param values 值集合
     * @see setValues
     */
    set values(values: T[]) {
        this.setValues(values)
    }

    /**
     * 设置为小于指定值的最大项
     * @param target 目标值
     * @param [triggerEvent = true] 是否触发变更事件
     * @param compareValues
     */
    setClosest(target: T, triggerEvent = true, compareValues?: (value: T, target: T) => boolean) {
        if (!this.values?.length) return
        let index = 0
        const compareFun = compareValues ?? this.compareValues
        // 需要比较函数来处理泛型
        for (let i = 0; i < this.values.length; i++) {
            const temp = this.values[i]
            if (compareFun?.(temp, target)) {
                index = i
            } else {
                break
            }
        }
        this.setPosition(index, triggerEvent)
    }

    /**
     * 返回上一个值
     * @param [triggerEvent = true] 是否触发变更事件
     */
    before(triggerEvent = true) {
        let tempAnte = this.valueIndex
        if (tempAnte != this.previousIndex) {
            this.setPosition(this.previousIndex, triggerEvent)
        }
    }

    /**
     * 设置切换到指定的位置
     * @param index 索引
     * @param [triggerEvent = true] 是否触发变更事件 如果值和当前的值相同 不派发事件     *
     *
     */
    setPosition(index: number, triggerEvent = true) {
        if (!this.values?.length) return
        if (index > -1 && index < this.values.length && index != this.valueIndex) {
            let newValue = this.values[index]
            if (this.onValueChangeBefore) {
                if (!runFun(this.onValueChangeBefore, newValue, index)) // 执行变化前的调用如果返回false 将停止继续执行
                    return
            }
            this.previousIndex = this.valueIndex
            this.valueIndex = index
            this.displayLabel.text = newValue.toString()
            this.checkAutoDisable()
            if (triggerEvent) this.dispatchValueChangeEvent(newValue)
        }
    }

    get values(): T[] {
        return runFun(this.dynamicValueProvider) ?? this._values
    }

    /**
     * 触发监听事件
     * @param value 当前显示值
     */
    private dispatchValueChangeEvent(value: T) {
        runFun(this.onValueChange, value)
    }

    /**
     * 处理值变化的事件处理器
     * @param direction 方向标识，1表示增加，2表示减少
     */
    private onValueChangeHandler(direction: 1 | 2) {
        let tempNums = this.values
        const len = tempNums.length
        if (!tempNums || len == 0) return
        let index = this.valueIndex

        const enabledLoop = this.isEnabled && !this.autoDisableButtons && this.loop

        if (direction == 1) {// 增加
            index++
            if (index >= len) {
                if (enabledLoop) {
                    index = 0
                } else index = len - 1
            }
        } else if (direction == 2) {// 减少
            index--
            if (index < 0) {
                if (enabledLoop) {
                    index = len - 1
                } else index = 0
            }
        }
        this.setPosition(index)
    }

    /** 获取当前显示文本的数字 强制转换，非数字会报错 */
    get textToNumber() {
        return parseFloat(this.text)
    }

    /** 获取当前显示文本 */
    get text() {
        return this.displayLabel.text
    }

    /**
     * 获取当前值
     *
     * this.values[this.valueIndex]
     * @returns {T}
     */
    get currentValue(): T {
        // 注意：这里需要根据具体类型实现转换逻辑
        return this.values[this.valueIndex]
    }

    dispose() {
        this.increaseLongPressKit?.dispose()
        this.decreaseLongPressKit?.dispose()
        this.increaseLongPressKit = null;
        this.decreaseLongPressKit = null;
    }

    /** 检查自动启用停止 */
    private checkAutoDisable() {
        if (this.isEnabled && this.autoDisableButtons) {
            this.increaseBtn.enabled = this.valueIndex < this.values.length - 1
            this.decreaseBtn.enabled = this.valueIndex > 0
        }
    }

}