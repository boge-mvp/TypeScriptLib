/**
 * 动效动作类型定义
 */
export type TransitionActionType =
    | "xy"
    | "size"
    | "scale"
    | "pivot"
    | "alpha"
    | "rotation"
    | "color"
    | "shake"
    | "visible"
    | "animation"
    | "sound"
    | "transition"
    | "colorFilter"
    | "skew"
    | "text"
    | "icon";

/**
 * 动效单项动作配置
 */
export interface ITransitionItemConfig {
    /** 动作类型，如 "scale", "alpha", "xy", "rotation", "shake" 等 */
    type: TransitionActionType;
    /** 目标子节点名称（或直接传入 GObject 引用；缺省或为空表示容器自身） */
    target?: string | fgui.GObject;
    /** 目标子节点名称别名（与 target 等价） */
    targetId?: string;
    /** 开始触发时间偏移（秒），默认为 0 */
    time?: number;
    /** 持续时间（秒） */
    duration?: number;
    /** 缓动方程类型（对应 FGUI EaseType 数字枚举，如 EaseType.QuadOut=4，默认 QuadOut） */
    easeType?: number;
    /** 重复次数（-1 表示单项循环，默认 0） */
    repeat?: number;
    /** 是否往返播放 (Yoyo) */
    yoyo?: boolean;
    /** 是否启用补间（当声明了 duration 时自动为 true） */
    tween?: boolean;
    /** 嵌套补间配置兼容字段 */
    tweenConfig?: {
        duration?: number;
        easeType?: number;
        repeat?: number;
        yoyo?: boolean;
        startValue?: any;
        endValue?: any;
    };
    /** 关键帧标签名 */
    label?: string;
    /** 结束帧标签名 */
    endLabel?: string;
    /** 起始值：如 scale 为 [1, 1]，alpha 为 0，xy 为 [0, 0]，rotation 为 0 */
    startValue?: any;
    /** 目标值：如 scale 为 [1.2, 1.2]，alpha 为 1，xy 为 [100, 200]，rotation 为 360 */
    endValue?: any;
    /** 静态固定值（用于无需补间的动作类型，如 visible, text, icon） */
    value?: any;
    /** 震动配置（用于 shake 类型）：{ amplitude: number, duration: number } */
    shake?: { amplitude: number; duration: number };
    /** 关键帧回调钩子 */
    hook?: () => void;
}

/**
 * 动效整体配置协议
 */
export interface ITransitionConfig {
    /** 动效唯一名称，可通过 component.getTransition(name) 检索 */
    name: string;
    /** 添加到舞台时是否自动播放，默认为 false */
    autoPlay?: boolean;
    /** 自动播放次数（-1 表示无限循环），默认为 1 */
    autoPlayTimes?: number;
    /** 自动播放延迟（秒），默认为 0 */
    autoPlayDelay?: number;
    /** 补间动作条目集合 */
    items?: ITransitionItemConfig[];
}
