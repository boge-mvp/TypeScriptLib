import Point = Laya.Point;
import Tween = Laya.Tween;
import GObject = fgui.GObject;
import GRoot = fgui.GRoot;
import Ease = Laya.Ease;
import GComponent = fgui.GComponent;
import Sound = Laya.Sound;
import {GoldLoader} from "../effect/GoldLoader"
import {SceneManager} from "../manager/SceneManager";
import SoundUtils = tsCore.SoundUtils;
import MathKit = tsCore.MathKit;

/**
 * 金币动画
 */
export class GoldAniUtils {

    /**
     * 默认金币图标
     */
    static defaultIcon: string
    /**
     * 默认声音
     */
    static defaultSound = "sounds/gold.ogg"
    /**
     * 配置金币默认显示的面板
     */
    static defaultScene: GComponent

    private loaders: GoldLoader[] = []
    private count = 0
    private startPoint: Point
    private endPoint: Point
    private endHandler: ParamHandler
    private goldTween: Tween
    /** 宽 */
    goldW = 70

    /** 高 */
    goldH = 70

    icon: string
    sound: Sound | string
    parent: fgui.GComponent;

    constructor(icon?: string, parent?: GComponent, sound?: string | Sound) {
        this.icon = icon || GoldAniUtils.defaultIcon
        this.parent = parent || GoldAniUtils.defaultScene
        this.sound = sound || GoldAniUtils.defaultSound
    }

    /**
     * 播放金币动画
     * @param num 创建数量
     * @param startObject 开始对象 如果传入null 将用舞台中心做为起点
     * @param endObject 结束对象
     * @param endHandler 结束回调
     */
    playObject(num: number, startObject: GObject, endObject: GObject, endHandler?: ParamHandler) {
        if (!startObject || startObject.isDisposed || !startObject.displayObject) {
            this.startPoint = Point.create().setTo((this.scene.width >> 1), (this.scene.height >> 1))
        } else {
            this.startPoint = startObject.localToGlobal()
            this.globalToLocal(this.startPoint)
            this.startPoint.x += startObject.width / 2
            this.startPoint.y += startObject.height / 2
        }
        this.endPoint = endObject.localToGlobal()
        this.globalToLocal(this.endPoint)
        this.endPoint.x += endObject.width / 2
        this.endPoint.y += endObject.height / 2
        this.play(num, this.startPoint, this.endPoint, endHandler)
    }

    /**
     * 播放金币动画
     * @param num 创建数量
     * @param startPoint 开始位置
     * @param endPoint 结束位置
     * @param endHandler 结束回调
     */
    play(num: number, startPoint: Point, endPoint: Point, endHandler?: ParamHandler) {
        this.startPoint = startPoint
        this.endPoint = endPoint
        this.endHandler = endHandler
        this.specialAward(num)
        if (this.sound instanceof Sound) {
            this.sound.play()
        } else SoundUtils.playSound(this.sound)
    }

    /**
     * 特殊奖品 效果 - 移动至底部然后飘直指定位置
     * @param len 创建数量
     * @internal
     */
    private specialAward(len: number) {
        this.count = 0
        this.clearGoldLoader()
        for (let i = 0; i < len; i++) {
            let loader = GoldLoader.create()
            loader.icon = this.icon
            loader.setSize(this.goldW, this.goldH)
            loader.setXY(this.startPoint.x, this.startPoint.y)
            let tempX = this.startPoint.x + Math.random() * 250 - 125
            let tempY = this.startPoint.y + Math.random() * 50 + 100

            let endP = Point.create().setTo(this.endPoint.x - loader.width / 2, this.endPoint.y - loader.height / 2)

            loader.setStartPoint(tempX, tempY)
            loader.setMiddlePoint(tempX + (endP.x - tempX) / 2 + MathKit.random(200, 300),
                tempY + (endP.y - tempY) / 2 + MathKit.random(0, 100))
            loader.setEndPoint(endP.x, endP.y)


            this.addChild(loader)
            this.loaders.push(loader)

            endP.recover()

            loader.timeLine(this.onPlayAwardEnd.bind(this))
                .to({x: tempX, y: tempY}, 600, Ease.backOut, i * 5)
                .to({t: 1, scaleX: .7, scaleY: .7}, 600, Ease.linearNone, i * 5)
                .to({visible: 0}, 0)
                .play()
        }

        this.startPoint.recover()

    }

    private onPlayAwardEnd() {
        this.count++
        if (this.count == this.loaders.length) {
            this.clearGoldLoader()
            runFun(this.endHandler)
        }
    }


    /************************************  普通金币掉落动画  ***********************************/

    /**
     * 播放移动目标到指定目标位置
     * @param targetObject 要被移动的对象
     * @param endObject 结束对象
     * @param endHandler 完成回调
     * @param parent 父对象
     * @param props 附带的属性变化 或参数 duration,delay,ease
     */
    playGoldAni(targetObject: GObject, endObject: GObject, endHandler?: ParamHandler, parent?: GComponent, props?: any) {
        parent ??= this.scene
        let endGlobal = endObject.localToGlobal()
        parent.globalToLocal(endGlobal.x, endGlobal.y, endGlobal)
        let targetGlobal = targetObject.localToGlobal()
        parent.globalToLocal(targetGlobal.x, targetGlobal.y, targetGlobal)
        this.playGoldPointAni(targetObject, targetGlobal, endGlobal, endHandler, parent, props)

    }

    /**
     * 播放移动目标到指定位置
     * @param targetObject 要被移动的对象
     * @param startPoint 起始位置
     * @param endPoint 结束位置
     * @param endHandler 完成回调
     * @param parent 父对象
     * @param props 附带的属性变化 或参数 duration,delay,ease
     */
    playGoldPointAni(targetObject: GObject, startPoint: Point, endPoint: Point, endHandler?: ParamHandler, parent?, props?) {
        parent ??= this.scene
        props ??= {}
        targetObject.setXY(startPoint.x, startPoint.y)
        parent.addChild(targetObject)
        props.x = endPoint.x
        props.y = endPoint.y
        props.scaleX ??= .5
        props.scaleY ??= .5
        let duration = props.duration ?? 600
        let delay = props.delay ?? 0
        let ease = props.ease
        this.goldTween = Tween.to(targetObject, props, duration, ease,
            Laya.Handler.create(this, (endHandler: ParamHandler) => {
                this.goldTween = null
                runFun(endHandler)
            }, [endHandler]), delay)
    }


    private addChild(child: GoldLoader) {
        return this.scene.addChild(child)
    }

    private globalToLocal(target: Point) {
        this.scene.globalToLocal(target.x, target.y, target)
    }

    private get scene() {
        return this.parent || SceneManager.inst.scene || GRoot.inst
    }

    clearGoldLoader() {
        while (this.loaders.length) {
            this.loaders.shift().recover()
        }
    }

    dispose() {
        this.clearGoldLoader()
        this.goldTween?.clear()
    }

}