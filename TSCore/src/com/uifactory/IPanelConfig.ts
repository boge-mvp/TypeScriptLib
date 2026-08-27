import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 面板容器组件配置 (支持递归嵌套 elements 形成独立层级)
 */
export type IPanelConfig = IBaseElementConfig & IViewConfig & {
    /** 元素类型：固定为 "panel" */
    type: "panel";
};
