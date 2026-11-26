/**
 * Flexbox 流式排版累计状态上下文
 */
export interface IFlowLayoutState {
    accumulatedX: number;
    accumulatedY: number;
    perGapSpaceX?: number;
    perGapSpaceY?: number;
    lastNode: Nullable<fgui.GObject>;
    currentRowMaxHeight: number;
    index: number;
}
