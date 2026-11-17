import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";

/**
 * 原生标签组件配置 (fgui.GLabel)
 *
 * 核心特性：
 * 官方标准复合组件，内部自动映射 titleObject 与 iconObject，
 * 具备自动文本内容更新与齿轮绑定能力。
 */
export interface ILabelConfig extends IBaseElementConfig, IViewConfig {
    /** 元素类型：固定为 "label" */
    type: "label";
    /** 标签标题文本 (映射至内部 "title" 组件) */
    title?: string;
    /** 标签图标路径 (映射至内部 "icon" 组件) */
    icon?: string;
    /** 标题文本颜色 */
    titleColor?: string;
    /** 标题文本字号 */
    titleFontSize?: number;
    /** 整体颜色 */
    color?: string;
    /** 文本是否可编辑 */
    editable?: boolean;
}
