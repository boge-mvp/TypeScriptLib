import GLoader = fgui.GLoader;
import Tween = Laya.Tween;
import Handler = Laya.Handler;
import {BaseView} from "../core/BaseView"

/**
 * 洗牌的牌
 * @author boge
 *
 */
export class CardDeck extends BaseView {

    static NAME: string = "CardDeck"

    private load!: GLoader
    /** 在数组中的位置 */
    pos!: number
    static CREATE_FUI_URL = "//gameCommon/CardDeck"

    protected override onConstruct() {
        super.onConstruct();
        this.load = this.getChild("n0")!.asLoader
        this.scaleX = this.scaleY = .9
    }

    shuffle(func: ParamHandler) {
        let i = this.pos
        let z = i / 4
        let offsetX = this.plusMinus(Math.random() * 90 + 30)
        let delay = i * 2

        const completeHandler = ()=> {
            Tween.to(this, {x: -z, y: -z}, 200)
            Laya.timer.once(200, this, function () {
                runFun(func, i)
            })
        }

        Tween.to(this, {x: offsetX, y: -z}, 200, null, Handler.create(this, completeHandler), delay)

        Laya.timer.once(100 + delay, this,  ()=> {
            this.parent.setChildIndex(this, i)
        })


    }

    private plusMinus(value: number): number {
        let plusminus = Math.round(Math.random()) ? -1 : 1
        return plusminus * value
    }

    setUrl(url: string) {
        this.load.url = url
    }

    revert() {
        Tween.clearAll(this)
        // @ts-ignore
        this.load.url = null
        this.removeFromParent()
    }

    static create() {
        return createView(this.CREATE_FUI_URL, CardDeck)
    }

}