import GLoader = fgui.GLoader

export class MyGLoader extends GLoader {

    /**
     * 加载重试次数
     */
    loadRetryCount = 0
    loadCount = 0

    protected loadExternal() {
        this.loadCount = 0
        super.loadExternal();
    }

    protected onExternalLoadSuccess(texture: Laya.Texture) {
        super.onExternalLoadSuccess(texture)
        if (this.displayObject) this.displayObject.event(Laya.Event.COMPLETE)
    }

    protected loadFromPackage(itemURL: string) {
        super.loadFromPackage(itemURL)
        if (this.displayObject) this.displayObject.event(Laya.Event.COMPLETE)
    }

    protected onExternalLoadFailed() {
        if (this.loadRetryCount > 0 && this.loadCount < this.loadRetryCount) {
            this.loadCount++
            super.loadExternal()
            return
        }
        super.onExternalLoadFailed()
        if (this.displayObject) this.displayObject.event(Laya.Event.COMPLETE)
    }

}