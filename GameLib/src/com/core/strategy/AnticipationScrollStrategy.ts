import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 悬念停止滚动策略
 *
 * 行业热门效果，模拟"紧张→悬念→揭晓"的心理节奏：
 * 1. 快速滚动到接近目标位置
 * 2. 暂停片刻（营造悬念）
 * 3. 缓慢落到目标位置
 *
 * 适用于高端现代 slot 游戏（如 Pragmatic Play 的 Sweet Bonanza）。
 *
 * 默认最后一列为"悬念列"，子类可覆盖 isAnticipationColumn 自定义。
 */
export class AnticipationScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.ANTICIPATION;
    protected tweens: Tween[] = [];
    protected isSlamStopped = false;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        // 每次起滚复位急停标记：同实例 slamStop 后复用不会跳过悬念阶段
        this.isSlamStopped = false;
        const {list, targetPos, index} = context;
        // duration/delay 统一回读契约：优先 config，其次 model（不再硬编码）
        const duration = config?.duration ?? context.model.getDuration(index, false);
        const delay = config?.delay ?? context.model.getDelay(index, false);
        const anticipationDelay = config?.anticipationDelay ?? 400;

        const isAnticipationCol = this.isAnticipationColumn(context);

        if (isAnticipationCol) {
            // 阶段1：快速滚到接近目标（留 1-2 格距离）
            const itemHeight = this.getItemHeight(list);
            const nearTarget = targetPos - itemHeight * 2;
            const phase1Duration = duration * 0.6;

            const tween1 = Tween.to(list.scrollPane, {posY: nearTarget}, phase1Duration,
                Ease.quadOut, Handler.create(this, () => {
                    if (this.isSlamStopped) return;
                    // 阶段2：悬念暂停（可在此播放音效/光效）
                    Laya.timer.once(anticipationDelay, this, () => {
                        if (this.isSlamStopped) return;
                        // 阶段3：缓慢停止到目标
                        const phase3Duration = duration * 0.4;
                        const tween3 = Tween.to(list.scrollPane, {posY: targetPos},
                            phase3Duration, Ease.backOut,
                            Handler.create(this, () => context.onComplete(list)));
                        this.tweens.push(tween3);
                    });
                }), delay);
            this.tweens.push(tween1);
        } else {
            // 非悬念列：直接 backOut
            const tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
                Ease.backOut, Handler.create(this, () => context.onComplete(list)), delay);
            this.tweens.push(tween);
        }
    }

    /**
     * 判断是否为需要悬念效果的列
     * @param context 滚动上下文
     * @returns 是否为悬念列
     */
    protected isAnticipationColumn(context: ScrollContext): boolean {
        return context.index === context.model.getRollLists().length - 1;
    }

    protected getItemHeight(list: fgui.GList): number {
        return list.numChildren > 0 ? list.getChildAt(0).height : 100;
    }

    slamStop(): void {
        this.isSlamStopped = true;
        this.tweens.forEach(t => t?.complete());
        this.tweens.length = 0;
    }

    dispose(): void {
        this.tweens.forEach(t => t?.clear());
        this.tweens.length = 0;
        Laya.timer.clearAll(this);
        this.isSlamStopped = false;
    }
}
