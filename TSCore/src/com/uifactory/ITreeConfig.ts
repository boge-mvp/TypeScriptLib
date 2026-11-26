import { IListConfig } from "./IListConfig";

/**
 * 声明式树节点数据配置 (用于 GTree 初始化构建)
 */
export interface ITreeNodeConfig {
    /** 节点显示文本 */
    text?: string;
    /** 节点图标资源路径 */
    icon?: string;
    /** 节点自定义业务数据 */
    data?: any;
    /** 是否为文件夹节点 (不传时若存在 children 则自动视为 true) */
    isFolder?: boolean;
    /** 初始是否展开 (默认 false) */
    expanded?: boolean;
    /** 自定义节点模板路径 */
    resURL?: string;
    /** 子节点列表 */
    children?: ITreeNodeConfig[];
}

/**
 * 原生树形组件配置 (fgui.GTree)
 *
 * 继承自 fgui.GList，支持多层级 GTreeNode 树结构递归展开与折叠。
 */
export interface ITreeConfig extends Omit<IListConfig, "type"> {
    /** 元素类型：固定为 "tree" */
    type: "tree";
    /** 树节点默认模板路径 (如 "res/layout/treeItem.json") */
    defaultItem?: string;
    /** 行间距像素 */
    lineGap?: number;
    /** 列表选择模式 */
    selectionMode?: fgui.ListSelectionMode | "Single" | "Multiple" | "Multiple_SingleClick" | "None";
    /** 每级缩进像素 (默认为 15) */
    indent?: number;
    /** 点击展开折叠模式 (0 - 无, 1 - 单击, 2 - 双击) */
    clickToExpand?: number;
    /** 声明式树节点数据 */
    nodes?: ITreeNodeConfig[];
    /** 树节点渲染处理器 (node: GTreeNode, obj: GComponent) => void */
    treeNodeRender?: Laya.Handler;
    /** 树节点展开监听处理器 (node: GTreeNode, expanded: boolean) => void */
    treeNodeWillExpand?: Laya.Handler;
}
