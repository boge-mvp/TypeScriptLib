import {StringUtil} from "../utils/StringUtil"
import {NativeUtils} from "../runtime/NativeUtils"
import {Log} from "../Log";

export class SocketClient extends Laya.EventDispatcher {

    static SOCKET_CLASS_PATH: string = null
    protected MAX_CONNECT_TIME = 10
    protected DELAY = 15000
    protected socket: any
    protected options: { url: string, notify: Function, auth: any }
    protected auth: boolean
    alive = true

    /**
     * 创建一个socket
     * @param options 参数 url 连接地址 notify 回调方法 auth 认证
     */
    constructor(options: { url: string, notify: Function, auth: any }) {
        super()
        this.options = options
        this.createConnect()
    }

    createConnect() {
        if (this.MAX_CONNECT_TIME <= 0) {
            return
        }
        this.connect()
    }

    protected connect() {
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            this.socket = NativeUtils.PlatformClass.createClass(SocketClient.SOCKET_CLASS_PATH).newObject()
            this.socket.call("connect", this.options.url)
        } else {
            this.socket = new Laya.Socket()
            this.socket.disableInput = true
            this.auth = false
            this.socket.on(Laya.Event.OPEN, this, this.openHandler)
            this.socket.on(Laya.Event.ERROR, this, this.errorHandler)
            this.socket.on(Laya.Event.MESSAGE, this, this.messageHandler)
            this.socket.on(Laya.Event.CLOSE, this, this.closeHandler)
            this.socket.connectByUrl(this.options.url)
        }
    }

    closeHandler(msg?: any) {
        if (typeof msg !== "string") {
            msg = msg.data
        }
        Log.debug("GameSocket.closeHandler()", msg)
        Laya.timer.clear(this, this.heartbeat)
        Laya.timer.once(this.DELAY, this, this.reConnect)
    }

    messageHandler(evt) {
//		    AppManager.log(evt)
        try {
            if (typeof evt == "string") {
                evt = JSON.parse(evt)
            }
            // app 端的socket 发送过来的数据会被data 包裹
            if (evt.data) {
                evt = evt.data
            }
            for (let i = 0; i < evt.length; i++) {
                let data: any = evt[i]
                if (data.op == 8) {
                    this.auth = true
                    this.heartbeat()
                    Laya.timer.loop(4 * 60 * 1000, this, this.heartbeat)
                }
                if (!this.auth) {
                    Laya.timer.once(this.DELAY, this, this.getAuth)
                }
                if (this.auth && data.op == 5) {
                    let notify: Function = this.options.notify
                    if (notify) notify(data.body)
                }
            }
        } catch (e) {
            Log.error("error socket data", e + ' *** ' + evt)
        }
    }

    errorHandler(e) {
        if (typeof e !== "string") {
            e = e.data
        }
        Log.debug("GameSocket.errorHandler() " + e)
        Laya.timer.clear(this, this.heartbeat)
        Laya.timer.once(this.DELAY, this, this.reConnect)
    }

    openHandler() {
        Log.debug("GameSocket.openHandler()")
        this.getAuth()
        this.event(Laya.Event.OPEN)
    }

    protected reConnect() {
        --this.MAX_CONNECT_TIME
        this.DELAY *= 2
        if (this.alive) this.createConnect()
    }

    protected heartbeat() {
        this.send({
            'ver': 1,
            'op': 2,
            'seq': 2,
            'body': {}
        })
    }

    protected getAuth() {
        this.send({
            'ver': 1,
            'op': 7,
            'seq': 1,
            'body': this.options.auth
        })
    }

    send(data: any) {
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            this.socket.call("send", JSON.stringify(data))
        } else {
            this.socket.send(JSON.stringify(data))
        }
    }

    close() {
        this.MAX_CONNECT_TIME = 0
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            this.socket.call("close")
        } else {
            this.socket.close()
        }
    }

}