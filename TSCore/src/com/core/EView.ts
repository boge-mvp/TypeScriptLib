import GRoot = fgui.GRoot;
import RelationType = fgui.RelationType;
import UIObjectFactory = fgui.UIObjectFactory;
import Render = Laya.Render;
import {HistoryManager} from "../manager/HistoryManager"
import {View} from "./View"
import {IRecord} from "../interfaces/ICommon";
import {App} from "../App";

/** 全屏显示基类 */
export class EView extends View implements IRecord {

    /** 自动设置关联 默认false */
    protected autoSetupRelation = false

    protected override onConstruct() {
        super.onConstruct();
        this.on(Laya.Event.ADDED, this, this.addedHandler)
        if (this.autoSetupRelation) {
            this.addRelation(GRoot.inst, RelationType.Size)
            this.onInit()
            this.setSize(GRoot.inst.width, GRoot.inst.height)
            return
        }
        this.onInit()
    }

    protected addedHandler() {

    }

    /** 初始化UI */
    protected onInit() {

    }

    /** 返回按钮处理事件 */
    protected backHandler() {
        if (this.parent)
            HistoryManager.backHistory()
    }

    hideRecord() {
        HistoryManager.invalidHistory(this)
    }

    showRecord() {

    }

    override dispose() {
        HistoryManager.invalidHistory(this)
        // 删除 laya 中的所有延迟
        let gid = this["$_GID"]
        if (gid) { // 是否有使用过延迟 使用延迟执行的都有这个标记
            let map = Laya.CallLater.I["_map"]
            let handler: any[] = Laya.CallLater.I["_laters"]
            for (const mapKey in map) {
                let cid = mapKey.split(".")[0]
                if (cid == gid) {
                    delete map[mapKey]
                }
            }
            for (let i = 0; i < handler.length; i++) {
                let value = handler[i]
                let cid = value["key"].split(".")[0]
                if (cid == gid) {
                    handler.splice(i, 1)
                    i--
                }
            }
        }
        super.dispose()
    }

    /** 设置扩展 */
    protected insertExt(pkgName: string, resName: string, clas: any) {
        this.insertExtUrl("//" + pkgName + "/" + resName, clas)
    }

    /** 设置扩展 */
    protected insertExtUrl(url: string, clas: any) {
        UIObjectFactory.setPackageItemExtension(url, clas)
    }

    /**
     * 资源url解析
     * @param url
     */
    protected parseUrl(url: any) {
        if (Render.isConchApp) return
        let childs: any[] = url.firstChild.childNodes
        let child: any
        for (let i = 0; i < childs.length; i++) {
            child = childs[i]
            Laya.URL.version[child.getAttribute("url")] = child.getAttribute("crc")
        }
    }

    /** 注册游戏数据 */
    override regGameAction(action: string, caller: any, method: Function) {
        super.regAction(action, caller, method, App.GAME_GROUP)
    }

}

