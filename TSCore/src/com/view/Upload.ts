import Sprite = Laya.Sprite
import Browser = Laya.Browser
import Utils = Laya.Utils
import Render = Laya.Render

/**
 * 上传组件
 * @author boge
 */
export class Upload {

    private static _instance: Upload

    static get inst(): Upload {
        this._instance ??= new Upload
        return this._instance
    }

    private _file: any
    private target: Sprite
    private inputWidth: number
    private inputHeight: number
    private target2: Sprite

    get nativeFile() {
        this._file ??= Browser.getElementById("upload")
        return this._file
    }

    /**
     * 在输入期间，如果 Input 实例的位置改变，调用该方法同步输入框的位置。
     */
    private _syncInputTransform() {
        if (!this.target) return
        let style = this.nativeFile.style


        let transform = Utils.getTransformRelativeToWindow(this.target, 0, 0)


        this.inputWidth = this.target.width
        this.inputHeight = this.target.height
        this.setSize(this.inputWidth, this.inputHeight)

        this.setScale(transform.tx, transform.ty)

    }

    private setScale(sx: number, sy: number) {
        this.setSize(this.inputWidth * sx, this.inputHeight * sy)
    }

    setSize(w: number, h: number) {
        this.nativeFile.style.width = w + "px"
        this.nativeFile.style.height = h + "px"
    }

    setPos(x: number, y: number) {
        this.nativeFile.style.left = x + "px"
        this.nativeFile.style.top = y + "px"
    }

    hide() {
        this.setSize(0, 0)
        this.setPos(0, 0)
        this.nativeFile.onchange = null
        Browser.removeElement(Browser.getElementById("upload"))
        this.focus = false
        this.target = null
        this._file = null
        Laya.stage.off(Laya.Event.FOCUS, this, this.focusHandler)
        Laya.stage.off(Laya.Event.BLUR, this, this.blurHandler)
        this.target2.off(Laya.Event.UNDISPLAY, this, this.hide)
    }

    show(target: Sprite, target2: Sprite) {
        this.target = target
        this.target2 = target2
        this.focus = true
        Laya.stage.on(Laya.Event.FOCUS, this, this.focusHandler)
        Laya.stage.on(Laya.Event.BLUR, this, this.blurHandler)
        target2.once(Laya.Event.UNDISPLAY, this, this.hide)
    }

    private blurHandler() {
        this.focus = false
    }

    private focusHandler() {
        this.focus = true
    }

    // 移动平台最后单击画布才会调用focus
    // 因此 调用focus接口是无法都在移动平台立刻弹出键盘的
    set focus(value: boolean) {
        if (value) {
            this._syncInputTransform()
            this.nativeFile.style.display = "block"
            if (!Render.isConchApp && Browser.onPC)
                Laya.timer.frameLoop(1, this, this._syncInputTransform)
        } else {
            // 只有PC会注册此事件。
            Browser.onPC && Laya.timer.clear(this, this._syncInputTransform)
            this.nativeFile.style.display = "none"
        }
    }

}