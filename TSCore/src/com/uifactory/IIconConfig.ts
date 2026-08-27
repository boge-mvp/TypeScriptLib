import {IBaseElementConfig} from "./IBaseElementConfig";

/**
 * 图片/装载器元素配置
 */
export type IIconConfig = IBaseElementConfig & {
    /** 元素类型：固定为 "icon" */
    type: "icon";
    /** 图片资源路径 (格式如: "ui://common/my-image" 或 "res/xxx.png") */
    url: string;
    /** FGUI 九宫格切边拉伸数据，格式为: "left,top,right,bottom" (如 "30,30,30,30") */
    sizeGrid?: string;
    /** 是否对超出 width / height 范围的图像进行 scrollRect 物理裁剪 */
    clip?: boolean;
    /** 图片填充模式：none/scale/scalefree/scalematchheight/scalematchwidth/scalenoborder 或数字 */
    fill?: string | number;
};
