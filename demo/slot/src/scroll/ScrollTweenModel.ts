import GList = fgui.GList;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import MathKit = tsCore.MathKit;
import SlotScrollTweenModel = gameLib.SlotScrollTweenModel;

/**
 * 纯 Tween 滚动模型（对齐 premierLeagueStar 生产调参）
 *
 * 继承生产 SlotScrollTweenModel：无匀速帧循环段，playLottery 注入数据后
 * 直接进入结束段 tween。createTween 完整移植 premierLeagueStar 版：
 * 沉底起点 + 2 圈 backInOut 多圈滚动 + 列间错开；悬念局末列多滚一圈。
 */
export class ScrollTweenModel extends SlotScrollTweenModel {

    private _onAllComplete: (() => void) | null = null;
    /** 悬念局标记：末列(index>4)延长圈数与时长（由视图按策略设置） */
    public anticipation = false;

    constructor(columns: GList[]) {
        super();
        columns.forEach(col => this.addRollList(col));
    }

    /** 全部列滚动结束回调 */
    set onAllComplete(cb: (() => void) | null) {
        this._onAllComplete = cb;
    }

    /**
     * 开始一局滚动：TweenModel 的启动入口就是 playLottery 本身
     * （其 override 会在注入数据后立即装配 tween/startPlayResultTween）
     */
    beginSpin(lotteryData: SlotLotteryData[]): void {
        this.playLottery(lotteryData);
    }

    /** 设置滚动方向（基类 isScrollUp 为 protected，经由此公开方法透传） */
    setScrollDirection(isUp: boolean): void {
        this.isScrollUp = isUp;
    }

    /** 清空滚动策略：回落基类原生 createTween（本类覆写版） */
    clearStrategy(): void {
        this._scrollStrategy?.dispose();
        this._scrollStrategy = null;
    }

    /**
     * 覆写：premierLeagueStar 生产版落定 tween
     *
     * up:   起点 posY = itemCount×格高（循环列表回绕沉底），终点 = scrollLong(多圈)；
     *       取模后可视区落位 index 3,4,5 = 3 个结果符号
     * down: 起点更深处（圈数×条带），终点 = rowNum×格高，同样落位 index 3,4,5
     */
    protected override createTween(index: number, list: GList): void {
        const data = this.lotteryData[index];
        const itemHeight = list.getChildAt(0).height;

        // 圈数与时长（生产节奏：2 圈起步、列间错开 50ms；悬念局末列多滚一圈）
        let quan = 2;
        let duration = (index + 1) * 50 + 2000;
        if (this.anticipation && index > 4) {
            quan = 3;
            duration = (index + 1) * 50 + 3000;
        }
        let delay = index * 10;
        if (data.isTurboMode) {
            delay = 0;
            duration = 2000;
        }

        let total: number;
        if (this.isScrollUp) {
            // 沉底起点 + 多圈上滚
            list.scrollPane.posY = itemHeight * data.itemCount;
            total = MathKit.scrollLong(itemHeight, data.itemCount, quan, quan, this.rowNum);
        } else {
            // 更深起点下滚，落位 rowNum×格高（可视区 index 3,4,5）
            list.scrollPane.posY = itemHeight * data.itemCount * quan;
            total = itemHeight * this.rowNum;
        }

        const tween = Tween.to(list.scrollPane, {posY: total}, duration, this.backInOut,
            Handler.create(this, this.completeHandler, [list]), delay);
        this.tweenList.push(tween);
    }

    protected override rollComplete(): void {
        this._onAllComplete?.();
    }
}
