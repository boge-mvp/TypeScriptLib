import { IBaseElementConfig } from "./IBaseElementConfig";

/**
 * 原生轻量图片配置 (fgui.GImage)
 */
export interface IImageConfig extends IBaseElementConfig {
    /** 元素类型：固定为 "image" */
    type: "image";
    /** 图片资源 URL */
    url?: string;
    /** 颜色滤镜值 */
    color?: string;
    /** 翻转模式 (0-None, 1-Horizontal, 2-Vertical, 3-Both) */
    flip?: number;
    /** 填充模式 (0-None, 1-Horizontal, 2-Vertical, 3-Radial90, 4-Radial180, 5-Radial360) */
    fillMethod?: number;
    /** 填充起点 (0-Top, 1-Bottom, 2-Left, 3-Right) */
    fillOrigin?: number;
    /** 环形填充时是否顺时针方向 */
    fillClockwise?: boolean;
    /** 当前填充进度比例 (0 ~ 1) */
    fillAmount?: number;
}
