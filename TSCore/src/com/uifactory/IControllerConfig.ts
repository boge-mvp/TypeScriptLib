/**
 * 控制器关联动作配置协议
 */
export interface IControllerActionConfig {
    /** 动作类型，目前原生支持切页播放过渡动效 */
    type: "playTransition";
    /** 需要触发播放的过渡动效名称 */
    transitionName: string;
    /** 播放次数，默认 1 次，-1 表示无限循环 */
    playTimes?: number;
    /** 延迟触发时间（秒），默认 0 */
    delay?: number;
    /** 离开页面时是否自动停止动画 */
    stopOnExit?: boolean;
    /** 触发来源页面名称列表（若不声明则任何来源页面均可触发） */
    fromPage?: string[];
    /** 触发目标页面名称列表（若不声明则切换到任意目标页面均触发） */
    toPage?: string[];
}

/**
 * 页面/组件控制器配置协议
 */
export interface IControllerConfig {
    /** 控制器名称，如 "button", "tab", "c1", "mode" 等 */
    name: string;
    /** 页面名称列表，例如 ["up", "down", "over", "selectedOver"] 或 ["page0", "page1"] */
    pages?: string[];
    /** 默认选中的页面索引，默认为 0 */
    selectedIndex?: number;
    /** 默认选中的页面名称（如果设置，优先级高于 selectedIndex） */
    selectedPage?: string;
    /** 是否自动调整单选组件层级深度 */
    autoRadioGroupDepth?: boolean;
    /** 控制器切页触发动作列表 */
    actions?: IControllerActionConfig[];
    /** 状态切换监听回调 */
    onChanged?: (controller: fgui.Controller) => void;
}
