import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";

export class UIFactoryExtensions {

    /**
     * 【Phase 4: FGUI 官方扩展组件装配管线 (constructExtension 模拟)】
     * 职责：
     *   在所有子元件完成创建、对齐并纳入层级后，根据组件真实类型自动完成核心内部元件的映射与交互绑定：
     *   - GButton: 映射 _titleObject, _iconObject，初始化 _buttonController 与四态
     *   - GProgressBar / GSlider: 映射 _titleObject, _barObject, _gripObject
     *   - GComboBox: 映射 _titleObject, _iconObject
     *   - GLabel: 映射 _titleObject, _iconObject
     */
    public static setupComponentExtension(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        const rawComp = panelNode as any;

        // 1. GButton 扩展类装配
        if (panelNode instanceof fgui.GButton || elData.type === "button") {
            const btn = panelNode as fgui.GButton;
            const rawBtn = btn as any;
            if (!rawBtn["_titleObject"]) {
                const titleChild = btn.getChild("title");
                if (titleChild) rawBtn["_titleObject"] = titleChild;
            }
            if (!rawBtn["_iconObject"]) {
                const iconChild = btn.getChild("icon");
                if (iconChild) rawBtn["_iconObject"] = iconChild;
            }
            // 确保 buttonController 存在并设置初始状态 UP
            if (!rawBtn["_buttonController"]) {
                const bCtrl = btn.getController("button");
                if (bCtrl) rawBtn["_buttonController"] = bCtrl;
            }
            if (rawBtn["_buttonController"] && typeof btn.setState === "function") {
                btn.setState(fgui.GButton.UP);
            }

            // 补齐 FGUI 原生事件监听（模拟 constructExtension，确保纯代码 GButton 具备原生交互能力）
            if (!rawBtn["_hasNativeButtonEvents"]) {
                rawBtn["_hasNativeButtonEvents"] = true;
                btn.on(Laya.Event.ROLL_OVER, btn, rawBtn["__rollover"]);
                btn.on(Laya.Event.ROLL_OUT, btn, rawBtn["__rollout"]);
                btn.on(Laya.Event.MOUSE_DOWN, btn, rawBtn["__mousedown"]);
                btn.on(Laya.Event.CLICK, btn, rawBtn["__click"]);
            }
        }
        // 2. GProgressBar 与 GSlider 扩展类装配
        else if (panelNode instanceof fgui.GProgressBar || (fgui.GSlider && panelNode instanceof fgui.GSlider)) {
            if (!rawComp["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) rawComp["_titleObject"] = titleChild;
            }
            if (!rawComp["_barObject"]) {
                const barChild = panelNode.getChild("bar") || panelNode.getChild("bar_v");
                if (barChild) rawComp["_barObject"] = barChild;
            }
            if (fgui.GSlider && panelNode instanceof fgui.GSlider && !rawComp["_gripObject"]) {
                const gripChild = panelNode.getChild("grip");
                if (gripChild) rawComp["_gripObject"] = gripChild;
            }
        }
        // 3. GComboBox 扩展类装配
        else if (fgui.GComboBox && panelNode instanceof fgui.GComboBox) {
            if (!rawComp["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) rawComp["_titleObject"] = titleChild;
            }
            if (!rawComp["_iconObject"]) {
                const iconChild = panelNode.getChild("icon");
                if (iconChild) rawComp["_iconObject"] = iconChild;
            }
        }
        // 4. GLabel 扩展类装配
        else if (fgui.GLabel && panelNode instanceof fgui.GLabel) {
            if (!rawComp["_titleObject"]) {
                const titleChild = panelNode.getChild("title");
                if (titleChild) rawComp["_titleObject"] = titleChild;
            }
            if (!rawComp["_iconObject"]) {
                const iconChild = panelNode.getChild("icon");
                if (iconChild) rawComp["_iconObject"] = iconChild;
            }
        }
    }
}
