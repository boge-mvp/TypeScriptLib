import BaseSlotGameData = gameLib.BaseSlotGameData;

/**
 * Demo 开奖数据（对齐 premierLeagueStar 生产规格）
 *
 * - itemCount = 40：每列符号条带长度（生产默认值）
 * - 条带经 getSlotListArr/setSlotListArr 持久存储于本实例
 * - 开奖构造流：现有条带.slice(3,6) 作缓冲 + 3 个结果 + getRandomNumber 补齐到 40
 *   → 可视区天然落位 index 3,4,5 = 3 个结果符号（多圈滚动取模，无相位 hack）
 */
export class DemoGameData extends BaseSlotGameData {

    /** WILD 图标 id（对应 item_7） */
    static readonly WILD = 6;

    constructor() {
        super();
        this.itemCount = 40;
        this.smallPrize = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    /** 初始化：5 列条带随机填充（图标 id 0~11 全量） */
    initData(): void {
        new tsCore.Range(0, 4).toArray().forEach((value) =>
            this.setSlotListArr(value, this.getRandomNumber([], 0, 12)));
    }
}
