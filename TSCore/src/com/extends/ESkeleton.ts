import GComponent = fgui.GComponent;
import {ISkeleton} from "../interfaces/ISkeleton"
import {Log} from "../Log";
import {BezierCurves} from "../block/BezierCurves";
import {ActionEvent} from "../block/ActionEvent";
import {GSpineSkeleton} from "../view/GSpineSkeleton";
import {GSkeleton} from "../view/GSkeleton";

export abstract class ESkeleton extends mixinExt(BezierCurves, ActionEvent, GComponent) implements ISkeleton {

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
    /**
     * 当前spine正在使用的资源路径
     */
    protected _spineResPath: string
    protected _complete: ParamHandler
    /**
     * 播放循环次数
     * @private
     */
    private _loopCount = 0

    get aniPath() {
        return this._aniPath
    }
    
    get spineResPath() {
        return this._spineResPath
    }

    /**
     * 播放动画
     *
     * @param    nameOrIndex    动画名字或者索引 如果此值是ISkeletonPlay对象，后面设置的全部将失效
     * @param    [loop=true]        是否循环播放
     * @param    [force=true]        false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param    [start=0]        起始时间 毫秒
     * @param    [end=0]            结束时间 毫秒
     * @param    [freshSkin=true]    是否刷新皮肤数据
     * @param    [playAudio=true]    是否播放音频
     */
    play(nameOrIndex: string | number | (string | number | PlaySkeletonFrame)[] | ISkeletonPlay, loop = true, force = true,
         start = 0, end = 0, freshSkin = true, playAudio = true) {
        if (!this.asSkeleton.templet) return
        // 如果不是数组 而是一个 object
        if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
            if (nameOrIndex.nameOrIndex && (typeof nameOrIndex.nameOrIndex === "number" && nameOrIndex.nameOrIndex < 0)) return
            this.playAni(nameOrIndex, 0)
            return
        }
        if (typeof nameOrIndex === "number" && nameOrIndex < 0) return
        this.playAni({
            nameOrIndex: nameOrIndex, loop: loop, force: force,
            start: start, end: end, freshSkin: freshSkin, playAudio: playAudio
        }, Array.isArray(nameOrIndex) ? 0 : -1)
    }

    /**
     * 播放动画
     * @param skeletonPlay 播放数据
     * @param [playGroupIndex=-1] 如果是播放数组动画 需要要播放动画的位置
     */
    playAni(skeletonPlay: ISkeletonPlay, playGroupIndex = -1) {
        if (!this.asSkeleton.templet) return
        if (!skeletonPlay && !this.skeletonPlay) {
            Log.debug("not found play data " + skeletonPlay)
            return;
        }
        this.playGroupIndex = playGroupIndex
        if (skeletonPlay) {
            skeletonPlay.loop ??= true
            this.skeletonPlay = skeletonPlay
        }
        let delayPlay = this.skeletonPlay.delayPlay
        if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
            playGroupIndex = playGroupIndex < 0 ? 0 : playGroupIndex
            let play = this.skeletonPlay.nameOrIndex[playGroupIndex]
            if (typeof play === "object") {
                if (play.delayPlay) delayPlay = play.delayPlay
                play = play.nameOrIndex
            }
            this.nameOrIndex = play
        } else {
            this.nameOrIndex = this.skeletonPlay.nameOrIndex ?? 0
        }

        if (delayPlay && delayPlay > 0) {
            Laya.timer.once(delayPlay, this, this._play)
        } else {
            this._play()
        }
    }

    private _play() {
        if (this.skeletonPlay.progress) {
            if ("before" in this.skeletonPlay.progress) {
                runFun(this.skeletonPlay.progress.before, this.nameOrIndex)
            }
        }
        let force = this.skeletonPlay.force ?? true
        let start = this.skeletonPlay.start ?? 0
        let end = this.skeletonPlay.end ?? 0
        let freshSkin = this.skeletonPlay.freshSkin ?? true
        let playAudio = this.skeletonPlay.playAudio ?? true
        let playbackRate = this.skeletonPlay.playbackRate ?? this.playbackRate
        if (Array.isArray(this.skeletonPlay.nameOrIndex)) {
            let play = this.skeletonPlay.nameOrIndex[this.playGroupIndex]
            if (typeof play === "object") {
                force = play.force ?? force
                start = play.start ?? start
                end = play.end ?? end
                freshSkin = play.freshSkin ?? freshSkin
                playAudio = play.playAudio ?? playAudio
                playbackRate = play.playbackRate ?? playbackRate
            }
        }

        this.asSkeleton.playbackRate(playbackRate)

        this.asSkeleton.play(this.nameOrIndex, false, force, start, end, freshSkin, playAudio)

        this.displayObject.event(Laya.Event.SPINE_PLAY, this.nameOrIndex)
    }

    /**
     * 当动画停止时的回调函数 或 使用 skeleton.stop()
     */
    protected onPlayStopped() {
        if (this.skeletonPlay) {
            // 检查播放进度信息，如果存在则执行相应的“after”或“before”回调函数
            if (this.skeletonPlay.progress) {
                if ("after" in this.skeletonPlay.progress) {
                    runFun(this.skeletonPlay.progress.after, this.nameOrIndex)
                } else if (typeof this.skeletonPlay.progress === "function") {
                    runFun(this.skeletonPlay.progress, this.nameOrIndex)
                }
            }
            // 如果当前动画播放队列（nameOrIndex）是一个数组且长度大于0，则进行如下处理：
            if (Array.isArray(this.skeletonPlay.nameOrIndex) && this.skeletonPlay.nameOrIndex.length > 0) {
                // 获取当前播放索引对应的动画数据
                const playData = this.skeletonPlay.nameOrIndex[this.playGroupIndex]
                // 当前动画播放完成后需要循环播放的次数
                let loopCount = 0
                if (typeof playData === "object") {
                    loopCount = playData.loopCount ?? loopCount
                    runFun(playData.playComplete, this._loopCount)
                }
                // 更新循环播放计数器并判断是否需要切换到下一个动画
                if (loopCount > 0 && loopCount != this._loopCount) {
                    this._loopCount++
                } else {
                    this.playGroupIndex++
                    this._loopCount = 0
                }
                // 判断是否需要开始新的动画序列或循环播放
                let isNewPro = false
                if (this.skeletonPlay.nameOrIndex.length > this.playGroupIndex
                    || (this.skeletonPlay.loop && (isNewPro = true) && (this.playGroupIndex = 0) === 0)) {
                    // 若是新序列且设置有延迟循环播放时间，则延时后播放
                    if (isNewPro && this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                        // 循环播放有延迟的时候  单独处理
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
                // 当播放队列不是数组时，根据loop属性和动画时长来决定是否循环播放当前动画
                if (this.skeletonPlay.loop && this.getAnimDuration(this.nameOrIndex ?? 0) > 0) {
                    let len = 0
                    if (this instanceof GSpineSkeleton) {
                        // @ts-ignore
                        len = (this as GSpineSkeleton).getAnimation(this.nameOrIndex ?? 0).timelines[0].getFrameCount()
                    } else if (this instanceof GSkeleton) {
                        len = (this as GSkeleton).getAnimation(this.nameOrIndex ?? 0).totalKeyframeDatasLength
                    }
                    if (this.getAnimFrame(this.nameOrIndex ?? 0) > 1 || len > 1) {
                        // 若设置了延迟循环播放时间，则延时后播放；否则立即播放
                        if (this.skeletonPlay.delayLoopPlay && this.skeletonPlay.delayLoopPlay > 0) {
                            Laya.timer.once(this.skeletonPlay.delayLoopPlay, this, this.playAni, [this.skeletonPlay, this.playGroupIndex])
                        } else {
                            this.playAni(this.skeletonPlay, this.playGroupIndex)
                        }
                        return
                    }
                }
            }
            const fun = this.skeletonPlay.playComplete
            // 执行播放结束 并且没有循环播放 那么清理播放数据源
            this.skeletonPlay = null
            // 执行播放完成的回调函数
            runFun(fun)

        }
        // 执行播放完成的回调函数
        this.stoppedHandler.forEach(value => value.run())
    }

    paused() {
        this.asSkeleton.paused()
    }

    resume() {
        this.asSkeleton.resume()
    }

    stop() {
        this.skeletonPlay = null
        Laya.timer.clearAll(this)
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

    abstract getAnimDuration(aniIndex: number | string | (number | string)[]): number

    abstract getAnimFrame(aniIndex: number | string): number

    abstract getAnimation(aniIndex: number | string): AnimationContent | spine.Animation

    abstract get currAniIndex(): number

}