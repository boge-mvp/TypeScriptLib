import GLoader = fgui.GLoader
import GTextField = fgui.GTextField
import LoaderFillType = fgui.LoaderFillType
import GBasicTextField = fgui.GBasicTextField
import Events = fgui.Events
import Stage = Laya.Stage
import AutoSizeType = fgui.AutoSizeType
import {BaseButton} from "../core/BaseButton"

export class NumButton extends BaseButton {

    private component: GLoader
    private cornerMarker: GTextField
    /** 绑定位置对象 */
    bindObject: any
    /** 偏移位置 */
    offX = 0
    /** 偏移位置 */
    offY = 0

    private tempValue = 0

    protected constructFromXML(xml: any) {
        super.constructFromXML(xml)

        this.bindObject = this

        this.component = new GLoader()
        this.component.url = "ui://gameCommon/numCC"

        this.component.height = 28
        this.component.fill = LoaderFillType.ScaleFree
        this.addChild(this.component)

        this.cornerMarker = new GBasicTextField()
        this.cornerMarker.color = "#ffffff"
        this.cornerMarker.fontSize = 16
        this.cornerMarker.text = "99+"
        this.cornerMarker.valign = Stage.ALIGN_MIDDLE
        this.cornerMarker.align = Stage.ALIGN_CENTER

        this.cornerMarker.height = this.component.height
        this.cornerMarker.autoSize = AutoSizeType.None
        this.component.displayObject.addChild(this.cornerMarker.displayObject)
        this.component.visible = false

        this.cornerMarker.width = this.component.width = 50

        this.getController("c1").on(Events.STATE_CHANGED, this, this.stateChangedHandler)

        this.updateBindPoint()

    }

    private stateChangedHandler() {
        if (this.getController("c1").selectedIndex == 0) {
            this.component.visible = this.tempValue > 0
        } else {
            this.component.visible = false
        }
    }

    /** 更新绑定位置 */
    updateBindPoint() {
        this.component.x = this.bindObject.width - this.component.width + this.offX
//        component.y = -component.height / 2 + offY
    }

    /**
     * 设置角标
     * @param value 剩余数量
     */
    setCorner(value: number) {
        this.tempValue = value
        this.component.visible = value > 0

        if (value < 10) {
            this.cornerMarker.width = this.component.width = 28
        } else {
            this.cornerMarker.width = this.component.width = 50
        }
        this.updateBindPoint()

        if (value > 99) {
            this.cornerMarker.text = "99+"
        } else {
            this.cornerMarker.text = value + ""
        }
    }

}