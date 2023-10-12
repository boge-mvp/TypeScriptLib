import {App} from "../App";
import {SystemKit} from "./SystemKit";

/**
 * 贴边工具
 */
export class EdgeFloatKit {

    /**
     * 获取指定目标在可视范围内的最终位置
     * @param target 目标组件
     * @param range 可视大小
     */
    static moveXY(target: RectangleType, range: { width: number, height: number }) {
        const {width, height} = range
        const enableNotch = App.inst.options.isNotchEnable && Laya.stage.screenMode === Laya.Stage.SCREEN_HORIZONTAL
        const notchH = SystemKit.cacheNotch
        let [tempX, tempY] = [target.x, target.y]
        if (target.x > (width >> 1)) {// 大于可视范围宽度一半
            tempX = width - target.x - target.width
            if (target.y > (height >> 1)) {// 大于可视范围高度一半  Y位置偏下
                tempX = width - target.x - target.width // 右边距
                tempY = height - target.y - target.height // 底边距
                if (tempX < tempY) {// 右边距小于向下的边距
                    // 向右靠边 y不变
                    tempX = width - target.width
                    tempY = Math.max(target.y, enableNotch ? notchH : 0)
                } else {
                    // 向下靠边 x不变
                    tempY = height - target.height
                    tempX = Math.max(target.x, enableNotch ? notchH : 0)
                }
            } else { // Y位置偏上
                if (target.y < width - target.x - target.width) {// 组件 右边距 大于顶边距
                    // 向上靠边 x不变
                    tempY = enableNotch ? notchH : 0
                    tempX = Math.max(target.x, enableNotch ? notchH : 0)
                } else {
                    // 向右靠边 y不变
                    tempX = width - target.width
                    tempY = Math.max(target.y, enableNotch ? notchH : 0)
                }
            }
        } else {// 小于可视范围宽度一半
            if (target.y > (height >> 1)) {// 大于可视范围高度一半   Y位置偏下
                if (target.x < height - target.y - target.height) { // X位置偏左
                    // 向左靠边 Y不变
                    tempX = enableNotch ? notchH : 0
                    tempY = Math.max(target.y, enableNotch ? notchH : 0)
                } else {
                    // 向下靠边 X不变
                    tempY = height - target.height
                    tempX = Math.max(target.x, enableNotch ? notchH : 0)
                }
            } else {
                if (target.x < target.y) {// X位置偏右
                    // 向左靠边 Y不变
                    tempX = enableNotch ? notchH : 0
                    tempY = Math.max(target.y, enableNotch ? notchH : 0)
                } else {
                    // 向上靠边 X不变
                    tempY = enableNotch ? notchH : 0
                    tempX = Math.max(target.x, enableNotch ? notchH : 0)
                }
            }
        }
        return {x: tempX, y: tempY}
    }


}