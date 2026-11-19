import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import IPanelConfig = tsCore.IPanelConfig;
import UIFactory = tsCore.UIFactory;

export class Tab4FlexboxView {

    private _container!: GComponent;
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

    public setupInteractions(panel: GComponent, tabConfig?: IPanelConfig): void {
        this._container = panel;
        const tb = this._container.getChild("controlToolbar") as GComponent;
        this._flexPreviewBox = this._container.getChild("flexPreviewBox") as GComponent;
        if (!tb || !this._flexPreviewBox) {
            console.warn("[Tab4FlexboxView] 未找到 controlToolbar 或 flexPreviewBox 容器！");
            return;
        }

        this._dynamicFlex = this._flexPreviewBox.getChild("dynamicFlex") as GComponent;

        // 1. 精确定位 dynamicFlex 的原始配置结构模板（源自纯静态 tab4Flexbox.json）
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

        // 2. 折行切换按钮（由 JSON mode="Check" + gearColor + selectedTitle 自闭环接管换色与文案）
        if (btnToggleWrap) {
            btnToggleWrap.onClick(this, () => {
                this._flexState.flexWrap = btnToggleWrap.selected;
                // 仅当 flexWrap === false 时才允许后续按钮生效，否则置灰并禁用
                this._updateSubButtonsState(!this._flexState.flexWrap);
                this._reapplyFlexLayout();
            });
        }

        // 3. 主轴对齐按钮（通过官方 GButton.title 存取器赋值；flexWrap === true 折行时阻断运行）
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

        // 5. 间距切换按钮（严格符合 8pt/4pt 空间阶梯度量：8, 12, 16, 24）
        const gapList = [12, 16, 24, 8];
        let gapIdx = 0;
        if (btnGap) {
            btnGap.onClick(this, () => {
                if (this._flexState.flexWrap) return;
                gapIdx = (gapIdx + 1) % gapList.length;
                this._flexState.gap = gapList[gapIdx];
                btnGap.title = `间距 gap: ${this._flexState.gap}px`;
                this._reapplyFlexLayout();
            });
        }

        // 6. 初始化门控状态联动（初始 flexWrap === true 时后续按钮处于禁用置灰态）
        this._updateSubButtonsState(!this._flexState.flexWrap);
    }

    /**
     * 根据折行状态门控后续按钮交互与视觉表现
     * @param enabled 是否允许操作后续排版按钮
     */
    private _updateSubButtonsState(enabled: boolean): void {
        for (const btn of this._subButtons) {
            btn.touchable = enabled;
            btn.grayed = !enabled;
            btn.alpha = enabled ? 1.0 : 0.4;
        }
    }

    private _reapplyFlexLayout(): void {
        if (!this._baseFlexConfig || !this._dynamicFlex) return;

        // 彻底释放并销毁旧子元件与 GPU 显存资源，杜绝内存持续泄漏
        this._dynamicFlex.removeChildren(0, -1, true);

        // 单行模式（flexWrap=false）选取前 5 项（宽约 620px < 1112px），使主轴对齐（space-around/between/center）具有约 444px 充裕空闲空间，效果立竿见影！
        // 折行模式（flexWrap=true）展示全量 12 项，淋漓尽致呈现流式自动折行。
        const displayElements = this._flexState.flexWrap
            ? this._baseFlexConfig.elements
            : this._baseFlexConfig.elements?.slice(0, 5);

        // 纯基于静态配置模板更新布局属性，由 UIFactory 重新执行两遍测量排版
        const updatedConfig: IPanelConfig = {
            ...this._baseFlexConfig,
            flexWrap: this._flexState.flexWrap,
            justifyContent: this._flexState.justifyContent,
            alignItems: this._flexState.alignItems,
            gap: this._flexState.gap,
            elements: displayElements
        };

        UIFactory.fillPanel(this._dynamicFlex, updatedConfig);
    }
}
