import { IBaseElementConfig } from "./IBaseElementConfig";

/**
 * 组容器组件配置 (fgui.GGroup)
 *
 * 核心特性：
 * 1. 逻辑与排版分组：将多个子元件归属到同一个逻辑组中，通过组进行整体显隐、移动或透明度控制；
 * 2. 自动包围盒与排除隐藏：支持 excludeInvisibles（自动剔除隐藏元件计算组包围盒）与 autoSizeDisabled。
 */
export interface IGroupConfig extends IBaseElementConfig {
    /** 元素类型：固定为 "group" */
    type: "group";
    /** 组内子项流动布局方式 (0 - None, 1 - Horizontal, 2 - Vertical) */
    groupLayout?: number | "None" | "Horizontal" | "Vertical";
    /** 行间距 */
    lineGap?: number;
    /** 列间距 */
    columnGap?: number;
    /** 计算组包围盒时是否自动排除不可见元件 (默认为 false) */
    excludeInvisibles?: boolean;
    /** 是否禁用自动调整组尺寸 (默认为 false) */
    autoSizeDisabled?: boolean;
    /** 主格索引 (布局使用) */
    mainGridIndex?: number;
    /** 主格最小尺寸 (布局使用) */
    mainGridMinSize?: number;
}
