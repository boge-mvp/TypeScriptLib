import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";

/**
 * 原生独立滚动条组件配置 (fgui.GScrollBar)
 *
 * 核心部件：
 * - grip: 滚动拖拽手柄
 * - bar: 滚动条滑动轨道
 * - arrow1: (可选) 上/左方向翻页按钮
 * - arrow2: (可选) 下/右方向翻页按钮
 */
export interface IScrollBarConfig extends IBaseElementConfig, IViewConfig {
    /** 元素类型：固定为 "scrollbar" */
    type: "scrollbar";
    /** 是否固定手柄长度 (默认为 false，随内容比例动态伸缩) */
    fixedGripSize?: boolean;
    /** 关联的目标滚动容器名称 (同级容器名，自动绑定其 scrollPane) */
    target?: string;
    /** 是否为纵向滚动条 (默认为 true) */
    vertical?: boolean;
}
