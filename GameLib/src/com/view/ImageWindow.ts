import {BaseWindow} from "../core/BaseWindow"
import {BaseGameData} from "../core/BaseGameData";

/** 图片窗口 */
export class ImageWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance: ImageWindow
    static CREATE_FUI_URL = "//init/ImageWindow"

    static get inst(): ImageWindow {
        this._instance ??= new ImageWindow
        return this._instance
    }

    static show(url: string) {
        this.inst.showTip(url)
    }

    static hide() {
        this._instance?.hide()
    }

    protected override onInit() {
        this.contentPane = createView(ImageWindow.CREATE_FUI_URL)
        super.onInit()
    }

    showTip(url: string) {
        this.show()
        const loader = this.contentPane.getChild("icon")?.asLoader
        if (loader)
            loader.icon = url
    }

}