import Browser = Laya.Browser
import ESocket = tsCore.ESocket;
import SocketClient = tsCore.SocketClient;
import StringUtil = tsCore.StringUtil;
import Log = tsCore.Log;

/** socket管理 */
export class SocketManager extends ESocket {

    private static _instance: SocketManager

    static get inst(): SocketManager {
        this._instance ??= new SocketManager()
        return this._instance
    }

    /** 当前连接的房间号 */
    private _roomId: number
    /** 接受到的消息 */
    private receiveData = []

    private _client: SocketClient
    static SocketClass = SocketClient
    /**
     * 自定义socket url
     * @example
     * SocketManager.inst.customUrl = (url: string) => {
     *      ...
     *     return url
     * }
     *
     * SocketManager.inst.customUrl = Laya.Handler.create(this, function(url: string) {
     *  ...
     *  return url
     *
     * })
     */
    customUrl: ParamHandler

    /**
     * 链接服务器socket
     * @param roomId 房间号
     * @param token token
     * @param userId 用户id 默认 110
     * @param url 连接地址 如果不存在 会使用 window.socketUrl
     */
    connect(roomId: number, token: string, userId = 110, url?: string) {
        if (this.isConnect) {
            this.close()
        }
        this.isConnect = true
        if (StringUtil.isEmpty(url)) url = Browser.window.socketUrl

        this.customUrl && (url = runFun(this.customUrl, url))

        this._roomId = roomId
        let obj = {
            auth: {rid: this._roomId, uid: userId},
            notify: this.onMessageReceived.bind(this),
            url: url,
            token: token
        }

        // SocketClient.SOCKET_CLASS_PATH = "com.casino.GameSocket"
        SocketClient.SOCKET_CLASS_PATH = null

        // 初始化IM客户端库
        this._client = new SocketManager.SocketClass(obj)
        Laya.timer.loop(200, this, this.sendData)
    }

    private sendData() {
        if (this.receiveData.length > 0 && this.isConnect) {
            let data: any
            let len = this.receiveData.length
            for (let i = 0; i < len; i++) {
                data = this.receiveData.shift()
                let msg = data.message
                let roomId: number = msg.roomId
                let obj = msg.data
                let type = msg.type
                this.sendEventManager(type, obj)
            }
        }
    }

    /** 关闭链接 */
    override close() {
        Log.debug("close socket")
        Laya.timer.clear(this, this.sendData)
        this._roomId = -1
        if (this._client) this._client.alive = false
        if (this._client) this._client.close()
        this._client = null
        this.receiveData.splice(0, this.receiveData.length)
        super.close()
    }

    /** 服务器发来消息 */
    onMessageReceived(data) {
        if (!this.isConnect) {
            return
        }
        this.receiveData.push(data)
    }

    closeHandler(msg = null) {
        this._client?.closeHandler(msg)
    }

    messageHandler(evt) {
        this._client?.messageHandler(evt)
    }

    errorHandler(e) {
        this._client?.errorHandler(e)
    }

    openHandler() {
        this._client?.openHandler()
    }

    get roomId() {
        return this._roomId
    }

    test(value: string) {
        if (typeof value == "string") {
            Log.debug("string=" + JSON.stringify(value))
        } else {
            Log.debug("json=" + JSON.stringify(value))
        }
    }

}