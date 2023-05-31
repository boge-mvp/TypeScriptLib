import GComponent = fgui.GComponent;
import Point = Laya.Point;
import {ISkeleton} from "../interfaces/ISkeleton"
import {Log} from "../Log";
import {ActionEvent} from "../Factory";

export abstract class BaseSkeleton extends mixinExt(ActionEvent, GComponent) implements ISkeleton {

    /** 经过时间 */
    private _t = 0
    private p1: Point
    private p2: Point
    private p3: Point
    private p4: Point

    /** 播放动画数组的索引 */
    protected playGroupIndex = 0
    /** 缓存每次播放的名字或下标 */
    nameOrIndex: string | number
    /** 播放结束执行函数 */
    protected stoppedHandler: Laya.Handler[] = []
    /**
     * 动画播放速率 1为标准速率
     * @default 1
     */
    playbackRate = 1
    /**
     * 播放数据
     */
    protected skeletonPlay: ISkeletonPlay
    /** 加载路径 */
    protected _aniPath: string
    protected _complete: ParamHandler


    get aniPath() {
        return this._aniPath
    }

    /**
     * 播放动画
     *
     * @param    nameOrIndex    动画名字或者索引
     * @param    loop        是否循环播放 默认true
     * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param    start        起始时间
     * @param    end            结束时间
     * @param    freshSkin    是否刷新皮肤数据
     * @param    playAudio    是否播放音频
     */
    play(nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop: boolean = true, force = true, start = 0, end = 0, freshSkin = true, playAudio = false) {
        if (this.asSkeleton.templet == null) return
        this.playGroupIndex = 0
        if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
            if (nameOrIndex.nameOrIndex && (typeof nameOrIndex.nameOrIndex === "number" && nameOrIndex.nameOrIndex < 0)) return
            this.playAni(nameOrIndex)
            return
        }
        if (typeof nameOrIndex === "number" && nameOrIndex < 0) return
        this.playAni({
            nameOrIndex: nameOrIndex, loop: loop, force: force,
            start: start, end: end, freshSkin: freshSkin, playAudio: playAudio
        })
    }

    /**
     * 播放动画
     * @param skeletonPlay 播放数据
     * @param playGroupIndex 如果是播放数组动画 需要要播放动画的位置
     */
    playAni(skeletonPlay: ISkeletonPlay, playGroupIndex = -1) {
        if (this.asSkeleton.templet == null) return
        if (skeletonPlay == null && this.skeletonPlay == null) {
            Log.warn("not found play data " + skeletonPlay)
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
            Laya.timer.once(this.skeletonPlay.delayPlay, this, this._play)
        } else {
            this._play()
        }
    }

    private _play() {
        this.asSkeleton.play(this.nameOrIndex, false, this.skeletonPlay.force ?? true,
            this.skeletonPlay.start ?? 0, this.skeletonPlay.end ?? 0,
            this.skeletonPlay.freshSkin ?? true, this.skeletonPlay.playAudio ?? true)
    }

    protected onPlayStopped() {
        if (Array.isArray(this.skeletonPlay.nameOrIndex) && this.skeletonPlay.nameOrIndex.length > 0) {
            // 在播放动画数组
            this.playGroupIndex++
            let isNewPro = false
            if (this.skeletonPlay.nameOrIndex.length > this.playGroupIndex
                || (this.skeletonPlay.loop && (isNewPro = true) && (this.playGroupIndex = 0) === 0)) {
                if (isNewPro && this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                    Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex])
                } else {
                    this.playAni(this.skeletonPlay, this.playGroupIndex)
                }
                return
            }
            // 当全局数组动画loop是false loopPlayIndex > -1
            if (this.skeletonPlay.loopPlayIndex > -1 && this.skeletonPlay.loopPlayIndex < this.skeletonPlay.nameOrIndex.length) {
                this.playGroupIndex = this.skeletonPlay.loopPlayIndex
                this.playAni(this.skeletonPlay, this.playGroupIndex)
                return
            }
        } else {
            if (this.skeletonPlay.loop && this.getAnimDuration(0) > 0 && this.getAnimFrame(0) > 1) {
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

    getAniNameByIndex(index: number) {
        return this.asSkeleton.templet?.getAniNameByIndex(index)
    }

    getSkeletonPlay() {
        return this.skeletonPlay
    }


    /**
     * 获取实例 Skeleton
     */
    abstract get asSkeleton(): Laya.Skeleton | Laya.SpineSkeleton

    abstract getAniIndexByName(name: string): number

    abstract getAnimDuration(aniIndex: number): number

    abstract getAnimFrame(aniIndex: number): number

    abstract getAnimation(aniIndex: number): AnimationContent | spine.Animation

    abstract get currAniIndex(): number







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

}