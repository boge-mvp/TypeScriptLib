import UIPackage = fgui.UIPackage
import {BaseWindow} from "../core/BaseWindow"
import {BaseGameData} from "../core/BaseGameData";

/** 图片窗口 */
export class ImageWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {

    private static _instance: ImageWindow

    static get inst(): ImageWindow {
        this._instance ??= new ImageWindow
        return this._instance
    }

    protected override onInit() {
        this.contentPane = UIPackage.createObjectFromURL("//init/ImageWindow").asCom
        super.onInit()
    }

    showTip(url: string) {
        this.show()
        this.contentPane.getChild("icon").asLoader.icon = url
    }

}