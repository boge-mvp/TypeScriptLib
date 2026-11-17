import { IButtonConfig } from "./IButtonConfig";
import { IGraphConfig } from "./IGraphConfig";
import { IIconConfig } from "./IIconConfig";
import { IListConfig } from "./IListConfig";
import { IPanelConfig } from "./IPanelConfig";
import { ITextConfig } from "./ITextConfig";
import { ISliderConfig } from "./ISliderConfig";
import { IProgressBarConfig } from "./IProgressBarConfig";
import { IGroupConfig } from "./IGroupConfig";
import { ILabelConfig } from "./ILabelConfig";
import { IComboBoxConfig } from "./IComboBoxConfig";
import { IScrollBarConfig } from "./IScrollBarConfig";
import { ITreeConfig } from "./ITreeConfig";
import { IMovieClipConfig } from "./IMovieClipConfig";
import { ILoader3DConfig } from "./ILoader3DConfig";
import { IImageConfig } from "./IImageConfig";

/**
 * 页面所有组件配置的多态联合类型 (对齐官方 19 大原生组件体系)
 */
export type IElementConfig =
    | ITextConfig
    | IIconConfig
    | IGraphConfig
    | IPanelConfig
    | IListConfig
    | IButtonConfig
    | ISliderConfig
    | IProgressBarConfig
    | IGroupConfig
    | ILabelConfig
    | IComboBoxConfig
    | IScrollBarConfig
    | ITreeConfig
    | IMovieClipConfig
    | ILoader3DConfig
    | IImageConfig;
