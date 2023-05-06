import SpineTemplet = Laya.SpineTemplet;
import SpineVersion = Laya.SpineVersion;
import Event = Laya.Event;
import SpineTempletBase = Laya.SpineTempletBase;
import Rectangle = Laya.Rectangle;
import {ISkeletonPlay} from "../interfaces/ICommon";
import {BaseSkeleton} from "../core/BaseSkeleton";

export class GSpineSkeleton extends BaseSkeleton {

    ver: SpineVersion
    private spineSkeleton: Laya.SpineSkeleton
    private template: Laya.SpineTemplet

    constructor(ver: SpineVersion = SpineVersion.v3_8) {
        super()
        this.ver = ver
    }

    protected createDisplayObject() {
        super.createDisplayObject()

        this.spineSkeleton = this._displayObject = new Laya.SpineSkeleton()
        this._displayObject["$owner"] = this
        this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false
        this._displayObject.on(Event.STOPPED, this, this.onPlayStopped)

        this._container = this._displayObject

    }

    get asSkeleton() {
        return this.spineSkeleton
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

        if (this.template == null || (ver && this.ver != ver)) {
            this.template = new SpineTemplet(this.ver)
            this.template.on(Event.COMPLETE, this, this.onComplete)
        }
        this.template.loadAni(jsonOrSkelUrl)
    }

    private onComplete(spine: SpineTempletBase) {
        this.spineSkeleton.init(spine ?? this.template)
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

    set touchable(value: boolean) {
        // if (this.spineSkeleton) this.spineSkeleton.mouseEnabled = this.spineSkeleton.mouseThrough = this.touchable
        super.touchable = value
    }

    get touchable() {
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

    getAnimation(aniIndex: number): spine.Animation {
        return this.getSkeletonNative()?.data?.animations[aniIndex]
    }

    getAnimDuration(aniIndex: number): number {
        return this.getAnimation(aniIndex).duration
    }

    getAnimFrame(aniIndex: number): number {
        return this.getAnimation(aniIndex).timelines.length
    }

    get currAniIndex(): number {
        let _currAniName = this.asSkeleton["_currAniName"]
        if (_currAniName == null) return -1
        return this.getAniIndexByName(_currAniName)
    }


    set hitArea(rec: Rectangle) {
        // if (this.spineSkeleton) {
        //     this.spineSkeleton.hitArea = rec
        //     return
        // }
        this.displayObject.hitArea = rec
    }


    on(type: string, thisObject: any, listener: Function, args: any[] = null) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.push(new Laya.Handler(thisObject, listener, args))
            return
        }
        if (this.spineSkeleton) {
            this.spineSkeleton.on(type, thisObject, listener, args)
            return
        }
        super.on(type, thisObject, listener, args)
    }

    off(type: string, thisObject: any, listener: Function) {
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
        if (this.spineSkeleton) {
            this.spineSkeleton.off(type, thisObject, listener)
            return
        }
        super.off(type, thisObject, listener)
    }

    offAll(type: string = null) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.length = 0
            return
        }
        if (this.spineSkeleton) {
            this.spineSkeleton.offAll(type)
            return
        }
        this.displayObject.offAll(type)
    }



    dispose() {
        super.dispose()
    }

}