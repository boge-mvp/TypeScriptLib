/**
 * 游戏数据
 */
export interface IGameData {

    /** 总共要投注的钱 */
    getTotalBetMoney(): number

    /** 上报错误数据 */
    reportError(): any

    /** 玩的次数 计数 */
    playCount?: number

}