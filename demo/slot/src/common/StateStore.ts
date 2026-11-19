import {SlotUiState} from "../common/SlotTestTypes";

/**
 * Slot 测试应用 UI 状态持久化（localStorage）
 *
 * 记录用户切换的功能项：Tab/滚动模式/策略/方向/Turbo/出结果延迟/中奖线配置。
 * 刷新页面后经 load() 恢复，避免每次都回到默认值。
 */
export class StateStore {

    private static readonly KEY = 'slotTest.uiState';

    /** 读取存档（无存档/损坏/环境不可用时返回 null） */
    static load(): SlotUiState | null {
        try {
            const raw = Laya.LocalStorage.getItem(StateStore.KEY);
            if (!raw) return null;
            return JSON.parse(raw) as SlotUiState;
        } catch {
            return null;
        }
    }

    /** 保存当前状态快照 */
    static save(state: SlotUiState): void {
        try {
            Laya.LocalStorage.setItem(StateStore.KEY, JSON.stringify(state));
        } catch {
            // 隐私模式/存储不可用时静默忽略
        }
    }

    /** 清除存档 */
    static clear(): void {
        try {
            Laya.LocalStorage.removeItem(StateStore.KEY);
        } catch {
            // 忽略
        }
    }
}
