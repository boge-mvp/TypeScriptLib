import { IBaseElementConfig } from "./IBaseElementConfig";

/**
 * 原生 3D / Spine 骨骼模型加载器配置 (fgui.GLoader3D)
 */
export interface ILoader3DConfig extends IBaseElementConfig {
    /** 元素类型：固定为 "loader3d" */
    type: "loader3d";
    /** 3D 资源路径或骨骼动画路径 */
    url?: string;
    /** 初始播放的动画名称 */
    animationName?: string;
    /** 皮肤名称 */
    skinName?: string;
    /** 初始是否播放 */
    playing?: boolean;
    /** 是否循环播放 */
    loop?: boolean;
    /** 当前帧序号 */
    frame?: number;
    /** 水平对齐方式 */
    align?: "left" | "center" | "right";
    /** 垂直对齐方式 */
    valign?: "top" | "middle" | "bottom";
    /** 颜色滤镜值 */
    color?: string;
}
