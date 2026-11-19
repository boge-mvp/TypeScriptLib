import GRoot = fgui.GRoot;
import {TestSlotView} from "./common/TestSlotView";
import {ScrollViewMode, SlotUiState} from "./common/SlotTestTypes";
import {ControlPanel} from "./common/ControlPanel";
import {PaylineConfigPanel} from "./common/PaylineConfigPanel";
import {StateStore} from "./common/StateStore";
import {SYMBOLS, SYMBOL_LABELS, PAYLINES, paylineConfigs} from "./common/PaylineData";
import UIFactory = tsCore.UIFactory;
import BaseView = gameLib.BaseView;

/** 右侧控制面板宽（与 ControlPanel.PANEL_W 保持一致） */
const PANEL_W = 360;
/** 结果条高 */
const BAR_H = 40;
/** 网格外围留白（与 TestSlotView.PADDING 保持一致） */
const PADDING = 10;

/** 滚动模式中文标签（用于状态栏展示） */
const MODE_LABELS: Record<ScrollViewMode, string> = {
    strategy: '策略·匀速(SlotScrollModel)',
    native: '原生·匀速(SlotScrollModel)',
    tween: 'Tween·回弹(SlotScrollTweenModel)',
    tweenStrategy: 'Tween·策略(SlotScrollTweenModel)'
};

/**
 * Slot 滚动效果测试应用 — 主入口
 *
 * 继承 BaseView，整合游戏网格（BaseSlotView + SlotScrollModel 驱动）、
 * 控制面板和中奖规则弹窗。全部使用 FGUI + LayaAir API，不依赖原生 DOM。
 */
export class SlotTestApp extends BaseView {

    private _slotView!: TestSlotView;
    private _controlPanel!: ControlPanel;
    private _paylinePanel!: PaylineConfigPanel;
    /** 顶部预定中奖摘要标签 */
    private _lblPaylineSummary!: fgui.GTextField;
    // ---- 布局成员（RESIZE 重排需要） ----
    private _mainContainer!: fgui.GComponent;
    private _resultBar!: fgui.GComponent;
    private _btnSetup!: fgui.GButton;

    constructor() {
        super();
    }

    protected override onInit(): void {
        // 设置全屏（SCALE_FIXED_AUTO 下 stage 尺寸异步稳定，RESIZE 时经 _relayout 重算）
        this.setSize(GRoot.inst.width, GRoot.inst.height);

        this._mainContainer = UIFactory.createPanel({type: 'panel', width: this.width, height: this.height}, 0, 0);
        this.addChild(this._mainContainer);

        this._buildLayout();

        // ===== 中奖规则弹窗 =====
        this._paylinePanel = new PaylineConfigPanel();
        // 弹窗不需要手动 addChild，Window 会自动管理

        // 恢复上次持久化的用户选择（Tab/模式/策略/方向/Turbo/延迟/中奖线配置）
        this._restoreState();

        // 绑定事件
        this._bindEvents();

        // 窗口尺寸变化 → 防抖重排（FIXED_AUTO 下 stage 尺寸异步稳定 + 用户拖拽窗口）
        Laya.stage.on(Laya.Event.RESIZE, this, this._onStageResize);
    }

    /**
     * 计算布局几何（宽度自适应铺满 + 高度约束防溢出）
     */
    private _calcLayout(w: number, h: number): {panelX: number; listAvailW: number; cell: number; comboH: number; startY: number} {
        // 面板贴右侧：x = 宽 - 360 - 10
        const panelX = w - PANEL_W - 10;
        // 列表区可用宽 = 面板左缘 - 左边距 - 间隙
        const listAvailW = panelX - 10 - 10;
        // 格子受双约束：宽度方向 5 列铺满；高度方向保证 结果条+网格 组合不超过屏高（上下各留 10）
        const cell = Math.min(
            Math.floor((listAvailW - PADDING * 2) / 5),
            Math.floor((h - 20 - BAR_H - 8 - PADDING * 2) / 3)
        );
        const gridH = cell * 3 + PADDING * 2;
        const comboH = BAR_H + 8 + gridH;
        // 垂直居中（防止负值溢出）
        const startY = Math.max(10, Math.round((h - comboH) / 2));
        return {panelX, listAvailW, cell, comboH, startY};
    }

    /**
     * 构建一次性布局（结果条 + 游戏网格 + 控制面板）
     */
    private _buildLayout(): void {
        // ===== 布局数学 =====
        const {panelX, listAvailW, cell, startY} = this._calcLayout(this.width, this.height);
        // ===== 顶部结果条：预定中奖摘要 + 设置按钮 =====
        this._resultBar = UIFactory.createPanel({type: 'panel', width: listAvailW, height: BAR_H}, 0, 0);
        this._resultBar.x = 10;
        this._resultBar.y = startY;
        this._mainContainer.addChild(this._resultBar);
        this._resultBar.addChild(UIFactory.createGraph({
            type: 'graph', name: 'bg', width: listAvailW, height: BAR_H,
            lineSize: 1, lineColor: '#30475e', fillColor: '#16213e', cornerRadius: 6
        }));
        this._lblPaylineSummary = UIFactory.createText({
            type: 'text', text: '', fontSize: 14, color: '#e94560',
            width: listAvailW - 220, height: BAR_H, align: 'left', valign: 'middle'
        });
        this._lblPaylineSummary.x = 15;
        this._resultBar.addChild(this._lblPaylineSummary);

        this._btnSetup = UIFactory.createButton({
            type: 'button', name: 'btnSetupPaylines', width: 175, height: 30,
            elements: [
                {type: 'graph', x: 0, y: 0, width: 175, height: 30, fillColor: '#0f3460', cornerRadius: 4},
                {type: 'text', name: 'text', x: 0, y: 0, text: '⚙ 设置中奖结果', fontSize: 13, color: '#ffffff',
                 width: 175, height: 30, align: 'center', valign: 'middle'}
            ]
        });
        this._btnSetup.x = listAvailW - 175 - 12;
        this._btnSetup.y = 5;
        this._resultBar.addChild(this._btnSetup);
        this._btnSetup.on(Laya.Event.CLICK, this, () => {
            this._paylinePanel.openPanel();
        });
        this._refreshPaylineSummary();

        // ===== 左侧：游戏网格区域（BaseSlotView 两级 GList + SlotScrollModel 驱动） =====
        // 格子尺寸经构造参数传入（onInit 同步定型，不能事后补设）
        this._slotView = TestSlotView.create(cell);
        this._slotView.x = 10;
        this._slotView.y = startY + BAR_H + 8;
        this._mainContainer.addChild(this._slotView);

        // ===== 右侧：控制面板 =====
        this._controlPanel = createUI(ControlPanel)
        this._controlPanel.x = panelX;
        this._controlPanel.y = startY;
        this._mainContainer.addChild(this._controlPanel);
    }

    /**
     * 刷新顶部"预定中奖"摘要（paylineConfigs 变更时同步）
     */
    private _refreshPaylineSummary(): void {
        const lines = paylineConfigs.filter(c => c.enabled);
        if (lines.length === 0) {
            this._lblPaylineSummary.text = '预定中奖：未设置';
            return;
        }
        const parts = lines.map(cfg => {
            const line = PAYLINES.find(l => l.id === cfg.lineId);
            return `${cfg.lineId}:${line ? line.name : ''} ${SYMBOL_LABELS[cfg.symbol]}×${cfg.count}`;
        });
        const show = parts.slice(0, 3).join('  |  ');
        this._lblPaylineSummary.text =
            `预定中奖：${show}${parts.length > 3 ? ` 等${parts.length}条` : ''}`;
    }

    /**
     * 绑定所有事件
     */
    private _bindEvents(): void {
        // 控制面板回调
        this._controlPanel.onStartClick = () => this._startSpin();
        this._controlPanel.onStopClick = () => this._slamStop();
        this._controlPanel.onStrategyChange = (strategy) => {
            this._controlPanel.updateStatus(`策略: ${strategy}`);
            this._persist();
        };
        this._controlPanel.onDirectionChange = (dir) => {
            this._controlPanel.updateStatus(`方向: ${dir === 'up' ? '↑向上' : '↓向下'}`);
            this._persist();
        };
        this._controlPanel.onModeChange = (mode) => {
            this._slotView.setScrollMode(mode);
            this._controlPanel.updateStatus(`模式: ${MODE_LABELS[mode]}`);
            this._persist();
        };
        this._controlPanel.onTurboChange = (isTurbo) => {
            this._controlPanel.updateStatus(isTurbo ? 'Turbo 模式' : '普通模式');
            this._persist();
        };
        this._controlPanel.onDelayChange = (sec) => {
            this._slotView.resultDelaySec = sec;
            this._controlPanel.updateStatus(`出结果延迟: ${sec}秒`);
            this._persist();
        };

        // 中奖规则配置变更 → 刷新顶部摘要 + 持久化
        this._paylinePanel.onConfigChanged = () => {
            this._refreshPaylineSummary();
            this._persist();
        };

        // 网格视图回调（替换实例时同样适用）
        this._bindSlotView(this._slotView);
    }

    /**
     * 绑定网格视图回调（RESIZE 重建实例后重绑）
     */
    private _bindSlotView(sv: TestSlotView): void {
        // 本局实际开奖结果 → 顶部摘要展示（中了什么显示什么）
        sv.onResultReady = (wins) => {
            if (wins.length === 0) {
                this._lblPaylineSummary.text = '本局开奖：未中奖';
                return;
            }
            const parts = wins.map(w => {
                const line = PAYLINES.find(l => l.id === w.lineId);
                return `${w.lineId}:${line ? line.name : ''} ${SYMBOL_LABELS[w.symbol]}×${w.count}连`;
            });
            const show = parts.slice(0, 3).join('  |  ');
            this._lblPaylineSummary.text =
                `本局中奖：${show}${parts.length > 3 ? ` 等${parts.length}条` : ''}`;
        };

        sv.setOnAllComplete(() => {
            this._controlPanel.updateStatus('✓ 开奖完成');
            this._controlPanel.isTurbo = false;
        });
    }

    /**
     * 开始滚动
     */
    private _startSpin(): void {
        if (this._slotView.isSpinning) return;

        // 新一局开始：结果条恢复"预定中奖"摘要（上一局实际结果清除）
        this._refreshPaylineSummary();
        this._controlPanel.updateStatus(`⏳ 滚动中... ${this._slotView.resultDelaySec}秒后出结果`);
        this._slotView.startSpin(
            this._controlPanel.currentStrategy,
            this._controlPanel.currentDirection,
            this._controlPanel.isTurbo
        );
    }

    /**
     * 急停
     */
    private _slamStop(): void {
        this._slotView.slamStop();
        this._controlPanel.updateStatus('⏹ 已急停');
    }

    // ==================== RESIZE 自适应 ====================

    /** stage 尺寸变化 → 防抖重排 */
    private _onStageResize(): void {
        Laya.timer.clear(this, this._applyResize);
        Laya.timer.once(200, this, this._applyResize);
    }

    private _applyResize(): void {
        this._relayout();
    }

    /**
     * 依据当前 stage 尺寸重排全部区块（FIXED_AUTO 下 GRoot 跟随窗口）
     */
    private _relayout(): void {
        const w = GRoot.inst.width, h = GRoot.inst.height;
        if (w <= 0 || h <= 0 || (w === this.width && h === this.height)) return;
        this.setSize(w, h);
        this._mainContainer.setSize(w, h);

        // 重算布局数学（宽度铺满 + 高度约束防溢出）
        const {panelX, listAvailW, cell, startY} = this._calcLayout(w, h);

        // 结果条：尺寸 + 背景 + 内部元素
        this._resultBar.setSize(listAvailW, BAR_H);
        this._resultBar.x = 10;
        this._resultBar.y = startY;
        const barBg = this._resultBar.getChild('bg') as fgui.GGraph | null;
        if (barBg) {
            barBg.setSize(listAvailW, BAR_H);
            barBg.drawRect(1, '#30475e', '#16213e', [6, 6, 6, 6]);
        }
        this._lblPaylineSummary.width = listAvailW - 220;
        this._btnSetup.x = listAvailW - 175 - 12;

        // 网格与面板位置
        this._slotView.x = 10;
        this._slotView.y = startY + BAR_H + 8;
        this._controlPanel.x = panelX;
        this._controlPanel.y = startY;

        // 格子尺寸变化且空闲 → 重建网格视图（cellSize 构造定型，不能事后补设）
        if (cell !== this._slotView.cellSize && !this._slotView.isSpinning) {
            const sv = TestSlotView.create(cell);
            sv.x = 10;
            sv.y = startY + BAR_H + 8;
            // 用 addChildAt 保持原层序（addChild 会追加到末尾，使新网格压在控制面板之上，遮挡面板左侧标签）
            const idx = this._mainContainer.getChildIndex(this._slotView);
            this._mainContainer.addChildAt(sv, idx);
            this._bindSlotView(sv);
            // 同步当前模式与延迟到新实例
            sv.setScrollMode(this._controlPanel.currentMode);
            sv.resultDelaySec = this._controlPanel.currentDelay;
            const old = this._slotView;
            this._slotView = sv;
            old.dispose();
        }
    }

    // ==================== 状态持久化 ====================

    /**
     * 保存当前用户选择到 localStorage
     */
    private _persist(): void {
        const cp = this._controlPanel.getState();
        const state: SlotUiState = {
            tab: cp.tab,
            mode: cp.mode,
            strategy: cp.strategy,
            direction: cp.direction,
            turbo: cp.turbo,
            delay: cp.delay,
            tabModes: cp.tabModes,
            paylines: paylineConfigs.map(c => ({
                lineId: c.lineId, symbol: c.symbol, count: c.count, enabled: c.enabled
            }))
        };
        StateStore.save(state);
    }

    /**
     * 恢复上次持久化的用户选择
     */
    private _restoreState(): void {
        const st = StateStore.load();
        if (!st) return;
        // 中奖线配置覆写（保持模块级数组引用不变；空数组同样覆写，避免"删光后刷新又复活默认配置"）
        if (Array.isArray(st.paylines)) {
            paylineConfigs.length = 0;
            st.paylines.forEach(p => paylineConfigs.push({...p}));
        }
        this._controlPanel.applyState(st);
        this._slotView.setScrollMode(this._controlPanel.currentMode);
        this._slotView.resultDelaySec = this._controlPanel.currentDelay;
        this._refreshPaylineSummary();
        this._controlPanel.updateStatus(`已恢复上次设置`);
    }

    override dispose(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this._onStageResize);
        Laya.timer.clear(this, this._applyResize);
        if (this._slotView) this._slotView.dispose();
        if (this._controlPanel) this._controlPanel.dispose();
        if (this._paylinePanel) this._paylinePanel.dispose();
        super.dispose();
    }
}

tsCore.App.run({
    onEnd: () => {
        // 预加载全部符号图标后再构建 UI（渲染器经 Laya.loader.getRes 同步取纹理）
        Laya.loader.load(SYMBOLS, Laya.Handler.create(null, () => {
            Laya.stage.alignV = Laya.Stage.ALIGN_TOP
            Laya.stage.alignH = Laya.Stage.ALIGN_LEFT
            Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL
            Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO
            Laya.stage.bgColor = '#666666';
            const panel = createUI(SlotTestApp)
            GRoot.inst.addChild(panel);
        }), null, Laya.Loader.IMAGE);
    }
}, {
    laya: {
        width: 1280,
        height: 720
    }
})