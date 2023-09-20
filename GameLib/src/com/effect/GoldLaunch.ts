import GObject = fgui.GObject
import Point = Laya.Point
import Tween = Laya.Tween
import GComponent = fgui.GComponent
import {GoldLoader} from "./GoldLoader"

/**
 * 发射金币动画
 */
export class GoldLaunch {

    private goldAniBox: GoldLoader[] = []
    /** 宽 */
    goldW = 70
    /** 高 */
    goldH = 70
    private endPoint: Point
    /** 动画结束回调 */
    private endHandler: ParamHandler
    /** 动画结束数量 */
    private completeCount = 0

    /**
     * 播放金币动画
     * @param parent 要被添加到的舞台
     * @param goldUrl 金币图片
     * @param num 数量
     * @param endObject 最后结束对象
     * @param endHandler 动画播放结束回调
     */
    playObject(parent: GComponent, goldUrl: string, num: number, endObject: GObject, endHandler?: ParamHandler) {
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
    play(parent: GComponent, goldUrl: string, num: number, endPoint: Point, endHandler?: ParamHandler) {
        this.endPoint = endPoint
        this.endHandler = endHandler
        this.completeCount = 0
        let startX = (parent.root.width - this.goldW) >> 1
        let startY = parent.root.height - parent.root.height / 2
        for (let i = 0; i < num; i++) {
            let loader: GoldLoader = new GoldLoader()
            loader.setSize(this.goldW, this.goldH)
            loader.icon = goldUrl
            loader.visible = false
            loader.setXY(startX, startY)
            loader.setStartPoint(startX, startY)
            // Log.debug(startY, endPoint.y + (startY - endPoint.y)/2, endPoint.y)
            loader.setMiddlePoint(startX + 100, endPoint.y + (startY - endPoint.y) / 2)
            loader.setEndPoint(endPoint.x, endPoint.y)
            parent.addChild(loader)
            this.goldAniBox.push(loader)
            Tween.to(loader, {t: 1, update: new Laya.Handler(this, this.playUpdate, [loader])}, 500,
                null, Laya.Handler.create(this, this.playEndHandler, [loader]), i * 100)
        }
    }

    private playUpdate(loader: GoldLoader) {
        if (loader.t > 0) {
            loader.visible = true
        }
    }

    playEndHandler(loader: GoldLoader) {
        loader.removeFromParent()
        this.completeCount++
        if (this.completeCount == this.goldAniBox.length) {
            runFun(this.endHandler)
            while (this.goldAniBox.length) {
                this.goldAniBox.shift().dispose()
            }
        }
    }

    dispose() {
        this.endHandler = null
        let goldAniBox: GoldLoader
        while (this.goldAniBox.length) {
            goldAniBox = this.goldAniBox.shift()
            Tween.clearAll(goldAniBox)
            goldAniBox.dispose()
        }
    }

}