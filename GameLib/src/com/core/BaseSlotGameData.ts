import {BaseGameData, GameType} from "./BaseGameData"
import {Player} from "../Player"
import LocalStorage = Laya.LocalStorage;
import MathKit = tsCore.MathKit;


export class BaseSlotGameData extends BaseGameData {

    /** 中奖配置表 按列排序 */
    lottery = [
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],

        [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],

        [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],

        [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0]
    ]
    /** 线数字 */
    lineNum = [
        [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
        [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
    ]
    /** 是否快速播放 */
    private _isTurboMode = false
    /** 当前购买的线 */
    lineValue = 0
    /** 玩家赢的线 */
    lines: any[]
    /** 项目总数 */
    itemCount = 40
    /** 临时存储开奖结果 */
    tempLotteryId: any[]
    /** 玩家的中奖项 */
    userWinArray = []
    /** 小奖 要最少满足3个的线 */
    smallPrize = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11]
    /** 默认线位置 */
    defaultLineIndex = 0

    //     默认游戏 free 变量存储属性

    /** 是否有免费游戏 1 就是免费游戏 */
    hasFreeSpin = 0

    /** 是否进入免费模式开奖流程 */
    isFreeModel: boolean
    /** 免费游戏押注参数 */
    freeBetTotalObj: any
    /** free spin 原始数据 */
    freeSpinObj: any
    /** 免费游戏剩余次数 */
    freeCount = 0

    /** 第一列是否存在 bounds */
    firstExistBounds: boolean
    /** 当前开出免费游戏的个数 */
    freeBoundsCount = 0

    /**
     * 是否有 reSpin
     */
    hasReSpin = 0

    constructor() {
        super()
        this.lineValue = this.lottery.length
        this.gameType = GameType.SLOT
        const key = Player.inst.gameId + "_isTurboMode"
        this._isTurboMode = LocalStorage.getItem(key) != null
    }

    /** 总共要投注的钱 */
    override getTotalBetMoney() {
        return this.lineValue * this.betValue
    }

    /** 获取当前的开奖数据 */
    getLotteryId(): any[] {
        return this.lotteryId
    }

    /**
     * 获取指定线的开奖规则模版
     * @param index 线 0开始
     */
    getLottery(index: number) {
        return this.lottery[index]
    }

    /**
     * 获取每列 list 的值
     * @param index 列
     * @return 返回所拥有的值
     */
    getSlotListArr(index: number): number[] {
        return null
    }

    /**
     * 为每列 list 赋新的值
     * @param index 列
     * @param ar 新的值
     */
    setSlotListArr(index: number, ar: number[]) {
    }

    /**
     * 数组长度不够需要 那么添加几个随机值
     * @param arr 数字数组
     * @param min 随机的最小值 默认 1
     * @param max 随机的最大值(不包括) 默认 10
     * @return 符合所有值的数组
     */
    getRandomNumber(arr: number[], min = 1, max = 10) {
        let len = this.itemCount - arr.length
        for (let i = 0; i < len; i++) {
            arr.push(MathKit.random(min, max))
        }
        return arr
    }

    get isTurboMode(): boolean {
        return this._isTurboMode
    }

    set isTurboMode(value: boolean) {
        this._isTurboMode = value
        const key = Player.inst.gameId + "_isTurboMode"
        if (value) {
            LocalStorage.setItem(key, "1")
        } else {
            LocalStorage.removeItem(key)
        }
    }

}