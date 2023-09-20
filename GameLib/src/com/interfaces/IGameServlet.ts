import {IGameModel} from "./IGameModel"

/**
 * 游戏请求接口
 * @author boge
 *
 */
export interface IGameServlet {

    /**
     * 检查游戏当前状态
     * @param handler 游戏可进入时  调用函数
     *
     */
    checkState(handler: ParamHandler): void

    /** 游戏初始化  向服务器发送请求数据 */
    init(handler: ParamHandler): void

    /**
     * 初始化 servlet 完成
     * @protected
     */
    initComplete(): void

    /** 获取游戏逻辑类 */
    gameModel: IGameModel

    /** 设置游戏逻辑类 */

    // gameModel(value: IGameModel): void

    /** 检查游戏期数是否正确 */
    checkGamePeriod(handler: ParamHandler): void

    /**
     * get 获取数据
     * @param url
     * @param data
     * @param callback
     * @param error
     * @param timeout
     * @deprecated
     * @see getData
     */
    getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): void

    /**
     * 封装的get请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
     *
     * @param url 使用 Player.inst.data.getGameUrl 格式化的url
     * @param data
     * @param callback
     * @param error
     * @param timeout
     * @param [overtime=0] 超时时间设置 毫秒
     */
    getData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, overtime?: number): void

    /**
     * post 请求数据
     * @param url
     * @param data
     * @param callback
     * @param error
     * @param timeout
     * @param headers
     * @param overtime
     * @deprecated
     * @see postData
     */
    post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: any[], overtime?: number): void

    /**
     * post 请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameModel == this.gameModel?.gameCode
     * @param url 请求连接 使用Player.inst.data.getGameUrl()格式化的url
     * @param data 请求数据
     * @param callback 请求完成返回调用函数
     * @param error 错误调用函数
     * @param timeout 超时回调函数
     * @param headers (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     * @param [overtime=0]
     */
    postData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: any[], overtime?: number): void

    /**
     *
     * @param callback
     * @param error
     */
    getUserMoney(callback: ParamHandler, error: ParamHandler): void

    /**
     * 清理收
     */
    dispose(): void

}
