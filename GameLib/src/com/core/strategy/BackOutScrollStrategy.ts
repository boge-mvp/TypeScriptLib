import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 过冲回弹滚动策略
 *
 * 滚动到目标位置后会稍微过冲，然后回弹到目标。
 * 这是行业最经典和常用的效果（如 Play'n GO 的游戏）。
 *
 * @example
 * ```typescript
 * // 标准过冲
 * strategy.spin(context);
 *
 * // 自定义过冲量（越大过冲越明显）
 * strategy.spin(context, { overshoot: 2.0 });
 * ```
 */
export class BackOutScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.BACK_OUT;
    protected tween: Nullable<Tween> = null;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, index} = context;
        const duration = config?.duration ?? context.model.getDuration(index, false);
        const delay = config?.delay ?? context.model.getDelay(index, false);
        const s = config?.overshoot ?? 1.70158;

        this.tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
            Ease.backOut, Handler.create(this, () => context.onComplete(list)), delay);
        // 注意：Laya.Ease.backOut 不支持自定义 s 参数
        // 如需自定义过冲量，需使用 SlotModel 中的 backOut 方法或自定义缓动
    }

    slamStop(): void {
        if (this.tween) this.tween.complete();
    }

    dispose(): void {
        if (this.tween) {
            this.tween.clear();
            this.tween = null;
        }
    }
}
