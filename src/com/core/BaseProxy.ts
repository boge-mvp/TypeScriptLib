import UIObjectFactory = fgui.UIObjectFactory
import {Proxys} from "./Proxys"
import {LanguageUtils} from "../utils/LanguageUtils"
import {StringUtil} from "../utils/StringUtil"
import {Factory} from "../Factory";

export class BaseProxy extends Proxys {

    /**
     *  游戏公用组
     * @deprecated
     * @see Factory.GAME_GROUP
     */
    static GAME_GROUP = Factory.GAME_GROUP

    /** 注册游戏数据 */
    regGameAction(action: string, caller: any, method: Function) {
        super.regAction(action, caller, method, Factory.GAME_GROUP)
    }

    /** 设置扩展 */
    protected insertExt(pkgName: string, resName: string, clas: any) {
        this.insertExtUrl("//" + pkgName + "/" + resName, clas)
    }

    /** 设置扩展 */
    protected insertExtUrl(url: string, clas: any) {
        UIObjectFactory.setPackageItemExtension(url, clas)
    }

    /** 根据语言包id获取字符串 */
    getString(id: string | number, ...args): string {
        let content = LanguageUtils.inst.getStr(id)
        args.unshift(content)
        return StringUtil.format.apply(null, args)
    }

}
