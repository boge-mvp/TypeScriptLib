import Point = Laya.Point
import GComponent = fgui.GComponent
import GRoot = fgui.GRoot
import {GoldSpray} from "./GoldSpray"
import {ActionLib} from "../actions/ActionLib"
import View = tsCore.View;
import SoundUtils = tsCore.SoundUtils;

export class GoldEffect extends View {

    private golds: GoldSpray[] = []
    private count = 0
    private maxCount = 100
    private recoveryPoint: Point
    /** 宽 */
    goldW = 80
    /** 高 */
    goldH = 80
    /** Y坐标位置 */
    private bottomLimit

    constructor() {
        super()
        this.regAction(ActionLib.PLAY_GOLD_EFFECT, this, this.showHandler)
        this.regAction(ActionLib.CLOSE_GOLD_EFFECT, this, this.closeHandler)

    }

    private showHandler(parent?: GComponent, max = 50, recoveryPoint?: Point) {
        this.recoveryPoint = recoveryPoint
        this.maxCount = max
        parent ??= GRoot.inst
        parent.addChild(this)
        Laya.timer.callLater(this, this.play)
    }

    play() {
        this.count = 0
        this.bottomLimit = this.root.height + this.goldH + 1
        for (let i = 0; i < this.maxCount; i++) {
            let loader = new GoldSpray()
            loader.setSize(this.goldW, this.goldH)
            loader.icon = "gold.png"
            let x = this.parent.width / 2 - this.goldW / 2
            let y = (this.parent.height - this.parent.height / 3) + Math.random() * 50 - 25
            loader.initX = x
            loader.initY = y
            loader.setXY(x, y)
            loader.vx = Math.random() * 20 - 10
            loader.vy = Math.random() * -5 - 40
            loader.gy = 1
            this.addChild(loader)
            this.count++
            this.golds.push(loader)
        }
        Laya.timer.frameLoop(1, this, this.onFrameLoop)
        SoundUtils.playSound("sounds/gold.ogg")
    }

    private onFrameLoop() {
        let goldAniBox: GoldSpray
        for (let i = 0; i < this.golds.length; i++) {
            goldAniBox = this.golds[i]
            if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.bottomLimit)) {
                goldAniBox.update()
            } else {
                goldAniBox.isStop = true
            }
        }
        // 判断是否还有可以动的
        let count = 0
        for (let i = 0; i < this.golds.length; i++) {
            goldAniBox = this.golds[i]
            if (!goldAniBox.isStop) {
                count++
            }
        }
        if (count == 0) {
            this.closeHandler()
        }
    }

    private closeHandler() {
        Laya.timer.clearAll(this)
        this.removeFromParent()
        while (this.golds.length) {
            let body = this.golds.shift()
            body.dispose()
        }
    }

    override dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

}