import GComponent = fgui.GComponent
import GRoot = fgui.GRoot
import RelationType = fgui.RelationType
import Handler = Laya.Handler
import {BaseView} from "./BaseView"
import {LibStr} from "../LibStr"
import ELoader = tsCore.ELoader;

/**
 * 需要加载资源的组件
 * @author boge
 *
 */
export class LoadComponent extends BaseView {

    /** 是否已经初始化 */
    private isInit: boolean = true
    /** 需要加载的资源 */
    private loadArray: any[]
    /** 内容面板 */
    private _contentPane: GComponent


    constructor() {
        super()

        this.on(Laya.Event.ADDED, this, this.addedHandler)

    }

    protected override addedHandler() {
        if (!this.isInit) {
            GRoot.inst.showModalWait(getString(LibStr.LOADING))
            ELoader.loader.load(this.loadArray,
                Handler.create(this, this.resLoaderComplete),
                Handler.create(this, this.progressHandler))
        } else {
            this.onShow()
        }
    }

    private progressHandler(data: number) {
        GRoot.inst.showModalWait(getString(LibStr.LOADING) + " " + Math.floor(data * 100) + "%")
    }

    protected loadErrorHandler() {
        ELoader.loader.clearUnLoaded()
        GRoot.inst.closeModalWait()
    }

    private resLoaderComplete(success: boolean) {
        if (!success) {
            this.loadErrorHandler()
            return
        }
        this.onInit()
        GRoot.inst.closeModalWait()
        this.onShow()
    }

    set contentPane(value: GComponent) {
        this._contentPane = value
        if (this._contentPane) {
            this.addRelation(GRoot.inst, RelationType.Size)
            this.setSize(GRoot.inst.width, GRoot.inst.height)
            this._contentPane.addRelation(this, RelationType.Size)
            this._contentPane.setSize(this.width, this.height)
            this.addChild(this._contentPane)
        }
    }

    get contentPane() {
        return this._contentPane
    }

    protected onShow() {

    }

    addSources(array: any[]) {
        this.loadArray = array
        this.isInit = false
    }


}