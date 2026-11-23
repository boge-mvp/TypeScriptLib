import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;

interface IRelationMeta {
    type: string;
    label: string;
    desc: string;
}

/**
 * Tab 6: 官方 24 项全系 Relations 关联系统检视面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class Tab6RelationsView extends GComponent {

    private _sandboxStage!: GComponent;
    private _targetBox!: GComponent;
    private _followerBox!: GComponent;
    private _ghostBox!: GComponent;
    private _handlesGroup!: fgui.GGroup;
    private _targetLabel!: GTextField;
    private _followerLabel!: GTextField;
    private _telemetryText!: GTextField;
    private _configPreviewText!: GTextField;

    private _relButtons: Record<string, GButton> = {};
    private _pctButtons: Record<string, GButton> = {};
    private _activeRelations: Map<string, boolean> = new Map();

    private static readonly INITIAL_TARGET_BASELINE = { x: 180, y: 140, width: 220, height: 160 };
    private static readonly INITIAL_FOLLOWER_BASELINE = { x: 440, y: 140, width: 180, height: 160 };

    private static readonly ALL_RELATIONS: IRelationMeta[] = [
        { type: "Left_Left", label: "左", desc: "跟随目标的左边缘位移" },
        { type: "Left_Center", label: "中", desc: "跟随目标的水平中心位移" },
        { type: "Left_Right", label: "右", desc: "跟随目标的右边缘位移" },
        { type: "Center_Center", label: "中", desc: "与目标水平中心对称保持" },
        { type: "Right_Left", label: "左", desc: "右边缘跟随目标左边缘" },
        { type: "Right_Center", label: "中", desc: "右边缘跟随目标中心" },
        { type: "Right_Right", label: "右", desc: "右边缘跟随目标右边缘" },
        { type: "Top_Top", label: "顶", desc: "跟随目标的顶边缘位移" },
        { type: "Top_Middle", label: "中", desc: "跟随目标的垂直中心位移" },
        { type: "Top_Bottom", label: "底", desc: "跟随目标的底边缘位移" },
        { type: "Middle_Middle", label: "中", desc: "与目标垂直中心对称保持" },
        { type: "Bottom_Top", label: "顶", desc: "底边缘跟随目标顶边缘" },
        { type: "Bottom_Middle", label: "中", desc: "底边缘跟随目标中心" },
        { type: "Bottom_Bottom", label: "底", desc: "底边缘跟随目标底边缘" },
        { type: "Width", label: "宽", desc: "宽度随目标宽度等量/等比变化" },
        { type: "Height", label: "高", desc: "高度随目标高度等量/等比变化" },
        { type: "LeftExt_Left", label: "左", desc: "左边缘随目标左边缘而延展宽度(右边缘不动)" },
        { type: "LeftExt_Right", label: "右", desc: "左边缘随目标右边缘而延展宽度(右边缘不动)" },
        { type: "RightExt_Left", label: "左", desc: "右边缘随目标左边缘而延展宽度(左边缘不动)" },
        { type: "RightExt_Right", label: "右", desc: "右边缘随目标右边缘而延展宽度(左边缘不动)" },
        { type: "TopExt_Top", label: "顶", desc: "顶边缘随目标顶边缘而延展高度(底边缘不动)" },
        { type: "TopExt_Bottom", label: "底", desc: "顶边缘随目标底边缘而延展高度(底边缘不动)" },
        { type: "BottomExt_Top", label: "顶", desc: "底边缘随目标顶边缘而延展高度(顶边缘不动)" },
        { type: "BottomExt_Bottom", label: "底", desc: "底边缘随目标底边缘而延展高度(顶边缘不动)" }
    ];

    private static readonly HANDLE_KEYS = ["tl", "t", "tr", "r", "br", "b", "bl", "l"];
    private static readonly CURSOR_MAP: Record<string, string> = {
        tl: "nwse-resize", br: "nwse-resize",
        tr: "nesw-resize", bl: "nesw-resize",
        t: "ns-resize", b: "ns-resize",
        l: "ew-resize", r: "ew-resize"
    };

    protected override onConstruct(): void {
        super.onConstruct();

        const leftWorkbench = this.getChild("leftWorkbench") as GComponent;
        if (!leftWorkbench) return;

        this._sandboxStage = leftWorkbench.getChild("sandboxStage") as GComponent;
        if (!this._sandboxStage) return;

        this._targetBox = this._sandboxStage.getChild("targetBox") as GComponent;
        this._followerBox = this._sandboxStage.getChild("followerBox") as GComponent;
        this._ghostBox = this._sandboxStage.getChild("ghostBox") as GComponent;
        this._handlesGroup = this._targetBox.getChild("handlesGroup") as fgui.GGroup;
        this._targetLabel = this._targetBox.getChild("targetLabel") as GTextField;
        this._followerLabel = this._followerBox.getChild("followerLabel") as GTextField;

        const telemetryBar = leftWorkbench.getChild("telemetryBar") as GComponent;
        if (telemetryBar) {
            this._telemetryText = telemetryBar.getChild("telemetryText") as GTextField;
        }

        const rightMatrixPanel = this.getChild("rightMatrixPanel") as GComponent;
        if (rightMatrixPanel) {
            const fguiInspectorBox = rightMatrixPanel.getChild("fguiInspectorBox") as GComponent;
            const configPreviewBox = rightMatrixPanel.getChild("configPreviewBox") as GComponent;
            if (configPreviewBox) {
                this._configPreviewText = configPreviewBox.getChild("configPreviewText") as GTextField;
            }

            if (fguiInspectorBox) {
                for (const meta of Tab6RelationsView.ALL_RELATIONS) {
                    const cell = fguiInspectorBox.getChild(`cell_${meta.type}`) as GComponent;
                    if (!cell) continue;
                    const relBtn = cell.getChild(`relBtn_${meta.type}`) as GButton;
                    const pctBtn = cell.getChild(`pctBtn_${meta.type}`) as GButton;
                    if (!relBtn || !pctBtn) continue;

                    this._relButtons[meta.type] = relBtn;
                    this._pctButtons[meta.type] = pctBtn;

                    relBtn.on(fgui.Events.STATE_CHANGED, this, () => {
                        if (relBtn.selected) {
                            this._activeRelations.set(meta.type, pctBtn.selected);
                        } else {
                            this._activeRelations.delete(meta.type);
                        }
                        this._rebuildRelationsFromCurrentBaseline();
                    });

                    pctBtn.on(fgui.Events.STATE_CHANGED, this, () => {
                        if (pctBtn.selected && !relBtn.selected) {
                            relBtn.selected = true;
                        }
                        if (relBtn.selected) {
                            this._activeRelations.set(meta.type, pctBtn.selected);
                            this._rebuildRelationsFromCurrentBaseline();
                        }
                    });
                }
            }

            const presetRow1 = rightMatrixPanel.getChild("presetRow1") as GComponent;
            if (presetRow1) {
                this._bindPresetBtn(presetRow1, "btnPresetFollowRight", [
                    { type: "Left_Right", percent: false },
                    { type: "Middle_Middle", percent: false }
                ]);
                this._bindPresetBtn(presetRow1, "btnPresetCenterSync", [
                    { type: "Center_Center", percent: false },
                    { type: "Middle_Middle", percent: false }
                ]);
                this._bindPresetBtn(presetRow1, "btnPresetWidthSync", [
                    { type: "Width", percent: false },
                    { type: "Bottom_Top", percent: false }
                ]);
            }

            const presetRow2 = rightMatrixPanel.getChild("presetRow2") as GComponent;
            if (presetRow2) {
                this._bindPresetBtn(presetRow2, "btnPresetPercentAnchor", [
                    { type: "Left_Left", percent: true },
                    { type: "Top_Top", percent: true }
                ]);
                this._bindPresetBtn(presetRow2, "btnPresetExtRight", [
                    { type: "RightExt_Right", percent: false },
                    { type: "Bottom_Bottom", percent: false }
                ]);
                this._bindPresetBtn(presetRow2, "btnPresetFullClone", [
                    { type: "Left_Left", percent: false },
                    { type: "Top_Top", percent: false },
                    { type: "Width", percent: false },
                    { type: "Height", percent: false }
                ]);
            }
        }

        const controlBar = leftWorkbench.getChild("controlBar") as GComponent;
        if (controlBar) {
            const btnReset = controlBar.getChild("btnResetTarget") as GButton;
            if (btnReset) {
                btnReset.onClick(this, () => this._resetTargetBaseline());
            }

            const btnClear = controlBar.getChild("btnClearRelations") as GButton;
            if (btnClear) {
                btnClear.onClick(this, () => this._clearAllRelations());
            }
        }

        this._setupTargetDragging();
        this._setupHandleScaling();
        this._applyPreset("btnPresetFollowRight", [
            { type: "Left_Right", percent: false },
            { type: "Middle_Middle", percent: false }
        ]);
    }

    private _bindPresetBtn(parent: GComponent, btnName: string, rels: { type: string; percent: boolean }[]): void {
        const btn = parent.getChild(btnName) as GButton;
        if (btn) {
            btn.onClick(this, () => this._applyPreset(btnName, rels));
        }
    }

    private _applyPreset(btnName: string, rels: { type: string; percent: boolean }[]): void {
        this._clearAllRelations(false);
        for (const r of rels) {
            this._activeRelations.set(r.type, r.percent);
            const rBtn = this._relButtons[r.type];
            const pBtn = this._pctButtons[r.type];
            if (rBtn) rBtn.selected = true;
            if (pBtn) pBtn.selected = r.percent;
        }
        this._rebuildRelationsFromCurrentBaseline();
    }

    private _clearAllRelations(updateUI: boolean = true): void {
        this._activeRelations.clear();
        this._followerBox.relations.clearAll();

        if (updateUI) {
            for (const meta of Tab6RelationsView.ALL_RELATIONS) {
                const rBtn = this._relButtons[meta.type];
                const pBtn = this._pctButtons[meta.type];
                if (rBtn) rBtn.selected = false;
                if (pBtn) pBtn.selected = false;
            }
            this._rebuildRelationsFromCurrentBaseline();
        }
    }

    private _resetTargetBaseline(): void {
        const tb = Tab6RelationsView.INITIAL_TARGET_BASELINE;
        const fb = Tab6RelationsView.INITIAL_FOLLOWER_BASELINE;

        this._targetBox.setXY(tb.x, tb.y);
        this._targetBox.setSize(tb.width, tb.height);

        this._followerBox.relations.clearAll();
        this._followerBox.setXY(fb.x, fb.y);
        this._followerBox.setSize(fb.width, fb.height);

        this._rebuildRelationsFromCurrentBaseline();
    }

    private _rebuildRelationsFromCurrentBaseline(): void {
        this._followerBox.relations.clearAll();

        for (const [relType, usePercent] of this._activeRelations.entries()) {
            const relKey = relType as keyof typeof fgui.RelationType;
            const fguiRelType = fgui.RelationType[relKey];
            if (fguiRelType !== undefined) {
                this._followerBox.addRelation(this._targetBox, fguiRelType, usePercent);
            }
        }

        this._updateTelemetryAndLabels();
    }

    private _updateTelemetryAndLabels(): void {
        const tx = Math.round(this._targetBox.x);
        const ty = Math.round(this._targetBox.y);
        const tw = Math.round(this._targetBox.width);
        const th = Math.round(this._targetBox.height);

        const fx = Math.round(this._followerBox.x);
        const fy = Math.round(this._followerBox.y);
        const fw = Math.round(this._followerBox.width);
        const fh = Math.round(this._followerBox.height);

        if (this._targetLabel) {
            this._targetLabel.text = `🎯 目标组件 Target\n(${tx}, ${ty}) | ${tw} × ${th}`;
        }
        if (this._followerLabel) {
            this._followerLabel.text = `🔗 跟随者 Follower\n(${fx}, ${fy}) | ${fw} × ${fh}`;
        }

        if (this._telemetryText) {
            this._telemetryText.text = `Target: [x=${tx}, y=${ty}, w=${tw}, h=${th}] | Follower: [x=${fx}, y=${fy}, w=${fw}, h=${fh}] | 激活关联数: ${this._activeRelations.size}`;
        }

        if (this._configPreviewText) {
            const relArray: any[] = [];
            for (const [t, p] of this._activeRelations.entries()) {
                const item: any = { target: "targetBox", type: t };
                if (p) item.usePercent = true;
                relArray.push(item);
            }
            this._configPreviewText.text = JSON.stringify({ relations: relArray }, null, 2);
        }
    }

    private _setupTargetDragging(): void {
        this._targetBox.draggable = true;
        this._targetBox.dragBounds = new Laya.Rectangle(10, 10, this._sandboxStage.width - 20, this._sandboxStage.height - 20);

        this._targetBox.on(fgui.Events.DRAG_MOVE, this, () => {
            this._updateTelemetryAndLabels();
        });
        this._targetBox.on(fgui.Events.DRAG_END, this, () => {
            this._updateTelemetryAndLabels();
        });
    }

    private _setupHandleScaling(): void {
        for (const dir of Tab6RelationsView.HANDLE_KEYS) {
            const handle = this._targetBox.getChild(`handle_${dir}`);
            if (!handle) continue;

            handle.on(Laya.Event.MOUSE_OVER, this, () => {
                Laya.Mouse.cursor = Tab6RelationsView.CURSOR_MAP[dir] || "default";
            });
            handle.on(Laya.Event.MOUSE_OUT, this, () => {
                Laya.Mouse.cursor = "default";
            });

            handle.on(Laya.Event.MOUSE_DOWN, this, (evt: Laya.Event) => {
                evt.stopPropagation();
                this._targetBox.draggable = false;
                this._startHandleDrag(dir);
            });
        }
    }

    private _startHandleDrag(dir: string): void {
        const startMouse = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
        const startX = this._targetBox.x;
        const startY = this._targetBox.y;
        const startW = this._targetBox.width;
        const startH = this._targetBox.height;

        const onMouseMove = () => {
            const curMouse = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
            const dx = curMouse.x - startMouse.x;
            const dy = curMouse.y - startMouse.y;

            let newX = startX;
            let newY = startY;
            let newW = startW;
            let newH = startH;

            const minW = 100;
            const minH = 80;

            if (dir.includes("r")) {
                newW = Math.max(minW, startW + dx);
            }
            if (dir.includes("l")) {
                const candW = startW - dx;
                if (candW >= minW) {
                    newW = candW;
                    newX = startX + dx;
                }
            }
            if (dir.includes("b")) {
                newH = Math.max(minH, startH + dy);
            }
            if (dir.includes("t")) {
                const candH = startH - dy;
                if (candH >= minH) {
                    newH = candH;
                    newY = startY + dy;
                }
            }

            this._targetBox.setXY(Math.round(newX), Math.round(newY));
            this._targetBox.setSize(Math.round(newW), Math.round(newH));
            this._updateTelemetryAndLabels();
        };

        const onMouseUp = () => {
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, onMouseMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, onMouseUp);
            this._targetBox.draggable = true;
            Laya.Mouse.cursor = "default";
            this._updateTelemetryAndLabels();
        };

        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onMouseMove);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, onMouseUp);
    }
}
