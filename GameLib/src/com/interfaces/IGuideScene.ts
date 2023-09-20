import {IGuide} from "./IGuide"

/** 指引接口 */
export interface IGuideScene {

    /** 绘制引导区域 */
    drawGuideRect(guideView: IGuide, index: number): void

    /** 引导页面被点击 */
    clickGuide(guideView: IGuide, index: number): void

    /** 引导页面结束 */
    guideEnd(guideView: IGuide): void

}