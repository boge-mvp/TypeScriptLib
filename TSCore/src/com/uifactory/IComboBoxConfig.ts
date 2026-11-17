import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";

/**
 * 原生下拉菜单/下拉选框配置 (fgui.GComboBox)
 *
 * 核心特性：
 * 包含弹出列表 (dropdown)、文本标题 (title)、图标 (icon) 及选项数据绑定；
 * 支持绑定 selectionController 属性控制器，选项切换时双向同步控制器状态。
 */
export interface IComboBoxConfig extends IBaseElementConfig, IViewConfig {
    /** 元素类型：固定为 "combobox" */
    type: "combobox";
    /** 文本显示列表 */
    items?: string[];
    /** 对应的数据值列表 */
    values?: string[];
    /** 对应的图标资源列表 */
    icons?: string[];
    /** 当前选中的项索引 (默认为 0) */
    selectedIndex?: number;
    /** 当前选中的数据值 */
    value?: string;
    /** 弹出下拉菜单的最大可视子项数量 */
    visibleItemCount?: number;
    /** 弹出方向 (0 - Auto, 1 - Up, 2 - Down) */
    popupDirection?: number | "Auto" | "Up" | "Down";
    /** 双向绑定的选择状态控制器 (名称或实例) */
    selectionController?: string | fgui.Controller;
    /** 标题文本颜色 */
    titleColor?: string;
    /** 标题文本字号 */
    titleFontSize?: number;
}
