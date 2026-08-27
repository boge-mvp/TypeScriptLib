import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 三段式缓动滚动策略
 *
 * 行业标杆效果，模拟真实物理运动：
 * 1. 加速段（easeIn）：从静止开始加速
 * 2. 匀速段（linear）：保持最高速度匀速滚动
 * 3. 减速段（easeOut + backOut）：减速并轻微过冲停止
 *
 * 适用于追求高品质体验的 slot 游戏（如 NetEnt 的 Starburst）。
 */
export class EaseInOutScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.EASE_IN_OUT;
    protected tweens: Tween[] = [];
    protected isRunning = false;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, isScrollUp} = context;
        // duration 统一回读契约；delay 只作用于首段（加速段）启动延迟
        const totalDuration = config?.duration ?? context.model.getDuration(context.index, false);
        const startDelay = config?.delay ?? context.model.getDelay(context.index, false);
        const easeInRatio = config?.easeInRatio ?? 0.2;
        const easeOutRatio = config?.easeOutRatio ?? 0.3;

        const startPos = list.scrollPane.posY;
        const totalDistance = Math.abs(targetPos - startPos);
        const direction = isScrollUp ? 1 : -1;

        // 三段距离分配：加速15% + 匀速70% + 减速15%
        const phase1Dist = totalDistance * 0.15;
        const phase1End = startPos + direction * phase1Dist;

        const phase2Dist = totalDistance * 0.7;
        const phase2End = phase1End + direction * phase2Dist;

        this.isRunning = true;

        // 阶段1：quadIn 加速（携带启动延迟）
        const phase1Dur = totalDuration * easeInRatio;
        const tween1 = Tween.to(list.scrollPane, {posY: phase1End}, phase1Dur,
            Ease.quadIn, Handler.create(this, () => {
                if (!this.isRunning) return;
                // 阶段2：linearNone 匀速
                const phase2Dur = totalDuration * (1 - easeInRatio - easeOutRatio);
                const tween2 = Tween.to(list.scrollPane, {posY: phase2End}, phase2Dur,
                    Ease.linearNone, Handler.create(this, () => {
                        if (!this.isRunning) return;
                        // 阶段3：backOut 减速+过冲
                        const phase3Dur = totalDuration * easeOutRatio;
                        const tween3 = Tween.to(list.scrollPane, {posY: targetPos},
                            phase3Dur, Ease.backOut,
                            Handler.create(this, () => context.onComplete(list)));
                        this.tweens.push(tween3);
                    }));
                this.tweens.push(tween2);
            }), startDelay);
        this.tweens.push(tween1);
    }

    slamStop(): void {
        this.isRunning = false;
        this.tweens.forEach(t => t?.complete());
        this.tweens.length = 0;
    }

    dispose(): void {
        this.isRunning = false;
        this.tweens.forEach(t => t?.clear());
        this.tweens.length = 0;
    }
}
