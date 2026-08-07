import Point = Laya.Point;

/**
 * 屏幕等比例缩放计算工具
 *
 * 设计说明：将宽/高方向的缩放计算拆分为独立的 getEqualRatioScaleX / getEqualRatioScaleY，
 * 互不依赖、不产生冗余计算；getEqualRatioRatio 与 getEqualRatioScale 复用这两个方法。
 */
export class ScaleKit {

    /**
     * 获取当前屏幕宽方向（w）的等比例缩放系数
     * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
     */
    static getEqualRatioScaleX(w?: number) {
        w ??= Laya.stage.width
        // 横屏时设计宽高互换，宽方向对应 designHeight
        if (Laya.stage.screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
            return w / Laya.stage.designHeight
        }
        return w / Laya.stage.designWidth
    }

    /**
     * 获取当前屏幕高方向（h）的等比例缩放系数
     * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
     */
    static getEqualRatioScaleY(h?: number) {
        h ??= Laya.stage.height
        // 横屏时设计宽高互换，高方向对应 designWidth
        if (Laya.stage.screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
            return h / Laya.stage.designWidth
        }
        return h / Laya.stage.designHeight
    }

    /**
     * 获取当前屏幕宽高方向的等比例缩放系数
     * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
     * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
     * @returns Point.x 为宽方向缩放，Point.y 为高方向缩放
     */
    static getEqualRatioRatio(w?: number, h?: number) {
        return new Point(ScaleKit.getEqualRatioScaleX(w), ScaleKit.getEqualRatioScaleY(h))
    }

    /**
     * 获取当前屏幕等比例缩放系数（取宽高缩放的最小值，保证内容完整显示）
     * @param [w=Laya.stage.width] 当前屏幕实际渲染宽度
     * @param [h=Laya.stage.height] 当前屏幕实际渲染高度
     */
    static getEqualRatioScale(w?: number, h?: number) {
        return Math.min(ScaleKit.getEqualRatioScaleX(w), ScaleKit.getEqualRatioScaleY(h))
    }
}
