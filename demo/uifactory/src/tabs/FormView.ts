import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import GTextInput = fgui.GTextInput;
import GSlider = fgui.GSlider;
import GProgressBar = fgui.GProgressBar;
import GComboBox = fgui.GComboBox;
import UIFactory = tsCore.UIFactory;

/**
 * Tab 3 · 表单与基础交互控制器 (Button / Input / Label / Slider / ProgressBar / ComboBox)
 */
export class FormView extends GComponent {

    private _clickCount: number = 0;

    protected override onConstruct(): void {
        super.onConstruct();

        // 3.1 Common / Check / Radio 联动
        const btnAction = this.getChild("btnActionCommon") as Nullable<GButton>;
        const chkAutoSave = this.getChild("chkAutoSave") as Nullable<GButton>;
        const formBtnStatus = this.getChild("formBtnStatus") as Nullable<GTextField>;
        const radioCtrl = this.getController("radioCtrl");

        const refreshBtnStatus = () => {
            if (!formBtnStatus) return;
            const auto = chkAutoSave?.selected ? "开启" : "关闭";
            const page = radioCtrl?.selectedPage || "mid";
            formBtnStatus.text = `交互状态：自动保存 = ${auto} | 当前画质 = ${page} | 按钮点击 = ${this._clickCount} 次`;
        };

        btnAction?.onClick(this, () => {
            this._clickCount++;
            btnAction.title = `点击计数 (${this._clickCount})`;
            refreshBtnStatus();
        });

        chkAutoSave?.on(fgui.Events.STATE_CHANGED, this, refreshBtnStatus);
        radioCtrl?.on(fgui.Events.STATE_CHANGED, this, refreshBtnStatus);
        refreshBtnStatus();

        // 3.2 输入框实时回显
        const input = this.getChild("txtUserInput") as Nullable<GTextInput>;
        const mirror = this.getChild("inputMirrorText") as Nullable<GTextField>;
        if (input && mirror) {
            input.on(Laya.Event.INPUT, this, () => {
                mirror.text = `实时输入回显：${input.text || "(空)"}`;
            });
        }

        // 3.3 GSlider 独立滑动条测试 + 配置开关
        // 3.3 GSlider 独立滑动条测试 + wholeNumbers / reverse / changeOnClick 配置开关
        // 官方 GSlider._reverse 仅在构造期读取，切换 reverse 时通过修改构造 JSON 重新创建组件来真实还原官方流程
        const panelConfig = UIFactory.getConfig("res/layout/formPanel.json") as Nullable<tsCore.IPanelConfig>;
        const findElementConf = <T extends tsCore.IElementConfig>(name: string): Nullable<T> => {
            const list = panelConfig?.elements;
            if (!list) return null;
            for (let i = 0; i < list.length; i++) {
                if (list[i] && list[i].name === name) return list[i] as T;
            }
            return null;
        };

        let slider = this.getChild("demoSlider") as Nullable<GSlider>;
        let sliderReversed = false;
        const sliderVal = this.getChild("sliderValueText") as Nullable<GTextField>;
        const sliderOptStatus = this.getChild("sliderOptStatus") as Nullable<GTextField>;
        const btnWhole = this.getChild("btnSliderWhole") as Nullable<GButton>;
        const btnSliderRev = this.getChild("btnSliderReverse") as Nullable<GButton>;
        const btnSliderClick = this.getChild("btnSliderClick") as Nullable<GButton>;
        const syncSliderText = () => {
            if (slider && sliderVal) {
                const v = slider.wholeNumbers ? Math.round(slider.value) : Math.round(slider.value * 10) / 10;
                sliderVal.text = `${v}%`;
            }
            if (slider && sliderOptStatus) {
                sliderOptStatus.text = `wholeNumbers=${slider.wholeNumbers} | reverse=${sliderReversed} | changeOnClick=${slider.changeOnClick}`;
            }
        };
        const bindSliderEvents = (target: GSlider) => {
            target.on(fgui.Events.STATE_CHANGED, this, syncSliderText);
        };
        if (slider) {
            bindSliderEvents(slider);
            (this.getChild("btnSlider0") as Nullable<GButton>)?.onClick(this, () => {
                if (!slider) return;
                slider.value = 0;
                syncSliderText();
            });
            (this.getChild("btnSlider50") as Nullable<GButton>)?.onClick(this, () => {
                if (!slider) return;
                slider.value = 50;
                syncSliderText();
            });
            (this.getChild("btnSlider100") as Nullable<GButton>)?.onClick(this, () => {
                if (!slider) return;
                slider.value = 100;
                syncSliderText();
            });
            btnWhole?.on(fgui.Events.STATE_CHANGED, this, () => {
                if (!slider) return;
                slider.wholeNumbers = btnWhole.selected;
                syncSliderText();
            });
            btnSliderRev?.onClick(this, () => {
                const baseConf = findElementConf<tsCore.ISliderConfig>("demoSlider");
                if (!slider || !baseConf) return;
                sliderReversed = !sliderReversed;
                const curValue = slider.value;
                const curWhole = slider.wholeNumbers;
                const curClick = slider.changeOnClick;
                const childIdx = this.getChildIndex(slider);
                const clonedConf: tsCore.ISliderConfig = JSON.parse(JSON.stringify(baseConf));
                clonedConf.reverse = sliderReversed;
                clonedConf.value = curValue;
                clonedConf.wholeNumbers = curWhole;
                clonedConf.changeOnClick = curClick;
                if (clonedConf.elements) {
                    const gripConf = clonedConf.elements.find((e) => e.name === "grip");
                    const barConf = clonedConf.elements.find((e) => e.name === "bar");
                    if (gripConf && barConf) {
                        const barX = barConf.x ?? 0;
                        const barW = barConf.width ?? 320;
                        const gripW = gripConf.width ?? 24;
                        gripConf.x = sliderReversed ? barX : barX + barW - gripW;
                    }
                }
                slider.dispose();
                const rebuilt = UIFactory.createSlider(clonedConf);
                rebuilt.setXY(clonedConf.x ?? 0, clonedConf.y ?? 0);
                this.addChildAt(rebuilt, childIdx);
                slider = rebuilt;
                bindSliderEvents(slider);
                btnSliderRev.title = `反向滑动: ${sliderReversed ? "开" : "关"}`;
                syncSliderText();
            });
            btnSliderClick?.on(fgui.Events.STATE_CHANGED, this, () => {
                if (!slider) return;
                slider.changeOnClick = btnSliderClick.selected;
                syncSliderText();
            });
            syncSliderText();
        }

        // 3.4 GProgressBar 独立进度条测试 + reverse / titleType / tweenValue 配置开关
        // 官方 GProgressBar._reverse 仅在构造期读取，切换 reverse 时通过修改构造 JSON 重新创建组件来真实还原官方流程
        let progress = this.getChild("demoProgress") as Nullable<GProgressBar>;
        let progressReversed = false;
        const progressOptStatus = this.getChild("progressOptStatus") as Nullable<GTextField>;
        const btnProgRev = this.getChild("btnProgressReverse") as Nullable<GButton>;
        const btnProgTitle = this.getChild("btnProgressTitleType") as Nullable<GButton>;
        const btnProgTween = this.getChild("btnProgressTween") as Nullable<GButton>;
        const titleTypeNames = ["Percent(0)", "ValueAndMax(1)", "Value(2)", "Max(3)"];
        const titleShortNames = ["Percent", "Val/Max", "Value", "Max"];
        let useTween = true;
        const tweenDur = 0.35;
        const applyProgressValue = (nextVal: number) => {
            if (!progress) return;
            if (useTween) {
                progress.tweenValue(nextVal, tweenDur);
            } else {
                progress.value = nextVal;
            }
        };
        const syncProgressStatus = () => {
            if (!progress || !progressOptStatus) return;
            const tIdx = Math.max(0, Math.min(3, progress.titleType));
            progressOptStatus.text = `reverse=${progressReversed} | titleType=${titleTypeNames[tIdx]} | tween=${useTween} | val=${Math.round(progress.value)}`;
        };
        if (progress) {
            (this.getChild("btnProgressSub") as Nullable<GButton>)?.onClick(this, () => {
                if (!progress) return;
                applyProgressValue(Math.max(0, progress.value - 15));
                syncProgressStatus();
            });
            (this.getChild("btnProgressAdd") as Nullable<GButton>)?.onClick(this, () => {
                if (!progress) return;
                applyProgressValue(Math.min(100, progress.value + 15));
                syncProgressStatus();
            });
            (this.getChild("btnProgressReset") as Nullable<GButton>)?.onClick(this, () => {
                applyProgressValue(0);
                syncProgressStatus();
            });
            btnProgRev?.onClick(this, () => {
                const baseConf = findElementConf<tsCore.IProgressBarConfig>("demoProgress");
                if (!progress || !baseConf) return;
                progressReversed = !progressReversed;
                const curVal = progress.value;
                const curTitleType = progress.titleType;
                const childIdx = this.getChildIndex(progress);
                const clonedConf: tsCore.IProgressBarConfig = JSON.parse(JSON.stringify(baseConf));
                clonedConf.reverse = progressReversed;
                clonedConf.value = curVal;
                clonedConf.titleType = curTitleType;
                progress.dispose();
                const rebuilt = UIFactory.createProgressBar(clonedConf);
                rebuilt.setXY(clonedConf.x ?? 0, clonedConf.y ?? 0);
                this.addChildAt(rebuilt, childIdx);
                progress = rebuilt;
                btnProgRev.title = `反向: ${progressReversed ? "开" : "关"}`;
                syncProgressStatus();
            });
            btnProgTitle?.onClick(this, () => {
                if (!progress) return;
                const nextType = (progress.titleType + 1) % 4;
                progress.titleType = nextType;
                progress.update(progress.value);
                btnProgTitle.title = `模式: ${titleShortNames[nextType]}`;
                syncProgressStatus();
            });
            btnProgTween?.on(fgui.Events.STATE_CHANGED, this, () => {
                useTween = btnProgTween.selected;
                syncProgressStatus();
            });
            syncProgressStatus();
        }

        // 3.5 GComboBox 常规与带滚动条选框回调
        const combo = this.getChild("demoCombo") as Nullable<GComboBox>;
        const comboScroll = this.getChild("demoComboScroll") as Nullable<GComboBox>;
        const comboResult = this.getChild("comboResultText") as Nullable<GTextField>;

        const bindCombo = (cb: Nullable<GComboBox>, label: string) => {
            if (!cb) return;
            cb.on(fgui.Events.STATE_CHANGED, this, () => {
                if (comboResult) {
                    comboResult.text = `[${label}] ${cb.text} (value: ${cb.value})`;
                }
            });
        };
        bindCombo(combo, "标准选框");
        bindCombo(comboScroll, "滚动长列表");
    }
}
