import {Card} from "./Card"
import Point = Laya.Point;
import Handler = Laya.Handler;

export class Deck<T extends Card = Card> {

    /** 存放的卡牌 */
    cards: T[] = []
    /** 已经完成了动画个数 */
    private completeNum = 0
    /** 是否正在运行动画 */
    private isRun: boolean

    private handler: ParamHandler

    createCard() {
        for (let i = 0; i < 54; i++) {
            let card = new Card()
            card.init(i)
            card.createUI()
            card.initX = 400
            card.initY = 400
            card.offsetMultiple = .2
            card.offset = i * card.offsetMultiple
            card.setXY(card.initX - card.offset, card.initY - card.offset)
            fgui.GRoot.inst.addChild(card)
            this.cards.push(card as T)
        }
    }

    /**
     * 对卡片进行排序和动画处理。
     * @param handler 处理参数的函数，默认为null，用于在排序前后对卡片进行额外处理。
     * @param sort 是否对卡片进行排序，默认为true。如果为true，则按照卡片的code属性降序排序。
     * @param onceComplete 在每个卡片动画完成时调用的回调函数，默认为undefined。接收一个参数card，表示当前完成动画的卡片。
     */
    sort(handler: ParamHandler = null, sort = true, onceComplete?: (card: T) => void) {
        // 判断是否已经执行过排序，如果执行过则不再执行
        if (this.isRun) return
        this.isRun = true  // 标记为正在执行排序

        this.handler = handler  // 存储传入的处理函数

        this.completeNum = 0  // 初始化完成动画的卡片数量为0
        // 如果需要排序，则按照卡片的code进行降序排序
        if (sort) {
            this.cards.sort((a: T, b: T) => {
                return b.code - a.code
            })
        }

        let len = this.cards.length  // 获取卡片数量
        for (let i = 0; i < len; i++) {
            let card = this.cards[i]  // 获取当前遍历的卡片
            let tempPivot: Laya.Point = card.tempPivot  // 获取临时中心点
            card.setPivot(tempPivot.x, tempPivot.y)  // 设置卡片的中心点
            card.offset = i * card.offsetMultiple  // 计算卡片的偏移量
            let _delay = i * 10  // 计算动画延迟时间，使每个卡片依次延迟一定时间后开始动画

            // 开始第一个阶段的动画，将卡片旋转并移动到初始位置下方
            Laya.Tween.to(card, {
                x: card.initX - card.offset,
                y: card.y + (-card.height * 1.5),
                rotation: 0,
                scaleX: 1,
                scaleY: 1
            }, _delay, null, Laya.Handler.create(this, (card: T) => {

                // 开始第二个阶段的动画，将卡片移动到初始位置
                Laya.Tween.to(card, {
                    x: card.initX - card.offset,
                    y: card.initY - card.offset
                }, 400, null, Laya.Handler.create(this, (card: T) => {
                    onceComplete?.(card)  // 调用完成回调函数
                    this.completeNum++  // 完成动画的卡片数量加1
                    // 如果所有卡片都完成了动画，则重置isRun标志，并调用handler函数
                    if (len == this.completeNum) {
                        this.isRun = false
                        runFun(handler)
                    }
                }, [card]))

            }, [card]))

            // 设置卡片在动画过程中的子级索引处理，确保动画顺序正确
            Laya.timer.once(200 + _delay, this, this.setChildIndexHandler, [card, i], false)
        }
    }

    /** 展示牌 铺开 */
    bySuit(handler?: ParamHandler, spacing = 20, offsetY?: number) {
        if (this.isRun) return
        this.isRun = true
        this.handler = handler
        this.completeNum = 0
        this.cards.sort((a: T, b: T) => {
            return a.code - b.code
        })
        let len = this.cards.length
        this.cards.forEach((card, index) => {
            let value = card.value
            let suit = card.suit
            let delay = index * 10
            let posX = -(6.75 - value) * spacing + card.initX
            let posY = -(1.5 - suit) * (card.actualHeight + 5) + (offsetY ?? card.initY)
            Laya.Tween.to(card, {
                    x: posX,
                    y: posY,
                    rotation: 0
                }, delay, null,
                Laya.Handler.create(this, (card: T, i: number) => {
                    this.setChildIndexHandler(card, i)
                    this.completeNum++
                    if (this.completeNum == len) {
                        this.isRun = false
                        runFun(handler)
                    }
                }, [card, index]))


        })
    }

    /**
     * 扇形动画效果函数。
     * @param handler 可选，参数处理函数。
     * @param pivot 扇形旋转的中心点，默认为(new Point(.5, 1.3))。
     * @param maxRot 最大旋转角度，默认为260度。
     * 此函数用于执行一个扇形展开的动画效果，通过调整每个卡片的位置和旋转角度，从中心点向外展开。
     * 动画基于Laya.Tween实现，对每个卡片分别进行动画处理。
     */
    fan(handler?: ParamHandler, pivot = new Point(.5, 1.3), maxRot = 260) {
        if (this.isRun) return // 如果当前正在运行动画，则直接返回，避免重复执行
        this.isRun = true
        this.handler = handler // 设置参数处理函数
        this.completeNum = 0 // 重置完成数量
        let len = this.cards.length // 获取卡片数量
        for (let i = 0; i < len; i++) { // 遍历每个卡片
            let card = this.cards[i]
            card.offset = i / 4 // 计算每个卡片的偏移量
            let delay = i * 10 // 计算动画延迟，使每个卡片有先后动画效果
            let rot = i / (len - 1) * maxRot - maxRot / 2 // 计算每个卡片的旋转角度
            card.setPivot(pivot.x, pivot.y) // 设置卡片的旋转中心点

            // 对卡片进行动画处理，包括位置和旋转的改变
            Laya.Tween.to(card, {
                    x: card.initX - card.offset,
                    y: card.initY - card.offset,
                    rotation: rot
                }, 300 + delay, null,
                Laya.Handler.create(this, this.onAnimationFinish, [card]), delay)
        }
    }


    /**
     * 洗牌
     * @param handler 执行完成回调
     * @param num 执行次数
     */
    shuffle(handler?: ParamHandler, num = 1) {
        if (this.isRun) return
        this.isRun = true
        this.handler = handler
        this._shuffle(num)
    }

    private _shuffle(runNum: number) {
        if (runNum < 1) {
            this.isRun = false
            runFun(this.handler)
            return
        }
        runNum--
        this.completeNum = 0
        this.cards.shuffle()
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i]
            card.offset = i * card.offsetMultiple
            let offsetX = this.plusMinus(Math.random() * 90 + 30) + card.initX
            let delay = i * 2

            Laya.Tween.to(card, {
                    x: offsetX,
                    y: card.initY - card.offset,
                    rotation: 0
                }, 200, null,
                Laya.Handler.create(this,
                    this.onAnimationFinish,
                    [card, Handler.create(this, this._shuffle, [runNum])]
                ), delay)

            Laya.timer.once(100 + delay, this, this.setChildIndexHandler, [card, i], false)
        }
    }

    private onAnimationFinish(card: T, callback?: Handler) {
        Laya.Tween.to(card, {
            x: card.initX - card.offset,
            y: card.initY - card.offset
        }, 200)
        this.completeNum++
        if (this.completeNum == this.cards.length) {
            if (callback) callback.run()
            else Laya.timer.once(200, this, () => {
                this.isRun = false
                runFun(this.handler)
            })
        }
    }

    private plusMinus(value: number) {
        let plus_minus = Math.round(Math.random()) ? -1 : 1
        return plus_minus * value
    }

    setChildIndexHandler(card: T, index: number) {
        card.parent.setChildIndex(card, index)
    }

    dispose() {
        this.cards.forEach(value => Laya.Tween.clearAll(value))
        Laya.timer.clearAll(this)
        this.isRun = false
    }

}