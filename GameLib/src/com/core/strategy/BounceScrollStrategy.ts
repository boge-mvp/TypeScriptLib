import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 弹跳停止滚动策略
 *
 * 到达目标位置后会像球落地一样弹跳 2-3 次才停止。
 * 适用于休闲卡通风格 slot 游戏（如 Aristocrat 的 Lightning Link）。
 */
export class BounceScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.BOUNCE;
    protected tween: Nullable<Tween> = null;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, index} = context;
        // duration/delay 统一回读契约：优先 config，其次 model（不再硬编码，
        // 由真实 SlotScrollModel 供给时长并天然支持 turbo；需要更长弹跳节奏时调用方通过 config.duration 放大）
        const duration = config?.duration ?? context.model.getDuration(index, false);
        const delay = config?.delay ?? context.model.getDelay(index, false);

        this.tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
            Ease.bounceOut, Handler.create(this, () => context.onComplete(list)), delay);
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
