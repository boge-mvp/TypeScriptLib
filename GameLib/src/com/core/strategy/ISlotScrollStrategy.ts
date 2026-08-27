import GList = fgui.GList;
import {SlotModel} from "../SlotModel";

/**
 * 滚动策略类型枚举
 */
export enum ScrollStrategyType {
    /** 匀速线性 */
    LINEAR = 'linear',
    /** 过冲回弹 */
    BACK_OUT = 'backOut',
    /** 弹跳停止 */
    BOUNCE = 'bounce',
    /** 弹性振荡 */
    ELASTIC = 'elastic',
    /** 悬念停止（快滚+暂停+慢落） */
    ANTICIPATION = 'anticipation',
    /** 三段式缓动（加速+匀速+减速） */
    EASE_IN_OUT = 'easeInOut',
    /** 急停震动 */
    SLAM_STOP = 'slamStop'
}

/**
 * 滚动配置
 */
export interface ScrollConfig {
    /** 滚动时长（毫秒），不传则用 model.getDuration */
    duration?: number;
    /** 延迟启动（毫秒） */
    delay?: number;
    /**
     * 过冲量，backOut 用，默认 1.70158
     * @remarks 已知限制：Laya.Ease.backOut 不支持自定义 s 参数，该配置当前仅作声明留存未实际生效
     */
    overshoot?: number;
    /** 悬念暂停时长（毫秒），anticipation 用，默认 400 */
    anticipationDelay?: number;
    /**
     * 错列停止间隔（毫秒），默认 200
     * @remarks 已知限制：策略为逐列独立 spin 调用，缺少跨列调度点，该配置当前未实现；
     * 错列节奏暂由 SlotModel.getDuration 的 index 差异达成
     */
    staggerInterval?: number;
    /** 三段式中加速段占比 0-1，easeInOut 用，默认 0.2 */
    easeInRatio?: number;
    /** 三段式中减速段占比 0-1，easeInOut 用，默认 0.3 */
    easeOutRatio?: number;
}

/**
 * 滚动上下文
 */
export interface ScrollContext {
    /** SlotModel 实例 */
    model: SlotModel<any>;
    /** 列索引 */
    index: number;
    /** 目标 GList */
    list: GList;
    /** 目标 posY */
    targetPos: number;
    /** 是否向上滚动 */
    isScrollUp: boolean;
    /** 完成回调 */
    onComplete: (list: GList) => void;
}

/**
 * 滚动策略接口
 *
 * 所有滚动效果策略必须实现此接口。
 * 策略模式允许在运行时动态切换滚动效果，
 * 而不需要修改 SlotModel 或其子类的代码。
 *
 * @example
 * ```typescript
 * // 使用工厂创建策略
 * const strategy = SlotScrollStrategyFactory.create(ScrollStrategyType.BACK_OUT);
 *
 * // 执行滚动
 * strategy.spin(context, { duration: 2000, overshoot: 1.7 });
 *
 * // 急停
 * strategy.slamStop();
 *
 * // 释放
 * strategy.dispose();
 * ```
 */
export interface IScrollStrategy {
    /** 策略类型 */
    readonly type: ScrollStrategyType;

    /**
     * 执行滚动
     * @param context 滚动上下文
     * @param config 配置参数
     */
    spin(context: ScrollContext, config?: ScrollConfig): void;

    /** 立即停止（急停） */
    slamStop(): void;

    /** 释放资源 */
    dispose(): void;
}
