import EWindow = tsCore.EWindow;
import {AppRecordManager} from "../manager/AppRecordManager"
import {ActionLib} from "../ActionLib"
import {Player} from "../Player";
import {BaseGameData} from "./BaseGameData";
import Log = tsCore.Log;

export class BaseWindow<T extends BaseGameData = BaseGameData> extends EWindow {

    /**
     * 是否在关闭窗口的时候  发送 ActionLib.GAME_RUN_SCENE_EVENT
     * @default false
     */
    isRunSceneEvent = false


    protected override closeEventHandler() {
        if (this.parent) {
            if (this.joinRecord) {
                AppRecordManager.backHistory()
            } else {
                this.hideRecord()
            }
        }
    }

    protected override onHide() {
        if (this.isRunSceneEvent) this.sendAction(ActionLib.GAME_RUN_SCENE_EVENT)
        super.onHide()
    }

    protected get gameData(): T {
        return Player.inst.gameData as T
    }
    /**
     * @deprecated
     */
    protected set gameData(value: T) {
        Log.debug(value)
    }

}