import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 原生 GSlider 滑动条组件配置定义
 * 完全遵循 FGUI 官方 GSlider 规范：
 * 内部部件：
 *   - bar: 滑动条轨道底图或进度指示条 (必须命名为 bar)
 *   - grip: 拖拽滑动小手柄 (必须命名为 grip)
 *   - title: (可选) 数值或百分比文本标签 (命名为 title)
 */
export interface ISliderConfig extends IBaseElementConfig, IViewConfig {
    type: "slider";
    /** 当前值 (默认为 50) */
    value?: number;
    /** 最小值 (默认为 0) */
    min?: number;
    /** 最大值 (默认为 100) */
    max?: number;
    /** 是否只允许整数步进 */
    wholeNumbers?: boolean;
    /** 点击轨道时是否自动跳转定位 (默认为 true) */
    changeOnClick?: boolean;
    /** 标签显示模式 (0 - Percent, 1 - ValueAndMax, 2 - Value, 3 - Max) */
    titleType?: number;
    /** 是否反向滑动 */
    reverse?: boolean;
}
