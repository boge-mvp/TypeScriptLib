import {IGameData} from "../Interfaces";

/**
 * 游戏类型
 */
export enum GameType {
    /** 正常游戏 */
    NORMAL,
    /** 连线游戏 */
    SLOT,
}

/**
 * 游戏数据的基类
 */
export class BaseGameData implements IGameData {

    /** 缓存的下注值 */
    cacheAnte: any
    /** 服务器发来的当前余额 */
    currentBalance = 0
    /** 后端计算   当前盈利 */
    serverWinMoney = 0
    totalWinMoney = 0
    playCount = 0
    /** 缓存 后端计算 当前盈利 */
    tempServerWinMoney = 0
    /** 当前玩家选择的自动bet次数 */
    autoBetCount = 0
    /** 当前玩家选择的自动bet次数 (缓存) */
    tempAutoBetCount = 0
    /** 下注额度切换值 */
    betMoney = []
    /** 当前押注的钱 */
    betValue = 0
    /** 开奖结果 */
    lotteryId: any[]
    /** 是否已经弹出过一次推荐现金游戏 */
    isRecommend = false
    /** 通知数据 */
    noticeData = []
    /** 默认bet位置 */
    defaultBetIndex = 0
    /** 游戏类型 */
    gameType = GameType.NORMAL

    /**
     * 总金额 default BaseGameData.betValue
     */
    getTotalBetMoney() {
        return this.betValue
    }

    /**
     * 获取赢钱动画 的播放时长
     * @param level 播放时长等级 0开始
     */
    getWinMoneyAniDuration(level: number) {
        return 1000 * (level + 1)
    }

    /**
     * 是否达到 BigWin 的值
     * @param [isTotal=false] 是否看总金额
     * @param [multiple=10] 倍数
     * @return
     */
    isBigWin(isTotal = false, multiple = 10) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple
    }

    /**
     * 是否达到 MegaWin 的值
     * @param [isTotal=false] 是否看总金额
     * @param [multiple=30] 倍数
     * @return
     */
    isMegaWin(isTotal = false, multiple = 30) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple
    }

    /**
     * 是否达到 SuperWin 的值
     * @param [isTotal=false] 是否看总金额
     * @param [multiple=60] 倍数
     */
    isSuperWin(isTotal = false, multiple = 60) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple
    }

    reportError() {
        return JSON.stringify(this)
    }

}