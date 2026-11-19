import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GList = fgui.GList;
import GTextField = fgui.GTextField;
import GGraph = fgui.GGraph;
import IPanelConfig = tsCore.IPanelConfig;
import UIFactory = tsCore.UIFactory;
import PureList = tsCore.PureList;

/**
 * 符号单项配置数据
 */
interface ISlotSymbol {
    icon: string;
    name: string;
    color: string;
}

/**
 * 缓动曲线选项定义
 */
interface IEasingOption {
    name: string;
    ease: (t: number, b: number, c: number, d: number) => number;
}

/**
 * 转速档位定义
 */
interface ISpeedOption {
    name: string;
    baseSpeed: number;
    staggerDelay: number;
    stopDelay: number;
}

/**
 * ⑤ 3A 级 Slot 5 轴滚轮网格 — 纯代码 PureList 对象池虚拟循环滚动
 *
 * 规范化架构与声明式驱动：
 * 1. 100% 声明式数据驱动：5 轴滚轮列表 (reelCol_0 ~ reelCol_4) 与右侧交互控制台完全在 res/layout/tab5Slot.json 中静态配置；
 * 2. 彻底杜绝代码中手动循环 createElement 并 addChild 生成 DOM 树；
 * 3. 符号项布局规范：彻底移除代码硬编码 JSON 字面量，纯路径直驱引用 res/layout/slotItem.json；
 * 4. 内置全特性交互控制台：支持手动单列拖拽滑动、整格磁吸、弹性回弹、停轮缓动曲线切换、转速档位调节与停轮策略。
 */
export class Tab5SlotView {

    private static readonly ROW_HEIGHT = 110; // 单格项高 100px + 行距 10px

    private _container!: GComponent;
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

    public setupInteractions(panel: GComponent, itemConfig?: IPanelConfig): void {
        this._container = panel;
        this._itemConfig = itemConfig || UIFactory.getLayout("res/layout/slotItem.json")!;

        const outerList = this._container.getChild("reelFrame").getChild("slotOuterList") as GList;
        const sidePanel = this._container.getChild("sidePanel") as GComponent;
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

        // 1. 100% 声明式驱动：直接查找在 tab5Slot.json 中声明的 5 列 PureList 容器，0 行代码循环创建 DOM 节点
        this._slotCols = [];
        for (let col = 0; col < 5; col++) {
            const colList = outerList.getChild(`reelCol_${col}`) as PureList;
            if (!colList) {
                console.warn(`[Tab5SlotView] 未在 slotOuterList 中找到 reelCol_${col}`);
                continue;
            }

            // 开启 FGUI 原生单桶对象池虚拟循环列表
            colList.setVirtualAndLoop();

            // 注入渲染器 (仅在 item 无子级时灌装解耦的 slotItem 模板，复用率 100%)
            colList.itemRenderer = Laya.Handler.create(colList, (idx: number, item: GComponent) => {
                if (item.numChildren === 0 && this._itemConfig) {
                    UIFactory.fillPanel(item, this._itemConfig);
                }
                const sym = symbols[idx % symbols.length];
                const bg = item.getChild("bg") as GGraph;
                const iconTxt = item.getChild("symIcon") as GTextField;
                const nameTxt = item.getChild("symName") as GTextField;

                if (bg) bg.drawRect(2, sym.color, "#1e293b");
                if (iconTxt) iconTxt.text = sym.icon;
                if (nameTxt) {
                    nameTxt.text = sym.name;
                    nameTxt.color = sym.color;
                }
            }, null, false);

            colList.numItems = symbols.length * 5;

            // 初始化各列的物理滚动属性与吸附参数
            if (colList.scrollPane) {
                colList.scrollPane.touchEffect = this._touchScrollEnabled;
                colList.scrollPane.mouseWheelEnabled = this._touchScrollEnabled;
                colList.scrollPane.snapToItem = this._snapToItemEnabled;
                colList.scrollPane.bouncebackEffect = this._bounceEnabled;
            }

            // 在列表容器自身监听滚动事件（FGUI 事件派发于 GComponent 宿主），实时更新检视看板
            colList.on(fgui.Events.SCROLL, this, this._onListScroll);

            this._slotCols.push(colList);
        }

        // 2. 绑定右侧控制台核心主控操作
        this._setupSidePanelControls(sidePanel);
        this._updateStatusInspector("静止就绪");
    }

    /**
     * 监听单列滚动事件
     */
    private _onListScroll(): void {
        if (!this._isSpinning) {
            this._updateStatusInspector("用户手动单列滑动中...");
        }
    }

    /**
     * 装配右侧控制台的全部扩展交互与物理策略按钮
     */
    private _setupSidePanelControls(sidePanel: GComponent): void {
        const btnSpin = sidePanel.getChild("btnSpin") as GButton;
        const btnStop = sidePanel.getChild("btnStop") as GButton;

        // 开始错峰旋转
        if (btnSpin) {
            btnSpin.onClick(this, () => {
                if (this._isSpinning) return;
                this._startSlotSpin();
            });
        }

        // 错峰/全停
        if (btnStop) {
            btnStop.onClick(this, () => {
                if (!this._isSpinning) return;
                this._stopSlotSpin();
            });
        }

        // 🖐️ 手动单列拖拽滑动开关 (用户重点提出：控制手动能否点击 list 滚动单列)
        const btnToggleTouch = sidePanel.getChild("btnToggleTouch") as GButton;
        if (btnToggleTouch) {
            btnToggleTouch.selected = this._touchScrollEnabled;
            btnToggleTouch.onClick(this, () => {
                this._touchScrollEnabled = btnToggleTouch.selected;
                for (const col of this._slotCols) {
                    if (col.scrollPane) {
                        col.scrollPane.touchEffect = this._touchScrollEnabled;
                        col.scrollPane.mouseWheelEnabled = this._touchScrollEnabled;
                    }
                }
                this._updateStatusInspector(this._touchScrollEnabled ? "手动单列拖拽已开启" : "手动单列拖拽已禁用");
            });
        }

        // 🧲 整格磁吸对齐开关
        const btnToggleSnap = sidePanel.getChild("btnToggleSnap") as GButton;
        if (btnToggleSnap) {
            btnToggleSnap.selected = this._snapToItemEnabled;
            btnToggleSnap.onClick(this, () => {
                this._snapToItemEnabled = btnToggleSnap.selected;
                for (const col of this._slotCols) {
                    if (col.scrollPane) {
                        col.scrollPane.snapToItem = this._snapToItemEnabled;
                    }
                }
                this._updateStatusInspector(this._snapToItemEnabled ? "整格磁吸对齐已开启" : "整格磁吸对齐已关闭");
            });
        }

        // 🌀 边缘弹性回弹开关
        const btnToggleBounce = sidePanel.getChild("btnToggleBounce") as GButton;
        if (btnToggleBounce) {
            btnToggleBounce.selected = this._bounceEnabled;
            btnToggleBounce.onClick(this, () => {
                this._bounceEnabled = btnToggleBounce.selected;
                for (const col of this._slotCols) {
                    if (col.scrollPane) {
                        col.scrollPane.bouncebackEffect = this._bounceEnabled;
                    }
                }
                this._updateStatusInspector(this._bounceEnabled ? "弹性回弹已开启" : "弹性回弹已关闭");
            });
        }

        // 📉 缓动曲线循环切换
        const btnEasingMode = sidePanel.getChild("btnEasingMode") as GButton;
        if (btnEasingMode) {
            btnEasingMode.onClick(this, () => {
                this._easingIndex = (this._easingIndex + 1) % this._easingOptions.length;
                const opt = this._easingOptions[this._easingIndex];
                btnEasingMode.title = `📉 停轮缓动: ${opt.name}`;
                this._updateStatusInspector(`停轮缓动已切换为: ${opt.name}`);
            });
        }

        // ⚡ 旋转速度档位切换
        const btnSpeedMode = sidePanel.getChild("btnSpeedMode") as GButton;
        if (btnSpeedMode) {
            btnSpeedMode.onClick(this, () => {
                this._speedIndex = (this._speedIndex + 1) % this._speedOptions.length;
                const opt = this._speedOptions[this._speedIndex];
                btnSpeedMode.title = `⚡ 旋转转速: ${opt.name.split(",")[0]}`;
                this._updateStatusInspector(`转速已切换为: ${opt.name}`);
            });
        }

        // 🎯 停轮策略切换
        const btnStopPattern = sidePanel.getChild("btnStopPattern") as GButton;
        if (btnStopPattern) {
            btnStopPattern.onClick(this, () => {
                this._stopPattern = this._stopPattern === "sequential" ? "instant" : "sequential";
                btnStopPattern.title = this._stopPattern === "sequential"
                    ? "🎯 停轮策略: 错峰依次停轮 (1→5)"
                    : "🎯 停轮策略: 一键全轴同时定格 (Instant)";
                this._updateStatusInspector(`停轮策略切换为: ${this._stopPattern === "sequential" ? "错峰依次" : "全轴同时"}`);
            });
        }

        // 👆 符号点选模式切换
        const btnSelectionMode = sidePanel.getChild("btnSelectionMode") as GButton;
        if (btnSelectionMode) {
            btnSelectionMode.onClick(this, () => {
                this._selectionMode = this._selectionMode === "None" ? "Single" : "None";
                btnSelectionMode.title = this._selectionMode === "None"
                    ? "👆 符号点选: 禁用点选 (None)"
                    : "👆 符号点选: 单项高亮选择 (Single)";
                for (const col of this._slotCols) {
                    col.selectionMode = this._selectionMode === "Single"
                        ? fgui.ListSelectionMode.Single
                        : fgui.ListSelectionMode.None;
                }
                this._updateStatusInspector(`符号点选模式: ${this._selectionMode === "Single" ? "单选高亮" : "禁用"}`);
            });
        }
    }

    /**
     * 启动高速错峰旋转
     */
    private _startSlotSpin(): void {
        this._isSpinning = true;
        this._slotSpeeds = [0, 0, 0, 0, 0];
        Laya.timer.frameLoop(1, this, this._updateSlotFrame);

        const currentSpeedOpt = this._speedOptions[this._speedIndex];
        for (let i = 0; i < 5; i++) {
            const colIdx = i;
            Laya.timer.once(i * currentSpeedOpt.staggerDelay, this, () => {
                this._slotSpeeds[colIdx] = currentSpeedOpt.baseSpeed + colIdx * 2;
            });
        }

        this._updateStatusInspector("5 轴高速错峰旋转中...");
    }

    /**
     * 停轮落定与整格磁吸
     */
    private _stopSlotSpin(): void {
        const currentSpeedOpt = this._speedOptions[this._speedIndex];
        const currentEase = this._easingOptions[this._easingIndex].ease;

        if (this._stopPattern === "instant") {
            // 一键全轴同时定格
            this._isSpinning = false;
            Laya.timer.clear(this, this._updateSlotFrame);
            for (let i = 0; i < 5; i++) {
                this._slotSpeeds[i] = 0;
                const col = this._slotCols[i];
                if (col && col.scrollPane) {
                    const snapY = Math.round(col.scrollPane.posY / Tab5SlotView.ROW_HEIGHT) * Tab5SlotView.ROW_HEIGHT;
                    Laya.Tween.to(col.scrollPane, { posY: snapY }, 250, currentEase);
                }
            }
            this._updateStatusInspector("定格完成！全轴同时落定，对齐 110px 整格。");
            return;
        }

        // 默认: 错峰依次减速停轮 (1 -> 5)
        for (let i = 0; i < 5; i++) {
            const colIdx = i;
            Laya.timer.once(i * currentSpeedOpt.stopDelay, this, () => {
                this._slotSpeeds[colIdx] = 0;
                const col = this._slotCols[colIdx];
                if (col && col.scrollPane) {
                    const snapY = Math.round(col.scrollPane.posY / Tab5SlotView.ROW_HEIGHT) * Tab5SlotView.ROW_HEIGHT;
                    Laya.Tween.to(col.scrollPane, { posY: snapY }, 260, currentEase);
                }
                if (colIdx === 4) {
                    this._isSpinning = false;
                    Laya.timer.clear(this, this._updateSlotFrame);
                    this._updateStatusInspector("定格完成！5 轴错峰停轮落定，整格磁吸完成。");
                }
            });
        }
        this._updateStatusInspector("正在依次减速落定中...");
    }

    /**
     * 逐帧位移更新
     */
    private _updateSlotFrame(): void {
        for (let i = 0; i < 5; i++) {
            const speed = this._slotSpeeds[i];
            if (speed > 0) {
                const col = this._slotCols[i];
                if (col && col.scrollPane) {
                    col.scrollPane.posY += speed;
                }
            }
        }
    }

    /**
     * 刷新右侧状态检视看板
     */
    private _updateStatusInspector(stateMsg: string): void {
        if (!this._statusTxt) return;

        const coords = this._slotCols.map((c, i) => {
            const posY = c && c.scrollPane ? Math.round(c.scrollPane.posY % 880) : 0;
            return `C${i}:${posY}`;
        }).join(" ");

        this._statusTxt.text = `状态：${stateMsg}\n` +
            `• 5 轴 PureList 单桶对象池复用率 100%\n` +
            `• 拖拽: ${this._touchScrollEnabled ? "开启✔" : "禁用✖"} | 磁吸: ${this._snapToItemEnabled ? "110px✔" : "关✖"} | 回弹: ${this._bounceEnabled ? "开✔" : "关✖"}\n` +
            `• 缓动: ${this._easingOptions[this._easingIndex].name.split(" ")[0]} | 转速: ${this._speedOptions[this._speedIndex].name.split(" ")[0]}\n` +
            `• 实时坐标: [${coords}]`;
    }

    /**
     * 容器销毁或重置时的生命周期安全清理
     */
    public dispose(): void {
        this._isSpinning = false;
        Laya.timer.clearAll(this);
        for (const col of this._slotCols) {
            col.off(fgui.Events.SCROLL, this, this._onListScroll);
            if (col.itemRenderer) {
                col.itemRenderer.recover();
            }
            if (col.scrollPane) {
                Laya.Tween.clearAll(col.scrollPane);
            }
        }
        if (this._container) {
            this._container.offAllCaller(this);
        }
    }
}