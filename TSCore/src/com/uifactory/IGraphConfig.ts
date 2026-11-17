import {IBaseElementConfig} from "./IBaseElementConfig";

/**
 * 矢量图形绘制元素配置
 */
export type IGraphConfig = IBaseElementConfig & {
    /** 元素类型：固定为 "graph" */
    type: "graph";
    /** 图形类型：0-无, 1-矩形/圆角矩形, 2-圆/椭圆, 3-多边形, 4-正多边形 (对应 FGUI 原生 GGraph) */
    shape?: "rect" | "ellipse" | "circle";
    /** 描边线宽度 */
    lineSize?: number;
    /** 描边线条颜色值 */
    lineColor?: string;
    /** 填充颜色值 */
    fillColor?: string;
    /** 圆角半径：单一数值(4角相同) 或 4 个圆角组成的数组 [左上,右上,右下,左下] */
    cornerRadius?: number | number[];
};
