import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 匀速线性滚动策略
 *
 * 最基础的滚动效果，匀速运动到目标位置。
 * 适用于经典复古风格 slot 游戏（如 IGT 老虎机）。
 */
export class LinearScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.LINEAR;
    protected tween: Nullable<Tween> = null;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, onComplete} = context;
        // duration/delay 统一回读契约：优先 config，其次 model（与其他策略保持一致）
        const duration = config?.duration ?? context.model.getDuration(context.index, false);
        const delay = config?.delay ?? context.model.getDelay(context.index, false);
        this.tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
            Ease.linearNone, Handler.create(this, () => onComplete(list)), delay);
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
