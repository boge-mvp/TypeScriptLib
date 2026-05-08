import {StringUtil} from "../utils/StringUtil"
import {NativeUtils} from "../runtime/NativeUtils"
import {Log} from "../Log";

/**
 * Socket 客户端类，用于建立 WebSocket 连接并与服务器通信
 * 支持原生平台自定义 Socket 实现及标准 Laya.Socket 实现
 */
export class SocketClient extends Laya.EventDispatcher {

    /**
     * 原生平台 Socket 类路径配置
     * 如果为空则使用默认 Laya.Socket 实现
     */
    static SOCKET_CLASS_PATH: string = null

    /**
     * 最大重连次数限制
     */
    MAX_CONNECT_TIMES = 10

    /**
     * 初始重连延迟时间（毫秒）
     */
    RECONNECT_DELAY = 15000

    /**
     * 心跳包发送间隔（毫秒）
     */
    HEARTBEAT_INTERVAL = 4 * 60 * 1000

    protected connectTimes = 0
    protected reconnectDelay = 0

    /**
     * Socket 对象实例
     */
    protected socket: any

    /**
     * 连接配置选项
     */
    protected options: {
        url: string,           // 连接地址
        notify: (data: any) => void,  // 消息通知回调
        auth: any              // 认证信息
    }

    /**
     * 是否已认证标志
     */
    protected isAuthenticated: boolean

    /**
     * 客户端是否存活状态
     */
    isActive = true

    /**
     * 创建一个socket连接客户端
     * @param options 连接参数对象
     */
    constructor(options: { url: string, notify: (data: any) => void, auth: any }) {
        super()
        this.options = options
        this.createConnect()
    }

    /**
     * 尝试创建连接（检查最大重连次数限制）
     */
    createConnect() {
        if (this.connectTimes <= 0) {
            return
        }
        this.connect()
    }

    /**
     * 建立实际的 Socket 连接
     * 根据运行环境选择原生实现或标准实现
     */
    protected connect() {
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            // 使用原生平台特定 Socket 实现
            this.socket = NativeUtils.PlatformClass.createClass(SocketClient.SOCKET_CLASS_PATH).newObject()
            this.socket.call("connect", this.options.url)
        } else {
            // 使用标准 Laya.Socket 实现
            this.socket = new Laya.Socket()
            this.socket.disableInput = true
            this.isAuthenticated = false
            this.socket.on(Laya.Event.OPEN, this, this.onOpen)
            this.socket.on(Laya.Event.ERROR, this, this.onError)
            this.socket.on(Laya.Event.MESSAGE, this, this.onMessage)
            this.socket.on(Laya.Event.CLOSE, this, this.onClose)
            this.socket.connectByUrl(this.options.url)
        }
    }

    /**
     * 连接关闭事件处理器
     * @param msg 关闭消息
     */
    onClose(msg?: any) {
        if (typeof msg !== "string") {
            msg = msg.data
        }
        Log.debug("GameSocket.closeHandler()", msg)
        Laya.timer.clear(this, this.heartbeat)
        Laya.timer.once(this.reconnectDelay, this, this.reconnect)
    }

    /**
     * 接收消息事件处理器
     * 处理认证、心跳响应以及业务数据分发
     * @param evt 接收到的消息事件
     */
    onMessage(evt: any) {
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
                    // 认证成功响应
                    this.isAuthenticated = true
                    this.heartbeat()
                    Laya.timer.loop(this.HEARTBEAT_INTERVAL, this, this.heartbeat)
                }
                if (!this.isAuthenticated) {
                    // 未认证状态下重新获取认证
                    Laya.timer.once(this.reconnectDelay, this, this.auth)
                }
                if (this.isAuthenticated && data.op == 5) {
                    // 分发业务消息给外部监听者
                    let notify: Function = this.options.notify
                    if (notify) notify(data.body)
                }
            }
        } catch (e) {
            Log.error("error socket data", e + ' *** ' + evt)
        }
    }

    /**
     * 错误事件处理器
     * @param e 错误信息
     */
    onError(e) {
        if (typeof e !== "string") {
            e = e.data
        }
        Log.debug("GameSocket.errorHandler() " + e)
        Laya.timer.clear(this, this.heartbeat)
        Laya.timer.once(this.reconnectDelay, this, this.reconnect)
    }

    /**
     * 连接打开事件处理器
     */
    onOpen() {
        Log.debug("GameSocket.openHandler()")
        this.auth()
        this.event(Laya.Event.OPEN)
    }

    /**
     * 执行重连逻辑
     * 减少剩余重连次数并增加下次重连延迟
     */
    protected reconnect() {
        --this.connectTimes
        this.reconnectDelay *= 2
        if (this.isActive) this.createConnect()
    }

    /**
     * 发送心跳包维持连接
     */
    protected heartbeat() {
        this.send({
            'ver': 1,
            'op': 2,
            'seq': 2,
            'body': {}
        })
    }

    /**
     * 获取认证信息
     */
    protected auth() {
        this.send({
            'ver': 1,
            'op': 7,
            'seq': 1,
            'body': this.options.auth
        })
    }

    /**
     * 发送数据到服务器
     * @param data 要发送的数据对象
     */
    send(data: any) {
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            this.socket?.call("send", JSON.stringify(data))
        } else {
            this.socket?.send(JSON.stringify(data))
        }
    }

    /**
     * 主动关闭连接
     */
    close() {
        this.connectTimes = this.MAX_CONNECT_TIMES
        this.reconnectDelay = this.RECONNECT_DELAY
        if (Laya.Render.isConchApp && !StringUtil.isEmpty(SocketClient.SOCKET_CLASS_PATH)) {
            this.socket?.call("close")
        } else {
            this.socket?.close()
        }
    }
}
