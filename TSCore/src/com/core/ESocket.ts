export class ESocket {

    /** 是否已经连接 */
    protected isConnect = false
    /** socket类型注册监听 */
    protected eventManager: { [key: string]: ParamHandler } = {}

    /** 关闭链接 */
    close() {
        this.isConnect = false
        this.eventManager = {}
    }

    /**
     * 删除socket 事件
     * @param type
     */
    removeSocketEvent(type: number) {
        delete this.eventManager["event_" + type]
    }

    /**
     * 注册socket 事件
     * @param type
     * @param handler
     */
    addSocketEvent(type: number, handler: ParamHandler) {
        this.eventManager["event_" + type] = handler
    }

    /**
     * 发送socket type事件
     * @param type
     * @param obj
     */
    sendEventManager(type: number, ...obj) {
        let fun = this.eventManager["event_" + type]
        if (fun) {
            obj.unshift(fun)
            runFun.apply(null, obj)
        }
    }

}