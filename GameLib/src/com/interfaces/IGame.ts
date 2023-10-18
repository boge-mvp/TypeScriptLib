export interface ILoadSoundFilter {

    /**
     * 过滤不需要加载的音频
     * @param url 音频的加载路径  相对或绝对
     * @param res 加载的资源数据
     * @return true.表示继续加载 false.放弃加载
     */
    filter(url: string, res: LoadRes): boolean

}

/** 指引接口 */
export interface IGuide {

    interactionArea: Laya.Graphics
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
    moveHand(gob: fgui.GObject): any


}

/** 指引接口 */
export interface IGuideScene {

    /** 绘制引导区域 */
    drawGuideRect(guideView: IGuide, index: number): void

    /** 引导页面被点击 */
    clickGuide(guideView: IGuide, index: number): void

    /** 引导页面结束 */
    guideEnd(guideView: IGuide): void

}