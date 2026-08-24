import SpineTemplet = Laya.SpineTemplet;
import SpineVersion = Laya.SpineVersion;
import Event = Laya.Event;
import SpineTempletBase = Laya.SpineTempletBase;
import Rectangle = Laya.Rectangle;
import {ESkeleton} from "../extends/ESkeleton";

export class GSpineSkeleton extends ESkeleton {

    ver: SpineVersion
    template?: Laya.SpineTemplet
    autoSize = false

    constructor(ver: SpineVersion = SpineVersion.v3_8) {
        super()
        this.ver = ver
    }

    protected override createDisplayObject() {
        this._displayObject = new Laya.SpineSkeleton()
        super.createDisplayObject()
    }

    get asSkeleton() {
        return <Laya.SpineSkeleton>this._displayObject
    }

    /**
     * 获取spine的Skeleton对象
     */
    getSkeletonNative(): spine.Skeleton {
        // @ts-ignore
        return this.asSkeleton.getSkeleton()
    }

    /**
     * 加载json 或 skel格式的骨骼文件
     * @param jsonOrSkelUrl
     * @param handler 回调方法
     * @param ver
     */
    load(jsonOrSkelUrl: string, handler: ParamHandler, ver?: SpineVersion) {
        this._complete = handler
        this._aniPath = jsonOrSkelUrl

        if (!this.template || (ver && this.ver != ver)) {
            this.template = new SpineTemplet(this.ver)
            this.template.on(Event.COMPLETE, this, this.onComplete)
            this.template.on(Event.ERROR, this, this.onError)
        }
        this.template.loadAni(jsonOrSkelUrl)
    }

    private onError() {
        this._spineResPath = undefined
    }

    private onComplete(spine: SpineTempletBase) {
        if (spine.loadResUrl != this.aniPath) return
        this._spineResPath = spine.loadResUrl
        const template = spine ?? this.template
        this.asSkeleton.init(template)
        if (this.autoSize) {
            const w = template?.skeletonData?.width ?? 0
            const h = template?.skeletonData?.height ?? 0
            this.setSize(w, h)
        }
        // 销毁已有的动画
        // for (let i = this.displayObject.numChildren - 1; i >= 0; i--) {
        //     let temp = this.displayObject.getChildAt(i)
        //     if (temp instanceof SpineSkeleton) {
        //         temp.destroy(true)
        //     }
        // }
        // if (this.spineSkeleton) {
        //     this.spineSkeleton.hitArea = this.displayObject.hitArea
        // }
        // this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
        // this.displayObject.addChild(this.spineSkeleton)
        runFun(this._complete, this)
    }

    override set touchable(value: boolean) {
        // if (this.spineSkeleton) this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
        super.touchable = value
    }

    override get touchable() {
        return super.touchable
    }

    /**
     * 通过名字显示一套皮肤
     * @param    name    皮肤的名字
     */
    showSkinByName(name: string) {
        this.asSkeleton.showSkinByName(name)
    }

    /**
     * 通过索引显示一套皮肤
     * @param    skinIndex    皮肤索引
     */
    showSkinByIndex(skinIndex: number) {
        this.asSkeleton.showSkinByIndex(skinIndex)
    }

    getAniIndexByName(aniName: string) {
        let animations = this.asSkeleton.templet.skeletonData.animations
        let index = -1
        for (let i = 0, n = animations.length; i < n; i++) {
            let animation = animations[i]
            if (animation && aniName == animation.name) {
                index = i
                break
            }
        }
        return index
    }

    getAllAnimation(): spine.Animation[] {
        return this.getSkeletonNative()?.data?.animations
    }

    getAllSkin() {
        return this.asSkeleton.templet?.skeletonData?.skins
    }

    getAnimation(aniIndex: number | string): spine.Animation | undefined {
        let animation: Nullable<spine.Animation>
        if (typeof aniIndex === "string") {
            animation = this.getAllAnimation().find(value => value.name === aniIndex)
        } else animation = this.getAllAnimation()[aniIndex]
        return animation
    }

    /**
     * 获取动画时长 秒
     * @param aniIndex
     */
    getAnimDuration(aniIndex: number | string | (number | string)[]) {
        let duration = 0
        if (Array.isArray(aniIndex)) {
            for (let i = 0; i < aniIndex.length; i++) {
                duration += this.getAnimDuration(aniIndex[i])
            }
        } else duration = this.getAnimation(aniIndex)?.duration || 0
        return duration
    }

    getAnimFrame(aniIndex: number | string) {
        return this.getAnimation(aniIndex)?.timelines?.length ?? 0
    }

    get currAniIndex() {
        let _currAniName = this.asSkeleton["_currAniName"]
        if (!_currAniName) return -1
        return this.getAniIndexByName(_currAniName)
    }


    set hitArea(rec: Rectangle) {
        // if (this.spineSkeleton) {
        //     this.spineSkeleton.hitArea = rec
        //     return
        // }
        this.displayObject.hitArea = rec
    }


    override on(type: string, thisObject: any, listener: Function, args?: any[]) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args))
            return
        }
        if (this.asSkeleton) {
            this.asSkeleton.on(type, thisObject, listener, args)
            return
        }
        super.on(type, thisObject, listener, args)
    }

    override off(type: string, thisObject: any, listener: Function) {
        if (type == Event.STOPPED) {
            for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                const handler = this.stoppedHandler[i]
                if (handler.caller == thisObject && handler.method == listener) {
                    handler.clear()
                    this.stoppedHandler.splice(i, 1)
                }
            }
            return
        }
        if (this.asSkeleton) {
            this.asSkeleton.off(type, thisObject, listener)
            return
        }
        super.off(type, thisObject, listener)
    }

    offAll(type?: string) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.length = 0
            return
        }
        if (this.asSkeleton) {
            this.asSkeleton.offAll(type)
            return
        }
        this.displayObject.offAll(type)
    }


    override dispose() {
        super.dispose()
    }

}