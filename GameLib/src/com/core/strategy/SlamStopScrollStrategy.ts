import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 急停震动滚动策略
 *
 * 快速滚动到目标位置后触发震动效果。
 * 适用于 Turbo 模式或快速游戏场景。
 */
export class SlamStopScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.SLAM_STOP;
    protected tween: Nullable<Tween> = null;
    protected shakeApplied = false;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, index} = context;
        const duration = config?.duration ?? 800;

        this.tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
            Ease.quadOut, Handler.create(this, () => {
                this.applyShake(list, () => context.onComplete(list));
            }));
    }

    protected applyShake(list: fgui.GList, callback: Function): void {
        if (this.shakeApplied) {
            callback();
            return;
        }
        this.shakeApplied = true;
        const originalY = list.y;
        const shakeAmount = 8;
        const shakeDuration = 60;
        let shakeCount = 0;
        const maxShakes = 3;

        const doShake = () => {
            if (shakeCount >= maxShakes) {
                list.y = originalY;
                this.shakeApplied = false;
                callback();
                return;
            }
            const offset = shakeCount % 2 === 0 ? shakeAmount : -shakeAmount;
            const shakeTween = Tween.to(list, {y: originalY + offset}, shakeDuration,
                Ease.sineInOut, Handler.create(this, () => {
                    shakeCount++;
                    doShake();
                }));
            this.tweens?.push(shakeTween);
        };
        doShake();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected tweens: any[] = [];

    slamStop(): void {
        if (this.tween) this.tween.complete();
    }

    dispose(): void {
        if (this.tween) {
            this.tween.clear();
            this.tween = null;
        }
        this.tweens.forEach(t => t?.clear());
        this.tweens.length = 0
        // 注意：禁止 Laya.Tween.clearAll(null)——会全局清空包括 UI 在内的所有系统 tween，
        // 属于危险副作用；仅清理自身持有的引用即可
    }
}
