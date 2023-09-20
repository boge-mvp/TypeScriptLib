/**
 * 弹窗层
 * @author boge
 */
export class AlertPanel extends fgui.GComponent {

    private static _instance: AlertPanel

    static get inst(): AlertPanel {
        this._instance ??= new AlertPanel
        return this._instance
    }

    constructor() {
        super()
        this.touchable = false
        Laya.stage.on(Laya.Event.RESIZE, this, this.__winResize)
        this.__winResize()
    }

    private __winResize() {
        this.setSize(Laya.stage.width, Laya.stage.height)
    }

}