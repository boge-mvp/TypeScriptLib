import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;
import BaseView = gameLib.BaseView;
import UIFactory = tsCore.UIFactory;
import {ScrollViewMode} from "./SlotTestTypes";
import {STRATEGY_LIST, STRATEGY_DESCRIPTIONS} from "../strategy/StrategyCenter";

/** 面板宽（右侧边栏，加宽版） */
const PANEL_W = 360;
/** 面板内容总高（紧凑排布，消除底部大空白） */
const PANEL_H = 590;

/**
 * 控制面板视图
 *
 * 使用 UIFactory 纯代码工厂构建控制界面。
 * 注意：无皮肤直接 new 的 GLabel/GButton 不装配渲染子对象（text 无处显示），
 * 必须通过工厂创建带 elements 子元件的可用组件。
 */
export class ControlPanel extends BaseView {

    /** 面板容器（避免与 BaseView._container: Sprite 冲突） */
    private _panelContainer!: GComponent;

    // 策略按钮
    private _strategyButtons: GButton[] = [];
    // 方向按钮
    private _btnUp!: GButton;
    private _btnDown!: GButton;
    // TabBar
    private _tabStrategy!: GButton;
    private _tabNative!: GButton;
    // Tab 内容块（互斥显示）
    private _strategyBlock!: GComponent;
    private _nativeBlock!: GComponent;
    // 滚动模式按钮（分属两个 Tab 块）
    private _modeButtonsStrategy: GButton[] = [];
    private _modeButtonsNative: GButton[] = [];
    /** 各 Tab 记忆的滚动模式 */
    private _tabModes: {strategy: ScrollViewMode, native: ScrollViewMode} = {strategy: 'strategy', native: 'native'};
    // 开始/急停按钮
    private _btnStart!: GButton;
    private _btnStop!: GButton;
    // Turbo 复选框（用 GButton 模拟 toggle）
    private _chkTurbo!: GButton;
    // 出结果延迟档位按钮（3/5/10 秒）
    private _delayButtons: GButton[] = [];
    // 状态栏标签
    private _lblStatus!: GTextField;
    // 策略描述标签
    private _lblStrategyDesc!: GTextField;

    /** 当前选中的策略 */
    public currentStrategy: string = 'backOut';
    /** 当前方向 */
    public currentDirection: string = 'up';
    /** 当前滚动驱动模式 */
    public currentMode: ScrollViewMode = 'strategy';
    /** 是否 Turbo 模式 */
    public isTurbo: boolean = false;
    /** 出结果延迟（秒） */
    public currentDelay: number = 10;

    /** 回调接口 */
    public onStartClick: (() => void) | undefined;
    public onStopClick: (() => void) | undefined;
    public onStrategyChange: ((strategy: string) => void) | undefined;
    public onDirectionChange: ((direction: string) => void) | undefined;
    public onModeChange: ((mode: ScrollViewMode) => void) | undefined;
    public onTurboChange: ((isTurbo: boolean) => void) | undefined;
    public onDelayChange: ((sec: number) => void) | undefined;

    constructor() {
        super();
    }

    protected override onInit(): void {
        this._createUI();
        this._bindEvents();
    }

    private _createUI(): void {
        // 组件本体尺寸必须显式设置：Laya 递归命中测试要求每级容器自身通过边界测试（0×0 会中断下钻导致子控件不可点击）
        this.setSize(PANEL_W, PANEL_H);
        this._panelContainer = UIFactory.createPanel({type: 'panel', width: PANEL_W, height: PANEL_H}, 0, 0);
        this.addChild(this._panelContainer);

        // 面板背景
        this._panelContainer.addChild(UIFactory.createGraph({
            type: 'graph', name: 'bg', width: PANEL_W, height: PANEL_H,
            lineSize: 1, lineColor: '#30475e', fillColor: '#1a1a2e', cornerRadius: 8
        }));

        let y = 10;

        // 标题
        this._panelContainer.addChild(this._createLabel('Slot 滚动效果测试', 15, y, 18, '#e94560', 330));
        y += 35;

        // ===== TabBar：策略滚动 / 原生滚动 =====
        this._tabStrategy = this._createButton('tabStrategy', '策略滚动', 10, y, 165, 30, '#0f3460', 14);
        this._panelContainer.addChild(this._tabStrategy);

        this._tabNative = this._createButton('tabNative', '原生滚动', 185, y, 165, 30, '#0f3460', 14);
        this._panelContainer.addChild(this._tabNative);
        y += 42;

        // ===== 策略块（有 Strategy 参与）=====
        this._strategyBlock = UIFactory.createPanel({type: 'panel', width: 340, height: 220}, 0, 0);
        this._strategyBlock.y = y;
        this._panelContainer.addChild(this._strategyBlock);

        let sy = 0;
        this._strategyBlock.addChild(this._createLabel('滚动模式：', 10, sy, 14, '#cccccc', 320));
        sy += 25;
        [{key: 'strategy', name: '匀速·策略'}, {key: 'tweenStrategy', name: '纯Tween·策略'}].forEach((m, idx) => {
            const btn = this._createButton(`mode_${m.key}`, m.name, 10 + idx * 165, sy, 160, 28, '#30475e', 12);
            this._strategyBlock.addChild(btn);
            this._modeButtonsStrategy.push(btn);
        });
        sy += 38;

        this._strategyBlock.addChild(this._createLabel('滚动策略：', 10, sy, 14, '#cccccc', 320));
        sy += 25;

        STRATEGY_LIST.forEach((s, idx) => {
            const btn = this._createButton(`strategy_${s.key}`, s.name,
                10 + (idx % 3) * 110, sy + Math.floor(idx / 3) * 36, 104, 31, '#30475e', 13);
            this._strategyBlock.addChild(btn);
            this._strategyButtons.push(btn);
        });
        // 3 行按钮（2*36 + 31 = 103px）+ 行间距
        sy += 115;

        // 策略描述（公共区移入策略块）
        this._lblStrategyDesc = this._createLabel('', 10, sy, 12, '#888888', 320);
        this._strategyBlock.addChild(this._lblStrategyDesc);

        // ===== 原生块（无 Strategy 参与）=====
        this._nativeBlock = UIFactory.createPanel({type: 'panel', width: 340, height: 220}, 0, 0);
        this._nativeBlock.y = y;
        this._nativeBlock.visible = false;
        this._panelContainer.addChild(this._nativeBlock);

        let ny = 0;
        this._nativeBlock.addChild(this._createLabel('滚动模式：', 10, ny, 14, '#cccccc', 320));
        ny += 25;
        [{key: 'native', name: '匀速·直线'}, {key: 'tween', name: '纯Tween·回弹'}].forEach((m, idx) => {
            const btn = this._createButton(`mode_${m.key}`, m.name, 10 + idx * 165, ny, 160, 28, '#30475e', 12);
            this._nativeBlock.addChild(btn);
            this._modeButtonsNative.push(btn);
        });
        ny += 48;
        this._nativeBlock.addChild(this._createLabel(
            '无策略参与：各列按 getDuration/getDelay 错开时长，以直线或回弹缓动落定。',
            10, ny, 12, '#888888', 320));

        // 块区预留固定高度，公共区从统一 y 起
        y += 230;

        // 方向选择
        this._panelContainer.addChild(this._createLabel('滚动方向：', 10, y, 14, '#cccccc', 320));
        y += 25;

        this._btnUp = this._createButton('btnUp', '↑ 向上', 10, y, 160, 32, '#30475e');
        this._panelContainer.addChild(this._btnUp);

        this._btnDown = this._createButton('btnDown', '↓ 向下', 185, y, 160, 32, '#30475e');
        this._panelContainer.addChild(this._btnDown);
        y += 44;

        // 开始/急停按钮
        this._btnStart = this._createButton('btnStart', '▶ 开始滚动', 10, y, 160, 40, '#e94560', 15);
        this._panelContainer.addChild(this._btnStart);

        this._btnStop = this._createButton('btnStop', '⏹ 急停', 185, y, 160, 40, '#0f3460', 15);
        this._panelContainer.addChild(this._btnStop);
        y += 50;

        // Turbo 开关
        this._chkTurbo = this._createButton('chkTurbo', '☐ Turbo 快速模式', 10, y, 200, 32, '#30475e', 13);
        this._panelContainer.addChild(this._chkTurbo);
        y += 42;

        // 出结果延迟（点击开始后轮子匀速待机至此才落定）
        this._panelContainer.addChild(this._createLabel('出结果延迟：', 10, y + 4, 13, '#cccccc', 90));
        [{sec: 3, name: '3秒'}, {sec: 5, name: '5秒'}, {sec: 10, name: '10秒'}].forEach((d, idx) => {
            const btn = this._createButton(`delay_${d.sec}`, d.name, 105 + idx * 85, y, 80, 28, '#30475e', 12);
            this._panelContainer.addChild(btn);
            this._delayButtons.push(btn);
        });
        y += 40;

        // 状态栏
        this._lblStatus = this._createLabel('状态：就绪', 10, y, 13, '#aaaaaa', 330);
        this._panelContainer.addChild(this._lblStatus);

        // 初始视觉状态
        this._updateStrategyDesc();
        this._refreshStrategyVisual();
        this._refreshDirectionVisual();
        this._refreshModeVisual();
        this._refreshTabVisual();
        this._refreshDelayVisual();
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

    /**
     * 更新按钮文本内容
     */
    private _setButtonText(btn: GButton, text: string): void {
        const label = btn.getChild('text') as GTextField | null;
        if (label) label.text = text;
    }

    private _bindEvents(): void {
        // 策略按钮
        this._strategyButtons.forEach(btn => {
            btn.on(Laya.Event.CLICK, this, () => {
                this._selectStrategy(btn.name.replace('strategy_', ''));
                if (this.onStrategyChange) this.onStrategyChange(this.currentStrategy);
            });
        });

        // 方向按钮
        this._btnUp.on(Laya.Event.CLICK, this, () => {
            this.currentDirection = 'up';
            this._refreshDirectionVisual();
            if (this.onDirectionChange) this.onDirectionChange('up');
        });
        this._btnDown.on(Laya.Event.CLICK, this, () => {
            this.currentDirection = 'down';
            this._refreshDirectionVisual();
            if (this.onDirectionChange) this.onDirectionChange('down');
        });

        // 滚动模式按钮（两个 Tab 块内）
        [...this._modeButtonsStrategy, ...this._modeButtonsNative].forEach(btn => {
            btn.on(Laya.Event.CLICK, this, () => {
                const mode = btn.name.replace('mode_', '') as ScrollViewMode;
                if (this.currentMode === mode) return;
                this.currentMode = mode;
                // 记忆到所属 Tab
                if (mode === 'strategy' || mode === 'tweenStrategy') this._tabModes.strategy = mode;
                else this._tabModes.native = mode;
                this._refreshModeVisual();
                if (this.onModeChange) this.onModeChange(mode);
            });
        });

        // Tab 切换
        this._tabStrategy.on(Laya.Event.CLICK, this, () => this._selectTab('strategy'));
        this._tabNative.on(Laya.Event.CLICK, this, () => this._selectTab('native'));

        // 开始按钮
        this._btnStart.on(Laya.Event.CLICK, this, () => {
            if (this.onStartClick) this.onStartClick();
        });

        // 急停按钮
        this._btnStop.on(Laya.Event.CLICK, this, () => {
            if (this.onStopClick) this.onStopClick();
        });

        // Turbo 切换
        this._chkTurbo.on(Laya.Event.CLICK, this, () => {
            this.isTurbo = !this.isTurbo;
            this._setButtonText(this._chkTurbo, this.isTurbo ? '☑ Turbo 快速模式' : '☐ Turbo 快速模式');
            if (this.onTurboChange) this.onTurboChange(this.isTurbo);
        });

        // 出结果延迟档位
        this._delayButtons.forEach(btn => {
            btn.on(Laya.Event.CLICK, this, () => {
                const sec = parseInt(btn.name.replace('delay_', ''));
                if (this.currentDelay === sec) return;
                this.currentDelay = sec;
                this._refreshDelayVisual();
                if (this.onDelayChange) this.onDelayChange(sec);
            });
        });
    }

    private _selectStrategy(key: string): void {
        this.currentStrategy = key;
        this._refreshStrategyVisual();
        this._updateStrategyDesc();
    }

    /** 用文本颜色标记选中策略 */
    private _refreshStrategyVisual(): void {
        this._strategyButtons.forEach(btn => {
            const btnKey = btn.name.replace('strategy_', '');
            const label = btn.getChild('text') as GTextField | null;
            if (label) label.color = (btnKey === this.currentStrategy) ? '#ffc107' : '#ffffff';
        });
    }

    /** 用文本颜色标记选中方向 */
    private _refreshDirectionVisual(): void {
        const upLabel = this._btnUp.getChild('text') as GTextField | null;
        const downLabel = this._btnDown.getChild('text') as GTextField | null;
        if (upLabel) upLabel.color = this.currentDirection === 'up' ? '#ffc107' : '#ffffff';
        if (downLabel) downLabel.color = this.currentDirection === 'down' ? '#ffc107' : '#ffffff';
    }

    /** 用文本颜色标记选中滚动模式 */
    private _refreshModeVisual(): void {
        [...this._modeButtonsStrategy, ...this._modeButtonsNative].forEach(btn => {
            const btnKey = btn.name.replace('mode_', '') as ScrollViewMode;
            const label = btn.getChild('text') as GTextField | null;
            if (label) label.color = (btnKey === this.currentMode) ? '#ffc107' : '#ffffff';
        });
    }

    /**
     * 切换 Tab：内容块互斥显示 + 联动切换到该 Tab 记忆的滚动模式
     */
    private _selectTab(tab: 'strategy' | 'native'): void {
        const isStrategyTab = tab === 'strategy';
        this._strategyBlock.visible = isStrategyTab;
        this._nativeBlock.visible = !isStrategyTab;
        this._refreshTabVisual();

        const mode = isStrategyTab ? this._tabModes.strategy : this._tabModes.native;
        if (this.currentMode !== mode) {
            this.currentMode = mode;
            this._refreshModeVisual();
            if (this.onModeChange) this.onModeChange(mode);
        }
    }

    /** Tab 金色文字选中态 */
    private _refreshTabVisual(): void {
        const sLab = this._tabStrategy.getChild('text') as GTextField | null;
        const nLab = this._tabNative.getChild('text') as GTextField | null;
        if (sLab) sLab.color = this._strategyBlock.visible ? '#ffc107' : '#ffffff';
        if (nLab) nLab.color = this._strategyBlock.visible ? '#ffffff' : '#ffc107';
    }

    /** 出结果延迟档位金色文字选中态 */
    private _refreshDelayVisual(): void {
        this._delayButtons.forEach(btn => {
            const sec = parseInt(btn.name.replace('delay_', ''));
            const label = btn.getChild('text') as GTextField | null;
            if (label) label.color = (sec === this.currentDelay) ? '#ffc107' : '#ffffff';
        });
    }

    /**
     * 导出当前状态快照（供持久化）
     */
    public getState(): {tab: 'strategy' | 'native'; mode: ScrollViewMode; strategy: string; direction: string;
        turbo: boolean; delay: number; tabModes: {strategy: ScrollViewMode; native: ScrollViewMode}} {
        return {
            tab: this._strategyBlock.visible ? 'strategy' : 'native',
            mode: this.currentMode,
            strategy: this.currentStrategy,
            direction: this.currentDirection,
            turbo: this.isTurbo,
            delay: this.currentDelay,
            tabModes: {strategy: this._tabModes.strategy, native: this._tabModes.native}
        };
    }

    /**
     * 恢复状态快照（刷新后还原用户上次选择；不触发 onModeChange 等回调，由外部统一应用）
     */
    public applyState(st: {tab?: 'strategy' | 'native'; mode?: ScrollViewMode; strategy?: string; direction?: string;
        turbo?: boolean; delay?: number; tabModes?: {strategy: ScrollViewMode; native: ScrollViewMode}}): void {
        if (st.tabModes) {
            this._tabModes.strategy = st.tabModes.strategy;
            this._tabModes.native = st.tabModes.native;
        }
        if (st.strategy) this.currentStrategy = st.strategy;
        if (st.direction) this.currentDirection = st.direction;
        if (st.mode) this.currentMode = st.mode;
        if (st.turbo !== undefined) {
            this.isTurbo = st.turbo;
            this._setButtonText(this._chkTurbo, this.isTurbo ? '☑ Turbo 快速模式' : '☐ Turbo 快速模式');
        }
        if (st.delay) this.currentDelay = st.delay;
        // Tab 块互斥（不经 _selectTab，避免触发 onModeChange）
        const isStrategyTab = (st.tab ?? 'strategy') === 'strategy';
        this._strategyBlock.visible = isStrategyTab;
        this._nativeBlock.visible = !isStrategyTab;
        this._refreshStrategyVisual();
        this._refreshDirectionVisual();
        this._refreshModeVisual();
        this._refreshTabVisual();
        this._refreshDelayVisual();
        this._updateStrategyDesc();
    }

    private _updateStrategyDesc(): void {
        const info = STRATEGY_DESCRIPTIONS[this.currentStrategy];
        if (info) {
            this._lblStrategyDesc.text = `${info.name}\n${info.desc}`;
        }
    }

    /**
     * 更新状态文本
     */
    updateStatus(text: string): void {
        this._lblStatus.text = `状态：${text}`;
    }

    override dispose(): void {
        super.dispose();
    }
}
