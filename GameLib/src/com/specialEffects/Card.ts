import ELabel = tsCore.ELabel;

/** 卡牌 */
export class Card extends ELabel {

    /** 卡牌的id */
    code: number
    /** 卡牌面值 */
    value: number
    /** 卡牌名字 */
    nameCard: string
    /** 卡牌花色 */
    suit: number
    /** 卡牌花色名字 */
    _suitName: string
    /** 初始化X */
    initX: number
    /** 初始化Y */
    initY: number
    /** XY偏移量 */
    offset: number
    /** 偏移倍数 */
    offsetMultiple: number = 0
    /** 中心点 */
    tempPivot: Laya.Point = new Laya.Point()

    /**
     * 初始化牌
     * @param id 0开始的牌id
     */
    init(id: number) {
        this.code = id

        this.value = id % 13 + 1
        this.nameCard = this.value === 1 ? 'A' : this.value === 11 ? 'J' : this.value === 12 ? 'Q' : this.value === 13 ? 'K' : this.value + ""
        this.suit = id / 13 | 0
        this._suitName = this.suitName(this.suit)
        this.nameCard = this.suit < 4 ? this.nameCard : 'JOKER'
        // var z = (52 - id) / 4
        // Log.debug(value, nameCard, suit)
    }

    protected suitName(value: number): string {//spades-黑桃,hearts-红桃,clubs-樱花,diamonds-方块,joker-小丑
        // 黑红樱方
        return value === 0 ? 'spades' : value === 1 ? 'hearts' : value === 2 ? 'clubs' : value === 3 ? 'diamonds' : 'joker'
    }

    createUI() {
        this.displayObject.graphics.drawRect(0, 0, 100, 150, "#ffffff", "#000000", 2)
        this.setSize(100, 150)

        let text: fgui.GTextField = new fgui.GBasicTextField()
        text.text = this.nameCard
        text.fontSize = 30
        this.addChild(text)
    }

}