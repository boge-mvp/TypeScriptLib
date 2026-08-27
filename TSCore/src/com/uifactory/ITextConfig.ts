import {IBaseElementConfig} from "./IBaseElementConfig";

/**
 * 文本元素配置
 */
export type ITextConfig = IBaseElementConfig & {
    /** 元素类型：固定为 "text" */
    type: "text";
    /** 文本显示具体内容 */
    text?: string;
    /** 字体大小 (默认 20) */
    fontSize?: number;
    /** 字体十六进制颜色值 (如: "#ffffff", "#e99e00") */
    color?: string;
    /** 文本内部字符的水平对齐方式 */
    align?: "left" | "center" | "right";
    /** 文本内部字符的垂直对齐方式 */
    valign?: "top" | "middle" | "bottom";
    /** 行高间距 (默认 4) */
    leading?: number;
    /** 字间距 (默认 0) */
    letterSpacing?: number;
    /** 是否添加下划线 */
    underline?: boolean;
    /** 是否为斜体 */
    italic?: boolean;
    /** 是否加粗 */
    bold?: boolean;
    /** 是否单行文本限制 (超出自动省略/不换行) */
    singleLine?: boolean;
    /** 描边粗细像素 */
    stroke?: number;
    /** 描边颜色值 */
    strokeColor?: string;
    /** 是否启用 UBB 语法富文本解析 (同时会自动将 "\n" 转换为 "<br/>") */
    isUbb?: boolean;
};
