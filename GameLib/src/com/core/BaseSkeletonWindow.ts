import SkeletonWindow = tsCore.SkeletonWindow;
import {BaseGameData} from "./BaseGameData";
import {Player} from "../Player";
import Log = tsCore.Log;

export class BaseSkeletonWindow<T extends BaseGameData = BaseGameData> extends SkeletonWindow {

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