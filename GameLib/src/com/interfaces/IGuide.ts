import Graphics = Laya.Graphics
import GObject = fgui.GObject

/** 指引接口 */
export interface IGuide {

    interactionArea: Graphics
    /** 提示文案 */
    tipText: fgui.GTextField
    /** 提示标题 */
    tipTitleText: fgui.GTextField
    hand: fgui.GImage
    /** 总次数 */
    totalCount: number
    /** 当前执行位置 */
    current: number

    /**
     * 移动手到指定对象上
     * @param gob 对象
     */
    moveHand(gob: GObject)


}