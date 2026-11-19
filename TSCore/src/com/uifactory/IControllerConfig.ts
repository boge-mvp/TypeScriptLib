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
 * 控制器单页面完整定义（对齐官方物理 ID 与业务别名成对模型）
 */
export interface IControllerPageDef {
    /** 页面物理 ID（如 "c0", "_1", "p1"），缺省时自动自增生成 */
    id?: string;
    /** 页面业务别名（如 "up", "normal", "grayed"） */
    name: string;
}

/**
 * 页面/组件控制器配置协议
 */
export interface IControllerConfig {
    /** 控制器名称，如 "button", "tab", "c1", "mode" 等 */
    name: string;
    /** 页面名称列表（简单模式），例如 ["up", "down", "over", "selectedOver"] 或 ["page0", "page1"] */
    pages?: string[];
    /** 页面物理 ID 列表（与 pages 索引一一对应） */
    pageIds?: string[];
    /** 页面完整结构定义列表（复合模式，包含 id 与 name） */
    pageDefs?: IControllerPageDef[];
    /** 默认选中的页面索引，默认为 0 */
    selectedIndex?: number;
    /** 默认选中的页面名称（如果设置，优先级高于 selectedIndex） */
    selectedPage?: string;
    /** 默认选中的页面物理 ID */
    selectedPageId?: string;
    /** 是否自动调整单选组件层级深度 */
    autoRadioGroupDepth?: boolean;
    /** 控制器切页触发动作列表 */
    actions?: IControllerActionConfig[];
    /** 状态切换监听回调 */
    onChanged?: (controller: fgui.Controller) => void;
}
