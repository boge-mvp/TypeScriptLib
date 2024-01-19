import Point = Laya.Point
import Tween = Laya.Tween
import GObject = fgui.GObject
import {GoldSpray} from "./GoldSpray"
import MathKit = tsCore.MathKit;

/** 播放各种金币动画 */
export class GoldSprayAni {

    private goldAniBox: GoldSpray[] = []

    private endPoint: Point
    /** Y坐标位置 */
    private centreY
    /** 动画结束回调 */
    private endHandler: ParamHandler
    /**
     * 宽
     * @default 70
     */
    goldW = 70
    /**
     * 高
     * @default 70
     */
    goldH = 70
    /** 重写最后一步方法 */
    readTweenFunction: ParamHandler
    /** 动画结束数量 */
    private completeCount = 0
    /**
     * 回收速度
     * @default 500
     */
    recoveryDuration = 500
    /**
     * 金币喷出速度
     * @default 40
     */
    goldSpeed = 40
    /**
     * 重力Y
     * @default 2
     */
    gravityY = 2

    /**
     * 播放金币动画
     * @param parent 要被添加到的舞台
     * @param goldUrl 金币图片
     * @param num 数量
     * @param endObject 最后结束对象
     * @param endHandler 动画播放结束回调
     */
    playObject(parent: fgui.GComponent, goldUrl: string, num: number, endObject: GObject, endHandler?: ParamHandler) {
        let endPoint = endObject.localToGlobal()
        parent.globalToLocal(endPoint.x, endPoint.y, endPoint)
        // 设置最终位置居中
        endPoint.x += endObject.width >> 1
        endPoint.y += endObject.height >> 1
        endPoint.x -= this.goldW >> 1
        endPoint.y -= this.goldH >> 1
        this.play(parent, goldUrl, num, endPoint, endHandler)
    }

    /**
     * 播放金币动画
     * @param parent 要被添加到的舞台
     * @param goldUrl 金币图片
     * @param num 数量
     * @param endPoint 最后结束坐标
     * @param endHandler 动画播放结束回调
     */
    play(parent: fgui.GComponent, goldUrl: string, num: number, endPoint: Point, endHandler?: ParamHandler) {
        this.endPoint = endPoint
        this.endHandler = endHandler
        this.centreY = parent.root.height / 2
        let startX = (parent.root.width - this.goldW) >> 1
        let startY = parent.root.height - parent.root.height / 4
        for (let i = 0; i < num; i++) {
            let loader: GoldSpray = new GoldSpray()
            loader.setSize(this.goldW, this.goldH)
            loader.icon = goldUrl
            loader.initX = startX
            loader.initY = startY
            loader.vx = Math.random() * 12 - 6
            loader.vy = Math.random() * -5 - this.goldSpeed
            loader.tempY = loader.vy
            loader.gy = this.gravityY
            loader.gravitySpeed = this.gravityY
            loader.isNegativeGrowth = true
            loader.setXY(startX, startY)
            parent.addChild(loader)
            this.goldAniBox.push(loader)
        }
        Laya.timer.clear(this, this.onFrameLoop)
        Laya.timer.frameLoop(1, this, this.onFrameLoop)
    }

    private onFrameLoop() {
        let goldAniBox: GoldSpray
        for (let i = 0; i < this.goldAniBox.length; i++) {
            goldAniBox = this.goldAniBox[i]
            if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.centreY)) {
                goldAniBox.update()
            } else {
                goldAniBox.isStop = true
            }
        }
        // 判断是否还有可以动的
        let count = 0
        for (let i = 0; i < this.goldAniBox.length; i++) {
            goldAniBox = this.goldAniBox[i]
            if (!goldAniBox.isStop) {
                count++
            }
        }
        if (count == 0) {
            // 全停了
            Laya.timer.clear(this, this.onFrameLoop)
            this.playEndPointAni()
        }
    }

    private playEndPointAni() {
        this.completeCount = 0
        if (this.readTweenFunction) {
            runFun(this.readTweenFunction, this.goldAniBox, this.endPoint)
            return
        }
        if (!this.endPoint) {
            this.playComplete()
            return
        }
        let goldAniBox: GoldSpray
        for (let i = 0; i < this.goldAniBox.length; i++) {
            goldAniBox = this.goldAniBox[i]
            goldAniBox.setStartPoint(goldAniBox.x, goldAniBox.y)
            goldAniBox.setMiddlePoint(
                goldAniBox.x + (this.endPoint.x - goldAniBox.x) / 2 + MathKit.random(200, 300),
                goldAniBox.y + (this.endPoint.y - goldAniBox.y) / 2
                - (MathKit.random(0, 100) * (this.endPoint.y > this.centreY ? -1 : 1))
            )
            goldAniBox.setEndPoint(this.endPoint.x, this.endPoint.y)
            Tween.to(goldAniBox, {t: 1},
                this.recoveryDuration, null,
                Laya.Handler.create(this, this.playComplete), i * 5 + 300)
        }
    }

    playComplete() {
        this.completeCount++
        if (this.completeCount == this.goldAniBox.length) {
            runFun(this.endHandler)
            while (this.goldAniBox.length) {
                this.goldAniBox.shift().dispose()
            }
        }
    }

    dispose() {
        Laya.timer.clear(this, this.onFrameLoop)
        this.readTweenFunction = null
        this.endHandler = null
        let goldAniBox: GoldSpray
        while (this.goldAniBox.length) {
            goldAniBox = this.goldAniBox.shift()
            Tween.clearAll(goldAniBox)
            goldAniBox.dispose()
        }
    }

}