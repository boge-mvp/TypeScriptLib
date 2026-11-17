import GComponent = fgui.GComponent;

/**
 * 纯代码容器面板 (EPanel)
 *
 * 架构定位：
 * 1. 作为 UIFactory 面板配置（IPanelConfig）的载体组件，继承 fgui.GComponent；
 * 2. 具备完整的容器生命周期与能力（滚动视口 ScrollPane、两遍测量弹性布局、子级层级管理、背景动态绘制）；
 * 3. 命名约定：继承自 FGUI 原生类并提供扩展行为的框架级组件统一以 E 前缀命名（对齐 EView、EButton）。
 */
export class EPanel extends GComponent {

}
