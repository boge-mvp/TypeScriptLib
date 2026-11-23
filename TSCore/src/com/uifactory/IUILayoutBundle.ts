import { IElementConfig } from "./IElementConfig";

/**
 * 集中打包的 UI 布局合集包数据规范 (UI Layout Bundle)
 *
 * 核心目标：
 * 彻底消除生产环境中散落多文件的碎片化 HTTP 请求，在构建期将全部独立的页面布局与组件配置收敛为一个紧凑的单一合包；
 * 客户端仅需 1 次网络请求即可将整个游戏的 UI 结构载入内存字典，实现真正的瞬时分发与零延迟上屏。
 */
export interface IUILayoutBundle {
    /** 布局合包规范版本号 */
    version?: string;
    /** 打包生成时间戳 (毫秒) */
    timestamp?: number;
    /**
     * 布局配置数据字典
     * 键为组件名称或路径标识（如 "header"、"res/layout/header.json"），值为完整的声明式组件/面板配置
     */
    layouts: Record<string, IElementConfig>;
}
