import {IMarket} from "./interfaces/IMarket"
import {ICPlatformClass} from "./interfaces/ICPlatformClass"
import {ConfigKit} from "../kit/ConfigKit";

export class NativeUtils {

    /**@private Market对象 只有加速器模式下才有值*/
    static conchMarket: Nullable<IMarket> = ConfigKit.get("conch") ? ConfigKit.get("conchMarket") : null
    /**@private PlatformClass类，只有加速器模式下才有值 */
    static PlatformClass: Nullable<ICPlatformClass> = ConfigKit.get("PlatformClass")

}