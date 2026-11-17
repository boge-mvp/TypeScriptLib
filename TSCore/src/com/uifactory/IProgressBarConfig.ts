import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 原生 GProgressBar 进度条组件配置定义
 * 完全遵循 FGUI 官方 GProgressBar 规范：
 * 内部部件：
 *   - bar: 进度指示条 (必须命名为 bar)
 *   - title: (可选) 数值或百分比文本标签 (命名为 title)
 *   - ani: (可选) 动画帧指示元件
 */
export interface IProgressBarConfig extends IBaseElementConfig, IViewConfig {
    type: "progressbar";
    /** 当前值 (默认为 50) */
    value?: number;
    /** 最小值 (默认为 0) */
    min?: number;
    /** 最大值 (默认为 100) */
    max?: number;
    /** 标签显示模式 (0 - Percent, 1 - ValueAndMax, 2 - Value, 3 - Max) */
    titleType?: number;
    /** 是否反向填充 */
    reverse?: boolean;
}
