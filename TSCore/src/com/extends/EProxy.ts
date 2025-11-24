import UIObjectFactory = fgui.UIObjectFactory
import {Proxys} from "../core/Proxys"
import {App} from "../App";
import GComponent = fgui.GComponent;

export class EProxy extends Proxys {

    /**
     *  游戏公用组
     * @deprecated
     * @see App.GAME_GROUP
     */
    static GAME_GROUP = App.GAME_GROUP

    /** 注册游戏数据 */
    override regGameAction(action: string | number, caller: any, method: ParamHandler) {
        super.regAction(action, caller, method, App.GAME_GROUP)
    }

    /** 设置扩展 */
    protected insertExt<T extends GComponent>(pkgName: string, resName: string, clas: new () => T) {
        this.insertExtUrl("//" + pkgName + "/" + resName, clas)
    }

    /** 设置扩展 */
    protected insertExtUrl<T extends GComponent>(url: string, clas: new () => T) {
        UIObjectFactory.setPackageItemExtension(url, clas)
    }

}
