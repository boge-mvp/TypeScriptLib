import {ScrollStrategyType, IScrollStrategy, ScrollConfig} from "./ISlotScrollStrategy";
import {LinearScrollStrategy} from "./LinearScrollStrategy";
import {BackOutScrollStrategy} from "./BackOutScrollStrategy";
import {BounceScrollStrategy} from "./BounceScrollStrategy";
import {ElasticScrollStrategy} from "./ElasticScrollStrategy";
import {AnticipationScrollStrategy} from "./AnticipationScrollStrategy";
import {EaseInOutScrollStrategy} from "./EaseInOutScrollStrategy";
import {SlamStopScrollStrategy} from "./SlamStopScrollStrategy";

/**
 * 滚动策略工厂
 *
 * 根据类型创建对应的策略实例。
 * 使用工厂模式将策略创建逻辑集中管理，
 * 调用方无需了解具体策略类的构造细节。
 */
export class SlotScrollStrategyFactory {

    /**
     * 创建滚动策略实例
     * @param type 策略类型
     * @param config 可选配置（部分策略支持）
     * @returns 策略实例
     */
    static create(type: ScrollStrategyType, config?: ScrollConfig): IScrollStrategy {
        switch (type) {
            case ScrollStrategyType.LINEAR:
                return new LinearScrollStrategy();
            case ScrollStrategyType.BACK_OUT:
                return new BackOutScrollStrategy();
            case ScrollStrategyType.BOUNCE:
                return new BounceScrollStrategy();
            case ScrollStrategyType.ELASTIC:
                return new ElasticScrollStrategy();
            case ScrollStrategyType.ANTICIPATION:
                return new AnticipationScrollStrategy();
            case ScrollStrategyType.EASE_IN_OUT:
                return new EaseInOutScrollStrategy();
            case ScrollStrategyType.SLAM_STOP:
                return new SlamStopScrollStrategy();
            default:
                return new BackOutScrollStrategy();
        }
    }

    /**
     * 获取所有可用策略类型列表
     */
    static getAvailableTypes(): ScrollStrategyType[] {
        return [
            ScrollStrategyType.LINEAR,
            ScrollStrategyType.BACK_OUT,
            ScrollStrategyType.BOUNCE,
            ScrollStrategyType.ELASTIC,
            ScrollStrategyType.ANTICIPATION,
            ScrollStrategyType.EASE_IN_OUT,
            ScrollStrategyType.SLAM_STOP
        ];
    }
}
