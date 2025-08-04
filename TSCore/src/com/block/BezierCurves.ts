export class BezierCurves {

    /** 经过时间 */
    private _t = -1
    private p1: Laya.Point
    private p2: Laya.Point
    private p3: Laya.Point
    private p4: Laya.Point

    get t() {

        return this._t
    }

    set t(value: number) {
        if (value < 0) return
        this._t = value
        // @ts-ignore
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

    setStartPoint(x: number, y: number) {
        this.p1 = Laya.Point.create().setTo(x, y)
        this._t = -1
    }

    setMiddlePoint(x: number, y: number) {
        this.p3 = this.p2 = Laya.Point.create().setTo(x, y)
    }

    setMiddlePoint2(x1: number, y1: number, x2: number, y2: number) {
        this.p2 = Laya.Point.create().setTo(x1, y1)
        this.p3 = Laya.Point.create().setTo(x2, y2)
    }

    setEndPoint(x: number, y: number) {
        this.p4 = Laya.Point.create().setTo(x, y)
    }

    /**
     * 释放数据
     * 这里回收了所有坐标信息 Point.recover()
     */
    recover() {
        this._t = -1
        this.p1?.recover()
        this.p2?.recover()
        this.p3?.recover()
        this.p4?.recover()
    }

}