/**
 * 大厅model
 */
export interface IHomeModel {

    /** 奖池金额 */
    scratcherAwardPool(): number

    /** 奖池金额 */
    scratcherAwardPool(value: number): void

    moneyChange(obj: any): void

    notificationHandler(obj: any): void

    importantNetsHandler(obj: any): void

    scratcherCountHandler(): void

    connectSocket(): void

    /** 检查礼包和弹窗 */
    checkGiftAlert(handler: ParamHandler): void

    newMailMsgHandler(): void

    socketChangeFreeBet(obj: any): void

}