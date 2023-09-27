import GRoot = fgui.GRoot;
import EProxy = tsCore.EProxy;
import Log = tsCore.Log;
import HTTPUtils = tsCore.HTTPUtils;
import MessageTip = tsCore.MessageTip;
import MathKit = tsCore.MathKit;
import StringUtil = tsCore.StringUtil;
import Method = tsCore.Method;
import {IGameServlet} from "../interfaces/IGameServlet"
import {IGameModel} from "../interfaces/IGameModel"
import {ActionLib} from "../actions/ActionLib"
import {Player} from "../Player"
import {SceneManager} from "../manager/SceneManager"
import {LoadingWindow} from "../view/LoadingWindow"
import {JSUtils} from "../utils/JSUtils"
import {SocketManager} from "../net/SocketManager"
import {LibStr} from "../LibStr"
import {WaitResult} from "../view/WaitResult"
import {CommonCmd, HttpCode, Urls} from "../net/Common";
import {BaseGameData} from "./BaseGameData";
import {StateCode} from "../utils/StateCode";

/**
 * 游戏基础类
 * @author boge
 */
export abstract class GameServlet<T extends BaseGameData = BaseGameData> extends EProxy implements IGameServlet {

    protected _gameModel: IGameModel
    protected initHandler: ParamHandler
    /** 当前访问接口获得游戏状态 */
    protected gameStatus: number
    /** 网络通信名字 */
    networkName: string

    protected constructor() {
        super()
        this.regGameAction(ActionLib.GAME_CHECK_STATE, this, this.checkState)
        this.regGameAction(ActionLib.GAME_INIT_SERVLET, this, this.init)
        this.regGameAction(ActionLib.GAME_CONNECT_SOCKET, this, this.connectSocket)
        this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose)
    }

    protected get gameData(): T {
        return Player.inst.gameData as T
    }

    /**
     * @deprecated
     */
    protected set gameData(value: T) {
        Log.debug(value)
    }

    /**
     * 封装的get请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameId == this.gameModel?.gameCode
     *
     * @param url 使用 Player.inst.data.getGameUrl 格式化的url
     * @param data
     * @param callback
     * @param error
     * @param timeout
     * @deprecated
     * @see getData
     */
    getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler) {
        this.getData(url, data, callback, error, timeout)
    }

    /**
     * 封装的get请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameId == this.gameModel?.gameCode
     *
     * @param url 使用 Player.inst.data.getGameUrl 格式化的url
     * @param data
     * @param callback
     * @param error
     * @param timeout
     * @param [overtime = 0] 超时时间设置 毫秒
     */
    getData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, overtime = 0) {
        HTTPUtils.create()
            .setUrl(Player.inst.data.getGameUrl(url))
            .setData(data)
            .setOvertime(overtime)
            .onComplete((data: HttpResponse) => {
                if (Player.inst.gameId == this.gameModel?.gameCode) runFun(callback, data)
            })
            .onError((data: any) => {
                if (Player.inst.gameId == this.gameModel?.gameCode) runFun(error, data)
            })
            .onTimeout(() => {
                if (Player.inst.gameId == this.gameModel?.gameCode) {
                    if (timeout) runFun(timeout)
                    else if (error) runFun(error)
                }
            }).call()
    }

    /**
     * post 请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameId == this.gameModel?.gameCode
     * @param url 请求连接 使用Player.inst.data.getGameUrl()格式化的url
     * @param data 请求数据
     * @param callback 请求完成返回调用函数
     * @param error 错误调用函数
     * @param timeout 超时回调函数
     * @param headers (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     * @param overtime
     * @deprecated
     * @see postData
     */
    post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: string[], overtime = 0) {
        this.postData(url, data, callback, error, timeout, headers, overtime)
    }

    /**
     * post 请求
     *
     * 所有的返回结果，都会执行id判断 Player.inst.gameId == this.gameModel?.gameCode
     * @param url 请求连接 使用Player.inst.data.getGameUrl()格式化的url
     * @param data 请求数据
     * @param callback 请求完成返回调用函数
     * @param error 错误调用函数
     * @param timeout 超时回调函数
     * @param headers (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     * @param [overtime = 0] 超时时间设置 毫秒
     */
    postData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: string[], overtime = 0) {
        HTTPUtils.create()
            .setMethod(Method.POST)
            .setUrl(Player.inst.data.getGameUrl(url))
            .setData(data)
            .setOvertime(overtime)
            .setHeaders(headers)
            .onComplete((data: HttpResponse) => {
                if (Player.inst.gameId == this.gameModel?.gameCode) {
                    if (Player.inst.isGuest && data?.code == HttpCode.OK) {
                        Player.inst.guestModel.playAdd(url, data.data)
                    }
                    if (!data) runFun(error, "data is null")
                    else runFun(callback, data)
                }
            })
            .onError((data: any) => {
                if (Player.inst.gameId == this.gameModel?.gameCode) runFun(error, data)
            })
            .onTimeout(() => {
                if (Player.inst.gameId == this.gameModel?.gameCode) {
                    if (timeout)
                        runFun(timeout)
                    else if (error)
                        runFun(error)
                }
            }).call()
    }


    /**
     *
     * @param handler
     */
    checkState(handler: ParamHandler) {
        // if (Player.inst.isGuest) {
        runFun(handler)
        // return
        // // }
        // let obj: any = {}
        // obj.token = Player.inst.token
        // obj.roomId = Player.inst.gameId
        // this.post("/game/status", obj, (data: any) => {
        //     if (data.code != HttpCode.OK) {
        //         this.enterFail(true, StateCode.getShowMessage(data))
        //         return
        //     }
        //     data = data.data
        //     this.gameStatus = data.game_status
        //     this.modifyCheckState(data)
        //     let period: number = data.period;//当前期数
        //     if (SceneManager.inst.isAloneGame() || Player.inst.gameId == CommonCmd.GAME_SCRATCHER) {
        //         period = 1
        //     }
        //     if (this.gameStatus == 1 && period > 0) {
        //         runFun(handler)
        //     } else {
        //         this.enterFail()
        //     }
        // }, Handler.create(this, this.userDataErrorHandler))
    }

    /**
     * 进入游戏失败
     * @param [isTip = true] 是否需要弹窗
     * @param message 弹窗内容
     */
    protected enterFail(isTip = true, message?: string) {
        Player.inst.gameId = CommonCmd.GAME_HOME
        GRoot.inst.closeModalWait()
        LoadingWindow.inst.hide()
        JSUtils.openModal(message ? message : getString(LibStr.GAME_OFF))
        JSUtils.gameClose()
        if (isTip) MessageTip.showTip(message ? message : LibStr.GAME_OFF)
        this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN)
    }

    init(handler: ParamHandler) {
        this.initHandler = handler
        if (Player.inst.isGuest) {
            Player.inst.status = 1
            // 初始化完成
            runFun(handler)
            return
        }
        let obj: any = {}
        obj.token = Player.inst.token
        obj.game_id = Player.inst.gameId
        obj.is_gift = Player.inst.urlParam.isGift

        this.postData("/game/" + this.networkName + "/init", obj, this.userDataHandler.bind(this), this.userDataErrorHandler.bind(this))
    }

    /** 连接该游戏的socket */
    protected connectSocket() {
        // 链接服务器socket
        SocketManager.inst.connect(Player.inst.gameId, Player.inst.token, Player.inst.userId)
    }

    protected userDataErrorHandler(data: any) {
        this.enterFail(true, getString(LibStr.NET_ERROR))
    }

    /** 用户数据 */
    protected userDataHandler(data: any) {
//			trace("MainPanel.userDataHandlerr(data) 服务器拿到游戏房间数据")
        if (data.code != HttpCode.OK) {
            this.enterFail(true, StateCode.getShowMessage(data))
            return
        }
        data = data.data
        this.gameStatus = data.game_status

        this.parseInitData(data)
        Player.inst.status = data.status ? data.status : 1;//1=>投注中，2=>计算中，3=>开奖
        Player.inst.data.lotteryTime = data.lottery_time;//开奖时间戳(s)
        let period: number = data.period;//当前期数
        Player.inst.data.initRoomTotalItem = data.bet_total_item; //当前房间总投注金额
        Player.inst.data.initRoomCurBet = data.cur_bet_total;//当前房间自己投注金额
        Player.inst.data.betHistory = data.bet_history;//当前房间历史记录
        Player.inst.data.betStatic = data.bet_statis;//当前历史次数
        Player.inst.data.initPeriod = data.last_period
        // 奖金池数据
        this.readJackpotData(data)

        // 单机游戏进入   处理
        if (SceneManager.inst.isAloneGame()) {
            period = 1
            Player.inst.data.jackpot = data.jackpot
        }
        Player.inst.data.period = period
        if (this.gameStatus == 1 && period > 0) {
            this.getCoupon()
        } else {
            this.enterFail()
        }
    }

    /**
     * 读取奖金池数据
     * @param data
     */
    readJackpotData(data: HttpData) {
        if (data.user_really_bet || data.user_really_bet == 0) Player.inst.userReallyBet = data.user_really_bet
        if (data.get_ticket_inc_bet) Player.inst.getTicketIncBet = data.get_ticket_inc_bet
        if (data.game_pool || data.game_pool == 0) Player.inst.gamePool = MathKit.toFixed(data.game_pool)
        if (data.scratcher_tickets) Player.inst.jackpotData = data.scratcher_tickets
        this.sendAction(ActionLib.GAME_UPDATE_JACKPOT_POOL)
    }

    /** 获取投注劵 */
    protected getCoupon() {
        this.getData(Urls.URL_GAME_ALL_COUPON + "?" + Player.inst.getRequestToken(),
            null, this.couponHandler.bind(this), this.userDataErrorHandler.bind(this))
    }

    /** 收到投注劵数据 */
    protected couponHandler(data: HttpResponse) {
        if (data.code != HttpCode.OK) {
            this.enterFail(true, StateCode.getShowMessage(data))
            return
        }
        Player.inst.addCoupons(data.data)
        this.initComplete()
    }

    initComplete(): void {
        runFun(this.initHandler)
    }

    /**
     * 解析初始化数据
     * @param data
     *
     */
    protected abstract parseInitData(data: HttpResponse)

    /**
     * 拉取账户金额
     * @param callback
     * @param error
     */
    getUserMoney(callback: ParamHandler, error?: ParamHandler) {
        let obj = {token: Player.inst.token}
        HTTPUtils.create()
            .setMethod("post")
            .setUrl(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET))
            .setData(obj)
            .onComplete((data: any) => {
                if (data?.code == HttpCode.OK) {
                    runFun(callback, data)
                } else {
                    runFun(error, "data is null")
                }
            }).onError(error).call()
    }

    /**
     * 检查游戏期数
     * @param handler
     *
     */
    checkGamePeriod(handler: ParamHandler) {
        runFun(handler, true)
        // let obj: any = {}
        // obj.token = Player.inst.token
        // obj.roomId = Player.inst.gameId
        // this.post("/game/status", obj, (data: any) => {
        //     if (data.code != HttpCode.OK) {
        //         this.enterFail(true, StateCode.getShowMessage(data))
        //         return
        //     }
        //     data = data.data
        //     this.gameStatus = data.status
        //     this.modifyCheckState(data)
        //     let period: number = data.period;//当前期数
        //     if (SceneManager.inst.isAloneGame()) {
        //         period = 1
        //     }
        //     if (this.gameStatus == 1) {
        //         if (period == Player.inst.data.period) {
        //             handler.runWith(true)
        //             return
        //         } else if (period - 1 == Player.inst.data.period && Player.inst.status < 3) {
        //             handler.runWith(true)
        //             return
        //         }
        //     }
        //     Log.info("GameServlet.checkStateHandler(data)gameStatus=" + this.gameStatus + ", period=" + period + ", " + Player.inst.data.period)
        //     handler.runWith(false)
        // }, () => {
        //     handler.runWith(false)
        // })
    }

    /**
     * 发送押注数据
     * @param url
     * @param data
     * @param callback
     */
    sendBet(url: string, data: any, callback: ParamHandler) {
        this.postData(url, data, (data: any) => {
            if (data.code != HttpCode.OK) {
                MessageTip.showTip(StateCode.getShowMessage(data))
                this.sendAction(ActionLib.GAME_RESET_BET)
            } else {
                Player.inst.gameData.playCount++
                Player.inst.playCount++
                if (Player.inst.isGuest) Player.inst.guestModel.guestPlayCount++

            }
            runFun(callback, data)
        }, () => {
            WaitResult.inst.hide()
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.NET_ERROR, null, () => {
                // this.sendAction(ActionLib.GAME_RESET_BET)
                SceneManager.inst.gameErrorExit()
            })
        })
    }

    /**
     * 领取奖金池
     * @param id
     * @param handler
     */
    jackPotClaim(id: string, handler: ParamHandler) {
        let obj: any = {}
        obj.token = Player.inst.token
        obj.game_id = Player.inst.gameId
        obj.id = id
        this.postData(Urls.URL_GAME_SCRATCHER_LOTTERY, obj,
            Laya.Handler.create(this, this.jackPotClaimHandler, [handler]), () => {
                runFun(handler, false)
            })
    }

    protected jackPotClaimHandler(handler: ParamHandler, data: any) {
        if (data.code != HttpCode.OK) {
            WaitResult.inst.hide()
            // this.showNotResult(data, false)
            StateCode.execute(data.code, data)
            return
        }
        data = data.data
        let balance: number = data.balance;//余额
        let win: number = data.win;//赢的钱
        this.readJackpotData(data)
        Player.inst.money = balance
        runFun(handler, true, win)
    }

    /**
     * 显示获取的非200的结果显示弹窗
     * @param data 服务器返回的完整数据
     * @param [closeGame=true] 是否关闭游戏
     */
    protected showNotResult(data: any, closeGame = true) {
        let str = StateCode.getShowMessage(data)
        if (StringUtil.isEmpty(str)) {
            str = getString(LibStr.NET_ERROR)
        }
        if (closeGame) {
            JSUtils.openModal(str)
            JSUtils.gameClose()
        } else {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, str)
        }
    }


    get gameModel() {
        this._gameModel ??= SceneManager.inst.starter.gameModel
        return this._gameModel
    }

    set gameModel(value: IGameModel) {
        this._gameModel = value
    }

    override dispose() {
        super.dispose()
    }

}