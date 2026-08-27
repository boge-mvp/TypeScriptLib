import {IElementConfig} from "./IElementConfig";
import {IGraphConfig} from "./IGraphConfig";
import {IIconConfig} from "./IIconConfig";
import {IPaddingConfig} from "./IPaddingConfig";

/**
 * 容器视图通用配置（背景、子级、滚动、流式布局）
 */
export type IViewConfig = {
    /** 面板背景：可以是纯图片 URL、也可以是嵌套的 icon/graph 元素配置 */
    background?: string | IIconConfig | IGraphConfig;
    /** 面板内部嵌套的一维层级 Elements 子级元件列表 */
    elements?: IElementConfig[];
    /** 面板的安全内边距，主要在滚动时使用 */
    padding?: IPaddingConfig;
    /** 面板内容的滚动方式 (0 - 横向, 1 - 纵向, 2 - 双向) */
    scrollType?: number;
    /** 容器溢出裁剪状态 (0 - Visible, 1 - Hidden, 2 - Scroll) */
    overflow?: number;
    /**
     * 面板子级元件的定位排版方式：
     *  - "none": 传统绝对定位，子元件按各自 x/y 坐标独立排布 (默认)
     *  - "vertical": 纵向流式自动向下累加排布，忽略子级写死的绝对 Y 坐标
     *  - "horizontal": 横向流式自动向右累加排布，忽略子级写死的绝对 X 坐标
     */
    layoutType?: "none" | "vertical" | "horizontal";
    /** 子代一维流动布局排版时的子元件固定像素间距 */
    gap?: number;
    /** 是否在 layoutType 为 "horizontal" 时启用弹性自适应折行 (Flex Wrap) */
    flexWrap?: boolean;
    /**
     * 父容器对交叉轴子元件对齐的统一约束 (Align Items)
     * "stretch" 暂未实现完全物理拉伸，先按 flex-start 对齐表现
     */
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
    /** 父容器对主轴方向上所有子元件排列对齐的统一约束 (Justify Content) */
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
};
