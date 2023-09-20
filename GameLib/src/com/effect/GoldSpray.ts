import {GoldLoader} from "./GoldLoader"

export class GoldSpray extends GoldLoader {

    initX = 0
    initY = 0
    /** x方向的加速度 */
    vx = 0
    /** Y方向的加速度 */
    vy = 0
    /** X方向的重力 */
    gx = 0
    /** Y方向的重力 */
    gy = 0
    /** 是否已经停止运动 */
    isStop = false
    /** 重力加速度 */
    gravitySpeed = 0
    /** 速度是否减少 表示一直在负增长 */
    isNegativeGrowth = false
    /** tempX */
    tempY = 0

    update() {
        if (this.tempY == 0) {
            this.tempY = this.vy
        } else if (this.vy < this.tempY) {
            this.isNegativeGrowth = true
            this.tempY = this.vy
        }
        // 将重力累加到加速度中,这样每次渲染加速都在被消耗 最终造成反方向
        this.vx += this.gx
        this.vy += this.gy
        if (!this.isNegativeGrowth) {
            this.vy += this.gravitySpeed
        }
        // 设置当前的位置变化
        this.setXY(this.x + this.vx, this.y + this.vy)
    }

}