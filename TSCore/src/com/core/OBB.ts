import {MathKit} from "../utils/MathKit"
import {View} from "./View"

/**
 * 碰撞类
 */
export class OBB extends View {

    /** 轴心 0 X轴 1 Y轴 */
    private _axes: Vector2[] = []
    /** 变径长度 */
    protected _extents: number[]
    private _point = new Vector2()

    constructor() {
        super()
        this.rotation = 0
    }

    /**
     * 碰撞检测 判断2矩形最终是否碰撞，需要依次检测4个分离轴，如果在一个轴上没有碰撞，则2个矩形就没有碰撞。
     * @param obb 要参与检测的对象
     * @return
     */
    detectorOBBvsOBB(obb: OBB) {
        let nv: Vector2 = this._point.sub(obb.point)
        let axisA1: Vector2 = this._axes[0]
        if (this.getProjectionRadius(axisA1) + obb.getProjectionRadius(axisA1) <= Math.abs(nv.dot(axisA1))) return false
        let axisA2: Vector2 = this._axes[1]
        if (this.getProjectionRadius(axisA2) + obb.getProjectionRadius(axisA2) <= Math.abs(nv.dot(axisA2))) return false
        let axisB1: Vector2 = obb.axes[0]
        if (this.getProjectionRadius(axisB1) + obb.getProjectionRadius(axisB1) <= Math.abs(nv.dot(axisB1))) return false
        let axisB2: Vector2 = obb.axes[1]
        return this.getProjectionRadius(axisB2) + obb.getProjectionRadius(axisB2) > Math.abs(nv.dot(axisB2));

    }

    override setSize(wv: number, hv: number, ignorePivot?: boolean) {
        this._extents = [wv >> 1, hv >> 1]
        super.setSize(wv, hv, ignorePivot)
    }

    /**
     * 通过旋转设置x轴和y轴
     * @param value 0-360
     */
    override set rotation(value: number) {
        super.rotation = value
        value = MathKit.angleToRadians(value)
        this._axes[0] = new Vector2(Math.cos(value), Math.sin(value))
        this._axes[1] = new Vector2(-1 * Math.sin(value), Math.cos(value))
    }

    override setXY(xv: number, yv: number) {
        super.setXY(xv, yv)
        this._point.setXY(this.displayObject.x, this.displayObject.y)
    }

    /**
     * 获取轴上的axisX和axisY投影半径距离
     * @param axis
     */
    getProjectionRadius(axis: Vector2) {
        return this._extents[0] * Math.abs(axis.dot(this._axes[0])) +
            this._extents[1] * Math.abs(axis.dot(this._axes[1]))
    }

    get axes() {
        return this._axes
    }

    get point() {
        return this._point
    }

}


class Vector2 {

    private x: number
    private y: number

    constructor(x = 0, y = 0) {
        this.setXY(x, y)
    }

    setXY(x: number, y: number) {
        this.x = x || 0
        this.y = y || 0
    }

    sub(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y)
    }

    /**
     * 算出自己在参数v上投影的长度
     * @param v
     */
    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y
    }

}