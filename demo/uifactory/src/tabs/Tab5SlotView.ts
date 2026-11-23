import GComponent = fgui.GComponent;
import GList = fgui.GList;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import GComboBox = fgui.GComboBox;
import PureList = tsCore.PureList;
import IPanelConfig = tsCore.IPanelConfig;
import UIFactory = tsCore.UIFactory;

interface ISlotSymbol {
    icon: string;
    name: string;
    color: string;
}

interface IEasingOption {
    name: string;
    ease: (t: number, b: number, c: number, d: number) => number;
}

interface ISpeedOption {
    name: string;
    baseSpeed: number;
    staggerDelay: number;
    stopDelay: number;
}

/**
 * Tab 5: 工业级 3A 级 Slot 滚轮滚动面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class Tab5SlotView extends GComponent {

    private static readonly ROW_HEIGHT = 110; // 单格项高 100px + 行距 10px

    private _slotCols: PureList[] = [];
    private _isSpinning = false;
    private _slotSpeeds = [0, 0, 0, 0, 0];
    private _itemConfig!: IPanelConfig;
    private _statusTxt!: GTextField;

    // 交互与物理策略控制状态
    private _touchScrollEnabled = true;
    private _snapToItemEnabled = true;
    private _bounceEnabled = true;

    // 缓动曲线选择
    private readonly _easingOptions: IEasingOption[] = [
        { name: "BackOut (弹次回抽)", ease: Laya.Ease.backOut },
        { name: "BounceOut (落地弹跳)", ease: Laya.Ease.bounceOut },
        { name: "CubicOut (顺滑平缓)", ease: Laya.Ease.cubicOut },
        { name: "CircOut (圆弧落定)", ease: Laya.Ease.circOut }
    ];
    private _easingIndex = 0;

    // 转速档位选择
    private readonly _speedOptions: ISpeedOption[] = [
        { name: "标准档 (35px/f, 错峰120ms)", baseSpeed: 35, staggerDelay: 120, stopDelay: 180 },
        { name: "极速档 (55px/f, 错峰50ms)", baseSpeed: 55, staggerDelay: 50, stopDelay: 80 },
        { name: "慢速演示 (18px/f, 错峰250ms)", baseSpeed: 18, staggerDelay: 250, stopDelay: 300 }
    ];
    private _speedIndex = 0;

    // 停轮策略: "sequential" (错峰依次停轮 1->5) | "instant" (全轴同时定格)
    private _stopPattern: "sequential" | "instant" = "sequential";

    // 点选模式: "None" | "Single"
    private _selectionMode: "None" | "Single" = "None";

    protected override onConstruct(): void {
        super.onConstruct();

        this._itemConfig = UIFactory.getConfig<IPanelConfig>("res/layout/slotItem.json")!;

        const reelFrame = this.getChild("reelFrame") as GComponent;
        const outerList = reelFrame ? reelFrame.getChild("slotOuterList") as GList : null;
        const sidePanel = this.getChild("sidePanel") as GComponent;
        if (!sidePanel || !outerList) return;

        this._statusTxt = sidePanel.getChild("slotStatus") as GTextField;

        const symbols: ISlotSymbol[] = [
            { icon: "🍒", name: "CHERRY", color: "#dc2626" },
            { icon: "🔔", name: "BELL", color: "#eab308" },
            { icon: "💎", name: "DIAMOND", color: "#38bdf8" },
            { icon: "7️⃣", name: "SEVEN", color: "#ef4444" },
            { icon: "🍋", name: "LEMON", color: "#facc15" },
            { icon: "🍇", name: "GRAPE", color: "#a855f7" },
            { icon: "👑", name: "CROWN", color: "#f59e0b" },
            { icon: "🍀", name: "CLOVER", color: "#22c55e" }
        ];

        // 1. 100% 声明式驱动：直接查找在 tab5Slot.json 中声明的 5 列 PureList 容器
        this._slotCols = [];
        for (let col = 0; col < 5; col++) {
            const colList = outerList.getChild(`reelCol_${col}`) as PureList;
            if (!colList) {
                console.warn(`[Tab5SlotView] 未在 slotOuterList 中找到 reelCol_${col}`);
                continue;
            }

            colList.itemRenderer = Laya.Handler.create(this, (idx: number, item: GComponent) => {
                if (item.numChildren === 0 && this._itemConfig) {
                    UIFactory.fillPanel(item, this._itemConfig);
                }
                const sym = symbols[idx % symbols.length];
                const iconTxt = item.getChild("symIcon") as GTextField;
                const nameTxt = item.getChild("symName") as GTextField;
                const symBg = (item.getChild("bg") || item.getChild("symBg")) as fgui.GGraph;

                if (iconTxt) iconTxt.text = sym.icon;
                if (nameTxt) {
                    nameTxt.text = sym.name;
                    nameTxt.color = sym.color;
                }
                if (symBg) {
                    symBg.drawRect(1, "#334155", "#1e293b", [8, 8, 8, 8]);
                }
            }, null, false);

            colList.numItems = symbols.length * 3;
            colList.ensureBoundsCorrect();

            if (colList.scrollPane) {
                colList.scrollPane.touchEffect = this._touchScrollEnabled;
                colList.scrollPane.bouncebackEffect = this._bounceEnabled;
                colList.scrollPane.snapToItem = this._snapToItemEnabled;
            }

            this._slotCols.push(colList);
        }

        // 2. 绑定操控台交互事件
        this._setupSideControls(sidePanel);
    }

    private _setupSideControls(sidePanel: GComponent): void {
        const btnSpin = sidePanel.getChild("btnSpin") as GButton;
        const btnStop = sidePanel.getChild("btnStop") as GButton;

        if (btnSpin) {
            btnSpin.onClick(this, () => {
                if (this._isSpinning) return;
                this._startSpin();
            });
        }

        if (btnStop) {
            btnStop.onClick(this, () => {
                if (!this._isSpinning) return;
                this._stopSpin();
            });
        }

        const btnTouch = sidePanel.getChild("btnToggleTouch") as GButton;
        if (btnTouch) {
            btnTouch.onClick(this, () => {
                this._touchScrollEnabled = !this._touchScrollEnabled;
                for (const col of this._slotCols) {
                    if (col.scrollPane) col.scrollPane.touchEffect = this._touchScrollEnabled;
                }
                btnTouch.title = `手动拖拽: ${this._touchScrollEnabled ? "ON" : "OFF"}`;
                this._updateStatus(`已${this._touchScrollEnabled ? "允许" : "禁止"}手动滑动滚轮`);
            });
        }

        const btnSnap = sidePanel.getChild("btnToggleSnap") as GButton;
        if (btnSnap) {
            btnSnap.onClick(this, () => {
                this._snapToItemEnabled = !this._snapToItemEnabled;
                for (const col of this._slotCols) {
                    if (col.scrollPane) col.scrollPane.snapToItem = this._snapToItemEnabled;
                }
                btnSnap.title = `整格磁吸: ${this._snapToItemEnabled ? "ON" : "OFF"}`;
                this._updateStatus(`已${this._snapToItemEnabled ? "开启" : "关闭"}整格磁吸对齐`);
            });
        }

        const btnBounce = sidePanel.getChild("btnToggleBounce") as GButton;
        if (btnBounce) {
            btnBounce.onClick(this, () => {
                this._bounceEnabled = !this._bounceEnabled;
                for (const col of this._slotCols) {
                    if (col.scrollPane) col.scrollPane.bouncebackEffect = this._bounceEnabled;
                }
                btnBounce.title = `弹性回弹: ${this._bounceEnabled ? "ON" : "OFF"}`;
                this._updateStatus(`已${this._bounceEnabled ? "开启" : "关闭"}视口弹性回弹`);
            });
        }

        const btnEase = sidePanel.getChild("btnEasingMode") as GButton;
        if (btnEase) {
            btnEase.onClick(this, () => {
                this._easingIndex = (this._easingIndex + 1) % this._easingOptions.length;
                const opt = this._easingOptions[this._easingIndex];
                btnEase.title = `曲线: ${opt.name.split(" ")[0]}`;
                this._updateStatus(`切换停轮曲线: ${opt.name}`);
            });
        }

        const btnSpeed = sidePanel.getChild("btnSpeedMode") as GButton;
        if (btnSpeed) {
            btnSpeed.onClick(this, () => {
                this._speedIndex = (this._speedIndex + 1) % this._speedOptions.length;
                const opt = this._speedOptions[this._speedIndex];
                btnSpeed.title = `转速: ${opt.name.split(" ")[0]}`;
                this._updateStatus(`切换档位: ${opt.name}`);
            });
        }

        const btnPattern = sidePanel.getChild("btnStopPattern") as GButton;
        if (btnPattern) {
            btnPattern.onClick(this, () => {
                this._stopPattern = this._stopPattern === "sequential" ? "instant" : "sequential";
                btnPattern.title = `停轮: ${this._stopPattern === "sequential" ? "错峰" : "齐停"}`;
                this._updateStatus(`停轮策略: ${this._stopPattern === "sequential" ? "1->5 依次错峰" : "全列同时刹停"}`);
            });
        }

        const btnSel = sidePanel.getChild("btnSelectionMode") as GButton;
        if (btnSel) {
            btnSel.onClick(this, () => {
                this._selectionMode = this._selectionMode === "None" ? "Single" : "None";
                for (const col of this._slotCols) {
                    col.selectionMode = this._selectionMode === "None" ? fgui.ListSelectionMode.None : fgui.ListSelectionMode.Single;
                }
                btnSel.title = `点选: ${this._selectionMode}`;
                this._updateStatus(`单项点选高亮: ${this._selectionMode}`);
            });
        }
    }

    private _startSpin(): void {
        this._isSpinning = true;
        this._updateStatus("🚀 滚轮极速加速启动中...");
        const curOpt = this._speedOptions[this._speedIndex];

        // 高速旋转期间必须关闭整格磁吸对齐，避免每帧坐标被 FGUI 强行吸附回当前格导致滚动卡死
        for (const col of this._slotCols) {
            if (col.scrollPane) col.scrollPane.snapToItem = false;
        }

        for (let col = 0; col < 5; col++) {
            this._slotSpeeds[col] = 0;
            Laya.timer.once(col * curOpt.staggerDelay, this, () => {
                if (!this._isSpinning) return;
                this._slotSpeeds[col] = curOpt.baseSpeed;
            });
        }

        Laya.timer.frameLoop(1, this, this._onSpinLoop);
    }

    private _onSpinLoop(): void {
        // 8 个符号为一组（高 880px），超过第二组（1760px）时折返 880px，保持在第一与第二组之间无缝无限循环
        const loopSegment = Tab5SlotView.ROW_HEIGHT * 8;
        for (let col = 0; col < this._slotCols.length; col++) {
            const list = this._slotCols[col];
            const speed = this._slotSpeeds[col];
            if (speed > 0 && list.scrollPane) {
                list.scrollPane.posY += speed;
                if (list.scrollPane.posY >= loopSegment * 2) {
                    list.scrollPane.posY -= loopSegment;
                }
            }
        }
    }

    private _stopSpin(): void {
        this._updateStatus("🛑 触发停轮序列...");
        Laya.timer.clear(this, this._onSpinLoop);
        const curOpt = this._speedOptions[this._speedIndex];
        const easeFunc = this._easingOptions[this._easingIndex].ease;

        if (this._stopPattern === "instant") {
            for (let col = 0; col < 5; col++) {
                this._stopSingleCol(col, easeFunc);
            }
            this._finishSpin();
        } else {
            for (let col = 0; col < 5; col++) {
                Laya.timer.once(col * curOpt.stopDelay, this, () => {
                    this._stopSingleCol(col, easeFunc);
                    if (col === 4) {
                        this._finishSpin();
                    }
                });
            }
        }
    }

    private _stopSingleCol(colIdx: number, easeFunc: (t: number, b: number, c: number, d: number) => number): void {
        const col = this._slotCols[colIdx];
        if (!col || !col.scrollPane) return;

        this._slotSpeeds[colIdx] = 0;
        const currentY = col.scrollPane.posY;
        const snapY = Math.round(currentY / Tab5SlotView.ROW_HEIGHT) * Tab5SlotView.ROW_HEIGHT;

        Laya.Tween.to(col.scrollPane, { posY: snapY }, 600, easeFunc);
    }

    private _finishSpin(): void {
        Laya.timer.once(700, this, () => {
            this._isSpinning = false;
            // 停轮物理吸附到位后恢复整格磁吸配置
            for (const col of this._slotCols) {
                if (col.scrollPane) col.scrollPane.snapToItem = this._snapToItemEnabled;
            }
            this._updateStatus("✨ 停轮完成！全轴物理磁吸已复位对齐。");
        });
    }

    private _updateStatus(text: string): void {
        if (this._statusTxt) {
            this._statusTxt.text = `状态: ${text}`;
        }
    }
}
