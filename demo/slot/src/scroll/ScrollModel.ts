import GList = fgui.GList;
import SlotScrollModel = gameLib.SlotScrollModel;

/**
 * 测试用滚动模型
 *
 * 继承生产 SlotScrollModel，完整保留 frameLoop 匀速起滚、callRunTween、
 * createTweenWithStrategy（真实 context.model）与 completeHandler 计数收尾链路；
 * 仅通过覆写 rollComplete 斩断 Player/Server/GameData 依赖。
 */
export class ScrollModel extends SlotScrollModel {

    private _onAllComplete: (() => void) | null = null;

    constructor(columns: GList[]) {
        super();
        columns.forEach(col => this.addRollList(col));
    }

    /** 全部列滚动结束回调 */
    set onAllComplete(cb: (() => void) | null) {
        this._onAllComplete = cb;
    }

    /**
     * 开始一局滚动：以「空结果」启动匀速待机段
     *
     * 生产 frameLoopHandler 仅在 `rollCount>=maxCount && lotteryData.length>0`
     * 时才进入落定 tween —— 空结果时轮子持续匀速滚动，
     * 等待 deliverResult 延迟注入真实开奖数据。
     */
    beginSpin(): void {
        this.playLottery([]);
        this.onStartRollSlot();
    }

    /** 延迟到期注入开奖结果 → 匀速段下一帧自动进入落定 tween */
    deliverResult(lotteryData: SlotLotteryData[]): void {
        this.playLottery(lotteryData);
    }

    /** 设置滚动方向（基类 isScrollUp 为 protected，经由此公开方法透传） */
    setScrollDirection(isUp: boolean): void {
        this.isScrollUp = isUp;
    }

    /**
     * 覆写：测试环境无服务器/GameData，
     * 跳过 countFreeBonus/lotteryComplete 的余额与 Action 广播链，直接通知视图
     */
    protected override rollComplete(): void {
        this._onAllComplete?.();
    }

    /**
     * 覆写时长（对齐 premierLeagueStar 生产节奏）：
     * (index+1)*50 + 2000 列间错开；turbo 固定 2000
     */
    override getDuration(index: number, isTurboMode: boolean): number {
        return isTurboMode ? 2000 : (index + 1) * 50 + 2000;
    }

    override getDelay(index: number, isTurboMode: boolean): number {
        return isTurboMode ? 0 : index * 10;
    }

    /**
     * 覆写：基类此方法为空实现，落定前必须把本列条带灌入列表
     * （对齐 SlotScrollTweenModel 的同名实现）
     */
    protected override setRenderListData(index: number): void {
        const list = this.listRolls[index];
        list.data = this.lotteryData[index].arr;
        list.numItems = list.data.length;
    }

    /**
     * 清空滚动策略：callRunTween 将回落到基类原生 createTween 分支
     * （linearNone 直线落定，duration=getDuration 各列错开）
     */
    clearStrategy(): void {
        this._scrollStrategy?.dispose();
        this._scrollStrategy = null;
    }
}
