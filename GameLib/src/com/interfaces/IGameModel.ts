import {IGameScene} from "./IGameScene"
import {IGameServlet} from "./IGameServlet"

export interface IGameModel {

    /** 获取游戏番号 */
    gameCode: number

    /** 清理游戏资源 */
    clearRes(): void

    /** 注入扩展 */
    insertExtension(): void

    /** 获取游戏显示类 */
    gameScene: IGameScene

    /** 获取游戏显示类 */
    gameServlet: IGameServlet

    /** 销毁所有数据 */
    dispose(): void

    /** socket推送的数据 */
    socketHandler(obj: any): void

    /** socket事件 */
    initSocketEvent(): void

}