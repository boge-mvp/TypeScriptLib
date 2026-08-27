import GList = fgui.GList;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import MathKit = tsCore.MathKit;
import {SlotModel} from "./SlotModel"
import {BaseSlotGameData} from "./BaseSlotGameData";
import {ScrollContext} from "./strategy/ISlotScrollStrategy";

/**
 * slot游戏滚动效果类 只使用了 Tween
 */
export class SlotScrollTweenModel<T extends BaseSlotGameData = BaseSlotGameData> extends SlotModel<T> {

    protected override playLottery(value: SlotLotteryData[]) {
        super.playLottery(value)

        if (this._scrollStrategy) {
            // 使用自定义滚动策略
            this.listRolls.forEach((val, index) => {
                this.setRenderListData(index)
                if (this.isRunList(val, index))
                    this.createTweenWithStrategy(index, val)
            })
        } else {
            // 原有逻辑（向后兼容）
            this.listRolls.forEach((val, index) => {
                this.setRenderListData(index)
                this.createTween(index, val)
            })
        }

        this.startPlayResultTween()
    }

    /**
     * 创建list滚动动画
     * @param index list位置
     * @param list list对象
     * @protected
     */
    protected createTween(index: number, list: fgui.GList) {
        const itemHeight = this.getItemHeight(list)
        let duration = this.getDuration(index, this.lotteryData[index].isTurboMode)
        const delay = this.getDelay(index, this.lotteryData[index].isTurboMode)
        let total: number
        if (this.isScrollUp) {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount
            total = MathKit.scrollLong(itemHeight, this.lotteryData[index].itemCount, this.getLaps(index), this.getLaps(index), this.rowNum)
        } else {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount * this.getLaps(index)
            total = itemHeight * this.rowNum
        }
        this.onScrollTween(index, this.lotteryData[index])
        const tween = Tween.to(list.scrollPane, {posY: total}, duration, this.backInOut,
            Handler.create(this, this.completeHandler, [list]), delay)
        this.tweenList.push(tween)
    }

    /**
     * 使用策略创建滚动动画
     */
    protected createTweenWithStrategy(index: number, list: fgui.GList) {
        const itemHeight = this.getItemHeight(list)
        let total: number
        if (this.isScrollUp) {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount
            total = MathKit.scrollLong(itemHeight, this.lotteryData[index].itemCount, this.getLaps(index), this.getLaps(index), this.rowNum)
        } else {
            list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount * this.getLaps(index)
            total = itemHeight * this.rowNum
        }
        this.onScrollTween(index, this.lotteryData[index])

        const context: ScrollContext = {
            model: this,
            index,
            list,
            targetPos: total,
            isScrollUp: this.isScrollUp,
            onComplete: (l: GList) => this.completeHandler(l)
        }
        this._scrollStrategy?.spin(context, this._scrollConfig)
    }

    protected override setRenderListData(index: number) {
        let list = this.listRolls[index]
        list.data = this.lotteryData[index].arr
        list.numItems = list.data.length
    }

    getDuration(index: number, isTurboMode: boolean): number {
        let duration = index * 150 + 2000
        if (isTurboMode) {
            duration = 2000
        }
        return duration
    }

    getDelay(index: number, isTurboMode: boolean): number {
        let delay = index * 30
        if (isTurboMode) {
            delay = 0
        }
        return delay
    }

    /**
     * 完成一次滚动调用
     * @param list 滚动list
     */
    protected completeHandler(list: GList) {
        this.completeCount++
        // 如果需要完成一次回调
        this.oneComplete(list)
        if (this.completeCount < this.tweenList.length) {
            return
        }
        this.lotteryData.splice(0, this.lotteryData.length)
        while (this.tweenList.length > 0) {
            this.tweenList.shift()?.clear()
        }
        if (this.allEndDelay) {
            Laya.timer.once(this.allEndDelay, this, this.rollComplete)
        } else this.rollComplete()

    }

    override dispose() {
        super.dispose()
    }

}