import GLoader = fgui.GLoader;
import GComponent = fgui.GComponent;
import Point = Laya.Point;
import GRoot = fgui.GRoot;
import LocalStorage = Laya.LocalStorage;
import Browser = Laya.Browser;
import Handler = Laya.Handler;
import LoaderFillType = fgui.LoaderFillType;
import {BaseView} from "./BaseView"
import {IGameScene} from "../interfaces/IGameScene"
import {IGameModel} from "../interfaces/IGameModel"
import {ActivityButton} from "../view/ActivityButton"
import {PromptTip} from "../view/PromptTip"
import {ActionLib} from "../actions/ActionLib"
import {Player} from "../Player"
import {AppRecordManager} from "../manager/AppRecordManager"
import {IGuide} from "../interfaces/IGuide"
import {PromptWindow} from "../view/PromptWindow"
import {StringUtil} from "../utils/StringUtil"
import {DateUtils} from "../utils/DateUtils"
import {LibStr} from "../LibStr"
import {WaitResult} from "../view/WaitResult"
import {JSUtils} from "../utils/JSUtils"
import {SceneManager} from "../manager/SceneManager"
import {AppManager} from "../manager/AppManager"
import {IGuideScene} from "../interfaces/IGuideScene"
import {Log} from "../Log";
import {CommonCmd, HttpCode, Urls} from "../net/Common";
import {ConfigUtils} from "../utils/ConfigUtils";
import {BaseGameData} from "./BaseGameData";

/** 游戏主页必须继承的类 */
export class BaseScene<T extends BaseGameData = BaseGameData> extends BaseView implements IGameScene, IGuideScene {

    /** 选择房间事件 */
    EVENT_SELECT_ROOM = "selectRoom"
    /** demo场试玩事件 */
    EVENT_DEMO_TIP = "demoTip"
    /** 引导事件 */
    EVENT_GUIDE = "guide"
    /** 优惠券事件 */
    EVENT_COUPON = "coupon"
    /** bonus事件 */
    EVENT_BONUS = "bonus"

    protected _gameModel: IGameModel
    /** 游戏说明 */
    protected guideSprite: GLoader
    /** 启动事件 */
    protected startupEvent: { handler: ParamHandler, weight?: number, name?: string }[] = []
    /** 当前游戏的活动按钮 */
    activityBtn: ActivityButton
    /** 提示文案 */
    promptTip: PromptTip
    /** 奖金组件 */
    jackpotBtn: any
    /** 是否在执行运行事件 */
    private isRunEvent = false

    constructor() {
        super()
        this.autoSetupRelation = true
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

    protected override constructFromXML(xml: any) {

        this.jackpotBtn = this.getChild("jackpot")

        this.regGameAction(ActionLib.GAME_RECONNECTION_NET, this, this.reconnectionNet)
        this.regGameAction(ActionLib.GAME_UPDATE_MONEY, this, this.updateMoney)
        this.regGameAction(ActionLib.GAME_RESET_BET, this, this.resetBet)
        this.regGameAction(ActionLib.GAME_START, this, this.startGame)
        this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose)

        this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.updateTotalCoupons)
        this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.updateTotalCoupons)
        this.regGameAction(ActionLib.GAME_BET_CHANGE, this, this.betChangeHandler)
        this.regGameAction(ActionLib.GAME_UPDATE_ROOM_ID_CHANGE, this, this.updateRoomIdChange)
        this.regGameAction(ActionLib.GAME_RUN_SCENE_EVENT, this, this.runEvent)
        super.constructFromXML(xml)
    }

    /**
     * 房间号变更
     * @param value 房间号
     */
    protected updateRoomIdChange(value: number) {
        this.gameModel.gameCode = value
    }

    /**
     * 显示提示文本
     * @param comp 绑定显示按钮位置
     * @param downward 是否在下面
     */
    protected showPromptActivity(comp: GComponent, downward?: any) {
        if (comp == null) return
        if (this.promptTip == null) {
            this.promptTip = PromptTip.createPromptTip()
        }
        this.promptTip.show(comp, downward)
    }

    /** 押注变化 */
    private betChangeHandler() {
        let betValue = Player.inst.gameData.getTotalBetMoney()
        // 清理正在使用的优惠券
        let useObj = Player.inst.getUseCoupon()
        if (useObj) {
            // 如果是抵用券 并且投注额和最小投注额一样
            if (useObj.type == 1 && useObj.bet_limit == useObj.faceValue) {
            } else if (betValue < useObj.bet_limit) {
                useObj.isUse = false
                this.sendAction(ActionLib.GAME_STOP_USE_ACTIVITY)
            }
            return
        }
        let arr = Player.inst.getCouponGame(Player.inst.gameModel)
        for (let i = 0; i < arr.length; i++) {
            useObj = arr[i]
            if (useObj.type == 1) {// 判断是否有可以使用的抵用券
                if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) {// 满足最低投注额
                    this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY)
                    break
                }
            } else if (useObj.type == 2) {
                this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY)
                break
            }
        }
    }

    /**
     * 初始化活动卷
     * @param component 获取活动按钮的父组件
     * @param isOpenDrag 是否开启拖动(默认true)
     * @param isAutoHide 当没有优惠卷使用的时候 是否自动隐藏(默认true)
     */
    protected initActivityMenu(component: GComponent, isOpenDrag = true, isAutoHide = true) {
        this.activityBtn = <ActivityButton>component.getChild("activityBtn")
        this.activityBtn ??= <ActivityButton>component.getChild("couponsBtn")
        if (this.activityBtn) {
            this.activityBtn.isAutoHide = isAutoHide
            if (isOpenDrag) this.activityBtn.openDrag()
            this.activityBtn.callback = new Handler(this, this.activityHandler)
            this.updateTotalCoupons()
        }
    }

    /** 更新中优惠券数量 */
    protected updateTotalCoupons() {
        if (this.activityBtn) {
            let coupons = Player.inst.getCouponGame(Player.inst.gameModel)
            let totalMoney = 0
            for (let i = 0; i < coupons.length; i++) {
                let activityBtnElement = coupons[i]
                totalMoney += activityBtnElement.faceValue * activityBtnElement.num
            }
            this.activityBtn.setCorner(totalMoney)
        }
    }

    protected activityHandler() {
        if (this.activityBtn) {
            let point = this.activityBtn.localToGlobal()
            GRoot.inst.globalToLocal(point.x, point.y, point)
            point.x = point.x + this.activityBtn.displayObject.pivotX
            point.y = point.y + this.activityBtn.displayObject.pivotY
            this.sendAction(ActionLib.GAME_ACTIVITY_WINDOW_SHOW, new Point(point.x, point.y))
        }
    }

    /** 发送投注劵使用结束 */
    sendBetCouponEnd() {
        // 如果使用的是投注劵
        let useObj = Player.inst.getUseCoupon()
        if (useObj && useObj.type == 2) {
            useObj.isUse = false
            this.sendAction(ActionLib.GAME_USE_ACTIVITY_END)
        }
    }

    /**
     * 舞台显示
     */
    protected override addedHandler() {
        super.addedHandler()
        AppRecordManager.addHistory(null, this)
//        if (jackpotBtn && Player.inst.isGuest) {
//            jackpotBtn.visible = false
//        }
        this.updateRoomIdChange(Player.inst.gameModel)
        // 因为有旋转屏幕  为了获取正确的宽高  延迟执行添加舞台
        Laya.timer.callLater(this, this.regEvent)
    }

    drawGuideRect(guideView: IGuide, index: number) {
    }

    clickGuide(guideView: IGuide, index: number) {
    }

    guideEnd(guideView: IGuide) {
        this.runEvent()
    }

    /** 注册进入事件 */
    protected regEvent() {
        this.isRunEvent = true
        // 启动房间选择
        this.regStartupEvent(this.eventSelectRoom.bind(this), -1, this.EVENT_SELECT_ROOM)
        // demo试玩提示
        this.regStartupEvent(this.eventGuestTip.bind(this), -1, this.EVENT_DEMO_TIP)
        // 显示引导页
        this.regStartupEvent(this.eventGuideTip.bind(this), 0, this.EVENT_GUIDE)
        // 判断是否有可以使用的优惠券 // demo 场不弹
        if (!Player.inst.isGuest) this.regStartupEvent(this.eventCouponTip.bind(this), 0, this.EVENT_COUPON)
        // 判断时候有可以使用的bonus
        this.regStartupEvent(this.eventBonusTip.bind(this), 0, this.EVENT_BONUS)
        this.runEventStart()
    }

    /**
     * 注册启动事件
     * @param handler 执行的方法
     * @param weight 权重 越大越后执行  默认0
     * @param name 事件名字 默认 null
     */
    regStartupEvent(handler: ParamHandler, weight = 0, name = null) {
        for (let i = 0; i < this.startupEvent.length; i++) {
            let regs = this.startupEvent[i]
            if (regs.weight > weight) {// 传入的值比当前值小
                this.regStartupEventIndex(i, handler, weight, name)
                return
            }
        }
        Log.debug("regStartupEvent -> name = " + name)
        this.startupEvent.push({handler: handler, weight: weight, name: name})
    }

    /**
     * 在指定位置插入一个事件
     * @param index 位置
     * @param handler 方法
     * @param weight 权重 默认0
     * @param name 事件名字 默认 null
     */
    regStartupEventIndex(index: number, handler: ParamHandler, weight = 0, name = null) {
        Log.debug("regStartupEventIndex -> name = " + name)
        this.startupEvent.splice(index, 0, {handler: handler, weight: weight, name: name})
    }

    /**
     * 根据事件名字 获取事件的执行位置
     * @param name 事件名字
     */
    getStartupEventIndex(name: string) {
        for (let i = 0; i < this.startupEvent.length; i++) {
            if (this.startupEvent[i].name == name) {
                return i
            }
        }
        return -1
    }

    /**
     * 删除指定位置的启动事件
     * @param index 位置
     */
    removeStartupEventIndex(index: number) {
        this.startupEvent.splice(index, 1)
    }

    /**
     * 删除指定名字的启动事件
     * @param name 事件名字
     */
    removeStartupEventName(name: string) {
        for (let i = 0; i < this.startupEvent.length; i++) {
            if (this.startupEvent[i].name == name) {
                this.startupEvent.splice(i, 1)
                i--
                Log.debug("Unload Startup event -> name = " + name)
            }
        }
    }

    /**
     * 执行事件列表
     */
    runEvent() {
        if (this.startupEvent.length > 0) {
            let event = this.startupEvent.shift()
            Log.debug("execute event = " + event.name)
            runFun(event.handler)
        } else {
            this.runEventEnd()
        }
    }

    /** 开始运行事件前 */
    protected runEventStart() {
        this.runEvent()
    }

    /** 运行事件结束 */
    protected runEventEnd() {
        Log.debug("runEventEnd")
        if (this.isRunEvent) {
            this.startGame()
        }
        this.isRunEvent = false
    }

    /**
     * 重新连接网络 同步数据
     * @param callback 同步完成调用
     * @param count 剩余重复次数
     */
    reconnectionNet(callback: ParamHandler, count = 3) {
        if (Player.inst.isGuest || Player.inst.token == null || count <= 0) {
            AppRecordManager.pauseHistory = false
            GRoot.inst.closeModalWait()
            runFun(callback)
            return
        }
        GRoot.inst.showModalWait(getString(LibStr.WAITING))
        AppRecordManager.pauseHistory = true
        // 同步用户金额
        PromptWindow.inst.clearCache()
        this.gameModel.gameServlet.getUserMoney((obj: any) => {
            if (obj.code == HttpCode.OK) {
                let data = obj.data
                Player.inst.money = data.balance
                this.sendAction(ActionLib.GAME_UPDATE_MONEY)
                AppRecordManager.pauseHistory = false
                GRoot.inst.closeModalWait()
                runFun(callback)
            } else {
                count--
                Laya.timer.once(1000, this, this.reconnectionNet, [callback, count])
            }
        }, () => {
            count--
            Laya.timer.once(1000, this, this.reconnectionNet, [callback, count])
        })
    }

    /** 新游戏开始  这里可以处理一些逻辑 */
    newGameStartLogic(handler?: ParamHandler) {
        let gameData = Player.inst.gameData
        let winLimit = gameData ? gameData.getTotalBetMoney() * 3 : 0
        if (Player.inst.isGuest && Player.inst.guestModel.guestPlayCount >= CommonCmd.GUEST_MAX_PLAY_COUNT && (
            gameData != null && !gameData.isRecommend && winLimit <= gameData.totalWinMoney
        )) {
            gameData.isRecommend = true
            this.showInviteRealMoney(handler)
            return
        }
        // let playTip: string = LocalStorage.getItem("playTip")
        // if (!Render.isConchApp && Player.inst.webPlayCount == CommonCmd.WEB_MAX_PLAY_COUNT && StringUtil.isEmpty(playTip)) {
        //     LocalStorage.setItem("playTip", "Y")
        //     // new DownloadWindow().showTip(handler)
        //     return
        // }
        runFun(handler)
    }

    /**
     * 显示邀请进入真钱场
     * @param handler 回调
     */
    showInviteRealMoney(handler?: ParamHandler) {
        let obj: IPromptData = {okName: "Ok"}
        if (Player.inst.token) {
            WaitResult.inst.show()
            this.gameModel.gameServlet.postData(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET),
                {token: Player.inst.token}, (data) => {
                    WaitResult.inst.hide()
                    if (data.code == HttpCode.OK && data.data) {
                        if (data.data.balance == 0) {
                            obj.okName = getString(LibStr.DEPOSIT_PLAY)
                        }
                    }
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.SHOW_INVITE_REAL_MONEY, obj, handler, () => {
                        if (obj.okName == getString(LibStr.DEPOSIT_PLAY)) {
                            JSUtils.gameClose(1)
                            JSUtils.deposit()
                        } else {
                            JSUtils.gameClose(1)
                        }
                    })
                }, () => {
                    WaitResult.inst.hide()
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.SHOW_INVITE_REAL_MONEY, obj, handler, () => {
                        JSUtils.gameClose(1)
                    })
                })
            return
        } else {
            obj.okName = getString(LibStr.LOGIN_PLAY)
        }
        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.SHOW_INVITE_REAL_MONEY, obj, handler, () => {
            if (obj.okName == getString(LibStr.LOGIN_PLAY)) {
                JSUtils.login()
            } else {
                this.backHandler()
            }
        })
    }

    /**
     * 新一轮游戏的开始
     */
    startGame() {
        // 当前没有在使用的优惠卷  并且界面还在优惠卷模式下
        let useObj: any
        if ((useObj = Player.inst.getUseCoupon()) != null) {
            if (useObj.num <= 0) {
                Player.inst.removeCoupon(useObj)
                this.sendAction(ActionLib.GAME_USE_ACTIVITY_END)
            }
        }
    }

    /** 更新金额 */
    updateMoney() {

    }

    override hideRecord() {
        SceneManager.inst.backHandler()
        super.hideRecord()
    }

    get gameModel() {
        if (this._gameModel == null) this._gameModel = SceneManager.inst.starter.gameModel
        return this._gameModel
    }

    set gameModel(value: IGameModel) {
        this._gameModel = value
    }

    /** 押注还原(用于押注失败  退还所有的押注) */
    resetBet() {

    }

    override dispose() {
        AppManager.log("game dispose")
        Player.inst.stopAllCoupon()
        if (this.guideSprite) this.guideSprite.dispose()
        if (this.promptTip) this.promptTip.dispose()
        super.dispose()
    }

    protected override backHandler() {
        if (this.parent)
            AppRecordManager.backGame()
    }


    // *********************        Event         **********************************

    protected eventSelectRoom() {
        this.sendAction(ActionLib.GAME_SHOW_ROOM_SELECT)
    }

    /**
     * demo场弹窗
     */
    protected eventGuestTip() {
        // let value: string = LocalStorage.getItem(Player.inst.gameModel + "_demo")
        // if (Player.inst.isGuest && value == null) {
        if (Player.inst.isGuest) {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, LibStr.PROMPT_GUEST, () => {
                this.runEvent()
            })
            // LocalStorage.setItem(Player.inst.gameModel + "_demo", "1")
        } else {
            this.runEvent()
        }
    }

    protected eventCouponTip() {
        let giftOpenTimerStr = LocalStorage.getItem("giftOpenTimer" + Player.inst.gameModel)
        let giftOpenTimer: number
        if (StringUtil.isEmpty(giftOpenTimerStr)) {
            giftOpenTimerStr = "0"
        }
        giftOpenTimer = parseFloat(giftOpenTimerStr)
        if (!DateUtils.isSameDay(giftOpenTimer, Browser.now())) {
            let coupon = Player.inst.getCouponGame(Player.inst.gameModel)
            if (coupon.length > 0) {
                this.activityHandler()
                LocalStorage.setItem("giftOpenTimer" + Player.inst.gameModel, Browser.now() + "")
            } else {
                this.runEvent()
            }
        } else {
            this.runEvent()
        }
    }

    protected eventBonusTip() {
        if (Player.inst.jackpotData.length > 0 && this.jackpotBtn) {
            this.jackpotBtn.jackpotBtn.displayObject.event(Laya.Event.CLICK)
        } else {
            this.runEvent()
        }
    }


    /** 引导事件执行 */
    protected eventGuideTip() {
        let value = LocalStorage.getItem("GameGuide_" + Player.inst.gameModel)
        if (value == null) {
            let result = this.showGuide()
            if (result) {
                LocalStorage.setItem("GameGuide_" + Player.inst.gameModel, "true")
            } else {
                this.runEvent()
            }
        } else {
            this.runEvent()
        }
    }

    /** 显示引导页 默认不显示引导页 */
    protected showGuide() {
        const configName = ConfigUtils.gameNameCanonical()
        let obj = Browser.window[configName]
        if (obj.guide) {// 如果存在引导页配置  默认使用全屏展示
            this.loadFillImage(obj.guide)
            return true
        }
        return false
    }

    /**
     * 加载全屏图片
     * @param value
     */
    protected loadFillImage(value: any) {
        let urls = value instanceof Array ? value : [value]
        let index = 0
        this.guideSprite = new GLoader()
        this.guideSprite.setSize(GRoot.inst.width, GRoot.inst.height)
        this.guideSprite.fill = LoaderFillType.ScaleFree
        this.guideSprite.onClick(this, () => {
            index++
            if (index >= urls.length) {
                this.guideSprite.dispose()
                this.guideSprite = null
                this.runEvent()
            } else {
                this.guideSprite.url = urls[index]
            }
        })
        this.guideSprite.url = urls[index]
        GRoot.inst.addChild(this.guideSprite)
    }


}

