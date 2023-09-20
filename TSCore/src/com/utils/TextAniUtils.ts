import GTextField = fgui.GTextField;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import {StringUtil} from "./StringUtil"

/**
 * 文字动画
 */
export class TextAniUtils {

    /** 默认文本 */
    private _defaultText: string
    /** 当前要播放的文本 */
    private _playText: string
    /** 显示文本框 */
    private _textField: GTextField
    /** 当前动画显示文本 */
    private aniText: string
    /** 播放数字动画结束 */
    private _endCallBack: ParamHandler
    /** 保存播放文字动画的位置 */
    private textObj: any[] = []
    /** 闪烁次数 */
    private twinkleCount: number
    /** 是否正在闪烁中*/
    private isTwinkle: boolean
    /** 闪烁执行完成调用 */
    private twinkleCallHandler: ParamHandler
    /** 当前清楚完的数量 */
    private clearCount = 0
    /** 当前播放结束的数量 */
    private playEndCount = 0
    /** 要播放的一个数组文字 */
    private playTexts: any[]
    /** 数组文字位置 */
    private playIndex = 0

    constructor(defaultText: string, textField: GTextField) {
        this._defaultText = defaultText
        this._textField = textField
    }

    /**
     * 要播放的一组文字
     * @param tests
     */
    plays(tests: any[]) {
        if (this.playTexts == tests) return
        this.clean(false)
        this.playTexts = tests
        this.playIndex = 0
        if (this.playTexts && this.playTexts.length > 0) {
            let playText: string = this.playTexts[this.playIndex]
            this._play(playText)
        }
    }

    /**
     * 播放文字
     * @param playText
     */
    play(playText: string) {
        if (this._playText == playText) return
        this.playTexts = null
        this._play(playText)
    }

    /** 直接设置文本 */
    setText(text: string) {
        Laya.timer.clearAll(this)
        while (this.textObj.length > 0) {
            Tween.clearAll(this.textObj.shift())
        }
        text = text.toUpperCase()
        this._playText = text
        let msgLen = this._textField.text.length
        let tempPlayText = StringUtil.replace(text, " ", ",")
        let showTextLen = tempPlayText.length
        let start = Math.floor((msgLen - showTextLen) / 2)
        let tempText = ""
        for (let i = 0; i < start; i++) {
            tempText += this._defaultText
        }
        tempText += tempPlayText
        if (tempText.length > msgLen) {
            tempText = tempText.substring(0, msgLen)
        } else if (tempText.length < msgLen) {
            let len = msgLen - tempText.length
            for (let i = 0; i < len; i++) {
                tempText += this._defaultText
            }
        }
        this._textField.text = tempText
    }

    private _play(playText: string) {
        if (this._playText) {
            this._playClean(playText)
            return
        }
        this._playAni(playText)
    }

    private _playClean(playText: string = null) {
        if (this._playText.length != this.textObj.length) {
            return
        }
        Laya.timer.clearAll(this)
        this.playTwinkle(2, Handler.create(this, (playText: string) => {
            let showTextLen = this._playText.length
            let charData: any
            this.clearCount = 0
            for (let i = 0; i < showTextLen; i++) {
                charData = this.textObj[i]
                Tween.to(charData, {
                    count: 0,
                    update: new Handler(this, this.onChangeText, [charData, this._playText.charAt(i)])
                }, 300, null, Handler.create(this, this.onCleanTextEnd, [playText]), 300)
            }
        }, [playText]))
    }

    /**
     * 清理播放的文字
     * @param ani 是否需要动画清理
     */
    clean(ani: boolean = true) {
        this.playTexts = null
        if (ani) {
            this._playClean()
        } else {
            Laya.timer.clearAll(this)
            while (this.textObj.length > 0) {
                Tween.clearAll(this.textObj.shift())
            }
            this._playText = null
            let msgLen = this._textField.text.length
            let text = ""
            for (let i = 0; i < msgLen; i++) {
                text += this._defaultText
            }
            this._textField.text = text
        }
    }

    /** 清除结束 */
    private onCleanTextEnd(playText: string) {
        this.clearCount++
        if (this.clearCount < this.textObj.length) return
        this.textObj.splice(0, this.textObj.length)
        this._playText = null
        if (!StringUtil.isEmpty(playText)) {
            Laya.timer.once(300, this, this._play, [playText])
        }
    }

    private _playAni(playText: string) {
        if (StringUtil.isEmpty(playText)) return
        this.textObj.splice(0, this.textObj.length)
        this._playText = playText.toUpperCase()
        let msgLen = this._textField.text.length
        let showTextLen = this._playText.length
        let start = Math.ceil((msgLen + 1 - showTextLen) / 2); // +1 是为了保证数据左右均匀 和字符串substring 取值位置有关
        this.aniText = ""
        for (let i = 0; i < msgLen; i++) {
            this.aniText += this._defaultText
        }
//        Log.debug("default Text : " + this.aniText, "len = " + this.aniText.length)
        let charData: any
        this.playEndCount = 0
        for (let i = 0; i < showTextLen; i++) {
            charData = {count: msgLen + 1, tempCount: -1}
            this.textObj.push(charData)
            Tween.to(charData, {
                count: start + i,
                update: new Handler(this, this.onChangeText, [charData, this._playText.charAt(i)])
            }, 200, null, Handler.create(this, this.onChangeTextEnd), 15 * i)
        }
    }

    /** 显示文字完成 */
    private onChangeTextEnd() {
        this.playEndCount++
        if (this.playEndCount < this.textObj.length) return
        runFun(this._endCallBack)
        if (this.playTexts && this.playTexts.length > 0) {
            this.playIndex++
            if (this.playIndex >= this.playTexts.length) {
                this.playIndex = 0
            }
            Laya.timer.once(1000, this, this._play, [this.playTexts[this.playIndex]])
        }
    }

    private onChangeText(charData: any, txt: string) {
        if (StringUtil.trimAll(txt).length == 0) {
            txt = this._defaultText
        }
        let index = Math.floor(charData.count)
        if (charData.tempCount == index) return
        if (charData.tempCount != -1)
            this.aniText = this.replacePos(this.aniText, charData.tempCount, charData.tempCount, this._defaultText)
        charData.tempCount = index
        if (index > 0) {
            this.aniText = this.replacePos(this.aniText, index, index, txt)
        }
//        Log.debug("changeTextHandler="+this.aniText, index, this.aniText.length)
        this._textField.text = this.aniText
    }

    private replacePos(text: string, start: number, end: number, replaceText: string) {
//        Log.debug("replacePos", text, start, replaceText)
        return text.substring(0, start - 1) + replaceText + text.substring(end)
    }


    /**
     * 播放闪烁
     * @param count 文字闪烁次数
     * @param callback
     */
    playTwinkle(count = 2, callback: ParamHandler = null) {
        this.twinkleCount = count
        this.twinkleCallHandler = callback
//        if (this.textObj.length > 0) {
        Laya.timer.loop(100, this, this.onTwinkle)
//        }
    }

    private onTwinkle() {
        if (this.isTwinkle) {
            let msgLen = this._textField.text.length
            let tempPlayText = StringUtil.replace(this._playText, " ", ",")
            let showTextLen = tempPlayText.length
            let start = Math.floor((msgLen - showTextLen) / 2)
            let tempText = ""
            for (let i = 0; i < start; i++) {
                tempText += this._defaultText
            }
            tempText += tempPlayText
            if (tempText.length > msgLen) {
                tempText = tempText.substring(0, msgLen)
            } else if (tempText.length < msgLen) {
                let len = msgLen - tempText.length
                for (let i = 0; i < len; i++) {
                    tempText += this._defaultText
                }
            }
//                Log.debug(tempText, tempText.length)
            this._textField.text = tempText
            this.twinkleCount--
        } else {
            let msgLen = this._textField.text.length
            let tempText = ""
            for (let i = 0; i < msgLen; i++) {
                tempText += this._defaultText
            }
            this._textField.text = tempText
        }
        this.isTwinkle = !this.isTwinkle
        if (this.twinkleCount == 0) {
            Laya.timer.clear(this, this.onTwinkle)
            runFun(this.twinkleCallHandler)
        }
    }

    dispose() {
        this._playText = null
        this._textField = null
        this._endCallBack = null
        this._defaultText = null
        this.twinkleCallHandler = null
        this.playTexts = null
        Laya.timer.clearAll(this)
        while (this.textObj.length > 0) {
            Tween.clearAll(this.textObj.shift())
        }
    }

    get playText() {
        return this._playText
    }

}