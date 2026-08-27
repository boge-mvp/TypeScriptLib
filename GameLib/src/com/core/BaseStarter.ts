import GRoot = fgui.GRoot;
import EProxy = tsCore.EProxy;
import {BaseScene} from "./BaseScene"
import {GameServlet} from "./GameServlet"
import {GameModel} from "./GameModel"
import {ActionLib} from "../ActionLib"

export class BaseStarter extends EProxy {

    baseScene?: BaseScene
    gameServlet?: GameServlet
    gameModel?: GameModel
    private callback?: ParamHandler

    constructor() {
        super()
        this.regGameAction(ActionLib.GAME_CREATE_SCENE_SHOW, this, this.onCreateScene)
    }

    /**
     * 创建游戏到舞台
     * @param handler 创建完成回调
     */
    protected onCreateScene(handler: ParamHandler) {
        this.callback = handler
        this.updateScreenOrientation()

        // 兼容旧版本
        this.createSceneShow(handler)
    }

    /**
     * 创建游戏到舞台
     * @param handler 创建完成回调
     * @deprecated
     * @see onCreateScene
     */
    protected createSceneShow(handler: ParamHandler) {
    }

    /** 当前游戏的方向 */
    updateScreenOrientation() {
    }

    /**
     *  创建并显示一个舞台
     *
     * @param url 如果url不带/符号 则自动转成 gameName/url
     * @param cls
     * @protected
     */
    protected createShowScene(url: string, cls?: new () => fgui.GObject) {
        // 部分手机太垃圾了  需要延迟点
        Laya.timer.callLater(this, () => {
            this.baseScene = createView(url, cls) as BaseScene
            GRoot.inst.addChild(this.baseScene)
            runFun(this.callback)
        })

//        Laya.timer.once(2000, this, function() {
//            sendAction(Action.GAME_SHOW_ROOM_NOTICE, {message: "Congratulations Lucy Mbugua for winning " + Player.inst.getCurrencyUnit() + "2880"})
//        })

    }

}
