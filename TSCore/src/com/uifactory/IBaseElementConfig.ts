import {IGraphicsCmdConfig} from "./IGraphicsCmdConfig";
import {ILayoutConfig} from "./ILayoutConfig";

/**
 * 界面所有可视化元组件的通用基础物理排版尺寸与定位配置（基类）
 */
export type IBaseElementConfig = {
    /** 矢量绘图命令配置组，可针对任意节点或背景绘制任意复杂的 Laya 矢量图 */
    graphics?: IGraphicsCmdConfig[];
    /** 组件在 UI 层级中的唯一命名标识符 (用于底层代码逻辑通过 getChild 获取寻址) */
    name?: string;
    /** 物理包裹或固定的像素宽度 (不配或配 0 则高度自适应或自动撑开) */
    width?: number;
    /** 物理包裹或固定的像素高度 (不配或配 0 则高度自适应或自动撑开) */
    height?: number;
    /** 整体物理缩放系数 (等同于同时对 scaleX/scaleY 设置相同的值) */
    scale?: number;
    /** 水平缩放系数 */
    scaleX?: number;
    /** 垂直缩放系数 */
    scaleY?: number;
    /** 锚点 X 坐标百分比 (0 ~ 1，决定旋转与位移的基准点) */
    pivotX?: number;
    /** 锚点 Y 坐标百分比 (0 ~ 1，决定旋转与位移的基准点) */
    pivotY?: number;
    /**
     * 是否将轴心点(pivotX, pivotY)作为定位的锚点 (Anchor)
     * - `false`（默认/缺省）：组件的定位坐标 `x, y` 仍然是代表其左上角 (Top-Left) 位置。
     * - `true`：组件的定位坐标 `x, y` 对应的将是其轴心点在父容器中的物理像素位置。
     */
    asAnchor?: boolean;
    /** 整体不透明度 (0 ~ 1) */
    alpha?: number;
    /** 旋转角度 (0 ~ 360 度) */
    rotation?: number;
    /** 弹性对齐与自适应百分比排版对齐定位 (优先于绝对定位属性 x/y) */
    layout?: ILayoutConfig;
    /** 绝对定位像素 X 坐标 (一旦配置该项，将忽略 layout 排版对齐) */
    x?: number;
    /** 绝对定位像素 Y 坐标 (一旦配置该项，将忽略 layout 排版对齐) */
    y?: number;
    /** 定位模式: "absolute" 表示脱离父容器流式布局，不受 alignItems/justifyContent 影响 */
    position?: "absolute";
};
