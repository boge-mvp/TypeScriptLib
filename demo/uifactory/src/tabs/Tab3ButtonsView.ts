import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GSlider = fgui.GSlider;
import GProgressBar = fgui.GProgressBar;
import GTextInput = fgui.GTextInput;
import GTextField = fgui.GTextField;

export class Tab3ButtonsView {

    private _container!: GComponent;

    public setupInteractions(panel: GComponent): void {
        this._container = panel;
        const logContent = this._container.getChild("btnLogBoard").getChild("logContent") as GTextField;

        const appendLog = (msg: string) => {
            const t = new Date().toLocaleTimeString();
            const prev = logContent.text || "";
            logContent.text = `[${t}] ${msg}\n` + prev.slice(0, 1200);
        };

        const getNode = (name: string): fgui.GObject => {
            let res = this._container.getChild(name);
            if (!res) {
                const box = this._container.getChild("btnDemoBox") as GComponent;
                if (box) res = box.getChild(name);
            }
            return res;
        };

        // 按压缩放与状态机颜色联动按钮
        const scaleDarkenRow = getNode("scaleDarkenRow") as GComponent;
        if (scaleDarkenRow) {
            const btnScale = scaleDarkenRow.getChild("btnScaleDemo") as GButton;
            if (btnScale) btnScale.onClick(this, () => appendLog("触发 CLICK: 🔍 中心向心缩放按钮 (downEffect=2, 0.90x, 坐标零位移)"));

            const btnDarken = scaleDarkenRow.getChild("btnDarkenDemo") as GButton;
            if (btnDarken) btnDarken.onClick(this, () => appendLog("触发 CLICK: 💡 原生变暗滤镜按钮 (downEffect=1, 0.80x 亮度滤镜)"));
        }

        // 复选框与独立引入的 Switch 开关
        const checkboxRow = getNode("checkboxRow") as GComponent;
        if (checkboxRow) {
            const btnCheckStd = checkboxRow.getChild("btnCheckStandard") as GButton;
            if (btnCheckStd) {
                btnCheckStd.onClick(this, () => {
                    appendLog(`触发 Checkbox: 标准复选框 = ${btnCheckStd.selected ? "【已勾选 ✔】" : "【未勾选 ✖】"}`);
                });
            }

            const btnSwitch = checkboxRow.getChild("btnSwitchDemo") as GButton;
            if (btnSwitch) {
                btnSwitch.onClick(this, () => {
                    appendLog(`触发 Switch 开关: 现代滑块开关 = ${btnSwitch.selected ? "【ON 开启 (滑块已右移)】" : "【OFF 关闭 (滑块已左移)】"}`);
                });
            }
        }

        // 原生单选组 (GGroup 逻辑分组，直接父容器互斥驱动)
        const radioA = getNode("btnRadioA") as GButton;
        const radioB = getNode("btnRadioB") as GButton;
        if (radioA) radioA.onClick(this, () => appendLog("触发 Radio 单选: 选中选项 A (Standard)，圆点 ● 迁移至 A"));
        if (radioB) radioB.onClick(this, () => appendLog("触发 Radio 单选: 选中选项 B (Premium)，圆点 ● 迁移至 B"));

        // 原生 GSlider 状态监听与交互
        const sliderSec = getNode("sliderSection") as GComponent;
        if (sliderSec) {
            const slider = sliderSec.getChild("demoSlider") as GSlider;
            if (slider) {
                slider.on(fgui.Events.STATE_CHANGED, this, () => {
                    appendLog(`[原生 GSlider] 数值变动: value = ${Math.round(slider.value)} / ${slider.max}`);
                });
            }
        }

        // GTextInput 原生交互输入框
        const inputSec = getNode("inputSection") as GComponent;
        if (inputSec) {
            const inputWrapper = inputSec.getChild("inputWrapper") as GComponent;
            if (inputWrapper) {
                const textInput = inputWrapper.getChild("demoInput") as GTextInput;
                if (textInput && textInput["nativeInput"]) {
                    textInput["nativeInput"].on(Laya.Event.INPUT, this, () => {
                        appendLog(`输入框实时键入内容: "${textInput.text}"`);
                    });
                    textInput["nativeInput"].on(Laya.Event.BLUR, this, () => {
                        appendLog(`输入框失焦确定: 最终文本 = "${textInput.text}"`);
                    });
                }
            }
        }

        // 原生 GProgressBar 进度推进交互
        const progressSection = getNode("progressSection") as GComponent;
        if (progressSection) {
            const pBar = progressSection.getChild("demoProgressBar") as GProgressBar;
            const progressCtrlRow = progressSection.getChild("progressCtrlRow") as GComponent;
            if (progressCtrlRow && pBar) {
                const btnAdd = progressCtrlRow.getChild("btnProgressAdd") as GButton;
                const btnReset = progressCtrlRow.getChild("btnProgressReset") as GButton;
                if (btnAdd) {
                    btnAdd.onClick(this, () => {
                        const nextVal = Math.min(100, pBar.value + 15);
                        pBar.tweenValue(nextVal, 0.3);
                        appendLog(`[原生 GProgressBar] 进度推进: ${nextVal}%`);
                    });
                }
                if (btnReset) {
                    btnReset.onClick(this, () => {
                        pBar.tweenValue(0, 0.3);
                        appendLog(`[原生 GProgressBar] 进度重置为 0%`);
                    });
                }
            }
        }
    }
}
