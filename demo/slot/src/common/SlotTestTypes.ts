/**
 * Slot 测试应用共享类型
 */

/** 滚动驱动模式：strategy=匀速+策略；native=匀速+原生直线；tween=纯Tween回弹；tweenStrategy=纯Tween+策略 */
export type ScrollViewMode = 'strategy' | 'native' | 'tween' | 'tweenStrategy';

/** 本局单条中奖判定结果 */
export interface WinResult {
    lineId: number;
    symbol: number;
    count: number;
}

/** UI 状态快照结构（localStorage 持久化） */
export interface SlotUiState {
    /** 当前激活 Tab */
    tab: 'strategy' | 'native';
    mode: ScrollViewMode;
    strategy: string;
    direction: string;
    turbo: boolean;
    delay: number;
    /** 每个 Tab 记忆的滚动模式 */
    tabModes: {strategy: ScrollViewMode; native: ScrollViewMode};
    /** 中奖线配置快照 */
    paylines: {lineId: number; symbol: number; count: number; enabled: boolean}[];
}
