window.gameLib = {};

(function (gameLib) {
    class BaseView extends tsCore.EView {
        constructor() {
            super();
        }
    }
    gameLib.BaseView = BaseView;
    let ActionLib;
    (function (ActionLib) {
        // 初始化设备数据
        ActionLib["INIT_DEVICE_DATA"] = "init_device_data";
        // 检查登录状态
        ActionLib["CHECK_LOGIN_STATE"] = "check_login_state";
        // 开始加载主资源
        ActionLib["START_MAIN_LOAD_RES"] = "start_main_load_res";
        /** reg gameCommon class */
        ActionLib["GAME_REG_GAME_COMMON_CLASS"] = "game_reg_game_common_class";
        ActionLib["HOME_SCENE"] = "homeScene";
        /** 检查游戏的状态 */
        ActionLib["GAME_CHECK_STATE"] = "game_check_state";
        /** 初始化游戏的通信 */
        ActionLib["GAME_INIT_SERVLET"] = "game_init_servlet";
        /** 链接游戏的socket */
        ActionLib["GAME_CONNECT_SOCKET"] = "game_connect_socket";
        /** 游戏扩展的类初始化 */
        ActionLib["GAME_INSERT_EXTENSION"] = "game_insert_extension";
        /** 注册游戏中的socket监听 */
        ActionLib["GAME_INIT_SOCKET_EVENT"] = "game_init_socket_event";
        /** 创建游戏到舞台上 */
        ActionLib["GAME_CREATE_SCENE_SHOW"] = "game_create_scene_show";
        /** 初始化model */
        ActionLib["GAME_INIT_MODEL"] = "game_init_model";
        /** 开始游戏 */
        ActionLib["GAME_START"] = "game_start";
        /** 清理游戏 */
        ActionLib["GAME_DISPOSE"] = "game_dispose";
        /** 清理游戏资源 */
        ActionLib["GAME_CLEAR_RES"] = "game_clear_res";
        /** 游戏网络从连 */
        ActionLib["GAME_RECONNECTION_NET"] = "game_reconnection_net";
        /** 游戏更新余额 */
        ActionLib["GAME_UPDATE_MONEY"] = "game_update_money";
        /** 重置游戏下注 */
        ActionLib["GAME_RESET_BET"] = "game_reset_bet";
        /** 播放金币动画 */
        ActionLib["PLAY_GOLD_EFFECT"] = "play_gold_effect";
        /** 关闭金币动画 */
        ActionLib["CLOSE_GOLD_EFFECT"] = "close_gold_effect";
        /** 显示活动弹窗 */
        ActionLib["GAME_ACTIVITY_WINDOW_SHOW"] = "game_activity_window_show";
        /** 用户使用活动卷 激活界面变化 */
        ActionLib["GAME_USE_ACTIVITY"] = "game_use_activity";
        /** 用户停止使用活动卷 激活界面变化 */
        ActionLib["GAME_STOP_USE_ACTIVITY"] = "game_stop_use_activity";
        /** 用户使用活动卷结束 激活界面变化 */
        ActionLib["GAME_USE_ACTIVITY_END"] = "game_use_activity_end";
        /** 更新活动卷使用变化 */
        ActionLib["GAME_UPDATE_USE_ACTIVITY_CHANGE"] = "game_update_use_activity_change";
        /** 打开活动也帮助 */
        ActionLib["GAME_ACTIVITY_HELP_WINDOW_SHOW"] = "game_activity_help_window_show";
        /** 活动窗口关闭 */
        ActionLib["GAME_ACTIVITY_WINDOW_CLOSE"] = "game_activity_window_close";
        /** 游戏押注变化 */
        ActionLib["GAME_BET_CHANGE"] = "game_bet_change";
        /** 提示用户有可以使用的优惠券 */
        ActionLib["GAME_PROMPT_CAN_USE_ACTIVITY"] = "game_prompt_can_use_activity";
        /** 显示游戏账户充值界面 */
        ActionLib["GAME_SHOW_ACCOUNT_TOP_UP"] = "game_show_account_top_up";
        /** 游戏房间选择 */
        ActionLib["GAME_SHOW_ROOM_SELECT"] = "game_show_room_select";
        /** 更新游戏房间号变化 */
        ActionLib["GAME_UPDATE_ROOM_ID_CHANGE"] = "game_update_room_id_change";
        /** 显示领取奖金窗口 */
        ActionLib["GAME_SHOW_JACKPOT_WINDOW"] = "game_show_jackpot_window";
        /** 更新奖金池金额 */
        ActionLib["GAME_UPDATE_JACKPOT_POOL"] = "game_update_jackpot_pool";
        /** 增加奖金 奖金池掉落金币 */
        ActionLib["GAME_JACKPOT_BONUS_ANIMATION"] = "game_jackpot_bonus_animation";
        /** 显示奖金中的钱 */
        ActionLib["GAME_SHOW_JACKPOT_WIN_WINDOW"] = "game_show_jackpot_win_window";
        /** 显示房间公告 */
        ActionLib["GAME_SHOW_ROOM_NOTICE"] = "game_show_room_notice";
        /** 运行舞台的事件 */
        ActionLib["GAME_RUN_SCENE_EVENT"] = "game_run_scene_event";
        /** 更新默认舞台方向 */
        ActionLib["GAME_UPDATE_DEFAULT_SCREEN"] = "game_update_default_screen";
        /** 播放 slot 滚动动画 */
        ActionLib["GAME_PLAY_SLOT_LIST_RUN_ANI"] = "game_play_slot_list_run_ani";
        /** 通知开奖动画完成 执行model的结束方法 */
        ActionLib["GAME_LOTTERY_ANI_COMPLETE"] = "game_lottery_ani_complete";
        /** 获得手机图片数据 */
        ActionLib["GET_MOBILE_PHONE_IMAGE_DATA"] = "get_mobile_phone_image_data";
        /** 更新活动奖池数据 */
        ActionLib["UPDATE_DAILY_CASH_POOL"] = "update_daily_cash_pool";
        /** 播放 wheel 滚动动画 */
        ActionLib["GAME_PLAY_WHEEL_RUN_ANI"] = "game_play_wheel_run_ani";
        /** 显示普通的赢钱金额(公共的弹窗) */
        ActionLib["GAME_SHOW_WIN_WINDOW"] = "game_show_win_window";
        /** 打开一次礼包结束 */
        ActionLib["GAME_OPEN_GIFT_END"] = "game_open_gift_end";
        /** 显示引导页 */
        ActionLib["GAME_SHOW_GUIDE"] = "game_show_guide";
        /** 显示引导页 */
        ActionLib["GAME_SHOW_GUIDE_WINDOW"] = "game_show_guide_window";
        /**
         * 显示提示文案窗口 :
         * ```
         *  msg:string 直接显示文本
         *  callback:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         * ```
         * @see PromptWindow.showTip
         */
        ActionLib["GAME_SHOW_PROMPT_WINDOW"] = "game_show_prompt_window";
        /**
         * 显示提示文案窗口 带多参数设置:
         *  ```
         *  msg:string|number|any[] 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         *  obj:IPromptData 附带设置 (okName:getString(LibStr.CONTINUE), cancelName: getString(LibStr.CANCEL))
         *  callback:ParamHandler 取消回调方法
         *  continueFun:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         *  ```
         *  @see PromptWindow.showCancelTip
         */
        ActionLib["GAME_SHOW_PROMPT_CANCEL_WINDOW"] = "game_show_prompt_cancel_window";
        /**
         * 显示常规的提示文案窗口
         * ```
         *  msg:string|number|any[] 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         *  obj:IPromptData 附带设置 (okName:'', cancelName:'')
         *  callback:ParamHandler 取消回调方法
         *  continueFun:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         *
         *  或者只传递一个参数 PromptData
         * ```
         *  @see PromptWindow._showWindow
         *  @see PromptData
         */
        ActionLib["GAME_SHOW_PROMPT_NORMAL_WINDOW"] = "game_show_prompt_normal_window";
        /** 游戏新的回合开始 */
        ActionLib["GAME_NEW_ROUND_START"] = "GAME_NEW_ROUND_START";
        // 游戏公用事件
        /** 游戏 */
        ActionLib["GAME_CLOSE_ALL_ANI"] = "game_close_all_ani";
        /** 显示帮助文档 */
        ActionLib["GAME_SHOW_HELP"] = "game_show_help";
        /** 播放动画 */
        ActionLib["GAME_PLAY_LOTTERY_ANI"] = "game_play_lottery_ani";
        /** 更改 spin 模式文字 0 spin 1 stop */
        ActionLib["GAME_CHANGE_SPIN_TEXT"] = "game_change_spin_text";
        /** 改变所有按钮的状态 */
        ActionLib["GAME_ALL_BTN_CHANGE_STATE"] = "game_all_btn_change_state";
        /** 更新赢钱的值 */
        ActionLib["GAME_UPDATE_WIN_VALUE"] = "game_update_win_value";
        /**
         * 游戏更新自动SPIN次数
         */
        ActionLib["GAME_UPDATE_AUTO_SPIN_NUMBER"] = "game_update_auto_spin_number";
        /**
         * 游戏更新自动bet次数
         * @deprecated
         * @see GAME_UPDATE_AUTO_SPIN_NUMBER
         */
        ActionLib["GAME_UPDATE_AUTO_BET_NUMBER"] = "game_update_auto_spin_number";
        /**
         * 游戏更新免费次数
         * @deprecated
         * @see GAME_UPDATE_AUTO_SPIN_NUMBER
         */
        ActionLib["GAME_UPDATE_FREE_COUNT"] = "game_update_auto_spin_number";
        /** 播放收金币动画 */
        ActionLib["GAME_PLAY_COLLECT_GOLD_COINS_ANI"] = "game_play_collect_gold_coins_ani";
        /** 显示free窗口 */
        ActionLib["GAME_SHOW_FREE_WINDOW"] = "game_show_free_window";
        /** 隐藏free窗口 */
        ActionLib["GAME_HIDE_FREE_WINDOW"] = "game_hide_free_window";
        /** 显示freeUI */
        ActionLib["GAME_SHOW_FREE_UI"] = "game_show_free_ui";
        /** 隐藏freeUI */
        ActionLib["GAME_HIDE_FREE_UI"] = "game_hide_free_ui";
        /** 显示free 结束界面 */
        ActionLib["GAME_SHOW_FREE_FINISH_VIEW"] = "game_show_free_finish_view";
        /** 显示结算UI */
        ActionLib["GAME_SHOW_SETTLE_WIN_UI"] = "game_show_settle_win_ui";
        /** 显示默认提示语 */
        ActionLib["GAME_SHOW_DEFAULT_TIP"] = "game_show_default_tip";
        /** 执行播放背景音乐 */
        ActionLib["GAME_PLAY_BG_MUSIC"] = "game_play_bg_music";
        /** 更新总投注 */
        ActionLib["GAME_UPDATE_TOTAL_BET"] = "game_update_total_bet";
        /** 更新bounds信息 */
        ActionLib["GAME_UPDATE_BOUNDS_INFO"] = "game_update_bounds_info";
    })(ActionLib = gameLib.ActionLib || (gameLib.ActionLib = {}));
    /** 加载资源配置 */
    class LoaderConfig {
        /**
         * 清理资源
         * @param res 要清理的资源数组
         */
        static clear(res) {
            for (let i = 0; i < res.length; i++) {
                tsCore.ELoader.loader.clearRes(res[i].url);
            }
        }
    }
    gameLib.LoaderConfig = LoaderConfig;
    /**
     * 游戏类型
     */
    let GameType;
    (function (GameType) {
        /** 正常游戏 */
        GameType[GameType["NORMAL"] = 0] = "NORMAL";
        /** 连线游戏 */
        GameType[GameType["SLOT"] = 1] = "SLOT";
    })(GameType = gameLib.GameType || (gameLib.GameType = {}));
    /**
     * 游戏数据的基类
     */
    class BaseGameData {
        constructor() {
            /** 服务器发来的当前余额 */
            this.currentBalance = 0;
            /** 后端计算   当前盈利 */
            this.serverWinMoney = 0;
            this.totalWinMoney = 0;
            this.playCount = 0;
            /** 缓存 后端计算 当前盈利 */
            this.tempServerWinMoney = 0;
            /** 当前玩家选择的自动bet次数 */
            this.autoBetCount = 0;
            /** 当前玩家选择的自动bet次数 (缓存) */
            this.tempAutoBetCount = 0;
            /** bet 额度切换值 */
            this.betMoney = [];
            /** 当前bet值 */
            this.betValue = 0;
            /** 是否已经弹出过一次推荐现金游戏 */
            this.isRecommend = false;
            /** 通知数据 */
            this.noticeData = [];
            /** 默认bet位置 */
            this.defaultBetIndex = 0;
            /**
             * 当前是否在特殊模式
             * @default false
             */
            this.specialMode = false;
            /**
             * 重置默认bet值
             * @default false
             */
            this.isResetBetValue = false;
            /** 游戏类型 */
            this.gameType = GameType.NORMAL;
        }
        /**
         * 总金额 default BaseGameData.betValue
         */
        getTotalBetMoney() {
            return this.betValue;
        }
        /**
         * 获取赢钱动画 的播放时长
         * @param level 播放时长等级 0开始
         */
        getWinMoneyAniDuration(level) {
            return 1000 * (level + 1);
        }
        /**
         * 是否达到 BigWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=10] 倍数
         * @return
         */
        isBigWin(isTotal = false, multiple = 10) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        /**
         * 是否达到 MegaWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=30] 倍数
         * @return
         */
        isMegaWin(isTotal = false, multiple = 30) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        /**
         * 是否达到 SuperWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=60] 倍数
         */
        isSuperWin(isTotal = false, multiple = 60) {
            return (isTotal ? this.totalWinMoney : this.serverWinMoney) > this.getTotalBetMoney() * multiple;
        }
        reportError() {
            return JSON.stringify(this);
        }
    }
    gameLib.BaseGameData = BaseGameData;
    /** 游戏主页必须继承的类 */
    class BaseScene extends BaseView {
        constructor() {
            super();
            /** 选择房间事件 */
            this.EVENT_SELECT_ROOM = "selectRoom";
            /** demo场试玩事件 */
            this.EVENT_DEMO_TIP = "demoTip";
            /** 引导事件 */
            this.EVENT_GUIDE = "guide";
            /** 优惠券事件 */
            this.EVENT_COUPON = "coupon";
            /** bonus事件 */
            this.EVENT_BONUS = "bonus";
            /** 启动事件 */
            this.startupEvent = [];
            /** 是否在执行运行事件 */
            this.isRunEvent = false;
            this.autoSetupRelation = true;
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
        }
        /*@override*/
        onConstruct() {
            this.jackpotBtn = this.getChild("jackpot");
            this.regGameAction(ActionLib.GAME_RECONNECTION_NET, this, this.reconnectionNet);
            this.regGameAction(ActionLib.GAME_UPDATE_MONEY, this, this.updateMoney);
            this.regGameAction(ActionLib.GAME_RESET_BET, this, this.resetBet);
            this.regGameAction(ActionLib.GAME_START, this, this.startGame);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.updateTotalCoupons);
            this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.updateTotalCoupons);
            this.regGameAction(ActionLib.GAME_BET_CHANGE, this, this.betChangeHandler);
            this.regGameAction(ActionLib.GAME_UPDATE_ROOM_ID_CHANGE, this, this.updateRoomIdChange);
            this.regGameAction(ActionLib.GAME_RUN_SCENE_EVENT, this, this.runEvent);
            super.onConstruct();
        }
        /**
         * 房间号变更
         * @param value 房间号
         */
        updateRoomIdChange(value) {
            this.gameModel.gameCode = value;
        }
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        showPromptActivity(comp, downward) {
            var _a;
            if (!comp)
                return;
            (_a = this.promptTip) !== null && _a !== void 0 ? _a : (this.promptTip = PromptTip.createPromptTip());
            this.promptTip.show(comp, downward);
        }
        /** 押注变化 */
        betChangeHandler() {
            let betValue = Player.inst.gameData.getTotalBetMoney();
            // 清理正在使用的优惠券
            let useObj = Player.inst.getUseCoupon();
            if (useObj) {
                // 如果是抵用券 并且投注额和最小投注额一样
                if (useObj.type == 1 && useObj.bet_limit == useObj.faceValue) {
                }
                else if (betValue < useObj.bet_limit) {
                    useObj.isUse = false;
                    this.sendAction(ActionLib.GAME_STOP_USE_ACTIVITY);
                }
                return;
            }
            let arr = Player.inst.getCouponGame(Player.inst.gameId);
            for (let i = 0; i < arr.length; i++) {
                useObj = arr[i];
                if (useObj.type == 1) { // 判断是否有可以使用的抵用券
                    if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) { // 满足最低投注额
                        this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY);
                        break;
                    }
                }
                else if (useObj.type == 2) {
                    this.sendAction(ActionLib.GAME_PROMPT_CAN_USE_ACTIVITY);
                    break;
                }
            }
        }
        /**
         * 初始化活动卷
         * @param component 获取活动按钮的父组件
         * @param isOpenDrag 是否开启拖动(默认true)
         * @param isAutoHide 当没有优惠卷使用的时候 是否自动隐藏(默认true)
         */
        initActivityMenu(component, isOpenDrag = true, isAutoHide = true) {
            var _a;
            this.activityBtn = component.getChild("activityBtn");
            (_a = this.activityBtn) !== null && _a !== void 0 ? _a : (this.activityBtn = component.getChild("couponsBtn"));
            if (this.activityBtn) {
                this.activityBtn.isAutoHide = isAutoHide;
                if (isOpenDrag)
                    this.activityBtn.openDrag();
                this.activityBtn.callback = new Laya.Handler(this, this.activityHandler);
                this.updateTotalCoupons();
            }
        }
        /** 更新中优惠券数量 */
        updateTotalCoupons() {
            if (this.activityBtn) {
                let coupons = Player.inst.getCouponGame(Player.inst.gameId);
                let totalMoney = 0;
                for (let i = 0; i < coupons.length; i++) {
                    let activityBtnElement = coupons[i];
                    totalMoney += activityBtnElement.faceValue * activityBtnElement.num;
                }
                this.activityBtn.setCorner(totalMoney);
            }
        }
        activityHandler() {
            if (this.activityBtn) {
                let point = this.activityBtn.localToGlobal();
                fgui.GRoot.inst.globalToLocal(point.x, point.y, point);
                point.x = point.x + this.activityBtn.displayObject.pivotX;
                point.y = point.y + this.activityBtn.displayObject.pivotY;
                this.sendAction(ActionLib.GAME_ACTIVITY_WINDOW_SHOW, new Laya.Point(point.x, point.y));
            }
        }
        /** 发送投注劵使用结束 */
        sendBetCouponEnd() {
            // 如果使用的是投注劵
            let useObj = Player.inst.getUseCoupon();
            if (useObj && useObj.type == 2) {
                useObj.isUse = false;
                this.sendAction(ActionLib.GAME_USE_ACTIVITY_END);
            }
        }
        /**
         * 舞台显示
         */
        /*@override*/
        addedHandler() {
            super.addedHandler();
            tsCore.HistoryManager.addHistory(null, this);
            //        if (jackpotBtn && Player.inst.isGuest) {
            //            jackpotBtn.visible = false
            //        }
            this.updateRoomIdChange(Player.inst.gameId);
            // 因为有旋转屏幕  为了获取正确的宽高  延迟执行添加舞台
            Laya.timer.callLater(this, this.regEvent);
        }
        drawGuideRect(guideView, index) {
        }
        clickGuide(guideView, index) {
        }
        guideEnd(guideView) {
            this.runEvent();
        }
        /** 注册进入事件 */
        regEvent() {
            this.isRunEvent = true;
            // 启动房间选择
            this.regStartupEvent(this.eventSelectRoom.bind(this), -1, this.EVENT_SELECT_ROOM);
            // demo试玩提示
            this.regStartupEvent(this.eventGuestTip.bind(this), -1, this.EVENT_DEMO_TIP);
            // 显示引导页
            this.regStartupEvent(this.eventGuideTip.bind(this), 0, this.EVENT_GUIDE);
            // 判断是否有可以使用的优惠券 // demo 场不弹
            if (!Player.inst.isGuest)
                this.regStartupEvent(this.eventCouponTip.bind(this), 0, this.EVENT_COUPON);
            // 判断时候有可以使用的bonus
            this.regStartupEvent(this.eventBonusTip.bind(this), 0, this.EVENT_BONUS);
            this.runEventStart();
        }
        /**
         * 注册启动事件
         * @param handler 执行的方法
         * @param weight 权重 越大越后执行  默认0
         * @param name 事件名字 默认 null
         */
        regStartupEvent(handler, weight = 0, name = null) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                let regs = this.startupEvent[i];
                if (regs.weight > weight) { // 传入的值比当前值小
                    this.regStartupEventIndex(i, handler, weight, name);
                    return;
                }
            }
            tsCore.Log.debug("regStartupEvent -> name = " + name);
            this.startupEvent.push({ handler: handler, weight: weight, name: name });
        }
        /**
         * 在指定位置插入一个事件
         * @param index 位置
         * @param handler 方法
         * @param weight 权重 默认0
         * @param name 事件名字 默认 null
         */
        regStartupEventIndex(index, handler, weight = 0, name = null) {
            tsCore.Log.debug("regStartupEventIndex -> name = " + name);
            this.startupEvent.splice(index, 0, { handler: handler, weight: weight, name: name });
        }
        /**
         * 根据事件名字 获取事件的执行位置
         * @param name 事件名字
         */
        getStartupEventIndex(name) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                if (this.startupEvent[i].name == name) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * 删除指定位置的启动事件
         * @param index 位置
         */
        removeStartupEventIndex(index) {
            this.startupEvent.splice(index, 1);
        }
        /**
         * 删除指定名字的启动事件
         * @param name 事件名字
         */
        removeStartupEventName(name) {
            for (let i = 0; i < this.startupEvent.length; i++) {
                if (this.startupEvent[i].name == name) {
                    this.startupEvent.splice(i, 1);
                    i--;
                    tsCore.Log.debug("Unload Startup event -> name = " + name);
                }
            }
        }
        /**
         * 执行事件列表
         */
        runEvent() {
            if (this.startupEvent.length > 0) {
                let event = this.startupEvent.shift();
                tsCore.Log.debug("execute event = " + event.name);
                runFun(event.handler);
            }
            else {
                this.runEventEnd();
            }
        }
        /** 开始运行事件前 */
        runEventStart() {
            this.runEvent();
        }
        /** 运行事件结束 */
        runEventEnd() {
            tsCore.Log.debug("runEventEnd");
            if (this.isRunEvent) {
                this.startGame();
            }
            this.isRunEvent = false;
        }
        /**
         * 重新连接网络 同步数据
         * @param callback 同步完成调用
         * @param count 剩余重复次数
         */
        reconnectionNet(callback, count = 3) {
            if (Player.inst.isGuest || !Player.inst.token || count <= 0) {
                tsCore.HistoryManager.pauseHistory = false;
                fgui.GRoot.inst.closeModalWait();
                runFun(callback);
                return;
            }
            fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            tsCore.HistoryManager.pauseHistory = true;
            // 同步用户金额
            PromptWindow.inst.clearCache();
            this.gameModel.gameServlet.getUserMoney((obj) => {
                if (obj.code == HttpCode.OK) {
                    let data = obj.data;
                    Player.inst.money = data.balance;
                    this.sendAction(ActionLib.GAME_UPDATE_MONEY);
                    tsCore.HistoryManager.pauseHistory = false;
                    fgui.GRoot.inst.closeModalWait();
                    runFun(callback);
                }
                else {
                    count--;
                    Laya.timer.once(1000, this, this.reconnectionNet, [callback, count]);
                }
            }, () => {
                count--;
                Laya.timer.once(1000, this, this.reconnectionNet, [callback, count]);
            });
        }
        /** 新游戏开始  这里可以处理一些逻辑 */
        newGameStartLogic(handler) {
            let gameData = Player.inst.gameData;
            let winLimit = gameData ? gameData.getTotalBetMoney() * 3 : 0;
            if (Player.inst.isGuest && Player.inst.guestModel.guestPlayCount >= CommonCmd.GUEST_MAX_PLAY_COUNT && (gameData != null && !gameData.isRecommend && winLimit <= gameData.totalWinMoney)) {
                gameData.isRecommend = true;
                this.showInviteRealMoney(handler);
                return;
            }
            // let playTip: string = Laya.LocalStorage.getItem("playTip")
            // if (!Render.isConchApp && Player.inst.webPlayCount == CommonCmd.WEB_MAX_PLAY_COUNT && tsCore.StringUtil.isEmpty(playTip)) {
            //     Laya.LocalStorage.setItem("playTip", "Y")
            //     // new DownloadWindow().showTip(handler)
            //     return
            // }
            runFun(handler);
        }
        /**
         * 显示邀请进入cash场
         * @param handler 回调
         */
        showInviteRealMoney(handler) {
            let obj = { okName: "Ok" };
            if (Player.inst.token) {
                WaitResult.inst.show();
                this.gameModel.gameServlet.postData(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET), { token: Player.inst.token }, (data) => {
                    WaitResult.inst.hide();
                    if (data.code == HttpCode.OK && data.data) {
                        if (data.data.balance == 0) {
                            obj.okName = getString(1035 /* LibStr.DEPOSIT_PLAY */);
                        }
                    }
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                        if (obj.okName == getString(1035 /* LibStr.DEPOSIT_PLAY */)) {
                            JSUtils.gameClose(1);
                            JSUtils.deposit();
                        }
                        else {
                            JSUtils.gameClose(1);
                        }
                    });
                }, () => {
                    WaitResult.inst.hide();
                    this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                        JSUtils.gameClose(1);
                    });
                });
                return;
            }
            else {
                obj.okName = getString(1036 /* LibStr.LOGIN_PLAY */);
            }
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1015 /* LibStr.SHOW_INVITE_REAL_MONEY */, obj, handler, () => {
                if (obj.okName == getString(1036 /* LibStr.LOGIN_PLAY */)) {
                    JSUtils.login();
                }
                else {
                    this.backHandler();
                }
            });
        }
        /**
         * 新一轮游戏的开始
         */
        startGame() {
            // 当前没有在使用的优惠卷  并且界面还在优惠卷模式下
            let useObj;
            if ((useObj = Player.inst.getUseCoupon()) != null) {
                if (useObj.num <= 0) {
                    Player.inst.removeCoupon(useObj);
                    this.sendAction(ActionLib.GAME_USE_ACTIVITY_END);
                }
            }
        }
        /** 更新金额 */
        updateMoney() {
        }
        /*@override*/
        hideRecord() {
            SceneManager.inst.backHandler();
            super.hideRecord();
        }
        get gameModel() {
            var _a;
            (_a = this._gameModel) !== null && _a !== void 0 ? _a : (this._gameModel = SceneManager.inst.starter.gameModel);
            return this._gameModel;
        }
        set gameModel(value) {
            this._gameModel = value;
        }
        /** 押注还原(用于押注失败  退还所有的押注) */
        resetBet() {
        }
        /*@override*/
        dispose() {
            tsCore.Log.debug("game dispose");
            Player.inst.stopAllCoupon();
            if (this.guideSprite)
                this.guideSprite.dispose();
            if (this.promptTip)
                this.promptTip.dispose();
            super.dispose();
        }
        /*@override*/
        backHandler() {
            if (this.parent)
                AppRecordManager.backGame();
        }
        // *********************        Event         **********************************
        eventSelectRoom() {
            this.sendAction(ActionLib.GAME_SHOW_ROOM_SELECT);
        }
        /**
         * demo场弹窗
         */
        eventGuestTip() {
            // let value: string = Laya.LocalStorage.getItem(Player.inst.gameId + "_demo")
            // if (Player.inst.isGuest && !value) {
            if (Player.inst.isGuest) {
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, { msg: 1013 /* LibStr.PROMPT_GUEST */, obj: { cancelName: getString(1066 /* LibStr.OK */) }, callback: this.runEvent.bind(this) });
                // Laya.LocalStorage.setItem(Player.inst.gameId + "_demo", "1")
            }
            else {
                this.runEvent();
            }
        }
        eventCouponTip() {
            let giftOpenTimerStr = Laya.LocalStorage.getItem("giftOpenTimer" + Player.inst.gameId);
            let giftOpenTimer;
            if (tsCore.StringUtil.isEmpty(giftOpenTimerStr)) {
                giftOpenTimerStr = "0";
            }
            giftOpenTimer = parseFloat(giftOpenTimerStr);
            if (!tsCore.DateUtils.isSameDay(giftOpenTimer, Laya.Browser.now())) {
                let coupon = Player.inst.getCouponGame(Player.inst.gameId);
                if (coupon.length > 0) {
                    this.activityHandler();
                    Laya.LocalStorage.setItem("giftOpenTimer" + Player.inst.gameId, Laya.Browser.now() + "");
                }
                else {
                    this.runEvent();
                }
            }
            else {
                this.runEvent();
            }
        }
        eventBonusTip() {
            if (Player.inst.jackpotData.length > 0 && this.jackpotBtn) {
                this.jackpotBtn.jackpotBtn.displayObject.event(Laya.Event.CLICK);
            }
            else {
                this.runEvent();
            }
        }
        /** 引导事件执行 */
        eventGuideTip() {
            let value = Laya.LocalStorage.getItem("GameGuide_" + Player.inst.gameId);
            if (!value) {
                let result = this.showGuide();
                if (result) {
                    Laya.LocalStorage.setItem("GameGuide_" + Player.inst.gameId, "true");
                }
                else {
                    this.runEvent();
                }
            }
            else {
                this.runEvent();
            }
        }
        /** 显示引导页 默认不显示引导页 */
        showGuide() {
            const configName = GameConfigKit.gameNameCanonical();
            let obj = Laya.Browser.window[configName];
            if (obj.guide) { // 如果存在引导页配置  默认使用全屏展示
                this.loadFillImage(obj.guide);
                return true;
            }
            return false;
        }
        /**
         * 加载全屏图片
         * @param value
         */
        loadFillImage(value) {
            let urls = value instanceof Array ? value : [value];
            let index = 0;
            this.guideSprite = new fgui.GLoader();
            this.guideSprite.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.guideSprite.fill = fgui.LoaderFillType.ScaleFree;
            this.guideSprite.onClick(this, () => {
                index++;
                if (index >= urls.length) {
                    this.guideSprite.dispose();
                    this.guideSprite = null;
                    this.runEvent();
                }
                else {
                    this.guideSprite.url = urls[index];
                }
            });
            this.guideSprite.url = urls[index];
            fgui.GRoot.inst.addChild(this.guideSprite);
        }
    }
    gameLib.BaseScene = BaseScene;
    class BaseSkeletonWindow extends tsCore.SkeletonWindow {
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
        }
    }
    gameLib.BaseSkeletonWindow = BaseSkeletonWindow;
    class BaseSlotGameData extends BaseGameData {
        constructor() {
            super();
            /** 中奖配置表 按列排序 */
            this.lottery = [
                [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
                [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
                [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
                [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
                [1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0]
            ];
            /** 线数字 */
            this.lineNum = [
                [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
                [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
            ];
            /** 是否快速播放 */
            this._isTurboMode = false;
            /** 当前购买的线 */
            this.lineValue = 0;
            /** 项目总数 */
            this.itemCount = 40;
            /** 玩家的中奖项 */
            this.userWinArray = [];
            /** 小奖 要最少满足3个的线 */
            this.smallPrize = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
            /** 默认线位置 */
            this.defaultLineIndex = 0;
            //     默认游戏 free 变量存储属性
            /** 是否有免费游戏 1 就是免费游戏 */
            this.hasFreeSpin = 0;
            /** 免费游戏剩余次数 */
            this.freeCount = 0;
            /** 当前开出免费游戏的个数 */
            this.freeBoundsCount = 0;
            /**
             * 是否有 reSpin
             */
            this.hasReSpin = 0;
            this.lineValue = this.lottery.length;
            this.gameType = GameType.SLOT;
            const key = Player.inst.gameId + "_isTurboMode";
            this._isTurboMode = Laya.LocalStorage.getItem(key) != null;
        }
        /** 总共要投注的钱 */
        /*@override*/
        getTotalBetMoney() {
            return this.lineValue * this.betValue;
        }
        /** 获取当前的开奖数据 */
        getLotteryId() {
            return this.lotteryId;
        }
        /**
         * 获取指定线的开奖规则模版
         * @param index 线 0开始
         */
        getLottery(index) {
            return this.lottery[index];
        }
        /**
         * 获取每列 list 的值
         * @param index 列
         * @return 返回所拥有的值
         */
        getSlotListArr(index) {
            return null;
        }
        /**
         * 为每列 list 赋新的值
         * @param index 列
         * @param ar 新的值
         */
        setSlotListArr(index, ar) {
        }
        /**
         * 数组长度不够需要 那么添加几个随机值
         * @param arr 数字数组
         * @param min 随机的最小值 默认 1
         * @param max 随机的最大值(不包括) 默认 10
         * @return 符合所有值的数组
         */
        getRandomNumber(arr, min = 1, max = 10) {
            let len = this.itemCount - arr.length;
            for (let i = 0; i < len; i++) {
                arr.push(tsCore.MathKit.random(min, max));
            }
            return arr;
        }
        get isTurboMode() {
            return this._isTurboMode;
        }
        set isTurboMode(value) {
            this._isTurboMode = value;
            const key = Player.inst.gameId + "_isTurboMode";
            if (value) {
                Laya.LocalStorage.setItem(key, "1");
            }
            else {
                Laya.LocalStorage.removeItem(key);
            }
        }
    }
    gameLib.BaseSlotGameData = BaseSlotGameData;
    /**
     * Slot 渲染状态
     */
    let SlotItemType;
    (function (SlotItemType) {
        SlotItemType[SlotItemType["NORMAL"] = 0] = "NORMAL";
        SlotItemType[SlotItemType["DARK"] = 1] = "DARK";
        SlotItemType[SlotItemType["WIN"] = 2] = "WIN";
    })(SlotItemType = gameLib.SlotItemType || (gameLib.SlotItemType = {}));
    /**
     * slot 单独项
     */
    class BaseSlotItem extends tsCore.ELabel {
        constructor() {
            super(...arguments);
            /**
             * 当前项状态
             * @default SlotItemType.NORMAL
             * @protected
             */
            this.state = SlotItemType.NORMAL;
        }
        /** 还原最原始状态 */
        resetUI() {
            this.state = SlotItemType.NORMAL;
        }
        /** 显示中奖 */
        showWin() {
            this.state = SlotItemType.WIN;
        }
        /** 变暗 */
        dark() {
            this.state = SlotItemType.DARK;
        }
        /**
         * 刷新界面
         */
        refresh() {
        }
        /**
         * 变暗取消
         * @deprecated
         */
        darkCancel() {
            this.state = SlotItemType.NORMAL;
        }
    }
    gameLib.BaseSlotItem = BaseSlotItem;
    class BaseSlotView extends BaseView {
        constructor() {
            super(...arguments);
            /** 线数字 */
            this.lineNum = [
                [4, 2, 20, 16, 10, 1, 11, 17, 3, 5],
                [14, 12, 9, 18, 6, 7, 19, 8, 13, 15]
            ];
            /** 当前显示的中奖线 */
            this.showLineIndex = 0;
            /** 线的大小 */
            this.lineSize = 3;
            /** 线颜色 */
            this.lineColor = "#ff0000";
            /** 是否是第一次播放完一次完整的中奖结果 */
            this.isFirstPlayComplete = false;
        }
        /*@override*/
        onInit() {
            var _a, _b;
            super.onInit();
            (_a = this.list) !== null && _a !== void 0 ? _a : (this.list = (_b = this.getChild("list")) === null || _b === void 0 ? void 0 : _b.asList);
            if (this.list)
                this.list.touchable = false;
        }
        /**
         * 绘制指定获胜线
         * @param value 线名字 从 1 开始
         * @param alone 是否单独显示 默认 false
         * @param lowGrade 是否包含下级 默认 false
         */
        showLine(value, alone = false, lowGrade = false) {
            if (!this.lineGraphics)
                return;
            if (alone) {
                this.lineGraphics.clear();
            }
            let gameData = Player.inst.gameData;
            let lottery = gameData.getLottery(value - 1);
            let index = 0;
            let list;
            let items = [];
            for (let k = 0; k < lottery.length; k += this.getSlotModel().rowNum) {
                list = this.getList(index);
                for (let i = 0; i < this.getSlotModel().rowNum; i++) {
                    if (lottery[k + i] == 1) {
                        items.push(list.getChildAt(i));
                        break;
                    }
                }
                index++;
            }
            let isLeft;
            let tempBtnArray;
            if (this.lineNum[0].indexOf(value) != -1) {
                tempBtnArray = this.lineNum[0];
                isLeft = true;
            }
            else if (this.lineNum[1].indexOf(value) != -1) {
                tempBtnArray = this.lineNum[1];
                isLeft = false;
            }
            let paths = [];
            let W;
            let H;
            let point;
            let btn;
            for (let j = 0; j < items.length; j++) {
                W = items[j].width / 2;
                H = items[j].height / 2;
                point = items[j].localToGlobal();
                this.linePanel.globalToLocal(point.x, point.y, point);
                paths.push(point.x + W, point.y + H);
            }
            // 获取按钮位置
            if (tempBtnArray && this.leftLineList && this.rightLineList) {
                index = tempBtnArray.indexOf(value);
                if (index != -1) {
                    if (isLeft) {
                        btn = this.leftLineList.getChildAt(index).asLabel;
                        point = btn.localToGlobal();
                        this.linePanel.globalToLocal(point.x, point.y, point);
                        paths.unshift(point.x + btn.width / 2, point.y + btn.height / 2);
                    }
                    else {
                        btn = this.rightLineList.getChildAt(index).asLabel;
                        point = btn.localToGlobal();
                        this.linePanel.globalToLocal(point.x, point.y, point);
                        paths.push(point.x + btn.width / 2, point.y + btn.height / 2);
                    }
                }
            }
            this.lineGraphics.drawLines(0, 0, paths, this.lineColor, this.lineSize);
        }
        /**
         * 自动播放中奖的项
         * @param isChangeFirst 默认true   第一次播放完所有线 调用一次playFirstComplete()
         * @protected
         */
        showWinning(isChangeFirst = true) {
            if (isChangeFirst)
                this.isFirstPlayComplete = false;
            let gameData = Player.inst.gameData;
            let wins = gameData.userWinArray;
            if (wins.length == 0)
                return;
            let currentLine = wins[this.showLineIndex] + 1;
            // tsCore.Log.debug(wins, currentLine)
            if (gameData.lottery.length < currentLine || this.showLineIndex >= wins.length) {
                this.nextLine();
                return;
            }
            // 全部变暗
            this.allSlotItemDark();
            this.showWinSlotItem(wins[this.showLineIndex]);
            // 显示单条线
            this.showLine(wins[this.showLineIndex] + 1, true);
            Laya.timer.once(1500, this, this.nextLine);
        }
        /**
         * 显示赢的那条线上所有项
         * @param winIndex 赢的线 0开始
         */
        showWinSlotItem(winIndex) {
            let gameData = Player.inst.gameData;
            // 指定的线  显示出来
            let lottery = gameData.getLottery(winIndex);
            let tempItemValue = -1; // 临时值
            let slotItem;
            for (let k = 0; k < lottery.length; k++) {
                let tempValue = lottery[k];
                if (tempValue == 1) {
                    let tempCol = Math.floor(k / this.getSlotModel().rowNum);
                    let tempRow = k % this.getSlotModel().rowNum;
                    slotItem = this.getList(tempCol).getChildAt(tempRow);
                    if (tempItemValue == -1) {
                        if (slotItem.data != this.getSlotModel().WILD) {
                            tempItemValue = slotItem.data; // 没有第一个中奖值 这里初始化设置
                        }
                        slotItem.showWin();
                    }
                    else if (tempItemValue == slotItem.data || slotItem.data == this.getSlotModel().WILD) {
                        slotItem.showWin();
                    }
                    else {
                        break;
                    }
                }
            }
        }
        /**
         * 显示某列中奖
         * @param colIndex
         * @param dataArr
         */
        showColumnWin(colIndex, dataArr) {
            let foot;
            let list = this.getList(colIndex);
            for (let j = 0; j < dataArr.length; j++) {
                if (dataArr[j] == 1) {
                    foot = list.getChildAt(j);
                    foot.showWin();
                }
            }
        }
        nextLine() {
            let gameData = Player.inst.gameData;
            this.showLineIndex++;
            if (this.showLineIndex >= gameData.userWinArray.length) {
                if (!this.isFirstPlayComplete) { // 如果还没有第一次完成过  调用
                    this.playFirstComplete();
                }
                this.isFirstPlayComplete = true;
                this.showLineIndex = 0;
            }
            this.showWinning(false);
        }
        /** 所有中奖项 第一次播放完成调用  需要设置 showWinning(true) */
        playFirstComplete() {
        }
        /**
         * 初始化 list 列表
         * @param index list 列表位置
         * @param child list 对象
         */
        initListHandler(index, child) {
            child.setVirtualAndLoop();
            child.itemRenderer = new Laya.Handler(this, this.listItemHandler);
            // -1 表示不更改名字
            if (index != -1)
                child.name = "list" + index;
        }
        /**
         * 渲染列表
         * @param index 位置
         * @param item 项
         */
        listItemHandler(index, item) {
        }
        /**
         * 单独显示指定位置的项
         * @param col 列
         * @param index 位置
         */
        showItem(col, ...index) {
            this.allSlotItemDark();
            let list = this.getList(col);
            for (let i = 0; i < index.length; i++) {
                list.getChildAt(index[i]).showWin();
            }
        }
        /***
         * 单独显示指定id的项
         * @param id 中奖的id
         */
        showDataItem(id) {
            this.allSlotItemDark();
            for (let i = 0; i < this.list.numChildren; i++) {
                let list = this.getList(i);
                for (let j = 0; j < list.numChildren; j++) {
                    let item = list.getChildAt(j);
                    if (item.data == id) {
                        item.showWin();
                    }
                }
            }
        }
        /** 获取单个滚动列表 */
        getList(value) {
            if (this.getSlotModel().getRollLists().length > value) {
                return this.getSlotModel().getRollList(value);
            }
            if (this.list && this.list.numChildren > value) {
                let obj = this.list.getChildAt(value);
                if (obj instanceof fgui.GList)
                    return obj;
                obj = obj.asCom.getChild("n0");
                if (obj instanceof fgui.GList)
                    return obj;
                obj = obj.asCom.getChild("list");
                if (obj instanceof fgui.GList)
                    return obj;
            }
            return null;
        }
        /** 所有的项变暗 */
        allSlotItemDark() {
            let len = this.getSlotModel().colNum;
            for (let i = 0; i < len; i++) {
                let list = this.getSlotModel().getRollList(i);
                if (list) {
                    for (let j = 0; j < list.numChildren; j++) {
                        let item = list.getChildAt(j);
                        item.dark();
                    }
                }
            }
        }
        getSlotModel() {
            return SceneManager.inst.starter.gameModel;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
        }
    }
    gameLib.BaseSlotView = BaseSlotView;
    class BaseStarter extends tsCore.EProxy {
        constructor() {
            super();
            this.regGameAction(ActionLib.GAME_CREATE_SCENE_SHOW, this, this.createSceneShow);
        }
        /**
         * 创建游戏到舞台
         * @param handler 创建完成回调
         */
        createSceneShow(handler) {
            this.callback = handler;
            this.updateScreenOrientation();
        }
        /** 当前游戏的方向 */
        updateScreenOrientation() {
        }
        /** 创建并显示一个舞台 */
        createShowScene(url, cls) {
            // 部分手机太垃圾了  需要延迟点
            Laya.timer.callLater(this, () => {
                this.baseScene = fgui.UIPackage.createObjectFromURL(url, cls);
                fgui.GRoot.inst.addChild(this.baseScene);
                runFun(this.callback);
            });
            //        Laya.timer.once(2000, this, function() {
            //            sendAction(Action.GAME_SHOW_ROOM_NOTICE, {message: "Congratulations Lucy Mbugua for winning " + Player.inst.getCurrencyUnit() + "2880"})
            //        })
        }
    }
    gameLib.BaseStarter = BaseStarter;
    class BaseWindow extends tsCore.EWindow {
        constructor() {
            super(...arguments);
            /**
             * 是否在关闭窗口的时候  发送 ActionLib.GAME_RUN_SCENE_EVENT
             * @default false
             */
            this.isRunSceneEvent = false;
        }
        /*@override*/
        closeEventHandler() {
            if (this.parent) {
                if (this.joinRecord) {
                    AppRecordManager.backHistory();
                }
                else {
                    this.hideRecord();
                }
            }
        }
        /*@override*/
        onHide() {
            if (this.isRunSceneEvent)
                this.sendAction(ActionLib.GAME_RUN_SCENE_EVENT);
            super.onHide();
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
        }
    }
    gameLib.BaseWindow = BaseWindow;
    /**
     *
     * @author boge
     *
     */
    class GameModel extends tsCore.EProxy {
        constructor() {
            super();
            /** 当前屏幕方向 */
            this.gameScreenType = Laya.Stage.SCREEN_VERTICAL;
            /** 任务 */
            this.tasks = [];
            this.regGameAction(ActionLib.GAME_CLEAR_RES, this, this.clearRes);
            this.regGameAction(ActionLib.GAME_INSERT_EXTENSION, this, this.insertExtension);
            this.regGameAction(ActionLib.GAME_INIT_SOCKET_EVENT, this, this.initSocketEvent);
            this.regGameAction(ActionLib.GAME_INIT_MODEL, this, this.initModel);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
            this.regGameAction(ActionLib.GAME_LOTTERY_ANI_COMPLETE, this, this.lotteryComplete);
        }
        initModel() {
            this.setupMusic();
        }
        initSocketEvent() {
            this.addSocketEvent(Cmd.SOCKET_MONEY_CHANGE, this.moneyChange.bind(this));
            this.addSocketEvent(Cmd.SOCKET_GOLD_CHANGE, this.moneyChange.bind(this));
            this.addSocketEvent(Cmd.SOCKET_TOP_UP_CHANGE, this.moneyChange.bind(this));
            // this.addSocketEvent(Cmd.SOCKET_NOTIFICATION, this.notificationHandler.bind(this))
            this.addSocketEvent(Cmd.SOCKET_SHOW_NOTICE, this.showNotice.bind(this));
        }
        showNotice(obj) {
            let notice = this.getView(NoticeView);
            if (notice)
                notice.showText(obj.data);
        }
        /** 通知资金变化 */
        moneyChange(obj) {
            //        if (homeModel) homeModel.moneyChange(obj)
            if (Player.inst.isGuest)
                return; // 如果是游客  那就不调用资金更新
            if (obj && obj.balance) {
                switch (obj.type) {
                    case Cmd.SOCKET_MONEY_CHANGE:
                        // Player.inst.setMoney(obj.balance)
                        // this.sendAction(Action.GAME_UPDATE_MONEY)
                        break;
                    case Cmd.SOCKET_GOLD_CHANGE:
                        // Player.inst.setMoney(obj.balance, 1)
                        break;
                    case Cmd.SOCKET_TOP_UP_CHANGE:
                        Player.inst.money = obj.balance;
                        this.sendAction(ActionLib.GAME_UPDATE_MONEY);
                        this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, [1018 /* LibStr.RECHARGE_SUCCESS */,
                            Player.inst.getCurrencyUnit() + " " + obj.amount]);
                        break;
                    default:
                        break;
                }
            }
        }
        /** 通知信息 */
        notificationHandler(obj) {
            obj = obj.message;
            // obj.title, obj.text, obj.ticker, obj.subText, obj.open
            if (Player.inst.isWeb) {
                function show() {
                    let notification = new Notification(obj.title, { body: obj.text, icon: "favicon.ico" });
                }
                function regP() {
                    Notification.requestPermission(function (status) {
                        if (Notification.permission !== status) {
                            // Notification.permission = status
                            if (Notification.permission === "granted") {
                                show();
                            }
                        }
                    }).then(r => {
                    });
                }
                if (Notification) {
                    if (Notification.permission === "granted") {
                        show();
                    }
                    else {
                        regP();
                    }
                }
                //			__JS__("notification.onclick = function(){notification.close()}")
            }
            else {
                AppManager.sendNotification(obj);
            }
        }
        /**
         * 计划任务
         * @param args 参数
         * @param handler
         */
        addTask(args, handler) {
            this.tasks.push({ args: args, handler: handler });
        }
        /**
         * 执行一次预计划任务
         */
        runTask() {
            if (this.tasks.length > 0) {
                for (let i = 0; i < this.tasks.length; i++) {
                    let task = this.tasks.shift();
                    runFun(task.handler, task.args);
                }
            }
        }
        /**
         * 注册socket 事件
         * @param type
         * @param callback
         */
        addSocketEvent(type, callback) {
            SocketManager.inst.addSocketEvent(type, callback);
        }
        removeSocketEvent(type) {
            SocketManager.inst.removeSocketEvent(type);
        }
        clearRes() {
            let configName = GameConfigKit.gameNameCanonical();
            if (tsCore.StringUtil.isEmpty(configName))
                return;
            let loadObj = GameConfigKit.gameRes(configName);
            if (loadObj) {
                let fuiName;
                let res = loadObj.res;
                for (let k = 0; k < res.length; k++) {
                    fuiName = res[k].url;
                    if (fuiName.indexOf(fgui.UIConfig.packageFileExtension) != -1) {
                        fuiName = tsCore.StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension);
                        break;
                    }
                }
                let pack = fgui.UIPackage.getByName(fuiName);
                if (pack)
                    fgui.UIPackage.removePackage(pack.id);
                AssetsLoader.checkBranch(res);
                LoaderConfig.clear(res);
                tsCore.Log.debug("GameModel.clearRes() " + fuiName + " uninstall");
            }
        }
        /** 设置游戏音乐 */
        setupMusic() {
        }
        /** 还原游戏音乐 */
        resetMusic() {
            if (this.musicBack) {
                Laya.SoundManager.soundMuted = this.musicBack.soundMuted;
                Laya.SoundManager.musicMuted = this.musicBack.musicMuted;
            }
        }
        /** 子类实现 */
        insertExtension() {
        }
        /** 通知开奖结束  进入结束流程 */
        lotteryComplete() {
        }
        /** 游戏进入后台执行 */
        blurGame() {
            tsCore.Log.debug("blurGame");
        }
        /** 游戏进入前台执行 */
        focusGame() {
            tsCore.Log.debug("focusGame");
        }
        get gameScene() {
            var _a;
            (_a = this._gameScene) !== null && _a !== void 0 ? _a : (this._gameScene = SceneManager.inst.starter.baseScene);
            return this._gameScene;
        }
        get gameServlet() {
            var _a;
            (_a = this._gameServlet) !== null && _a !== void 0 ? _a : (this._gameServlet = SceneManager.inst.starter.gameServlet);
            return this._gameServlet;
        }
        /*@override*/
        dispose() {
            super.dispose();
            this.resetMusic();
        }
        set gameCode(value) {
            this._gameCode = value;
        }
        get gameCode() {
            return this._gameCode;
        }
        socketHandler(obj) {
        }
        get homeModel() {
            return this._homeModel;
        }
        set gameScene(value) {
            this._gameScene = value;
        }
        set gameServlet(value) {
            this._gameServlet = value;
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
        }
    }
    gameLib.GameModel = GameModel;
    /**
     * 游戏基础类
     * @author boge
     */
    class GameServlet extends tsCore.EProxy {
        constructor() {
            super();
            this.regGameAction(ActionLib.GAME_CHECK_STATE, this, this.checkState);
            this.regGameAction(ActionLib.GAME_INIT_SERVLET, this, this.init);
            this.regGameAction(ActionLib.GAME_CONNECT_SOCKET, this, this.connectSocket);
            this.regGameAction(ActionLib.GAME_DISPOSE, this, this.dispose);
        }
        get gameData() {
            return Player.inst.gameData;
        }
        /**
         * @deprecated
         */
        set gameData(value) {
            tsCore.Log.debug(value);
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
        getURL(url, data, callback, error, timeout) {
            this.getData(url, data, callback, error, timeout);
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
        getData(url, data, callback, error, timeout, overtime = 0) {
            tsCore.HTTPUtils.create()
                .setUrl(Player.inst.data.getGameUrl(url))
                .setData(data)
                .setOvertime(overtime)
                .onComplete((data) => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(callback, data);
            })
                .onError((data) => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(error, data);
            })
                .onTimeout(() => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (timeout)
                        runFun(timeout);
                    else if (error)
                        runFun(error);
                }
            }).call();
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
        post(url, data, callback, error, timeout, headers, overtime = 0) {
            this.postData(url, data, callback, error, timeout, headers, overtime);
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
        postData(url, data, callback, error, timeout, headers, overtime = 0) {
            tsCore.HTTPUtils.create()
                .setMethod(tsCore.Method.POST)
                .setUrl(Player.inst.data.getGameUrl(url))
                .setData(data)
                .setOvertime(overtime)
                .setHeaders(headers)
                .onComplete((data) => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (Player.inst.isGuest && (data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                        Player.inst.guestModel.playAdd(url, data.data);
                    }
                    if (!data)
                        runFun(error, "data is null");
                    else
                        runFun(callback, data);
                }
            })
                .onError((data) => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode))
                    runFun(error, data);
            })
                .onTimeout(() => {
                var _a;
                if (Player.inst.gameId == ((_a = this.gameModel) === null || _a === void 0 ? void 0 : _a.gameCode)) {
                    if (timeout)
                        runFun(timeout);
                    else if (error)
                        runFun(error);
                }
            }).call();
        }
        /**
         *
         * @param handler
         */
        checkState(handler) {
            // if (Player.inst.isGuest) {
            runFun(handler);
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
        enterFail(isTip = true, message) {
            Player.inst.gameId = CommonCmd.GAME_HOME;
            fgui.GRoot.inst.closeModalWait();
            LoadingWindow.inst.hide();
            JSUtils.alert(message ? message : getString(1002 /* LibStr.GAME_OFF */));
            JSUtils.gameClose();
            if (isTip)
                tsCore.MessageTip.showTip(message ? message : 1002 /* LibStr.GAME_OFF */);
            this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
        }
        init(handler) {
            this.initHandler = handler;
            if (Player.inst.isGuest) {
                Player.inst.status = 1;
                // 初始化完成
                runFun(handler);
                return;
            }
            let obj = {};
            obj.token = Player.inst.token;
            obj.game_id = Player.inst.gameId;
            obj.is_gift = Player.inst.urlParam.isGift;
            this.postData("/game/" + this.networkName + "/init", obj, this.userDataHandler.bind(this), this.userDataErrorHandler.bind(this));
        }
        /** 连接该游戏的socket */
        connectSocket() {
            // 链接服务器socket
            SocketManager.inst.connect(Player.inst.gameId, Player.inst.token, Player.inst.userId);
        }
        userDataErrorHandler(data) {
            this.enterFail(true, getString(1005 /* LibStr.NET_ERROR */));
        }
        /** 用户数据 */
        userDataHandler(data) {
            //			trace("MainPanel.userDataHandlerr(data) 服务器拿到游戏房间数据")
            if (data.code != HttpCode.OK) {
                this.enterFail(true, StateCode.getShowMessage(data));
                return;
            }
            data = data.data;
            this.gameStatus = data.game_status;
            this.parseInitData(data);
            Player.inst.status = data.status ? data.status : 1; //1=>投注中，2=>计算中，3=>开奖
            Player.inst.data.lotteryTime = data.lottery_time; //开奖时间戳(s)
            let period = data.period; //当前期数
            Player.inst.data.initRoomTotalItem = data.bet_total_item; //当前房间总投注金额
            Player.inst.data.initRoomCurBet = data.cur_bet_total; //当前房间自己投注金额
            Player.inst.data.betHistory = data.bet_history; //当前房间历史记录
            Player.inst.data.betStatic = data.bet_statis; //当前历史次数
            Player.inst.data.initPeriod = data.last_period;
            // 奖金池数据
            this.readJackpotData(data);
            // 单机游戏进入   处理
            if (SceneManager.inst.isAloneGame()) {
                period = 1;
                Player.inst.data.jackpot = data.jackpot;
            }
            Player.inst.data.period = period;
            if (this.gameStatus == 1 && period > 0) {
                this.getCoupon();
            }
            else {
                this.enterFail();
            }
        }
        /**
         * 读取奖金池数据
         * @param data
         */
        readJackpotData(data) {
            if (data.user_really_bet || data.user_really_bet == 0)
                Player.inst.userReallyBet = data.user_really_bet;
            if (data.get_ticket_inc_bet)
                Player.inst.getTicketIncBet = data.get_ticket_inc_bet;
            if (data.game_pool || data.game_pool == 0)
                Player.inst.gamePool = tsCore.MathKit.toFixed(data.game_pool);
            if (data.scratcher_tickets)
                Player.inst.jackpotData = data.scratcher_tickets;
            this.sendAction(ActionLib.GAME_UPDATE_JACKPOT_POOL);
        }
        /** 获取投注劵 */
        getCoupon() {
            this.getData(Urls.URL_GAME_ALL_COUPON + "?" + Player.inst.getRequestToken(), null, this.couponHandler.bind(this), this.userDataErrorHandler.bind(this));
        }
        /** 收到投注劵数据 */
        couponHandler(data) {
            if (data.code != HttpCode.OK) {
                this.enterFail(true, StateCode.getShowMessage(data));
                return;
            }
            Player.inst.addCoupons(data.data);
            this.initComplete();
        }
        initComplete() {
            runFun(this.initHandler);
        }
        /**
         * 拉取账户金额
         * @param callback
         * @param error
         */
        getUserMoney(callback, error) {
            let obj = { token: Player.inst.token };
            tsCore.HTTPUtils.create()
                .setMethod("post")
                .setUrl(Player.inst.data.getWapUrl(Urls.URL_USER_ACCOUNT_ASSET))
                .setData(obj)
                .onComplete((data) => {
                if ((data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                    runFun(callback, data);
                }
                else {
                    runFun(error, "data is null");
                }
            }).onError(error).call();
        }
        /**
         * 检查游戏期数
         * @param handler
         *
         */
        checkGamePeriod(handler) {
            runFun(handler, true);
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
            //     tsCore.Log.info("GameServlet.checkStateHandler(data)gameStatus=" + this.gameStatus + ", period=" + period + ", " + Player.inst.data.period)
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
        sendBet(url, data, callback) {
            this.postData(url, data, (data) => {
                if (data.code != HttpCode.OK) {
                    tsCore.MessageTip.showTip(StateCode.getShowMessage(data));
                    this.sendAction(ActionLib.GAME_RESET_BET);
                }
                else {
                    Player.inst.gameData.playCount++;
                    Player.inst.playCount++;
                    if (Player.inst.isGuest)
                        Player.inst.guestModel.guestPlayCount++;
                }
                runFun(callback, data);
            }, () => {
                WaitResult.inst.hide();
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1005 /* LibStr.NET_ERROR */, null, () => {
                    // this.sendAction(ActionLib.GAME_RESET_BET)
                    SceneManager.inst.gameErrorExit();
                });
            });
        }
        /**
         * 领取奖金池
         * @param id
         * @param handler
         */
        jackPotClaim(id, handler) {
            let obj = {};
            obj.token = Player.inst.token;
            obj.game_id = Player.inst.gameId;
            obj.id = id;
            this.postData(Urls.URL_GAME_SCRATCHER_LOTTERY, obj, Laya.Handler.create(this, this.jackPotClaimHandler, [handler]), () => {
                runFun(handler, false);
            });
        }
        jackPotClaimHandler(handler, data) {
            if (data.code != HttpCode.OK) {
                WaitResult.inst.hide();
                // this.showNotResult(data, false)
                StateCode.execute(data.code, data);
                return;
            }
            data = data.data;
            let balance = data.balance; //余额
            let win = data.win; //赢的钱
            this.readJackpotData(data);
            Player.inst.money = balance;
            runFun(handler, true, win);
        }
        /**
         * 显示获取的非200的结果显示弹窗
         * @param data 服务器返回的完整数据
         * @param [closeGame=true] 是否关闭游戏
         */
        showNotResult(data, closeGame = true) {
            let str = StateCode.getShowMessage(data);
            if (tsCore.StringUtil.isEmpty(str)) {
                str = getString(1005 /* LibStr.NET_ERROR */);
            }
            if (closeGame) {
                JSUtils.alert(str);
                JSUtils.gameClose();
            }
            else {
                this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, str);
            }
        }
        get gameModel() {
            var _a;
            (_a = this._gameModel) !== null && _a !== void 0 ? _a : (this._gameModel = SceneManager.inst.starter.gameModel);
            return this._gameModel;
        }
        set gameModel(value) {
            this._gameModel = value;
        }
        /*@override*/
        dispose() {
            super.dispose();
        }
    }
    gameLib.GameServlet = GameServlet;
    /**
     * 需要加载资源的组件
     * @author boge
     *
     */
    class LoadComponent extends BaseView {
        constructor() {
            super();
            /** 是否已经初始化 */
            this.isInit = true;
            this.on(Laya.Event.ADDED, this, this.addedHandler);
        }
        /*@override*/
        addedHandler() {
            if (!this.isInit) {
                fgui.GRoot.inst.showModalWait(getString(1001 /* LibStr.LOADING */));
                tsCore.ELoader.loader.load(this.loadArray, Laya.Handler.create(this, this.resLoaderComplete), Laya.Handler.create(this, this.progressHandler));
            }
            else {
                this.onShow();
            }
        }
        progressHandler(data) {
            fgui.GRoot.inst.showModalWait(getString(1001 /* LibStr.LOADING */) + " " + Math.floor(data * 100) + "%");
        }
        loadErrorHandler() {
            tsCore.ELoader.loader.clearUnLoaded();
            fgui.GRoot.inst.closeModalWait();
        }
        resLoaderComplete(success) {
            if (!success) {
                this.loadErrorHandler();
                return;
            }
            this.onInit();
            fgui.GRoot.inst.closeModalWait();
            this.onShow();
        }
        set contentPane(value) {
            this._contentPane = value;
            if (this._contentPane) {
                this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
                this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
                this._contentPane.addRelation(this, fgui.RelationType.Size);
                this._contentPane.setSize(this.width, this.height);
                this.addChild(this._contentPane);
            }
        }
        get contentPane() {
            return this._contentPane;
        }
        onShow() {
        }
        addSources(array) {
            this.loadArray = array;
            this.isInit = false;
        }
    }
    gameLib.LoadComponent = LoadComponent;
    class SlotModel extends GameModel {
        constructor() {
            super();
            /** 运动 list 数组列表 */
            this.listRolls = [];
            /** 开奖数据  {arr isTurboMode itemCount} */
            this.lotteryData = [];
            /** 是否是向上滚动的 一般开始的位置都是顶部 */
            this.isScrollUp = false;
            /** 特殊玩法  */
            this.SPECIAL_PLAY = 13;
            /** 可以替换任何东西的 */
            this.WILD = 12;
            /** 满足2个就可以连上的线否则至少3个才可以连线,存放图片id */
            this.smallPrize = [];
            /** 滚动列表展示行数 默认3行 */
            this.rowNum = 3;
            /** 滚动列表展示列数 默认5列 */
            this.colNum = 5;
            /**
             * 全部滚动结束延迟时间
             * @protected
             */
            this.allEndDelay = 500;
            this.tweenList = [];
        }
        /**
         * 添加 list 滚动对象
         * @param list 滚动的 list
         */
        addRollList(list) {
            this.listRolls.push(list);
        }
        /** 获取列表数组 */
        getRollLists() {
            return this.listRolls;
        }
        /** 获取指定位置的列表 */
        getRollList(index) {
            return this.listRolls[index];
        }
        /**
         * 播放开奖
         */
        playLottery(value) {
            this.tweenList.splice(0, this.tweenList.length);
            this.lotteryData = value;
            this.completeCount = 0;
        }
        /** 立即停止开奖动画 */
        stopTween() {
            if (this.tweenList.length == 0) {
                this.rollComplete();
                return;
            }
            // 使用这种方法 可以防止completeHandler 中的判断出错
            for (let i = 0; i < this.tweenList.length; i++) {
                this.tweenList[i].complete();
            }
            this.tweenList.splice(0, this.tweenList.length);
        }
        /**
         * 当前滚动列数据处理完毕调用
         * @param index 滚动的列
         * @param lotteryData 当前滚动列数据
         */
        onScrollTween(index, lotteryData) { }
        /** 开始播放结果动画 */
        startPlayResultTween() { }
        /**
         * 获取滚动圈数 默认4圈
         * @param index list 所在列
         */
        getLaps(index) {
            return 4;
        }
        /**
         * 设置即将播放的数据值
         * @param index listRolls 循环的下标
         */
        setRenderListData(index) {
        }
        /** 开始开奖逻辑处理 */
        onLogicLotteryStart() {
        }
        /** 结束开奖逻辑处理 */
        onLogicLotteryEnd() {
        }
        /**
         * 获取list单独一块的高度
         * @param list
         * @protected
         */
        getItemHeight(list) {
            return list.getChildAt(0).height;
        }
        /**
         * 判断此列表是否需要滚动
         * @param list 列表
         * @param index 位置
         * @return true 继续滚动  false 停止滚动
         */
        isRunList(list, index) {
            return true;
        }
        /** 滚动结束一次调用方法 */
        oneComplete(list) { }
        /**
         * 全部滚动结束调用方法，当 allEndDelay 参数大于0时 会延迟执行
         * @protected
         */
        rollComplete() { }
        /**
         * 判断当前开的奖里面是否有中奖线
         * @param lotteryId 服务器返回的开奖项
         * @param arr 当前对比的开奖项
         */
        compare(lotteryId, arr) {
            return this.getExistValue(lotteryId, arr) != null;
        }
        /**
         * 获取中奖类型开奖的值
         * @param lotteryId 开奖数组
         * @param lottery 判断中奖类型数组
         */
        getExistValue(lotteryId, lottery) {
            if (lotteryId.length == lottery.length) {
                let tempArray = [];
                for (let i = 0; i < lottery.length; i++) {
                    if (lottery[i] == 1) { // 判断标签
                        tempArray.push(lotteryId[i]); // 中奖的线ID
                    }
                }
                let col = this.listRolls.length;
                // 开始验证   是否一样
                let duibi = tempArray[0];
                for (let i = 1; i < col; i++) { // 这里最大判断列表数  满足 就中奖
                    let temp = tempArray[i];
                    if (duibi >= this.WILD) {
                        duibi = temp; // 如果正在对比的值大于wild，一律按照wild处理
                    }
                    else if (temp < this.WILD && temp != duibi) {
                        return null; //小于wild 并且和对比值不一样
                    }
                    if (i == 1) { // 2个一样  且不再小奖里面
                        if (duibi < this.WILD && duibi != this.SPECIAL_PLAY && this.smallPrize.indexOf(duibi) != -1) {
                            return tempArray;
                        }
                    }
                    else if (i >= 2) {
                        if (duibi < this.WILD && duibi != this.SPECIAL_PLAY) {
                            return tempArray;
                        }
                    }
                }
            }
            return null;
        }
        /**
         * 获取总长度函数
         * @param item 单个格子高度
         * @param count 转盘拆分份数
         * @param Qmin 最少圈数
         * @param Qmax 最多圈数
         * @param location 奖品所在奖区
         * @deprecated
         * @see MathKit.scrollLong()
         */
        getRotationLong(item, count, Qmin, Qmax, location) {
            let totalLong = item * count;
            let _q = totalLong * (Math.floor(Math.random() * (Qmax - Qmin)) + Qmin); //整圈长度
            let _location = (totalLong / count) * location; //目标奖区的起始点
            return _q + _location;
        }
        /**
         * list使用的数据转换 切换成列的数据
         * @param arr 通用的数据
         * @return
         */
        changeListData(arr) {
            let temps = [];
            let col = this.listRolls.length;
            for (let i = 0; i < col; i++) {
                for (let j = 0; j < arr.length; j++) {
                    let va = arr[j];
                    if (j % col == i) {
                        temps.push(va);
                    }
                }
            }
            return temps;
        }
        /**
         * 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
         * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
         * @param    b 指定动画属性的初始值。
         * @param    c 指定动画属性的更改总计。
         * @param    d 指定运动的持续时间。
         * @param    s 指定过冲量，此处数值越大，过冲越大。
         * @return 指定时间的插补属性的值。
         */
        backInOut(t, b, c, d, s = 0.50158) {
            if ((t /= d * 0.5) < 1)
                return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
        /**
         * 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
         * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
         * @param    b 指定动画属性的初始值。
         * @param    c 指定动画属性的更改总计。
         * @param    d 指定运动的持续时间。
         * @param    s 指定过冲量，此处数值越大，过冲越大。
         * @return 指定时间的插补属性的值。
         */
        backOut(t, b, c, d, s = 0.50158) {
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }
        /**
         * 根据服务器发送的位置坐标 获取 list 行
         * @param index
         */
        getServerIndexRow(index) {
            return Math.floor(index / this.colNum);
        }
        /**
         * 根据服务器发送的位置坐标 获取 list 列
         * @param index
         */
        getServerIndexCol(index) {
            return index % this.colNum;
        }
        /*@override*/
        dispose() {
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            super.dispose();
        }
    }
    gameLib.SlotModel = SlotModel;
    let SlotRunState;
    (function (SlotRunState) {
        SlotRunState[SlotRunState["START"] = 1] = "START";
        SlotRunState[SlotRunState["END"] = 2] = "END";
    })(SlotRunState = gameLib.SlotRunState || (gameLib.SlotRunState = {}));
    /**
     * slot游戏滚动效果类 使用了 FrameLoop + Laya.Tween
     */
    class SlotScrollModel extends SlotModel {
        constructor() {
            super(...arguments);
            /** 当前滚动圈数 */
            this.rollCount = 0;
            /** 滚动到最大圈数  就可以播放开奖结果了 */
            this.rollMaxCount = 100;
            /** 是否已经开始播放结束动画 */
            this.isPlayEndTween = false;
            /** 结束动画数据 */
            this.scrollData = [];
            /** 当前滚动的单列位置 */
            this.singleColumnIndex = -1;
        }
        /**
         * 开始滚动指定列
         * @param index
         */
        onStartRoll(index) {
            this.singleColumnIndex = index;
            this.rollCount = 0;
            this.rollMaxCount = 50;
            Laya.timer.frameLoop(1, this, this.frameLoopSingleColumnHandler);
        }
        frameLoopSingleColumnHandler() {
            if (this.isPlayEndTween)
                return; // 播放结束动画  停止后面的操作
            let list;
            // 滚动数据
            list = this.listRolls[this.singleColumnIndex];
            if (this.isScrollUp) {
                // if (this.isPlayEndTween)
                list.scrollPane.posY += 50;
            }
            else {
                list.scrollPane.posY -= 50;
            }
            this.rollCount++;
            let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode;
            let tempRollMax = this.rollMaxCount;
            if (tempTurbo) {
                tempRollMax = 20;
            }
            if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) { // 满足最大圈数还得  并且获得了开奖数据
                this.onLogicLotteryStart();
                this.isPlayEndTween = true;
                this.tweenList.splice(0, this.tweenList.length);
                let itemHeight;
                list = this.listRolls[this.singleColumnIndex];
                list.data = this.lotteryData[0].arr;
                list.numItems = list.data.length;
                let duration = this.getDuration(0, this.lotteryData[0].isTurboMode);
                // 将列表 设置到最下边
                itemHeight = this.getItemHeight(list);
                let end = itemHeight * this.rowNum; // 默认是向下滚动的值
                if (this.isScrollUp) {
                    list.scrollPane.posY = end;
                    end = itemHeight * this.lotteryData[0].itemCount + end;
                }
                else {
                    list.scrollPane.posY = itemHeight * this.lotteryData[0].itemCount;
                }
                // 开始播放缓动动画
                let tween = Laya.Tween.to(list.scrollPane, { posY: end }, duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.completeHandler, [list]));
                this.tweenList.push(tween);
                this.scrollData.push({ id: this.singleColumnIndex, data: end });
                // 防止tween 没有及时跟上  延迟100ms 在清理
                // Laya.timer.once(400, this, this.clearCall)
                this.clearCall();
                this.onLogicLotteryEnd();
            }
        }
        /**
         * 开始转动所有滚动序列
         */
        onStartRollSlot() {
            this.rollCount = 0;
            this.rollMaxCount = 100;
            Laya.timer.frameLoop(1, this, this.frameLoopHandler);
        }
        /** 停止自动滚动 */
        stopRollSlot() {
            Laya.timer.clearAll(this);
        }
        frameLoopHandler() {
            if (this.isPlayEndTween)
                return; // 播放结束动画  停止后面的操作
            let list;
            // 滚动数据
            let listData = this.scrollData[this.completeCount];
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                if (!this.isRunList(list, i))
                    continue;
                if (list["runState"] != SlotRunState.START) {
                    list["runState"] = SlotRunState.START;
                    this.runStateChange(SlotRunState.START, list);
                }
                if (this.isScrollUp) {
                    // if (this.isPlayEndTween)
                    list.scrollPane.posY += 50;
                }
                else {
                    list.scrollPane.posY -= 50;
                }
                // if (this.isPlayEndTween && listData.id == i) {
                //     // 进入开奖流程 并且当前在播放的是要停止的滚动列表
                //     if (listData.data + 50 >= list.scrollPane.posY && list.scrollPane.posY >= listData.data - 50) {
                //         list.scrollPane.posY = listData.data
                //         this.completeHandler(list)
                //     }
                // }
            }
            this.rollCount++;
            let tempTurbo = this.lotteryData.length > 0 && this.lotteryData[0].isTurboMode;
            let tempRollMax = this.rollMaxCount;
            if (tempTurbo) {
                tempRollMax = 20;
            }
            if (this.rollCount >= tempRollMax && this.lotteryData.length > 0) { // 满足最大圈数还得  并且获得了开奖数据
                this.isPlayEndTween = true;
                Laya.timer.callLater(this, this.callRunTween);
            }
        }
        /**
         * 运行状态变动
         * @param state 滚动状态
         * @param list 组件
         * @protected
         */
        runStateChange(state, list) {
        }
        callRunTween() {
            this.onLogicLotteryStart();
            this.tweenList.splice(0, this.tweenList.length);
            let itemHeight;
            let list;
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                this.setRenderListData(i);
                if (!this.isRunList(list, i))
                    continue;
                this.createTween(i, list);
            }
            // 防止tween 没有及时跟上  延迟100ms 在清理
            Laya.timer.once(400, this, this.clearCall);
            this.onLogicLotteryEnd();
        }
        /**
         * 创建list滚动动画
         * @param index list位置
         * @param list list对象
         * @protected
         */
        createTween(index, list) {
            let duration = this.getDuration(index, this.lotteryData[index].isTurboMode);
            // 将列表 设置到最下边
            let itemHeight = this.getItemHeight(list);
            let end = itemHeight * this.rowNum; // 默认是向下滚动的值
            if (this.isScrollUp) {
                list.scrollPane.posY = end;
                end = itemHeight * this.lotteryData[index].itemCount + end;
            }
            else {
                list.scrollPane.posY = itemHeight * this.lotteryData[index].itemCount;
            }
            this.onScrollTween(index, this.lotteryData[index]);
            // 开始播放缓动动画
            let tween = Laya.Tween.to(list.scrollPane, { posY: end }, duration, Laya.Ease.linearNone, Laya.Handler.create(this, this.completeHandler, [list]));
            this.tweenList.push(tween);
            this.scrollData.push({ id: index, data: end });
        }
        /** 延迟执行 */
        clearCall() {
            this.stopRollSlot();
            this.startPlayResultTween();
        }
        /*@override*/
        setRenderListData(index) {
            let list = this.listRolls[index];
            list.data = this.lotteryData[index].arr;
            list.numItems = list.data.length;
        }
        getDuration(index, isTurboMode) {
            let duration = 500 + (index * 800); // 动画持续时间
            if (isTurboMode) {
                duration = 1300; // 动画持续时间
            }
            return duration;
        }
        getDelay(index, isTurboMode) {
            return 0;
        }
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        completeHandler(list) {
            this.completeCount++;
            //        Log.debug("a" + this.completeCount + "  " + Browser.now())
            if (list["runState"] != SlotRunState.END) {
                list["runState"] = SlotRunState.END;
                this.runStateChange(SlotRunState.END, list);
            }
            // 如果需要完成一次回调
            this.oneComplete(list);
            if (this.completeCount < this.tweenList.length) {
                return;
            }
            this.lotteryData.splice(0, this.lotteryData.length);
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            this.singleColumnIndex = -1;
            this.isPlayEndTween = false;
            if (this.allEndDelay) {
                Laya.timer.once(this.allEndDelay, this, this.rollComplete);
            }
            else
                this.rollComplete();
        }
        /*@override*/
        stopTween() {
            this.stopRollSlot();
            super.stopTween();
            this.isPlayEndTween = false;
        }
        /*@override*/
        dispose() {
            this.stopRollSlot();
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    gameLib.SlotScrollModel = SlotScrollModel;
    /**
     * slot游戏滚动效果类 只使用了 Laya.Tween
     */
    class SlotScrollTweenModel extends SlotModel {
        /*@override*/
        playLottery(value) {
            super.playLottery(value);
            let list;
            let itemHeight;
            let total;
            let delay;
            let tween;
            for (let i = 0; i < this.listRolls.length; i++) {
                list = this.listRolls[i];
                this.setRenderListData(i);
                itemHeight = this.getItemHeight(list);
                let duration = this.getDuration(i, this.lotteryData[i].isTurboMode);
                delay = this.getDelay(i, this.lotteryData[i].isTurboMode);
                if (this.isScrollUp) {
                    list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount;
                    total = tsCore.MathKit.scrollLong(itemHeight, this.lotteryData[i].itemCount, this.getLaps(i), this.getLaps(i), this.rowNum);
                }
                else {
                    list.scrollPane.posY = itemHeight * this.lotteryData[i].itemCount * this.getLaps(i);
                    total = itemHeight * this.rowNum;
                }
                this.onScrollTween(i, this.lotteryData[i]);
                tween = Laya.Tween.to(list.scrollPane, { posY: total }, duration, this.backInOut, Laya.Handler.create(this, this.completeHandler, [list]), delay);
                this.tweenList.push(tween);
            }
            this.startPlayResultTween();
        }
        /*@override*/
        setRenderListData(index) {
            let list = this.listRolls[index];
            list.data = this.lotteryData[index].arr;
            list.numItems = list.data.length;
        }
        getDuration(index, isTurboMode) {
            let duration = index * 150 + 2000;
            if (isTurboMode) {
                duration = 2000;
            }
            return duration;
        }
        getDelay(index, isTurboMode) {
            let delay = index * 30;
            if (isTurboMode) {
                delay = 0;
            }
            return delay;
        }
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        completeHandler(list) {
            this.completeCount++;
            // 如果需要完成一次回调
            this.oneComplete(list);
            if (this.completeCount < this.tweenList.length) {
                return;
            }
            this.lotteryData.splice(0, this.lotteryData.length);
            while (this.tweenList.length > 0) {
                this.tweenList.shift().clear();
            }
            if (this.allEndDelay) {
                Laya.timer.once(this.allEndDelay, this, this.rollComplete);
            }
            else
                this.rollComplete();
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    gameLib.SlotScrollTweenModel = SlotScrollTweenModel;
    class GoldEffect extends tsCore.View {
        constructor() {
            super();
            this.golds = [];
            this.count = 0;
            this.maxCount = 100;
            /** 宽 */
            this.goldW = 80;
            /** 高 */
            this.goldH = 80;
            this.regAction(ActionLib.PLAY_GOLD_EFFECT, this, this.showHandler);
            this.regAction(ActionLib.CLOSE_GOLD_EFFECT, this, this.closeHandler);
        }
        showHandler(parent, max = 50, recoveryPoint) {
            this.recoveryPoint = recoveryPoint;
            this.maxCount = max;
            parent !== null && parent !== void 0 ? parent : (parent = fgui.GRoot.inst);
            parent.addChild(this);
            Laya.timer.callLater(this, this.play);
        }
        play() {
            this.count = 0;
            this.bottomLimit = this.root.height + this.goldH + 1;
            for (let i = 0; i < this.maxCount; i++) {
                let loader = new GoldSpray();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = "gold.png";
                let x = this.parent.width / 2 - this.goldW / 2;
                let y = (this.parent.height - this.parent.height / 3) + Math.random() * 50 - 25;
                loader.initX = x;
                loader.initY = y;
                loader.setXY(x, y);
                loader.vx = Math.random() * 20 - 10;
                loader.vy = Math.random() * -5 - 40;
                loader.gy = 1;
                this.addChild(loader);
                this.count++;
                this.golds.push(loader);
            }
            Laya.timer.frameLoop(1, this, this.onFrameLoop);
            tsCore.SoundUtils.playSound("sounds/gold.ogg");
        }
        onFrameLoop() {
            let goldAniBox;
            for (let i = 0; i < this.golds.length; i++) {
                goldAniBox = this.golds[i];
                if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.bottomLimit)) {
                    goldAniBox.update();
                }
                else {
                    goldAniBox.isStop = true;
                }
            }
            // 判断是否还有可以动的
            let count = 0;
            for (let i = 0; i < this.golds.length; i++) {
                goldAniBox = this.golds[i];
                if (!goldAniBox.isStop) {
                    count++;
                }
            }
            if (count == 0) {
                this.closeHandler();
            }
        }
        closeHandler() {
            Laya.timer.clearAll(this);
            this.removeFromParent();
            while (this.golds.length) {
                let body = this.golds.shift();
                body.dispose();
            }
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    gameLib.GoldEffect = GoldEffect;
    /**
     * 发射金币动画
     */
    class GoldLaunch {
        constructor() {
            this.goldAniBox = [];
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            /** 动画结束数量 */
            this.completeCount = 0;
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent, goldUrl, num, endObject, endHandler) {
            let endPoint = endObject.localToGlobal();
            parent.globalToLocal(endPoint.x, endPoint.y, endPoint);
            // 设置最终位置居中
            endPoint.x += endObject.width >> 1;
            endPoint.y += endObject.height >> 1;
            endPoint.x -= this.goldW >> 1;
            endPoint.y -= this.goldH >> 1;
            this.play(parent, goldUrl, num, endPoint, endHandler);
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent, goldUrl, num, endPoint, endHandler) {
            this.endPoint = endPoint;
            this.endHandler = endHandler;
            this.completeCount = 0;
            let startX = (parent.root.width - this.goldW) >> 1;
            let startY = parent.root.height - parent.root.height / 2;
            for (let i = 0; i < num; i++) {
                let loader = new GoldLoader();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = goldUrl;
                loader.visible = false;
                loader.setXY(startX, startY);
                loader.setStartPoint(startX, startY);
                // Log.debug(startY, endPoint.y + (startY - endPoint.y)/2, endPoint.y)
                loader.setMiddlePoint(startX + 100, endPoint.y + (startY - endPoint.y) / 2);
                loader.setEndPoint(endPoint.x, endPoint.y);
                parent.addChild(loader);
                this.goldAniBox.push(loader);
                Laya.Tween.to(loader, { t: 1, update: new Laya.Handler(this, this.playUpdate, [loader]) }, 500, null, Laya.Handler.create(this, this.playEndHandler, [loader]), i * 100);
            }
        }
        playUpdate(loader) {
            if (loader.t > 0) {
                loader.visible = true;
            }
        }
        playEndHandler(loader) {
            loader.removeFromParent();
            this.completeCount++;
            if (this.completeCount == this.goldAniBox.length) {
                runFun(this.endHandler);
                while (this.goldAniBox.length) {
                    this.goldAniBox.shift().dispose();
                }
            }
        }
        dispose() {
            this.endHandler = null;
            let goldAniBox;
            while (this.goldAniBox.length) {
                goldAniBox = this.goldAniBox.shift();
                Laya.Tween.clearAll(goldAniBox);
                goldAniBox.dispose();
            }
        }
    }
    gameLib.GoldLaunch = GoldLaunch;
    /**
     * 具有贝塞尔曲线运动的loader
     */
    class GoldLoader extends mixinExt(tsCore.BezierCurves, fgui.GLoader) {
        /**
         * 从对象池获取一个 GoldLoader
         */
        static create() {
            return Laya.Pool.getItemByClass(GoldLoader.NAME, GoldLoader);
        }
        constructor() {
            super();
            this.fill = fgui.LoaderFillType.Scale;
            this.setPivot(.5, .5);
        }
        /**
         * 将对象放到对应类型标识的对象池中。
         */
        /*@override*/
        recover() {
            var _a, _b;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.pause();
            (_b = this._timeLine) === null || _b === void 0 ? void 0 : _b.reset();
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.removeFromParent();
            super.recover();
            this.icon = null;
            Laya.Pool.recover(GoldLoader.NAME, this);
        }
        /*@override*/
        dispose() {
            this.recover();
            // super.dispose();
        }
        getTimeLine(callback) {
            if (!this._timeLine) {
                this._timeLine = new Laya.TimeLine();
                this._timeLine.on(Laya.Event.COMPLETE, this, this.onPlayEnd);
            }
            else
                this._timeLine.reset();
            this.playEndCallback = callback;
            return this._timeLine;
        }
        timeLine(callback) {
            this.getTimeLine(callback);
            return this;
        }
        /**
         * 控制一个对象，从当前点移动到目标点。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        to(props, duration, ease, offset) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.to(this, props, duration, ease, offset);
            return this;
        }
        /**
         * 从 props 属性，缓动到当前状态。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        from(props, duration, ease, offset) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.from(this, props, duration, ease, offset);
            return this;
        }
        /**
         * 播放动画。
         * @param timeOrLabel 开启播放的时间点或标签名。
         * @param loop 是否循环播放。
         */
        play(timeOrLabel, loop) {
            var _a;
            (_a = this._timeLine) === null || _a === void 0 ? void 0 : _a.play(timeOrLabel, loop);
            return this;
        }
        onPlayEnd() {
            runFun(this.playEndCallback);
        }
    }
    GoldLoader.NAME = "GoldLoaderPool";
    gameLib.GoldLoader = GoldLoader;
    class GoldSpray extends GoldLoader {
        constructor() {
            super(...arguments);
            this.initX = 0;
            this.initY = 0;
            /** x方向的加速度 */
            this.vx = 0;
            /** Y方向的加速度 */
            this.vy = 0;
            /** X方向的重力 */
            this.gx = 0;
            /** Y方向的重力 */
            this.gy = 0;
            /** 是否已经停止运动 */
            this.isStop = false;
            /** 重力加速度 */
            this.gravitySpeed = 0;
            /** 速度是否减少 表示一直在负增长 */
            this.isNegativeGrowth = false;
            /** tempX */
            this.tempY = 0;
        }
        update() {
            if (this.tempY == 0) {
                this.tempY = this.vy;
            }
            else if (this.vy < this.tempY) {
                this.isNegativeGrowth = true;
                this.tempY = this.vy;
            }
            // 将重力累加到加速度中,这样每次渲染加速都在被消耗 最终造成反方向
            this.vx += this.gx;
            this.vy += this.gy;
            if (!this.isNegativeGrowth) {
                this.vy += this.gravitySpeed;
            }
            // 设置当前的位置变化
            this.setXY(this.x + this.vx, this.y + this.vy);
        }
    }
    gameLib.GoldSpray = GoldSpray;
    /** 播放各种金币动画 */
    class GoldSprayAni {
        constructor() {
            this.goldAniBox = [];
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            /** 动画结束数量 */
            this.completeCount = 0;
            /** 回收速度 */
            this.recoveryDuration = 500;
            /** 金币喷出速度 (默认 40) */
            this.goldSpeed = 40;
            /** 重力Y (默认 2)  */
            this.gravityY = 2;
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent, goldUrl, num, endObject, endHandler) {
            let endPoint = endObject.localToGlobal();
            parent.globalToLocal(endPoint.x, endPoint.y, endPoint);
            // 设置最终位置居中
            endPoint.x += endObject.width >> 1;
            endPoint.y += endObject.height >> 1;
            endPoint.x -= this.goldW >> 1;
            endPoint.y -= this.goldH >> 1;
            this.play(parent, goldUrl, num, endPoint, endHandler);
        }
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent, goldUrl, num, endPoint, endHandler) {
            this.endPoint = endPoint;
            this.endHandler = endHandler;
            this.centreY = parent.root.height / 2;
            let startX = (parent.root.width - this.goldW) >> 1;
            let startY = parent.root.height - parent.root.height / 4;
            for (let i = 0; i < num; i++) {
                let loader = new GoldSpray();
                loader.setSize(this.goldW, this.goldH);
                loader.icon = goldUrl;
                loader.initX = startX;
                loader.initY = startY;
                loader.vx = Math.random() * 12 - 6;
                loader.vy = Math.random() * -5 - this.goldSpeed;
                loader.tempY = loader.vy;
                loader.gy = this.gravityY;
                loader.gravitySpeed = this.gravityY;
                loader.isNegativeGrowth = true;
                loader.setXY(startX, startY);
                parent.addChild(loader);
                this.goldAniBox.push(loader);
            }
            Laya.timer.clear(this, this.onFrameLoop);
            Laya.timer.frameLoop(1, this, this.onFrameLoop);
        }
        onFrameLoop() {
            let goldAniBox;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                if (!goldAniBox.isStop && (goldAniBox.vy < 0 || goldAniBox.y < this.centreY)) {
                    goldAniBox.update();
                }
                else {
                    goldAniBox.isStop = true;
                }
            }
            // 判断是否还有可以动的
            let count = 0;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                if (!goldAniBox.isStop) {
                    count++;
                }
            }
            if (count == 0) {
                // 全停了
                Laya.timer.clear(this, this.onFrameLoop);
                this.playEndPointAni();
            }
        }
        playEndPointAni() {
            this.completeCount = 0;
            if (this.readTweenFunction) {
                runFun(this.readTweenFunction, this.goldAniBox, this.endPoint);
                return;
            }
            if (!this.endPoint) {
                this.playComplete();
                return;
            }
            let goldAniBox;
            for (let i = 0; i < this.goldAniBox.length; i++) {
                goldAniBox = this.goldAniBox[i];
                goldAniBox.setStartPoint(goldAniBox.x, goldAniBox.y);
                goldAniBox.setMiddlePoint(goldAniBox.x + (this.endPoint.x - goldAniBox.x) / 2 + tsCore.MathKit.random(200, 300), goldAniBox.y + (this.endPoint.y - goldAniBox.y) / 2
                    - (tsCore.MathKit.random(0, 100) * (this.endPoint.y > this.centreY ? -1 : 1)));
                goldAniBox.setEndPoint(this.endPoint.x, this.endPoint.y);
                Laya.Tween.to(goldAniBox, { t: 1 }, this.recoveryDuration, null, Laya.Handler.create(this, this.playComplete), i * 5 + 300);
            }
        }
        playComplete() {
            this.completeCount++;
            if (this.completeCount == this.goldAniBox.length) {
                runFun(this.endHandler);
                while (this.goldAniBox.length) {
                    this.goldAniBox.shift().dispose();
                }
            }
        }
        dispose() {
            Laya.timer.clear(this, this.onFrameLoop);
            this.readTweenFunction = null;
            this.endHandler = null;
            let goldAniBox;
            while (this.goldAniBox.length) {
                goldAniBox = this.goldAniBox.shift();
                Laya.Tween.clearAll(goldAniBox);
                goldAniBox.dispose();
            }
        }
    }
    gameLib.GoldSprayAni = GoldSprayAni;
    class GameConfigKit {
        /**
         * 获取游戏配置表
         */
        static gameConfig() {
            return tsCore.ConfigKit.get(GameConfigKit.CONFIG_NAME);
        }
        /**
         * 根据游戏id获取配置的游戏名 如果没有 null
         * @param [code=0] 不传将使用当前已经打开游戏id
         */
        static gameName(code = null) {
            code !== null && code !== void 0 ? code : (code = Player.inst.gameId);
            if (code <= 0)
                return null;
            const config = GameConfigKit.gameConfig();
            return config ? config[code] : null;
        }
        /**
         * 获取游戏名字的标准样式
         * @param [code=null] 游戏id 不填将使用当前已在用得到游戏id
         * @param [format=null] 格式化样式，将空白替换成指定的值 不设置将用驼峰命名
         */
        static gameNameCanonical(code = null, format = null) {
            let name = GameConfigKit.gameName(code);
            if (name) {
                if (format) {
                    name = name.replace(/\s+/g, format);
                }
                else {
                    const names = name.split(/\s+/g);
                    if (names.length > 1) {
                        name = "";
                        for (const name1 of names) {
                            name += name1.charAt(0).toUpperCase() + name1.substring(1).toLowerCase();
                        }
                    }
                }
            }
            return name ? name : null;
        }
        /**
         * 根据游戏名获取游戏id 如果不存在返回-1
         * @param [name=null]
         */
        static gameCode(name = null) {
            name !== null && name !== void 0 ? name : (name = Player.inst.gameName);
            name !== null && name !== void 0 ? name : (name = GameConfigKit.gameNameCanonical());
            const config = GameConfigKit.gameConfig();
            if (name && config) {
                for (const key in config) {
                    if (tsCore.StringUtil.trimAll(config[key]) == name) {
                        return parseInt(key);
                    }
                }
            }
            return -1;
        }
        /**
         * 获取游戏配置数据
         * @param [name=null] 游戏名字,如果不传，将获取当前打开游戏名字
         */
        static gameRes(name = null) {
            name !== null && name !== void 0 ? name : (name = Player.inst.gameName);
            name !== null && name !== void 0 ? name : (name = GameConfigKit.gameNameCanonical());
            return name ? window[name] : null;
        }
    }
    /**
     * 在window上配置的属性名字
     * @default gameIdConfig
     */
    GameConfigKit.CONFIG_NAME = "gameIdConfig";
    gameLib.GameConfigKit = GameConfigKit;
    /**
     * 统计管理器
     * @author boge
     */
    class AnalyticsManager {
        /** 打开了一个游戏 */
        static openGame() {
        }
        /** 关闭了一个游戏 */
        static closeGame() {
        }
        /** 打开统计 */
        static openAnalysis(callback) {
            runFun(callback);
        }
        /**
         * 发送游戏事件
         * @param eventAction 互动类型 (默认会添加 _)
         * @param eventLabel 事件标签
         */
        static sendGameAnalysis(eventAction, eventLabel) {
            var _a;
            // 获取当前的游戏配置
            let gameName = (_a = GameConfigKit.gameNameCanonical(null, "_")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (gameName) {
                eventLabel !== null && eventLabel !== void 0 ? eventLabel : (eventLabel = Player.inst.isGuest ? "demo" : "cash");
                AnalyticsManager.send(gameName + "_" + eventAction, eventLabel);
            }
            else {
                tsCore.Log.warn("sendGameAnalysis : gameId=" + Player.inst.gameId + " not exist");
            }
        }
        /**
         * 向Google Analytics 发送事件
         * @param eventAction 事件操作
         * @param eventLabel  事件标签
         */
        static send(eventAction, eventLabel = "") {
            AnalyticsManager.ga("event", "game" + (tsCore.Environment.active == tsCore.EnvType.DEV ? "_dev" : ""), eventAction, eventLabel);
        }
        /**
         * 向Google Analytics 发送用户用时
         * @param timingVar 用于标识要记录的变量
         * @param timingValue 向 Google Analytics（分析）报告的，以毫秒为单位的历时时间（例如 20）。
         *
         */
        static sendTiming(timingVar, timingValue) {
            this.isOpenAnalytics = tsCore.ConfigKit.get("openAnalytics");
            if (Player.inst.isWeb && this.isOpenAnalytics && window.ga)
                gaTiming({ timingCategory: "game", timingVar: timingVar, timingValue: timingValue });
            if (!Player.inst.isWeb && this.isOpenAnalytics)
                AppManager.enterInvite({ eventName: timingVar, eventValue: timingValue }, AppManager.nullFun);
        }
        /**
         * 向 Google Analytics 发送事件
         * @param type
         * @param category
         * @param action
         * @param label
         */
        static ga(type, category, action, label) {
            this.isOpenAnalytics = tsCore.ConfigKit.get("openAnalytics");
            if (Player.inst.urlParam.debug) {
                const encoder = new TextEncoder();
                const categoryLen = encoder.encode(category).length;
                const actionLen = encoder.encode(action).length;
                const labelLen = encoder.encode(label).length;
                tsCore.Log.debug(`category=${categoryLen} action=${actionLen} label=${labelLen}`);
            }
            // @ts-ignore
            if (this.isOpenAnalytics && Player.inst.isWeb && window.ga)
                ga('send', type, category, action, label);
            if (this.isOpenAnalytics && !Player.inst.isWeb)
                AppManager.enterFeedback({ eventName: action, eventValue: label }, AppManager.nullFun);
        }
    }
    /** 开启数据统计 */
    AnalyticsManager.isOpenAnalytics = true;
    gameLib.AnalyticsManager = AnalyticsManager;
    class APP {
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new APP());
            return this._instance;
        }
        openGame(gameId) {
            SceneManager.inst.openGame(null, gameId);
        }
        hide() {
            HtmlWindow.inst.hide();
        }
        share(type, url, content) {
            HtmlWindow.inst.share(type, url, content);
        }
        /** 打开app */
        openApp(packageName, uriPath, url, jsonData) {
            if (Laya.Render.isConchApp) {
                AppManager.openApp(packageName, uriPath, url, jsonData);
            }
            else {
                let json = tsCore.HTTPUtils.parseJson(jsonData);
                Player.inst.windowOpen(url + (json ? "?" + json : ""));
            }
        }
        showGame(str) {
            AppRecordManager.JavaSendOpen(JSON.parse(str));
        }
        closeGame() {
            SceneManager.inst.closeGame();
        }
        guest(value = true) {
            SceneManager.inst.showGameToView(value);
        }
        /**
         * 返回键
         * @param [value=true]
         */
        appKeyBack(value = true) {
            tsCore.HistoryManager.backHistory(value);
        }
        // /**
        //  * app手机调用js方法
        //  * @param action 执行动作
        //  * @param value 执行命令
        //  *
        //  */
        // appRunJs(action: number, ...value) {
        //     switch (action) {
        //         case 2:// 获得手机图片数据
        //             App.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value)
        //             break
        //         default:
        //             break
        //
        //     }
        // }
        /**
         * app回调数据
         * @param json
         */
        callback(json) {
            if (!json)
                return;
            tsCore.Log.debug(`callback() json=${json}`);
            if (typeof json === "string")
                json = JSON.parse(json);
            if (AppRecordManager.customJavaSendOpen && AppRecordManager.customJavaSendOpen(json))
                return;
            Player.inst.urlParam.parseData(json);
            tsCore.Log.debug("callback() type = " + json.type);
            tsCore.Log.debug("callback() openGame = " + json.openGame);
            tsCore.Log.debug("callback() gameName = " + json.gameName);
            if (!Player.inst.isGuest && json.token) {
                Player.inst.login.loginToken((data) => {
                    this.open(json);
                });
            }
            else {
                this.open(json);
            }
        }
        open(json) {
            var _a;
            switch (json.type) {
                case 1: // 打开网页
                    if (typeof json.data !== "string")
                        return;
                    HtmlWindow.inst.showTip(json.data);
                    AppRecordManager.executeJson = null;
                    break;
                case 2: // 进入游戏
                    if (typeof json.data === "number")
                        SceneManager.inst.changeScene(json.gameName, json.data || -1);
                    else if (typeof json.openGame === "number")
                        SceneManager.inst.changeScene(json.gameName, json.openGame || -1);
                    break;
                default:
                    // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                    (_a = SceneManager.inst.starter) === null || _a === void 0 ? void 0 : _a.updateScreenOrientation();
                    break;
            }
        }
    }
    gameLib.APP = APP;
    /** app管理器 */
    class AppManager {
        /** 关闭app自定义返回 */
        static closeAppBack() {
            var _a;
            // if (AppManager.callIOS("runJs", {js: "appKeyBack()"})) return
            // @ts-ignore
            (_a = window.conch) === null || _a === void 0 ? void 0 : _a.setOnBackPressedFunction(function () {
            });
        }
        /** 进入游戏 */
        static sendAppData() {
            this.log("sendAppData");
            if (Laya.Browser.onLayaRuntime)
                this.LP_enterBBS(JSON.stringify(''), this.nullFun);
        }
        /**
         * Firebase 上报事件，事件数据为字符串
         * @param sData {'eventName' : "faqpage",  ‘eventValue’: "value"}
         * @param callback
         *
         */
        static enterFeedback(sData, callback) {
            if (AppManager.callIOS("reportFbEmpEvent", { eventName: sData.eventName, eventValue: sData.eventValue }))
                return;
            if (Laya.Browser.onLayaRuntime)
                this.LP_enterFeedback(JSON.stringify(sData), callback);
        }
        /**
         * Firebase 上报事件，事件数据为数字
         * @param sData { eventName : "gametime", eventValue: 1000}
         * @param callback
         *
         */
        static enterInvite(sData, callback) {
            if (Laya.Browser.onLayaRuntime)
                this.LP_enterInvite(JSON.stringify(sData), callback);
        }
        /** Toast 提示 */
        static toast(sData) {
            let obj = { action: 10005, value: sData };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 退出APP */
        static exit() {
            if (AppManager.callIOS("exitApp"))
                return;
            let obj = { action: 10008 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 上传头像 */
        static UpdateHead(token) {
            // type 1.返回选择的图片路径  2.返回图片base64数据
            let obj = { action: 10004, value: token, type: 1 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 游戏重启 */
        static gameRestart() {
            let obj = { action: 10021 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /** 关闭网页 */
        static closeHtml() {
            let obj = { action: 10000 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 获取设备唯一id
         * @param callback
         */
        static getIMEI(callback) {
            // if (AppManager.isIOS("getDeviceID")) return
            let obj = { action: 10001 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), callback);
        }
        static IsBackHome() {
            let obj = { action: 10002 };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 发送推送
         * @param value
         */
        static sendNotification(value) {
            let obj = { action: 10003, data: value };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 调用分享窗口
         * @param content 文本内容
         * @param url 网址
         * @param type 0.调用公用分享窗口 1.facebook 2.whatsapp 3.instagram 4.sms 5.twitter
         */
        static openShare(content, url = "", type = 0) {
            if (AppManager.callIOS("showShareBySystem", {
                type: type,
                text: content + (url ? "" : "\n" + url)
            }))
                return;
            if (!Laya.Browser.onLayaRuntime)
                return;
            let obj = {};
            if (type === 0) {
                obj.content = content + (tsCore.StringUtil.isEmpty(url) ? "" : "\n" + url);
                this.LP_enterShareAndFeed(JSON.stringify(obj), this.nullFun);
            }
            else {
                let obj = { action: 10027, data: content + (tsCore.StringUtil.isEmpty(url) ? "" : "\n" + url) };
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
            }
        }
        /**
         * 执行 javascript
         * @param method 执行方法体
         * @param value 方法传入的方法
         */
        static executionJavascript(method, value) {
            if (!(typeof value == "string"))
                value = JSON.stringify(value);
            let obj = { action: 10009, method: method, data: value };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * android 打印
         * @param value
         */
        static log(value) {
            if (Laya.Browser.onLayaRuntime) {
                let obj = { action: 10010, data: value };
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
            }
            else {
                tsCore.Log.info(value);
            }
        }
        /**
         * 用默认浏览器打开url
         * @param url
         */
        static openBrowser(url) {
            if (AppManager.callIOS("openBrowser", { url: url }))
                return;
            let obj = { action: 10012, data: url };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 拷贝字符串到剪贴板
         * @param data
         */
        static clipData(data) {
            let obj = { action: 10013, data: data };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 下载文件
         * @param url 文件地址
         * @param title 标题
         * @param des 介绍
         */
        static downloadFile(url, title, des) {
            let obj = { action: 10014, data: url, title: title, des: des };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 设置角标数字
         * @param value 显示的数字
         */
        static sendShortcutBadger(value) {
            let obj = { action: 10015, data: value };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 打开app
         * @param packageName 包名
         * @param uriPath 网页打开app方式 "gamemania://com.casino.gamemania/path"
         * @param url url
         * @param jsonData 传送的json数据
         */
        static openApp(packageName, uriPath, url, jsonData = null) {
            let obj = {
                action: 10016,
                packageName: packageName,
                uriPath: uriPath,
                url: url,
                jsonData: JSON.stringify(jsonData)
            };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), this.nullFun);
        }
        /**
         * 获取 application meta-data 配置
         * @param key
         * @param callback
         */
        static getMetaData(key, callback) {
            let obj = { action: 10017, key: key };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), callback);
        }
        /** 显示游戏 */
        static showGame(value) {
            let obj = { action: 10018, data: value };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /** 显示网页 */
        static showWeb(value) {
            let obj = { action: 10019, data: value };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        static umengTest() {
            let obj = { action: -100, method: "test", data: ["s", "2"] };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 统计用户账号
         * @param Provider 账号来源。如果用户通过第三方账号登陆，可以调用此接口进行统计。支持自定义，不能以下划线”_”开头，使用大写字母和数字标识，长度小于32 字节; 如果是上市公司，建议使用股票代码。
         * @param ID 用户账号ID，长度小于64字节
         */
        static onProfileSignIn(Provider, ID) {
            let obj = { action: -100, method: "onProfileSignIn", data: [Provider, ID] };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 账号登出
         */
        static onProfileSignOff() {
            let obj = { action: -100, method: "onProfileSignIn", data: [] };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 真实消费
         * 这部分API用来统计用户(或者玩家) 在游戏内付费的统计，包括购买虚拟币，道具等。
         * @param money 本次消费金额(非负数)。
         * @param coin 本次消费的等值虚拟币(非负数)。
         * @param source 支付渠道, 1 ~ 99 之间的整数， 1-8 已经被预先定义, 9~99 之间需要在网站设置。
         */
        static pay(money, coin, source) {
            let obj = { action: -100, method: "pay", data: [money, coin, source] };
            if (Laya.Browser.onLayaRuntime)
                this.LP_SendMessageToPlatform(JSON.stringify(obj), null);
        }
        /**
         * 显示加载进度
         * @param value 当前加载进度
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static showLoadingPro(value, tempCount, totalCount) {
            if (Laya.Browser.window.loadingView) {
                // 先算出每一份 占用的百分比份量
                let pieces = 100 / totalCount;
                // 得出当前加载所占百分比的数量
                let pro = value / 100 * pieces;
                let totalPro = pieces * (tempCount - 1) + pro;
                let finalTotalPro = Math.ceil(totalPro);
                Laya.Browser.window.loadingView.loading(finalTotalPro);
            }
        }
        // /** 关闭加载界面 */
        // static hideLoadingView() {
        //     if (Laya.Browser.window.loadingView)
        //         Laya.Browser.window.loadingView.hideLoadingView()
        // }
        static LP_SendMessageToPlatform(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.sendMessageToPlatform(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_sendMessageToPlatform", json);
        }
        static LP_enterBBS(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterBBS(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterBBS", json);
        }
        static LP_enterFeedback(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket["enterFeedback"](json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterFeedback", json);
        }
        static LP_enterInvite(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterInvite(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterInvite", json);
        }
        static LP_enterShareAndFeed(json, callback) {
            if (Laya.Browser.window.conchMarket) {
                Laya.Browser.window.conchMarket.enterShareAndFeed(json, callback);
                return;
            }
            this.LP_init();
            this.jsToJava.callWithBack(callback, "LP_enterShareAndFeed", json);
        }
        static LP_init() {
            if (!this.jsToJava) {
                //            let pc:* = __JS__("PlatformClass.clsMap")
                //            log(pc+"")
                //
                ////            let obj:any = Laya.Browser.window.PlatformClass.clsMap
                ////            log(obj+"")
                //            if (pc) {
                //                for (let key:string in pc) {
                //                    log(key)
                //                }
                //            }
                this.jsToJava = tsCore.NativeUtils.PlatformClass.createClass("layaair.game.Market.MarketTest").newObject();
                this.jsToJava.call("LP_Init");
            }
        }
        /** 空方法 */
        static nullFun(data) {
        }
        /**
         * 判断是否是原生ios壳子
         */
        static get isIOS() {
            return AppManager.hasNativeIosMethod("openPage");
        }
        /**
         * 获取ios交互handler
         */
        static get NativeIOS() {
            var _a, _b;
            // @ts-ignore
            return (_b = (_a = window.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) !== null && _b !== void 0 ? _b : null;
        }
        /**
         * 判断是否存在ios原生方法
         */
        static hasNativeIosMethod(method) {
            var _a, _b, _c;
            return !!((_c = (_b = (_a = AppManager.NativeIOS) === null || _a === void 0 ? void 0 : _a.hasNativeMethod) === null || _b === void 0 ? void 0 : _b.postMessage) === null || _c === void 0 ? void 0 : _c.call(_b, method));
        }
        /**
         * 执行调用ios方法
         * @param method 调用方法名
         * @param data 传递数据
         * @param [printDebug=true] 打印调用命令是否执行
         */
        static callIOS(method, data, printDebug = true) {
            var _a, _b;
            if (AppManager.isIOS) {
                const webkit = AppManager.NativeIOS;
                data !== null && data !== void 0 ? data : (data = {});
                typeof data !== "string" && (data = JSON.stringify(data));
                tsCore.Log.debug(`execute ios ${method} ${data}`);
                const promise = (_b = (_a = webkit === null || webkit === void 0 ? void 0 : webkit[method]) === null || _a === void 0 ? void 0 : _a.postMessage) === null || _b === void 0 ? void 0 : _b.call(_a, data);
                if (printDebug)
                    promise === null || promise === void 0 ? void 0 : promise.then((r, c) => {
                        tsCore.Log.debug(`call ios success -> ${method} ${data}  ${promise.status} ${r} ${c}`);
                    }).catch((e) => {
                        tsCore.Log.debug(`call ios error -> ${method} ${data} ${promise.status} ${e} `);
                    });
                return true;
            }
            return false;
        }
    }
    gameLib.AppManager = AppManager;
    /**
     * app 访问记录管理
     * @author boge
     */
    class AppRecordManager extends tsCore.HistoryManager {
        /**
         * 退出游戏
         * @param [isBack = false] 是否用的返回键（非项目内的）
         *
         */
        static backGame(isBack = false) {
            tsCore.Log.debug(`backGame isBack=${isBack}`);
            if (AppRecordManager.pauseHistory) {
                if (isBack) { // 键盘返回
                    if (!Laya.Browser.onLayaRuntime)
                        AppRecordManager.addNewHistory();
                }
                else {
                }
                //			    MessageTip.showTip(CommonCmd.NOT_EXIT_GAME)
                return;
            }
            const history = AppRecordManager.history;
            if (history.length === 0)
                return;
            let array = history[history.length - 1];
            if ((array === null || array === void 0 ? void 0 : array.newPage) instanceof BaseScene) {
                AppRecordManager.back(isBack);
            }
            else {
                AppRecordManager.back(isBack);
                if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                    AppRecordManager.backGame(isBack);
                }
            }
        }
        /**
         * 返回操作
         * @param isBack 是否用的返回键（非项目内的）
         * @internal
         */
        static _backHistory(isBack = false) {
            tsCore.Log.debug(`_backHistory isBack=${isBack}`);
            const history = AppRecordManager.history;
            if (history.length > 0 && (history[history.length - 1].newPage instanceof fgui.Window || !AppRecordManager.pauseHistory)) {
                let array = history[history.length - 1];
                if (isBack && array.newPage instanceof BaseScene) {
                    AppRecordManager.backGame(isBack);
                    return;
                }
                AppRecordManager.back(isBack);
            }
            else {
                // 没有缓存页  退出游戏
                if (Laya.Render.isConchApp && isBack) { // 非网页版并且是在安卓设备上
                    let timer = Laya.Browser.now();
                    if (timer - AppRecordManager.exitTimer < 2000) { // 在指定的时间内
                        AppRecordManager.exitTimer = 0;
                        AppManager.exit();
                        return;
                    }
                    AppRecordManager.exitTimer = timer;
                    AppManager.toast(getString(1034 /* LibStr.EXIT_APP */));
                }
                else {
                    //					__JS__("window.history.back()")
                }
            }
        }
        /**
         * app手机调用js方法
         * @param action 执行动作
         * @param value 执行命令
         *
         */
        static appRunJs(action, ...value) {
            tsCore.Log.debug(`appRunJs action=${action} values=${value.join(',')}`);
            switch (action) {
                case 1: // 返回
                    if (Player.inst.gameId == CommonCmd.GAME_SPORTS && value[0] != "close") {
                        AppManager.IsBackHome();
                        return;
                    }
                    AppRecordManager.backHistory(true);
                    break;
                case 2: // 获得手机图片数据
                    tsCore.App.inst.sendAction(ActionLib.GET_MOBILE_PHONE_IMAGE_DATA, value);
                    break;
                case 3: // socket
                    if (value.length > 0) {
                        if (Player.inst.gameId == CommonCmd.GAME_HOME || Player.inst.gameId == CommonCmd.GAME_SCRATCHER) {
                            SocketManager.inst.onMessageReceived(value[0]);
                        }
                        else {
                            SocketManager.inst.onMessageReceived(value[0]);
                        }
                    }
                    break;
                case 10008:
                    SceneManager.inst.openGame(null, value[0]);
                    break;
                case 1000: // 与java交互
                    let str = value[0];
                    tsCore.Log.info(str);
                    let json = JSON.parse(str);
                    let token = json.token;
                    if (token) {
                        Player.inst.token = token;
                        Player.inst.login.loginToken((data) => {
                            if ((data === null || data === void 0 ? void 0 : data.code) == HttpCode.OK) {
                                if (Player.inst.gameId != -1) {
                                    AppRecordManager.JavaSendOpen(json);
                                }
                                else {
                                    AppRecordManager.executeJson = json;
                                }
                            }
                        });
                    }
                    else {
                        if (Player.inst.gameId != -1) {
                            AppRecordManager.JavaSendOpen(json);
                        }
                        else {
                            AppRecordManager.executeJson = json;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        /**
         * java 传入要求打开的内容
         * @param json
         */
        static JavaSendOpen(json) {
            if (!json)
                return;
            if (typeof json === "string") {
                json = JSON.parse(json);
            }
            if (AppRecordManager.customJavaSendOpen && AppRecordManager.customJavaSendOpen(json)) {
                return;
            }
            Player.inst.urlParam.parseData(json);
            tsCore.Log.debug(`JavaSendOpen() type=${json.type}`);
            tsCore.Log.debug(`JavaSendOpen() openGame=${json.openGame}`);
            tsCore.Log.debug(`JavaSendOpen() gameName=${json.gameName}`);
            if (!Player.inst.isGuest && json.token) {
                Player.inst.login.loginToken(Laya.Handler.create(null, function (data) {
                    AppRecordManager.open(json);
                }));
            }
            else {
                AppRecordManager.open(json);
            }
        }
        static open(json) {
            tsCore.Log.debug(`open() json=${JSON.stringify(json)}`);
            switch (json.type) {
                case 1: // 打开网页
                    HtmlWindow.inst.showTip(json.data);
                    AppRecordManager.executeJson = null;
                    break;
                case 2: // 进入游戏
                    SceneManager.inst.openGame(json.gameName, Laya.Utils.parseInt(json.data) || Laya.Utils.parseInt(json.openGame) || -1);
                    // SceneManager.inst.changeScene(
                    //     json.gameName,
                    //     Laya.Utils.parseInt(json.data) || Laya.Utils.parseInt(json.openGame) || -1)
                    break;
                default:
                    // 有可能是从游戏中弹出的网页  然后从网页中返回到游戏 app专有操作
                    if (SceneManager.inst.starter)
                        SceneManager.inst.starter.updateScreenOrientation();
                    break;
            }
        }
    }
    /** 退出点击上一次时间 */
    AppRecordManager.exitTimer = 0;
    gameLib.AppRecordManager = AppRecordManager;
    Object.defineProperty(tsCore.HistoryManager, "backHistory", { value: AppRecordManager._backHistory });
    /**
     * 资源管理类
     */
    class AssetsLoader {
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new AssetsLoader());
            return this._instance;
        }
        constructor() {
            /** 是否是http  */
            this.httpProtocol = Laya.Browser.window.location.protocol == "http:";
            this.runLoads = [];
            Laya.URL.customFormat = AssetsLoader.formatUrl;
            // 添加加载路径格式化
            AssetsLoader.loadPathFormat.push(this);
        }
        static formatUrl(url) {
            var _a, _b, _c, _d, _e, _f;
            let version = Laya.URL.version[url];
            for (const format of AssetsLoader.loadPathFormat) {
                url = (_b = (_a = format.path) === null || _a === void 0 ? void 0 : _a.call(format, url)) !== null && _b !== void 0 ? _b : url;
                version = (_d = (_c = format.version) === null || _c === void 0 ? void 0 : _c.call(format, url, version)) !== null && _d !== void 0 ? _d : version;
                version = (_f = (_e = format.call) === null || _e === void 0 ? void 0 : _e.call(format, url, version)) !== null && _f !== void 0 ? _f : version;
            }
            if (tsCore.ELoader.isWebp && url.endsWithAny("png", "jpg"))
                url += ".webp";
            if (!Laya.Browser.onLayaRuntime && version)
                url = `${url}?v=${version}`;
            return url;
        }
        call(url, version) {
            if (Laya.Render.isConchApp)
                return version;
            if (url.contains("configs/newConfig")) {
                return Laya.URL.version["configs/newConfig.js"];
            }
            return version;
        }
        /**
         * 加载版本控制文件
         * @param complete
         * @param errorHandler
         */
        loadVersionXML(complete, errorHandler) {
            let resConfigUrl = AssetsLoader.CONFIG_RES_NAME + (Laya.Render.isConchApp ? "" : "?v=" + Laya.Browser.now());
            tsCore.ELoader.loader.load(resConfigUrl, Laya.Handler.create(this, this.loadXMLComplete, [complete, errorHandler, resConfigUrl]), null, Laya.Loader.XML);
        }
        loadXMLComplete(complete, errorHandler, resConfigUrl, source) {
            if (!source) {
                runFun(errorHandler);
                return;
            }
            tsCore.ELoader.loader.clearRes(resConfigUrl);
            this.parseUrl(source);
            if (this.customLoader) {
                runFun(this.customLoader, complete, errorHandler);
            }
            else {
                runFun(complete);
            }
        }
        /**
         * 加载主要的资源
         * @param handler
         */
        loadMain(handler) {
            let loadXmlComplete = () => {
                if (AssetsLoader.VERSION_RES_URL) {
                    let loadInitJson = [{ url: AssetsLoader.VERSION_RES_URL, type: Laya.Loader.JSON }];
                    tsCore.ELoader.loader.load(loadInitJson, Laya.Handler.create(this, loadJsonComplete));
                }
                else {
                    loadInit();
                }
                function loadJsonComplete(success) {
                    if (!success) {
                        loadErrorHandler();
                        return;
                    }
                    let versionJson = fgui.AssetProxy.inst.getRes(AssetsLoader.VERSION_RES_URL);
                    tsCore.ELoader.loader.clearRes(AssetsLoader.VERSION_RES_URL);
                    Player.DOWNLOAD_APK_URL = versionJson.url;
                    Player.VERSION = versionJson.version;
                    Player.VERSION_CODE = versionJson.versionCode;
                    Player.HOME_URL = versionJson.appUrl;
                    loadInit();
                }
                function loadInit() {
                    if (tsCore.StringUtil.isEmpty(AssetsLoader.DEFAULT_INIT_RES_NAME)) {
                        runFun(handler);
                    }
                    else {
                        // init 资源加载
                        let loads = Laya.Browser.window[AssetsLoader.DEFAULT_INIT_RES_NAME];
                        tsCore.ELoader.loader.load(loads, Laya.Handler.create(this, loadBaseComplete, [loads]));
                    }
                }
            };
            let loadErrorHandler = () => {
                tsCore.ELoader.loader.clearUnLoaded();
                AnalyticsManager.sendGameAnalysis("loader_main_res_error");
                if (!Laya.Render.isConchApp)
                    JSUtils.alert(getString(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
            };
            let loadBaseComplete = (loads, success) => {
                if (!success) {
                    loadErrorHandler();
                    return;
                }
                if (!this.addPackages(loads)) {
                    tsCore.Log.debug("addPackage fail = init");
                    loadErrorHandler();
                    return;
                }
                runFun(handler);
            };
            this.loadVersionXML(loadXmlComplete, loadErrorHandler);
        }
        /**
         * 加载公共资源
         * @param handler
         * @param assets
         */
        loadCommon(handler, assets = null) {
            if (!assets) {
                assets = [];
                // 公共资源
                let commonRes = Laya.Browser.window.common;
                let serverUrl = Laya.Browser.window.serverState;
                assets = assets.concat(commonRes);
                assets.push({ url: serverUrl, type: Laya.Loader.TEXT });
            }
            AssetsLoader.checkBranch(assets);
            function loadCommonErrorHandler() {
                tsCore.ELoader.loader.clearUnLoaded();
                if (!Laya.Render.isConchApp)
                    JSUtils.alert(getString(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
            }
            function progressCommonHandler(data) {
                let pro = parseInt(data * 100 + "");
                if (Laya.Render.isConchApp) {
                    //                AppManager.showLoadingPro(pro, 2, 4)
                    LoadingWindow.inst.updateMsg(pro, 2, 4);
                }
                else {
                    if (Player.inst.urlParam.isJumpPage()) {
                        LoadingWindow.inst.updateMsg(pro, 2, 4);
                    }
                    else {
                        LoadingWindow.inst.updateMsg(pro, 2, 2);
                    }
                }
            }
            let loadCommonComplete = (success) => {
                if (!success) {
                    loadCommonErrorHandler();
                    return;
                }
                if (!this.addPackages(assets)) {
                    loadCommonErrorHandler();
                    return;
                }
                runFun(handler);
            };
            tsCore.ELoader.loader.load(assets, Laya.Handler.create(this, loadCommonComplete), Laya.Handler.create(this, progressCommonHandler, null, false));
        }
        /**
         * 加载游戏代码
         * @param config 配置表
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadJS(config, handler, errorHandler) {
            let obj = GameConfigKit.gameRes(config);
            let jsName = "js/" + obj.js + ".min.js";
            this.loadJsProgress(0);
            tsCore.ELoader.loader.load(jsName, Laya.Handler.create(this, loadJsComplete), new Laya.Handler(this.loadJsProgress), Laya.Loader.TEXT);
            function loadJsComplete(success) {
                if (!success) {
                    loadJsError();
                    return;
                }
                let jsContent = fgui.AssetProxy.inst.getRes(jsName);
                tsCore.UtilKit.loadScript(jsContent, true, Laya.Render.isConchApp ? null : Laya.URL.formatURL(jsName));
                tsCore.ELoader.loader.clearRes(jsName);
                runFun(handler);
            }
            function loadJsError() {
                tsCore.ELoader.loader.clearUnLoaded();
                AnalyticsManager.sendGameAnalysis("loader_js_res_error");
                runFun(errorHandler);
            }
        }
        loadJsProgress(e) {
            let pro = Laya.Utils.parseInt(e * 100 + "");
            if (Laya.Render.isConchApp) {
                //            AppManager.showLoadingPro(pro, 3, 4)
                LoadingWindow.inst.updateMsg(pro, 3, 4);
            }
            else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.inst.updateMsg(pro, 3, 4);
                }
                else {
                    LoadingWindow.inst.updateMsg(pro, 1, 1);
                }
            }
        }
        /**
         * 加载游戏资源
         * @param obj 游戏对象
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadRes(obj, handler, errorHandler) {
            this.handler = handler;
            this.errorHandler = errorHandler;
            this.loadObj = obj;
            let res = obj.res;
            let loadArray = [];
            // 判断是否已经显示过引导页
            let guideRes = Laya.LocalStorage.getItem("GameGuide_" + Player.inst.gameId);
            if (!guideRes && obj.guide) {
                let temps;
                if (Array.isArray(obj.guide)) {
                    temps = obj.guide;
                }
                else {
                    temps = [obj.guide];
                }
                for (let i = 0; i < temps.length; i++) {
                    let guide = temps[i];
                    if (typeof guide === "string") {
                        loadArray.push({ url: guide, type: Laya.Loader.IMAGE });
                    }
                    else {
                        loadArray.push(guide);
                    }
                }
            }
            if (this.customLoaderRes) {
                runFun(this.customLoaderRes, loadArray);
            }
            if (!fgui.UIPackage.getByName("gameCommon/gameCommon")) {
                let gameCommonRes = tsCore.ConfigKit.get("gameCommon");
                loadArray = loadArray.concat(gameCommonRes);
            }
            // 渠道资源检查
            AssetsLoader.checkBranch(loadArray);
            // 解析资源判断是否需要特殊处理的加载文件
            loadArray = loadArray.concat(this.parseRes(res));
            // 分隔音频
            let soundLoads = [];
            for (let i = 0; i < loadArray.length; i++) {
                let obj = loadArray[i];
                if (obj.type == Laya.Loader.SOUND) {
                    // 如果在自定义过滤中 返回false 不再需要那么排除音频
                    if (AssetsLoader.soundFilter && !AssetsLoader.soundFilter.filter(obj.url, obj)) {
                        tsCore.Log.debug(`clean ogg audio files from apple mobile devices. ${obj.url}`);
                    }
                    else {
                        // 此音频是要强制加载到初始化
                        if (obj.forceLoad) {
                            continue;
                        }
                        else
                            soundLoads.push(obj);
                    }
                    // let chromeBrowser = Laya.Browser.userAgent.indexOf("Chrome") != -1
                    // // 处理苹果移动设备中 ogg 音频文件
                    // if (!chromeBrowser && (Laya.Browser.onMac || Laya.Browser.onIOS || Laya.Browser.onIPhone || Laya.Browser.onIPad)) {
                    //     // 不是ogg格式的文件 或 ios app应用
                    //     if (!obj.url.contains(".ogg")) {
                    //         soundLoads.push(obj)
                    //     } else {
                    //         soundLoads.push(obj.url.replace(/\.ogg$/, ".m4a"))
                    //         tsCore.Log.debug(`clean ogg audio files from apple mobile devices. ${obj.url}`)
                    //     }
                    // } else {
                    //     soundLoads.push(obj)
                    // }
                    // // 此文件是要强制加载的音频文件 并且在预加载中
                    // if (obj.forceLoad && soundLoads.includes(obj)) {
                    //     continue
                    // }
                    // 默认 剔除音频
                    loadArray.splice(i, 1);
                    i--;
                }
            }
            tsCore.SoundUtils.addRes(soundLoads);
            // 分隔资源
            this.runLoads.length = 0;
            for (let i = 0; i < loadArray.length; i++) {
                let obj = loadArray[i];
                // 不是音乐，并且是运行时加载
                if (obj.type !== Laya.Loader.SOUND && obj.runLoad) {
                    loadArray.splice(i, 1);
                    i--;
                    this.runLoads.push(obj);
                }
            }
            // 开始load
            tsCore.ELoader.loader.load(loadArray, Laya.Handler.create(this, this.loadComplete), new Laya.Handler(this, this.progressComplete));
        }
        /**
         * 处理资源
         * @param res
         * @private
         */
        parseRes(res) {
            let data = res.concat();
            // 先检查批量加载
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                let matchArray = value.url.match(/\{(\d+,\d+)}/);
                if ((matchArray === null || matchArray === void 0 ? void 0 : matchArray.length) == 2) {
                    let nums = matchArray[1].split(",");
                    if ((nums === null || nums === void 0 ? void 0 : nums.length) == 2) {
                        data.splice(i, 1);
                        i--;
                        let start = tsCore.StringUtil.getNumbers(nums[0]);
                        let end = tsCore.StringUtil.getNumbers(nums[1]) + 1;
                        for (let j = start; j < end; j++) {
                            let newValue = Object.create(value);
                            newValue.url = newValue.url.replace(/\{(\d+,\d+)}/, j + "");
                            data.push(newValue);
                        }
                    }
                }
            }
            let sks = data.filter(function (value, index, array) {
                let temp;
                return Laya.Utils.getFileExtension(value.url) === "sk" && value.type === "spine"
                    && (temp = value.url.replace(".sk", ".png")) !== null
                    && array.findIndex(function (value) {
                        return value === temp;
                    }) === -1;
            });
            const spines = data.filter(function (value, index, array) {
                return Laya.Utils.getFileExtension(value.url) === "json" && value.type === "spine";
            });
            for (const value of sks) {
                value.type = Laya.Loader.BUFFER;
                // 判断是否忽略图片
                if (value.ignoreSuffix !== "png") {
                    let temp = value.url.replace(".sk", ".png");
                    // 如果未配置 png 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.IMAGE, branch: value.branch });
                    }
                }
            }
            // spine json格式 进行忽略判断
            for (const value of spines) {
                value.type = Laya.Loader.JSON;
                // atlas 纹理文件
                if (value.ignoreSuffix !== "atlas") {
                    let temp = value.url.replace(".json", ".atlas");
                    // 如果未配置 atlas 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.TEXT, branch: value.branch });
                    }
                }
                // png 图片
                if (value.ignoreSuffix !== "png") {
                    let temp = value.url.replace(".json", ".png");
                    // 如果未配置 png 则添加
                    if (data.findIndex((value) => temp == value.url) === -1) {
                        data.push({ url: temp, type: Laya.Loader.IMAGE, branch: value.branch });
                    }
                }
            }
            return data;
        }
        /**
         * 检查分支资源更换加载
         * @param loadRes 整理好的 加载数据
         */
        static checkBranch(loadRes) {
            // 如果使用了分支
            if (!tsCore.StringUtil.isEmpty(fgui.UIPackage.branch)) {
                // 检查是否有需要替换的分支资源
                for (let i = 0; i < loadRes.length; i++) {
                    let resObj = loadRes[i];
                    // 资源存在分支  并且url路径上不存在分支名字
                    if (resObj.branch && !tsCore.StringUtil.contains(resObj.url, "_" + fgui.UIPackage.branch)) {
                        let resBranch = resObj.branch;
                        if (resBranch.indexOf(fgui.UIPackage.branch) != -1) { // 找到需要更换的资源
                            let url = resObj.url;
                            let index = url.lastIndexOf(".");
                            if (index != -1) {
                                let head = url.substring(0, index);
                                let end = url.substring(index);
                                // 更换为分支资源
                                resObj.url = head + "_" + fgui.UIPackage.branch + end;
                            }
                        }
                    }
                }
            }
        }
        progressComplete(e) {
            let pro = parseInt(e * 100 + "");
            if (Laya.Render.isConchApp) {
                //            AppManager.showLoadingPro(pro, 4, 4)
                LoadingWindow.inst.updateMsg(pro, 4, 4);
            }
            else {
                if (Player.inst.urlParam.isJumpPage()) {
                    LoadingWindow.inst.updateMsg(pro, 4, 4);
                }
                else {
                    LoadingWindow.inst.updateMsg(pro, 1, 1);
                }
            }
        }
        loadComplete(success) {
            if (!success) {
                this.loadErrorHandler();
                return;
            }
            if (!fgui.UIPackage.getByName("gameCommon/gameCommon")) {
                if (!this.addPackage("gameCommon/gameCommon")) {
                    this.loadErrorHandler();
                    return;
                }
                // 通知开始注册游戏公共类 事件
                tsCore.App.inst.sendAction(ActionLib.GAME_REG_GAME_COMMON_CLASS);
            }
            if (!this.addPackages(this.loadObj.res)) {
                this.loadErrorHandler();
                return;
            }
            runFun(this.handler);
        }
        loadErrorHandler() {
            tsCore.ELoader.loader.clearUnLoaded();
            JSUtils.gameClose();
            AnalyticsManager.sendGameAnalysis("loader_game_res_error");
            runFun(this.errorHandler);
        }
        /**
         * 将一个 loadRes数组对象  添加资源
         * @param res
         */
        addPackages(res) {
            let fuiName;
            for (let k = 0; k < res.length; k++) {
                fuiName = res[k].url;
                if (fuiName.indexOf("." + fgui.UIConfig.packageFileExtension) != -1) {
                    fuiName = tsCore.StringUtil.remove(fuiName, "." + fgui.UIConfig.packageFileExtension);
                    if (!this.addPackage(fuiName)) {
                        tsCore.Log.debug("addPackage fail = " + fuiName);
                        return false;
                    }
                }
            }
            return true;
        }
        /**
         * 添加游戏UI资源
         * @param resKey 资源名字
         * @return 成功与否
         */
        addPackage(resKey) {
            let descData = fgui.AssetProxy.inst.getRes(resKey + "." + fgui.UIConfig.packageFileExtension);
            if (!descData || descData.byteLength == 0) {
                return false;
            }
            if (!fgui.UIPackage.getByName(resKey))
                fgui.UIPackage.addPackage(resKey);
            return true;
        }
        /** 设置扩展 */
        insertExt(pkgName, resName, type) {
            this.insertExtUrl("//" + pkgName + "/" + resName, type);
        }
        insertExtUrl(url, type) {
            fgui.UIObjectFactory.setPackageItemExtension(url, type);
        }
        /**
         * 资源url解析
         * @param xmlDocument
         */
        parseUrl(xmlDocument) {
            if (Laya.Render.isConchApp)
                return;
            let chills = xmlDocument.lastChild.childNodes;
            let child;
            let url;
            for (let i = 0; i < chills.length; i++) {
                child = chills[i];
                url = child.getAttribute("url");
                if (tsCore.StringUtil.endsWith(url, ".js") && !tsCore.StringUtil.endsWith(url, ".min.js")) {
                    Laya.URL.version[tsCore.StringUtil.replace(url, ".js", ".min.js")] = child.getAttribute("crc");
                }
                Laya.URL.version[url] = child.getAttribute("crc");
            }
        }
        /**
         * 合并两个xml
         * @param xml 如果有重复并且值不一样  以这个对象内的值为准
         * @param xml2
         * @private
         */
        mergeXml(xml, xml2) {
            let root = xml.lastChild;
            let element2 = xml2.lastChild.childNodes;
            let tempName;
            let isExist = false;
            let addElement = [];
            let itemElement;
            for (let i = 0; i < element2.length; i++) {
                isExist = false;
                itemElement = element2[i];
                if (itemElement.nodeType == 1) { // 只检查 Element
                    tempName = itemElement.getAttribute("name");
                    let xmlList = xml.getElementsByName(tempName);
                    if (xmlList.length > 0) {
                        if (itemElement.textContent == xmlList[0].textContent) {
                            tsCore.Log.debug("xml-languages: name=" + tempName + " repeat");
                        }
                        else {
                            // 发现有个存在一样的
                            tsCore.Log.warn("xml-languages: name=" + tempName + " repeat," +
                                " content=" + xmlList[0].textContent + ", content2=" + itemElement.textContent);
                        }
                    }
                    else {
                        addElement.push(itemElement);
                    }
                }
                else {
                    addElement.push(itemElement);
                }
            }
            for (let j = 0; j < addElement.length; j++) { // 添加
                root.appendChild(addElement[j]);
            }
            return xml;
        }
        /**
         * 运行加载资源
         */
        runLoad() {
            if (this.runLoads.length > 0) {
                tsCore.ELoader.loader.load(this.runLoads);
            }
        }
    }
    AssetsLoader.ma = Laya.Browser.now();
    /** 资源配置文件名 */
    AssetsLoader.CONFIG_RES_NAME = "resConfig.xml";
    /** 资源配置文件名 */
    AssetsLoader.DEFAULT_INIT_RES_NAME = null;
    /**
     * 版本加载路径
     * @example
     * https://res.game.co/assetsversion.json
     */
    AssetsLoader.VERSION_RES_URL = null;
    /** 加载路径格式化 */
    AssetsLoader.loadPathFormat = [];
    gameLib.AssetsLoader = AssetsLoader;
    /**
     * 舞台
     */
    class SceneManager extends tsCore.EProxy {
        constructor() {
            super(...arguments);
            /** 是否已经初始化完成 等待外部调用 */
            this.initComplete = false;
            /** 是否已经初始化完成 等待外部调用 */
            this.isLoaderResComplete = false;
            /** 是否需要唤醒进入游戏 */
            this.isCall = false;
            this.visibleId = 0;
            this.visibles = [];
            /**
             * 登录提示框
             * @deprecated
             */
            this.showloginTip = this.showLoginTip;
        }
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new SceneManager());
            return this._instance;
        }
        showHomeScene() {
            Player.inst.gameId = CommonCmd.GAME_HOME;
            if (!Laya.Render.isConchApp) {
                Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange);
                Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.visibilityChange);
            }
            tsCore.Log.debug("SceneManager.showHomeScene");
            AppManager.sendAppData();
            if (AppRecordManager.executeJson) {
                AppRecordManager.JavaSendOpen(AppRecordManager.executeJson);
            }
            else {
                LoadingWindow.inst.hide();
            }
        }
        /** 显示登录界面 */
        showLogin() {
            if (Player.inst.urlParam.isJumpPage())
                JSUtils.login();
        }
        /** 退出登录 */
        logout() {
            Laya.LocalStorage.removeItem("token");
            Laya.LocalStorage.removeItem("userData");
            Player.inst.token = null;
            SocketManager.inst.close();
            Laya.SoundManager.stopAll();
            Player.inst.money = 0;
            Player.inst.freeBet = 0;
            if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                // 不在大厅
                this.closeGame();
                Player.inst.gameId = CommonCmd.GAME_HOME;
                this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            }
            tsCore.HistoryManager.clearHistory();
            JSUtils.login();
        }
        /**
         * 添加应用显示与隐藏调用方法
         * @param fun
         */
        onVisibleChange(fun) {
            fun["$vid"] = this.visibleId++;
            this.visibles.push(fun);
        }
        offVisibleChange(fun) {
            if (fun["$vid"]) {
                let index = this.visibles.findIndex((value) => fun["$vid"] === value["$vid"]);
                this.visibles.splice(index, 1);
            }
        }
        /** 游戏是否进入后台 */
        visibilityChange() {
            let visibility = Laya.stage.isVisibility;
            // tsCore.Log.debug(`visibilityChange=${visibility}`)
            if (!this.isCloseGame)
                this.visibles.forEach((value) => value(visibility));
            visibility ? this.focusHandler() : this.blurHandler();
        }
        /** 得到焦点开始渲染 */
        focusHandler() {
            var _a, _b, _c, _d, _e;
            if (Player.inst.isGuest)
                return;
            fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            if (Player.inst.gameId != CommonCmd.GAME_HOME && Player.inst.gameId != CommonCmd.GAME_SCRATCHER) {
                // 告诉当前游戏进来了
                (_b = (_a = SceneManager.inst.starter) === null || _a === void 0 ? void 0 : _a.gameModel) === null || _b === void 0 ? void 0 : _b.focusGame();
                if (tsCore.HTTPUtils.getTimerSecond() - this.blurTimer >= 3) { // 超过3秒离开焦点
                    // 检查当前游戏
                    (_d = (_c = SceneManager.inst.starter) === null || _c === void 0 ? void 0 : _c.gameServlet) === null || _d === void 0 ? void 0 : _d.checkGamePeriod((sc) => {
                        fgui.GRoot.inst.closeModalWait();
                        if (!sc) {
                            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1012 /* LibStr.SYSTEM_BACK_LOBBY */, null, Laya.Handler.create(this, JSUtils.gameClose));
                        }
                    });
                }
                else {
                    fgui.GRoot.inst.closeModalWait();
                }
            }
            else {
                if (Player.inst.token) {
                    (_e = Player.inst.login) === null || _e === void 0 ? void 0 : _e.loginToken(Laya.Handler.create(this, function () {
                        fgui.GRoot.inst.closeModalWait();
                    }));
                }
                else {
                    fgui.GRoot.inst.closeModalWait();
                }
            }
        }
        /** 失去焦点停止渲染 */
        blurHandler() {
            var _a, _b;
            if (Player.inst.isGuest)
                return;
            this.blurTimer = tsCore.HTTPUtils.getTimerSecond();
            if (!SceneManager.inst.isAloneGame()
                && Player.inst.gameId != CommonCmd.GAME_HOME
                && Player.inst.gameId != CommonCmd.GAME_SCRATCHER) {
                // 告诉当前游戏离开了
                (_b = (_a = SceneManager.inst.starter) === null || _a === void 0 ? void 0 : _a.gameModel) === null || _b === void 0 ? void 0 : _b.blurGame();
            }
        }
        showLoginTip() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1023 /* LibStr.LOGIN */, null, () => this.showLogin());
        }
        /**
         * 开启游戏 两个参数二选一  如果使用id第一个必须设置null
         * @param config 游戏配置文件名
         * @param code 游戏id
         */
        openGame(config, code = -1) {
            tsCore.Log.info("openGame -> " + config + " " + code);
            Laya.stage.pauseUpdateTimer = false;
            this.removeGroup(tsCore.App.GAME_GROUP);
            Player.inst.guestModel.clearData();
            HtmlWindow.inst.hide();
            // 处理房间名字
            if (code > 0 || !config)
                config = GameConfigKit.gameNameCanonical(code);
            // 处理房间号
            if (code <= 0 && config)
                code = GameConfigKit.gameCode(config);
            if (!config || code <= 0) {
                tsCore.Log.error("config = " + config, "code = " + code);
                LoadingWindow.inst.hide();
                JSUtils.alert(getString(1017 /* LibStr.GAME_NOT_FOUND */));
                JSUtils.gameClose();
                return;
            }
            Player.inst.gameName = config;
            this.isCloseGame = false;
            //		// 如果是未登陆状态
            //		if (!Player.inst.isGuest && !Player.inst.token) {
            //			LoadingWindow.inst.hide()
            //			SceneManager.inst.showLogin()
            //			return
            //		}
            if (!Player.inst.urlParam.isJumpPage())
                fgui.GRoot.inst.showModalWait(getString(1000 /* LibStr.WAITING */));
            Player.inst.gameId = code;
            // 游戏脚本加载
            let gameResJS = "configs/gameRes" + (AssetsLoader.inst.httpProtocol ? "" : ".min") + ".js";
            let content = tsCore.ELoader.loader.getRes(gameResJS);
            if (!content) {
                tsCore.ELoader.loader.load(gameResJS, Laya.Handler.create(this, this.loadGameResComplete), null, Laya.Loader.TEXT);
            }
            else {
                this.loadGameJs();
            }
        }
        loadGameResComplete(content) {
            if (!content) {
                this.loadResErrorHandler();
                return;
            }
            tsCore.UtilKit.loadScript(content, true, Laya.Render.isConchApp ? null : "gameRes.js");
            this.loadGameJs();
        }
        loadGameJs() {
            let obj = GameConfigKit.gameRes();
            let res = obj.res;
            let resName = Player.inst.gameName;
            let tempStr;
            for (let i = 0; i < res.length; i++) {
                tempStr = res[i].url;
                if (tempStr.endsWith(fgui.UIConfig.packageFileExtension)) {
                    resName = tsCore.StringUtil.remove(tempStr, "." + fgui.UIConfig.packageFileExtension);
                }
            }
            // 加载游戏的js文件
            AssetsLoader.inst.loadJS(Player.inst.gameName, Laya.Handler.create(this, this.loadJsComplete), Laya.Handler.create(this, this.loadResErrorHandler));
        }
        loadJsComplete() {
            let obj = GameConfigKit.gameRes();
            // 延迟执行初始化  否则isCall  将失去意义
            // this._starter = obj.completeFun()
            // 已经加载的游戏代码
            if (!Player.inst.urlParam.isJumpPage())
                fgui.GRoot.inst.closeModalWait();
            LoadingWindow.inst.changeView(1, getString(1001 /* LibStr.LOADING */));
            AssetsLoader.inst.loadRes(obj, Laya.Handler.create(this, this.loadResComplete), Laya.Handler.create(this, this.loadResErrorHandler));
        }
        /**
         * 加载资源完成
         */
        loadResComplete() {
            this.isLoaderResComplete = true;
            tsCore.Log.debug("loadResComplete");
            this.startGameProcess();
        }
        /** 供外部调用 */
        showGameToView(isDemo) {
            if (this.initComplete) {
                return;
            }
            this.initComplete = true;
            tsCore.Log.debug("showGameToView -> isDemo=" + isDemo);
            Player.inst.isGuest = isDemo;
            this.startGameProcess();
        }
        /** 启动游戏进程，继续进入游戏 */
        startGameProcess() {
            if (this.initComplete && this.isLoaderResComplete || !this.isCall) {
                // 不是游客模式 检查token
                if (!Player.inst.isGuest && Player.inst.token) {
                    Player.inst.login.loginToken(this.checkGameState.bind(this));
                }
                else {
                    this.checkGameState({ code: 0 });
                }
            }
        }
        /** 检查游戏状态 */
        checkGameState(data) {
            if ((data === null || data === void 0 ? void 0 : data.code) == -1) {
                LoadingWindow.inst.hide();
                JSUtils.alert(StateCode.getShowMessage(data));
                JSUtils.gameClose();
                return;
            }
            let obj = GameConfigKit.gameRes();
            this._starter = obj.completeFun();
            AnalyticsManager.openGame();
            Player.inst.status = 1;
            // 如果是游客模式
            if (Player.inst.isGuest) {
                Player.inst.cacheMoney = Player.inst.money;
                Player.inst.money = Laya.Browser.window.demoFreeMoney || 10000;
            }
            this.sendAction(ActionLib.GAME_CHECK_STATE, Laya.Handler.create(this, this.checkComplete));
        }
        /**
         * 游戏检查完成
         * @private
         */
        checkComplete() {
            // 初始化用户数据
            this.sendAction(ActionLib.GAME_INIT_SERVLET, Laya.Handler.create(this, this.showGameScene));
        }
        /**
         * 显示游戏到舞台上
         *
         */
        showGameScene() {
            AnalyticsManager.openGame();
            Player.inst.status = 1;
            this.sendAction(ActionLib.GAME_CONNECT_SOCKET);
            this.sendAction(ActionLib.GAME_INSERT_EXTENSION);
            tsCore.MessageTip.clearAll();
            this.sendAction(ActionLib.GAME_INIT_SOCKET_EVENT);
            tsCore.SoundUtils.stopMusic(); // 关闭进入游戏前的音乐
            tsCore.Log.debug("create scene");
            // 创建游戏到舞台上
            this.sendAction(ActionLib.GAME_CREATE_SCENE_SHOW, Laya.Handler.create(this, function () {
                fgui.GRoot.inst.closeModalWait();
                tsCore.Log.debug("init model and load sound");
                this.sendAction(ActionLib.GAME_INIT_MODEL);
                AppRecordManager.executeJson = null;
                // 开始加载运行加载的声音
                tsCore.SoundUtils.load();
                // 开始加载运行加载的资源
                AssetsLoader.inst.runLoad();
                // 启动按键
                Laya.TouchManager.I.enable = Laya.MouseManager.enabled = Laya.KeyBoardManager.enabled = true;
                //                // 放到下一帧去播放  不然 进入需要旋转的游戏 渲染跟不上
                Laya.timer.callLater(this, function () {
                    tsCore.Log.debug("call close loading");
                    LoadingWindow.inst.hide();
                    JSUtils.gameOnload();
                    Player.inst.guestModel.guestPlayCount = 0;
                });
            }));
        }
        /** 加载资源失败 */
        loadResErrorHandler() {
            fgui.GRoot.inst.closeModalWait();
            if (Player.inst.urlParam.isJumpPage()) {
                if (!Laya.Render.isConchApp)
                    JSUtils.alert(getString(1005 /* LibStr.NET_ERROR */));
                JSUtils.gameClose();
                AppManager.gameRestart();
                Player.inst.gameId = CommonCmd.GAME_HOME;
                return;
            }
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1005 /* LibStr.NET_ERROR */, null, Laya.Handler.create(this, function () {
                LoadingWindow.inst.hide();
                JSUtils.gameClose();
                Player.inst.gameId = CommonCmd.GAME_HOME;
            }));
        }
        /** 游戏内部返回按钮被点击 */
        backHandler() {
            JSUtils.gameClose();
            tsCore.SoundUtils.clear();
            Laya.timer.callLater(this, function () {
                Player.inst.urlParam.clearJumpPage();
            });
        }
        /** 关闭当前的游戏 */
        closeGame() {
            tsCore.Log.debug("SceneManager.closeGame");
            if (!Laya.loader)
                return;
            this.isCloseGame = true;
            // 关闭所有按键
            Laya.TouchManager.I.enable = Laya.MouseManager.enabled = Laya.KeyBoardManager.enabled = false;
            Laya.stage.pauseUpdateTimer = true;
            Laya.timer.clearAllTimer();
            Laya.loader.clearUnLoaded();
            Laya.SoundManager.stopAll();
            AnalyticsManager.closeGame();
            tsCore.MessageTip.clearAll();
            PromptWindow.inst.clearCache();
            if (SocketManager.inst.roomId != Cmd.PROT_HOME)
                SocketManager.inst.close();
            this.sendAction(ActionLib.GAME_DISPOSE);
            this.sendAction(ActionLib.GAME_CLEAR_RES);
            this.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            if (fgui.UIPackage.getByName("gameCommon"))
                WaitResult.inst.hide();
            if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                if (Player.inst.isGuest)
                    Player.inst.money = Player.inst.cacheMoney;
                Player.inst.cacheMoney = 0;
                Player.inst.gameData = null;
                Player.inst.isGuest = false;
                Player.inst.gameId = CommonCmd.GAME_HOME;
            }
            // 退出游戏后  可能会导致访问资源变化  这里在调用一次资源路径设置
            if (tsCore.ELoader.checkBaseUrl)
                Laya.URL.basePath = tsCore.ELoader.checkBaseUrl()[0];
            AppManager.onProfileSignOff();
            Laya.Templet["TEMPLET_DICTIONARY"] = {};
            this.removeGroup(tsCore.App.GAME_GROUP);
        }
        /**
         * 跳转到其它游戏  直接修改url地址 切换游戏  从新走加载流程
         * @param config 游戏名字
         * @param code 游戏id
         *
         */
        jumpTo(config, code) {
            if (config || code) {
                let href = location.href;
                if (config)
                    href = href.replace(/(?<=gameName=)\d+/, config);
                if (code)
                    href = href.replace(/(?<=openG3ame=)\d+/, code + "");
                location.replace(href);
            }
        }
        /**
         * 切换游戏
         * @param config 游戏名字
         * @param code 游戏id
         *
         */
        changeScene(config, code) {
            var _a;
            if (Player.inst.gameId != code) {
                this.closeGame();
                this.openGame(config, code);
            }
            else {
                // 有可能是从游戏中弹出的网页  然后从游戏中返回到游戏 app专有操作
                (_a = this._starter) === null || _a === void 0 ? void 0 : _a.updateScreenOrientation();
            }
        }
        /** 当前游戏是否是单机版 */
        isAloneGame() {
            if (Player.inst.gameId == CommonCmd.GAME_HOME) {
                return false;
            }
            return this.checkAloneGame(Player.inst.gameId);
        }
        /**
         * 检查是否是单机版
         * @param gameId 游戏id
         * @return
         *
         */
        checkAloneGame(gameId) {
            return true;
        }
        /** 获取游戏开奖结果超时退出游戏 */
        gameGameTimeOutExit() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1011 /* LibStr.GET_GAME_RESULTS_TIME_OUT */, null, Laya.Handler.create(this, function () {
                this.sendAction(ActionLib.GAME_RECONNECTION_NET, Laya.Handler.create(this, function () {
                    Laya.timer.callLater(this, function () {
                        if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                            AppRecordManager.backHistory();
                            AnalyticsManager.send("exit_game_net_timeout_error_" + Player.inst.gameId);
                        }
                    });
                }));
            }));
        }
        /** 游戏报错 退出游戏 */
        gameErrorExit() {
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, 1009 /* LibStr.GAME_ERROR */, null, Laya.Handler.create(this, function () {
                this.sendAction(ActionLib.GAME_RECONNECTION_NET, Laya.Handler.create(this, function () {
                    Laya.timer.callLater(this, function () {
                        if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                            AnalyticsManager.send("exit_game_net_error_" + Player.inst.gameId);
                            JSUtils.gameClose();
                        }
                    });
                }));
            }));
        }
        /**
         * 出乎意料的退出游戏
         * @param msg
         * @param callback
         */
        unexpectedExitGame(msg, callback) {
            msg !== null && msg !== void 0 ? msg : (msg = getString(1009 /* LibStr.GAME_ERROR */));
            this.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg, null, Laya.Handler.create(this, function () {
                Laya.timer.callLater(this, function () {
                    if (Player.inst.gameId != CommonCmd.GAME_HOME) {
                        AppRecordManager.backHistory();
                    }
                    runFun(callback);
                });
            }));
        }
        get starter() {
            return this._starter;
        }
        get scene() {
            return this._starter.baseScene;
        }
        /**
         * 上传错误日志
         * @param data json格式的错误数据
         */
        sendErrorLog(data) {
            let postUrl = Player.inst.data.getErrorUrl();
            if (postUrl === null || postUrl === void 0 ? void 0 : postUrl.startsWith("http"))
                tsCore.HTTPUtils.create()
                    .setMethod("post")
                    .setUrl(postUrl)
                    .setData(data)
                    .call();
        }
    }
    gameLib.SceneManager = SceneManager;
    /** 公用信息处理 */
    let CommonCmd;
    (function (CommonCmd) {
        // 游戏id
        /** 游戏首页 */
        CommonCmd[CommonCmd["GAME_HOME"] = 999999] = "GAME_HOME";
        /** 水果 */
        CommonCmd[CommonCmd["GAME_FRUIT"] = 1] = "GAME_FRUIT";
        /** 大转盘 */
        CommonCmd[CommonCmd["GAME_WHEEL"] = 2] = "GAME_WHEEL";
        /** 百家乐 低倍 */
        CommonCmd[CommonCmd["GAME_LOW_BACCARAT"] = 30] = "GAME_LOW_BACCARAT";
        /** 百家乐 高倍 */
        CommonCmd[CommonCmd["GAME_HIGH_BACCARAT"] = 3] = "GAME_HIGH_BACCARAT";
        /** 单机水果 低倍 */
        CommonCmd[CommonCmd["GAME_ALONE_LOW_FRUIT"] = 1001] = "GAME_ALONE_LOW_FRUIT";
        /** 单机水果 高倍 */
        CommonCmd[CommonCmd["GAME_ALONE_HIGH_FRUIT"] = 1002] = "GAME_ALONE_HIGH_FRUIT";
        /** 刮刮奖 */
        CommonCmd[CommonCmd["GAME_SCRATCHER"] = 1003] = "GAME_SCRATCHER";
        /** 单机大转盘 低倍 */
        CommonCmd[CommonCmd["GAME_ALONE_LOW_WHEEL"] = 2001] = "GAME_ALONE_LOW_WHEEL";
        /** 单机大转盘 高倍 */
        CommonCmd[CommonCmd["GAME_ALONE_HIGH_WHEEL"] = 2002] = "GAME_ALONE_HIGH_WHEEL";
        /** 翻牌机 */
        CommonCmd[CommonCmd["GAME_FACE_UP"] = 3001] = "GAME_FACE_UP";
        /** 单机轮盘 */
        CommonCmd[CommonCmd["GAME_ALONE_ROULETTE"] = 3002] = "GAME_ALONE_ROULETTE";
        /** 动物园 */
        CommonCmd[CommonCmd["GAME_ZOO"] = 3003] = "GAME_ZOO";
        /** 轮盘 */
        CommonCmd[CommonCmd["GAME_ROULETTE"] = 3005] = "GAME_ROULETTE";
        /** 百家乐单机版 */
        CommonCmd[CommonCmd["GAME_ALONE_BACCARAT"] = 3006] = "GAME_ALONE_BACCARAT";
        /** 翻牌机单机版 */
        CommonCmd[CommonCmd["GAME_ALONE_FACEUP"] = 3007] = "GAME_ALONE_FACEUP";
        /** 49游戏 */
        CommonCmd[CommonCmd["GAME_FOUR_NINE"] = 3008] = "GAME_FOUR_NINE";
        /** 捕鱼游戏 */
        CommonCmd[CommonCmd["GAME_FISHING"] = 3009] = "GAME_FISHING";
        /** 足球老虎机 */
        CommonCmd[CommonCmd["GAME_FOOTBALL_SLOT_MACHINES"] = 3010] = "GAME_FOOTBALL_SLOT_MACHINES";
        /** 体育足彩 */
        CommonCmd[CommonCmd["GAME_SPORTS"] = 10000] = "GAME_SPORTS";
        /** 虚拟体育 */
        CommonCmd[CommonCmd["GAME_VIRTUAL_SPORTS"] = 10001] = "GAME_VIRTUAL_SPORTS";
        /** 游客模式玩游戏到达最大值 提示玩真钱 */
        CommonCmd[CommonCmd["GUEST_MAX_PLAY_COUNT"] = 15] = "GUEST_MAX_PLAY_COUNT";
        /** web端玩游戏到达最大值 提示下载app */
        CommonCmd[CommonCmd["WEB_MAX_PLAY_COUNT"] = 100] = "WEB_MAX_PLAY_COUNT";
        /** 水果机最大下注值 */
        CommonCmd[CommonCmd["FRUIT_MAX_BET"] = 1000] = "FRUIT_MAX_BET";
        /** 大转盘最大下注值 */
        CommonCmd[CommonCmd["WHEEL_MAX_BET"] = 1000] = "WHEEL_MAX_BET";
        /** 百家乐最大下注值 */
        CommonCmd[CommonCmd["BACCARAT_MAX_BET"] = 5000] = "BACCARAT_MAX_BET";
        /** 动物园最大下注值 */
        CommonCmd[CommonCmd["ZOO_MAX_BET"] = 1000] = "ZOO_MAX_BET";
        // 开奖
        /** 大满贯  全部中大的（除苹果核BAR）*/
        CommonCmd[CommonCmd["GRAND_SLAM"] = 1] = "GRAND_SLAM";
        /** 大火车   5节火车*/
        CommonCmd[CommonCmd["MAX_CHOOCHOO"] = 2] = "MAX_CHOOCHOO";
        /** 小火车   3节火车*/
        CommonCmd[CommonCmd["MIN_CHOOCHOO"] = 3] = "MIN_CHOOCHOO";
        /** 大三元   中三个大结果*/
        CommonCmd[CommonCmd["DA_SAN_YUAN"] = 4] = "DA_SAN_YUAN";
        /** 小满贯  全部中小的（除苹果核BAR）*/
        CommonCmd[CommonCmd["LITTLE_SLAM"] = 5] = "LITTLE_SLAM";
        /** 小三元 */
        CommonCmd[CommonCmd["XIAO_SAN_YUAN"] = 6] = "XIAO_SAN_YUAN";
        /** 大四喜  中四个苹果*/
        CommonCmd[CommonCmd["DA_SI_XI"] = 7] = "DA_SI_XI";
        /** 随机送灯  随机反弹一个结果*/
        CommonCmd[CommonCmd["RANDOM"] = 8] = "RANDOM";
        // 金币模式
        /** 金币 */
        CommonCmd[CommonCmd["GAME_MONEY_TYPE_COINS"] = 2] = "GAME_MONEY_TYPE_COINS";
        /** 赠送金 */
        CommonCmd[CommonCmd["GAME_MONEY_TYPE_GIFT"] = 3] = "GAME_MONEY_TYPE_GIFT";
    })(CommonCmd = gameLib.CommonCmd || (gameLib.CommonCmd = {}));
    /** 通信命令 */
    let Cmd;
    (function (Cmd) {
        /** 大厅socket房间号 */
        Cmd[Cmd["PROT_HOME"] = 999999] = "PROT_HOME";
        /** 聊天内容 */
        Cmd[Cmd["SOCKET_CHAT_MESSAGE"] = 1] = "SOCKET_CHAT_MESSAGE";
        /** 中奖信息公告 */
        Cmd[Cmd["SOCKET_WIN_INFO"] = 2] = "SOCKET_WIN_INFO";
        /** 在线人数 */
        Cmd[Cmd["SOCKET_ROOM_MONEY_MESSAGE"] = 3] = "SOCKET_ROOM_MONEY_MESSAGE";
        /** 充值状态 */
        Cmd[Cmd["SOCKET_RECHARGE_STATUS"] = 4] = "SOCKET_RECHARGE_STATUS";
        /** 余额变化 */
        Cmd[Cmd["SOCKET_MONEY_CHANGE"] = 1001] = "SOCKET_MONEY_CHANGE";
        /** 黄金变化 */
        Cmd[Cmd["SOCKET_GOLD_CHANGE"] = 1002] = "SOCKET_GOLD_CHANGE";
        /** 充值成功 */
        Cmd[Cmd["SOCKET_TOP_UP_CHANGE"] = 1004] = "SOCKET_TOP_UP_CHANGE";
        /** 显示广播消息 */
        Cmd[Cmd["SOCKET_SHOW_NOTICE"] = 12] = "SOCKET_SHOW_NOTICE";
    })(Cmd = gameLib.Cmd || (gameLib.Cmd = {}));
    class HttpCode {
    }
    /**
     * 正确返回代码
     * @default 200
     */
    HttpCode.OK = 200;
    /**
     * 需要登录
     * @default 300
     */
    HttpCode.LOGIN_INVALIDITY = 300;
    /**
     * 游戏暂停
     * @default 8003
     */
    HttpCode.GAME_PAUSE = 8003;
    /**
     * 资金不足
     * @default 5002
     */
    HttpCode.GAME_INSUFFICIENT_BALANCE = 5002;
    /**
     * 当前游戏不可投注
     * @default 8002
     */
    HttpCode.GAME_CANNOT_BET = 8002;
    /**
     * 游戏已关闭
     * @default 8003
     */
    HttpCode.GAME_OFF = 8003;
    /**
     * 投注失败
     * @default 8004
     */
    HttpCode.GAME_BET_FAIL = 8004;
    gameLib.HttpCode = HttpCode;
    class Urls {
    }
    /** 获取服务器时间 */
    Urls.GAME_SERVER_TIME = "/game/server-time";
    /** 优惠券投注 */
    Urls.URL_COUPON_BET = "/game/coupon/bet";
    /** 获取用户信息 */
    Urls.URL_USER_INFO = "/user/info";
    /** 获取用户账户金额 */
    Urls.URL_USER_ACCOUNT_ASSET = "/account/asset";
    /** gift 抽奖开奖结果 */
    Urls.URL_GAME_SCRATCHER_LOTTERY = "/game/scratcher/handle";
    /** 获取所有优惠券 */
    Urls.URL_GAME_ALL_COUPON = "/coupon/all";
    gameLib.Urls = Urls;
    /** socket管理 */
    class SocketManager extends tsCore.ESocket {
        constructor() {
            super(...arguments);
            /** 接受到的消息 */
            this.receiveData = [];
        }
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new SocketManager());
            return this._instance;
        }
        /**
         * 链接服务器socket
         * @param roomId 房间号
         * @param token token
         * @param userId 用户id 默认 110
         * @param url 连接地址 如果不存在 会使用 window.socketUrl
         */
        connect(roomId, token, userId = 110, url) {
            if (this.isConnect) {
                this.close();
            }
            this.isConnect = true;
            if (tsCore.StringUtil.isEmpty(url))
                url = Laya.Browser.window.socketUrl;
            this.customUrl && (url = runFun(this.customUrl, url));
            this._roomId = roomId;
            let obj = {
                auth: { rid: this._roomId, uid: userId },
                notify: this.onMessageReceived.bind(this),
                url: url,
                token: token
            };
            // tsCore.SocketClient.SOCKET_CLASS_PATH = "com.casino.GameSocket"
            tsCore.SocketClient.SOCKET_CLASS_PATH = null;
            // 初始化IM客户端库
            this._client = new SocketManager.SocketClass(obj);
            Laya.timer.loop(200, this, this.sendData);
        }
        sendData() {
            if (this.receiveData.length > 0 && this.isConnect) {
                let data;
                let len = this.receiveData.length;
                for (let i = 0; i < len; i++) {
                    data = this.receiveData.shift();
                    let msg = data.message;
                    let roomId = msg.roomId;
                    let obj = msg.data;
                    let type = msg.type;
                    this.sendEventManager(type, obj);
                }
            }
        }
        /** 关闭链接 */
        /*@override*/
        close() {
            tsCore.Log.debug("close socket");
            Laya.timer.clear(this, this.sendData);
            this._roomId = -1;
            if (this._client)
                this._client.alive = false;
            if (this._client)
                this._client.close();
            this._client = null;
            this.receiveData.splice(0, this.receiveData.length);
            super.close();
        }
        /** 服务器发来消息 */
        onMessageReceived(data) {
            if (!this.isConnect) {
                return;
            }
            this.receiveData.push(data);
        }
        closeHandler(msg = null) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.closeHandler(msg);
        }
        messageHandler(evt) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.messageHandler(evt);
        }
        errorHandler(e) {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.errorHandler(e);
        }
        openHandler() {
            var _a;
            (_a = this._client) === null || _a === void 0 ? void 0 : _a.openHandler();
        }
        get roomId() {
            return this._roomId;
        }
        test(value) {
            if (typeof value == "string") {
                tsCore.Log.debug("string=" + JSON.stringify(value));
            }
            else {
                tsCore.Log.debug("json=" + JSON.stringify(value));
            }
        }
    }
    SocketManager.SocketClass = tsCore.SocketClient;
    gameLib.SocketManager = SocketManager;
    /**
     * url 参数
     */
    class UrlParam {
        constructor(defaults) {
            /** 0:ai  1:people 2:friend */
            this._playWith = "1";
            /** 是否是赠送金 0 没有 1 有 */
            this._isGift = 0;
            /** 是否是debug模式 */
            this.debug = false;
            this._country = defaults === null || defaults === void 0 ? void 0 : defaults.country;
            this._language = defaults === null || defaults === void 0 ? void 0 : defaults.language;
            this.channel = defaults === null || defaults === void 0 ? void 0 : defaults.channel;
            this.debug = !!(defaults === null || defaults === void 0 ? void 0 : defaults.debug);
            this.parseData(null);
            if (Player.inst.isWeb) {
                let url = window.location.href;
                let newUrl = url.split("?")[0];
                let clearCache = Laya.Utils.getQueryString("clearCache");
                if (clearCache) {
                    let request = tsCore.UtilKit.getRequest();
                    delete request["clearCache"];
                    localStorage.clear();
                    let param = "?";
                    let index = 0;
                    for (let key in request) {
                        if (index == 0) {
                            param += key + "=" + request[key];
                        }
                        else {
                            param += "&" + key + "=" + request[key];
                        }
                        index++;
                    }
                    tsCore.Log.debug(`clear cache reload ${newUrl + param}`);
                    window.location.replace(newUrl + param);
                }
                //        if (Browser.window.location.protocol != "http:" && !Laya.Render.isConchApp)
                //            Browser.window.history.pushState(null, null, newUrl)
            }
        }
        parseData(json) {
            Player.inst.parseParam = json;
            // 获取链接附带参数
            let isweb = this.getValue(json, "isweb");
            isweb !== null && isweb !== void 0 ? isweb : (isweb = Laya.Render.isConchApp ? "false" : "true");
            Player.inst.isWeb = (isweb != "false");
            let isGuest = this.getValue(json, "isGuest", "demo");
            if (!tsCore.StringUtil.isEmpty(isGuest)) {
                Player.inst.isGuest = isGuest == "true";
            }
            let debug = this.getValue(json, "debug");
            if (debug) {
                this.debug = debug == "true";
            }
            let token = this.getValue(json, "token");
            if (token) {
                Player.inst.token = token;
            }
            let tempChannel = this.getValue(json, "channel");
            if (!!tempChannel)
                this.channel = tempChannel;
            let tempCountry = this.getValue(json, "country");
            if (!tsCore.StringUtil.isEmpty(tempCountry))
                this._country = tempCountry;
            let tempLanguage = this.getValue(json, "language", "lang");
            if (!tsCore.StringUtil.isEmpty(tempLanguage))
                this._language = tempLanguage;
            let tempIsGift = this.getValue(json, "isGift");
            if (!tsCore.StringUtil.isEmpty(tempIsGift))
                this._isGift = Laya.Utils.parseInt(tempIsGift);
            let isCall = this.getValue(json, "isCall");
            if (!tsCore.StringUtil.isEmpty(isCall))
                SceneManager.inst.isCall = !(isCall === "false");
            let tempPlayWith = this.getValue(json, "playWith");
            if (!tsCore.StringUtil.isEmpty(tempPlayWith))
                this._playWith = tempPlayWith;
            let tempRoomId = this.getValue(json, "roomId");
            if (!tsCore.StringUtil.isEmpty(tempRoomId))
                this._roomId = tempRoomId;
            let tempRole = this.getValue(json, "role");
            if (!tsCore.StringUtil.isEmpty(tempRole))
                this._role = Laya.Utils.parseInt(tempRole);
            let tempAmount = this.getValue(json, "amount");
            if (!tsCore.StringUtil.isEmpty(tempAmount))
                this._amount = tempAmount;
            let tempInviteCode = this.getValue(json, "invite_code");
            if (!tsCore.StringUtil.isEmpty(tempInviteCode))
                this._inviteCode = tempInviteCode;
            let tempMusicMuted = this.getValue(json, "musicMuted");
            if (!tsCore.StringUtil.isEmpty(tempMusicMuted))
                Laya.SoundManager.musicMuted = tempMusicMuted == "true";
            let tempSoundMuted = this.getValue(json, "soundMuted");
            if (!tsCore.StringUtil.isEmpty(tempSoundMuted))
                Laya.SoundManager.soundMuted = tempSoundMuted == "true";
            // 游戏id
            let tempOpenGame = this.getValue(json, "openGame", "gameId");
            // 游戏名字
            let tempGameName = this.getValue(json, "gameName");
            if (!tsCore.StringUtil.isEmpty(tempOpenGame) || !tsCore.StringUtil.isEmpty(tempGameName)) {
                this.openGame = tempOpenGame;
                AppRecordManager.executeJson = { type: 2, data: Laya.Utils.parseInt(this.openGame), gameName: tempGameName };
            }
        }
        getValue(json, ...keys) {
            let value;
            for (const key of keys) {
                if (json && key in json) {
                    value = json[key] + "";
                    break;
                }
                else {
                    value = Laya.Utils.getQueryString(key);
                    if (value)
                        break;
                }
            }
            return value;
        }
        get amount() {
            return this._amount;
        }
        get inviteCode() {
            return this._inviteCode;
        }
        /**
         * 是否是直接指定页面
         * @return
         */
        isJumpPage() {
            return AppRecordManager.executeJson != null;
        }
        /**
         * 清理跳转记录
         */
        clearJumpPage() {
            this.openGame = null;
        }
        get country() {
            return this._country;
        }
        get language() {
            return this._language;
        }
        get playWith() {
            return this._playWith;
        }
        set playWith(value) {
            this._playWith = value;
        }
        set roomId(value) {
            this._roomId = value;
        }
        get roomId() {
            return this._roomId;
        }
        get role() {
            return this._role;
        }
        set role(value) {
            this._role = value;
        }
        get isGift() {
            return this._isGift;
        }
        set isGift(value) {
            this._isGift = value;
        }
    }
    gameLib.UrlParam = UrlParam;
    /** 用户数据 */
    class Player {
        constructor() {
            /** 渠道名字 */
            this.channelName = "wap";
            this._icon = "ui://cw0f8xaqgn9s6x";
            /** 玩家身上主账户的钱 */
            this.money = 0;
            /** 金币 */
            this.coins = 0;
            /** 玩家身上赠送的钱 */
            this.freeBet = 0;
            /** 缓存玩家身上的钱 */
            this.cacheMoney = 0;
            /**
             * 玩家昵称
             * @default admin
             */
            this.nickname = "admin";
            /**
             * 玩家id
             * @default 100
             */
            this.userId = 110;
            /**
             * 游戏类型  id
             * @default -1
             */
            this.gameId = -1;
            /**
             *  是否是web端口
             *  @default true
             *  @deprecated
             */
            this.isWeb = true;
            /** 游戏发布版本号 */
            this.codeVersion = 1;
            /** 当前app游戏发布版本号 */
            this.currentAppVersion = 1;
            /** 本玩家今日玩的次数 */
            this.playCount = 0;
            /**
             * 用户持有的优惠劵
             **/
            this.coupons = [];
            // 大奖参数
            /** 用户拥有的奖金池  */
            this.jackpotData = [];
            /** 用户的真实投注 */
            this.userReallyBet = 0;
            /** 每次投注达到多少 就可以获得刮刮卡 */
            this.getTicketIncBet = 100;
            /** 当前游戏的奖金池 */
            this.gamePool = tsCore.MathKit.random(1000, 99999);
            /** 获得奖励的次数 */
            this.jackpotCount = 0;
        }
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new Player());
            return this._instance;
        }
        /**
         * 游戏类型  id
         * @default -1
         * @deprecated
         * @see gameId
         */
        set gameModel(value) {
            this.gameId = value;
        }
        /**
         * 游戏类型  id
         * @default -1
         * @deprecated
         * @see gameId
         */
        get gameModel() {
            return this.gameId;
        }
        /**
         * 获取游客模式的优惠券
         */
        getGuestCoupons() {
            return window["guestCoupons"];
        }
        /**
         * 设置当前拥有的优惠券
         * @param value 新优惠券
         */
        addCoupons(value) {
            this.coupons = value;
        }
        /** 获取所有的优惠券 */
        getCoupons() {
            return this.coupons;
        }
        /**
         * 根据优惠劵类型  获取优惠劵
         * @param type 1抵用券 2投注劵
         * @return
         */
        getCoupon(type) {
            let temps = [];
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.type == type && arr.num > 0) {
                    temps.push(arr);
                }
            }
            return temps;
        }
        /**
         * 根据游戏ID  获取优惠劵
         * @param gameId 游戏ID 默认使用 Player.inst.gameId
         * @return
         */
        getCouponGame(gameId) {
            gameId !== null && gameId !== void 0 ? gameId : (gameId = Player.inst.gameId);
            let temps = [];
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.games.indexOf(gameId) != -1 && arr.num > 0) {
                    temps.push(arr);
                }
            }
            return temps;
        }
        /** 使用活动劵的次数 */
        useCouponNum() {
            let useObj = this.getUseCoupon();
            if (useObj && useObj.num > 0) {
                useObj.num -= 1;
            }
        }
        /**
         * 获取正在使用的优惠劵
         * @return
         */
        getUseCoupon() {
            let useObj = null;
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.isUse) {
                    useObj = arr;
                }
            }
            return useObj;
        }
        /**
         * 获取正在使用的优惠劵
         */
        removeCoupon(obj) {
            for (let i = 0; i < this.coupons.length; i++) {
                let arr = this.coupons[i];
                if (arr.id == obj.id) {
                    this.coupons.splice(i, 1);
                    break;
                }
            }
        }
        /**
         * 判断当前游戏可有使用的优惠券
         */
        getCanUseCoupon() {
            let betValue = Player.inst.gameData.getTotalBetMoney();
            let arr = Player.inst.getCouponGame(Player.inst.gameId);
            for (let i = 0; i < arr.length; i++) {
                const useObj = arr[i];
                if (useObj.type == 1) { // 判断是否有可以使用的抵用券
                    if (useObj.bet_limit == useObj.faceValue || useObj.bet_limit <= betValue) { // 满足最低投注额
                        return true;
                    }
                }
                else if (useObj.type == 2) {
                    return true;
                }
            }
            return false;
        }
        /** 停止所有的优惠价使用 */
        stopAllCoupon() {
            for (let i = 0; i < this.coupons.length; i++) {
                let obj = this.coupons[i];
                obj.isUse = false;
            }
        }
        /** 获取请求发送的  token */
        getRequestToken() {
            return "token=" + this.token;
        }
        /** 玩家头像 */
        get icon() {
            return this._icon;
        }
        /**
         * @private
         */
        set icon(value) {
            this._icon = value;
        }
        /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
        get status() {
            return this._status;
        }
        /**
         */
        set status(value) {
            this._status = value;
        }
        windowOpen(url) {
            let wd = window.open(url);
            if (!wd) {
                window.location.href = url;
            }
        }
        get guestModel() {
            return this._guestModel;
        }
        set guestModel(value) {
            this._guestModel = value;
            this._guestModel.guestUID = tsCore.MathKit.random(1, 99999999) * 1000;
        }
        /**
         * 获取设备号
         * @return
         */
        getDevice() {
            let device;
            if (Laya.Render.isConchApp) {
                device = Player.inst.device;
            }
            else {
                device = Laya.Browser.userAgent;
            }
            return device;
        }
        /**
         * 保存账号密码
         * @param login
         * @param psd
         */
        saveUser(login, psd) {
            let user = { name: login, psd: psd };
            let s = tsCore.UtilKit.encrypt(JSON.stringify(user));
            Laya.LocalStorage.setItem("userData", s);
        }
        /**
         * 获取渠道type
         * @return
         */
        getChannelType() {
            return Laya.Render.isConchApp ? 3 : 1; // 如果是app端 3
        }
        /**
         * 获取当前国家的货币单位(大写)
         */
        getCurrencyUnit() {
            let currencyMap = tsCore.ConfigKit.get("currencyUnit");
            let unit = "";
            if (currencyMap) {
                let country = this.data.getCountry(this.urlParam);
                if (!tsCore.StringUtil.isEmpty(country)) {
                    unit = currencyMap[country];
                }
            }
            return unit;
        }
        /**
         * 获取当前国家的货币单位(首字母大写格式化)
         */
        getCurrencyUnitFormat() {
            return this.getCurrencyUnit().toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        }
    }
    gameLib.Player = Player;
    /** 卡牌 */
    class Card extends tsCore.ELabel {
        constructor() {
            super(...arguments);
            /** 偏移倍数 */
            this.offsetMultiple = 0;
            /** 中心点 */
            this.tempPivot = new Laya.Point();
        }
        init(id) {
            this.code = id;
            this.value = id % 13 + 1;
            this.nameCard = this.value === 1 ? 'A' : this.value === 11 ? 'J' : this.value === 12 ? 'Q' : this.value === 13 ? 'K' : this.value + "";
            this.suit = id / 13 | 0;
            this._suitName = this.suitName(this.suit);
            this.nameCard = this.suit < 4 ? this.nameCard : 'JOKER';
            // var z = (52 - id) / 4
            // Log.debug(value, nameCard, suit)
        }
        suitName(value) {
            // 黑红樱方
            return value === 0 ? 'spades' : value === 1 ? 'hearts' : value === 2 ? 'clubs' : value === 3 ? 'diamonds' : 'joker';
        }
        createUI() {
            this.displayObject.graphics.drawRect(0, 0, 100, 150, "#ffffff", "#000000", 2);
            this.setSize(100, 150);
            let text = new fgui.GBasicTextField();
            text.text = this.nameCard;
            text.fontSize = 30;
            this.addChild(text);
        }
    }
    gameLib.Card = Card;
    class Deck {
        constructor() {
            /** 存放的卡牌 */
            this.cards = [];
            /** 已经完成了动画个数 */
            this.completeNum = 0;
            /** 动画执行次数 */
            this.executeNum = 1;
        }
        createCard() {
            for (let i = 0; i < 54; i++) {
                let card = new Card();
                card.init(i);
                card.createUI();
                card.initX = 400;
                card.initY = 400;
                card.offsetMultiple = .2;
                card.offset = i * card.offsetMultiple;
                card.setXY(card.initX - card.offset, card.initY - card.offset);
                fgui.GRoot.inst.addChild(card);
                this.cards.push(card);
            }
        }
        /**
         * 收集牌
         * @param handler
         * @param sort 是否需要排序
         */
        sort(handler = null, sort = true) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            if (sort) {
                this.cards.sort((a, b) => {
                    return b.code - a.code;
                });
            }
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                let tempPivot = card.tempPivot;
                card.setPivot(tempPivot.x, tempPivot.y);
                card.offset = i * card.offsetMultiple;
                let _delay = i * 10;
                // Log.debug(card.y, card.y + (- card.height * 1.5))
                Laya.Tween.to(card, {
                    x: card.initX - card.offset,
                    y: card.y + (-card.height * 1.5),
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1
                }, _delay, null, Laya.Handler.create(this, (card) => {
                    Laya.Tween.to(card, {
                        x: card.initX - card.offset,
                        y: card.initY - card.offset
                    }, 400, null, Laya.Handler.create(this, () => {
                        this.completeNum++;
                        if (len == this.completeNum) {
                            this.isRun = false;
                            runFun(handler);
                        }
                    }));
                }, [card]));
                Laya.timer.once(200 + _delay, this, this.setChildIndexHandler, [card, i], false);
            }
        }
        /** 展示牌 铺开 */
        bySuit(handler = null) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            this.cards.sort((a, b) => {
                return a.code - b.code;
            });
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                let value = card.value;
                let suit = card.suit;
                let delay = i * 10;
                let posX = -(6.75 - value) * 20 + card.initX;
                let posY = -(1.5 - suit) * (card.height + 5) + card.initY;
                Laya.Tween.to(card, { x: posX, y: posY }, delay, null, Laya.Handler.create(this, (card, i) => {
                    this.setChildIndexHandler(card, i);
                    this.completeNum++;
                    if (this.completeNum == len) {
                        this.isRun = false;
                        handler === null || handler === void 0 ? void 0 : handler.run();
                    }
                }, [card, i]));
            }
        }
        /** 展示牌 */
        fan(handler = null) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.handler = handler;
            this.completeNum = 0;
            let len = this.cards.length;
            for (let i = 0; i < len; i++) {
                let card = this.cards[i];
                card.offset = i / 4;
                let delay = i * 10;
                let rot = i / (len - 1) * 260 - 130;
                card.setPivot(.5, 2.3);
                Laya.Tween.to(card, { x: card.initX - card.offset, y: card.initY - card.offset, rotation: rot }, 300 + delay, null, Laya.Handler.create(this, this.moveHandler, [card]), delay);
            }
        }
        /**
         * 洗牌
         * @param handler 执行完成回调
         * @param num 执行次数 暂未实现
         */
        shuffle(handler = null, num = 1) {
            if (this.isRun)
                return;
            this.isRun = true;
            this.executeNum = num;
            this.handler = handler;
            this.completeNum = 0;
            tsCore.UtilKit.shuffle(this.cards);
            for (let i = 0; i < this.cards.length; i++) {
                let card = this.cards[i];
                card.offset = i * card.offsetMultiple;
                let offsetX = this.plusMinus(Math.random() * 90 + 30) + card.initX;
                let delay = i * 2;
                Laya.Tween.to(card, { x: offsetX, y: card.initY - card.offset }, 200, null, Laya.Handler.create(this, this.moveHandler, [card]), delay);
                Laya.timer.once(100 + delay, this, this.setChildIndexHandler, [card, i], false);
            }
        }
        moveHandler(card) {
            Laya.Tween.to(card, { x: card.initX - card.offset, y: card.initY - card.offset }, 200);
            this.completeNum++;
            if (this.completeNum == this.cards.length) {
                Laya.timer.once(200, this, () => {
                    this.isRun = false;
                    runFun(this.handler);
                });
            }
        }
        plusMinus(value) {
            let plus_minus = Math.round(Math.random()) ? -1 : 1;
            return plus_minus * value;
        }
        setChildIndexHandler(card, index) {
            card.parent.setChildIndex(card, index);
        }
        dispose() {
            for (let i = 0; i < this.cards.length; i++) {
                Laya.Tween.clearAll(this.cards[i]);
            }
            Laya.timer.clearAll(this);
            this.isRun = false;
        }
    }
    gameLib.Deck = Deck;
    /**
     * 拷贝对象
     */
    class CopyObject {
        /**
         * 复制一个 fgui.GLoader 对象
         * @param loader 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyLoader(loader, parent) {
            let newObject = new fgui.GLoader();
            newObject.setPivot(loader.pivotX, loader.pivotY, loader.pivotAsAnchor);
            newObject.setSize(loader.width, loader.height);
            newObject.setScale(loader.scaleX, loader.scaleY);
            newObject.align = loader.align;
            newObject.autoSize = loader.autoSize;
            newObject.fill = loader.fill;
            newObject.icon = loader.icon;
            if (parent) {
                let point = loader.localToGlobal();
                parent.globalToLocal(point.x, point.y, point);
                newObject.setXY(point.x, point.y);
                parent.addChild(newObject);
            }
            else {
                newObject.setXY(loader.x, loader.y);
            }
            return newObject;
        }
        /**
         * 复制一个 fgui.GTextField 对象
         * @param textField 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyTextField(textField, parent) {
            let tf;
            if (textField instanceof fgui.GRichTextField) {
                tf = new fgui.GRichTextField();
            }
            else {
                tf = new fgui.GBasicTextField();
                tf.font = textField["_font"];
                tf.fontSize = textField.fontSize;
                tf.color = textField.color;
                tf.align = textField.align;
                tf.valign = textField.valign;
                tf.leading = textField.leading;
                tf.letterSpacing = textField.letterSpacing;
                tf.ubbEnabled = textField.ubbEnabled;
                tf.autoSize = textField.autoSize;
                tf.underline = textField.underline;
                tf.italic = textField.italic;
                tf.bold = textField.bold;
                tf.singleLine = textField.singleLine;
                tf.strokeColor = textField.strokeColor;
                tf.stroke = textField.stroke;
                tf.setPivot(textField.pivotX, textField.pivotY, textField.pivotAsAnchor);
                tf.setSize(textField.width, textField.height);
                tf.setScale(textField.scaleX, textField.scaleY);
                tf.text = textField.text;
                if (parent) {
                    let point = textField.localToGlobal();
                    parent.globalToLocal(point.x, point.y, point);
                    tf.setXY(point.x, point.y);
                    parent.addChild(tf);
                }
                else {
                    tf.setXY(textField.x, textField.y);
                }
            }
            return tf;
        }
    }
    gameLib.CopyObject = CopyObject;
    class CounterUtils {
        static create(total, complete) {
            return new Counter(complete, total);
        }
    }
    gameLib.CounterUtils = CounterUtils;
    class Counter {
        constructor(complete, total) {
            this.total = 0;
            this._index = 0;
            this.complete = complete;
            this.total = total;
        }
        /** 完成一次计数 */
        oneComplete() {
            this._index++;
            if (this._index == this.total)
                runFun(this.complete);
        }
        get index() {
            return this._index;
        }
        dispose() {
            this.complete = null;
        }
    }
    /**
     * 水果机旋转动画
     * @author boge
     *
     */
    class FruitRotationUtils {
        constructor(fruit) {
            /** 跑帧位置 */
            this.currentRunIndex = 0;
            /** 上次时间 */
            this.oldTimer = 0;
            /** 间隔时间 */
            this.spaceTimer = 500;
            /** 开始位置 */
            this.startIndex = 0;
            /** 预计演播跑灯圈数 */
            this.runCount = 0;
            /** 当前跑动圈数 */
            this.currentRunCount = 0;
            /** 奖励 */
            this.awards = [];
            /** 预选位置偏移量 */
            this.preselectionOffset = 4;
            this.fruit = fruit;
        }
        /**
         *
         * @param arr 奖励
         * @param runCallback 运行调用函数
         * @param selectedCallback 选定阶段调用函数
         * @param playRunSlotEndCallback 结束调用函数
         * @param runEndCallback 结束调用函数
         */
        startRun(arr, runCallback, selectedCallback, playRunSlotEndCallback, runEndCallback) {
            this.awards = arr;
            this.runCallback = runCallback;
            this.selectedCallback = selectedCallback;
            this.playRunSlotEndCallback = playRunSlotEndCallback;
            this.runEndCallback = runEndCallback;
            this.catapultDirection = true;
            // 重置
            this.oldTimer = 0;
            this.spaceTimer = 300;
            // 计算预告结束位置
            let value = this.awards[0] - this.preselectionOffset;
            if (value < 0)
                value = this.fruit.fruitLen() + value;
            this.startIndex = value; // 预告结束位置
            this.runCount = 5;
            this.currentRunCount = 0;
            this.isRunEnd = false;
            Laya.timer.frameLoop(1, this, this.runHandler);
        }
        runHandler() {
            let newTimer = Laya.Browser.now();
            if (newTimer - this.oldTimer >= this.spaceTimer) { //1s
                this.oldTimer = newTimer;
                runFun(this.runCallback);
                this.fruit.showSlotIndex(this.currentRunIndex, this.isRunEnd ? 0 : 3);
                // 计算圈数
                if (this.currentRunIndex == this.startIndex) { // 判断是否进入预告结束位置
                    this.currentRunCount++;
                    if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于5圈
                        this.isRunEnd = true; //进入选定阶段
                        runFun(this.selectedCallback);
                    }
                }
                if (this.isRunEnd) { // 如果是选定阶段
                    this.spaceTimer = this.spaceTimer + 120; //递增间隔滚动
                    if (this.spaceTimer > 530) { // 最高延迟速度
                        this.spaceTimer = 530;
                    }
                    // 当前滚动值等于最终值
                    if (this.currentRunIndex == this.awards[0]) {
                        Laya.timer.clear(this, this.runHandler);
                        runFun(this.playRunSlotEndCallback);
                        this.checkAward();
                    }
                }
                else {
                    this.spaceTimer = this.spaceTimer - 30;
                    if (this.spaceTimer < 0) {
                        this.spaceTimer = 0;
                    }
                }
                // 计算下一次跑动坐标
                this.currentRunIndex++;
                if (this.currentRunIndex >= this.fruit.fruitLen()) {
                    this.currentRunIndex = 0;
                }
            }
        }
        checkAward() {
            let value;
            if (this.awards.length == 1) { // 判断数量 正常得分   或  特殊奖励  开启失败
                this.runEnd();
            }
            else if (this.awards.length > 1) { // 数量大于1  说明存在  多个奖励
                value = this.awards[0];
                Laya.timer.once(600, this, () => {
                    //					if (value == 9 || value == 21) { // 特殊奖励
                    //						fruitScene.twinkleAllFruits()
                    //						tsCore.SoundUtils.playSound(URL.formatURL("sounds/bomb.ogg"))
                    //						Laya.timer.once(1000, this, function() {
                    //							fruitScene.stopAllTwinkleFruits()
                    ////							tsCore.SoundUtils.playMusic(URL.formatURL("sounds/background_turnning.mp3"))
                    //							Laya.timer.once(500, this, function()  {
                    //								if (awardType == CommonCmd.GRAND_SLAM) { // 大满贯
                    //									baodeng(awards.slice(1))
                    //								} else {
                    //									catapult(value, awards.slice(1), 1)
                    //								}
                    //							})
                    //						})
                    //					} else {
                    this.fruit.twinkleFruits(value, 3, () => {
                        tsCore.SoundUtils.playMusic(Laya.URL.basePath + "sounds/background_turnning.mp3");
                        this.fruit.stopTwinkleFruits(value);
                        this.fruit.wakey(value);
                        //							trace("FruitModel.enclosing_method()", value)
                        Laya.timer.once(500, this, () => {
                            this.catapult(value, this.awards.slice(1), 1);
                        });
                    });
                    //					}
                });
            }
        }
        runEnd() {
            runFun(this.runEndCallback);
        }
        /**
         * 弹射动画
         * @param startIndex 击打起始位置
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        catapult(startIndex, array, runCount = 0, huoche = false) {
            if (array.length > 0) {
                let value; // 选中位置
                if (huoche) {
                    value = array.pop();
                }
                else {
                    value = array.shift();
                }
                this.oldTimer = 0;
                this.spaceTimer = 20;
                this.currentRunIndex = startIndex;
                this.currentRunCount = 0;
                this.isRunEnd = false;
                this.runCount = 0;
                if (runCount != 0) {
                    this.runCount = runCount + 1;
                }
                Laya.timer.frameLoop(1, this, this.runCatapultHandler, [startIndex, value, array, runCount, huoche]);
            }
            else {
                // 击打结束
                //				trace("FruitModel.catapult(startIndex, array) 结束  开下一局")
                this.runEnd();
            }
        }
        /**
         * 弹击函数
         * @param startIndex 击打起始位置
         * @param value 当前选中的值
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        runCatapultHandler(startIndex, value, array, runCount = 0, huoche = false) {
            let newTimer = Laya.Browser.now();
            if (newTimer - this.oldTimer >= this.spaceTimer) { //满足当前间隔时间
                this.oldTimer = newTimer;
                let tail = array.length;
                //				tail = tail>5?5:tail
                this.fruit.showSlotIndex(this.currentRunIndex, tail, this.catapultDirection);
                // 计算圈数
                if (this.currentRunIndex == startIndex) { // 判断是否进入预告结束位置
                    this.currentRunCount++;
                    if (this.currentRunCount >= this.runCount) { // 跑动圈数大于等于预计演播跑灯圈数
                        this.isRunEnd = true; //进入选定阶段
                    }
                }
                if (this.isRunEnd) { // 如果是选定阶段
                    if (value == this.currentRunIndex) { // 走到了指定位置
                        //						if (awardType == 0) {
                        //							
                        //						}
                        Laya.timer.clear(this, this.runCatapultHandler);
                        tsCore.SoundUtils.playSound(Laya.URL.basePath + "sounds/zha.ogg");
                        if (huoche) {
                            array.splice(0, array.length);
                            this.fruit.allTailLight();
                            this.catapult(value, array, runCount);
                        }
                        else {
                            this.catapultDirection = !this.catapultDirection;
                            //							trace("FruitModel.runCatapultHandler()", catapultDirection)
                            //							let isWin:boolean = hitFruit(value)
                            this.fruit.stopAllTail();
                            this.fruit.twinkleFruits(value, 3, () => {
                                this.fruit.stopTwinkleFruits(value);
                                this.fruit.wakey(value);
                                this.catapult(value, array, runCount);
                            });
                        }
                        return;
                    }
                }
                // 计算下一次跑动坐标
                if (this.catapultDirection) {
                    this.currentRunIndex++;
                }
                else {
                    this.currentRunIndex--;
                }
                if (this.currentRunIndex >= this.fruit.fruitLen()) {
                    this.currentRunIndex = 0;
                }
                else if (this.currentRunIndex < 0) {
                    this.currentRunIndex = this.fruit.fruitLen() - 1;
                }
            }
        }
        stop() {
            Laya.timer.clearAll(this);
        }
        /** 跑帧位置 */
        getCurrentRunIndex() {
            return this.currentRunIndex;
        }
        /** 跑动是否结束了 */
        getIsRunEnd() {
            return this.isRunEnd;
        }
    }
    gameLib.FruitRotationUtils = FruitRotationUtils;
    /**
     * 金币动画
     */
    class GoldAniUtils {
        constructor(icon, parent, sound) {
            this.loaders = [];
            this.count = 0;
            /** 宽 */
            this.goldW = 70;
            /** 高 */
            this.goldH = 70;
            this.icon = icon || GoldAniUtils.defaultIcon;
            this.parent = parent || GoldAniUtils.defaultScene;
            this.sound = sound || GoldAniUtils.defaultSound;
        }
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param startObject 开始对象 如果传入null 将用舞台中心做为起点
         * @param endObject 结束对象
         * @param endHandler 结束回调
         * @deprecated
         * @see play
         */
        playObject(num, startObject, endObject, endHandler) {
            this.play(num, startObject, endObject, endHandler);
        }
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param start 开始位置
         * @param end 结束位置
         * @param complete 结束回调
         */
        play(num, start, end, complete) {
            var _a;
            if (!start) {
                this.startPoint = Laya.Point.create().setTo((this.scene.width >> 1), (this.scene.height >> 1));
            }
            else if (start instanceof fgui.GObject) {
                if (start.isDisposed || !start.displayObject) {
                    this.startPoint = Laya.Point.create().setTo((this.scene.width >> 1), (this.scene.height >> 1));
                }
                else {
                    this.startPoint = start.localToGlobal();
                    this.globalToLocal(this.startPoint);
                    this.startPoint.x += start.width / 2;
                    this.startPoint.y += start.height / 2;
                }
            }
            else
                this.startPoint = start;
            if (end instanceof fgui.GObject) {
                this.endPoint = end.localToGlobal();
                this.globalToLocal(this.endPoint);
                this.endPoint.x += end.width / 2;
                this.endPoint.y += end.height / 2;
            }
            else
                this.endPoint = end;
            this.completeFun = complete;
            this.specialAward(num);
            (_a = this.startPoint) === null || _a === void 0 ? void 0 : _a.recover();
            if (this.sound instanceof Laya.Sound) {
                this.sound.play();
            }
            else
                tsCore.SoundUtils.playSound(this.sound);
        }
        /**
         * 特殊奖品 效果 - 移动至底部然后飘直指定位置
         * @param len 创建数量
         * @internal
         */
        specialAward(len) {
            this.count = 0;
            this.clearGoldLoader();
            for (let i = 0; i < len; i++) {
                let loader = GoldLoader.create();
                loader.icon = this.icon;
                loader.setSize(this.goldW, this.goldH);
                loader.setXY(this.startPoint.x, this.startPoint.y);
                let tempX = this.startPoint.x + Math.random() * 250 - 125;
                let tempY = this.startPoint.y + Math.random() * 50 + 100;
                let endP = Laya.Point.create().setTo(this.endPoint.x - loader.width / 2, this.endPoint.y - loader.height / 2);
                loader.setStartPoint(tempX, tempY);
                loader.setMiddlePoint(tempX + (endP.x - tempX) / 2 + tsCore.MathKit.random(200, 300), tempY + (endP.y - tempY) / 2 + tsCore.MathKit.random(0, 100));
                loader.setEndPoint(endP.x, endP.y);
                this.addChild(loader);
                this.loaders.push(loader);
                endP.recover();
                loader.timeLine(this.onPlayAwardEnd.bind(this))
                    .to({ x: tempX, y: tempY }, 600, Laya.Ease.backOut, i * 5)
                    .to({ t: 1, scaleX: .7, scaleY: .7 }, 600, Laya.Ease.linearNone, i * 5)
                    .to({ visible: 0 }, 0)
                    .play();
            }
        }
        onPlayAwardEnd() {
            this.count++;
            if (this.count == this.loaders.length) {
                this.clearGoldLoader();
                runFun(this.completeFun);
            }
        }
        /************************************  普通金币掉落动画  ***********************************/
        /**
         * 播放移动目标到指定目标位置
         * @param targetObject 要被移动的对象
         * @param endObject 结束对象
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldAni(targetObject, endObject, endHandler, parent, props) {
            parent !== null && parent !== void 0 ? parent : (parent = this.scene);
            let endGlobal = endObject.localToGlobal();
            parent.globalToLocal(endGlobal.x, endGlobal.y, endGlobal);
            let targetGlobal = targetObject.localToGlobal();
            parent.globalToLocal(targetGlobal.x, targetGlobal.y, targetGlobal);
            this.playGoldPointAni(targetObject, targetGlobal, endGlobal, endHandler, parent, props);
        }
        /**
         * 播放移动目标到指定位置
         * @param targetObject 要被移动的对象
         * @param startPoint 起始位置
         * @param endPoint 结束位置
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldPointAni(targetObject, startPoint, endPoint, endHandler, parent, props) {
            var _a, _b, _c, _d;
            parent !== null && parent !== void 0 ? parent : (parent = this.scene);
            props !== null && props !== void 0 ? props : (props = {});
            targetObject.setXY(startPoint.x, startPoint.y);
            parent.addChild(targetObject);
            props.x = endPoint.x;
            props.y = endPoint.y;
            (_a = props.scaleX) !== null && _a !== void 0 ? _a : (props.scaleX = .5);
            (_b = props.scaleY) !== null && _b !== void 0 ? _b : (props.scaleY = .5);
            let duration = (_c = props.duration) !== null && _c !== void 0 ? _c : 600;
            let delay = (_d = props.delay) !== null && _d !== void 0 ? _d : 0;
            let ease = props.ease;
            this.goldTween = Laya.Tween.to(targetObject, props, duration, ease, Laya.Handler.create(this, (endHandler) => {
                this.goldTween = null;
                runFun(endHandler);
            }, [endHandler]), delay);
        }
        addChild(child) {
            return this.scene.addChild(child);
        }
        globalToLocal(target) {
            this.scene.globalToLocal(target.x, target.y, target);
        }
        get scene() {
            return this.parent || SceneManager.inst.scene || fgui.GRoot.inst;
        }
        clearGoldLoader() {
            while (this.loaders.length) {
                this.loaders.shift().recover();
            }
        }
        dispose() {
            var _a;
            this.clearGoldLoader();
            (_a = this.goldTween) === null || _a === void 0 ? void 0 : _a.clear();
        }
    }
    /**
     * 默认声音
     */
    GoldAniUtils.defaultSound = "sounds/gold.ogg";
    gameLib.GoldAniUtils = GoldAniUtils;
    class JSUtils {
        /**
         * 刷新页面  如果有父页面  刷新父页面
         */
        static reloadAll() {
            if (Laya.Browser.window.parent) {
                Laya.Browser.window.parent.location.reload();
            }
            else {
                Laya.Browser.window.location.reload();
            }
        }
        /** 刷新 */
        static reload() {
            Laya.Browser.window.location.reload();
        }
        /** 进入登录界面 */
        static login() {
            JSUtils.openPage("/login");
        }
        /** 充值 */
        static deposit() {
            JSUtils.openPage("/deposit");
        }
        /** 进入刮刮卡 */
        static jackpot() {
            JSUtils.openPage("/jackpot");
        }
        /** 打开指定的web页面 不关闭游戏的前提下 */
        static openWebPageWithoutLeaveGame(value) {
            JSUtils.openPage(value, false);
        }
        /** 关闭游戏
         * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
         * @param [data = null]
         * */
        static gameClose(type = 0, data = null) {
            SceneManager.inst.initComplete = false;
            SceneManager.inst.isLoaderResComplete = false;
            if (AppManager.callIOS("gameClose", { type: type, data: data })) {
                SceneManager.inst.closeGame();
                return;
            }
            if (Laya.Browser.window.parent.GameToHall) {
                Laya.Browser.window.parent.GameToHall.gameClose(type, data);
            }
            else {
                if (!Laya.Render.isConchApp && window.location.protocol == "https:") {
                    // 如果不是加速器 并且不是在非https下  那么直接返回大厅
                    // Laya.Browser.window.location.href = Player.HOME_URL
                    tsCore.Log.debug(`return home url ${window.location.host}`);
                    window.location.href = "//" + window.location.host;
                }
            }
            AppManager.showWeb({ javascript: `window.GameToHall.gameClose(${type}, ${data})` });
            SceneManager.inst.closeGame();
        }
        /**
         * 弹窗
         * @param msg 内容文本
         * @param title 标题
         * @param okText ok文本
         * @param cancelText 取消文本
         */
        static alert(msg, title = "", okText = "", cancelText = "") {
            var _a, _b, _c, _d, _e, _f;
            if (AppManager.callIOS("alert", { msg: msg, title: title, ensureTv: okText, cancelTv: cancelText }))
                return;
            (_c = (_b = (_a = Laya.Browser.window.parent) === null || _a === void 0 ? void 0 : _a.GameToHall) === null || _b === void 0 ? void 0 : _b.alert) === null || _c === void 0 ? void 0 : _c.call(_b, msg);
            (_f = (_e = (_d = Laya.Browser.window.parent) === null || _d === void 0 ? void 0 : _d.GameToHall) === null || _e === void 0 ? void 0 : _e.openModal) === null || _f === void 0 ? void 0 : _f.call(_e, msg);
            AppManager.showWeb({ javascript: `window.GameToHall.alert && window.GameToHall.alert('${msg}')` });
            AppManager.showWeb({ javascript: `window.GameToHall.openModal && window.GameToHall.openModal('${msg}')` });
        }
        /**
         * 打开一个原生页面
         * @param page 页面 如： "/giftPage?token=***"
         * login,register,userSetting,webDetail,gameDetail,editNickName,forgetMain,changePwd,home,deposit,promotion,withdraw,profile
         * @param [isCloseGame=true] 是否关闭游戏
         * @param fromUrl 登录注册等成功后，需打开的界面地址
         */
        static openPage(page, isCloseGame = true, fromUrl) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            tsCore.Log.debug(`openPage-> page:${page}, isCloseGame=${isCloseGame}`);
            if (AppManager.callIOS("openPage", {
                page: page.startsWith("/") ? page.substring(1) : page,
                isCloseGame: isCloseGame
            }))
                return;
            if (isCloseGame) {
                (_c = (_b = (_a = Laya.Browser.window.parent) === null || _a === void 0 ? void 0 : _a.GameToHall) === null || _b === void 0 ? void 0 : _b.comeWebPage) === null || _c === void 0 ? void 0 : _c.call(_b, page);
                AppManager.showWeb({ javascript: `window.GameToHall.comeWebPage && window.GameToHall.comeWebPage('${page}')` });
                SceneManager.inst.closeGame();
            }
            else {
                (_f = (_e = (_d = Laya.Browser.window.parent) === null || _d === void 0 ? void 0 : _d.GameToHall) === null || _e === void 0 ? void 0 : _e.openWebPageWithoutLeaveGame) === null || _f === void 0 ? void 0 : _f.call(_e, page);
                AppManager.showWeb({ javascript: `window.GameToHall.openWebPageWithoutLeaveGame('${page}')` });
            }
            (_j = (_h = (_g = Laya.Browser.window.parent) === null || _g === void 0 ? void 0 : _g.GameToHall) === null || _h === void 0 ? void 0 : _h.openPage) === null || _j === void 0 ? void 0 : _j.call(_h, page);
            AppManager.showWeb({ javascript: `window.GameToHall.openPage && window.GameToHall.openPage('${page}', ${isCloseGame})` });
        }
        /** 进入游戏进度条 */
        static progress(value) {
            var _a, _b, _c, _d, _e, _f;
            if (AppManager.callIOS("progress", { value: value }, false))
                return;
            (_c = (_b = (_a = Laya.Browser.window.parent) === null || _a === void 0 ? void 0 : _a.GameToHall) === null || _b === void 0 ? void 0 : _b.progress) === null || _c === void 0 ? void 0 : _c.call(_b, value);
            (_f = (_e = (_d = Laya.Browser.window.parent) === null || _d === void 0 ? void 0 : _d.GameToHall) === null || _e === void 0 ? void 0 : _e.getProgress) === null || _f === void 0 ? void 0 : _f.call(_e, value);
            AppManager.executionJavascript("window.GameToHall.progress && window.GameToHall.progress", value);
            AppManager.executionJavascript("window.GameToHall.getProgress && window.GameToHall.getProgress", value);
        }
        /** 通知进入游戏了 */
        static gameOnload() {
            var _a, _b, _c;
            tsCore.Log.debug("gameOnload->");
            if (AppManager.callIOS("gameOnload"))
                return;
            (_c = (_b = (_a = Laya.Browser.window.parent) === null || _a === void 0 ? void 0 : _a.GameToHall) === null || _b === void 0 ? void 0 : _b.gameOnload) === null || _c === void 0 ? void 0 : _c.call(_b);
            AppManager.executionJavascript("window.GameToHall.gameOnload", null);
        }
        /** 上传头像 */
        static uploadAvatar() {
            var _a, _b, _c, _d, _e, _f;
            if (AppManager.callIOS("uploadAvatar"))
                return;
            (_c = (_b = (_a = Laya.Browser.window.parent) === null || _a === void 0 ? void 0 : _a.GameToHall) === null || _b === void 0 ? void 0 : _b.uploadAvatar) === null || _c === void 0 ? void 0 : _c.call(_b);
            (_f = (_e = (_d = Laya.Browser.window.parent) === null || _d === void 0 ? void 0 : _d.GameToHall) === null || _e === void 0 ? void 0 : _e.openReviseAvatarNickNameDrawer) === null || _f === void 0 ? void 0 : _f.call(_e);
            AppManager.showWeb({ javascript: "window.GameToHall.uploadAvatar && window.GameToHall.uploadAvatar()" });
            AppManager.showWeb({ javascript: "window.GameToHall.openReviseAvatarNickNameDrawer && window.GameToHall.openReviseAvatarNickNameDrawer()" });
        }
    }
    JSUtils.getProgress = JSUtils.progress;
    /**
     * @deprecated
     * @see JSUtils.uploadAvatar
     */
    JSUtils.updateHead = JSUtils.uploadAvatar;
    /**
     * @deprecated
     * @see JSUtils.alert
     */
    JSUtils.openModal = JSUtils.alert;
    gameLib.JSUtils = JSUtils;
    class ObjectUtil {
        static setColorTransform(source, value) {
            if (value) {
                let array = tsCore.StringUtil.changeType(value, "array,number");
                if (array.length == 8) {
                    // ObjectUtil.colorTransform.redMultiplier = array[0]
                    // ObjectUtil.colorTransform.greenMultiplier = array[1]
                    // ObjectUtil.colorTransform.blueMultiplier = array[2]
                    // ObjectUtil.colorTransform.alphaMultiplier = array[3]
                    // ObjectUtil.colorTransform.redOffset = array[4]
                    // ObjectUtil.colorTransform.greenOffset = array[5]
                    // ObjectUtil.colorTransform.blueOffset = array[6]
                    // ObjectUtil.colorTransform.alphaOffset = array[7]
                    // source.transform.colorTransform = ObjectUtil.colorTransform
                    ObjectUtil.colorTransform.adjustColor(array[1], array[2], array[3], array[4]);
                    ObjectUtil.colorTransform.color(array[4], array[5], array[6], array[7]);
                    source.filters = [ObjectUtil.colorTransform];
                }
                else {
                    tsCore.Log.fatal("ObjectUtil.setColorTransform(source, value) The number of color value lengths is not correct, the length should be 8!");
                }
            }
            else {
                // ObjectUtil.colorTransform.redMultiplier = 1
                // ObjectUtil.colorTransform.greenMultiplier = 1
                // ObjectUtil.colorTransform.blueMultiplier = 1
                // ObjectUtil.colorTransform.alphaMultiplier = 1
                // ObjectUtil.colorTransform.redOffset = 0
                // ObjectUtil.colorTransform.greenOffset = 0
                // ObjectUtil.colorTransform.blueOffset = 0
                // ObjectUtil.colorTransform.alphaOffset = 0
                // source.transform.colorTransform = ObjectUtil.colorTransform
                ObjectUtil.colorTransform.adjustColor(0, 0, 0, 0);
                ObjectUtil.colorTransform.color(255, 255, 255, 1);
                source.filters = [ObjectUtil.colorTransform];
            }
        }
        static setColorMatrixFilter(source, value) {
            if (value) {
                let array = tsCore.StringUtil.changeType(value, "array,number");
                ObjectUtil.colorMatrixFilters[0].setByMatrix(array);
                source.filters = this.colorMatrixFilters;
            }
            else {
                source.filters = null;
            }
        }
        /**
         * 深度赋值对象 <br/>
         *        赋值            浅层拷贝    深层拷贝    getter/setter <br/>
         * Object.assign      ok      no         no<br/>
         * JSON.stringify      ok      ok         no<br/>
         * Object.create      ok      no         ok<br/>
         * @param source
         * @param isCls
         * @deprecated
         *
         */
        static copy(source, isCls = false) {
            // if (isCls) {
            // 	let typeName:string = getQualifiedClassName(source)
            // 	let packageName:string = typeName.split("::")[0]
            // 	let type:Class = getDefinitionByName(typeName) as Class
            // 	registerClassAlias(packageName, type)
            // }
            // let copier:ByteArray = new ByteArray()
            // copier.writeObject(source)
            // copier.position = 0
            // return copier.readObject()
            // 其实就是写了个子类继承父类数据而也
            // Object.setPrototypeOf(source, newObject)
            return Object.create(source);
        }
        /**
         * 将二进制转换成 base64 图片字符
         * @param buffer
         */
        static arrayBufferToBase64(buffer) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return 'data:image/png;base64,' + window.btoa(binary);
        }
        /**
         * ArrayBuffer 转为字符串，参数为 ArrayBuffer对象
         * @param buf
         */
        static ab2str(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }
        /**
         * 字符串转为 ArrayBuffer 对象，参数为字符串
         * @param str
         */
        static str2ab(str) {
            let buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
            let bufView = new Uint8Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }
        /**
         * 解析数据
         * @param xml
         * @param handler 解析完成回调 ( 返回数组 [xml, texture] )
         * @param content
         */
        // static parseRole(value: ArrayBuffer, handler: Laya.Handler) {
        // 	let buf: Uint8Array = new Uint8Array(value, 0)
        // 	let inflater = new Zlib.Inflate(buf)
        // 	buf = inflater.decompress()
        // 	let bytes: ByteBuffer = new ByteBuffer(buf)
        // 	let pngIen = bytes.readInt32()
        // 	let pngBytes: Byte = new Byte(bytes.readArrayBuffer(pngIen))
        // 	let xmlLength = bytes.readInt32()
        // 	let xmlBytes: Byte = new Byte(bytes.readArrayBuffer(xmlLength))
        // 	// 将二进制转换成字符串
        // 	let str = ObjectUtil.ab2str(xmlBytes.buffer)
        // 	let xmlStr = Utils.parseXMLFromString(str)
        // 	// 转换成base64 位图信息
        // 	let base64Str = ObjectUtil.arrayBufferToBase64(pngBytes.buffer)
        // 	// 判断如果已经加载  直接使用不再重新加载
        // 	let texture = Laya.loader.getRes(base64Str)
        // 	if (texture) {
        // 		this.onLoadTexture(xmlStr, handler, texture)
        // 	} else {
        // 		Laya.loader.load(base64Str,
        // 			Handler.create(this, this.onLoadTexture, [xmlStr, handler]),
        // 			null, Loader.IMAGE)
        // 	}
        // }
        static onLoadTexture(xml, handler, content) {
            handler.runWith([xml, content]);
        }
        /**
         * 获取指定坐标下存在的对象
         * @param x x坐标 或 point对象
         * @param y y坐标 默认0
         */
        static getObjectsUnderPoint(x, y = 0) {
            if (x instanceof Laya.Point) {
                y = x.y;
                x = x.x;
            }
            let len = Laya.stage.numChildren;
            let maps = [];
            for (let i = 0; i < len; i++) {
                let a = Laya.stage.getChildAt(i);
                if (a instanceof Laya.Sprite && a.alpha > 0 && a.visible) {
                    if (new Laya.Rectangle(a.x, a.y, a.displayWidth, a.displayHeight).contains(x, y)) {
                        maps.push(a);
                    }
                }
            }
            return maps;
        }
        /**
         * 获取指定位置的颜色值 16进制
         * @param texture
         * @param x x坐标 或 point对象 和 Laya.Sprite
         * @param y y坐标 默认-1
         */
        static getPixel(texture, x = -1, y = -1) {
            if (x instanceof Laya.Point) {
                y = x.y;
                x = x.x;
            }
            if (texture instanceof Laya.Sprite) {
                if (x == -1) {
                    x = texture.x;
                }
                if (y == -1) {
                    y = texture.y;
                }
                texture = texture.texture;
            }
            if (x == -1) {
                x = 0;
            }
            if (y == -1) {
                y = 0;
            }
            let arr = texture.getPixels(x, y, 1, 1);
            return tsCore.StringUtil.colorRgb(arr);
        }
        /**
         * 根据类名获取对象 如 com.test.Test可获取Test对象
         * @param classStr
         */
        static getClass(classStr) {
            let c = classStr.split(".");
            let cls = null;
            for (let i = 0; i < c.length; i++) {
                if (!cls) {
                    cls = window[c[i]];
                }
                else {
                    cls = cls[c[i]];
                }
            }
            return cls;
        }
    }
    ObjectUtil.colorTransform = new Laya.ColorFilter();
    ObjectUtil.colorMatrixFilters = [new Laya.ColorFilter()];
    gameLib.ObjectUtil = ObjectUtil;
    class RotationUtils {
        constructor() {
            /** 速度最大值 */
            this.maxSpeed = 10;
            /** 减速后最小值 */
            this.minSpeed = 0;
            /** 格子数量 */
            this.count = 20;
            /** 第一个奖区起始点与0点位置的偏移比例 */
            this.skew = -0.5;
            /** 最少圈数 */
            this.minCircle = 5;
            /** 最多圈数 */
            this.maxCircle = 8;
            /** 指针所停位置离奖区边缘的比例 */
            this.offset = 0.5;
            /** 旋转花费的时间，单位毫秒。 只有tween有用 */
            this.duration = 1000 * 5;
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollFrame(comp, runEndIndex, callback, proCall, isClockwise = true) {
            this.roll(comp, runEndIndex, callback, proCall, true, isClockwise);
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollTween(comp, runEndIndex, callback, proCall, isClockwise = true) {
            this.roll(comp, runEndIndex, callback, proCall, false, isClockwise);
        }
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isFrame 是否使用帧动画播放
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        roll(comp, runEndIndex, callback, proCall, isFrame, isClockwise) {
            this.comp = comp;
            this.endCall = callback;
            this.proCall = proCall;
            comp.rotation = comp.rotation % 360; //初始化角度
            this.runEndIndex = runEndIndex;
            this.rotationTotal = tsCore.MathKit.roundLong(this.count, runEndIndex, this.minCircle, this.maxCircle, this.skew, this.offset); //获取总长度
            if (isFrame) {
                this.rotationTotal -= comp.rotation;
                if (!isClockwise)
                    this.rotationTotal *= -1;
                this.addSpeed = (this.maxSpeed * this.maxSpeed - this.minSpeed * this.minSpeed) / this.rotationTotal; //获取加速度
                this.speed = 0; //初始化速度
                Laya.timer.frameLoop(1, this, this.runHandler);
            }
            else {
                if (!isClockwise)
                    this.rotationTotal *= -1;
                this.tween = Laya.Tween.to(comp, {
                    rotation: this.rotationTotal,
                    ease: Laya.Ease.expoInOut, complete: Laya.Handler.create(this, this.onRollEndHandler),
                    update: new Laya.Handler(this, this.updateHandler)
                }, this.duration);
                //				Ease.sineInOut
                //				Ease.expoInOut
                //				Ease.quadInOut
                //				Ease.quartInOut
                //				Ease.circInOut
                //				Ease.cubicInOut
            }
        }
        updateHandler() {
            let rt = this.rotationTotal - this.rotationTotal / 3;
            if (rt <= this.comp.rotation) {
                runFun(this.proCall);
                this.proCall = null;
            }
        }
        onRollEndHandler() {
            this.tween = null;
            runFun(this.endCall);
            this.endCall = null;
        }
        runHandler() {
            //如果速度到达最大速度开始减速
            if (this.speed >= this.maxSpeed) {
                this.speed = 2 * this.maxSpeed - this.speed; //最大速度超范围后修正回来!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!关键
                this.addSpeed = -this.addSpeed;
                runFun(this.proCall);
                this.proCall = null;
            }
            this.speed += this.addSpeed;
            if (this.speed > 0) {
                this.comp.rotation += this.speed;
            }
            else {
                Laya.timer.clear(this, this.runHandler);
                this.onRollEndHandler();
            }
        }
        /** 销毁动画 */
        diapose() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.clear();
            this.tween = null;
            this.endCall = null;
            this.proCall = null;
            if (this.comp)
                Laya.Tween.clearAll(this.comp);
            Laya.timer.clear(this, this.runHandler);
        }
        /** 立即停止到结束为止 */
        stop() {
            var _a;
            (_a = this.tween) === null || _a === void 0 ? void 0 : _a.complete();
            this.tween = null;
            this.endCall = null;
            this.proCall = null;
            if (this.comp)
                Laya.Tween.clearAll(this.comp);
            Laya.timer.clear(this, this.runHandler);
        }
    }
    gameLib.RotationUtils = RotationUtils;
    class ShowUtils {
        static showSize(spr) {
            const bonus = new Laya.Sprite();
            bonus.alpha = .7;
            if (spr.hitArea) {
                bonus.graphics.drawRect(spr.hitArea.x, spr.hitArea.y, spr.hitArea.width, spr.hitArea.height, "#ffffff");
            }
            else {
                bonus.graphics.drawRect(spr.x, spr.y, spr.width, spr.height, "#ffffff");
            }
            spr.addChild(bonus);
        }
    }
    gameLib.ShowUtils = ShowUtils;
    /** 状态吗获取显示信息 */
    class StateCode {
        /**
         * 获取显示信息
         * @param data 一个object对象  如果带有message错误文字  直接使用 否则用code命令获取错误内容
         */
        static getShowMessage(data) {
            var _a, _b;
            if (!data)
                return getString(1005 /* LibStr.NET_ERROR */);
            if (((_a = data.message) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                return data.message;
            }
            else if (((_b = data.msg) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                return data.msg;
            }
            return this.getInfo(data.code);
        }
        /**
         * 显示错误信息
         * @param code 错误代号
         */
        static getInfo(code) {
            let content;
            switch (code) {
                case HttpCode.LOGIN_INVALIDITY: // 未登陆，请先登陆
                    content = getString(1007 /* LibStr.FIRST_LOG */);
                    break;
                case HttpCode.GAME_INSUFFICIENT_BALANCE: // 资金不足
                    content = getString(1021 /* LibStr.RECHARGE */);
                    break;
                case HttpCode.GAME_CANNOT_BET: // 当前游戏状态不属于投注状态
                    content = getString(1006 /* LibStr.CANNOT_BET */);
                    break;
                case HttpCode.GAME_OFF: // 游戏暂停中
                    content = getString(1002 /* LibStr.GAME_OFF */);
                    break;
                case HttpCode.GAME_BET_FAIL: // 投注失败
                    content = getString(1010 /* LibStr.BET_FAIL */);
                    break;
                default:
                    content = getString(1005 /* LibStr.NET_ERROR */) + ". code:" + code;
                    break;
            }
            return content;
        }
        /**
         * 此错误是后在执行范围内
         * @param code 执行错误代码
         * @param msg 提示文案或具有错误信息的object *.msg *.message
         */
        static execute(code, msg = null) {
            switch (code) {
                case HttpCode.OK:
                    return false;
                case HttpCode.LOGIN_INVALIDITY: // 请登录
                    tsCore.Log.debug("StateCode.execute() " + HttpCode.LOGIN_INVALIDITY);
                    if (Player.inst.urlParam.isJumpPage()) {
                        JSUtils.login();
                        return true;
                    }
                    fgui.GRoot.inst.closeModalWait();
                    LoadingWindow.inst.hide();
                    HtmlWindow.inst.hide();
                    if (typeof msg === "object")
                        msg = this.getShowMessage(msg);
                    msg = msg ? msg : getString(1007 /* LibStr.FIRST_LOG */);
                    if (fgui.UIPackage.getByName("gameCommon"))
                        WaitResult.inst.hide();
                    HomePrompt.instance.showTip(0, msg, function () {
                        if (Player.inst.gameId == -1) {
                            Laya.LocalStorage.removeItem("token");
                            Laya.LocalStorage.removeItem("userData");
                            Player.inst.token = null;
                            if (Player.inst.urlParam.isJumpPage()) {
                                Player.inst.urlParam.clearJumpPage();
                                //								SceneManager.inst.enterGame()
                                //								return
                            }
                            SceneManager.inst.showHomeScene();
                        }
                        else {
                            SceneManager.inst.logout();
                        }
                    }, null, { cancelName: getString(1066 /* LibStr.OK */) });
                    return true;
                case HttpCode.GAME_PAUSE: // 游戏暂停中
                    tsCore.Log.debug("StateCode.execute() 8003");
                    this.showGameOff();
                    return true;
                default:
                    if (typeof msg !== "string")
                        msg = StateCode.getShowMessage(msg);
                    msg = msg ? msg : getString(1005 /* LibStr.NET_ERROR */);
                    tsCore.App.inst.sendAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, msg);
                    return true;
            }
        }
        /** 游戏暂停中，返回大厅 */
        static showGameOff() {
            JSUtils.alert(getString(1002 /* LibStr.GAME_OFF */));
            JSUtils.gameClose();
        }
    }
    gameLib.StateCode = StateCode;
    /**
     * 流量统计
     */
    class StatFlow {
        constructor() {
            /** 公共流量计算接口 */
            this.by = new Laya.Byte();
        }
        static get inst() {
            var _a;
            (_a = StatFlow._instance) !== null && _a !== void 0 ? _a : (StatFlow._instance = new StatFlow());
            return this._instance;
        }
        /**
         * 计算流量
         * @param url
         * @param value
         */
        castFlow(url, value) {
            if (!Player.inst.token) {
                return;
            }
            this.by.clear();
            //		by.writeUTFBytes(value)
            ////		trace(value)
            //		let len:number = by.length
            ////		trace(len)
            ////		trace("**********************")
            //
            //		let simpleUrl:string = url.split("?")[0]
            //
            //		let obj:any = getUserStat(simpleUrl)
            //         obj ??= {timer:HTTPUtils.inst.getTimer(), size:0, url:simpleUrl}
            //
            //		let current:number = HTTPUtils.inst.getTimer()
            //
            //		let sendSize:number = 0
            //		let sendUrl:string
            //		let sendTimer:number
            //		if (!Cast.isSameDay(obj.timer, current)) {
            //			sendSize = obj.size
            //			sendUrl = obj.url
            //			sendTimer = obj.timer
            //			obj.timer = current
            //			obj.size = 0
            //		}
            ////		trace(Cast.timerFrom2(obj.timer/1000), Cast.timerFrom2(current/1000), url)
            //		obj.size += len
            ////		trace("当前流量消耗统计 今天="+obj.size+"b "+Math.floor(obj.size/1024)+"kb | 发送="+sendSize)
            //
            //		addUserStat(obj)
            //
            //		if (sendSize > 0) {
            //			let sendObj:any = {reqData:[{url:sendUrl, size:sendSize, timer:sendTimer}], uid:Player.inst.userId}
            //			let obj2:any = Laya.LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
            //			let users:any[] = obj2.data
            //			for (let i:number = 0; i < users.length; i++) {
            //				let user:any = users[i]
            //				if (!Cast.isSameDay(user.timer, current)) {
            //					if (user.size > 0) {
            //						sendObj.reqData.push({url:user.url, size:user.size, timer:user.timer})
            //					}
            //					user.size = 0
            //					user.timer = current
            //				}
            //			}
            //
            //			Laya.LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj2)
            //
            //			sendObj.reqData = JSON.stringify(sendObj.reqData)
            //
            //			HTTPUtils.inst.post(__JS__("analysisUrl")+"data-traffic", sendObj)
            //		}
        }
        /** 添加用户统计 */
        addUserStat(value) {
            //		let obj:any = Laya.LocalStorage.getJSON(NOT_SEND_STAT_FLOW)
            //			obj ??= {data:[]}
            //		let users:any[] = obj.data
            //		if (!(users is Array)) {
            //			users = []
            //		}
            //		let update:boolean
            //		for (let i = 0; i < users.length; i++) {
            //			let user = users[i]
            //			if (user.url == value.url) {
            //				users[i] = value
            //				update = true
            //				break
            //			}
            //		}
            //		if(!update) users.push(value)
            //		obj.data = users
            //		Laya.LocalStorage.setJSON(NOT_SEND_STAT_FLOW, obj)
        }
        /** 根据用户id获取用户统计信息 */
        getUserStat(url) {
            let obj = Laya.LocalStorage.getJSON(StatFlow.NOT_SEND_STAT_FLOW);
            if (!obj) {
                obj = { data: [] };
            }
            else {
                if (!(obj.data instanceof Array)) {
                    obj = { data: [] };
                }
            }
            let users = obj.data;
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                if (user.url == url) {
                    return user;
                }
            }
            return null;
        }
    }
    /** 未发送的流量统计 */
    StatFlow.NOT_SEND_STAT_FLOW = "notSendStatFlow";
    gameLib.StatFlow = StatFlow;
    class ActivityButton extends tsCore.EButton {
        constructor() {
            super(...arguments);
            this.tempValue = 0;
            /** 当没有优惠卷使用的时候 是否自动隐藏 */
            this.isAutoHide = true;
        }
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.draggable = false;
            if (this.getChild("n10")) {
                this.contentText = this.getChild("n10").asTextField;
            }
            else {
                this.contentText = this._titleObject.asTextField;
            }
            this.on(Laya.Event.ADDED, this, this.addedHandler);
            this.onClick(this, this.clickHandler);
            this.regGameAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE, this, this.updateShow);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY, this, this.useActivityHandler);
            this.regGameAction(ActionLib.GAME_USE_ACTIVITY_END, this, this.stopUseActivityHandler);
            this.regGameAction(ActionLib.GAME_STOP_USE_ACTIVITY, this, this.stopUseActivityHandler);
        }
        stopUseActivityHandler() {
            this.getController("c1").selectedIndex = 0;
        }
        useActivityHandler() {
            let useActivity = Player.inst.getUseCoupon();
            if (useActivity) {
                this.sendAction(ActionLib.GAME_UPDATE_USE_ACTIVITY_CHANGE);
                this.getController("c1").selectedIndex = 1;
            }
        }
        updateShow() {
            let useActivity = Player.inst.getUseCoupon();
            if (this.updateText) {
                runFun(this.updateText, useActivity);
                return;
            }
            if (useActivity) {
                this.text = Player.inst.getCurrencyUnit() + " " + useActivity.faceValue;
            }
            else {
                this.text = "";
            }
        }
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value) {
            this.tempValue = value;
            if (value > 0) {
                this.contentText.text = getString(1041 /* LibStr.USE_IN_GIFT */, value);
            }
            else {
                this.contentText.text = getString(1040 /* LibStr.NOT_GIFT */);
            }
            if (this.isAutoHide)
                this.visible = value > 0;
        }
        clickHandler() {
            if (!this.clickInvalid) {
                runFun(this.callback);
                // 判断是否是今天第一次打开  如果是 弹出帮助文档
                let giftOpenTimerStr = Laya.LocalStorage.getItem("action_help" + Player.inst.gameId);
                let giftOpenTimer;
                giftOpenTimerStr !== null && giftOpenTimerStr !== void 0 ? giftOpenTimerStr : (giftOpenTimerStr = "0");
                giftOpenTimer = parseFloat(giftOpenTimerStr);
                if (!tsCore.DateUtils.isSameDay(giftOpenTimer, Laya.Browser.now())) {
                    this.sendAction(ActionLib.GAME_ACTIVITY_HELP_WINDOW_SHOW);
                    Laya.LocalStorage.setItem("action_help" + Player.inst.gameId, Laya.Browser.now() + "");
                }
            }
            this.clickInvalid = false;
        }
        addedHandler() {
        }
        /** 打开拖动 */
        openDrag() {
            this.draggable = true;
            this.off(fgui.Events.DRAG_START, this, this.onDragStart);
            this.off(fgui.Events.DRAG_END, this, this.onDragEnd);
            this.on(fgui.Events.DRAG_START, this, this.onDragStart);
            this.on(fgui.Events.DRAG_END, this, this.onDragEnd);
            let arr = Laya.LocalStorage.getJSON("activity_" + Player.inst.gameId);
            if (arr) {
                this.setXY(arr[0], arr[1]);
            }
            this.onDragEnd();
            this.clickInvalid = false;
        }
        onDragEnd() {
            this.clickInvalid = true;
            let tempX = this.x;
            let tempY = this.y;
            if (this.x > (this.parent.width >> 1)) {
                tempX = this.parent.width - this.x - this.width;
                if (this.y > (this.parent.height >> 1)) {
                    tempX = this.parent.width - this.x - this.width;
                    tempY = this.parent.height - this.y - this.height;
                    if (tempX < tempY) {
                        tempX = this.parent.width - this.width;
                        tempY = this.y;
                    }
                    else {
                        tempY = this.parent.height - this.height;
                        tempX = this.x;
                    }
                }
                else {
                    if (this.y < this.parent.width - this.x - this.width) {
                        tempY = 0;
                        tempX = this.x;
                    }
                    else {
                        tempY = this.y;
                        tempX = this.parent.width - this.width;
                    }
                }
            }
            else {
                if (this.y > (this.parent.height >> 1)) {
                    if (this.x < this.parent.height - this.y - this.height) {
                        tempX = 0;
                        tempY = this.y;
                    }
                    else {
                        tempX = this.x;
                        tempY = this.parent.height - this.height;
                    }
                }
                else {
                    if (this.x < this.y) {
                        tempX = 0;
                        tempY = this.y;
                    }
                    else {
                        tempY = 0;
                        tempX = this.x;
                    }
                }
            }
            Laya.Tween.to(this, { x: tempX, y: tempY }, 300);
            Laya.LocalStorage.setJSON("activity_" + Player.inst.gameId, [tempX, tempY]);
        }
        onDragStart() {
            if (SceneManager.inst.starter.baseScene.promptTip)
                SceneManager.inst.starter.baseScene.promptTip.hide();
        }
    }
    gameLib.ActivityButton = ActivityButton;
    /**
     * 弹窗层
     * @author boge
     */
    class AlertPanel extends fgui.GComponent {
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new AlertPanel);
            return this._instance;
        }
        constructor() {
            super();
            this.touchable = false;
            Laya.stage.on(Laya.Event.RESIZE, this, this.__winResize);
            this.__winResize();
        }
        __winResize() {
            this.setSize(Laya.stage.width, Laya.stage.height);
        }
    }
    gameLib.AlertPanel = AlertPanel;
    /**
     * 洗牌的牌
     * @author boge
     *
     */
    class CardDeck extends BaseView {
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.load = this.getChild("n0").asLoader;
            this.scaleX = this.scaleY = .9;
        }
        shuffle(func) {
            let i = this.pos;
            let z = i / 4;
            let offsetX = this.plusMinus(Math.random() * 90 + 30);
            let delay = i * 2;
            Laya.Tween.to(this, { x: offsetX, y: -z }, 200, null, Laya.Handler.create(this, completeHandler), delay);
            Laya.timer.once(100 + delay, this, function () {
                this.parent.setChildIndex(this, i);
            });
            function completeHandler() {
                Laya.Tween.to(this, { x: -z, y: -z }, 200);
                Laya.timer.once(200, this, function () {
                    runFun(func, i);
                });
            }
        }
        plusMinus(value) {
            let plusminus = Math.round(Math.random()) ? -1 : 1;
            return plusminus * value;
        }
        setUrl(url) {
            this.load.url = url;
        }
        revert() {
            Laya.Tween.clearAll(this);
            this.load.url = null;
            this.removeFromParent();
        }
        static create() {
            let cardDeck = fgui.UIPackage.createObject("gameCommon", "CardDeck", CardDeck);
            cardDeck.setUrl("ui://jiqs6fnqd9ai29");
            return cardDeck;
        }
    }
    CardDeck.NAME = "CardDeck";
    gameLib.CardDeck = CardDeck;
    class GlobalWaiting extends fgui.GComponent {
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.onInit();
            this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        }
        onInit() {
            // this.getChild("n0")
            // this.getChild("n1").asMovieClip
            this.messageText = this.getChild("n2").asTextField;
        }
        /*@override*/
        set text(value) {
            value !== null && value !== void 0 ? value : (value = getString(1001 /* LibStr.LOADING */));
            this.messageText.text = value;
        }
    }
    gameLib.GlobalWaiting = GlobalWaiting;
    /** 提示框 */
    class HomePrompt extends BaseWindow {
        static get instance() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new HomePrompt);
            return this._instance;
        }
        constructor() {
            super();
            this.modal = true;
            this.isAction = false;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//init/HomePrompt").asCom;
            this.controller = this.contentPane.getController("c1");
            this.okBtn = this.contentPane.getChild("n15").asButton;
            this.cancelBtn = this.contentPane.getChild("n16").asButton;
            this.message = this.contentPane.getChild("message").asTextField;
            this.cancelBtn.onClick(this, this.cancelHandler);
            this.okBtn.onClick(this, this.okHandler);
            super.onInit();
        }
        cancelHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
            if (this.cancelCallback)
                this.cancelCallback();
            this.cancelCallback = null;
        }
        okHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
            if (this.callback)
                this.callback();
            this.callback = null;
        }
        /*@override*/
        onShown() {
            //			AppRecordManager.addHistory(null, this)
        }
        /**
         * 显示提示框
         * @param code 0 公告提示框 1两个选择按钮提示
         * @param content 显示内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param callback 确定调用函数
         * @param cancelCallback 取消调用函数
         * @param obj 附带设置 (okName:'', cancelName:'')
         *
         */
        showTip(code, content, callback = null, cancelCallback = null, obj = null) {
            this.offClick(this, AppRecordManager.backHistory);
            this.callback = callback;
            this.cancelCallback = cancelCallback;
            if (Array.isArray(content)) {
                content = getString.apply(null, content);
            }
            else {
                content = getString(content);
            }
            this.show();
            this.center();
            this.controller.selectedIndex = code;
            if (obj === null || obj === void 0 ? void 0 : obj.okName) {
                this.okBtn.text = obj.okName;
            }
            else {
                if (code == 0) {
                    this.okBtn.text = getString(1066 /* LibStr.OK */);
                }
                else if (code == 1) {
                    this.okBtn.text = getString(1068 /* LibStr.RESEND */);
                }
            }
            if (obj === null || obj === void 0 ? void 0 : obj.cancelName) {
                this.cancelBtn.text = obj.cancelName;
            }
            else {
                this.cancelBtn.text = getString(1067 /* LibStr.CANCEL */);
            }
            this.message.text = content;
        }
        /*@override*/
        hideRecord() {
            this.hide();
        }
    }
    gameLib.HomePrompt = HomePrompt;
    class HtmlWindow extends fgui.Window {
        constructor() {
            super(...arguments);
            this.obj = {
                "aboutus.html": "About us",
                "fair_payment.html": "FAQs",
                "common_problems.html": "Fair payouts",
                "user_agreement.html": "GameData Agreement",
                "privacy.html": "Privacy Policy",
                "a": ""
            };
        }
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new HtmlWindow);
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.modal = true;
            this.contentPane = fgui.UIPackage.createObject("common", "HtmlWindow").asCom;
            this.contentPane.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.loadMovieClip = this.contentPane.getController("c1");
            this.btn = this.contentPane.getChild("n1").asButton;
            this.htmlText = this.contentPane.getChild("n5").asTextField;
            this.contentPane.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.btn.onClick(this, this.hide);
        }
        /*@override*/
        onShown() {
            fgui.GRoot.inst.displayObject.stage.on(Laya.Event.RESIZE, this, this.sizeChangeHandler);
            this.sizeChangeHandler();
            super.onShown();
        }
        sizeChangeHandler() {
            this._syncInputTransform();
        }
        /**
         * 新打开一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         */
        openHtml(url, full = false, closeHandler) {
            this.closeHandler = closeHandler;
            tsCore.HistoryManager.addHistory(null, this);
            this.show();
            tsCore.App.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            this.loadMovieClip.selectedIndex = 0;
            // 是否要使用  默认的  url
            let isHtmlUrl = !tsCore.StringUtil.beginsWith(url, "http");
            if (Player.inst.isWeb) {
                if (isHtmlUrl) {
                    Player.inst.windowOpen(Laya.Browser.window.htmlUrl + url);
                }
                else {
                    Player.inst.windowOpen(url);
                }
                this.hide();
            }
            else {
                let title = this.obj["a"];
                if (this.obj[url]) {
                    title = this.obj[url];
                }
                let jsonObject = {
                    webTitle: title,
                    webHeadVisibility: !full,
                    x: 0,
                    y: 0,
                    width: -1,
                    height: -1
                };
                if (isHtmlUrl) {
                    jsonObject.webUrl = Laya.Browser.window.htmlUrl + url;
                }
                else {
                    jsonObject.webUrl = url;
                }
                AppManager.showWeb(jsonObject);
            }
        }
        /**
         * 弹出一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         *
         */
        showTip(url, full = false, closeHandler) {
            this.closeHandler = closeHandler;
            tsCore.HistoryManager.addHistory(null, this);
            this.show();
            tsCore.App.inst.sendAction(ActionLib.GAME_UPDATE_DEFAULT_SCREEN);
            this.loadMovieClip.selectedIndex = 0;
            // 是否要使用  默认的  url
            let isHtmlUrl = !tsCore.StringUtil.beginsWith(url, "http");
            if (Player.inst.isWeb) {
                this.btn.visible = this.htmlText.visible = !full;
                let webElement = Laya.Browser.getElementById("webId");
                if (!webElement) {
                    webElement = Laya.Browser.createElement("div");
                    webElement.id = "webId";
                    webElement.style.position = "absolute";
                    webElement.style.left = "0px";
                    webElement.style.top = "0px";
                    webElement.style.width = "100%";
                    webElement.style.height = "100%";
                    webElement.style.Zindex = 110000;
                    // 创建一个 iframe 节点
                    let elementFrame = Laya.Browser.createElement("iframe");
                    elementFrame.id = "frameBox";
                    elementFrame.name = "frameBox";
                    elementFrame.src = '';
                    elementFrame.marginwidth = "0px";
                    elementFrame.marginheight = "0px";
                    elementFrame.overflow = "hidden";
                    elementFrame.scrolling = "auto";
                    elementFrame.frameborder = "no";
                    elementFrame.border = "0px";
                    elementFrame.style.position = "absolute";
                    elementFrame.style.Zindex = 100009;
                    elementFrame.style.border = "0px";
                    elementFrame.style.width = "100%";
                    elementFrame.style.height = "100%";
                    elementFrame.style.display = "none";
                    Laya.Browser.document.body.appendChild(webElement);
                    //			    tsCore.Log.debug(Laya.stage.width, Render.canvas.width, Render._mainCanvas.width)
                    webElement.appendChild(elementFrame);
                }
                let loadEnd = () => {
                    this.loadMovieClip.selectedIndex = 1;
                    tsCore.Log.debug("loadComplete");
                };
                Laya.Browser.window.regIFrame(loadEnd);
                if (isHtmlUrl) {
                    this.popFullIframeHandler(Laya.Browser.window.htmlUrl + url, true);
                }
                else {
                    this.popFullIframeHandler(url, true);
                }
                if (!full) {
                    let tempH = (this.btn.y + this.btn.height + this.btn.y);
                    webElement.style.height = ((fgui.GRoot.inst.height - tempH) * this.tempY) + "px";
                    webElement.style.top = (tempH * this.tempY) + "px";
                }
            }
            else {
                let title = this.obj["a"];
                if (this.obj[url]) {
                    title = this.obj[url];
                }
                let jsonObject = {
                    webTitle: title,
                    webHeadVisibility: !full,
                    x: 0,
                    y: 0,
                    width: -1,
                    height: -1
                };
                if (isHtmlUrl) {
                    jsonObject.webUrl = Laya.Browser.window.htmlUrl + url;
                }
                else {
                    jsonObject.webUrl = url;
                }
                AppManager.showWeb(jsonObject);
            }
        }
        // 弹出全屏显示的浏览窗口
        popFullIframeHandler(url, isVisible) {
            let ifm = Laya.Browser.getElementById("frameBox");
            if (isVisible && ifm) {
                this._syncInputTransform();
                ifm.src = url;
                ifm.style.display = "block";
            }
        }
        /** 修正宽高 */
        _syncInputTransform() {
            let frameBox = Laya.Browser.getElementById("webId");
            if (!frameBox)
                return;
            let style = frameBox.style;
            let transform = Laya.Utils.getTransformRelativeToWindow(this.displayObject, 0, 0);
            this.tempX = transform.x;
            this.tempY = transform.y;
            style.left = transform.tx + "px";
            style.width = fgui.GRoot.inst.width * transform.x + "px";
        }
        share(type, url, content) {
            // HomePrompt.instance.showTip(1, CommonCmd.DOWNLOAD_MSG,
            //     function () {
            //         UtilsTool.downloadURL(Player.DOWNLOAD_APK_URL)
            //     }, null, {okName: 'Continue', cancelName: 'Cancel'})
            //			Intent intent = new Intent()
            //			intent.setAction(GameAction.SHARE)
            //			intent.putExtra("type", type)
            //			intent.putExtra("url", url)
            //			intent.putExtra("content", content)
            //			getContext().sendBroadcast(intent)
        }
        /*@override*/
        hide() {
            if (this.parent)
                AppRecordManager.backHistory();
        }
        hideRecord() {
            fgui.GRoot.inst.displayObject.stage.off(Laya.Event.RESIZE, this, this.sizeChangeHandler);
            if (Player.inst.isWeb) {
                Laya.Browser.removeElement(Laya.Browser.getElementById("webId"));
            }
            else {
                AppManager.closeHtml();
            }
            if (Player.inst.gameId == CommonCmd.GAME_SPORTS)
                Player.inst.gameId = CommonCmd.GAME_HOME;
            super.hide();
            if (SceneManager.inst.starter)
                SceneManager.inst.starter.updateScreenOrientation();
            runFun(this.closeHandler);
        }
        showRecord() {
        }
    }
    gameLib.HtmlWindow = HtmlWindow;
    /** 图片窗口 */
    class ImageWindow extends BaseWindow {
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = new ImageWindow);
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//init/ImageWindow").asCom;
            super.onInit();
        }
        showTip(url) {
            this.show();
            this.contentPane.getChild("icon").asLoader.icon = url;
        }
    }
    gameLib.ImageWindow = ImageWindow;
    /** 加载界面 */
    class LoadingWindow extends BaseView {
        constructor() {
            super(...arguments);
            /** 当前进度 */
            this.tempValue = 0;
        }
        static get inst() {
            var _a;
            (_a = this._instance) !== null && _a !== void 0 ? _a : (this._instance = fgui.UIPackage.createObjectFromURL("//init/LoadingWindow", LoadingWindow));
            return this._instance;
        }
        /*@override*/
        onInit() {
            this.controller = this.getController("c1");
            this.loader = this.getChild("n0").asLoader;
            this.mesText = this.getChild("n1").asTextField;
            // this.visible = false
        }
        /**
         * 显示加载页
         * @param index 显示的形式
         * @param headText 使用头文本
         *
         */
        show(index = 0, headText) {
            tsCore.HistoryManager.pauseHistory = true;
            this.changeView(index, headText);
            fgui.GRoot.inst.addChild(this);
        }
        /**
         * 切换显示状态
         * @param index 显示的形式
         * @param headText 使用头文本
         */
        changeView(index = 0, headText) {
            headText !== null && headText !== void 0 ? headText : (headText = getString(1001 /* LibStr.LOADING */).split(".").join(""));
            this.headText = headText;
            this.controller.selectedIndex = index;
            this.mesText.text = "";
            //		loaderUrl("init_atlas_evpb2.jpg")
            Laya.timer.clear(this, this.changeHandler);
            Laya.timer.loop(500, this, this.changeHandler);
        }
        changeHandler() {
            this.mesText.text = this.getMsg() + this.tempValue + "%";
            this.dian++;
            if (this.dian > 3) {
                this.dian = 0;
            }
        }
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        updateMsg(value, tempCount = 1, totalCount = 1) {
            //			trace("LoadingWindow.updateMsg(vlaue)", value+"%")
            this.tempValue = LoadingWindow.getProgress(value, tempCount, totalCount);
            JSUtils.getProgress(this.tempValue);
            this.mesText.text = this.getMsg() + this.tempValue + "%";
        }
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static getProgress(value, tempCount = 1, totalCount = 1) {
            // 先算出每一份 占用的百分比份量
            let pieces = 100 / totalCount;
            // 得出当前加载所占百分比的数量
            let pro = value / 100 * pieces;
            let totalPro = pieces * (tempCount - 1) + pro;
            let finalTotalPro = Math.ceil(totalPro);
            return finalTotalPro;
        }
        /**
         * 显示加载错误提示
         * @param value
         *
         */
        showError(value) {
            Laya.timer.clear(this, this.changeHandler);
            this.mesText.text = value;
        }
        getMsg() {
            let str = this.headText;
            for (let i = 0; i < 3; i++) {
                if (i < this.dian) {
                    str += ".";
                }
                else {
                    str += " ";
                }
            }
            return str;
        }
        /** 替换加载图片 */
        loaderUrl(url) {
            this.loader.url = url;
        }
        hide() {
            tsCore.HistoryManager.pauseHistory = false;
            Laya.timer.clear(this, this.changeHandler);
            this.removeFromParent();
        }
    }
    gameLib.LoadingWindow = LoadingWindow;
    class NoticeView extends BaseView {
        constructor() {
            super();
            this.tempX = 0;
            /** 是否在滚动 */
            this.isRun = false;
            this.addView(NoticeView, this);
            this.gameData = Player.inst.gameData;
        }
        /*@override*/
        onInit() {
            super.onInit();
            this.richText = this.getChild("n1").asCom.getChild("n1").asRichTextField;
            this.tempX = this.richText.x;
        }
        /*@override*/
        addedHandler() {
            super.addedHandler();
            if (this.gameData.noticeData.length > 0) {
                this.startRun();
            }
            else {
                this.visible = false;
            }
        }
        showText(values) {
            this.gameData.noticeData = this.gameData.noticeData.concat(values);
            this.startRun();
        }
        /** 开始滚动 */
        startRun() {
            if (!this.isRun && this.gameData.noticeData && this.gameData.noticeData.length > 0) {
                this.isRun = true;
                this.updateNoticeContent();
                Laya.timer.frameLoop(1, this, this.loopHandler);
                this.visible = true;
            }
        }
        loopHandler() {
            this.richText.x -= 1;
            if (this.richText.x < -this.richText.div.contextWidth + 5) {
                if (this.gameData.noticeData.length > 0) {
                    this.updateNoticeContent();
                }
                else {
                    this.stopRun();
                }
            }
        }
        /** 更新内容 并重置位置 */
        updateNoticeContent() {
            this.resetMsgPosition();
            let msg;
            if (this.gameData.noticeData.length > 1) {
                msg = this.gameData.noticeData.shift();
            }
            else {
                msg = this.gameData.noticeData[0];
            }
            this.richText.text = tsCore.StringUtil.format(getString(1039 /* LibStr.WIN_NOTICE */), msg.mobile, msg.win, GameConfigKit.gameName());
        }
        stopRun() {
            this.resetMsgPosition();
            Laya.timer.clearAll(this);
            this.visible = false;
            this.isRun = false;
        }
        /** 重置位置 */
        resetMsgPosition() {
            this.richText.x = this.tempX + this.richText.width + 5;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    gameLib.NoticeView = NoticeView;
    /** 文案提示 */
    class PromptTip extends tsCore.ELabel {
        /*@override*/
        onInit() {
            super.onInit();
            this.touchable = false;
            this.text = getString(1033 /* LibStr.CASH_GIFTS_AVAILABLE */);
        }
        static createPromptTip() {
            return fgui.UIPackage.createObjectFromURL("//gameCommon/PromptTip", PromptTip);
        }
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        show(comp, downward = null) {
            if (parent)
                return;
            this.target = comp;
            this.downward = downward;
            //        this.getController("c1").selectedIndex = downward ? 1 : 0
            // 延迟到下次刷新显示
            Laya.timer.callLater(this, this.showViewHandler);
        }
        showViewHandler() {
            var _a;
            let starter = SceneManager.inst.starter;
            if (starter) {
                (_a = starter.baseScene) === null || _a === void 0 ? void 0 : _a.addChild(this);
                this.updatePoint();
                Laya.timer.clearAll(this);
                Laya.timer.once(3000, this, this.hide);
            }
        }
        hide() {
            this.removeFromParent();
        }
        updatePoint() {
            let pos;
            let sizeW = 0, sizeH = 0;
            let maxWidth;
            let maxHeight;
            if (SceneManager.inst.starter && SceneManager.inst.starter.baseScene) {
                maxWidth = SceneManager.inst.starter.baseScene.width;
                maxHeight = SceneManager.inst.starter.baseScene.height;
            }
            else {
                maxWidth = fgui.GRoot.inst.width;
                maxHeight = fgui.GRoot.inst.height;
            }
            if (this.target) {
                pos = this.target.localToGlobal();
                sizeW = this.target.width;
                sizeH = this.target.height;
                this.parent.globalToLocal(pos.x, pos.y, pos);
            }
            else {
                pos = this.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY);
            }
            let xx, yy;
            xx = pos.x;
            // 判断是否超出边界
            let overstepBorder = xx + (sizeW / 2) + this.width > maxWidth;
            if (overstepBorder) {
                xx = xx + (sizeW / 2) - this.width;
            }
            else {
                xx = xx + (sizeW / 2);
            }
            yy = pos.y + sizeH;
            if ((!this.downward && yy + sizeH + this.height > maxHeight) || this.downward == false) {
                // 在目标的上面
                yy = pos.y - this.height - 1;
                if (yy < 0) {
                    yy = 0;
                    xx += sizeW / 2;
                }
                if (overstepBorder) {
                    this.getController("c1").selectedIndex = 0;
                }
                else {
                    this.getController("c1").selectedIndex = 2;
                }
            }
            else {
                // 在目标的下面
                if (overstepBorder) {
                    this.getController("c1").selectedIndex = 1;
                }
                else {
                    this.getController("c1").selectedIndex = 3;
                }
            }
            this.x = xx;
            this.y = yy;
        }
        /*@override*/
        dispose() {
            Laya.timer.clearAll(this);
            super.dispose();
        }
    }
    gameLib.PromptTip = PromptTip;
    /** 提示框 */
    class PromptWindow extends BaseWindow {
        static get inst() {
            var _a;
            (_a = PromptWindow._instance) !== null && _a !== void 0 ? _a : (PromptWindow._instance = new PromptWindow());
            return PromptWindow._instance;
        }
        constructor() {
            var _a;
            super();
            /** 缓存的提示框 */
            this.cacheMessage = [];
            this.modal = true;
            (_a = PromptWindow._instance) !== null && _a !== void 0 ? _a : (PromptWindow._instance = this);
            this.regAction(ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW, this, this.showCancelTip);
            this.regAction(ActionLib.GAME_SHOW_PROMPT_WINDOW, this, this.showTip);
            this.regAction(ActionLib.GAME_SHOW_PROMPT_NORMAL_WINDOW, this, this._showWindow);
        }
        /*@override*/
        onInit() {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.contentPane = fgui.UIPackage.createObjectFromURL("//common/PromptWindow").asCom;
            super.onInit();
            this.content = (_a = this.getChild("content")) === null || _a === void 0 ? void 0 : _a.asTextField;
            this.titleText = (_b = this.getChild("titleText")) === null || _b === void 0 ? void 0 : _b.asTextField;
            this.continueBtn = (_c = this.getChild("continue")) === null || _c === void 0 ? void 0 : _c.asButton;
            this.cancelBtn = (_d = this.getChild("cancel")) === null || _d === void 0 ? void 0 : _d.asButton;
            this.closeBtn = (_e = this.getChild("close")) === null || _e === void 0 ? void 0 : _e.asButton;
            // this.cancelBtn.getTextField().bold = true
            // this.continueBtn.getTextField().bold = true
            this.controller = this.getController("c1");
            this.controller2 = this.getController("c2");
            this.controller3 = this.getController("c3");
            (_f = this.closeBtn) === null || _f === void 0 ? void 0 : _f.onClick(this, this.cancelHandler);
            (_g = this.cancelBtn) === null || _g === void 0 ? void 0 : _g.onClick(this, this.cancelHandler);
            (_h = this.continueBtn) === null || _h === void 0 ? void 0 : _h.onClick(this, this.continueHandler);
        }
        continueHandler() {
            if (this.continueFun)
                this.callback = null;
            if (this.parent)
                AppRecordManager.backHistory();
        }
        cancelHandler() {
            this.continueFun = null;
            if (this.parent)
                AppRecordManager.backHistory();
        }
        /*@override*/
        onHide() {
            super.onHide();
            Laya.timer.callLater(this, this.endCallHandler);
        }
        /** 结束回调 */
        endCallHandler() {
            runFun(this.continueFun);
            runFun(this.callback);
            this.callback = this.continueFun = null;
            if (this.cacheMessage.length > 0) {
                let arr = this.cacheMessage.shift();
                this._showWindow(arr.msg, arr.obj, arr.callback, arr.continue, arr.isAction);
            }
        }
        /** 清理缓存 */
        clearCache() {
            this.cacheMessage.splice(0, this.cacheMessage.length);
            if (this.parent)
                this.hideImmediately();
        }
        /**
         * 带确认按钮的提示框
         * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param callback 确定回调方法
         * @param isAction 动画显示或关闭
         *
         * @deprecated
         * @see LibStr
         * @see ActionLib.GAME_SHOW_PROMPT_WINDOW
         */
        showTip(msg, callback, isAction = true) {
            if (!this.isPromptData(msg))
                msg = {
                    msg: msg,
                    callback: callback,
                    obj: { cancelName: getString(1066 /* LibStr.OK */) },
                    isAction: isAction
                };
            this._show(msg);
        }
        /**
         * 带确认 取消按钮的提示框
         * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param options 附带设置 (okName:'', cancelName:'')
         * @param callback 取消回调方法
         * @param continueFun 确定回调方法
         * @param isAction 动画显示或关闭
         * @deprecated
         * @see LibStr
         * @see ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW
         */
        showCancelTip(msg, options, callback, continueFun, isAction = true) {
            this._show({ msg: msg, obj: options, callback: callback, continue: continueFun, isAction: isAction });
        }
        _showWindow(msg, options, callback, continueFun, isAction = true) {
            if (!this.isPromptData(msg))
                msg = {
                    msg: msg,
                    obj: options,
                    callback: callback,
                    continue: continueFun,
                    isAction: isAction
                };
            this._show(msg);
        }
        _show(data) {
            var _a, _b;
            let msg = data.msg;
            if (Array.isArray(msg)) {
                msg = getString.apply(null, msg);
            }
            else {
                msg = getString(msg);
            }
            if (this.parent) {
                this.cacheMessage.push(data);
                return;
            }
            // if (msg === CommonCmd.RECHARGE) {
            //     AnalyticsManager.sendGameAnalysis("NoBalance_Pop")
            // }
            let obj = data.obj;
            obj !== null && obj !== void 0 ? obj : (obj = { okName: getString(1065 /* LibStr.CONTINUE */), cancelName: getString(1067 /* LibStr.CANCEL */) });
            (_a = obj.okName) !== null && _a !== void 0 ? _a : (obj.okName = getString(1065 /* LibStr.CONTINUE */));
            (_b = obj.cancelName) !== null && _b !== void 0 ? _b : (obj.cancelName = getString(1067 /* LibStr.CANCEL */));
            this.isAction = data.isAction || true;
            this.show();
            if (this.continueBtn)
                this.continueBtn.text = obj.okName;
            if (this.cancelBtn)
                this.cancelBtn.text = obj.cancelName;
            if (this.controller)
                this.controller.selectedIndex = data.continue ? 1 : 0;
            if (this.controller2)
                this.controller2.selectedIndex = data.title ? 1 : 0;
            if (this.controller3)
                this.controller3.selectedIndex = data.continue ? 1 : 0;
            this.content.text = msg;
            if (this.titleText)
                this.titleText.text = data.title || "";
            this.callback = data.callback;
            this.continueFun = data.continue;
        }
        /*@override*/
        dispose() {
            this.clearCache();
            Laya.timer.clearAll(this);
            PromptWindow._instance = null;
            super.dispose();
        }
        /**
         * 判断是否是接口 用 prototype 是否存在判断
         * @param optional
         */
        isPromptData(optional) {
            return typeof optional === "object" && ("msg" in optional);
        }
    }
    gameLib.PromptWindow = PromptWindow;
    /** 提示框 */
    class RechargeSuccessWindow extends BaseWindow {
        static get inst() {
            var _a;
            (_a = RechargeSuccessWindow._instance) !== null && _a !== void 0 ? _a : (RechargeSuccessWindow._instance = new RechargeSuccessWindow());
            return RechargeSuccessWindow._instance;
        }
        constructor() {
            super();
            /** 缓存的提示框 */
            this.cacheMessage = [];
            this.modal = true;
        }
        /*@override*/
        onInit() {
            this.contentPane = fgui.UIPackage.createObjectFromURL("//common/RechargeSuccessWindow").asCom;
            super.onInit();
            this.content = this.contentPane.getChild("n2").asTextField;
            this.closeButton = this.contentPane.getChild("n3").asButton;
            this.continueBtn = this.contentPane.getChild("n4").asButton;
            this.continueBtn.onClick(this, this.continueHandler);
        }
        continueHandler() {
            if (this.parent)
                AppRecordManager.backHistory();
        }
        /*@override*/
        onHide() {
            super.onHide();
            Laya.timer.callLater(this, this.endCallHandler);
        }
        /** 结束回调 */
        endCallHandler() {
            runFun(this.callback);
            this.callback = null;
            if (this.cacheMessage.length > 0) {
                let arr = this.cacheMessage.shift();
                this.showTip.apply(this, arr);
            }
        }
        /** 清理缓存 */
        clearCache() {
            this.cacheMessage.splice(0, this.cacheMessage.length);
            if (this.parent)
                this.hideImmediately();
        }
        /*@override*/
        doShowAnimation() {
            super.doShowAnimation();
        }
        /**
         * 带确认按钮的提示框
         * @param msg
         * @param callback
         * @param isAction
         */
        showTip(msg, callback, isAction = true) {
            if (this.parent) {
                this.cacheMessage.push([msg, callback, isAction]);
                return;
            }
            this.isAction = isAction;
            this.show();
            this.content.text = msg;
            this.callback = callback;
        }
        /*@override*/
        dispose() {
            this.clearCache();
            Laya.timer.clearAll(this);
            RechargeSuccessWindow._instance = null;
            super.dispose();
        }
    }
    gameLib.RechargeSuccessWindow = RechargeSuccessWindow;
    /**
     * 房间通告
     * @author boge
     */
    class RoomNotice extends fgui.GComponent {
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.loader = this.getChild("n1").asLoader;
            this.userName = this.getChild("n2").asTextField;
            this.money = this.getChild("n3").asTextField;
        }
        show(name, money, url) {
            this.userName.text = name;
            this.money.text = money + "";
            this.loader.url = url;
            this.visible = true;
            Laya.timer.once(3000, this, this.hide);
        }
        hide() {
            Laya.timer.clear(this, this.hide);
            this.visible = false;
        }
        /*@override*/
        dispose() {
            this.hide();
        }
    }
    gameLib.RoomNotice = RoomNotice;
    /** 加载 */
    class WaitResult extends fgui.GComponent {
        static get inst() {
            if (!this._instance) {
                fgui.UIObjectFactory.setPackageItemExtension("//gameCommon/WaitResult", WaitResult);
                this._instance = fgui.UIPackage.createObjectFromURL("//gameCommon/WaitResult");
            }
            return this._instance;
        }
        /*@override*/
        onConstruct() {
            super.onConstruct();
            this.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            this.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this.img = this.getChild("n0").asImage;
            this.graph = this.getChild("n1").asGraph;
        }
        show() {
            this.graph.visible = this.img.visible = false;
            fgui.GRoot.inst.addChild(this);
            Laya.timer.once(1000, this, this.showContent);
        }
        showContent() {
            this.graph.visible = this.img.visible = true;
        }
        hide() {
            Laya.timer.clear(this, this.showContent);
            this.removeFromParent();
        }
    }
    gameLib.WaitResult = WaitResult;
})(gameLib || (gameLib = {}));
