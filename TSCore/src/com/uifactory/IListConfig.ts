import {IBaseElementConfig} from "./IBaseElementConfig";
import {IPanelConfig} from "./IPanelConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 动态网格/滚动列表配置
 */
export type IListConfig = IBaseElementConfig & IViewConfig & {
    /** 元素类型：固定为 "list" */
    type: "list";
    /** 列表项排列布局 */
    listLayout?: "SingleColumn" | "SingleRow" | "FlowHorizontal" | "FlowVertical" | "Pagination";
    /** 行间距 */
    lineGap?: number;
    /** 列间距 */
    columnGap?: number;
    /** 强制规定子项渲染所占的格子物理宽度 */
    itemWidth?: number;
    /** 强制规定子项渲染所占的格子物理高度 */
    itemHeight?: number;
    /** 列表整体在水平方向的对齐方式 */
    align?: "left" | "center" | "right";
    /** 列表整体在垂直方向的对齐方式 */
    verticalAlign?: "top" | "middle" | "bottom";
    /** 列表静态填充的数据子项列表 (通过 itemRenderer 递归填充) */
    items?: IPanelConfig[];
    /** 列表项行数，仅在 listLayout 为 Pagination 或 FlowVertical 时有效 */
    lineCount?: number;
    /** 列表项列数，仅在 listLayout 为 FlowHorizontal 或 Pagination 时有效 */
    columnCount?: number;
    /** 是否自动调整子项尺寸以匹配 itemWidth/itemHeight */
    autoResizeItem?: boolean;
};
