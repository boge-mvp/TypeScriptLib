export interface IFruit {

    /**
     * 所有水果灯闪烁
     * @param count 闪烁次数 0表示无限次
     * @param callback 次数到后回调函数
     */
    twinkleAllFruits(count?: number, callback?: ParamHandler): void

    /** 停止所有位置水果灯闪烁 */
    stopAllTwinkleFruits(): void

    /**
     * 跑灯显示位置
     * @param runIndex 当前显示位置
     * @param tail 尾巴数量
     * @param catapultDirection 方向 true 顺时针
     */
    showSlotIndex(runIndex: number, tail?: number, catapultDirection?: boolean): void

    /** 水果数量 */
    fruitLen(): number

    /**
     * 指定位置水果灯闪烁
     * @param index
     * @param count
     * @param callback
     *
     */
    twinkleFruits(index: number, count?: number, callback?: ParamHandler): void

    /**
     * 停止指定位置水果灯闪烁
     * @param value
     *
     */
    stopTwinkleFruits(value: number): void

    /**
     * 指定位置水果灯保持常亮
     * @param value
     *
     */
    wakey(value: number): void

    /**
     * 根据选择水果的ID 获取选择按钮
     * @param id
     * @return
     *
     */
    getSelectItem(id: number): any

    /** 新打中的金币  */
    addGainGold(value: number): void

    /** 所有尾灯变亮 */
    allTailLight(): void

    /** 所有位置水果尾灯 */
    stopAllTail(): void

}