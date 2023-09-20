import UIObjectFactory = fgui.UIObjectFactory
import {Proxys} from "./Proxys"
import {App} from "../App";

export class EProxy extends Proxys {

    /**
     *  游戏公用组
     * @deprecated
     * @see App.GAME_GROUP
     */
    static GAME_GROUP = App.GAME_GROUP

    /** 注册游戏数据 */
    override regGameAction(action: string, caller: any, method: Function) {
        super.regAction(action, caller, method, App.GAME_GROUP)
    }

    /** 设置扩展 */
    protected insertExt(pkgName: string, resName: string, clas: any) {
        this.insertExtUrl("//" + pkgName + "/" + resName, clas)
    }

    /** 设置扩展 */
    protected insertExtUrl(url: string, clas: any) {
        UIObjectFactory.setPackageItemExtension(url, clas)
    }

}
