import GList = fgui.GList;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import MathKit = tsCore.MathKit;
import {SlotModel} from "./SlotModel"
import {BaseSlotGameData} from "./BaseSlotGameData";

/**
 * slot游戏滚动效果类 只使用了 Tween
 */
export class SlotScrollTweenModel<T extends BaseSlotGameData = BaseSlotGameData> extends SlotModel<T> {

    protected override playLottery(value: SlotLotteryData[]) {
        super.playLottery(value)
        let list: GList
        let itemHeight: number
        let total: number
        let delay: number
        let tween: Tween
        for (let i = 0; i < this.listRolls.length; i++) {
            list = this.listRolls[i]
            this.setRenderListData(i)
            itemHeight = this.getItemHeight(list)
            let duration = this.getDuration(i, this.lotteryData[i].isTurboMode)
            delay = this.getDelay(i, this.lotteryData[i].isTurboMode)
            if (this.isScrollUp) {
                list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount
                total = MathKit.scrollLong(itemHeight, this.lotteryData[i].itemCount, this.getLaps(i), this.getLaps(i), this.rowNum)
            } else {
                list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount * this.getLaps(i)
                total = itemHeight * this.rowNum
            }
            this.onScrollTween(i, this.lotteryData[i])
            tween = Tween.to(list.scrollPane, {posY: total}, duration, this.backInOut,
                Handler.create(this, this.completeHandler, [list]), delay)
            this.tweenList.push(tween)
        }
        this.startPlayResultTween()
    }

    protected override setRenderListData(index: number) {
        let list = this.listRolls[index]
        list.data = this.lotteryData[index].arr
        list.numItems = list.data.length
    }

    protected getDuration(index: number, isTurboMode: boolean): number {
        let duration = index * 150 + 2000
        if (isTurboMode) {
            duration = 2000
        }
        return duration
    }

    protected getDelay(index: number, isTurboMode: boolean): number {
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
            this.tweenList.shift().clear()
        }
        if (this.allEndDelay) {
            Laya.timer.once(this.allEndDelay, this, this.rollComplete)
        } else this.rollComplete()

    }

    override dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

}