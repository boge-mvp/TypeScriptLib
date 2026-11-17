import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";
import { ISliderConfig } from "./ISliderConfig";
import { IProgressBarConfig } from "./IProgressBarConfig";

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
                if (pConf.min !== undefined) pBar["min"] = pConf.min;
                if (pConf.max !== undefined) pBar.max = pConf.max;
                if (pConf.titleType !== undefined) pBar.titleType = pConf.titleType;
                if (pConf.value !== undefined) {
                    pBar.value = pConf.value;
                } else {
                    pBar.update(pBar.value);
                }
            }
        }
        // 3. GComboBox 扩展类装配
        else if (fgui.GComboBox && panelNode instanceof fgui.GComboBox) {
            if (!panelNode["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) panelNode["_titleObject"] = titleChild;
            }
            if (!panelNode["_iconObject"]) {
                const iconChild = panelNode.getChild("icon");
                if (iconChild) panelNode["_iconObject"] = iconChild;
            }
        }
        // 4. GLabel 扩展类装配
        else if (fgui.GLabel && panelNode instanceof fgui.GLabel) {
            if (!panelNode["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) panelNode["_titleObject"] = titleChild;
            }
            if (!panelNode["_iconObject"]) {
                const iconChild = panelNode.getChild("icon");
                if (iconChild) panelNode["_iconObject"] = iconChild;
            }
        }
        // 5. GScrollBar 扩展类装配
        else if (fgui.GScrollBar && panelNode instanceof fgui.GScrollBar) {
            panelNode["_grip"] = panelNode.getChild("grip");
            panelNode["_bar"] = panelNode.getChild("bar");
            panelNode["_arrowButton1"] = panelNode.getChild("arrow1");
            panelNode["_arrowButton2"] = panelNode.getChild("arrow2");

            if (panelNode["_grip"]) {
                panelNode["_grip"].on(Laya.Event.MOUSE_DOWN, panelNode, panelNode["__gripMouseDown"]);
            }
            if (panelNode["_arrowButton1"]) {
                panelNode["_arrowButton1"].on(Laya.Event.MOUSE_DOWN, panelNode, panelNode["__arrowButton1Click"]);
            }
            if (panelNode["_arrowButton2"]) {
                panelNode["_arrowButton2"].on(Laya.Event.MOUSE_DOWN, panelNode, panelNode["__arrowButton2Click"]);
            }
            panelNode.on(Laya.Event.MOUSE_DOWN, panelNode, panelNode["__barMouseDown"]);
        }
    }
}
