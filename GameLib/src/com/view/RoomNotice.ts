import GLoader = fgui.GLoader
import GTextField = fgui.GTextField
import GComponent = fgui.GComponent

/**
 * 房间通告
 * @author boge
 */
export class RoomNotice extends GComponent {

    private loader: GLoader
    private userName: GTextField
    private money: GTextField

    protected override constructFromXML(xml: any) {
        super.constructFromXML(xml)

        this.loader = this.getChild("n1").asLoader
        this.userName = this.getChild("n2").asTextField
        this.money = this.getChild("n3").asTextField

    }

    show(name: string, money: number, url: string) {

        this.userName.text = name
        this.money.text = money + ""
        this.loader.url = url

        this.visible = true
        Laya.timer.once(3000, this, this.hide)
    }

    hide() {
        Laya.timer.clear(this, this.hide)
        this.visible = false
    }

    override dispose() {
        this.hide()
    }

}