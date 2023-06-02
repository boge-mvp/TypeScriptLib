import Point = Laya.Point;
import {View} from "../core/View";

export class BezierCurves extends View {


    /** 经过时间 */
    private _t = 0
    private p1: Point
    private p2: Point
    private p3: Point
    private p4: Point

    get t() {
        return this._t
    }

    set t(value: number) {
        this._t = value
        this.setXY(this.getX(), this.getY())
    }

    getX() {
        return Math.pow((1 - this._t), 3) * this.p1.x
            + 3 * this.p2.x * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.x * this._t * this._t * (1 - this._t)
            + this.p4.x * Math.pow(this._t, 3)
    }

    getY() {
        return Math.pow((1 - this._t), 3) * this.p1.y
            + 3 * this.p2.y * this._t * (1 - this._t) * (1 - this._t)
            + 3 * this.p3.y * this._t * this._t * (1 - this._t)
            + this.p4.y * Math.pow(this._t, 3)
    }

    setStartPoint(tempX: number, tempY: number) {
        this.p1 = Point.create().setTo(tempX, tempY)
        this._t = 0
    }

    setMiddlePoint(tempX: number, tempY: number) {
        this.p3 = this.p2 = Point.create().setTo(tempX, tempY)
    }

    setEndPoint(tempX: number, tempY: number) {
        this.p4 = Point.create().setTo(tempX, tempY)
    }

    /**
     * 释放曲线数据
     */
    recoverData() {
        this._t = 0
        this.p1?.recover()
        this.p2?.recover()
        this.p3?.recover()
        this.p4?.recover()
    }

}