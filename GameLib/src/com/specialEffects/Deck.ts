import {Card} from "./Card"

export class Deck {

    /** 存放的卡牌 */
    cards: Card[] = []
    /** 已经完成了动画个数 */
    private completeNum = 0
    /** 动画执行次数 */
    private executeNum = 1
    /** 是否正在运行动画 */
    private isRun: boolean

    private handler: ParamHandler

    createCard() {
        for (let i = 0; i < 54; i++) {
            let card: Card = new Card()
            card.init(i)
            card.createUI()
            card.initX = 400
            card.initY = 400
            card.offsetMultiple = .2
            card.offset = i * card.offsetMultiple
            card.setXY(card.initX - card.offset, card.initY - card.offset)
            fgui.GRoot.inst.addChild(card)
            this.cards.push(card)
        }
    }

    /**
     * 收集牌
     * @param handler
     * @param sort 是否需要排序
     */
    sort(handler: ParamHandler = null, sort = true) {
        if (this.isRun) return
        this.isRun = true
        this.handler = handler

        this.completeNum = 0
        if (sort) {
            this.cards.sort((a: Card, b: Card) => {
                return b.code - a.code
            })
        }
        let len = this.cards.length
        for (let i = 0; i < len; i++) {
            let card: Card = this.cards[i]
            let tempPivot: Laya.Point = card.tempPivot
            card.setPivot(tempPivot.x, tempPivot.y)
            card.offset = i * card.offsetMultiple
            let _delay = i * 10

            // Log.debug(card.y, card.y + (- card.height * 1.5))
            Laya.Tween.to(card, {
                x: card.initX - card.offset,
                y: card.y + (-card.height * 1.5),
                rotation: 0,
                scaleX: 1,
                scaleY: 1
            }, _delay, null, Laya.Handler.create(this, (card: Card) => {

                Laya.Tween.to(card, {
                    x: card.initX - card.offset,
                    y: card.initY - card.offset
                }, 400, null, Laya.Handler.create(this, () => {
                    this.completeNum++
                    if (len == this.completeNum) {
                        this.isRun = false
                        runFun(handler)
                    }
                }))

            }, [card]))

            Laya.timer.once(200 + _delay, this, this.setChildIndexHandler, [card, i], false)

        }
    }

    /** 展示牌 铺开 */
    bySuit(handler?: ParamHandler) {
        if (this.isRun) return
        this.isRun = true
        this.handler = handler
        this.completeNum = 0
        this.cards.sort((a: Card, b: Card) => {
            return a.code - b.code
        })
        let len = this.cards.length
        for (let i = 0; i < len; i++) {
            let card = this.cards[i]

            let value = card.value
            let suit = card.suit
            let delay = i * 10
            let posX = -(6.75 - value) * 20 + card.initX
            let posY = -(1.5 - suit) * (card.height + 5) + card.initY

            Laya.Tween.to(card, {x: posX, y: posY}, delay, null,
                Laya.Handler.create(this, (card: Card, i: number) => {
                    this.setChildIndexHandler(card, i)
                    this.completeNum++
                    if (this.completeNum == len) {
                        this.isRun = false
                        runFun(handler)
                    }
                }, [card, i]))
        }
    }

    /** 展示牌 */
    fan(handler?: ParamHandler) {
        if (this.isRun) return
        this.isRun = true
        this.handler = handler
        this.completeNum = 0
        let len = this.cards.length
        for (let i = 0; i < len; i++) {
            let card: Card = this.cards[i]
            card.offset = i / 4
            let delay = i * 10
            let rot = i / (len - 1) * 260 - 130
            card.setPivot(.5, 2.3)

            Laya.Tween.to(card, {x: card.initX - card.offset, y: card.initY - card.offset, rotation: rot},
                300 + delay, null, Laya.Handler.create(this, this.moveHandler, [card]), delay)
        }
    }

    /**
     * 洗牌
     * @param handler 执行完成回调
     * @param num 执行次数 暂未实现
     */
    shuffle(handler?: ParamHandler, num = 1) {
        if (this.isRun) return
        this.isRun = true
        this.executeNum = num
        this.handler = handler

        this.completeNum = 0
        this.cards.shuffle()
        for (let i = 0; i < this.cards.length; i++) {
            let card: Card = this.cards[i]
            card.offset = i * card.offsetMultiple
            let offsetX = this.plusMinus(Math.random() * 90 + 30) + card.initX
            let delay = i * 2

            Laya.Tween.to(card, {x: offsetX, y: card.initY - card.offset}, 200, null,
                Laya.Handler.create(this, this.moveHandler, [card]), delay)

            Laya.timer.once(100 + delay, this, this.setChildIndexHandler, [card, i], false)

        }
    }

    private moveHandler(card: Card) {
        Laya.Tween.to(card, {x: card.initX - card.offset, y: card.initY - card.offset}, 200)
        this.completeNum++
        if (this.completeNum == this.cards.length) {
            Laya.timer.once(200, this, () => {
                this.isRun = false
                runFun(this.handler)
            })
        }
    }

    private plusMinus(value: number) {
        let plus_minus = Math.round(Math.random()) ? -1 : 1
        return plus_minus * value
    }

    setChildIndexHandler(card: Card, index: number) {
        card.parent.setChildIndex(card, index)
    }

    dispose() {
        for (let i = 0; i < this.cards.length; i++) {
            Laya.Tween.clearAll(this.cards[i])
        }
        Laya.timer.clearAll(this)
        this.isRun = false
    }

}