import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";

/**
 * 按钮元素配置
 * 对齐 FGUI 原生 constructExtension 与 setup_afterAdd 属性定义
 */
export type IButtonConfig = IBaseElementConfig & IViewConfig & {
    /** 元素类型：固定为 "button" */
    type: "button";
    /** 按钮组件皮肤 (FGUI Package 资源路径) */
    skin?: string;
    /** 按钮模式：0: Common(普通按钮), 1: Check(多选/开关), 2: Radio(单选按钮) */
    mode?: number;
    /** 按下效果：0: None(无效果), 1: Darken(变暗), 2: Scale(居中缩放) */
    downEffect?: number;
    /** 按下效果强度数值：当 downEffect=1(变暗) 时表示 RGB 缩放比例(默认 0.8)；当 downEffect=2(缩放) 时表示尺寸缩放比例(默认 0.95) */
    downEffectValue?: number;
    /** 按钮音效资源路径 (例如 "res/sound/click.mp3") */
    sound?: string;
    /** 按钮音效音量缩放 (默认 1.0) */
    soundVolumeScale?: number;
    /** 默认标题文本 (映射至子级 "title" 文本组件) */
    title?: string;
    /** 默认图标路径 (映射至子级 "icon" 图标组件) */
    icon?: string;
    /** 选中态标题文本 (Check/Radio 模式) */
    selectedTitle?: string;
    /** 选中态图标路径 (Check/Radio 模式) */
    selectedIcon?: string;
    /** 初始是否选中 (Check/Radio 模式) */
    selected?: boolean;
    /** 联动单选控制器 (Radio 模式) */
    relatedController?: fgui.Controller;
    /** 关联控制器页面 ID (Radio 模式) */
    pageId?: string;
};
