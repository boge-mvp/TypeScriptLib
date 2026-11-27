import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import IPanelConfig = tsCore.IPanelConfig;
import UIFactory = tsCore.UIFactory;

/**
 * Tab 5: Flexbox 弹性排版与自适应流式折行检视面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class FlexboxWorkbench extends GComponent {

    private _flexPreviewBox!: GComponent;
    private _dynamicFlex!: GComponent;
    private _baseFlexConfig!: IPanelConfig;
    private _subButtons: GButton[] = [];

    private _flexState = {
        flexWrap: true,
        justifyContent: "flex-start" as "flex-start" | "center" | "flex-end" | "space-between" | "space-around",
        alignItems: "center" as "flex-start" | "center" | "flex-end",
        gap: 12
    };

    protected override onConstruct(): void {
        super.onConstruct();

        const tb = this.getChild("controlToolbar") as GComponent;
        this._flexPreviewBox = this.getChild("flexPreviewBox") as GComponent;
        if (!tb || !this._flexPreviewBox) {
            console.warn("[FlexboxWorkbench] 未找到 controlToolbar 或 flexPreviewBox 容器！");
            return;
        }

        this._dynamicFlex = this._flexPreviewBox.getChild("dynamicFlex") as GComponent;

        // 1. 精确定位 dynamicFlex 的原始配置结构模板（源自纯静态 flexboxWorkbench.json）
        const tabConfig = UIFactory.getConfig<IPanelConfig>("res/layout/flexboxWorkbench.json");
        if (tabConfig && tabConfig.elements) {
            const previewBoxConf = tabConfig.elements.find(e => e.name === "flexPreviewBox") as IPanelConfig;
            if (previewBoxConf && previewBoxConf.elements) {
                const found = previewBoxConf.elements.find(e => e.name === "dynamicFlex") as IPanelConfig;
                if (found) {
                    this._baseFlexConfig = found;
                }
            }
        }

        const btnToggleWrap = tb.getChild("btnToggleWrap") as GButton;
        const btnJustify = tb.getChild("btnJustify") as GButton;
        const btnAlign = tb.getChild("btnAlign") as GButton;
        const btnGap = tb.getChild("btnGap") as GButton;

        this._subButtons = [btnJustify, btnAlign, btnGap].filter(Boolean) as GButton[];

        // 2. 折行切换按钮
        if (btnToggleWrap) {
            btnToggleWrap.onClick(this, () => {
                this._flexState.flexWrap = btnToggleWrap.selected;
                this._updateSubButtonsState(!this._flexState.flexWrap);
                this._reapplyFlexLayout();
            });
        }

        // 3. 主轴对齐按钮
        const justifyList: ("flex-start" | "center" | "flex-end" | "space-between" | "space-around")[] = [
            "flex-start", "center", "flex-end", "space-between", "space-around"
        ];
        let justifyIdx = 0;
        if (btnJustify) {
            btnJustify.onClick(this, () => {
                if (this._flexState.flexWrap) return;
                justifyIdx = (justifyIdx + 1) % justifyList.length;
                this._flexState.justifyContent = justifyList[justifyIdx];
                btnJustify.title = `主轴: ${this._flexState.justifyContent}`;
                this._reapplyFlexLayout();
            });
        }

        // 4. 交叉轴对齐按钮
        const alignList: ("flex-start" | "center" | "flex-end")[] = ["center", "flex-start", "flex-end"];
        let alignIdx = 0;
        if (btnAlign) {
            btnAlign.onClick(this, () => {
                if (this._flexState.flexWrap) return;
                alignIdx = (alignIdx + 1) % alignList.length;
                this._flexState.alignItems = alignList[alignIdx];
                btnAlign.title = `交叉轴: ${this._flexState.alignItems}`;
                this._reapplyFlexLayout();
            });
        }

        // 5. 间距切换按钮
        const gapList = [12, 16, 24, 8];
        let gapIdx = 0;
        if (btnGap) {
            btnGap.onClick(this, () => {
                if (this._flexState.flexWrap) return;
                gapIdx = (gapIdx + 1) % gapList.length;
                this._flexState.gap = gapList[gapIdx];
                btnGap.title = `间距: ${this._flexState.gap}px`;
                this._reapplyFlexLayout();
            });
        }

        this._updateSubButtonsState(!this._flexState.flexWrap);
    }

    private _updateSubButtonsState(enabled: boolean): void {
        for (const btn of this._subButtons) {
            btn.touchable = enabled;
            btn.grayed = !enabled;
            btn.alpha = enabled ? 1.0 : 0.45;
        }
    }

    private _reapplyFlexLayout(): void {
        if (!this._baseFlexConfig || !this._dynamicFlex) return;

        const dynamicConfig: IPanelConfig = {
            ...this._baseFlexConfig,
            flexWrap: this._flexState.flexWrap,
            justifyContent: this._flexState.flexWrap ? "flex-start" : this._flexState.justifyContent,
            alignItems: this._flexState.flexWrap ? "center" : this._flexState.alignItems,
            gap: this._flexState.flexWrap ? 12 : this._flexState.gap
        };

        const oldX = this._dynamicFlex.x;
        const oldY = this._dynamicFlex.y;
        this._dynamicFlex.removeFromParent();
        this._dynamicFlex.dispose();

        this._dynamicFlex = UIFactory.createPanel(dynamicConfig, this._flexPreviewBox.width - 32, this._flexPreviewBox.height - 32);
        this._dynamicFlex.x = oldX;
        this._dynamicFlex.y = oldY;
        this._flexPreviewBox.addChild(this._dynamicFlex);
    }
}
