import ELabel = tsCore.ELabel;

/**
 * Slot 渲染状态
 */
export enum SlotItemType {
    NORMAL,
    DARK,
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

    /** 还原最原始状态 */
    resetUI() {
        this.state = SlotItemType.NORMAL
    }

    /** 显示中奖 */
    showWin() {
        this.state = SlotItemType.WIN
    }

    /** 变暗 */
    dark() {
        this.state = SlotItemType.DARK
    }

    /**
     * 刷新界面
     */
    refresh() {
    }

    /**
     * 变暗取消
     * @deprecated
     */
    darkCancel() {
        this.state = SlotItemType.NORMAL
    }

}