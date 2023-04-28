import GComponent = fgui.GComponent;
import SpineTemplet = Laya.SpineTemplet;
import SpineVersion = Laya.SpineVersion;
import Event = Laya.Event;
import SpineTempletBase = Laya.SpineTempletBase;
import Point = Laya.Point;
import SpineSkeleton = Laya.SpineSkeleton;
import Rectangle = Laya.Rectangle;
import {ISkeletonPlay} from "../interfaces/ICommon";
import SoundChannel = Laya.SoundChannel;
import SoundManager = Laya.SoundManager;
import Handler = Laya.Handler;
import {GSkeleton} from "./GSkeleton";

export class GSpineSkeleton extends GComponent {

    /** 经过时间 */
    private _t = 0
    private p1: Point
    private p2: Point
    private p3: Point
    private p4: Point

    private readonly ver: SpineVersion
    private spineSkeleton: Laya.SpineSkeleton
    private template: Laya.SpineTemplet
    /** 加载路径 */
    private _aniPath: string
    private _complete: ParamHandler
    private playGroupIndex = 0
    /** 缓存每次播放的名字或下标 */
    nameOrIndex: string | number
    /** 播放结束执行函数 */
    private stoppedHandler: Laya.Handler[] = []
    /**
     * 动画播放速率 1为标准速率
     * @default 1
     */
    playbackRate = 1
    /**
     * 播放数据
     */
    private skeletonPlay: ISkeletonPlay

    constructor(ver: SpineVersion = SpineVersion.v3_8) {
        super()
        this.ver = ver
        this.template = new SpineTemplet(this.ver)
        this.template.on(Event.COMPLETE, this, this.onComplete)
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
     * 加载json 或 skel格式的骨骼文件
     * @param jsonOrSkelUrl
     * @param handler 回调方法
     */
    load(jsonOrSkelUrl: string, handler: ParamHandler) {
        this._complete = handler
        this._aniPath = jsonOrSkelUrl
        this.template.loadAni(jsonOrSkelUrl)
    }

    get aniPath(): string {
        return this._aniPath
    }

    private onComplete(spine: SpineTempletBase) {
        this.spineSkeleton.init(spine)
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
     * 播放动画
     *
     * @param    nameOrIndex    动画名字或者索引
     * @param    loop        是否循环播放
     * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param    start        起始时间
     * @param    end            结束时间
     * @param    freshSkin    是否刷新皮肤数据
     * @param    playAudio    是否播放音频
     */
    play(nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop: boolean, force = true, start = 0, end = 0, freshSkin = true, playAudio = false) {
        if (this.asSkeleton.templet == null) return
        this.playGroupIndex = 0
        if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
            if (nameOrIndex.nameOrIndex == null || (typeof nameOrIndex.nameOrIndex === "number" && nameOrIndex.nameOrIndex < 0)) return
            this.playAni(nameOrIndex)
            return
        }
        if (typeof nameOrIndex === "number" && nameOrIndex < 0) return
        this.playAni({
            nameOrIndex: nameOrIndex, loop: loop, force: force,
            start: start, end: end, freshSkin: freshSkin, playAudio: playAudio
        })
    }

    playAni(skeletonPlay: ISkeletonPlay, playGroupIndex = -1) {
        if (this.asSkeleton.templet == null) return
        if (skeletonPlay == null && this.skeletonPlay == null) {
            console.warn("not found play data " + skeletonPlay)
            return;
        }
        if (skeletonPlay) {
            skeletonPlay.loop ??= true
            this.skeletonPlay = skeletonPlay
        }
        if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
            playGroupIndex = playGroupIndex < 0 ? 0 : playGroupIndex
            this.nameOrIndex = this.skeletonPlay.nameOrIndex[playGroupIndex]
        } else {
            this.nameOrIndex = this.skeletonPlay.nameOrIndex ?? 0
        }
        this.asSkeleton.playbackRate(this.skeletonPlay.playbackRate ?? this.playbackRate)

        if (this.skeletonPlay.delayPlay && this.skeletonPlay.delayPlay > 0) {
            Laya.timer.once(this.skeletonPlay.delayPlay, this, this._play, [this.skeletonPlay])
        } else {
            this._play(this.skeletonPlay)
        }
    }

    private _play(skeletonPlay: ISkeletonPlay) {
        this.asSkeleton.play(this.nameOrIndex, false, skeletonPlay.force ?? true,
            skeletonPlay.start ?? 0, skeletonPlay.end ?? 0,
            skeletonPlay.freshSkin ?? true, skeletonPlay.playAudio ?? true)
    }

    private onPlayStopped(loop: boolean, force: boolean, freshSkin: boolean) {
        if (Array.isArray(this.skeletonPlay.nameOrIndex) && this.skeletonPlay.nameOrIndex.length > 0) {
            // 在播放动画数组
            this.playGroupIndex++
            let isNewPro = false
            if (this.skeletonPlay.nameOrIndex.length > this.playGroupIndex ||
                (this.skeletonPlay.loop && (isNewPro = true) && (this.playGroupIndex = 0) === 0)) {
                if (isNewPro && this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                    Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex])
                } else {
                    this.playAni(this.skeletonPlay, this.playGroupIndex)
                }
                return
            }
        } else {
            if (this.skeletonPlay.loop) {
                if (this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                    Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex])
                } else {
                    this.playAni(this.skeletonPlay, this.playGroupIndex)
                }
                return
            }
        }
        for (let i = 0; i < this.stoppedHandler.length; i++) {
            this.stoppedHandler[i].run()
        }
    }

    paused() {
        this.asSkeleton.paused()
    }

    resume() {
        this.asSkeleton.resume()
    }

    stop() {
        this.asSkeleton.stop()
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

    /**
     * 得到指定动画的索引
     * @param aniName 动画名字
     */
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

    getAniNameByIndex(index: number) {
        return this.asSkeleton.templet?.getAniNameByIndex(index)
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

    get t() {
        return this._t
    }

    set t(value: number) {
        this._t = value
        this.x = this.getX()
        this.y = this.getY()
    }

    getX() {
        return Math.pow((1 - this._t), 3) * this.p1.x
            + 3 * this.p2.x * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.x * this._t * this._t * (1 - this._t)
            + this.p4.x * Math.pow(this._t, 3)
    }

    getY() {
        return Math.pow((1 - this._t), 3) * this.p1.y
            + 3 * this.p2.y * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.y * this._t * this._t * (1 - this._t)
            + this.p4.y * Math.pow(this._t, 3)
    }

    setStartPoint(tempX: number, tempY: number) {
        this.p1 = new Point(tempX, tempY)
        this._t = 0
    }

    setMiddlePoint(tempX: number, tempY: number) {
        this.p2 = new Point(tempX, tempY)
        this.p3 = this.p2
    }

    setMiddlePoint2(tempX: number, tempY: number, tempX2: number, tempY2: number) {
        this.p2 = new Point(tempX, tempY)
        this.p3 = new Point(tempX2, tempY2)
    }

    setEndPoint(tempX: number, tempY: number) {
        this.p4 = new Point(tempX, tempY)
    }

    dispose() {
        super.dispose()
    }

}