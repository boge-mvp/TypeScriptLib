import ELabel = tsCore.ELabel;

/**
 * Slot 渲染状态
 */
export enum SlotItemType {
    NORMAL,
    /**
     * 变暗
     */
    DARK,
    /**
     * 获胜
     */
    WIN
}

/**
 * slot 单独项
 */
export class BaseSlotItem extends ELabel {

    /**
     * 当前项状态
     * @default SlotItemType.NORMAL
     * @protected
     */
    protected state = SlotItemType.NORMAL

    /**
     * 还原最原始状态
     * ```
     * this.state = SlotItemType.NORMAL
     * ```
     */
    resetUI() {
        this.state = SlotItemType.NORMAL
    }

    /**
     * 显示中奖
     * ```
     * this.state = SlotItemType.WIN
     * ```
     */
    showWin() {
        this.state = SlotItemType.WIN
    }

    /**
     * 变暗
     * ```
     * this.state = SlotItemType.DARK
     * ```
     */
    dark() {
        this.state = SlotItemType.DARK
    }

    /**
     * 刷新界面
     *
     * 一般用于根据当前的state更新当前的元素渲染模式
     */
    refresh() {
    }

    /**
     * 变暗取消
     * ```
     * this.state = SlotItemType.NORMAL
     * ```
     * @deprecated
     */
    darkCancel() {
        this.state = SlotItemType.NORMAL
    }

    /**
     * 播放跌落动画
     */
    playLandingAni() {

    }
}