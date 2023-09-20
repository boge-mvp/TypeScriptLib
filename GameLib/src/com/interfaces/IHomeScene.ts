import {IHomeModel} from "./IHomeModel"
import {IHomeServlet} from "./IHomeServlet"

/** 大厅接口 */
export interface IHomeScene {

    /** 开始游戏 */
    startGame(): void

    /** 从父面板上删除 */
    removeFromParent(): void

    /** 获取游戏逻辑类 */
    gameModel(): IHomeModel

    /** 获取游戏通信类 */
    gameServlet(): IHomeServlet

    /** 发送通知消息 */
    sendNotice(content: string): void

    /** 更新玩家金额 */
    updateGlod(): void

    /** 更新刮刮奖数据 */
    updateScratcherData(): void

    /** 添加新通知 */
    addNewNotice(value: any): void

    /** 从其他界面返回首页 */
    revertHome(): void

    /** 房间 */
    getRoomSlots(): any

    /** 切换页面 */
    changePage(index: number): void

    /** 菜单功能被点击后 */
    userClickHandler(): void

    /**
     * 更新邮件消息
     */
    updateMailMes(): void

    /**
     * 设置游戏类型
     * @param index 0单机  1网络
     */
    setGameType(index: number): void

    /**
     * 首页是否在显示
     */
    isVisible(): boolean

    /**
     * 客服系统
     */
    contactUsHandler(): void

    /** 改变登录后的ui状态 */
    changeLoginUIState(): void

}