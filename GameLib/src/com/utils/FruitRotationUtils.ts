import Browser = Laya.Browser;
import {IFruit} from "../interfaces/IFruit"
import SoundUtils = tsCore.SoundUtils;

/**
 * 水果机旋转动画
 * @author boge
 *
 */
export class FruitRotationUtils {

    /** 跑帧位置 */
    protected currentRunIndex = 0
    /** 上次时间 */
    protected oldTimer = 0
    /** 间隔时间 */
    protected spaceTimer = 500
    /** 开始位置 */
    protected startIndex = 0
    /** 预计演播跑灯圈数 */
    protected runCount = 0
    /** 当前跑动圈数 */
    protected currentRunCount = 0
    /** 跑动是否结束了 */
    protected isRunEnd: boolean
    /** 奖励 */
    protected awards = []
    /** 顺时针方向跑动 */
    protected catapultDirection: boolean
    /** 预选位置偏移量 */
    private preselectionOffset = 4

    /** 运行调用函数 */
    private runCallback: ParamHandler
    /** 选定阶段调用函数 */
    private selectedCallback: ParamHandler
    /** 结束调用函数 */
    private playRunSlotEndCallback: ParamHandler
    /** 结束调用函数 */
    private runEndCallback: ParamHandler
    /** 舞台对象 */
    private fruit: IFruit


    constructor(fruit: IFruit) {
        this.fruit = fruit
    }

    /**
     *
     * @param arr 奖励
     * @param runCallback 运行调用函数
     * @param selectedCallback 选定阶段调用函数
     * @param playRunSlotEndCallback 结束调用函数
     * @param runEndCallback 结束调用函数
     */
    startRun(arr: any[], runCallback: ParamHandler, selectedCallback: ParamHandler, playRunSlotEndCallback: ParamHandler, runEndCallback: ParamHandler) {
        this.awards = arr
        this.runCallback = runCallback
        this.selectedCallback = selectedCallback
        this.playRunSlotEndCallback = playRunSlotEndCallback
        this.runEndCallback = runEndCallback

        this.catapultDirection = true
        // 重置
        this.oldTimer = 0
        this.spaceTimer = 300
        // 计算预告结束位置
        let value: number = this.awards[0] - this.preselectionOffset
        if (value < 0) value = this.fruit.fruitLen() + value
        this.startIndex = value;// 预告结束位置

        this.runCount = 5
        this.currentRunCount = 0
        this.isRunEnd = false

        Laya.timer.frameLoop(1, this, this.runHandler)
    }

    private runHandler() {
        let newTimer = Browser.now()
        if (newTimer - this.oldTimer >= this.spaceTimer) {//1s
            this.oldTimer = newTimer
            runFun(this.runCallback)
            this.fruit.showSlotIndex(this.currentRunIndex, this.isRunEnd ? 0 : 3)
            // 计算圈数
            if (this.currentRunIndex == this.startIndex) { // 判断是否进入预告结束位置
                this.currentRunCount++
                if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于5圈
                    this.isRunEnd = true;//进入选定阶段
                    runFun(this.selectedCallback)
                }
            }
            if (this.isRunEnd) {// 如果是选定阶段
                this.spaceTimer = this.spaceTimer + 120;//递增间隔滚动
                if (this.spaceTimer > 530) { // 最高延迟速度
                    this.spaceTimer = 530
                }
                // 当前滚动值等于最终值
                if (this.currentRunIndex == this.awards[0]) {
                    Laya.timer.clear(this, this.runHandler)
                    runFun(this.playRunSlotEndCallback)
                    this.checkAward()
                }
            } else {
                this.spaceTimer = this.spaceTimer - 30
                if (this.spaceTimer < 0) {
                    this.spaceTimer = 0
                }
            }
            // 计算下一次跑动坐标
            this.currentRunIndex++
            if (this.currentRunIndex >= this.fruit.fruitLen()) {
                this.currentRunIndex = 0
            }
        }
    }

    private checkAward() {
        let value: number
        if (this.awards.length == 1) {// 判断数量 正常得分   或  特殊奖励  开启失败
            this.runEnd()
        } else if (this.awards.length > 1) {// 数量大于1  说明存在  多个奖励
            value = this.awards[0]
            Laya.timer.once(600, this, () => {
//					if (value == 9 || value == 21) { // 特殊奖励
//						fruitScene.twinkleAllFruits()
//						SoundUtils.playSound(URL.formatURL("sounds/bomb.ogg"))
//						Laya.timer.once(1000, this, function() {
//							fruitScene.stopAllTwinkleFruits()
////							SoundUtils.playMusic(URL.formatURL("sounds/background_turnning.mp3"))
//							Laya.timer.once(500, this, function()  {
//								if (awardType == CommonCmd.GRAND_SLAM) { // 大满贯
//									baodeng(awards.slice(1))
//								} else {
//									catapult(value, awards.slice(1), 1)
//								}
//							})
//						})
//					} else {
                this.fruit.twinkleFruits(value, 3, () => {
                    SoundUtils.playMusic(Laya.URL.basePath + "sounds/background_turnning.mp3")
                    this.fruit.stopTwinkleFruits(value)
                    this.fruit.wakey(value)
//							trace("FruitModel.enclosing_method()", value)
                    Laya.timer.once(500, this, () => {
                        this.catapult(value, this.awards.slice(1), 1)
                    })
                })
//					}
            })
        }
    }

    private runEnd() {
        runFun(this.runEndCallback)
    }


    /**
     * 弹射动画
     * @param startIndex 击打起始位置
     * @param array 剩余要被击中的值
     * @param runCount 预计演播跑灯圈数
     * @param huoche 开火车
     */
    private catapult(startIndex: number, array: any[], runCount = 0, huoche = false) {
        if (array.length > 0) {
            let value: number;// 选中位置
            if (huoche) {
                value = array.pop()
            } else {
                value = array.shift()
            }
            this.oldTimer = 0
            this.spaceTimer = 20
            this.currentRunIndex = startIndex
            this.currentRunCount = 0
            this.isRunEnd = false
            this.runCount = 0
            if (runCount != 0) {
                this.runCount = runCount + 1
            }
            Laya.timer.frameLoop(1, this, this.runCatapultHandler, [startIndex, value, array, runCount, huoche])
        } else {
            // 击打结束
//				trace("FruitModel.catapult(startIndex, array) 结束  开下一局")
            this.runEnd()
        }
    }

    /**
     * 弹击函数
     * @param startIndex 击打起始位置
     * @param value 当前选中的值
     * @param array 剩余要被击中的值
     * @param runCount 预计演播跑灯圈数
     * @param huoche 开火车
     */
    private runCatapultHandler(startIndex: number, value: number, array: any[], runCount = 0, huoche = false) {
        let newTimer: number = Browser.now()
        if (newTimer - this.oldTimer >= this.spaceTimer) {//满足当前间隔时间
            this.oldTimer = newTimer
            let tail: number = array.length
//				tail = tail>5?5:tail
            this.fruit.showSlotIndex(this.currentRunIndex, tail, this.catapultDirection)
            // 计算圈数
            if (this.currentRunIndex == startIndex) { // 判断是否进入预告结束位置
                this.currentRunCount++
                if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于预计演播跑灯圈数
                    this.isRunEnd = true;//进入选定阶段
                }
            }

            if (this.isRunEnd) {// 如果是选定阶段
                if (value == this.currentRunIndex) { // 走到了指定位置
//						if (awardType == 0) {
//							
//						}
                    Laya.timer.clear(this, this.runCatapultHandler)
                    SoundUtils.playSound(Laya.URL.basePath + "sounds/zha.ogg")
                    if (huoche) {
                        array.splice(0, array.length)
                        this.fruit.allTailLight()
                        this.catapult(value, array, runCount)
                    } else {
                        this.catapultDirection = !this.catapultDirection
//							trace("FruitModel.runCatapultHandler()", catapultDirection)
//							let isWin:boolean = hitFruit(value)
                        this.fruit.stopAllTail()
                        this.fruit.twinkleFruits(value, 3, () => {
                            this.fruit.stopTwinkleFruits(value)
                            this.fruit.wakey(value)
                            this.catapult(value, array, runCount)
                        })
                    }
                    return
                }
            }
            // 计算下一次跑动坐标
            if (this.catapultDirection) {
                this.currentRunIndex++
            } else {
                this.currentRunIndex--
            }
            if (this.currentRunIndex >= this.fruit.fruitLen()) {
                this.currentRunIndex = 0
            } else if (this.currentRunIndex < 0) {
                this.currentRunIndex = this.fruit.fruitLen() - 1
            }

        }
    }


    stop() {
        Laya.timer.clearAll(this)
    }

    /** 跑帧位置 */
    getCurrentRunIndex(): number {
        return this.currentRunIndex
    }

    /** 跑动是否结束了 */
    getIsRunEnd(): boolean {
        return this.isRunEnd
    }

}