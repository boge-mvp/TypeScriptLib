import GObject = fgui.GObject
import LoaderFillType = fgui.LoaderFillType
import Skeleton = Laya.Skeleton
import Sprite = Laya.Sprite
import PackageItem = fgui.PackageItem
import Handler = Laya.Handler
import Event = Laya.Event
import Point = Laya.Point
import BoneSlot = Laya.BoneSlot

export class GLoader3D extends GObject {

    private _url: string
    private _align: string
    private _verticalAlign: string
    private _autoSize: boolean
    private _fill: number
    private _shrinkOnly: boolean
    private _playing: boolean
    private _frame = 0
    private _loop: boolean
    private _animationName: string
    private _skinName: string
    private _color: string
    private _contentItem: PackageItem
    private _container: Sprite
    private _content: Skeleton
    private _updatingLayout = false
    private loadSkeleton: Skeleton
    /** 是否有描点 */
    isAnchor = true

    constructor() {
        super()
        this._playing = true
        this._url = ""
        this._fill = LoaderFillType.None
        this._align = "left"
        this._verticalAlign = "top"
        this._color = "#FFFFFF"
    }

    protected override createDisplayObject() {
        super.createDisplayObject()
        this._container = new Sprite()
        this._displayObject.addChild(this._container)
    }

    override dispose() {
        this.clearContent()
        super.dispose()
    }

    get url() {
        return this._url
    }

    set url(value: string) {
        if (this._url == value)
            return

        this._url = value
        this.loadContent()
        this.updateGear(7)
    }

    override get icon() {
        return this._url
    }

    override set icon(value: string) {
        this.url = value
    }

    get align() {
        return this._align
    }

    set align(value: string) {
        if (this._align != value) {
            this._align = value
            this.updateLayout()
        }
    }

    get verticalAlign() {
        return this._verticalAlign
    }

    set verticalAlign(value: string) {
        if (this._verticalAlign != value) {
            this._verticalAlign = value
            this.updateLayout()
        }
    }

    get fill() {
        return this._fill
    }

    set fill(value: number) {
        if (this._fill != value) {
            this._fill = value
            this.updateLayout()
        }
    }

    get shrinkOnly() {
        return this._shrinkOnly
    }

    set shrinkOnly(value: boolean) {
        if (this._shrinkOnly != value) {
            this._shrinkOnly = value
            this.updateLayout()
        }
    }

    get autoSize(): boolean {
        return this._autoSize
    }

    set autoSize(value: boolean) {
        if (this._autoSize != value) {
            this._autoSize = value
            this.updateLayout()
        }
    }

    get playing(): boolean {
        return this._playing
    }

    set playing(value: boolean) {
        if (this._playing != value) {
            this._playing = value
            this.updateGear(5)

            this.onChange()
        }
    }

    get frame(): number {
        return this._frame
    }

    set frame(value: number) {
        if (this._frame != value) {
            this._frame = value
            this.updateGear(5)

            this.onChange()
        }
    }

    get animationName(): string {
        return this._animationName
    }

    set animationName(value: string) {
        if (this._animationName != value) {
            this._animationName = value
            this.onChange()
        }
    }

    get skinName(): string {
        return this._skinName
    }

    set skinName(value: string) {
        if (this._skinName != value) {
            this._skinName = value
            this.onChange()
        }
    }

    get loop(): boolean {
        return this._loop
    }

    set loop(value: boolean) {
        if (this._loop != value) {
            this._loop = value
            this.onChange()
        }
    }

    get color(): string {
        return this._color
    }

    set color(value: string) {
        if (this._color != value) {
            this._color = value
            this.updateGear(4)
        }
    }

    get content(): Laya.Sprite {
        return null
    }

    protected loadContent() {
        this.clearContent()
        if (!this._url)
            return
        this.loadExternal()
    }

    setSkeleton(skeleton: Skeleton, anchor: Point = null) {
        this.url = null
        let bones = skeleton.templet.boneSlotArray
        let tempW: number = 0
        let tempH: number = 0
        for (let i = 0; i < bones.length; i++) {
            let boneSlot: BoneSlot = bones[i]
            if (boneSlot.currTexture) {
                boneSlot.currTexture.sourceWidth > tempW && (tempW = boneSlot.currTexture.sourceWidth)
                boneSlot.currTexture.sourceHeight > tempH && (tempH = boneSlot.currTexture.sourceHeight)
            }
        }
        this.sourceWidth = tempW * skeleton.scaleX
        this.sourceHeight = tempH * skeleton.scaleY

        this._content = skeleton
        this._container.addChild(this._content)
        if (this.isAnchor && !anchor) {
            anchor = new Point(this.sourceWidth / 2, this.sourceHeight / 2)
        }
        if (anchor) this._content.pos(anchor.x, anchor.y)

        // 添加事件
        this._content.on(Event.PLAYED, this, this.onPlayed)
        this._content.on(Event.STOPPED, this, this.onStopped)
        this._content.on(Event.PAUSED, this, this.onPaused)
        this._content.on(Event.LABEL, this, this.onLabel)

        this.onChange()
        this.updateLayout()
    }

    private onPlayed() {
        this.displayObject.event(Event.PLAYED)
    }

    private onStopped() {
        this.displayObject.event(Event.STOPPED)
    }

    private onPaused() {
        this.displayObject.event(Event.PAUSED)
    }

    private onLabel() {
        this.displayObject.event(Event.LABEL)
    }

    /**
     * 播放动画
     * @param    nameOrIndex    动画名字或者索引
     * @param    loop        是否循环播放
     */
    play(nameOrIndex: string | number, loop: boolean) {
        if (typeof (nameOrIndex) === "string") {
            if (loop) this._playing = true
            this._loop = loop
            this.animationName = nameOrIndex
        } else {
            if (this._content) this._content.play(nameOrIndex, loop)
        }
    }

    /**
     * 停止动画
     */
    stop() {
        if (this._content) this._content.stop()
    }

    private onChange() {
        if (!this._content)
            return

        if (this._animationName) {
            if (this._playing)
                this._content.play(this._animationName, this._loop)
            else
                this._content.play(this._animationName, false, true, this._frame, this._frame)
        } else {
            this._content.stop()
        }

        if (this._skinName)
            this._content.showSkinByName(this._skinName)
        else
            this._content.showSkinByIndex(0)
        Laya.timer.callLater(this.displayObject, this.displayObject.event, [Event.CHANGE])
    }

    protected loadExternal() {
        this.loadSkeleton ??= new Skeleton()
        this.loadSkeleton.load(this.url, Handler.create(this, this.loadEndHandler))
    }

    private loadEndHandler() {
        if (this.loadSkeleton) {
            this._url = null
            this.setSkeleton(this.loadSkeleton)
            this.loadSkeleton = null
        }
    }

    private updateLayout() {
        let cw = this.sourceWidth
        let ch = this.sourceHeight

        if (this._autoSize) {
            this._updatingLayout = true
            if (cw == 0)
                cw = 50
            if (ch == 0)
                ch = 30

            this.setSize(cw, ch)
            this._updatingLayout = false

            if (cw == this._width && ch == this._height) {
                this._container.scale(1, 1)
                this._container.pos(0, 0)

                return
            }
        }

        let sx = 1, sy = 1
        if (this._fill != LoaderFillType.None) {
            sx = this.width / this.sourceWidth
            sy = this.height / this.sourceHeight

            if (sx != 1 || sy != 1) {
                if (this._fill == LoaderFillType.ScaleMatchHeight)
                    sx = sy
                else if (this._fill == LoaderFillType.ScaleMatchWidth)
                    sy = sx
                else if (this._fill == LoaderFillType.Scale) {
                    if (sx > sy)
                        sx = sy
                    else
                        sy = sx
                } else if (this._fill == LoaderFillType.ScaleNoBorder) {
                    if (sx > sy)
                        sy = sx
                    else
                        sx = sy
                }
                if (this._shrinkOnly) {
                    if (sx > 1)
                        sx = 1
                    if (sy > 1)
                        sy = 1
                }
                cw = this.sourceWidth * sx
                ch = this.sourceHeight * sy
            }
        }

        this._container.scale(sx, sy)

        let nx: number, ny: number
        if (this._align == "center")
            nx = Math.floor((this.width - cw) / 2)
        else if (this._align == "right")
            nx = this.width - cw
        else
            nx = 0
        if (this._verticalAlign == "middle")
            ny = Math.floor((this.height - ch) / 2)
        else if (this._verticalAlign == "bottom")
            ny = this.height - ch
        else
            ny = 0
        this._container.pos(nx, ny)
    }

    private clearContent() {
        this._contentItem = null
        if (this._content) {
            this._container.removeChild(this._content)
            this._content.destroy()
            this._content = null
        }
        if (this.loadSkeleton) this.loadSkeleton.destroy()
        this.loadSkeleton = null
    }

    protected override handleSizeChanged() {
        super.handleSizeChanged()
        if (!this._updatingLayout)
            this.updateLayout()
    }

}