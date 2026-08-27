import Tween = Laya.Tween;
import Ease = Laya.Ease;
import Handler = Laya.Handler;
import {IScrollStrategy, ScrollStrategyType, ScrollConfig, ScrollContext} from "./ISlotScrollStrategy";

/**
 * 弹性振荡滚动策略
 *
 * 到达目标位置后会像弹簧一样弹性振荡多次才停止。
 * 适用于卡通/奇幻风格 slot 游戏（如 Big Time Gaming 的 Megaways）。
 */
export class ElasticScrollStrategy implements IScrollStrategy {
    readonly type = ScrollStrategyType.ELASTIC;
    protected tween: Nullable<Tween> = null;

    spin(context: ScrollContext, config?: ScrollConfig): void {
        const {list, targetPos, index} = context;
        // duration/delay 统一回读契约：优先 config，其次 model（不再硬编码；
        // elasticOut 需要较长时长展示振荡，追求完整效果时由调用方经 config.duration 放大）
        const duration = config?.duration ?? context.model.getDuration(index, false);
        const delay = config?.delay ?? context.model.getDelay(index, false);

        this.tween = Tween.to(list.scrollPane, {posY: targetPos}, duration,
            Ease.elasticOut, Handler.create(this, () => context.onComplete(list)), delay);
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
