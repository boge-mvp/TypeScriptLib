import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";
import { ISliderConfig } from "./ISliderConfig";
import { IProgressBarConfig } from "./IProgressBarConfig";
import { IButtonConfig } from "./IButtonConfig";
import { ILabelConfig } from "./ILabelConfig";
import { IComboBoxConfig } from "./IComboBoxConfig";
import { IScrollBarConfig } from "./IScrollBarConfig";
import { ITreeNodeConfig } from "./ITreeConfig";
import { IElementConfig } from "./IElementConfig";
import { UIFactory } from "./UIFactory";

/**
 * UIFactory 高级扩展组件装配器
 *
 * 核心使命：
 * 模拟 FairyGUI 二进制反序列化流程中的 `constructExtension` 阶段。
 * 当容器内部的所有子元件全部实例化、对齐并加入显示树后，根据组件真实类型自动完成核心内部元件的映射与交互手势绑定：
 * - GButton: 映射 _titleObject, _iconObject，初始化 _buttonController 与四态监听；
 * - GProgressBar: 映射 _titleObject, _barObject(H/V), _aniObject，计算最大尺寸与起始偏移；
 * - GSlider: 映射 _titleObject, _barObject, _gripObject，并通过关联系统自动建立手柄与进度的动态牵引；
 * - GComboBox / GLabel: 映射 _titleObject 与 _iconObject。
 */
export class UIFactoryExtensions {

    /**
     * 【Phase 4: FGUI 官方扩展组件装配管线 (constructExtension 模拟)】
     *
     * @param panelNode 已完成子节点挂载与初始定位的目标容器 (GButton/GProgressBar/GSlider/GComponent)
     * @param elData 容器及其扩展配置对象
     */
    public static setupComponentExtension(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig & { type?: string }): void {
        // 1. GButton 扩展类装配
        if (panelNode instanceof fgui.GButton || elData.type === "button") {
            const btn = panelNode as fgui.GButton;
            if (!btn["_titleObject"]) {
                const titleChild = btn.getChild("title");
                if (titleChild) btn["_titleObject"] = titleChild;
            }
            if (!btn["_iconObject"]) {
                const iconChild = btn.getChild("icon");
                if (iconChild) btn["_iconObject"] = iconChild;
            }
            // 确保 buttonController 存在并设置初始状态 UP
            if (!btn["_buttonController"]) {
                const bCtrl = btn.getController("button");
                if (bCtrl) btn["_buttonController"] = bCtrl;
            }
            if (btn["_buttonController"] && typeof btn["setState"] === "function") {
                btn["setState"](btn.selected ? fgui.GButton.DOWN : fgui.GButton.UP);
            }

            // 补齐 FGUI 原生事件监听（模拟 constructExtension，确保纯代码 GButton 具备原生交互能力）
            if (!btn["_hasNativeButtonEvents"]) {
                btn["_hasNativeButtonEvents"] = true;
                btn.on(Laya.Event.ROLL_OVER, btn, btn["__rollover"]);
                btn.on(Laya.Event.ROLL_OUT, btn, btn["__rollout"]);
                btn.on(Laya.Event.MOUSE_DOWN, btn, btn["__mousedown"]);
                btn.on(Laya.Event.CLICK, btn, btn["__click"]);
            }

            // 统一回填顶层属性（兼容独立调用 createButton / createFromConfig 且保证 _titleObject/_iconObject 已就绪）
            const bConf = elData as IButtonConfig;
            if (bConf.title !== undefined) btn.title = bConf.title;
            if (bConf.icon !== undefined) btn.icon = UIFactory.formatResUrl(bConf.icon);
            if (bConf.selectedTitle !== undefined) btn.selectedTitle = bConf.selectedTitle;
            if (bConf.selectedIcon !== undefined) btn.selectedIcon = UIFactory.formatResUrl(bConf.selectedIcon);
            if (bConf.titleColor) btn.titleColor = bConf.titleColor;
            if (bConf.titleFontSize) btn.titleFontSize = bConf.titleFontSize;
            if (bConf.selected !== undefined) btn.selected = bConf.selected;
            if (bConf.sound) btn["_sound"] = bConf.sound;
            if (bConf.soundVolumeScale !== undefined) btn["_soundVolumeScale"] = bConf.soundVolumeScale;
        }
        // 2. GProgressBar 与 GSlider 扩展类装配
        else if (panelNode instanceof fgui.GProgressBar || (fgui.GSlider && panelNode instanceof fgui.GSlider)) {
            if (!panelNode["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) panelNode["_titleObject"] = titleChild;
            }
            if (!panelNode["_barObjectH"]) {
                const barChild = panelNode.getChild("bar");
                if (barChild) {
                    panelNode["_barObjectH"] = barChild;
                    panelNode["_barMaxWidth"] = barChild.width;
                    panelNode["_barMaxWidthDelta"] = panelNode.width - panelNode["_barMaxWidth"];
                    panelNode["_barStartX"] = barChild.x;
                }
            }
            if (!panelNode["_barObjectV"]) {
                const barVChild = panelNode.getChild("bar_v");
                if (barVChild) {
                    panelNode["_barObjectV"] = barVChild;
                    panelNode["_barMaxHeight"] = barVChild.height;
                    panelNode["_barMaxHeightDelta"] = panelNode.height - panelNode["_barMaxHeight"];
                    panelNode["_barStartY"] = barVChild.y;
                }
            }
            if (fgui.GSlider && panelNode instanceof fgui.GSlider) {
                const slider = panelNode;
                const sConf = elData as ISliderConfig;

                // 必须先在 bar 处于初始满宽 (_barMaxWidth) 时绑定 grip 的 Right_Right / Bottom_Bottom 关联！
                // 随后再设置 min / max / value 触发 update()，这样 bar 宽度变化时才能通过关联系统将 grip 精确同步到对应位置
                if (!slider["_gripObject"]) {
                    const gripChild = slider.getChild("grip");
                    if (gripChild) {
                        slider["_gripObject"] = gripChild;
                        gripChild.on(Laya.Event.MOUSE_DOWN, slider, slider["__gripMouseDown"]);

                        if (slider["_barObjectH"]) {
                            gripChild.addRelation(slider["_barObjectH"], fgui.RelationType.Right_Right);
                        } else if (slider["_barObjectV"]) {
                            gripChild.addRelation(slider["_barObjectV"], fgui.RelationType.Bottom_Bottom);
                        }
                    }
                }
                slider.displayObject.on(Laya.Event.MOUSE_DOWN, slider, slider["__barMouseDown"]);

                if (sConf.titleType !== undefined) slider["_titleType"] = sConf.titleType;
                if (sConf.wholeNumbers !== undefined) slider["_wholeNumbers"] = sConf.wholeNumbers;
                if (sConf.changeOnClick !== undefined) slider.changeOnClick = sConf.changeOnClick;
                if (sConf.min !== undefined) slider["_min"] = sConf.min;
                if (sConf.max !== undefined) slider["_max"] = sConf.max;

                slider["_value"] = sConf.value !== undefined ? sConf.value : 50;
                slider.update();
            } else if (panelNode instanceof fgui.GProgressBar) {
                const pBar = panelNode;
                const pConf = elData as IProgressBarConfig;
                if (pConf.min !== undefined) pBar.min = pConf.min;
                if (pConf.max !== undefined) pBar.max = pConf.max;
                if (pConf.titleType !== undefined) pBar.titleType = pConf.titleType;
                if (pConf.value !== undefined) pBar.value = pConf.value;
                // 100% 对齐官方 GProgressBar.setup_afterAdd 第 8375 行：
                // 无论 setter 是否因数值与默认值相同被拦截，属性装配终态必须无条件强制执行一次 update 刷新条宽度与标题！
                pBar.update(pBar.value);
            }
        }
        // 3. GComboBox 扩展类装配
        else if (fgui.GComboBox && panelNode instanceof fgui.GComboBox) {
            const cb = panelNode;
            const cbConf = elData as IComboBoxConfig;
            if (!cb["_titleObject"]) {
                const titleChild = cb.getChild("title");
                if (titleChild) cb["_titleObject"] = titleChild;
            }
            if (!cb["_iconObject"]) {
                const iconChild = cb.getChild("icon");
                if (iconChild) cb["_iconObject"] = iconChild;
            }
            if (!cb["_buttonController"]) {
                const bCtrl = cb.getController("button");
                if (bCtrl) cb["_buttonController"] = bCtrl;
            }

            // 装配弹出下拉面板 (dropdown)
            if (!cb.dropdown) {
                let dropdownComp: Nullable<fgui.GComponent> = null;
                if (cbConf.dropdown) {
                    dropdownComp = UIFactory.createFromConfig<fgui.GComponent>(cbConf.dropdown);
                } else {
                    // 兜底生成轻量纯代码弹出容器，保证无外部模板时也能正常展开选择
                    dropdownComp = UIFactory.createPanel({
                        type: "panel",
                        name: "defaultComboDropdown",
                        width: cb.width || 200,
                        height: 160,
                        background: { type: "graph", shape: "rect", fillColor: "#1e293b", lineSize: 1, lineColor: "#38bdf8", cornerRadius: 8 },
                        elements: [
                            {
                                type: "list",
                                name: "list",
                                x: 4,
                                y: 4,
                                width: (cb.width || 200) - 8,
                                height: 152,
                                lineGap: 2
                            }
                        ]
                    });
                }
                if (dropdownComp) {
                    dropdownComp.name = "this._dropdownObject";
                    cb.dropdown = dropdownComp;
                    const listObj = dropdownComp.getChild("list") as Nullable<fgui.GList>;
                    if (listObj) {
                        cb["_list"] = listObj;
                        listObj.on(fgui.Events.CLICK_ITEM, cb, cb["__clickItem"]);
                        listObj.addRelation(dropdownComp, fgui.RelationType.Width);
                        listObj.removeRelation(dropdownComp, fgui.RelationType.Height);
                        dropdownComp.addRelation(listObj, fgui.RelationType.Height);
                        dropdownComp.removeRelation(listObj, fgui.RelationType.Width);
                        dropdownComp.displayObject.on(Laya.Event.UNDISPLAY, cb, cb["__popupWinClosed"]);

                        // 若列表无模板且子项为默认 GComponent，包装 showDropdown 以自动填充选项文本按钮
                        if (!listObj.defaultItem && !cb["_hasDefaultDropdownRender"]) {
                            cb["_hasDefaultDropdownRender"] = true;
                            const origShowDropdown = cb["showDropdown"];
                            cb["showDropdown"] = function (this: fgui.GComboBox) {
                                origShowDropdown.call(this);
                                const l = this["_list"] as Nullable<fgui.GList>;
                                if (l && !l.defaultItem) {
                                    for (let i = 0; i < l.numChildren; i++) {
                                        const child = l.getChildAt(i) as fgui.GComponent;
                                        if (child && child.numChildren === 0) {
                                            child.setSize(l.width, 32);
                                            const bg = UIFactory.createGraph({ type: "graph", name: "bg", width: l.width, height: 32, fillColor: "#1e293b" });
                                            const tf = UIFactory.createText({ type: "text", name: "title", x: 10, y: 6, width: l.width - 20, height: 20, fontSize: 13, color: "#f8fafc", text: this.items[i] || "" });
                                            child.addChild(bg);
                                            child.addChild(tf);
                                        }
                                    }
                                    l.resizeToFit(this.visibleItemCount);
                                }
                            };
                        }
                    }
                }
            }

            // 绑定原生鼠标交互与状态机
            if (!cb["_hasNativeComboEvents"]) {
                cb["_hasNativeComboEvents"] = true;
                cb.on(Laya.Event.ROLL_OVER, cb, cb["__rollover"]);
                cb.on(Laya.Event.ROLL_OUT, cb, cb["__rollout"]);
                cb.on(Laya.Event.MOUSE_DOWN, cb, cb["__mousedown"]);
            }

            // 回填顶层属性（确保 _titleObject/_iconObject 映射后立即生效）
            if (cbConf.items) cb.items = cbConf.items;
            if (cbConf.values) cb.values = cbConf.values;
            if (cbConf.icons) cb.icons = cbConf.icons.map(u => UIFactory.formatResUrl(u));
            if (cbConf.selectedIndex !== undefined) cb.selectedIndex = cbConf.selectedIndex;
            if (cbConf.value !== undefined) cb.value = cbConf.value;
            if (cbConf.titleColor) cb.titleColor = cbConf.titleColor;
            if (cbConf.titleFontSize) cb.titleFontSize = cbConf.titleFontSize;
        }
        // 4. GLabel 扩展类装配
        else if (fgui.GLabel && panelNode instanceof fgui.GLabel) {
            const lbl = panelNode;
            const lConf = elData as ILabelConfig;
            if (!lbl["_titleObject"]) {
                const titleChild = lbl.getChild("title");
                if (titleChild) lbl["_titleObject"] = titleChild;
            }
            if (!lbl["_iconObject"]) {
                const iconChild = lbl.getChild("icon");
                if (iconChild) lbl["_iconObject"] = iconChild;
            }
            if (lConf.title !== undefined) lbl.title = lConf.title;
            if (lConf.icon) lbl.icon = UIFactory.formatResUrl(lConf.icon);
            if (lConf.titleColor) lbl.titleColor = lConf.titleColor;
            if (lConf.titleFontSize) lbl.titleFontSize = lConf.titleFontSize;
            if (lConf.color) lbl.color = lConf.color;
            if (lConf.editable !== undefined) lbl.editable = lConf.editable;
        }
        // 5. GScrollBar 扩展类装配
        else if (fgui.GScrollBar && panelNode instanceof fgui.GScrollBar) {
            const sb = panelNode;
            const sbConf = elData as IScrollBarConfig;
            if (sbConf.fixedGripSize !== undefined) {
                sb["_fixedGripSize"] = sbConf.fixedGripSize;
            }
            sb["_grip"] = sb.getChild("grip");
            sb["_bar"] = sb.getChild("bar");
            sb["_arrowButton1"] = sb.getChild("arrow1");
            sb["_arrowButton2"] = sb.getChild("arrow2");

            if (!sb["_hasNativeScrollBarEvents"]) {
                sb["_hasNativeScrollBarEvents"] = true;
                if (sb["_grip"]) {
                    sb["_grip"].on(Laya.Event.MOUSE_DOWN, sb, (evt: Laya.Event) => {
                        if (!sb["_target"]) return;
                        sb["__gripMouseDown"](evt);
                    });
                }
                if (sb["_arrowButton1"]) {
                    sb["_arrowButton1"].on(Laya.Event.MOUSE_DOWN, sb, (evt: Laya.Event) => {
                        if (!sb["_target"]) return;
                        sb["__arrowButton1Click"](evt);
                    });
                }
                if (sb["_arrowButton2"]) {
                    sb["_arrowButton2"].on(Laya.Event.MOUSE_DOWN, sb, (evt: Laya.Event) => {
                        if (!sb["_target"]) return;
                        sb["__arrowButton2Click"](evt);
                    });
                }
                sb.on(Laya.Event.MOUSE_DOWN, sb, (evt: Laya.Event) => {
                    if (!sb["_target"]) return;
                    sb["__barMouseDown"](evt);
                });
            }
        }
    }

    /**
     * 为父容器内声明了 `target` 的独立 GScrollBar 自动绑定同级滚动视口 (ScrollPane)
     *
     * @param panelNode 父级容器
     * @param childElements 子元素配置数组
     */
    public static bindScrollBarTargets(panelNode: fgui.GComponent, childElements: IElementConfig[]): void {
        if (!panelNode || !childElements || !fgui.GScrollBar) return;
        for (let i = 0; i < childElements.length; i++) {
            const el = childElements[i];
            if (el && el.type === "scrollbar") {
                const sbConf = el as IScrollBarConfig;
                if (!sbConf.target) continue;
                const sb = (el.name ? panelNode.getChild(el.name) : null) as Nullable<fgui.GScrollBar>;
                const targetComp = panelNode.getChild(sbConf.target) as Nullable<fgui.GComponent>;
                if (sb && sb instanceof fgui.GScrollBar && targetComp && targetComp.scrollPane) {
                    const pane = targetComp.scrollPane;
                    const isVertical = sbConf.vertical !== false;
                    sb.setScrollPane(pane, isVertical);

                    const syncDisplay = () => {
                        if (isVertical) {
                            const ratio = pane.contentHeight > 0 ? Math.min(1, pane.viewHeight / pane.contentHeight) : 1;
                            sb.setDisplayPerc(ratio);
                            sb.setScrollPerc(pane.percY);
                        } else {
                            const ratio = pane.contentWidth > 0 ? Math.min(1, pane.viewWidth / pane.contentWidth) : 1;
                            sb.setDisplayPerc(ratio);
                            sb.setScrollPerc(pane.percX);
                        }
                    };
                    syncDisplay();
                    targetComp.on(fgui.Events.SCROLL, sb, () => {
                        sb.setScrollPerc(isVertical ? pane.percY : pane.percX);
                    });
                }
            }
        }
    }

    /**
     * 递归填充声明式多级 GTreeNode 树节点并注入默认渲染器
     *
     * @param tree 目标 GTree 实例
     * @param parentNode 父节点（根部传 tree.rootNode）
     * @param nodes 声明式节点配置数组
     */
    public static populateTreeNodes(tree: fgui.GTree, parentNode: fgui.GTreeNode, nodes: ITreeNodeConfig[]): void {
        if (!tree || !parentNode || !Array.isArray(nodes)) return;

        if (!tree.treeNodeRender) {
            tree.treeNodeRender = Laya.Handler.create(null, (node: fgui.GTreeNode, obj: fgui.GComponent) => {
                const d = node.data as ITreeNodeConfig | undefined;
                if (!d) return;
                if (d.text !== undefined) {
                    obj.text = d.text;
                    const titleObj = obj.getChild("title");
                    if (titleObj) titleObj.text = d.text;
                }
                if (d.icon !== undefined) {
                    const formatted = UIFactory.formatResUrl(d.icon);
                    obj.icon = formatted;
                    const iconObj = obj.getChild("icon");
                    if (iconObj) iconObj.icon = formatted;
                }
            }, undefined, false);
        }

        for (const item of nodes) {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isFolder = item.isFolder !== undefined ? item.isFolder : hasChildren;
            const gNode = new fgui.GTreeNode(isFolder, item.resURL);
            gNode.data = item;
            parentNode.addChild(gNode);
            if (item.expanded !== undefined) {
                gNode.expanded = item.expanded;
            }
            if (hasChildren) {
                UIFactoryExtensions.populateTreeNodes(tree, gNode, item.children!);
            }
        }
    }
}
