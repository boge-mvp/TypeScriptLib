import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GSlider = fgui.GSlider;
import GProgressBar = fgui.GProgressBar;
import GTextInput = fgui.GTextInput;
import GTextField = fgui.GTextField;

/**
 * Tab 3: 原生组件全家桶 (Button / Slider / Bar / Checkbox / Radio / Input) 交互检视面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class Tab3ButtonsView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        const logBoard = this.getChild("btnLogBoard") as GComponent;
        const logContent = logBoard ? logBoard.getChild("logContent") as GTextField : null;

        const appendLog = (msg: string) => {
            if (!logContent) return;
            const t = new Date().toLocaleTimeString();
            const prev = logContent.text || "";
            logContent.text = `[${t}] ${msg}\n` + prev.slice(0, 1200);
        };

        const getNode = (name: string): fgui.GObject => {
            let res = this.getChild(name);
            if (!res) {
                const box = this.getChild("btnDemoBox") as GComponent;
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
                    appendLog(`原生 GSlider 拖拽更新: value = ${slider.value}`);
                });
            }
        }

        // 原生 GProgressBar 交互控制
        const barSec = getNode("progressSection") as GComponent;
        if (barSec) {
            const pBar = barSec.getChild("demoProgressBar") as GProgressBar;
            const progressCtrlRow = barSec.getChild("progressCtrlRow") as GComponent;
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

        // 原生输入框交互监听
        const inputSec = getNode("inputSection") as GComponent;
        if (inputSec) {
            const input = inputSec.getChild("demoInput") as GTextInput;
            if (input) {
                input.on(Laya.Event.INPUT, this, () => {
                    appendLog(`原生 GTextInput 实时输入: "${input.text}"`);
                });
            }
        }
    }
}
