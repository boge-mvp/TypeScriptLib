import { IBaseElementConfig } from "./IBaseElementConfig";

/**
 * 原生序列帧动画组件配置 (fgui.GMovieClip)
 */
export interface IMovieClipConfig extends IBaseElementConfig {
    /** 元素类型：固定为 "movieclip" */
    type: "movieclip";
    /** 动画资源 URL 或包内路径 */
    url?: string;
    /** 初始是否处于播放状态 (默认为 true) */
    playing?: boolean;
    /** 初始定格帧序号 (默认为 0) */
    frame?: number;
    /** 播放时间缩放倍率 (默认为 1.0) */
    timeScale?: number;
    /** 颜色滤镜值 */
    color?: string;
}
