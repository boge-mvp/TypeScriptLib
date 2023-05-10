import {IGameModel} from "./IGameModel"

export interface IGameScene {

    /** 销毁 */
    dispose(): void

    /** 新一局游戏开始 */
    startGame(): void

    /** 获取游戏逻辑类 */

    gameModel: IGameModel


}