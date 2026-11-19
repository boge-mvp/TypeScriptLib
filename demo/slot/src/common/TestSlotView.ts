import GComponent = fgui.GComponent;
import GGraph = fgui.GGraph;
import GList = fgui.GList;
import Handler = Laya.Handler;
import PureList = tsCore.PureList;
import UIFactory = tsCore.UIFactory;
import BaseSlotView = gameLib.BaseSlotView;
import {ScrollModel} from "../scroll/ScrollModel";
import {ScrollTweenModel} from "../scroll/ScrollTweenModel";
import {parseStrategyType, STRATEGY_DEFAULT_CONFIG} from "../strategy/StrategyCenter";
import {ScrollViewMode, WinResult} from "./SlotTestTypes";
import {DemoGameData} from "./DemoGameData";
import {LineGridRenderer} from "./LineGridRenderer";
import {SYMBOLS, VISIBLE_ROWS, REEL_COUNT,
        PAYLINES, PAYLINE_COLORS, paylineConfigs} from "../common/PaylineData";

/** 格子默认边长（正方形）；可通过 cellSize 属性动态覆盖以自适应布局 */
const DEFAULT_CELL = 80;
/** 网格外围留白（由外层容器 x/y 承担） */
const PADDING = 10;

/**
 * 基于 gameLib.BaseSlotView 的 5×3 滚动视图（两级 GList 结构）
 *
 * 外层 this.list（BaseSlotView 约定的 "list" 容器）横排 5 列，
 * 内层每列为一个纵向滚动 GList，统一注册进 TestSlotModel.listRolls 由其驱动。
 * 中奖线绘制仍使用 LineGridRenderer 覆盖层。
 */
export class TestSlotView extends BaseSlotView {

    /**
     * 静态工厂：格子尺寸必须在 onInit（组件定型）之前传入，
     * 而 tsCore createUI → onConstruct 会同步触发 onInit，
     * 故不能用 createUI 无参构造后补设属性。
     */
    static create(cellW: number): TestSlotView {
        const v = new TestSlotView(cellW);
        (v as any).onConstruct();
        return v;
    }

    /** 滚动模型（驱动 5 列，两种 Model 家族共用同一调用面） */
    public model!: ScrollModel | ScrollTweenModel;
    /** 当前滚动驱动模式 */
    private _mode: ScrollViewMode = 'strategy';
    /** 中奖线覆盖层容器（每次绘制写入线段与线号圆标，清除时移除子件） */
    private _paylineOverlay!: GComponent;
    /** 内层纵向滚动列表集合 */
    private _columns: GList[] = [];
    /** 是否正在滚动 */
    private _spinningFlag: boolean = false;
    /** 全部完成回调 */
    private _onAllComplete: (() => void) | null = null;
    /** 本局中奖格子标记：列索引 → 命中的 item index 集合（渲染器据此着色） */
    private _winMap: Map<number, Set<number>> = new Map();
    /** 格子边长（正方形），经构造参数在 onInit 前定死 */
    private _cellW: number;
    /** 出结果延迟秒数：点击开始后轮子匀速待机至此才落定（可配置，默认 10 秒） */
    public resultDelaySec: number = 10;
    /** 延迟注入的待发开奖数据 */
    private _pendingData: SlotLotteryData[] | null = null;
    /** 本局判定结果（落定后展示用） */
    private _pendingWins: WinResult[] | null = null;
    /** 本局实际中奖判定回调（落定展示时通知外部更新结果条） */
    private _onResultReady: ((wins: WinResult[]) => void) | null = null;
    /** 开奖数据（生产规格：itemCount=40 持久条带） */
    private _gameData = new DemoGameData();

    constructor(cellW: number = DEFAULT_CELL) {
        super();
        this._cellW = Math.max(40, Math.round(cellW));
    }

    /** 格子边长（只读，构造时确定） */
    get cellSize(): number {
        return this._cellW;
    }

    /** 公开只读属性：是否正在滚动 */
    get isSpinning(): boolean {
        return this._spinningFlag;
    }

    /** 本局实际中奖判定回调 */
    set onResultReady(cb: ((wins: WinResult[]) => void) | null) {
        this._onResultReady = cb;
    }

    protected override onInit(): void {
        // 先构建两级 GList 再调 super.onInit()：
        // super 中 this.list ??= getChild("list") 会保留我们预先创建的实例
        this.setSize(REEL_COUNT * this._cellW + PADDING * 2,
                     this._cellW * VISIBLE_ROWS + PADDING * 2);
        // 生产数据初始化（demo 无 Action 总线，手动触发 initData）
        this._gameData.initData();
        this._buildReels();
        this._rebuildModel();
        super.onInit();

        // 中奖线覆盖层（不拦截事件）
        this._paylineOverlay = UIFactory.createPanel(
            {type: 'panel', width: this.width, height: this.height}, 0, 0);
        this._paylineOverlay.touchable = false;
        this.addChild(this._paylineOverlay);
    }

    /** 构建两级 GList 并做空闲态填充 */
    private _buildReels(): void {
        // 外层容器：对齐 BaseSlotView "list" 命名约定。
        // 注意两点 fgui 布局陷阱：
        // 1. GList 默认 autoResizeItem=true 会把子项宽度拉伸为容器自身宽度，
        //    必须关闭并由 itemRenderer/setSize 全权控制尺寸；
        // 2. 使用 SingleRow 水平布局让 5 列自动从左到右排列（禁用后再加回子级也不会纵向堆叠）
        const outer = UIFactory.createList(
            {type: 'list', name: "list", listLayout: 'SingleRow'}, 0, 0) as PureList;
        outer.autoResizeItem = false; // 阻断布局对子项(列)的宽度拉伸（显式设置确保生效）
        this.addChild(outer);

        // 内层列的绝对尺寸（外层 SingleRow 布局需要容器先有有效宽高才能正确排布）
        const innerW = this._cellW;
        const innerH = this._cellW * VISIBLE_ROWS;

        for (let i = 0; i < REEL_COUNT; i++) {
            const col = UIFactory.createList(
                {type: 'list', listLayout: 'SingleColumn', width: innerW, height: innerH}, 0, 0) as PureList;
            col.opaque = true;
            col.autoResizeItem = false; // 阻断 SingleColumn 对格子(cell)的宽度拉伸
            // 纯代码装配滚动容器（必须先于 setVirtualAndLoop：fgui 要求列表可滚动才能开虚拟循环）
            col.setupScrollPanel(fgui.OverflowType.Scroll, fgui.ScrollType.Vertical);
            // 生产同款虚拟循环列表（BaseSlotView.initListHandler 形态）：
            // posY 无上限，多圈滚动 / 沉底起点的前提
            col.setVirtualAndLoop();
            col.itemRenderer = Handler.create(this, this._colRenderer, null, false);
            const sp = col.scrollPane;
            if (sp) {
                sp.bouncebackEffect = false; // 循环模式无边界，回弹无意义
                sp.touchEffect = false;
            }
            // 数据源：gameData 持久条带（40 项）。
            // 注意顺序：必须先 push 进 _columns 再设 numItems ——
            // itemRenderer 同步触发时渲染器经 _columns.indexOf(col) 取列号
            this._columns.push(col);
            col.numItems = this._gameData.getSlotListArr(i).length;
            outer.addChild(col);
        }

        // 尺寸最后设定（保证布局计算基于最终值）：外围留白 + 5 列 × 3 行网格
        outer.setXY(PADDING, PADDING);
        outer.setSize(REEL_COUNT * innerW, innerH);
    }

    /**
     * 列表项渲染回调（虚拟循环模式）：数据源取自所在列的 col.data，
     * 中奖格子按 _winMap 着色；无数据时按 (行号+列号偏移) 铺底保证各列图案错开
     */
    private _colRenderer(index: number, item: fgui.GObject): void {
        const comp = item as GComponent;
        if (!comp) return;
        const cell = this._cellW;
        comp.setSize(cell, cell);
        let icon = comp.getChild('icon') as GGraph;
        let bg = comp.getChild('bg') as GGraph;
        if (!icon || !bg) {
            if (!bg) {
                bg = UIFactory.createGraph({type: 'graph', name: 'bg', width: cell, height: cell});
                comp.addChild(bg);
            }
            bg.setSize(cell, cell);
            if (!icon) {
                icon = UIFactory.createGraph({type: 'graph', name: 'icon', width: cell, height: cell});
                comp.addChild(icon);
            }
        }
        const col = comp.parent as GList;
        const colIdx = col ? this._columns.indexOf(col) : -1;
        // 数据源：列表 data（本局条带）优先，空闲态回退 gameData 持久条带
        const arr = col ? (col.data as number[] | undefined) : undefined;
        const strip = (arr && arr.length > 0)
            ? arr
            : this._gameData.getSlotListArr(colIdx >= 0 ? colIdx : 0);
        const symId = strip[index % strip.length] % SYMBOLS.length;
        // 中奖高亮：index 命中本局标记则金色，否则默认底色（图标绘制在其上层）
        const rows = this._winMap.get(colIdx);
        bg.drawRect(0, '#00000000', rows && rows.has(index) ? '#ffc107' : '#30475e');
        // 符号图标：等比缩放至格子 82% 并居中（纹理已在应用启动时预加载）
        this._drawSymbol(icon, symId, cell);
    }

    /** 在图标层绘制符号纹理（等比缩放 + 居中；纹理未就绪时留空） */
    private _drawSymbol(icon: GGraph, symId: number, cell: number): void {
        const sprite = icon.displayObject as Laya.Sprite;
        if (!sprite || !sprite.graphics) return;
        const g = sprite.graphics;
        g.clear();
        const tex = Laya.loader.getRes(SYMBOLS[symId]) as Laya.Texture;
        if (!tex) return;
        const s = (cell * 0.82) / Math.max(tex.width, tex.height);
        const w = tex.width * s;
        const h = tex.height * s;
        g.drawTexture(tex, (cell - w) / 2, (cell - h) / 2, w, h);
    }

    /**
     * 开始全部列滚动（真实开奖流程）
     *
     * ① 点击立即生成开奖数据：有启用配置 → 按配置反推（定制）；
     *    无配置 → 完全随机制定落定符号。两种模式仅数据来源不同，播放管线一致。
     * ② 延迟 resultDelaySec 秒后把结果传给"播放开奖结果方法"：
     *    - ScrollModel 家族：空结果匀速待机（生产 frameLoop 原生支持）→ deliverResult 注入落定
     *    - TweenModel 家族：无匀速段，视图层待机循环装饰滚动 → 停循环 + beginSpin 落定
     *
     * @param strategyType 策略名（linear/backOut/bounce/elastic/anticipation/easeInOut/slamStop）
     * @param direction 方向 'up' | 'down'
     * @param turbo 快速模式
     */
    startSpin(strategyType: string, direction: string = 'up', turbo: boolean = false): void {
        if (this._spinningFlag) return;
        this._spinningFlag = true;

        // 清除上一局中奖标记与线绘制（新标记在本局数据生成时构建）；
        // 并强制重刷 5 列 item —— 数据同为 12 项时 numItems 不变不会触发重渲染，
        // 上一局的金色高亮会残留
        this._winMap = new Map();
        LineGridRenderer.clearPaylineOverlay(this._paylineOverlay);
        this._refreshCols();

        // 模式分支：strategy/tweenStrategy 挂当前策略；native/tween 清空走原生 tween
        const useStrategy = this._mode === 'strategy' || this._mode === 'tweenStrategy';
        if (useStrategy) {
            // 悬念(anticipationDelay)等策略参数经 config 下发，其余策略自动忽略
            this.model.setScrollStrategy(parseStrategyType(strategyType), STRATEGY_DEFAULT_CONFIG);
        } else {
            this.model.clearStrategy();
            // Tween 家族原生分支的"悬念"形态：末列多滚一圈（premierLeagueStar 生产做法）
            if (this._mode === 'tween') {
                (this.model as ScrollTweenModel).anticipation = strategyType === 'anticipation';
            }
        }
        this.model.setScrollDirection(direction === 'up');

        // ① 立即生成开奖数据（生产流：缓冲窗 + 结果 + 补齐到 itemCount=40）
        const grid = this._makeResultGrid();
        const wins = this._evaluateWins(grid);
        this._pendingData = this._gridToLottery(grid, turbo);
        this._winMap = this._buildWinMap(wins);
        this._pendingWins = wins;

        // ② 延迟注入结果（生产语义：获取到开奖数据才开始滚动）：
        // - Scroll 家族：beginSpin 空结果启动生产匀速段（frameLoop 等数据，数据到达滚满圈数后落定）
        // - Tween 家族：等待期轮子完全静止，数据到达后一次性多圈滚动（premierLeagueStar 形态）
        if (this._mode === 'strategy' || this._mode === 'native') {
            (this.model as ScrollModel).beginSpin();
        }
        Laya.timer.once(this.resultDelaySec * 1000, this, this._deliverResult);
    }

    /** 延迟到期：注入结果触发滚动（Scroll=注入落定；Tween=此刻才开始整段滚动） */
    private _deliverResult(): void {
        if (!this._pendingData) return;
        const data = this._pendingData;
        this._pendingData = null;
        if (this._mode === 'strategy' || this._mode === 'native') {
            (this.model as ScrollModel).deliverResult(data);
        } else {
            (this.model as ScrollTweenModel).beginSpin(data);
        }
    }

    /** 急停：中断延迟注入与滚动，立即停止（等待期急停不落定结果） */
    slamStop(): void {
        Laya.timer.clear(this, this._deliverResult);
        this._pendingData = null;
        this.model.stopTween();
        // TweenModel 的 playLottery 无匀速守卫，急停后需同步复位转轮标志
        this._spinningFlag = false;
    }

    /** 设置全部完成回调 */
    setOnAllComplete(callback: () => void): void {
        this._onAllComplete = callback;
    }

    /**
     * 切换滚动驱动模式。
     * 同一家族内切换（strategy↔native / tween↔tweenStrategy）无需重建，
     * 由 startSpin 的挂/清策略分支即时生效；跨家族则重建 Model 实例。
     */
    setScrollMode(mode: ScrollViewMode): void {
        if (this._mode === mode) return;
        const oldIsScroll = this._mode === 'strategy' || this._mode === 'native';
        const newIsScroll = mode === 'strategy' || mode === 'native';
        this._mode = mode;
        if (oldIsScroll !== newIsScroll) this._rebuildModel();
    }

    /** 按当前模式重建（或首次创建）滚动 Model，并重绑完成回调 */
    private _rebuildModel(): void {
        this.model?.dispose();
        const m: ScrollModel | ScrollTweenModel =
            (this._mode === 'strategy' || this._mode === 'native')
                ? new ScrollModel(this._columns)
                : new ScrollTweenModel(this._columns);
        m.onAllComplete = () => {
            this._spinningFlag = false;
            this._showWinResult();
        };
        this.model = m;
    }

    /** 清除格子高亮（渲染器在下次刷新时回落默认底色） */
    clearHighlight(): void {
        this._winMap = new Map();
    }

    // ------------------------------------------------------------------

    /**
     * 生成本局结果网格
     * - 定制模式（有启用配置）：按 paylineConfigs 的 rowPattern 反推期望符号
     * - 随机模式（无配置）：每列 3 行完全随机制定落定符号，中了什么是什么
     */
    private _makeResultGrid(): number[][] {
        const grid: number[][] = Array.from({length: REEL_COUNT}, () => [-1, -1, -1]);
        const enabled = paylineConfigs.filter(c => c.enabled);
        if (enabled.length > 0) {
            enabled.forEach(cfg => {
                const line = PAYLINES.find(l => l.id === cfg.lineId);
                if (!line) return;
                for (let c = 0; c < cfg.count && c < REEL_COUNT; c++) {
                    grid[c][line.rowPattern[c]] = cfg.symbol;
                }
            });
        } else {
            for (let c = 0; c < REEL_COUNT; c++) {
                for (let r = 0; r < VISIBLE_ROWS; r++) {
                    grid[c][r] = Math.floor(Math.random() * SYMBOLS.length);
                }
            }
        }
        return grid;
    }

    /**
     * 判定中奖线：遍历已启用线，从左数实际连续相同符号（≥3 判中，奖级取实际连数）
     */
    private _evaluateWins(grid: number[][]): WinResult[] {
        const wins: WinResult[] = [];
        paylineConfigs.filter(c => c.enabled).forEach(cfg => {
            const line = PAYLINES.find(l => l.id === cfg.lineId);
            if (!line) return;
            const sym = grid[0][line.rowPattern[0]];
            if (sym < 0) return;
            let count = 1;
            while (count < REEL_COUNT && grid[count][line.rowPattern[count]] === sym) count++;
            if (count >= 3) wins.push({lineId: line.id, symbol: sym, count});
        });
        return wins;
    }

    /**
     * 结果网格 → 生产格式开奖数据（premierLeagueStar 流）
     *
     * 每列：现有条带.slice(3,6) 作落定窗缓冲 → 追加 3 个结果 →
     * getRandomNumber 补齐到 itemCount(40) → 回存 gameData 持久条带。
     * 多圈滚动取模后可视区天然落位 index 3,4,5 = 3 个结果（双方向同窗，无相位 hack）。
     */
    private _gridToLottery(grid: number[][], turbo: boolean): SlotLotteryData[] {
        return this._columns.map((_, i) => {
            const ar = this._gameData.getSlotListArr(i).slice(3, 6);
            for (let r = 0; r < VISIBLE_ROWS; r++) {
                ar.push(grid[i][r] >= 0 ? grid[i][r] : 0);
            }
            this._gameData.setSlotListArr(i, this._gameData.getRandomNumber(ar, 0, 12));
            const strip = this._gameData.getSlotListArr(i);
            return {arr: strip, isTurboMode: turbo, itemCount: this._gameData.itemCount};
        });
    }

    /** 判定结果 → 中奖格子标记（可视落定窗固定 index 3,4,5：命中格 = 3 + 行） */
    private _buildWinMap(wins: WinResult[]): Map<number, Set<number>> {
        const winMap = new Map<number, Set<number>>();
        const base = 3; // 生产数学：多圈取模落位 3（可视窗起始 index）
        wins.forEach(w => {
            const line = PAYLINES.find(l => l.id === w.lineId);
            if (!line) return;
            for (let c = 0; c < w.count && c < REEL_COUNT; c++) {
                if (!winMap.has(c)) winMap.set(c, new Set());
                winMap.get(c)!.add(base + line.rowPattern[c]);
            }
        });
        return winMap;
    }

    /** 全部列完成：按判定结果绘制中奖线，并通知外部实际开奖结果 */
    private _showWinResult(): void {
        const wins = this._pendingWins || [];
        this._pendingWins = null;
        wins.forEach(w => {
            const line = PAYLINES.find(l => l.id === w.lineId);
            if (!line) return;
            LineGridRenderer.drawPaylineOnGrid(
                line, PAYLINE_COLORS[w.lineId - 1], this._paylineOverlay,
                this._cellW, 0, PADDING, this._cellW
            );
        });
        this._onResultReady?.(wins);
        this._onAllComplete?.();
    }

    // ------------------------------------------------------------------

    /** 强制重刷全部列的 item（按当前 _winMap 重新着色） */
    private _refreshCols(): void {
        this._columns.forEach(col => {
            for (let i = 0; i < col.numChildren; i++) {
                this._colRenderer(i, col.getChildAt(i));
            }
        });
    }

    override dispose(): void {
        this.model?.dispose();
        Laya.timer.clearAll(this);
        super.dispose();
    }
}
