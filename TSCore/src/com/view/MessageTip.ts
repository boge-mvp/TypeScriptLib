import GTextField = fgui.GTextField;
import Tween = Laya.Tween;
import UIPackage = fgui.UIPackage;
import Pool = Laya.Pool;
import RelationType = fgui.RelationType;
import Handler = Laya.Handler;
import {LanguageUtils} from "../utils/LanguageUtils"
import {StringUtil} from "../utils/StringUtil"

/** 消息提示框 */
export class MessageTip extends fgui.GComponent {

    private static NAME = "MessageTip"
    /** 使用中的 */
    private static usePool: MessageTip[] = []
    /** 缓存的内容 */
    private static cacheContent: { time: number, content: string }[] = []
    /** 展示时间
     * @default 1800
     */
    static displayTime = 1800
    content: GTextField
    tween: Tween
    /** 缓存的字体大小 */
    tempFontSize: number
    /** 当前执行的步骤 */
    private steps: number

    /** 依附的父组件 默认 GRoot */
    rootParent: fgui.GComponent

    protected override constructFromXML(xml: any) {
        super.constructFromXML(xml)
        this.touchable = false
        this.content = this.getChild("n1").asTextField
        this.tempFontSize = this.content.fontSize

    }

    /**
     * 设置显示文本字体大小
     * @param value 大小
     */
    set fontSize(value: number) {
        this.content.fontSize = value
    }

    get fontSize(): number {
        return this.content.fontSize
    }

    /**
     * 显示文本提示框
     * @see LibStr
     * @param value 内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
     * @param [duration = 1800ms] 提示内容展示时长
     */
    static showTip(value: string | number | any[], duration = MessageTip.displayTime) {
        if (!UIPackage.getByName("common") || !value)
            return
        if (Array.isArray(value)) {
            value[0] = LanguageUtils.inst.getStr(value[0])
            value = StringUtil.format.apply(null, value) as string
        } else {
            value = LanguageUtils.inst.getStr(value)
        }
        MessageTip.cacheContent.push({time: duration, content: value})
        if (MessageTip.cacheContent.length > 5) {// 最多缓存5条
            MessageTip.cacheContent.shift()
        }
        MessageTip.createMsgTip()
    }

    private static createMsgTip() {
        if (MessageTip.cacheContent.length < 1) return
        const tipData = MessageTip.cacheContent.shift()
        let mt: MessageTip = Pool.getItemByCreateFun(MessageTip.NAME, this.createHandler)
        mt.showMes(tipData.content, tipData.time)

        // 已经显示2个或以上  加消失
        if (MessageTip.usePool.length < 2) return
        let len = MessageTip.usePool.length - 2
        for (let i = len; i >= 0; i--) {
            const msg = MessageTip.usePool[i]
            if (len === i) {
                if (msg.steps == 1) {
                    msg.tween?.complete()
                    msg.movePoint()
                } else if (msg.steps == 2) {
                    msg.movePoint()
                }
            } else { // 至少有3个值了
                if (msg.steps < 3) {
                    Tween.clearAll(msg)
                    msg.tween = null
                    msg.movePoint(((fgui.GRoot.inst.height - msg.height) >> 1) - msg.moveUpStep * 2)
                    if (msg.steps === 1) msg.alpha = msg.scaleX = 1
                    msg.showEnd(400)
                }
            }
        }

    }

    private static createHandler() {
        return UIPackage.createObjectFromURL("//common/MessageTip", MessageTip) as MessageTip
    }

    /**
     * 显示弹窗内容
     */
    private showMes(msg: string, duration: number) {
        this["applyPivot"]()
        this.width = fgui.GRoot.inst.width
//		this.fontSize = Math.floor(this.tempFontSize * AlertPanel.inst.width / this.initWidth)
        this.content.text = msg
        this.alpha = .1
        this.setXY(0, (fgui.GRoot.inst.height - this.height) >> 1)
        this.scaleX = .5
        this.addRelation(fgui.GRoot.inst, RelationType.Width)
        this.getParent().addChild(this)
        MessageTip.usePool.push(this)
        this.steps = 1
        this.tween = Tween.to(this, {alpha: 1, scaleX: 1}, 400,
            null, Handler.create(this, this.showEnd, [duration]))
    }

    /**
     * 向上移动一次的距离
     * @private
     */
    private get moveUpStep() {
        return this.height /* + 5 */
    }

    private movePoint(moveY = -1) {
        this.tween?.pause() // 移动过程中先暂停
        if (moveY === -1) moveY = this.y - this.moveUpStep
        Tween.to(this, {y: moveY}, 300, null, Handler.create(this, () => {
            this.tween?.resume()
        }), 0, false)
    }

    private showEnd(delay = 0) {
        this.steps = delay === 0 ? 3 : 2
        this.tween = Tween.to(this, {
            alpha: 0,
            scaleX: .5,
            y: this.y - 100
        }, 400, null, Handler.create(this, this.hideEnd), delay)
    }

    private hideEnd() {
        this.steps = 3
        Tween.clearAll(this)
        this.tween = null
        this.removeRelation(fgui.GRoot.inst, RelationType.Width)
        this.removeFromParent()
        Pool.recover(MessageTip.NAME, this)
        let index = MessageTip.usePool.indexOf(this)
        MessageTip.usePool.splice(index, 1)
        MessageTip.createMsgTip()
    }

    /** 清楚所有提示 */
    static clearAll() {
        MessageTip.cacheContent.splice(0, MessageTip.cacheContent.length)
        while (MessageTip.usePool.length) {
            MessageTip.usePool.shift().hideEnd()
        }
    }

    getParent() {
        return this.rootParent || fgui.GRoot.inst
    }


}

