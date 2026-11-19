import GComponent = fgui.GComponent;
import GGraph = fgui.GGraph;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import UIFactory = tsCore.UIFactory;

// 顶层导入（TypeScript 不允许在方法内部使用 import）
import {SYMBOLS, SYMBOL_LABELS, PAYLINES, PAYLINE_COLORS, paylineConfigs} from "../common/PaylineData";
import {LineGridRenderer} from "../common/LineGridRenderer";

/**
 * 中奖规则配置弹窗
 *
 * 使用 FGUI Window 作为弹窗基类。
 * 注意：无皮肤直接 new 的 GLabel/GButton 不装配渲染子对象（text 无处显示），
 * 必须通过工厂创建带 elements 子元件的可用组件。
 */
export class PaylineConfigPanel extends fgui.Window {

    // ===== 主弹窗组件 =====
    private _mainContent!: GComponent;
    private _paylineListContainer!: GComponent;
    private _btnAddPayline!: GButton;
    private _btnCloseMain!: GButton;

    // ===== 选线弹窗组件 =====
    private _lineSelectContent!: GComponent;
    private _lineGridContainer!: GComponent;
    private _lineConfigArea!: GComponent;
    private _modalSymbolBtns!: GComponent;
    private _modalCountBtns!: GComponent;
    private _btnConfirmAdd!: GButton;
    private _btnCloseSelect!: GButton;

    /** 当前选中的线 ID */
    private _selectedLineId: number = 0;
    /** 当前选中的符号索引 */
    private _selectedSymbol: number = 5; // 默认 💎
    /** 当前选中的连数 */
    private _selectedCount: number = 5;

    /** 配置变更回调 */
    public onConfigChanged: (() => void) | undefined;

    constructor() {
        super();
    }

    protected override onInit(): void {
        // Window 的 contentPane 需手动创建并赋值（赋值时自动 addChild 并同步窗口尺寸）
        const pane = UIFactory.createPanel({type: 'panel', width: 890, height: 590}, 0, 0);
        pane.addChild(UIFactory.createGraph({
            type: 'graph', name: 'bg', width: 890, height: 590,
            lineSize: 1, lineColor: '#30475e', fillColor: '#16213e', cornerRadius: 8
        }));
        this.contentPane = pane;

        this._createMainContent();
        this._createLineSelectContent();
        this._bindEvents();
    }

    /**
     * 创建主弹窗内容
     */
    private _createMainContent(): void {
        const w = 890, h = 590;
        this._mainContent = UIFactory.createPanel({type: 'panel', width: w, height: h}, 0, 0);
        this.contentPane.addChild(this._mainContent);

        let y = 10;

        // 标题
        this._mainContent.addChild(this._createLabel('中奖规则设置', 15, y, 18, '#e94560', 300));

        // 关闭按钮
        this._btnCloseMain = this._createButton('btnCloseMain', '✕', w - 50, y, 30, 30, '#c62828', 14);
        this._mainContent.addChild(this._btnCloseMain);
        y += 40;

        // 已配置列表容器
        this._mainContent.addChild(this._createLabel('已配置的中奖线：', 15, y, 14, '#cccccc', 300));
        y += 25;

        this._paylineListContainer = UIFactory.createPanel({type: 'panel', width: w - 30, height: 440}, 0, 0);
        this._paylineListContainer.x = 15;
        this._paylineListContainer.y = y;
        const listBg = UIFactory.createGraph({
            type: 'graph', width: w - 30, height: 440,
            lineSize: 1, lineColor: '#30475e', fillColor: '#0d1117'
        });
        this._paylineListContainer.addChild(listBg);
        this._mainContent.addChild(this._paylineListContainer);

        // 底部按钮
        const btnY = 535;
        this._btnAddPayline = this._createButton('btnAddPayline', '+ 添加中奖线', 15, btnY, 150, 36, '#0f3460', 14);
        this._mainContent.addChild(this._btnAddPayline);

        const btnClose = this._createButton('btnClose', '关闭', 180, btnY, 80, 36, '#30475e', 14);
        this._mainContent.addChild(btnClose);
        btnClose.on(Laya.Event.CLICK, this, () => this.hide());
    }

    /**
     * 创建选线弹窗内容
     */
    private _createLineSelectContent(): void {
        this._lineSelectContent = UIFactory.createPanel({type: 'panel', name: 'lineSelectContent', width: 890, height: 590}, 0, 0);
        this._lineSelectContent.visible = false;
        this.contentPane.addChild(this._lineSelectContent);

        let y = 10;

        // 标题
        this._lineSelectContent.addChild(this._createLabel('选择中奖线', 15, y, 16, '#4fc3f7', 300));

        // 关闭按钮
        this._btnCloseSelect = this._createButton('btnCloseSelect', '✕', 840, y, 28, 28, '#c62828', 13);
        this._lineSelectContent.addChild(this._btnCloseSelect);
        y += 40;

        // 线网格容器（5 列 × 4 行）
        this._lineGridContainer = UIFactory.createPanel({type: 'panel', width: 860, height: 430}, 0, 0);
        this._lineGridContainer.x = 15;
        this._lineGridContainer.y = y;
        const gridBg = UIFactory.createGraph({
            type: 'graph', width: 860, height: 430,
            lineSize: 1, lineColor: '#30475e', fillColor: '#0d1117'
        });
        this._lineGridContainer.addChild(gridBg);
        this._lineSelectContent.addChild(this._lineGridContainer);
        y += 445;

        // 配置区（初始隐藏，两行紧凑布局）
        this._lineConfigArea = UIFactory.createPanel({type: 'panel', width: 860, height: 90}, 0, 0);
        this._lineConfigArea.x = 15;
        this._lineConfigArea.y = y;
        this._lineConfigArea.visible = false;
        const configBg = UIFactory.createGraph({
            type: 'graph', width: 860, height: 90,
            lineSize: 1, lineColor: '#30475e', fillColor: '#16213e'
        });
        this._lineConfigArea.addChild(configBg);
        this._lineSelectContent.addChild(this._lineConfigArea);

        // 行1：中奖符号
        this._lineConfigArea.addChild(this._createLabel('中奖符号:', 10, 16, 13, '#cccccc', 80));
        this._modalSymbolBtns = UIFactory.createPanel({type: 'panel', width: 736, height: 30}, 0, 0);
        this._modalSymbolBtns.x = 100;
        this._modalSymbolBtns.y = 8;
        this._lineConfigArea.addChild(this._modalSymbolBtns);

        SYMBOLS.forEach((sym, idx) => {
            const btn = this._createIconButton(`sym_${idx}`, idx, idx * 60, 0, 56, 28, '#30475e');
            this._modalSymbolBtns.addChild(btn);
            btn.on(Laya.Event.CLICK, this, () => {
                this._selectSymbol(idx);
            });
        });

        // 行2：连数 + 确认
        this._lineConfigArea.addChild(this._createLabel('连数:', 10, 56, 13, '#cccccc', 80));
        this._modalCountBtns = UIFactory.createPanel({type: 'panel', width: 200, height: 32}, 0, 0);
        this._modalCountBtns.x = 100;
        this._modalCountBtns.y = 50;
        this._lineConfigArea.addChild(this._modalCountBtns);

        [3, 4, 5].forEach((cnt, idx) => {
            const btn = this._createButton(`count_${cnt}`, `${cnt}连`, idx * 65, 0, 60, 28, '#30475e', 13);
            this._modalCountBtns.addChild(btn);
            btn.on(Laya.Event.CLICK, this, () => {
                this._selectCount(cnt);
            });
        });

        // 确认添加按钮（与连数同行）
        this._btnConfirmAdd = this._createButton('btnConfirmAdd', '✓ 确认添加', 400, 48, 120, 34, '#2e7d32', 14);
        this._lineConfigArea.addChild(this._btnConfirmAdd);
    }

    /**
     * 创建纯代码文本标签
     */
    private _createLabel(text: string, x: number, y: number, fontSize: number, color: string, width: number): GTextField {
        const label = UIFactory.createText({
            type: 'text', text, fontSize, color,
            width, height: 0, align: 'left', valign: 'middle'
        });
        label.x = x;
        label.y = y;
        return label;
    }

    /**
     * 创建带背景与文本子元件的纯代码按钮
     */
    private _createButton(name: string, text: string, x: number, y: number,
                          w: number, h: number, bgColor: string, fontSize: number = 14): GButton {
        const btn = UIFactory.createButton({
            type: 'button', name, width: w, height: h,
            elements: [
                {type: 'graph', x: 0, y: 0, width: w, height: h, fillColor: bgColor, cornerRadius: 4},
                {
                    type: 'text', name: 'text', x: 0, y: 0, text, fontSize, color: '#ffffff',
                    width: w, height: h, align: 'center', valign: 'middle'
                }
            ]
        });
        btn.x = x;
        btn.y = y;
        return btn;
    }

    /** 图标按钮：背景色块 + 等比符号图标（无文字，选中态经 _refreshGroupSelection 切背景色） */
    private _createIconButton(name: string, symbolIdx: number, x: number, y: number,
                              w: number, h: number, bgColor: string): GButton {
        const btn = UIFactory.createButton({
            type: 'button', name, width: w, height: h,
            elements: [
                {type: 'graph', x: 0, y: 0, width: w, height: h, fillColor: bgColor, cornerRadius: 4}
            ]
        });
        btn.x = x;
        btn.y = y;
        const icon = UIFactory.createGraph({type: 'graph', width: w, height: h});
        btn.addChild(icon);
        const tex = Laya.loader.getRes(SYMBOLS[symbolIdx]) as Laya.Texture;
        const sprite = icon.displayObject as Laya.Sprite;
        if (tex && sprite && sprite.graphics) {
            const s = (h * 0.78) / Math.max(tex.width, tex.height);
            const iw = tex.width * s;
            const ih = tex.height * s;
            sprite.graphics.drawTexture(tex, (w - iw) / 2, (h - ih) / 2, iw, ih);
        }
        return btn;
    }

    private _bindEvents(): void {
        // 主弹窗关闭
        this._btnCloseMain.on(Laya.Event.CLICK, this, () => this.hide());

        // 打开选线弹窗
        this._btnAddPayline.on(Laya.Event.CLICK, this, () => this.showLineSelect());

        // 选线弹窗关闭
        this._btnCloseSelect.on(Laya.Event.CLICK, this, () => this.hideLineSelect());

        // 确认添加
        this._btnConfirmAdd.on(Laya.Event.CLICK, this, () => this._confirmAddPayline());
    }

    /**
     * 显示主弹窗（覆盖 Window.show，避免递归）
     *
     * 时序注意：fgui.Window 的 onInit（contentPane 装配）在 show() →
     * GRoot.showWindow → addChild 链路中才首次触发，
     * 因此必须先 show 再渲染列表，否则首次打开时
     * _paylineListContainer 尚未创建会抛错中断、窗口永不出现。
     */
    openPanel(): void {
        super.show();
        // 纯代码 Window 无编辑器坐标，show 后居中于根容器
        this.centerOn(fgui.GRoot.inst, true);
        if (this.contentPane && this._paylineListContainer) {
            this._renderPaylineConfigList();
        } else {
            // 兜底：若 onInit 延后一帧，下一帧再渲染
            Laya.timer.frameOnce(1, this, () => this._renderPaylineConfigList());
        }
    }

    /**
     * 显示选线弹窗（与主页互斥显示，消除标题/关闭按钮重影）
     */
    showLineSelect(): void {
        this._mainContent.visible = false;
        this._lineSelectContent.visible = true;
        this._lineConfigArea.visible = false;
        this._renderLineGrids();
    }

    /**
     * 隐藏选线弹窗（恢复主页）
     */
    hideLineSelect(): void {
        this._lineSelectContent.visible = false;
        this._mainContent.visible = true;
    }

    /**
     * 渲染 20 条线的图形化网格
     */
    private _renderLineGrids(): void {
        this._lineGridContainer.removeChildren();

        // 5 列 × 4 行网格定位（格 160×95 间距 15）：
        // 注意必须显式设置 x/y，否则全部子项堆叠在原点只剩最上层可见
        const COLS = 5, CELL_W = 160, CELL_H = 95, GAP = 15;
        PAYLINES.forEach((line, i) => {
            const item = UIFactory.createPanel({type: 'panel', name: `line_${line.id}`, width: CELL_W, height: CELL_H}, 0, 0);
            item.x = (i % COLS) * (CELL_W + GAP);
            item.y = Math.floor(i / COLS) * (CELL_H + GAP);

            const color = PAYLINE_COLORS[line.id - 1];
            LineGridRenderer.renderLinePreview(line, item, color, 26);
            item.on(Laya.Event.CLICK, this, () => {
                this._selectLine(line.id);
            });
            this._lineGridContainer.addChild(item);
        });
    }

    /**
     * 选中一条线
     */
    private _selectLine(lineId: number): void {
        this._selectedLineId = lineId;
        this._lineConfigArea.visible = true;
    }

    /**
     * 选择符号
     */
    private _selectSymbol(idx: number): void {
        this._selectedSymbol = idx;
        this._refreshGroupSelection(this._modalSymbolBtns, 'sym_', idx);
    }

    /**
     * 选择连数
     */
    private _selectCount(cnt: number): void {
        this._selectedCount = cnt;
        this._refreshGroupSelection(this._modalCountBtns, 'count_', cnt);
    }

    /** 用文本颜色/背景色标记组内选中项（图标按钮无 text 子件，以背景色切换标记） */
    private _refreshGroupSelection(group: GComponent, prefix: string, selectedValue: number): void {
        for (let i = 0; i < group.numChildren; i++) {
            const btn = group.getChildAt(i) as GButton;
            if (!btn) continue;
            const value = parseInt(btn.name.replace(prefix, ''));
            const selected = value === selectedValue;
            const label = btn.getChild('text') as GTextField | null;
            if (label) label.color = selected ? '#ffc107' : '#ffffff';
            const bgG = btn.getChildAt(0) as GGraph;
            if (bgG && bgG instanceof GGraph) bgG.drawRect(0, '#00000000', selected ? '#ffc107' : '#30475e');
        }
    }

    /**
     * 确认添加/更新中奖线配置
     */
    private _confirmAddPayline(): void {
        if (!this._selectedLineId) return;

        const existingIdx = paylineConfigs.findIndex(c => c.lineId === this._selectedLineId);
        const config = {
            lineId: this._selectedLineId,
            symbol: this._selectedSymbol,
            count: this._selectedCount,
            enabled: true
        };

        if (existingIdx >= 0) {
            paylineConfigs[existingIdx] = config;
        } else {
            paylineConfigs.push(config);
        }

        this.hideLineSelect();
        this._renderPaylineConfigList();

        if (this.onConfigChanged) {
            this.onConfigChanged();
        }
    }

    /**
     * 渲染已配置列表
     */
    private _renderPaylineConfigList(): void {
        this._paylineListContainer.removeChildren();

        if (paylineConfigs.length === 0) {
            this._paylineListContainer.addChild(
                this._createLabel('尚未配置中奖线，点击下方「+ 添加中奖线」开始', 10, 10, 13, '#888888', 500));
            return;
        }

        let y = 5;
        paylineConfigs.forEach(config => {
            const line = PAYLINES.find(l => l.id === config.lineId);
            if (!line) return;
            const color = PAYLINE_COLORS[config.lineId - 1];

            // 列表项（宽 615 行高 50，元素分区排布：预览 | 信息 | 开关 | 删除）
            const item = UIFactory.createPanel({type: 'panel', width: 615, height: 50}, 0, 0);
            item.x = 10;
            item.y = y;

            // 小网格预览
            const preview = UIFactory.createPanel({type: 'panel', width: 70, height: 42}, 0, 0);
            preview.y = 4;
            LineGridRenderer.renderLinePreview(line, preview, color, 12);
            item.addChild(preview);

            // 信息文本
            const info = this._createLabel(
                `${line.id}:${line.name}\n${SYMBOL_LABELS[config.symbol]} × ${config.count}连`, 85, 4, 12, '#cccccc', 300);
            item.addChild(info);

            // 启用开关（用 GButton 模拟 toggle）
            const toggle = this._createButton(`toggle_${config.lineId}`, config.enabled ? 'ON' : 'OFF',
                600, 11, 55, 28, config.enabled ? '#2e7d32' : '#616161', 12);
            item.addChild(toggle);
            toggle.on(Laya.Event.CLICK, this, () => {
                this._togglePayline(config.lineId);
            });

            // 删除按钮
            const removeBtn = this._createButton(`remove_${config.lineId}`, '✕', 700, 11, 30, 28, '#c62828', 12);
            item.addChild(removeBtn);
            removeBtn.on(Laya.Event.CLICK, this, () => {
                this._removePayline(config.lineId);
            });

            this._paylineListContainer.addChild(item);
            y += 56;
        });
    }

    /**
     * 切换启用状态
     */
    private _togglePayline(lineId: number): void {
        const config = paylineConfigs.find(c => c.lineId === lineId);
        if (config) {
            config.enabled = !config.enabled;
            this._renderPaylineConfigList();
            if (this.onConfigChanged) this.onConfigChanged();
        }
    }

    /**
     * 删除中奖线配置
     */
    private _removePayline(lineId: number): void {
        const idx = paylineConfigs.findIndex(c => c.lineId === lineId);
        if (idx >= 0) {
            paylineConfigs.splice(idx, 1);
            this._renderPaylineConfigList();
            if (this.onConfigChanged) this.onConfigChanged();
        }
    }

    override dispose(): void {
        super.dispose();
    }
}
