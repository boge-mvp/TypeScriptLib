import ScrollStrategyType = gameLib.ScrollStrategyType;

/**
 * 策略中心 —— 新策略体系的聚合入口
 *
 * 策略名→枚举映射、策略清单、默认挂载配置、策略描述表统一收口于此，
 * 供 ControlPanel（策略按钮/描述展示）与 TestSlotView（策略挂载）消费，
 * 使策略体系与原生滚动逻辑分包解耦。
 */

/** 策略清单（供控制面板生成按钮） */
export const STRATEGY_LIST: { key: string; name: string }[] = [
    { key: 'linear', name: '线性' },
    { key: 'backOut', name: '过冲回弹' },
    { key: 'bounce', name: '弹跳' },
    { key: 'elastic', name: '弹性' },
    { key: 'anticipation', name: '悬念' },
    { key: 'easeInOut', name: '三段式' },
    { key: 'slamStop', name: '急停' }
];

/**
 * 策略默认挂载配置
 * 悬念(anticipationDelay)等策略参数经 config 下发，其余策略自动忽略
 */
export const STRATEGY_DEFAULT_CONFIG = {
    anticipationDelay: 600
};

/**
 * 策略名 → ScrollStrategyType 枚举映射（未知名回退 backOut）
 */
export function parseStrategyType(typeStr: string): ScrollStrategyType {
    const map: Record<string, ScrollStrategyType> = {
        'linear': ScrollStrategyType.LINEAR,
        'backOut': ScrollStrategyType.BACK_OUT,
        'bounce': ScrollStrategyType.BOUNCE,
        'elastic': ScrollStrategyType.ELASTIC,
        'anticipation': ScrollStrategyType.ANTICIPATION,
        'easeInOut': ScrollStrategyType.EASE_IN_OUT,
        'slamStop': ScrollStrategyType.SLAM_STOP
    };
    return map[typeStr] || ScrollStrategyType.BACK_OUT;
}

/** 策略描述表（供控制面板展示当前策略说明） */
export const STRATEGY_DESCRIPTIONS: Record<string, { name: string; desc: string }> = {
    linear: { name: '匀速线性', desc: '恒定速度滚动到目标位置，最基础的效果。' },
    backOut: { name: '过冲回弹', desc: '到达目标后轻微过冲再回弹，行业经典效果。' },
    bounce: { name: '弹跳停止', desc: '到位后像球落地一样弹跳2-3次才停止。' },
    elastic: { name: '弹性振荡', desc: '到位后像弹簧一样弹性振荡多次衰减。' },
    anticipation: { name: '悬念停止', desc: '快滚→暂停→慢落，营造紧张揭晓感。' },
    easeInOut: { name: '三段式缓动', desc: '加速→匀速→减速，行业标杆效果。' },
    slamStop: { name: '急停震动', desc: '快速到位+震动反馈，适合Turbo模式。' }
};
