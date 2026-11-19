/**
 * 中奖线数据定义
 * 与 HTML demo 中的数据一致，用于 FGUI+LayaAir 单元测试
 */

/** 单条中奖线定义 */
export interface PaylineDef {
    id: number;
    /** 每列经过的行：0=上, 1=中, 2=下 */
    rowPattern: number[];
    name: string;
}

/** 中奖线配置 */
export interface PaylineConfig {
    lineId: number;
    /** 符号索引（SYMBOLS 数组中的位置） */
    symbol: number;
    /** 连数（3/4/5） */
    count: number;
    enabled: boolean;
}

/**
 * 符号列表：滚动图标图片路径（相对于 bin 目录的 index.html）
 * 图片为等比缩放渲染，路径经应用启动时预加载
 */
export const SYMBOLS: string[] = [
    'res/symbols/item_1.png',
    'res/symbols/item_2.png',
    'res/symbols/item_3.png',
    'res/symbols/item_4.png',
    'res/symbols/item_5.png',
    'res/symbols/item_6.png',
    'res/symbols/item_7.png',
    'res/symbols/item_8.png',
    'res/symbols/item_9.png',
    'res/symbols/item_10.png',
    'res/symbols/item_11.png',
    'res/symbols/item_12.png',
];

/** 符号显示名（供纯文本摘要/信息条使用） */
export const SYMBOL_LABELS: string[] = SYMBOLS.map((_, i) => `图标${i + 1}`);

/** 常量 */
export const SYMBOL_HEIGHT = 80;
export const VISIBLE_ROWS = 3;
export const REEL_COUNT = 5;

/**
 * 预设 20 条中奖线
 * rowPattern: 每列经过的行，0=上 1=中 2=下
 */
export const PAYLINES: PaylineDef[] = [
    { id: 1,  rowPattern: [1, 1, 1, 1, 1], name: '中间横线' },
    { id: 2,  rowPattern: [0, 0, 0, 0, 0], name: '顶部横线' },
    { id: 3,  rowPattern: [2, 2, 2, 2, 2], name: '底部横线' },
    { id: 4,  rowPattern: [0, 1, 2, 1, 0], name: 'V形' },
    { id: 5,  rowPattern: [2, 1, 0, 1, 2], name: '倒V形' },
    { id: 6,  rowPattern: [0, 0, 1, 2, 2], name: '斜降' },
    { id: 7,  rowPattern: [2, 2, 1, 0, 0], name: '斜升' },
    { id: 8,  rowPattern: [1, 0, 0, 0, 1], name: 'U形上' },
    { id: 9,  rowPattern: [1, 2, 2, 2, 1], name: 'U形下' },
    { id: 10, rowPattern: [1, 0, 1, 0, 1], name: '波浪' },
    { id: 11, rowPattern: [0, 0, 1, 1, 2], name: '阶梯降' },
    { id: 12, rowPattern: [2, 2, 1, 1, 0], name: '阶梯升' },
    { id: 13, rowPattern: [0, 1, 1, 1, 0], name: '浅V' },
    { id: 14, rowPattern: [2, 1, 1, 1, 2], name: '浅倒V' },
    { id: 15, rowPattern: [0, 1, 0, 1, 2], name: '之字降' },
    { id: 16, rowPattern: [2, 1, 0, 1, 0], name: '之字升' },
    { id: 17, rowPattern: [1, 0, 2, 0, 1], name: '交叉' },
    { id: 18, rowPattern: [0, 2, 1, 2, 0], name: 'W形' },
    { id: 19, rowPattern: [2, 0, 1, 0, 2], name: 'M形' },
    { id: 20, rowPattern: [1, 2, 0, 2, 1], name: '反交叉' },
];

/** 20 种线颜色 */
export const PAYLINE_COLORS: string[] = [
    '#ff4444', '#44ff44', '#4488ff', '#ffff44', '#ff44ff',
    '#44ffff', '#ff8844', '#8844ff', '#44ff88', '#ffffff',
    '#ff6688', '#88ff66', '#6688ff', '#ffaa33', '#aa66ff',
    '#33aaaa', '#ff4466', '#66ff44', '#4466ff', '#ff99cc'
];

/** 当前中奖配置列表 */
export let paylineConfigs: PaylineConfig[] = [
    { lineId: 1, symbol: 5, count: 5, enabled: true },
];
