import {IGraphicsCmdConfig} from "./IGraphicsCmdConfig";
import {ILayoutConfig} from "./ILayoutConfig";

/**
 * Gear 补间缓动通用配置
 */
export interface IGearTweenConfig {
    /** 切页时是否执行平滑补间动画，默认为 false */
    tween?: boolean;
    /** 缓动持续时间（秒），默认为 0.3 */
    duration?: number;
    /** 缓动方程类型（对应 FGUI EaseType 数字枚举，如 4: QuadOut） */
    easeType?: number;
    /** 延迟触发时间（秒），默认为 0 */
    delay?: number;
}

/**
 * 位置随控制器页面联动配置 (GearXY)
 */
export interface IGearXYConfig extends IGearTweenConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的坐标配置，键为页面名称，值为坐标对象 */
    pages: Record<string, { x: number; y: number; px?: number; py?: number }>;
}

/**
 * 尺寸与缩放随控制器页面联动配置 (GearSize)
 */
export interface IGearSizeConfig extends IGearTweenConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的宽高与缩放配置，键为页面名称 */
    pages: Record<string, { width?: number; height?: number; scaleX?: number; scaleY?: number; scale?: number }>;
}

/**
 * 透明度、旋转与可交互性随控制器页面联动配置 (GearLook)
 */
export interface IGearLookConfig extends IGearTweenConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的视觉属性配置，键为页面名称 */
    pages: Record<string, { alpha?: number; rotation?: number; grayed?: boolean; touchable?: boolean }>;
}

/**
 * 文本或边框颜色随控制器页面联动配置 (GearColor)
 */
export interface IGearColorConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的颜色配置，键为页面名称 */
    pages: Record<string, { color?: string; strokeColor?: string }>;
    /** 是否开启颜色平滑过渡动画 (默认 false) */
    tween?: boolean;
    /** 动画过渡时长 (秒，默认 0.3) */
    duration?: number;
    /** 缓动算法类型 (参考 fgui.EaseType) */
    easeType?: number;
}

    /** 文本內容随控制器页面联动配置 (GearText) */
    export interface IGearTextConfig {
        /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
        controller?: string;
        /** 各页面对应的文本内容，键为页面名称 */
        pages: Record<string, string | { text?: string }>;
    }

    /**
     * 图标/图片地址随控制器页面联动配置 (GearIcon)
     */
    export interface IGearIconConfig {
        /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
        controller?: string;
        /** 各页面对应的图标 URL 地址，键为页面名称 */
        pages: Record<string, string | { icon?: string; url?: string }>;
    }

/**
 * 动画组件播放状态随控制器页面联动配置 (GearAnimation)
 */
export interface IGearAnimationConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的动画状态，键为页面名称 */
    pages: Record<string, { playing?: boolean; frame?: number }>;
}

/**
 * 复合多条件显隐随控制器联动配置 (GearDisplay2)
 */
export interface IGearDisplay2Config {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 在控制器的哪些页面下显示 */
    pages: string[];
    /** 判定条件：0 表示 AND（必须同时满足），1 表示 OR（满足其一即可显示） */
    condition?: 0 | 1;
}

/**
 * 字体大小随控制器页面联动配置 (GearFontSize)
 */
export interface IGearFontSizeConfig {
    /** 绑定的控制器名称，缺省时自动匹配父容器中的首个可用控制器 */
    controller?: string;
    /** 各页面对应的字号大小（像素），键为页面名称 */
    pages: Record<string, number>;
}

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
    /** 是否可见 */
    visible?: boolean;
    /** 是否可交互 */
    touchable?: boolean;
    /** 是否置灰 */
    grayed?: boolean;
    /** 弹性对齐与自适应百分比排版对齐定位 (优先于绝对定位属性 x/y) */
    layout?: ILayoutConfig;
    /** 绝对定位像素 X 坐标 (一旦配置该项，将忽略 layout 排版对齐) */
    x?: number;
    /** 绝对定位像素 Y 坐标 (一旦配置该项，将忽略 layout 排版对齐) */
    y?: number;
    /** 定位模式: "absolute" 表示脱离父容器流式布局，不受 alignItems/justifyContent 影响 */
    position?: "absolute";
    /** 控制器页面显隐状态绑定（GearDisplay：指定在控制器的哪些页面下保持可见） */
    gearDisplay?: {
        /** 绑定的控制器名称，缺省时自动匹配父容器名为 "button" 的控制器或首个可用控制器 */
        controller?: string;
        /** 在控制器的哪些页面下显示（页面名称列表，如 ["up", "down"]） */
        pages: string[];
    };
    /** 位置随控制器联动 (GearXY) */
    gearXY?: IGearXYConfig;
    /** 尺寸与缩放随控制器联动 (GearSize) */
    gearSize?: IGearSizeConfig;
    /** 视觉外观（透明/旋转/置灰）随控制器联动 (GearLook) */
    gearLook?: IGearLookConfig;
    /** 颜色随控制器联动 (GearColor) */
    gearColor?: IGearColorConfig;
    /** 文本随控制器联动 (GearText) */
    gearText?: IGearTextConfig;
    /** 图标随控制器联动 (GearIcon) */
    gearIcon?: IGearIconConfig;
    /** 动画状态随控制器联动 (GearAnimation) */
    gearAnimation?: IGearAnimationConfig;
    /** 复合条件显隐随控制器联动 (GearDisplay2) */
    gearDisplay2?: IGearDisplay2Config;
    /** 字体大小随控制器联动 (GearFontSize) */
    gearFontSize?: IGearFontSizeConfig;
    /** 所属的 GGroup 组名称，在同一直接父容器内自动归属于对应 GGroup 元件 */
    group?: string;
    /**
     * FGUI 原生关联系统配置 (Relations)
     * 支持将自身与容器、父级或同级兄弟组件建立自动联动 (如左左、左右、右右、顶顶、高宽拉伸等)
     */
    relations?: {
        /** 目标组件名称；若不填或为 "parent" 则关联到当前直接父容器 */
        target?: string;
        /** 关联规则类型 (如 "Right_Right", "Left_Right", "Size", "Width", "Height", "Center_Center", "Bottom_Bottom") 或数字枚举 */
        type: string | number;
        /** 是否使用百分比距离 (默认 false) */
        usePercent?: boolean;
    }[];
};
