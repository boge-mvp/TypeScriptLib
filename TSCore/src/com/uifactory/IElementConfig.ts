import {IButtonConfig} from "./IButtonConfig";
import {IGraphConfig} from "./IGraphConfig";
import {IIconConfig} from "./IIconConfig";
import {IListConfig} from "./IListConfig";
import {IPanelConfig} from "./IPanelConfig";
import {ITextConfig} from "./ITextConfig";
import {ISliderConfig} from "./ISliderConfig";
import {IProgressBarConfig} from "./IProgressBarConfig";

/**
 * 各种流式页面渲染元素配置联合类型
 */
export type IElementConfig =
    | ITextConfig
    | IIconConfig
    | IGraphConfig
    | IPanelConfig
    | IListConfig
    | IButtonConfig
    | ISliderConfig
    | IProgressBarConfig;
