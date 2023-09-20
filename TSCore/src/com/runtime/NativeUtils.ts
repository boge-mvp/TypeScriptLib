import {IMarket} from "./IMarket"
import {ICPlatformClass} from "./ICPlatformClass"

export class NativeUtils {

    /**@private Market对象 只有加速器模式下才有值*/
    static conchMarket: IMarket = window["conch"] ? window["conchMarket"] : null
    /**@private PlatformClass类，只有加速器模式下才有值 */
    static PlatformClass: ICPlatformClass = window["PlatformClass"]

}