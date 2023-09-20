
export class CounterUtils {

    static create(total: number, complete: ParamHandler) {
        return new Counter(complete, total)
    }


}

class Counter {

    /** 执行玩所有次数调用 */
    complete: ParamHandler
    total = 0
    private _index = 0

    constructor(complete: ParamHandler, total: number) {
        this.complete = complete
        this.total = total
    }

    /** 完成一次计数 */
    oneComplete() {
        this._index++
        if (this._index == this.total) runFun(this.complete)
    }

    get index(): number {
        return this._index
    }

    dispose() {
        this.complete = null
    }

}