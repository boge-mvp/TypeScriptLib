import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;

interface RelationOptionMeta {
    type: string;
    label: string;
    desc: string;
}

export class Tab6RelationsView {

    private _container!: GComponent;
    private _sandboxStage!: GComponent;
    private _targetBox!: GComponent;
    private _followerBox!: GComponent;
    private _ghostBox!: GComponent;
    private _handlesGroup!: fgui.GGroup;
    private _targetLabel!: GTextField;
    private _followerLabel!: GTextField;
    private _telemetryText!: GTextField;
    private _configPreviewText!: GTextField;

    private static readonly HANDLE_KEYS = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    private static readonly CURSOR_MAP: Record<string, string> = {
        nw: "nwse-resize",
        se: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize",
        e: "ew-resize",
        w: "ew-resize",
        n: "ns-resize",
        s: "ns-resize"
    };

    private _isTargetSelected: boolean = false;
    private _isDraggingTarget: boolean = false;
    private _isResizing: boolean = false;

    private _relButtons: Record<string, GButton> = {};
    private _pctButtons: Record<string, GButton> = {};

    private _activeRelations: Map<string, boolean> = new Map();
    private _baseLayoutMode: "right" | "inside" | "bottom" = "right";
    private _targetPivotCenter: boolean = false;

    private static readonly ALL_RELATIONS: RelationOptionMeta[] = [
        { type: "Width", label: "宽 -> 宽", desc: "宽度跟随目标宽度等差/等比缩放" },
        { type: "Height", label: "高 -> 高", desc: "高度跟随目标高度等差/等比缩放" },
        { type: "Size", label: "宽+高(Size)", desc: "宽高同时跟随目标尺寸缩放" },
        { type: "Center_Center", label: "左右居中", desc: "水平中心点与目标中心保持对齐" },
        { type: "Middle_Middle", label: "上下居中", desc: "垂直中线与目标中线保持对齐" },
        { type: "Left_Left", label: "左", desc: "左边缘锚定目标左边缘" },
        { type: "Left_Center", label: "中", desc: "左边缘锚定目标水平中心" },
        { type: "Left_Right", label: "右", desc: "左边缘锚定目标右边缘(伴生右推)" },
        { type: "Right_Left", label: "左", desc: "右边缘锚定目标左边缘" },
        { type: "Right_Center", label: "中", desc: "右边缘锚定目标水平中心" },
        { type: "Right_Right", label: "右", desc: "右边缘锚定目标右边缘(右侧贴靠)" },
        { type: "Top_Top", label: "顶", desc: "顶边缘锚定目标顶边缘" },
        { type: "Top_Middle", label: "中", desc: "顶边缘锚定目标垂直中线" },
        { type: "Top_Bottom", label: "底", desc: "顶边缘锚定目标底边缘(下方沉降)" },
        { type: "Bottom_Top", label: "顶", desc: "底边缘锚定目标顶边缘" },
        { type: "Bottom_Middle", label: "中", desc: "底边缘锚定目标垂直中线" },
        { type: "Bottom_Bottom", label: "底", desc: "底边缘锚定目标底边缘(底部贴靠)" },
        { type: "LeftExt_Left", label: "左", desc: "左边缘随目标左移而延展宽度(右边缘不动)" },
        { type: "LeftExt_Right", label: "右", desc: "左边缘随目标右边缘而延展宽度(右边缘不动)" },
        { type: "RightExt_Left", label: "左", desc: "右边缘随目标左边缘而延展宽度(左边缘不动)" },
        { type: "RightExt_Right", label: "右", desc: "右边缘随目标右边缘而延展宽度(左边缘不动)" },
        { type: "TopExt_Top", label: "顶", desc: "顶边缘随目标顶边缘而延展高度(底边缘不动)" },
        { type: "TopExt_Bottom", label: "底", desc: "顶边缘随目标底边缘而延展高度(底边缘不动)" },
        { type: "BottomExt_Top", label: "顶", desc: "底边缘随目标顶边缘而延展高度(顶边缘不动)" },
        { type: "BottomExt_Bottom", label: "底", desc: "底边缘随目标底边缘而延展高度(顶边缘不动)" }
    ];

    public setupInteractions(panel: GComponent): void {
        this._container = panel;
        const leftWorkbench = this._container.getChild("leftWorkbench") as GComponent;
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

        const rightMatrixPanel = this._container.getChild("rightMatrixPanel") as GComponent;
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
                ], "right");
                this._bindPresetBtn(presetRow1, "btnPresetSize", [
                    { type: "Left_Left", percent: false },
                    { type: "Top_Top", percent: false },
                    { type: "Width", percent: false },
                    { type: "Height", percent: false }
                ], "inside");
                this._bindPresetBtn(presetRow1, "btnPresetCenter", [
                    { type: "Center_Center", percent: false },
                    { type: "Middle_Middle", percent: false }
                ], "inside");
                this._bindPresetBtn(presetRow1, "btnPresetExtH", [
                    { type: "LeftExt_Left", percent: false },
                    { type: "RightExt_Right", percent: false },
                    { type: "Middle_Middle", percent: false }
                ], "inside");
                this._bindPresetBtn(presetRow1, "btnPresetExtV", [
                    { type: "TopExt_Top", percent: false },
                    { type: "BottomExt_Bottom", percent: false },
                    { type: "Center_Center", percent: false }
                ], "inside");
                this._bindPresetBtn(presetRow1, "btnClearRelations", [], null);
            }
        }

        const layoutModeRow = leftWorkbench.getChild("layoutModeRow") as GComponent;
        if (layoutModeRow) {
            const modeCtrl = layoutModeRow.getController("modeCtrl");
            if (modeCtrl) {
                modeCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                    this._baseLayoutMode = (modeCtrl.selectedPage || "right") as any;
                    this._resetStageToBaseline();
                });
            }

            const btnTogglePivot = layoutModeRow.getChild("btnTogglePivot") as GButton;
            if (btnTogglePivot) {
                btnTogglePivot.on(fgui.Events.STATE_CHANGED, this, () => {
                    this._targetPivotCenter = btnTogglePivot.selected;
                    if (this._targetPivotCenter) {
                        this._targetBox.setPivot(0.5, 0.5, false);
                        btnTogglePivot.title = "B轴心: (0.5,0.5)";
                    } else {
                        this._targetBox.setPivot(0, 0, false);
                        btnTogglePivot.title = "B轴心: (0,0)";
                    }
                    this._resetStageToBaseline();
                });
            }
        }

        this._applyPreset([
            { type: "Left_Right", percent: false },
            { type: "Middle_Middle", percent: false }
        ]);

        this._setupDirectCanvasInteractions();
    }

    private _bindPresetBtn(row: GComponent, name: string, items: Array<{ type: string; percent: boolean }>, mode: "right" | "inside" | "bottom" | null): void {
        const btn = row.getChild(name) as GButton;
        if (btn) {
            btn.onClick(this, () => {
                if (mode) this._syncLayoutMode(mode);
                this._applyPreset(items);
            });
        }
    }

    private _syncLayoutMode(mode: "right" | "inside" | "bottom"): void {
        this._baseLayoutMode = mode;
        const leftWorkbench = this._container.getChild("leftWorkbench") as GComponent;
        if (leftWorkbench) {
            const layoutModeRow = leftWorkbench.getChild("layoutModeRow") as GComponent;
            if (layoutModeRow) {
                const modeCtrl = layoutModeRow.getController("modeCtrl");
                if (modeCtrl && modeCtrl.selectedPage !== mode) {
                    modeCtrl.selectedPage = mode;
                }
            }
        }
    }

    private _applyPreset(items: Array<{ type: string; percent: boolean }>): void {
        this._activeRelations.clear();
        for (const item of items) {
            this._activeRelations.set(item.type, item.percent);
        }
        for (const meta of Tab6RelationsView.ALL_RELATIONS) {
            const hasRel = this._activeRelations.has(meta.type);
            const usePct = this._activeRelations.get(meta.type) || false;
            if (this._relButtons[meta.type]) this._relButtons[meta.type].selected = hasRel;
            if (this._pctButtons[meta.type]) this._pctButtons[meta.type].selected = hasRel && usePct;
        }
        this._resetStageToBaseline();
    }

    private _resetStageToBaseline(): void {
        this._followerBox.relations.clearAll();

        let bx = 70, by = 150, bw = 160, bh = 100;
        let ax = 260, ay = 170, aw = 130, ah = 60;

        if (this._baseLayoutMode === "inside") {
            bx = 90; by = 100; bw = 300; bh = 200;
            ax = 140; ay = 150; aw = 200; ah = 100;
        } else if (this._baseLayoutMode === "bottom") {
            bx = 130; by = 80; bw = 240; bh = 100;
            ax = 130; ay = 210; aw = 240; ah = 70;
        }

        this._targetBox.setXY(bx, by);
        this._targetBox.setSize(bw, bh);
        this._followerBox.setXY(ax, ay);
        this._followerBox.setSize(aw, ah);
        this._ghostBox.setXY(ax, ay);
        this._ghostBox.setSize(aw, ah);

        this._rebuildRelationsFromCurrentBaseline();
    }

    private _rebuildRelationsFromCurrentBaseline(): void {
        this._followerBox.relations.clearAll();
        this._ghostBox.setXY(this._followerBox.x, this._followerBox.y);
        this._ghostBox.setSize(this._followerBox.width, this._followerBox.height);

        const activeList: Array<{ target: string; type: string; usePercent: boolean }> = [];
        const descParts: string[] = [];

        this._activeRelations.forEach((usePercent, relType) => {
            const relKey = relType as keyof typeof fgui.RelationType;
            const enumVal = fgui.RelationType[relKey];
            if (enumVal !== undefined) {
                this._followerBox.addRelation(this._targetBox, enumVal, usePercent);
                activeList.push({ target: "targetBox", type: relType, usePercent });
                const meta = Tab6RelationsView.ALL_RELATIONS.find(m => m.type === relType);
                descParts.push(`${relType}${usePercent ? "(%)" : ""}: ${meta ? meta.desc : ""}`);
            }
        });

        if (this._configPreviewText) {
            if (activeList.length === 0) {
                this._configPreviewText.text = "当前未勾选任何关联 (relations: []) — 拖动左侧滑块改变 Target B 时，Follower A 将保持原地静止。";
            } else {
                const jsonStr = JSON.stringify(activeList);
                this._configPreviewText.text = `relations: ${jsonStr}\n💡 生效机制: ${descParts.join("；")}`;
            }
        }

        this._refreshTelemetry();
    }

    private _setTargetSelected(selected: boolean): void {
        this._isTargetSelected = selected;
        if (this._handlesGroup) {
            this._handlesGroup.visible = selected;
        }
        this._refreshTelemetry();
    }

    private _setupDirectCanvasInteractions(): void {
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        this._targetBox.on(Laya.Event.MOUSE_OVER, this, () => {
            if (!this._isResizing) Laya.Mouse.cursor = "move";
        });
        this._targetBox.on(Laya.Event.MOUSE_OUT, this, () => {
            if (!this._isDraggingTarget && !this._isResizing) Laya.Mouse.cursor = "default";
        });

        this._targetBox.on(Laya.Event.MOUSE_DOWN, this, (evt?: Laya.Event) => {
            if (this._isResizing) return;
            this._setTargetSelected(true);
            this._isDraggingTarget = true;
            Laya.Mouse.cursor = "move";
            if (evt && evt.stopPropagation) evt.stopPropagation();

            const stagePt = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
            dragOffsetX = stagePt.x - this._targetBox.x;
            dragOffsetY = stagePt.y - this._targetBox.y;

            const onMouseMove = () => {
                if (!this._isDraggingTarget) return;
                const curPt = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
                let nx = Math.round(curPt.x - dragOffsetX);
                let ny = Math.round(curPt.y - dragOffsetY);
                const maxX = Math.round(this._sandboxStage.width - this._targetBox.width - 5);
                const maxY = Math.round(this._sandboxStage.height - this._targetBox.height - 5);
                nx = Math.max(5, Math.min(nx, maxX));
                ny = Math.max(20, Math.min(ny, maxY));

                this._targetBox.setXY(nx, ny);
                this._refreshTelemetry();
            };

            const onMouseUp = () => {
                this._isDraggingTarget = false;
                Laya.Mouse.cursor = "default";
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, onMouseMove);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, onMouseUp);
                Laya.stage.off(Laya.Event.BLUR, this, onMouseUp);
            };

            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onMouseMove);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, onMouseUp);
            Laya.stage.on(Laya.Event.BLUR, this, onMouseUp);
        });

        for (const dir of Tab6RelationsView.HANDLE_KEYS) {
            const grip = this._targetBox.getChild(`handle_${dir}`) as GComponent;
            if (!grip) continue;

                grip.on(Laya.Event.MOUSE_OVER, this, (evt?: Laya.Event) => {
                    if (evt && evt.stopPropagation) evt.stopPropagation();
                    Laya.Mouse.cursor = Tab6RelationsView.CURSOR_MAP[dir] || "default";
                });
                grip.on(Laya.Event.MOUSE_OUT, this, (evt?: Laya.Event) => {
                    if (evt && evt.stopPropagation) evt.stopPropagation();
                    if (!this._isResizing) Laya.Mouse.cursor = "default";
                });

                grip.on(Laya.Event.MOUSE_DOWN, this, (evt?: Laya.Event) => {
                    if (evt && evt.stopPropagation) evt.stopPropagation();
                    this._setTargetSelected(true);
                    this._isResizing = true;
                    Laya.Mouse.cursor = Tab6RelationsView.CURSOR_MAP[dir] || "default";

                    const startPt = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
                    const initLeft = this._targetBox.x;
                    const initTop = this._targetBox.y;
                    const initRight = this._targetBox.x + this._targetBox.width;
                    const initBottom = this._targetBox.y + this._targetBox.height;

                    const maxRight = Math.round(this._sandboxStage.width - 5);
                    const maxBottom = Math.round(this._sandboxStage.height - 5);

                    const gripOffsetX = startPt.x - (dir.indexOf("w") >= 0 ? initLeft : initRight);
                    const gripOffsetY = startPt.y - (dir.indexOf("n") >= 0 ? initTop : initBottom);

                    const onResizeMove = () => {
                        if (!this._isResizing) return;
                        const curPt = this._sandboxStage.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);

                        if (dir.indexOf("e") >= 0) {
                            const targetRight = Math.round(curPt.x - gripOffsetX);
                            this._targetBox.width = Math.max(60, Math.min(targetRight - initLeft, maxRight - initLeft));
                        } else if (dir.indexOf("w") >= 0) {
                            const targetLeft = Math.round(curPt.x - gripOffsetX);
                            const nx = Math.max(5, Math.min(targetLeft, initRight - 60));
                            this._targetBox.x = nx;
                            this._targetBox.width = initRight - nx;
                        }

                        if (dir.indexOf("s") >= 0) {
                            const targetBottom = Math.round(curPt.y - gripOffsetY);
                            this._targetBox.height = Math.max(40, Math.min(targetBottom - initTop, maxBottom - initTop));
                        } else if (dir.indexOf("n") >= 0) {
                            const targetTop = Math.round(curPt.y - gripOffsetY);
                            const ny = Math.max(20, Math.min(targetTop, initBottom - 40));
                            this._targetBox.y = ny;
                            this._targetBox.height = initBottom - ny;
                        }

                        this._refreshTelemetry();
                    };

                    const onResizeUp = () => {
                        this._isResizing = false;
                        Laya.Mouse.cursor = "default";
                        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, onResizeMove);
                        Laya.stage.off(Laya.Event.MOUSE_UP, this, onResizeUp);
                        Laya.stage.off(Laya.Event.BLUR, this, onResizeUp);
                    };

                    Laya.stage.on(Laya.Event.MOUSE_MOVE, this, onResizeMove);
                    Laya.stage.on(Laya.Event.MOUSE_UP, this, onResizeUp);
                    Laya.stage.on(Laya.Event.BLUR, this, onResizeUp);
                });
            }

        this._sandboxStage.on(Laya.Event.MOUSE_DOWN, this, () => {
            if (!this._isDraggingTarget && !this._isResizing) {
                this._setTargetSelected(false);
            }
        });
    }

    private _refreshTelemetry(): void {
        const bx = Math.round(this._targetBox.x);
        const by = Math.round(this._targetBox.y);
        const bw = Math.round(this._targetBox.width);
        const bh = Math.round(this._targetBox.height);

        const ax = Math.round(this._followerBox.x);
        const ay = Math.round(this._followerBox.y);
        const aw = Math.round(this._followerBox.width);
        const ah = Math.round(this._followerBox.height);

        const gx = Math.round(this._ghostBox.x);
        const gy = Math.round(this._ghostBox.y);
        const gw = Math.round(this._ghostBox.width);
        const gh = Math.round(this._ghostBox.height);

        const dx = ax - gx;
        const dy = ay - gy;
        const dw = aw - gw;
        const dh = ah - gh;
        const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

        if (this._targetLabel) {
            if (this._isTargetSelected) {
                this._targetLabel.text = `🎯 Target B (已选中)\nX:${bx} Y:${by} W:${bw} H:${bh}\n(按住拖动 | 8手柄自由缩放)`;
            } else {
                this._targetLabel.text = `Target B (参照物)\nX:${bx} Y:${by} W:${bw} H:${bh}\n(点击选中)`;
            }
        }

        if (this._followerLabel) {
            this._followerLabel.text = `Follower A\nX:${ax} Y:${ay}\nW:${aw} H:${ah}`;
        }
        if (this._telemetryText) {
            this._telemetryText.text = `📊 实时遥测: B(${bx},${by}, ${bw}×${bh}) → A(${ax},${ay}, ${aw}×${ah}) | 联动增量 Δ=(X:${fmt(dx)}, Y:${fmt(dy)}, W:${fmt(dw)}, H:${fmt(dh)})`;
        }
    }
}
