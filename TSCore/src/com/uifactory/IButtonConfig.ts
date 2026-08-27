import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 按钮元素配置
 */
export type IButtonConfig = IBaseElementConfig & IViewConfig & {
    /** 元素类型：固定为 "button" */
    type: "button";
    /** 按钮组件皮肤 (FGUI Package 资源路径) */
    skin?: string;
};
