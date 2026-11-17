import { IListConfig } from "./IListConfig";

/**
 * 原生树形组件配置 (fgui.GTree)
 *
 * 继承自 fgui.GList，支持多层级 GTreeNode 树结构递归展开与折叠。
 */
export interface ITreeConfig extends Omit<IListConfig, "type"> {
    /** 元素类型：固定为 "tree" */
    type: "tree";
    /** 每级缩进像素 (默认为 15) */
    indent?: number;
    /** 点击展开折叠模式 (0 - 无, 1 - 单击, 2 - 双击) */
    clickToExpand?: number;
    /** 树节点渲染处理器 (node: GTreeNode, obj: GComponent) => void */
    treeNodeRender?: Laya.Handler;
    /** 树节点展开监听处理器 (node: GTreeNode, expanded: boolean) => void */
    treeNodeWillExpand?: Laya.Handler;
}
