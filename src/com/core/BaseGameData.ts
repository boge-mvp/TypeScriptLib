import {IGameData} from "../interfaces/ICommon";

export class BaseGameData implements IGameData {

    /** 缓存的下注值 */
    cacheAnte: any
    /** 服务器发来的当前资金 */
    currentBalance = 0
    /** 后端计算   当前赢的钱 */
    serverWinMoney = 0
    totalWinMoney = 0
    playCount = 0
    /** 缓存 后端计算 当前赢的钱 */
    tempServerWinMoney = 0
    /** 当前玩家选择的自动下注次数 */
    autoBetCount = 0
    /** 当前玩家选择的自动下注次数 (缓存) */
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
     * 是否是 BigWin
     * @param isTotal 是否看总金额
     * @return
     */
    isBigWin(isTotal = false) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * 10
    }

    /**
     * 是否是 MegaWin
     * @param isTotal 是否看总金额
     * @return
     */
    isMegaWin(isTotal = false) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * 30
    }

    /**
     * 是否是 SuperWin
     * @param isTotal 是否看总金额
     * @return
     */
    isSuperWin(isTotal = false) {
        return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * 60
    }

    reportError(): any {
        return JSON.stringify(this)
    }

}