import GList = fgui.GList;
import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import Browser = Laya.Browser;
import {SlotModel} from "./SlotModel"
import {BaseSlotGameData} from "./BaseSlotGameData";
import {ActionLib} from "../ActionLib";
import {ScrollContext} from "./strategy/ISlotScrollStrategy";

export enum SlotRunState {
    START = 1,
    END
}

/**
 * slot游戏滚动效果类 使用了 FrameLoop + Tween
 */
export class SlotScrollModel<T extends BaseSlotGameData = BaseSlotGameData> extends SlotModel<T> {

    /** 当前滚动圈数 */
    private rollCount = 0
    /** 滚动到最大圈数  就可以播放开奖结果了 */
    private rollMaxCount = 100
    /** 是否已经开始播放结束动画 */
    protected isPlayEndTween = false
    /** 结束动画数据 */
    protected scrollData: {id: number, data: number}[] = []
    /** 当前滚动的单列位置 */
    protected singleColumnIndex = -1
    /** 上一帧时间戳（用于时间补偿） */
    private _lastFrameTime: number = 0
    /** 单列模式上一帧时间戳 */
    private _lastSingleFrameTime: number = 0

    constructor() {
        super();
        this.regGameAction(ActionLib.GAME_PLAY_SLOT_LIST_RUN_ANI, this, this.onStartRollSlot)
        this.regGameAction(ActionLib.GAME_STOP_SLOT_LIST_RUN_ANI, this, this.stopRollSlot)
    }

    /**
     * 开始滚动指定列
     * @param index
     */
    protected onStartRoll(index: number) {
        this.singleColumnIndex = index
        this.rollCount = 0
        this.rollMaxCount = 50
        Laya.timer.frameLoop(1, this, this.frameLoopSingleColumnHandler)
    }

    private frameLoopSingleColumnHandler() {
        if (this.isPlayEndTween) return; // 播放结束动画  停止后面的操作
        let list: GList
        // 时间补偿
        if (!this._lastSingleFrameTime) this._lastSingleFrameTime = Browser.now();
        const now = Browser.now();
        const dt = Math.min((now - this._lastSingleFrameTime) / 16.67, 3);
        this._lastSingleFrameTime = now;
        const speed = 50 * dt;
        // 滚动数据
        list = this.listRolls[this.singleColumnIndex]
        if (this.isScrollUp) {
            // if (this.isPlayEndTween)
            list.scrollPane.posY += speed
        } else {
            list.scrollPane.posY -= speed
        }
        this.rollCount++
        let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode
        let tempRollMax = this.rollMaxCount
        if (tempTurbo) {
            tempRollMax = 20
        }
        if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) {// 满足最大圈数还得  并且获得了开奖数据
            this.onLogicLotteryStart()
            this.isPlayEndTween = true
            this.tweenList.splice(0, this.tweenList.length)
            let itemHeight: number
            list = this.listRolls[this.singleColumnIndex]
            list.data = this.lotteryData[0].arr
            list.numItems = list.data.length

            let duration = this.getDuration(0, this.lotteryData[0].isTurboMode)

            // 将列表 设置到最下边
            itemHeight = this.getItemHeight(list)
            let end = itemHeight * this.rowNum; // 默认是向下滚动的值
            if (this.isScrollUp) {
                list.scrollPane.posY = end
                end = itemHeight * this.lotteryData[0].itemCount + end
            } else {
                list.scrollPane.posY = itemHeight * this.lotteryData[0].itemCount
            }

            // 开始播放缓动动画
            let tween = Tween.to(list.scrollPane, {posY: end}, duration,
                Ease.linearNone, Handler.create(this, this.completeHandler, [list]))
            this.tweenList.push(tween)

            this.scrollData.push({id: this.singleColumnIndex, data: end})

            // 防止tween 没有及时跟上  延迟100ms 在清理
            // Laya.timer.once(400, this, this.clearCall)
            this.clearCall()
            this.onLogicLotteryEnd()
        }
    }


    /**
     * 开始转动所有滚动序列
     */
    protected onStartRollSlot() {
        Laya.timer.clear(this, this.frameLoopHandler)
        this.rollCount = 0
        this.rollMaxCount = 100
        Laya.timer.frameLoop(1, this, this.frameLoopHandler)
    }

    /**
     * 停止自动滚动
     * 并保持在指定行数 this.rowNum 位置
     */
    stopRollSlot() {
        Laya.timer.clearAll(this)
        this.listRolls.forEach(value => value.scrollPane.posY = value.numChildren > 0 ? value.getChildAt(0).height * this.rowNum : 0)
    }

    protected frameLoopHandler() {
        if (this.isPlayEndTween) return; // 播放结束动画  停止后面的操作
        let list: GList
        // 时间补偿：基于实际帧间隔计算位移，避免高刷屏滚动过快
        if (!this._lastFrameTime) this._lastFrameTime = Browser.now();
        const now = Browser.now();
        const dt = Math.min((now - this._lastFrameTime) / 16.67, 3); // 限制最大3倍，防止切后台回来飞走
        this._lastFrameTime = now;
        const speed = 50 * dt;
        for (let i = 0; i < this.listRolls.length; i++) {
            list = this.listRolls[i]
            if (!this.isRunList(list, i))
                continue
            if(list["runState"] != SlotRunState.START) {
                list["runState"] = SlotRunState.START
                this.runStateChange(SlotRunState.START, list)
            }
            if (this.isScrollUp) {
                list.scrollPane.posY += speed
            } else {
                list.scrollPane.posY -= speed
            }
        }
        this.rollCount++
        let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode
        let tempRollMax = this.rollMaxCount
        if (tempTurbo) {
            tempRollMax = 20
        }
        if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) {// 满足最大圈数还得  并且获得了开奖数据
            this.isPlayEndTween = true
            Laya.timer.callLater(this, this.callRunTween)
        }
    }

    /**
     * 运行状态变动
     * @param state 滚动状态
     * @param list 组件
     * @protected
     */
    protected runStateChange(state: SlotRunState, list: fgui.GList) {
    }

    protected callRunTween() {
        this.onLogicLotteryStart()
        this.tweenList.splice(0, this.tweenList.length)

        if (this._scrollStrategy) {
            // 使用自定义滚动策略
            this.listRolls.forEach((value, index) => {
                this.setRenderListData(index)
                if (this.isRunList(value, index))
                    this.createTweenWithStrategy(index, value)
            })
        } else {
            // 原有逻辑（向后兼容）
            this.listRolls.forEach((value, index) => {
                this.setRenderListData(index)
                if (this.isRunList(value, index))
                    this.createTween(index, value)
            })
        }

        Laya.timer.once(400, this, this.clearCall)
        this.onLogicLotteryEnd()
    }

    /**
     * 创建list滚动动画
     * @param index list位置
     * @param list list对象
     * @protected
     */
    protected createTween(index: number, list: fgui.GList) {
        const duration = this.getDuration(index, this.lotteryData[index].isTurboMode)
        // 将列表 设置到最下边
        const itemHeight = this.getItemHeight(list)
        let end = itemHeight * this.rowNum; // 默认是向下滚动的值
        if (this.isScrollUp) {
            list.scrollPane.posY = end
            end = itemHeight * this.lotteryData[index].itemCount + end
        } else {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount
        }
        this.onScrollTween(index, this.lotteryData[index])
        // 开始播放缓动动画
        const tween = Tween.to(list.scrollPane, {posY: end}, duration,
            Ease.linearNone, Handler.create(this, this.completeHandler, [list]))
        this.tweenList.push(tween)
        this.scrollData.push({id: index, data: end})
    }

    /**
     * 使用策略创建滚动动画
     */
    protected createTweenWithStrategy(index: number, list: fgui.GList) {
        const itemHeight = this.getItemHeight(list)
        let end = itemHeight * this.rowNum
        if (this.isScrollUp) {
            list.scrollPane.posY = end
            end = itemHeight * this.lotteryData[index].itemCount + end
        } else {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount
        }
        this.onScrollTween(index, this.lotteryData[index])

        const context: ScrollContext = {
            model: this,
            index,
            list,
            targetPos: end,
            isScrollUp: this.isScrollUp,
            onComplete: (l: GList) => this.completeHandler(l)
        }
        this._scrollStrategy?.spin(context, this._scrollConfig)
    }

    /** 延迟执行 */
    private clearCall() {
        this.stopRollSlot()
        this.startPlayResultTween()
    }

    protected override setRenderListData(index: number) {
        let list = this.listRolls[index]
        list.data = this.lotteryData[index].arr
        list.numItems = list.data.length
    }

    getDuration(index: number, isTurboMode: boolean) {
        let duration = 500 + (index * 200) // 动画持续时间
        if (isTurboMode) {
            duration = 500 // 动画默认快速持续时间 必须500起步  否则completeHandler中的延迟Laya.time 会有丢失的情况
        }
        return duration
    }

    getDelay(index: number, isTurboMode: boolean) {
        return 0
    }

    /**
     * 完成一次滚动调用
     * @param list 滚动list
     */
    protected completeHandler(list: GList) {
        this.completeCount++
//        Log.debug("a" + this.completeCount + "  " + Browser.now())
        if(list["runState"] != SlotRunState.END) {
            list["runState"] = SlotRunState.END
            this.runStateChange(SlotRunState.END, list)
        }
        // 如果需要完成一次回调
        this.oneComplete(list)
        if (this.completeCount < this.tweenList.length) {
            return
        }
        this.lotteryData.splice(0, this.lotteryData.length)
        while (this.tweenList.length > 0) {
            this.tweenList.shift()?.clear()
        }
        this.singleColumnIndex = -1
        this.isPlayEndTween = false
        if (this.allEndDelay) {
            Laya.timer.once(this.allEndDelay, this, this.rollComplete)
        } else this.rollComplete()
    }

    override stopTween() {
        this.stopRollSlot()
        super.stopTween()
        this.isPlayEndTween = false
    }

    override dispose() {
        this.stopRollSlot()
        Laya.timer.clearAll(this)
        super.dispose()
    }

}