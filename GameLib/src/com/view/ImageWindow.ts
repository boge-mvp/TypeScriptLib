import GRoot = fgui.GRoot;
import Log = tsCore.Log;
import {BaseWindow} from "../core/BaseWindow"
import {BaseGameData} from "../core/BaseGameData";

/** 图片窗口 */
export class ImageWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance: ImageWindow
    static CREATE_FUI_URL: Nullable<string> = null

    static get inst(): ImageWindow {
        this._instance ??= new ImageWindow
        return this._instance
    }

    private static checkCreateUrl(): boolean {
        if (!ImageWindow.CREATE_FUI_URL) {
            Log.warn("[ImageWindow] CREATE_FUI_URL is null, cannot create view.")
            return false
        }
        return true
    }

    override show() {
        if (!ImageWindow.checkCreateUrl()) return
        super.show()
    }

    override showOn(root: GRoot) {
        if (!ImageWindow.checkCreateUrl()) return
        super.showOn(root)
    }

    static show(url: string) {
        this.inst.showTip(url)
    }

    static hide() {
        this._instance?.hide()
    }

    protected override onInit() {
        if (!ImageWindow.checkCreateUrl()) return
        this.contentPane = createView(ImageWindow.CREATE_FUI_URL!)
        if (!this.contentPane) return
        super.onInit()
    }

    showTip(url: string) {
        this.show()
        if (!this.contentPane) return
        const loader = this.contentPane.getChild("icon")?.asLoader
        if (loader)
            loader.icon = url
    }

}