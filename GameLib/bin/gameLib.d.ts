declare namespace gameLib {
    export class BaseView extends tsCore.EView {
        constructor();
    }
    export enum ActionLib {
        INIT_DEVICE_DATA = "init_device_data",
        CHECK_LOGIN_STATE = "check_login_state",
        START_MAIN_LOAD_RES = "start_main_load_res",
        /** reg gameCommon class */
        GAME_REG_GAME_COMMON_CLASS = "game_reg_game_common_class",
        HOME_SCENE = "homeScene",
        /** 检查游戏的状态 */
        GAME_CHECK_STATE = "game_check_state",
        /** 初始化游戏的通信 */
        GAME_INIT_SERVLET = "game_init_servlet",
        /** 链接游戏的socket */
        GAME_CONNECT_SOCKET = "game_connect_socket",
        /** 游戏扩展的类初始化 */
        GAME_INSERT_EXTENSION = "game_insert_extension",
        /** 注册游戏中的socket监听 */
        GAME_INIT_SOCKET_EVENT = "game_init_socket_event",
        /** 创建游戏到舞台上 */
        GAME_CREATE_SCENE_SHOW = "game_create_scene_show",
        /** 初始化model */
        GAME_INIT_MODEL = "game_init_model",
        /** 开始游戏 */
        GAME_START = "game_start",
        /** 清理游戏 */
        GAME_DISPOSE = "game_dispose",
        /** 清理游戏资源 */
        GAME_CLEAR_RES = "game_clear_res",
        /** 游戏网络从连 */
        GAME_RECONNECTION_NET = "game_reconnection_net",
        /** 游戏更新余额 */
        GAME_UPDATE_MONEY = "game_update_money",
        /** 重置游戏下注 */
        GAME_RESET_BET = "game_reset_bet",
        /** 播放金币动画 */
        PLAY_GOLD_EFFECT = "play_gold_effect",
        /** 关闭金币动画 */
        CLOSE_GOLD_EFFECT = "close_gold_effect",
        /** 显示活动弹窗 */
        GAME_ACTIVITY_WINDOW_SHOW = "game_activity_window_show",
        /** 用户使用活动卷 激活界面变化 */
        GAME_USE_ACTIVITY = "game_use_activity",
        /** 用户停止使用活动卷 激活界面变化 */
        GAME_STOP_USE_ACTIVITY = "game_stop_use_activity",
        /** 用户使用活动卷结束 激活界面变化 */
        GAME_USE_ACTIVITY_END = "game_use_activity_end",
        /** 更新活动卷使用变化 */
        GAME_UPDATE_USE_ACTIVITY_CHANGE = "game_update_use_activity_change",
        /** 打开活动也帮助 */
        GAME_ACTIVITY_HELP_WINDOW_SHOW = "game_activity_help_window_show",
        /** 活动窗口关闭 */
        GAME_ACTIVITY_WINDOW_CLOSE = "game_activity_window_close",
        /** 游戏押注变化 */
        GAME_BET_CHANGE = "game_bet_change",
        /** 提示用户有可以使用的优惠券 */
        GAME_PROMPT_CAN_USE_ACTIVITY = "game_prompt_can_use_activity",
        /** 显示游戏账户充值界面 */
        GAME_SHOW_ACCOUNT_TOP_UP = "game_show_account_top_up",
        /** 游戏房间选择 */
        GAME_SHOW_ROOM_SELECT = "game_show_room_select",
        /** 更新游戏房间号变化 */
        GAME_UPDATE_ROOM_ID_CHANGE = "game_update_room_id_change",
        /** 显示领取奖金窗口 */
        GAME_SHOW_JACKPOT_WINDOW = "game_show_jackpot_window",
        /** 更新奖金池金额 */
        GAME_UPDATE_JACKPOT_POOL = "game_update_jackpot_pool",
        /** 增加奖金 奖金池掉落金币 */
        GAME_JACKPOT_BONUS_ANIMATION = "game_jackpot_bonus_animation",
        /** 显示奖金中的钱 */
        GAME_SHOW_JACKPOT_WIN_WINDOW = "game_show_jackpot_win_window",
        /** 显示房间公告 */
        GAME_SHOW_ROOM_NOTICE = "game_show_room_notice",
        /** 运行舞台的事件 */
        GAME_RUN_SCENE_EVENT = "game_run_scene_event",
        /** 更新默认舞台方向 */
        GAME_UPDATE_DEFAULT_SCREEN = "game_update_default_screen",
        /** 播放 slot 滚动动画 */
        GAME_PLAY_SLOT_LIST_RUN_ANI = "game_play_slot_list_run_ani",
        /** 通知开奖动画完成 执行model的结束方法 */
        GAME_LOTTERY_ANI_COMPLETE = "game_lottery_ani_complete",
        /** 获得手机图片数据 */
        GET_MOBILE_PHONE_IMAGE_DATA = "get_mobile_phone_image_data",
        /** 更新活动奖池数据 */
        UPDATE_DAILY_CASH_POOL = "update_daily_cash_pool",
        /** 播放 wheel 滚动动画 */
        GAME_PLAY_WHEEL_RUN_ANI = "game_play_wheel_run_ani",
        /** 显示普通的赢钱金额(公共的弹窗) */
        GAME_SHOW_WIN_WINDOW = "game_show_win_window",
        /** 打开一次礼包结束 */
        GAME_OPEN_GIFT_END = "game_open_gift_end",
        /** 显示引导页 */
        GAME_SHOW_GUIDE = "game_show_guide",
        /** 显示引导页 */
        GAME_SHOW_GUIDE_WINDOW = "game_show_guide_window",
        /**
         * 显示提示文案窗口 :
         * ```
         *  msg:string 直接显示文本
         *  callback:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         * ```
         * @see PromptWindow.showTip
         */
        GAME_SHOW_PROMPT_WINDOW = "game_show_prompt_window",
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
        GAME_SHOW_PROMPT_CANCEL_WINDOW = "game_show_prompt_cancel_window",
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
        GAME_SHOW_PROMPT_NORMAL_WINDOW = "game_show_prompt_normal_window",
        /** 游戏新的回合开始 */
        GAME_NEW_ROUND_START = "GAME_NEW_ROUND_START",
        /** 游戏 */
        GAME_CLOSE_ALL_ANI = "game_close_all_ani",
        /** 显示帮助文档 */
        GAME_SHOW_HELP = "game_show_help",
        /** 播放动画 */
        GAME_PLAY_LOTTERY_ANI = "game_play_lottery_ani",
        /** 更改 spin 模式文字 0 spin 1 stop */
        GAME_CHANGE_SPIN_TEXT = "game_change_spin_text",
        /** 改变所有按钮的状态 */
        GAME_ALL_BTN_CHANGE_STATE = "game_all_btn_change_state",
        /** 更新赢钱的值 */
        GAME_UPDATE_WIN_VALUE = "game_update_win_value",
        /**
         * 游戏更新自动SPIN次数
         */
        GAME_UPDATE_AUTO_SPIN_NUMBER = "game_update_auto_spin_number",
        /**
         * 游戏更新自动bet次数
         * @deprecated
         * @see GAME_UPDATE_AUTO_SPIN_NUMBER
         */
        GAME_UPDATE_AUTO_BET_NUMBER = "game_update_auto_spin_number",
        /**
         * 游戏更新免费次数
         * @deprecated
         * @see GAME_UPDATE_AUTO_SPIN_NUMBER
         */
        GAME_UPDATE_FREE_COUNT = "game_update_auto_spin_number",
        /** 播放收金币动画 */
        GAME_PLAY_COLLECT_GOLD_COINS_ANI = "game_play_collect_gold_coins_ani",
        /** 显示free窗口 */
        GAME_SHOW_FREE_WINDOW = "game_show_free_window",
        /** 隐藏free窗口 */
        GAME_HIDE_FREE_WINDOW = "game_hide_free_window",
        /** 显示freeUI */
        GAME_SHOW_FREE_UI = "game_show_free_ui",
        /** 隐藏freeUI */
        GAME_HIDE_FREE_UI = "game_hide_free_ui",
        /** 显示free 结束界面 */
        GAME_SHOW_FREE_FINISH_VIEW = "game_show_free_finish_view",
        /** 显示结算UI */
        GAME_SHOW_SETTLE_WIN_UI = "game_show_settle_win_ui",
        /** 显示默认提示语 */
        GAME_SHOW_DEFAULT_TIP = "game_show_default_tip",
        /** 执行播放背景音乐 */
        GAME_PLAY_BG_MUSIC = "game_play_bg_music",
        /** 更新总投注 */
        GAME_UPDATE_TOTAL_BET = "game_update_total_bet",
        /** 更新bounds信息 */
        GAME_UPDATE_BOUNDS_INFO = "game_update_bounds_info"
    }
    /** 加载资源配置 */
    export class LoaderConfig {
        /**
         * 清理资源
         * @param res 要清理的资源数组
         */
        static clear(res: LoadRes[]): void;
    }
    /**
     * 游戏类型
     */
    export enum GameType {
        /** 正常游戏 */
        NORMAL = 0,
        /** 连线游戏 */
        SLOT = 1
    }
    /**
     * 游戏数据的基类
     */
    export class BaseGameData implements IGameData {
        /** 缓存的下注值 */
        cacheAnte: any;
        /** 服务器发来的当前余额 */
        currentBalance: number;
        /** 后端计算   当前盈利 */
        serverWinMoney: number;
        totalWinMoney: number;
        playCount: number;
        /** 缓存 后端计算 当前盈利 */
        tempServerWinMoney: number;
        /** 当前玩家选择的自动bet次数 */
        autoBetCount: number;
        /** 当前玩家选择的自动bet次数 (缓存) */
        tempAutoBetCount: number;
        /** bet 额度切换值 */
        betMoney: any[];
        /** 当前bet值 */
        betValue: number;
        /** 开奖结果 */
        lotteryId: any[];
        /** 是否已经弹出过一次推荐现金游戏 */
        isRecommend: boolean;
        /** 通知数据 */
        noticeData: any[];
        /** 默认bet位置 */
        defaultBetIndex: number;
        /**
         * 当前是否在特殊模式
         * @default false
         */
        specialMode: boolean;
        /**
         * 重置默认bet值
         * @default false
         */
        isResetBetValue: boolean;
        /** 游戏类型 */
        gameType: GameType;
        /**
         * 总金额 default BaseGameData.betValue
         */
        getTotalBetMoney(): number;
        /**
         * 获取赢钱动画 的播放时长
         * @param level 播放时长等级 0开始
         */
        getWinMoneyAniDuration(level: number): number;
        /**
         * 是否达到 BigWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=10] 倍数
         * @return
         */
        isBigWin(isTotal?: boolean, multiple?: number): boolean;
        /**
         * 是否达到 MegaWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=30] 倍数
         * @return
         */
        isMegaWin(isTotal?: boolean, multiple?: number): boolean;
        /**
         * 是否达到 SuperWin 的值
         * @param [isTotal=false] 是否看总金额
         * @param [multiple=60] 倍数
         */
        isSuperWin(isTotal?: boolean, multiple?: number): boolean;
        reportError(): string;
    }
    /** 游戏主页必须继承的类 */
    export class BaseScene<T extends BaseGameData = BaseGameData> extends BaseView implements IGameScene, IGuideScene {
        /** 选择房间事件 */
        EVENT_SELECT_ROOM: string;
        /** demo场试玩事件 */
        EVENT_DEMO_TIP: string;
        /** 引导事件 */
        EVENT_GUIDE: string;
        /** 优惠券事件 */
        EVENT_COUPON: string;
        /** bonus事件 */
        EVENT_BONUS: string;
        protected _gameModel: IGameModel;
        /** 游戏说明 */
        protected guideSprite: fgui.GLoader;
        /** 启动事件 */
        protected startupEvent: {
            handler: ParamHandler;
            weight?: number;
            name?: string;
        }[];
        /** 当前游戏的活动按钮 */
        activityBtn: ActivityButton;
        /** 提示文案 */
        promptTip: PromptTip;
        /** 奖金组件 */
        jackpotBtn: any;
        /** 是否在执行运行事件 */
        private isRunEvent;
        constructor();
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
        protected onConstruct(): void;
        /**
         * 房间号变更
         * @param value 房间号
         */
        protected updateRoomIdChange(value: number): void;
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        protected showPromptActivity(comp: fgui.GComponent, downward?: any): void;
        /** 押注变化 */
        private betChangeHandler;
        /**
         * 初始化活动卷
         * @param component 获取活动按钮的父组件
         * @param isOpenDrag 是否开启拖动(默认true)
         * @param isAutoHide 当没有优惠卷使用的时候 是否自动隐藏(默认true)
         */
        protected initActivityMenu(component: fgui.GComponent, isOpenDrag?: boolean, isAutoHide?: boolean): void;
        /** 更新中优惠券数量 */
        protected updateTotalCoupons(): void;
        protected activityHandler(): void;
        /** 发送投注劵使用结束 */
        sendBetCouponEnd(): void;
        /**
         * 舞台显示
         */
        protected addedHandler(): void;
        drawGuideRect(guideView: IGuide, index: number): void;
        clickGuide(guideView: IGuide, index: number): void;
        guideEnd(guideView: IGuide): void;
        /** 注册进入事件 */
        protected regEvent(): void;
        /**
         * 注册启动事件
         * @param handler 执行的方法
         * @param weight 权重 越大越后执行  默认0
         * @param name 事件名字 默认 null
         */
        regStartupEvent(handler: ParamHandler, weight?: number, name?: any): void;
        /**
         * 在指定位置插入一个事件
         * @param index 位置
         * @param handler 方法
         * @param weight 权重 默认0
         * @param name 事件名字 默认 null
         */
        regStartupEventIndex(index: number, handler: ParamHandler, weight?: number, name?: any): void;
        /**
         * 根据事件名字 获取事件的执行位置
         * @param name 事件名字
         */
        getStartupEventIndex(name: string): number;
        /**
         * 删除指定位置的启动事件
         * @param index 位置
         */
        removeStartupEventIndex(index: number): void;
        /**
         * 删除指定名字的启动事件
         * @param name 事件名字
         */
        removeStartupEventName(name: string): void;
        /**
         * 执行事件列表
         */
        runEvent(): void;
        /** 开始运行事件前 */
        protected runEventStart(): void;
        /** 运行事件结束 */
        protected runEventEnd(): void;
        /**
         * 重新连接网络 同步数据
         * @param callback 同步完成调用
         * @param count 剩余重复次数
         */
        reconnectionNet(callback: ParamHandler, count?: number): void;
        /** 新游戏开始  这里可以处理一些逻辑 */
        newGameStartLogic(handler?: ParamHandler): void;
        /**
         * 显示邀请进入cash场
         * @param handler 回调
         */
        showInviteRealMoney(handler?: ParamHandler): void;
        /**
         * 新一轮游戏的开始
         */
        startGame(): void;
        /** 更新金额 */
        updateMoney(): void;
        hideRecord(): void;
        get gameModel(): IGameModel;
        set gameModel(value: IGameModel);
        /** 押注还原(用于押注失败  退还所有的押注) */
        resetBet(): void;
        dispose(): void;
        protected backHandler(): void;
        protected eventSelectRoom(): void;
        /**
         * demo场弹窗
         */
        protected eventGuestTip(): void;
        protected eventCouponTip(): void;
        protected eventBonusTip(): void;
        /** 引导事件执行 */
        protected eventGuideTip(): void;
        /** 显示引导页 默认不显示引导页 */
        protected showGuide(): boolean;
        /**
         * 加载全屏图片
         * @param value
         */
        protected loadFillImage(value: any): void;
    }
    export class BaseSkeletonWindow<T extends BaseGameData = BaseGameData> extends tsCore.SkeletonWindow {
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
    }
    export class BaseSlotGameData extends BaseGameData {
        /** 中奖配置表 按列排序 */
        lottery: number[][];
        /** 线数字 */
        lineNum: number[][];
        /** 是否快速播放 */
        private _isTurboMode;
        /** 当前购买的线 */
        lineValue: number;
        /** 玩家赢的线 */
        lines: any[];
        /** 项目总数 */
        itemCount: number;
        /** 临时存储开奖结果 */
        tempLotteryId: any[];
        /** 玩家的中奖项 */
        userWinArray: any[];
        /** 小奖 要最少满足3个的线 */
        smallPrize: number[];
        /** 默认线位置 */
        defaultLineIndex: number;
        /** 是否有免费游戏 1 就是免费游戏 */
        hasFreeSpin: number;
        /** 是否进入免费模式开奖流程 */
        isFreeModel: boolean;
        /** 免费游戏押注参数 */
        freeBetTotalObj: any;
        /** free spin 原始数据 */
        freeSpinObj: any;
        /** 免费游戏剩余次数 */
        freeCount: number;
        /** 第一列是否存在 bounds */
        firstExistBounds: boolean;
        /** 当前开出免费游戏的个数 */
        freeBoundsCount: number;
        /**
         * 是否有 reSpin
         */
        hasReSpin: number;
        constructor();
        /** 总共要投注的钱 */
        getTotalBetMoney(): number;
        /** 获取当前的开奖数据 */
        getLotteryId(): any[];
        /**
         * 获取指定线的开奖规则模版
         * @param index 线 0开始
         */
        getLottery(index: number): number[];
        /**
         * 获取每列 list 的值
         * @param index 列
         * @return 返回所拥有的值
         */
        getSlotListArr(index: number): number[];
        /**
         * 为每列 list 赋新的值
         * @param index 列
         * @param ar 新的值
         */
        setSlotListArr(index: number, ar: number[]): void;
        /**
         * 数组长度不够需要 那么添加几个随机值
         * @param arr 数字数组
         * @param min 随机的最小值 默认 1
         * @param max 随机的最大值(不包括) 默认 10
         * @return 符合所有值的数组
         */
        getRandomNumber(arr: number[], min?: number, max?: number): number[];
        get isTurboMode(): boolean;
        set isTurboMode(value: boolean);
    }
    /**
     * Slot 渲染状态
     */
    export enum SlotItemType {
        NORMAL = 0,
        DARK = 1,
        WIN = 2
    }
    /**
     * slot 单独项
     */
    export class BaseSlotItem extends tsCore.ELabel {
        /**
         * 当前项状态
         * @default SlotItemType.NORMAL
         * @protected
         */
        protected state: SlotItemType;
        /** 还原最原始状态 */
        resetUI(): void;
        /** 显示中奖 */
        showWin(): void;
        /** 变暗 */
        dark(): void;
        /**
         * 刷新界面
         */
        refresh(): void;
        /**
         * 变暗取消
         * @deprecated
         */
        darkCancel(): void;
    }
    export class BaseSlotView<T extends BaseSlotGameData = BaseSlotGameData> extends BaseView {
        /** 线的面板 */
        protected linePanel: fgui.GComponent;
        /** 绘制线 */
        protected lineGraphics: Laya.Graphics;
        /** 滚动开奖列表 */
        protected list: fgui.GList;
        /** 线数字 */
        protected lineNum: number[][];
        /** 当前显示的中奖线 */
        protected showLineIndex: number;
        /** 左侧线名字列表 */
        protected leftLineList: fgui.GList;
        /** 右侧线名字列表 */
        protected rightLineList: fgui.GList;
        /** 线的大小 */
        protected lineSize: number;
        /** 线颜色 */
        protected lineColor: string;
        /** 是否是第一次播放完一次完整的中奖结果 */
        protected isFirstPlayComplete: boolean;
        protected onInit(): void;
        /**
         * 绘制指定获胜线
         * @param value 线名字 从 1 开始
         * @param alone 是否单独显示 默认 false
         * @param lowGrade 是否包含下级 默认 false
         */
        protected showLine(value: number, alone?: boolean, lowGrade?: boolean): void;
        /**
         * 自动播放中奖的项
         * @param isChangeFirst 默认true   第一次播放完所有线 调用一次playFirstComplete()
         * @protected
         */
        protected showWinning(isChangeFirst?: boolean): void;
        /**
         * 显示赢的那条线上所有项
         * @param winIndex 赢的线 0开始
         */
        protected showWinSlotItem(winIndex: number): void;
        /**
         * 显示某列中奖
         * @param colIndex
         * @param dataArr
         */
        protected showColumnWin(colIndex: any, dataArr: any[]): void;
        protected nextLine(): void;
        /** 所有中奖项 第一次播放完成调用  需要设置 showWinning(true) */
        protected playFirstComplete(): void;
        /**
         * 初始化 list 列表
         * @param index list 列表位置
         * @param child list 对象
         */
        protected initListHandler(index: number, child: fgui.GList): void;
        /**
         * 渲染列表
         * @param index 位置
         * @param item 项
         */
        protected listItemHandler(index: number, item: BaseSlotItem): void;
        /**
         * 单独显示指定位置的项
         * @param col 列
         * @param index 位置
         */
        showItem(col: number, ...index: any[]): void;
        /***
         * 单独显示指定id的项
         * @param id 中奖的id
         */
        showDataItem(id: any): void;
        /** 获取单个滚动列表 */
        getList(value: number): fairygui.GList;
        /** 所有的项变暗 */
        protected allSlotItemDark(): void;
        getSlotModel(): SlotModel<BaseSlotGameData>;
        dispose(): void;
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
    }
    export class BaseStarter extends tsCore.EProxy {
        baseScene: BaseScene;
        gameServlet: GameServlet;
        gameModel: GameModel;
        private callback;
        constructor();
        /**
         * 创建游戏到舞台
         * @param handler 创建完成回调
         */
        protected createSceneShow(handler: ParamHandler): void;
        /** 当前游戏的方向 */
        updateScreenOrientation(): void;
        /** 创建并显示一个舞台 */
        protected createShowScene(url: string, cls: any): void;
    }
    export class BaseWindow<T extends BaseGameData = BaseGameData> extends tsCore.EWindow {
        /**
         * 是否在关闭窗口的时候  发送 ActionLib.GAME_RUN_SCENE_EVENT
         * @default false
         */
        isRunSceneEvent: boolean;
        protected closeEventHandler(): void;
        protected onHide(): void;
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
    }
    /**
     *
     * @author boge
     *
     */
    export class GameModel<T = BaseGameData> extends tsCore.EProxy implements IGameModel {
        protected _gameScene: IGameScene;
        protected _gameServlet: IGameServlet;
        /** 游戏番号 */
        protected _gameCode: number;
        /** 原始音乐备份 */
        protected musicBack: any;
        /** 大厅model */
        private _homeModel;
        /** 当前屏幕方向 */
        gameScreenType: string;
        /** 任务 */
        protected tasks: {
            args: any;
            handler: ParamHandler;
        }[];
        protected constructor();
        initModel(): void;
        initSocketEvent(): void;
        private showNotice;
        /** 通知资金变化 */
        private moneyChange;
        /** 通知信息 */
        private notificationHandler;
        /**
         * 计划任务
         * @param args 参数
         * @param handler
         */
        addTask(args: any, handler: ParamHandler): void;
        /**
         * 执行一次预计划任务
         */
        runTask(): void;
        /**
         * 注册socket 事件
         * @param type
         * @param callback
         */
        addSocketEvent(type: number, callback: ParamHandler): void;
        removeSocketEvent(type: number): void;
        clearRes(): void;
        /** 设置游戏音乐 */
        protected setupMusic(): void;
        /** 还原游戏音乐 */
        protected resetMusic(): void;
        /** 子类实现 */
        insertExtension(): void;
        /** 通知开奖结束  进入结束流程 */
        protected lotteryComplete(): void;
        /** 游戏进入后台执行 */
        blurGame(): void;
        /** 游戏进入前台执行 */
        focusGame(): void;
        get gameScene(): IGameScene;
        get gameServlet(): IGameServlet;
        dispose(): void;
        set gameCode(value: number);
        get gameCode(): number;
        socketHandler(obj: any): void;
        get homeModel(): IHomeModel;
        set gameScene(value: IGameScene);
        set gameServlet(value: IGameServlet);
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
    }
    /**
     * 游戏基础类
     * @author boge
     */
    export abstract class GameServlet<T extends BaseGameData = BaseGameData> extends tsCore.EProxy implements IGameServlet {
        protected _gameModel: IGameModel;
        protected initHandler: ParamHandler;
        /** 当前访问接口获得游戏状态 */
        protected gameStatus: number;
        /** 网络通信名字 */
        networkName: string;
        protected constructor();
        protected get gameData(): T;
        /**
         * @deprecated
         */
        protected set gameData(value: T);
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
        getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): void;
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
        getData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, overtime?: number): void;
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
        post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: string[], overtime?: number): void;
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
        postData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: string[], overtime?: number): void;
        /**
         *
         * @param handler
         */
        checkState(handler: ParamHandler): void;
        /**
         * 进入游戏失败
         * @param [isTip = true] 是否需要弹窗
         * @param message 弹窗内容
         */
        protected enterFail(isTip?: boolean, message?: string): void;
        init(handler: ParamHandler): void;
        /** 连接该游戏的socket */
        protected connectSocket(): void;
        protected userDataErrorHandler(data: any): void;
        /** 用户数据 */
        protected userDataHandler(data: any): void;
        /**
         * 读取奖金池数据
         * @param data
         */
        readJackpotData(data: HttpData): void;
        /** 获取投注劵 */
        protected getCoupon(): void;
        /** 收到投注劵数据 */
        protected couponHandler(data: HttpResponse): void;
        initComplete(): void;
        /**
         * 解析初始化数据
         * @param data
         *
         */
        protected abstract parseInitData(data: HttpResponse): any;
        /**
         * 拉取账户金额
         * @param callback
         * @param error
         */
        getUserMoney(callback: ParamHandler, error?: ParamHandler): void;
        /**
         * 检查游戏期数
         * @param handler
         *
         */
        checkGamePeriod(handler: ParamHandler): void;
        /**
         * 发送押注数据
         * @param url
         * @param data
         * @param callback
         */
        sendBet(url: string, data: any, callback: ParamHandler): void;
        /**
         * 领取奖金池
         * @param id
         * @param handler
         */
        jackPotClaim(id: string, handler: ParamHandler): void;
        protected jackPotClaimHandler(handler: ParamHandler, data: any): void;
        /**
         * 显示获取的非200的结果显示弹窗
         * @param data 服务器返回的完整数据
         * @param [closeGame=true] 是否关闭游戏
         */
        protected showNotResult(data: any, closeGame?: boolean): void;
        get gameModel(): IGameModel;
        set gameModel(value: IGameModel);
        dispose(): void;
    }
    /**
     * 需要加载资源的组件
     * @author boge
     *
     */
    export class LoadComponent extends BaseView {
        /** 是否已经初始化 */
        private isInit;
        /** 需要加载的资源 */
        private loadArray;
        /** 内容面板 */
        private _contentPane;
        constructor();
        protected addedHandler(): void;
        private progressHandler;
        protected loadErrorHandler(): void;
        private resLoaderComplete;
        set contentPane(value: fgui.GComponent);
        get contentPane(): fgui.GComponent;
        protected onShow(): void;
        addSources(array: any[]): void;
    }
    export abstract class SlotModel<T extends BaseSlotGameData = BaseSlotGameData> extends GameModel<T> {
        /** 运动 list 数组列表 */
        protected listRolls: fgui.GList[];
        /** 开奖数据  {arr isTurboMode itemCount} */
        protected lotteryData: ISlotLotteryData[];
        /** 缓动的缓存 */
        protected tweenList: Laya.Tween[];
        /** 完成动画数量 */
        protected completeCount: number;
        /** 是否是向上滚动的 一般开始的位置都是顶部 */
        protected isScrollUp: boolean;
        /** 特殊玩法  */
        SPECIAL_PLAY: number;
        /** 可以替换任何东西的 */
        WILD: number;
        /** 满足2个就可以连上的线否则至少3个才可以连线,存放图片id */
        protected smallPrize: any[];
        /** 滚动列表展示行数 默认3行 */
        rowNum: number;
        /** 滚动列表展示列数 默认5列 */
        colNum: number;
        /**
         * 全部滚动结束延迟时间
         * @protected
         */
        protected allEndDelay: number;
        constructor();
        /**
         * 添加 list 滚动对象
         * @param list 滚动的 list
         */
        addRollList(list: fgui.GList): void;
        /** 获取列表数组 */
        getRollLists(): fairygui.GList[];
        /** 获取指定位置的列表 */
        getRollList(index: any): fairygui.GList;
        /**
         * 播放开奖
         */
        protected playLottery(value: ISlotLotteryData[]): void;
        /** 立即停止开奖动画 */
        stopTween(): void;
        /**
         * 当前滚动列数据处理完毕调用
         * @param index 滚动的列
         * @param lotteryData 当前滚动列数据
         */
        onScrollTween(index: number, lotteryData: ISlotLotteryData): void;
        /** 开始播放结果动画 */
        protected startPlayResultTween(): void;
        /**
         * 获取滚动圈数 默认4圈
         * @param index list 所在列
         */
        protected getLaps(index: number): number;
        /**
         * 设置即将播放的数据值
         * @param index listRolls 循环的下标
         */
        protected setRenderListData(index: number): void;
        /** 开始开奖逻辑处理 */
        protected onLogicLotteryStart(): void;
        /** 结束开奖逻辑处理 */
        protected onLogicLotteryEnd(): void;
        /**
         * 获取list单独一块的高度
         * @param list
         * @protected
         */
        protected getItemHeight(list: fgui.GList): number;
        /**
         * 获取 Laya.Tween 运行时长
         * @param index list 所在列
         * @param isTurboMode 是否快速播放
         * @return 运行时长
         */
        protected abstract getDuration(index: number, isTurboMode: boolean): any;
        /**
         * 获取 Laya.Tween 运行延迟
         * @param index list 所在列
         * @param isTurboMode 是否快速播放
         * @return 延迟值
         */
        protected abstract getDelay(index: number, isTurboMode: boolean): any;
        /**
         * 判断此列表是否需要滚动
         * @param list 列表
         * @param index 位置
         * @return true 继续滚动  false 停止滚动
         */
        protected isRunList(list: fgui.GList, index: number): boolean;
        /** 滚动结束一次调用方法 */
        protected oneComplete(list: fgui.GList): void;
        /**
         * 全部滚动结束调用方法，当 allEndDelay 参数大于0时 会延迟执行
         * @protected
         */
        protected rollComplete(): void;
        /**
         * 判断当前开的奖里面是否有中奖线
         * @param lotteryId 服务器返回的开奖项
         * @param arr 当前对比的开奖项
         */
        protected compare(lotteryId: number[], arr: number[]): boolean;
        /**
         * 获取中奖类型开奖的值
         * @param lotteryId 开奖数组
         * @param lottery 判断中奖类型数组
         */
        getExistValue(lotteryId: number[], lottery: number[]): number[];
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
        getRotationLong(item: number, count: number, Qmin: number, Qmax: number, location: number): number;
        /**
         * list使用的数据转换 切换成列的数据
         * @param arr 通用的数据
         * @return
         */
        changeListData(arr: any[]): any[];
        /**
         * 开始运动时是向后跟踪，再倒转方向并朝目标移动，稍微过冲目标，然后再次倒转方向，回来朝目标移动。
         * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
         * @param    b 指定动画属性的初始值。
         * @param    c 指定动画属性的更改总计。
         * @param    d 指定运动的持续时间。
         * @param    s 指定过冲量，此处数值越大，过冲越大。
         * @return 指定时间的插补属性的值。
         */
        backInOut(t: number, b: number, c: number, d: number, s?: number): number;
        /**
         * 开始运动时是朝目标移动，稍微过冲，再倒转方向回来朝着目标。
         * @param    t 指定当前时间，介于 0 和持续时间之间（包括二者）。
         * @param    b 指定动画属性的初始值。
         * @param    c 指定动画属性的更改总计。
         * @param    d 指定运动的持续时间。
         * @param    s 指定过冲量，此处数值越大，过冲越大。
         * @return 指定时间的插补属性的值。
         */
        backOut(t: number, b: number, c: number, d: number, s?: number): number;
        /**
         * 根据服务器发送的位置坐标 获取 list 行
         * @param index
         */
        getServerIndexRow(index: number): number;
        /**
         * 根据服务器发送的位置坐标 获取 list 列
         * @param index
         */
        getServerIndexCol(index: number): number;
        dispose(): void;
    }
    export enum SlotRunState {
        START = 1,
        END = 2
    }
    /**
     * slot游戏滚动效果类 使用了 FrameLoop + Laya.Tween
     */
    export class SlotScrollModel<T extends BaseSlotGameData = BaseSlotGameData> extends SlotModel<T> {
        /** 当前滚动圈数 */
        private rollCount;
        /** 滚动到最大圈数  就可以播放开奖结果了 */
        private rollMaxCount;
        /** 是否已经开始播放结束动画 */
        protected isPlayEndTween: boolean;
        /** 结束动画数据 */
        protected scrollData: any[];
        /** 当前滚动的单列位置 */
        protected singleColumnIndex: number;
        /**
         * 开始滚动指定列
         * @param index
         */
        protected onStartRoll(index: number): void;
        private frameLoopSingleColumnHandler;
        /**
         * 开始转动所有滚动序列
         */
        protected onStartRollSlot(): void;
        /** 停止自动滚动 */
        stopRollSlot(): void;
        protected frameLoopHandler(): void;
        /**
         * 运行状态变动
         * @param state 滚动状态
         * @param list 组件
         * @protected
         */
        protected runStateChange(state: SlotRunState, list: fgui.GList): void;
        protected callRunTween(): void;
        /**
         * 创建list滚动动画
         * @param index list位置
         * @param list list对象
         * @protected
         */
        protected createTween(index: number, list: fgui.GList): void;
        /** 延迟执行 */
        private clearCall;
        protected setRenderListData(index: number): void;
        protected getDuration(index: number, isTurboMode: boolean): number;
        protected getDelay(index: number, isTurboMode: boolean): number;
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        protected completeHandler(list: fgui.GList): void;
        stopTween(): void;
        dispose(): void;
    }
    /**
     * slot游戏滚动效果类 只使用了 Laya.Tween
     */
    export class SlotScrollTweenModel<T extends BaseSlotGameData = BaseSlotGameData> extends SlotModel<T> {
        protected playLottery(value: ISlotLotteryData[]): void;
        protected setRenderListData(index: number): void;
        protected getDuration(index: number, isTurboMode: boolean): number;
        protected getDelay(index: number, isTurboMode: boolean): number;
        /**
         * 完成一次滚动调用
         * @param list 滚动list
         */
        protected completeHandler(list: fgui.GList): void;
        dispose(): void;
    }
    export class GoldEffect extends tsCore.View {
        private golds;
        private count;
        private maxCount;
        private recoveryPoint;
        /** 宽 */
        goldW: number;
        /** 高 */
        goldH: number;
        /** Y坐标位置 */
        private bottomLimit;
        constructor();
        private showHandler;
        play(): void;
        private onFrameLoop;
        private closeHandler;
        dispose(): void;
    }
    /**
     * 发射金币动画
     */
    export class GoldLaunch {
        private goldAniBox;
        /** 宽 */
        goldW: number;
        /** 高 */
        goldH: number;
        private endPoint;
        /** 动画结束回调 */
        private endHandler;
        /** 动画结束数量 */
        private completeCount;
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent: fgui.GComponent, goldUrl: string, num: number, endObject: fgui.GObject, endHandler?: ParamHandler): void;
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent: fgui.GComponent, goldUrl: string, num: number, endPoint: Laya.Point, endHandler?: ParamHandler): void;
        private playUpdate;
        playEndHandler(loader: GoldLoader): void;
        dispose(): void;
    }
    const GoldLoader_base: Constructor<fairygui.GLoader & tsCore.BezierCurves>;
    /**
     * 具有贝塞尔曲线运动的loader
     */
    export class GoldLoader extends GoldLoader_base {
        static readonly NAME = "GoldLoaderPool";
        private _timeLine;
        private playEndCallback;
        /**
         * 从对象池获取一个 GoldLoader
         */
        static create(): GoldLoader;
        constructor();
        /**
         * 将对象放到对应类型标识的对象池中。
         */
        recover(): void;
        dispose(): void;
        getTimeLine(callback?: ParamHandler): Laya.TimeLine;
        timeLine(callback?: ParamHandler): this;
        /**
         * 控制一个对象，从当前点移动到目标点。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        to(props: any, duration: number, ease?: Function, offset?: number): this;
        /**
         * 从 props 属性，缓动到当前状态。
         * @param props 要控制对象的属性。
         * @param duration 对象TWEEN的时间。
         * @param ease 缓动类型
         * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
         */
        from(props: any, duration: number, ease?: Function, offset?: number): this;
        /**
         * 播放动画。
         * @param timeOrLabel 开启播放的时间点或标签名。
         * @param loop 是否循环播放。
         */
        play(timeOrLabel?: any, loop?: boolean): this;
        private onPlayEnd;
    }
    export class GoldSpray extends GoldLoader {
        initX: number;
        initY: number;
        /** x方向的加速度 */
        vx: number;
        /** Y方向的加速度 */
        vy: number;
        /** X方向的重力 */
        gx: number;
        /** Y方向的重力 */
        gy: number;
        /** 是否已经停止运动 */
        isStop: boolean;
        /** 重力加速度 */
        gravitySpeed: number;
        /** 速度是否减少 表示一直在负增长 */
        isNegativeGrowth: boolean;
        /** tempX */
        tempY: number;
        update(): void;
    }
    /** 播放各种金币动画 */
    export class GoldSprayAni {
        private goldAniBox;
        private endPoint;
        /** Y坐标位置 */
        private centreY;
        /** 动画结束回调 */
        private endHandler;
        /** 宽 */
        goldW: number;
        /** 高 */
        goldH: number;
        /** 重写最后一步方法 */
        readTweenFunction: ParamHandler;
        /** 动画结束数量 */
        private completeCount;
        /** 回收速度 */
        recoveryDuration: number;
        /** 金币喷出速度 (默认 40) */
        goldSpeed: number;
        /** 重力Y (默认 2)  */
        gravityY: number;
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endObject 最后结束对象
         * @param endHandler 动画播放结束回调
         */
        playObject(parent: tsCore.View, goldUrl: string, num: number, endObject: fgui.GObject, endHandler?: ParamHandler): void;
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent: tsCore.View, goldUrl: string, num: number, endPoint: Laya.Point, endHandler?: ParamHandler): void;
        private onFrameLoop;
        private playEndPointAni;
        playComplete(): void;
        dispose(): void;
    }
    /**
     * 游戏数据
     */
    export interface IGameData {
        /** 总共要投注的钱 */
        getTotalBetMoney(): number;
        /** 上报错误数据 */
        reportError(): any;
        /** 本次总共盈利 */
        totalWinMoney?: number;
        /** 玩的次数 计数 */
        playCount: number;
        /** 是否是推荐游戏 */
        isRecommend?: boolean;
    }
    export interface IData {
        /** 用户昵称是否是第一次改名，0 是，1 不是  */
        isFirstNick: boolean;
        /** 该账号是否是第一次登录，0 是，1 不是  */
        isFirstLogin: boolean;
        /** 开奖时间戳(s) */
        lotteryTime: number;
        /** 缓存初始化开奖期数  */
        initPeriod: number;
        /** 当前开奖期数  */
        period: number;
        /** 进入房间后  当前房间总投注信息  (只有进入房间的时候才使用) */
        initRoomTotalItem: any[];
        /** 进入房间后  当前房间自己投注信息  (只有进入房间的时候才使用) */
        initRoomCurBet: any[];
        /** 初始化奖金池数据(只有进入房间的时候才使用) */
        jackpot: number;
        /** 上次发送聊天数据时间 s */
        oldSendChatTimer: number;
        /** 开奖历史 */
        betHistory: any[];
        /** 当前历史次数 */
        betStatic: any[];
        /** 获取完整的wap请求url */
        getWapUrl(url: string): string;
        /** 获取完整的game请求 带版本号  url */
        getGameUrl(url: string): string;
        /**
         * 获取国家编码 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚
         * @param urlParam
         */
        getCountry(urlParam: UrlParam): string;
        /**
         * 获取错误上传地址
         */
        getErrorUrl(): string;
    }
    /**
     * 登录接口
     */
    export interface ILogin {
        /** 使用Token登录 并获取用户数据 */
        loginToken(callback: ParamHandler): any;
    }
    /**
     * 开奖数据
     */
    export interface ISlotLotteryData {
        /** 开奖数组 */
        arr: number[];
        /** 是否是快速模式 */
        isTurboMode: boolean;
        /** 块有多少个 */
        itemCount: number;
        /** 附带数据 */
        data?: any;
    }
    /**
     * 执行命令数据
     */
    export interface IExecuteData {
        token?: string;
        /** 执行类型 */
        type: number;
        /** 执行数据 */
        data?: number | string;
        /** 打开游戏名字 */
        gameName?: string;
        /** 打开游戏id */
        openGame?: number;
    }
    /**
     * 游戏模式
     */
    export interface IGuestModel {
        /** 游客id */
        guestUID: number;
        /** 游客模式玩次数 */
        guestPlayCount: number;
        /** 清除数据  */
        clearData(): void;
        /**
         * post请求 返回数据  可以在这里对返回数据进行修改
         * @param url 访问网址
         * @param data 押注额度
         */
        playAdd(url: string, data: HttpData): void;
    }
    export interface IFruit {
        /**
         * 所有水果灯闪烁
         * @param count 闪烁次数 0表示无限次
         * @param callback 次数到后回调函数
         */
        twinkleAllFruits(count?: number, callback?: ParamHandler): void;
        /** 停止所有位置水果灯闪烁 */
        stopAllTwinkleFruits(): void;
        /**
         * 跑灯显示位置
         * @param runIndex 当前显示位置
         * @param tail 尾巴数量
         * @param catapultDirection 方向 true 顺时针
         */
        showSlotIndex(runIndex: number, tail?: number, catapultDirection?: boolean): void;
        /** 水果数量 */
        fruitLen(): number;
        /**
         * 指定位置水果灯闪烁
         * @param index
         * @param count
         * @param callback
         *
         */
        twinkleFruits(index: number, count?: number, callback?: ParamHandler): void;
        /**
         * 停止指定位置水果灯闪烁
         * @param value
         *
         */
        stopTwinkleFruits(value: number): void;
        /**
         * 指定位置水果灯保持常亮
         * @param value
         *
         */
        wakey(value: number): void;
        /**
         * 根据选择水果的ID 获取选择按钮
         * @param id
         * @return
         *
         */
        getSelectItem(id: number): any;
        /** 新打中的金币  */
        addGainGold(value: number): void;
        /** 所有尾灯变亮 */
        allTailLight(): void;
        /** 所有位置水果尾灯 */
        stopAllTail(): void;
    }
    export interface ILoadSoundFilter {
        /**
         * 过滤不需要加载的音频
         * @param url 音频的加载路径  相对或绝对
         * @param res 加载的资源数据
         * @return true.表示继续加载 false.放弃加载
         */
        filter(url: string, res: LoadRes): boolean;
    }
    /** 指引接口 */
    export interface IGuide {
        interactionArea: Laya.Graphics;
        /** 提示文案 */
        tipText: fgui.GTextField;
        /** 提示标题 */
        tipTitleText: fgui.GTextField;
        hand: fgui.GImage;
        /** 总次数 */
        totalCount: number;
        /** 当前执行位置 */
        current: number;
        /**
         * 移动手到指定对象上
         * @param gob 对象
         */
        moveHand(gob: fgui.GObject): any;
    }
    /** 指引接口 */
    export interface IGuideScene {
        /** 绘制引导区域 */
        drawGuideRect(guideView: IGuide, index: number): void;
        /** 引导页面被点击 */
        clickGuide(guideView: IGuide, index: number): void;
        /** 引导页面结束 */
        guideEnd(guideView: IGuide): void;
    }
    export interface IGameModel {
        /** 获取游戏番号 */
        gameCode: number;
        /** 清理游戏资源 */
        clearRes(): void;
        /** 注入扩展 */
        insertExtension(): void;
        /** 获取游戏显示类 */
        gameScene: IGameScene;
        /** 获取游戏显示类 */
        gameServlet: IGameServlet;
        /** 销毁所有数据 */
        dispose(): void;
        /** socket推送的数据 */
        socketHandler(obj: any): void;
        /** socket事件 */
        initSocketEvent(): void;
    }
    export interface IGameScene {
        /** 销毁 */
        dispose(): void;
        /** 新一局游戏开始 */
        startGame(): void;
        /** 获取游戏逻辑类 */
        gameModel: IGameModel;
    }
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
        checkState(handler: ParamHandler): void;
        /** 游戏初始化  向服务器发送请求数据 */
        init(handler: ParamHandler): void;
        /**
         * 初始化 servlet 完成
         * @protected
         */
        initComplete(): void;
        /** 获取游戏逻辑类 */
        gameModel: IGameModel;
        /** 设置游戏逻辑类 */
        /** 检查游戏期数是否正确 */
        checkGamePeriod(handler: ParamHandler): void;
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
        getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): void;
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
         * @param [overtime=0] 超时时间设置 毫秒
         */
        getData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, overtime?: number): void;
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
        post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: any[], overtime?: number): void;
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
         * @param [overtime=0]
         */
        postData(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: any[], overtime?: number): void;
        /**
         *
         * @param callback
         * @param error
         */
        getUserMoney(callback: ParamHandler, error: ParamHandler): void;
        /**
         * 清理收
         */
        dispose(): void;
    }
    /**
     * 大厅model
     */
    export interface IHomeModel {
        /** 奖池金额 */
        scratcherAwardPool(): number;
        /** 奖池金额 */
        scratcherAwardPool(value: number): void;
        moneyChange(obj: any): void;
        notificationHandler(obj: any): void;
        importantNetsHandler(obj: any): void;
        scratcherCountHandler(): void;
        connectSocket(): void;
        /** 检查礼包和弹窗 */
        checkGiftAlert(handler: ParamHandler): void;
        newMailMsgHandler(): void;
        socketChangeFreeBet(obj: any): void;
    }
    /** 大厅接口 */
    export interface IHomeScene {
        /** 开始游戏 */
        startGame(): void;
        /** 从父面板上删除 */
        removeFromParent(): void;
        /** 获取游戏逻辑类 */
        gameModel(): IHomeModel;
        /** 获取游戏通信类 */
        gameServlet(): IHomeServlet;
        /** 发送通知消息 */
        sendNotice(content: string): void;
        /** 更新玩家金额 */
        updateGlod(): void;
        /** 更新刮刮奖数据 */
        updateScratcherData(): void;
        /** 添加新通知 */
        addNewNotice(value: any): void;
        /** 从其他界面返回首页 */
        revertHome(): void;
        /** 房间 */
        getRoomSlots(): any;
        /** 切换页面 */
        changePage(index: number): void;
        /** 菜单功能被点击后 */
        userClickHandler(): void;
        /**
         * 更新邮件消息
         */
        updateMailMes(): void;
        /**
         * 设置游戏类型
         * @param index 0单机  1网络
         */
        setGameType(index: number): void;
        /**
         * 首页是否在显示
         */
        isVisible(): boolean;
        /**
         * 客服系统
         */
        contactUsHandler(): void;
        /** 改变登录后的ui状态 */
        changeLoginUIState(): void;
    }
    export interface IHomeServlet {
        /**
         *
         * @param url
         * @param data
         * @param callback
         * @param error
         */
        post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler): void;
        /**
         *
         * @param url
         * @param callback
         * @param error
         */
        netGet(url: string, callback?: ParamHandler, error?: ParamHandler): void;
    }
    export class GameConfigKit {
        /**
         * 在window上配置的属性名字
         * @default gameIdConfig
         */
        static CONFIG_NAME: string;
        /**
         * 获取游戏配置表
         */
        static gameConfig(): {
            [key: number]: string;
        };
        /**
         * 根据游戏id获取配置的游戏名 如果没有 null
         * @param [code=0] 不传将使用当前已经打开游戏id
         */
        static gameName(code?: number): string;
        /**
         * 获取游戏名字的标准样式
         * @param [code=null] 游戏id 不填将使用当前已在用得到游戏id
         * @param [format=null] 格式化样式，将空白替换成指定的值 不设置将用驼峰命名
         */
        static gameNameCanonical(code?: number, format?: string): string;
        /**
         * 根据游戏名获取游戏id 如果不存在返回-1
         * @param [name=null]
         */
        static gameCode(name?: string): number;
        /**
         * 获取游戏配置数据
         * @param [name=null] 游戏名字,如果不传，将获取当前打开游戏名字
         */
        static gameRes(name?: string): ResConfig;
    }
    export const enum LibStr {
        /** 等待处理 */
        WAITING = 1000,
        /** 进入游戏中 */
        LOADING = 1001,
        /** 游戏暂停中 */
        GAME_OFF = 1002,
        /** 投注金币大于最大值 */
        ANTE_MAX_MONEY = 1003,
        /** 还需XX秒才可以再次发言 */
        SEND_CHAT_TIMER_ERROR = 1004,
        /** 网络访问失败，请检查网络 */
        NET_ERROR = 1005,
        /** 当前不可投注 */
        CANNOT_BET = 1006,
        /** 未登陆，请先登陆 */
        FIRST_LOG = 1007,
        /** 中奖结果正在计算中 */
        WINING_RESULTS = 1008,
        /** 游戏错误 退出游戏 */
        GAME_ERROR = 1009,
        /** 押注失败 */
        BET_FAIL = 1010,
        /** 获取游戏开奖超时 */
        GET_GAME_RESULTS_TIME_OUT = 1011,
        /** 你离开游戏太久了，将你剔除游戏 */
        SYSTEM_BACK_LOBBY = 1012,
        /** demo 游戏币无法提现  提示 */
        PROMPT_GUEST = 1013,
        /** 当前版本过低 */
        APP_VERSION_TOO_LOW = 1014,
        /** 提示玩家玩真钱场 */
        SHOW_INVITE_REAL_MONEY = 1015,
        /** 提示玩家没有满足使用优惠券的需要 */
        REQUIREMENT_STAKE = 1016,
        /** 未找到游戏 */
        GAME_NOT_FOUND = 1017,
        /** 充值成功提示语 */
        RECHARGE_SUCCESS = 1018,
        /** 需要押注的最大钱 */
        NEED_BET_BONUS = 1019,
        /** 错误 */
        ERR = 1020,
        /** 钱不够了 快充值 */
        RECHARGE = 1021,
        /** 余额不足 */
        INSUFFICIENT = 1022,
        /** 登录 */
        LOGIN = 1023,
        /** 踢出游戏 */
        OUT_GAME = 1024,
        /** 提示玩法 */
        TIPS_FOR_PLAYING = 1025,
        /** 赢钱数 */
        WON_MONEY = 1026,
        /** coins 赢钱数 */
        WON_COINS = 1027,
        /** 输钱了 */
        LOST = 1028,
        /** 硬币不足 */
        INSUFFICIENT_COINS = 1029,
        /** 输入 PIN 继续充值 */
        ENTER_PIN_CONTINUE = 1030,
        /** 下载app提示 */
        DOWNLOAD_MSG = 1031,
        /** 礼包不可用 */
        GIFT_NOT_AVAILABLE = 1032,
        /** 提供可用礼包 */
        CASH_GIFTS_AVAILABLE = 1033,
        /** 退出app */
        EXIT_APP = 1034,
        /** 存款玩游戏 */
        DEPOSIT_PLAY = 1035,
        /** 登录玩游戏 */
        LOGIN_PLAY = 1036,
        /** 当前投注额 */
        CURRENT_BET_AMOUNT = 1037,
        /** gift投注提示 */
        GIFT_BET_TIP = 1038,
        /** 中奖通告 */
        WIN_NOTICE = 1039,
        /** 当前没有可用gift */
        NOT_GIFT = 1040,
        /** 正在使用的劵 */
        USE_IN_GIFT = 1041,
        /** gift消费提示 */
        DEDUCT_TIP = 1042,
        /** gift拒绝消费提示 */
        DEDUCT_REFUSE_TIP = 1043,
        /** 赌注限制 */
        STAKES_RESTRICT = 1044,
        /** 赌注需求 */
        STAKES_NEEDS = 1045,
        /** 获得更多礼包 */
        GET_MORE_GIFT = 1046,
        HOW_TO_PLAY = 1047,
        /** 点击按钮 */
        PRESS_BET_BUTTONS = 1048,
        GIFT_HELP = 1049,
        FREE_SPIN = 1050,
        WILD_RESPIN = 1051,
        /** bonus 游戏 */
        BONUS_GAME = 1052,
        /** 总赢 */
        TOTAL_WIN = 1053,
        /** 需要支付 */
        ABOUT_TO_PAY = 1054,
        /** 欢迎提示 */
        WELCOME_TO_GAME = 1055,
        /** 赢的线 */
        WON_LINE = 1056,
        /** 自动spin */
        AUTO_SPINS = 1057,
        /** 充值 */
        DEPOSIT = 1058,
        /** 提示切换余额会导致倍数归零 */
        CHANGE_BET_PROMPT = 1059,
        /** 再来一次 */
        TRY_AGAIN = 1060,
        /** 货币单位 */
        UNIT = 1061,
        /** 金币单位 */
        COINS = 1062,
        /** stop */
        STOP = 1063,
        /** Confirm Use */
        CONFIRM_USE = 1064,
        /** 继续 */
        CONTINUE = 1065,
        /** OK */
        OK = 1066,
        /** 取消 */
        CANCEL = 1067,
        /** 重发 */
        RESEND = 1068,
        /** 赢钱展示 */
        WINS = 1069
    }
    /**
     * 统计管理器
     * @author boge
     */
    export class AnalyticsManager {
        /** 开启数据统计 */
        static isOpenAnalytics: boolean;
        /** 打开了一个游戏 */
        static openGame(): void;
        /** 关闭了一个游戏 */
        static closeGame(): void;
        /** 打开统计 */
        static openAnalysis(callback: ParamHandler): void;
        /**
         * 发送游戏事件
         * @param eventAction 互动类型 (默认会添加 _)
         * @param eventLabel 事件标签
         */
        static sendGameAnalysis(eventAction: string, eventLabel?: string): void;
        /**
         * 向Google Analytics 发送事件
         * @param eventAction 事件操作
         * @param eventLabel  事件标签
         */
        static send(eventAction: string, eventLabel?: string): void;
        /**
         * 向Google Analytics 发送用户用时
         * @param timingVar 用于标识要记录的变量
         * @param timingValue 向 Google Analytics（分析）报告的，以毫秒为单位的历时时间（例如 20）。
         *
         */
        static sendTiming(timingVar: string, timingValue: number): void;
        /**
         * 向 Google Analytics 发送事件
         * @param type
         * @param category
         * @param action
         * @param label
         */
        static ga(type: gaType, category: string, action: string, label: string): void;
    }
    type gaType = "pageview" | "event" | "timing" | "social" | "screenview" | "transaction" | "item" | "exception";
    export class APP {
        private static _instance;
        static get inst(): APP;
        openGame(gameId: number): void;
        hide(): void;
        share(type: number, url: string, content: string): void;
        /** 打开app */
        openApp(packageName: string, uriPath: string, url: string, jsonData?: any): void;
        showGame(str: string): void;
        closeGame(): void;
        guest(value?: boolean): void;
        /**
         * 返回键
         * @param [value=true]
         */
        appKeyBack(value?: boolean): void;
        /**
         * app回调数据
         * @param json
         */
        callback(json: IExecuteData): void;
        open(json: IExecuteData): void;
    }
    /** app管理器 */
    export class AppManager {
        private static jsToJava;
        /** 关闭app自定义返回 */
        static closeAppBack(): void;
        /** 进入游戏 */
        static sendAppData(): void;
        /**
         * Firebase 上报事件，事件数据为字符串
         * @param sData {'eventName' : "faqpage",  ‘eventValue’: "value"}
         * @param callback
         *
         */
        static enterFeedback(sData: {
            eventName: string;
            eventValue?: string;
        }, callback: Function): void;
        /**
         * Firebase 上报事件，事件数据为数字
         * @param sData { eventName : "gametime", eventValue: 1000}
         * @param callback
         *
         */
        static enterInvite(sData: any, callback: Function): void;
        /** Toast 提示 */
        static toast(sData: string): void;
        /** 退出APP */
        static exit(): void;
        /** 上传头像 */
        static UpdateHead(token: string): void;
        /** 游戏重启 */
        static gameRestart(): void;
        /** 关闭网页 */
        static closeHtml(): void;
        /**
         * 获取设备唯一id
         * @param callback
         */
        static getIMEI(callback: Function): void;
        static IsBackHome(): void;
        /**
         * 发送推送
         * @param value
         */
        static sendNotification(value: any): void;
        /**
         * 调用分享窗口
         * @param content 文本内容
         * @param url 网址
         * @param type 0.调用公用分享窗口 1.facebook 2.whatsapp 3.instagram 4.sms 5.twitter
         */
        static openShare(content: string, url?: string, type?: number): void;
        /**
         * 执行 javascript
         * @param method 执行方法体
         * @param value 方法传入的方法
         */
        static executionJavascript(method: string, value: any): void;
        /**
         * android 打印
         * @param value
         */
        static log(value: string): void;
        /**
         * 用默认浏览器打开url
         * @param url
         */
        static openBrowser(url: string): void;
        /**
         * 拷贝字符串到剪贴板
         * @param data
         */
        static clipData(data: string): void;
        /**
         * 下载文件
         * @param url 文件地址
         * @param title 标题
         * @param des 介绍
         */
        static downloadFile(url: string, title: string, des: string): void;
        /**
         * 设置角标数字
         * @param value 显示的数字
         */
        static sendShortcutBadger(value: number): void;
        /**
         * 打开app
         * @param packageName 包名
         * @param uriPath 网页打开app方式 "gamemania://com.casino.gamemania/path"
         * @param url url
         * @param jsonData 传送的json数据
         */
        static openApp(packageName: string, uriPath: string, url: string, jsonData?: any): void;
        /**
         * 获取 application meta-data 配置
         * @param key
         * @param callback
         */
        static getMetaData(key: string, callback: Function): void;
        /** 显示游戏 */
        static showGame(value: any): void;
        /** 显示网页 */
        static showWeb(value: any): void;
        static umengTest(): void;
        /**
         * 统计用户账号
         * @param Provider 账号来源。如果用户通过第三方账号登陆，可以调用此接口进行统计。支持自定义，不能以下划线”_”开头，使用大写字母和数字标识，长度小于32 字节; 如果是上市公司，建议使用股票代码。
         * @param ID 用户账号ID，长度小于64字节
         */
        static onProfileSignIn(Provider: string, ID: string): void;
        /**
         * 账号登出
         */
        static onProfileSignOff(): void;
        /**
         * 真实消费
         * 这部分API用来统计用户(或者玩家) 在游戏内付费的统计，包括购买虚拟币，道具等。
         * @param money 本次消费金额(非负数)。
         * @param coin 本次消费的等值虚拟币(非负数)。
         * @param source 支付渠道, 1 ~ 99 之间的整数， 1-8 已经被预先定义, 9~99 之间需要在网站设置。
         */
        static pay(money: number, coin: number, source: number): void;
        /**
         * 显示加载进度
         * @param value 当前加载进度
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static showLoadingPro(value: number, tempCount: number, totalCount: number): void;
        static LP_SendMessageToPlatform(json: string, callback: Function): void;
        static LP_enterBBS(json: string, callback: Function): void;
        static LP_enterFeedback(json: string, callback: Function): void;
        static LP_enterInvite(json: string, callback: Function): void;
        static LP_enterShareAndFeed(json: string, callback: Function): void;
        static LP_init(): void;
        /** 空方法 */
        static nullFun(data: any): void;
        /**
         * 判断是否是原生ios壳子
         */
        static get isIOS(): boolean;
        /**
         * 获取ios交互handler
         */
        static get NativeIOS(): any;
        /**
         * 判断是否存在ios原生方法
         */
        static hasNativeIosMethod(method: string): boolean;
        /**
         * 执行调用ios方法
         * @param method 调用方法名
         * @param data 传递数据
         * @param [printDebug=true] 打印调用命令是否执行
         */
        static callIOS(method: string, data?: any, printDebug?: boolean): boolean;
    }
    /**
     * app 访问记录管理
     * @author boge
     */
    export class AppRecordManager extends tsCore.HistoryManager {
        /** 进入大厅后执行命令 */
        static executeJson: IExecuteData;
        /** 退出点击上一次时间 */
        private static exitTimer;
        /**
         * 退出游戏
         * @param [isBack = false] 是否用的返回键（非项目内的）
         *
         */
        static backGame(isBack?: boolean): void;
        /**
         * app手机调用js方法
         * @param action 执行动作
         * @param value 执行命令
         *
         */
        static appRunJs(action: number, ...value: any[]): void;
        /**
         * 自定义 JavaSendOpen 处理  返回 true 表示已经处理 后续不再继续了
         */
        static customJavaSendOpen: (value: any) => boolean;
        /**
         * java 传入要求打开的内容
         * @param json
         */
        static JavaSendOpen(json: IExecuteData): void;
        private static open;
    }
    /**
     * 资源管理类
     */
    export class AssetsLoader implements tsCore.IFormatPath {
        private static _instance;
        static get inst(): AssetsLoader;
        static readonly ma: number;
        /** 资源配置文件名 */
        static CONFIG_RES_NAME: string;
        /** 资源配置文件名 */
        static DEFAULT_INIT_RES_NAME: any;
        /**
         * 版本加载路径
         * @example
         * https://res.game.co/assetsversion.json
         */
        static VERSION_RES_URL: any;
        /** 下载成功 */
        private handler;
        /** 下载失败 */
        private errorHandler;
        /** 加载对象 */
        private loadObj;
        /** 是否是http  */
        readonly httpProtocol: boolean;
        private runLoads;
        /**
         * 音频排除格式
         */
        static soundFilter: ILoadSoundFilter;
        /**
         * 自定义额外加载操作
         * 在加载 versionXml 的时候  额外加载的
         * @example
         * AssetsLoader.customLoader = (complete: ParamHandler, errorHandler: ParamHandler) => {
         *      ...
         *     runFun(complete)
         * }
         *
         * AssetsLoader.customLoader = Laya.Handler.create(this, function(complete: ParamHandler, errorHandler: ParamHandler) {
         *  ...
         *  runFun(complete)
         *
         * })
         */
        customLoader: ParamHandler;
        /**
         * 自定义扩展加载资源处理
         *  @example
         * AssetsLoader.customLoaderRes = (loadRes: LoadRes[]) => {
         *      ...
         * }
         *
         * AssetsLoader.customLoaderRes = Laya.Handler.create(this, function(loadRes: LoadRes[]) {
         *  ...
         *
         * })
         */
        customLoaderRes: ParamHandler;
        /** 加载路径格式化 */
        static loadPathFormat: tsCore.IFormatPath[];
        constructor();
        static formatUrl(url: string): string;
        call(url: string, version: string): string;
        /**
         * 加载版本控制文件
         * @param complete
         * @param errorHandler
         */
        loadVersionXML(complete: ParamHandler, errorHandler: ParamHandler): void;
        private loadXMLComplete;
        /**
         * 加载主要的资源
         * @param handler
         */
        loadMain(handler: ParamHandler): void;
        /**
         * 加载公共资源
         * @param handler
         * @param assets
         */
        loadCommon(handler: ParamHandler, assets?: LoadRes[]): void;
        /**
         * 加载游戏代码
         * @param config 配置表
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadJS(config: string, handler: ParamHandler, errorHandler?: ParamHandler): void;
        private loadJsProgress;
        /**
         * 加载游戏资源
         * @param obj 游戏对象
         * @param handler 加载完成
         * @param errorHandler 加载失败
         */
        loadRes(obj: ResConfig, handler: ParamHandler, errorHandler?: ParamHandler): void;
        /**
         * 处理资源
         * @param res
         * @private
         */
        private parseRes;
        /**
         * 检查分支资源更换加载
         * @param loadRes 整理好的 加载数据
         */
        static checkBranch(loadRes: LoadRes[]): void;
        private progressComplete;
        private loadComplete;
        private loadErrorHandler;
        /**
         * 将一个 loadRes数组对象  添加资源
         * @param res
         */
        addPackages(res: LoadRes[]): boolean;
        /**
         * 添加游戏UI资源
         * @param resKey 资源名字
         * @return 成功与否
         */
        addPackage(resKey: string): boolean;
        /** 设置扩展 */
        protected insertExt(pkgName: string, resName: string, type: any): void;
        protected insertExtUrl(url: string, type: any): void;
        /**
         * 资源url解析
         * @param xmlDocument
         */
        parseUrl(xmlDocument: XMLDocument): void;
        /**
         * 合并两个xml
         * @param xml 如果有重复并且值不一样  以这个对象内的值为准
         * @param xml2
         * @private
         */
        mergeXml(xml: XMLDocument, xml2: XMLDocument): XMLDocument;
        /**
         * 运行加载资源
         */
        runLoad(): void;
    }
    /**
     * 舞台
     */
    export class SceneManager extends tsCore.EProxy {
        private static _instance;
        static get inst(): SceneManager;
        /** 游戏设计面板宽度 */
        gameWidth: number;
        /** 游戏设计面板高度 */
        gameHeight: number;
        private blurTimer;
        /** 当前游戏的 Starter */
        private _starter;
        /** 是否已经初始化完成 等待外部调用 */
        initComplete: boolean;
        /** 是否已经初始化完成 等待外部调用 */
        isLoaderResComplete: boolean;
        /** 是否需要唤醒进入游戏 */
        isCall: boolean;
        /**
         * 判断是否已关闭游戏
         */
        private isCloseGame;
        showHomeScene(): void;
        /** 显示登录界面 */
        showLogin(): void;
        /** 退出登录 */
        logout(): void;
        private visibleId;
        private visibles;
        /**
         * 添加应用显示与隐藏调用方法
         * @param fun
         */
        onVisibleChange(fun: (v: boolean) => void): void;
        offVisibleChange(fun: (v: boolean) => void): void;
        /** 游戏是否进入后台 */
        private visibilityChange;
        /** 得到焦点开始渲染 */
        private focusHandler;
        /** 失去焦点停止渲染 */
        private blurHandler;
        showLoginTip(): void;
        /**
         * 登录提示框
         * @deprecated
         */
        showloginTip: () => void;
        /**
         * 开启游戏 两个参数二选一  如果使用id第一个必须设置null
         * @param config 游戏配置文件名
         * @param code 游戏id
         */
        openGame(config: string, code?: number): void;
        private loadGameResComplete;
        private loadGameJs;
        private loadJsComplete;
        /**
         * 加载资源完成
         */
        private loadResComplete;
        /** 供外部调用 */
        showGameToView(isDemo: boolean): void;
        /** 启动游戏进程，继续进入游戏 */
        private startGameProcess;
        /** 检查游戏状态 */
        private checkGameState;
        /**
         * 游戏检查完成
         * @private
         */
        private checkComplete;
        /**
         * 显示游戏到舞台上
         *
         */
        private showGameScene;
        /** 加载资源失败 */
        private loadResErrorHandler;
        /** 游戏内部返回按钮被点击 */
        backHandler(): void;
        /** 关闭当前的游戏 */
        closeGame(): void;
        /**
         * 跳转到其它游戏  直接修改url地址 切换游戏  从新走加载流程
         * @param config 游戏名字
         * @param code 游戏id
         *
         */
        jumpTo(config: string, code: number): void;
        /**
         * 切换游戏
         * @param config 游戏名字
         * @param code 游戏id
         *
         */
        changeScene(config: string, code: number): void;
        /** 当前游戏是否是单机版 */
        isAloneGame(): boolean;
        /**
         * 检查是否是单机版
         * @param gameId 游戏id
         * @return
         *
         */
        checkAloneGame(gameId: number): boolean;
        /** 获取游戏开奖结果超时退出游戏 */
        gameGameTimeOutExit(): void;
        /** 游戏报错 退出游戏 */
        gameErrorExit(): void;
        /**
         * 出乎意料的退出游戏
         * @param msg
         * @param callback
         */
        unexpectedExitGame(msg?: string, callback?: ParamHandler): void;
        get starter(): BaseStarter;
        get scene(): BaseScene<BaseGameData>;
        /**
         * 上传错误日志
         * @param data json格式的错误数据
         */
        sendErrorLog(data: any): void;
    }
    /** 公用信息处理 */
    export enum CommonCmd {
        /** 游戏首页 */
        GAME_HOME = 999999,
        /** 水果 */
        GAME_FRUIT = 1,
        /** 大转盘 */
        GAME_WHEEL = 2,
        /** 百家乐 低倍 */
        GAME_LOW_BACCARAT = 30,
        /** 百家乐 高倍 */
        GAME_HIGH_BACCARAT = 3,
        /** 单机水果 低倍 */
        GAME_ALONE_LOW_FRUIT = 1001,
        /** 单机水果 高倍 */
        GAME_ALONE_HIGH_FRUIT = 1002,
        /** 刮刮奖 */
        GAME_SCRATCHER = 1003,
        /** 单机大转盘 低倍 */
        GAME_ALONE_LOW_WHEEL = 2001,
        /** 单机大转盘 高倍 */
        GAME_ALONE_HIGH_WHEEL = 2002,
        /** 翻牌机 */
        GAME_FACE_UP = 3001,
        /** 单机轮盘 */
        GAME_ALONE_ROULETTE = 3002,
        /** 动物园 */
        GAME_ZOO = 3003,
        /** 轮盘 */
        GAME_ROULETTE = 3005,
        /** 百家乐单机版 */
        GAME_ALONE_BACCARAT = 3006,
        /** 翻牌机单机版 */
        GAME_ALONE_FACEUP = 3007,
        /** 49游戏 */
        GAME_FOUR_NINE = 3008,
        /** 捕鱼游戏 */
        GAME_FISHING = 3009,
        /** 足球老虎机 */
        GAME_FOOTBALL_SLOT_MACHINES = 3010,
        /** 体育足彩 */
        GAME_SPORTS = 10000,
        /** 虚拟体育 */
        GAME_VIRTUAL_SPORTS = 10001,
        /** 游客模式玩游戏到达最大值 提示玩真钱 */
        GUEST_MAX_PLAY_COUNT = 15,
        /** web端玩游戏到达最大值 提示下载app */
        WEB_MAX_PLAY_COUNT = 100,
        /** 水果机最大下注值 */
        FRUIT_MAX_BET = 1000,
        /** 大转盘最大下注值 */
        WHEEL_MAX_BET = 1000,
        /** 百家乐最大下注值 */
        BACCARAT_MAX_BET = 5000,
        /** 动物园最大下注值 */
        ZOO_MAX_BET = 1000,
        /** 大满贯  全部中大的（除苹果核BAR）*/
        GRAND_SLAM = 1,
        /** 大火车   5节火车*/
        MAX_CHOOCHOO = 2,
        /** 小火车   3节火车*/
        MIN_CHOOCHOO = 3,
        /** 大三元   中三个大结果*/
        DA_SAN_YUAN = 4,
        /** 小满贯  全部中小的（除苹果核BAR）*/
        LITTLE_SLAM = 5,
        /** 小三元 */
        XIAO_SAN_YUAN = 6,
        /** 大四喜  中四个苹果*/
        DA_SI_XI = 7,
        /** 随机送灯  随机反弹一个结果*/
        RANDOM = 8,
        /** 金币 */
        GAME_MONEY_TYPE_COINS = 2,
        /** 赠送金 */
        GAME_MONEY_TYPE_GIFT = 3
    }
    /** 通信命令 */
    export enum Cmd {
        /** 大厅socket房间号 */
        PROT_HOME = 999999,
        /** 聊天内容 */
        SOCKET_CHAT_MESSAGE = 1,
        /** 中奖信息公告 */
        SOCKET_WIN_INFO = 2,
        /** 在线人数 */
        SOCKET_ROOM_MONEY_MESSAGE = 3,
        /** 充值状态 */
        SOCKET_RECHARGE_STATUS = 4,
        /** 余额变化 */
        SOCKET_MONEY_CHANGE = 1001,
        /** 黄金变化 */
        SOCKET_GOLD_CHANGE = 1002,
        /** 充值成功 */
        SOCKET_TOP_UP_CHANGE = 1004,
        /** 显示广播消息 */
        SOCKET_SHOW_NOTICE = 12
    }
    export class HttpCode {
        /**
         * 正确返回代码
         * @default 200
         */
        static OK: number;
        /**
         * 需要登录
         * @default 300
         */
        static LOGIN_INVALIDITY: number;
        /**
         * 游戏暂停
         * @default 8003
         */
        static GAME_PAUSE: number;
        /**
         * 资金不足
         * @default 5002
         */
        static GAME_INSUFFICIENT_BALANCE: number;
        /**
         * 当前游戏不可投注
         * @default 8002
         */
        static GAME_CANNOT_BET: number;
        /**
         * 游戏已关闭
         * @default 8003
         */
        static GAME_OFF: number;
        /**
         * 投注失败
         * @default 8004
         */
        static GAME_BET_FAIL: number;
    }
    export class Urls {
        /** 获取服务器时间 */
        static GAME_SERVER_TIME: string;
        /** 优惠券投注 */
        static URL_COUPON_BET: string;
        /** 获取用户信息 */
        static URL_USER_INFO: string;
        /** 获取用户账户金额 */
        static URL_USER_ACCOUNT_ASSET: string;
        /** gift 抽奖开奖结果 */
        static URL_GAME_SCRATCHER_LOTTERY: string;
        /** 获取所有优惠券 */
        static URL_GAME_ALL_COUPON: string;
    }
    /** socket管理 */
    export class SocketManager extends tsCore.ESocket {
        private static _instance;
        static get inst(): SocketManager;
        /** 当前连接的房间号 */
        private _roomId;
        /** 接受到的消息 */
        private receiveData;
        private _client;
        static SocketClass: typeof tsCore.SocketClient;
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
        customUrl: ParamHandler;
        /**
         * 链接服务器socket
         * @param roomId 房间号
         * @param token token
         * @param userId 用户id 默认 110
         * @param url 连接地址 如果不存在 会使用 window.socketUrl
         */
        connect(roomId: number, token: string, userId?: number, url?: string): void;
        private sendData;
        /** 关闭链接 */
        close(): void;
        /** 服务器发来消息 */
        onMessageReceived(data: any): void;
        closeHandler(msg?: any): void;
        messageHandler(evt: any): void;
        errorHandler(e: any): void;
        openHandler(): void;
        get roomId(): number;
        test(value: string): void;
    }
    /**
     * url 参数
     */
    export class UrlParam {
        private _amount;
        private _inviteCode;
        private openGame;
        /** 国家 'ke'肯尼亚；'ug'乌干达, 'ng'尼日尼亚 */
        private _country;
        /** 语言 en zh-CN */
        private _language;
        /** 渠道平台 */
        channel: string;
        /** 0:ai  1:people 2:friend */
        private _playWith;
        private _roomId;
        /** 1 守门员  2 踢球 */
        private _role;
        /** 是否是赠送金 0 没有 1 有 */
        private _isGift;
        /** 是否是debug模式 */
        debug: boolean;
        constructor(defaults?: {
            country?: string;
            language?: string;
            channel?: string;
            debug?: boolean;
        });
        parseData(json: IExecuteData): void;
        getValue(json: any, ...keys: string[]): string;
        get amount(): string;
        get inviteCode(): string;
        /**
         * 是否是直接指定页面
         * @return
         */
        isJumpPage(): boolean;
        /**
         * 清理跳转记录
         */
        clearJumpPage(): void;
        get country(): string;
        get language(): string;
        get playWith(): string;
        set playWith(value: string);
        set roomId(value: string);
        get roomId(): string;
        get role(): number;
        set role(value: number);
        get isGift(): number;
        set isGift(value: number);
    }
    /** 用户数据 */
    export class Player {
        private static _instance;
        static get inst(): Player;
        /** apk下载 */
        static DOWNLOAD_APK_URL: string;
        /** 版本名字 */
        static VERSION: string;
        /** 最新版本号 */
        static VERSION_CODE: string;
        /** 进入大厅的地址 */
        static HOME_URL: string;
        /** 渠道名字 */
        channelName: string;
        private _icon;
        /** 玩家身上主账户的钱 */
        money: number;
        /** 金币 */
        coins: number;
        /** 玩家身上赠送的钱 */
        freeBet: number;
        /** 缓存玩家身上的钱 */
        cacheMoney: number;
        /**
         * 玩家昵称
         * @default admin
         */
        nickname: string;
        /**
         * 玩家id
         * @default 100
         */
        userId: number;
        /** 客户端生成的唯一ID */
        uuid: string;
        /** 用户身份码 */
        token?: string;
        /** 手机号 */
        mobile: string;
        /** 设备号 */
        device: string;
        /** url参数 */
        urlParam: UrlParam;
        /** 游戏数据 */
        gameData: IGameData;
        /**
         * 游戏类型  id
         * @default -1
         */
        gameId: number;
        /** 游戏名字 */
        gameName: string;
        /**
         *  是否是web端口
         *  @default true
         *  @deprecated
         */
        isWeb: boolean;
        /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
        private _status;
        /** 游戏发布版本号 */
        codeVersion: number;
        /** 当前app游戏发布版本号 */
        currentAppVersion: number;
        /** 是否是游客模式 */
        isGuest: boolean;
        /** 游客数据 */
        private _guestModel;
        /** 项目数据 */
        data: IData;
        /** 登录接口 */
        login: ILogin;
        /** 本玩家今日玩的次数 */
        playCount: number;
        /**
         * 用户持有的优惠劵
         **/
        private coupons;
        /** 缓存上一次网络请求返回数据 */
        resultData: any;
        /** 解析的传入游戏的参数 */
        parseParam: IExecuteData;
        /** 用户拥有的奖金池  */
        jackpotData: any[];
        /** 用户的真实投注 */
        userReallyBet: number;
        /** 每次投注达到多少 就可以获得刮刮卡 */
        getTicketIncBet: number;
        /** 当前游戏的奖金池 */
        gamePool: number;
        /** 获得奖励的次数 */
        jackpotCount: number;
        /**
         * 游戏类型  id
         * @default -1
         * @deprecated
         * @see gameId
         */
        set gameModel(value: number);
        /**
         * 游戏类型  id
         * @default -1
         * @deprecated
         * @see gameId
         */
        get gameModel(): number;
        /**
         * 获取游客模式的优惠券
         */
        getGuestCoupons(): Coupons[];
        /**
         * 设置当前拥有的优惠券
         * @param value 新优惠券
         */
        addCoupons(value: Coupons[]): void;
        /** 获取所有的优惠券 */
        getCoupons(): Coupons[];
        /**
         * 根据优惠劵类型  获取优惠劵
         * @param type 1抵用券 2投注劵
         * @return
         */
        getCoupon(type: number): Coupons[];
        /**
         * 根据游戏ID  获取优惠劵
         * @param gameId 游戏ID 默认使用 Player.inst.gameId
         * @return
         */
        getCouponGame(gameId?: number): Coupons[];
        /** 使用活动劵的次数 */
        useCouponNum(): void;
        /**
         * 获取正在使用的优惠劵
         * @return
         */
        getUseCoupon(): Coupons;
        /**
         * 获取正在使用的优惠劵
         */
        removeCoupon(obj: Coupons): void;
        /**
         * 判断当前游戏可有使用的优惠券
         */
        getCanUseCoupon(): boolean;
        /** 停止所有的优惠价使用 */
        stopAllCoupon(): void;
        /** 获取请求发送的  token */
        getRequestToken(): string;
        /** 玩家头像 */
        get icon(): string;
        /**
         * @private
         */
        set icon(value: string);
        /** 1=>投注中，2=>计算中，3=>开奖  4=>收取金币  5=>比分中 */
        get status(): number;
        /**
         */
        set status(value: number);
        windowOpen(url: string): void;
        get guestModel(): IGuestModel;
        set guestModel(value: IGuestModel);
        /**
         * 获取设备号
         * @return
         */
        getDevice(): string;
        /**
         * 保存账号密码
         * @param login
         * @param psd
         */
        saveUser(login: string, psd: string): void;
        /**
         * 获取渠道type
         * @return
         */
        getChannelType(): 1 | 3;
        /**
         * 获取当前国家的货币单位(大写)
         */
        getCurrencyUnit(): string;
        /**
         * 获取当前国家的货币单位(首字母大写格式化)
         */
        getCurrencyUnitFormat(): string;
    }
    /** 卡牌 */
    export class Card extends tsCore.ELabel {
        /** 卡牌的id */
        code: number;
        /** 卡牌面值 */
        value: number;
        /** 卡牌名字 */
        nameCard: string;
        /** 卡牌花色 */
        suit: number;
        /** 卡牌花色名字 */
        _suitName: string;
        /** 初始化X */
        initX: number;
        /** 初始化Y */
        initY: number;
        /** XY偏移量 */
        offset: number;
        /** 偏移倍数 */
        offsetMultiple: number;
        /** 中心点 */
        tempPivot: Laya.Point;
        init(id: number): void;
        protected suitName(value: number): string;
        createUI(): void;
    }
    export class Deck {
        /** 存放的卡牌 */
        cards: Card[];
        /** 已经完成了动画个数 */
        private completeNum;
        /** 动画执行次数 */
        private executeNum;
        /** 是否正在运行动画 */
        private isRun;
        private handler;
        createCard(): void;
        /**
         * 收集牌
         * @param handler
         * @param sort 是否需要排序
         */
        sort(handler?: ParamHandler, sort?: boolean): void;
        /** 展示牌 铺开 */
        bySuit(handler?: Laya.Handler): void;
        /** 展示牌 */
        fan(handler?: Laya.Handler): void;
        /**
         * 洗牌
         * @param handler 执行完成回调
         * @param num 执行次数 暂未实现
         */
        shuffle(handler?: Laya.Handler, num?: number): void;
        private moveHandler;
        private plusMinus;
        setChildIndexHandler(card: Card, index: number): void;
        dispose(): void;
    }
    /**
     * 拷贝对象
     */
    export class CopyObject {
        /**
         * 复制一个 fgui.GLoader 对象
         * @param loader 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyLoader(loader: fgui.GLoader, parent?: fgui.GComponent): fairygui.GLoader;
        /**
         * 复制一个 fgui.GTextField 对象
         * @param textField 被复制的对象
         * @param parent 设置一个父对象  更换的时候 会同事转换原坐标到新的父对象上
         */
        static copyTextField(textField: fgui.GTextField, parent?: fgui.GComponent): fairygui.GTextField;
    }
    export class CounterUtils {
        static create(total: number, complete: ParamHandler): Counter;
    }
    class Counter {
        /** 执行玩所有次数调用 */
        complete: ParamHandler;
        total: number;
        private _index;
        constructor(complete: ParamHandler, total: number);
        /** 完成一次计数 */
        oneComplete(): void;
        get index(): number;
        dispose(): void;
    }
    /**
     * 水果机旋转动画
     * @author boge
     *
     */
    export class FruitRotationUtils {
        /** 跑帧位置 */
        protected currentRunIndex: number;
        /** 上次时间 */
        protected oldTimer: number;
        /** 间隔时间 */
        protected spaceTimer: number;
        /** 开始位置 */
        protected startIndex: number;
        /** 预计演播跑灯圈数 */
        protected runCount: number;
        /** 当前跑动圈数 */
        protected currentRunCount: number;
        /** 跑动是否结束了 */
        protected isRunEnd: boolean;
        /** 奖励 */
        protected awards: any[];
        /** 顺时针方向跑动 */
        protected catapultDirection: boolean;
        /** 预选位置偏移量 */
        private preselectionOffset;
        /** 运行调用函数 */
        private runCallback;
        /** 选定阶段调用函数 */
        private selectedCallback;
        /** 结束调用函数 */
        private playRunSlotEndCallback;
        /** 结束调用函数 */
        private runEndCallback;
        /** 舞台对象 */
        private fruit;
        constructor(fruit: IFruit);
        /**
         *
         * @param arr 奖励
         * @param runCallback 运行调用函数
         * @param selectedCallback 选定阶段调用函数
         * @param playRunSlotEndCallback 结束调用函数
         * @param runEndCallback 结束调用函数
         */
        startRun(arr: any[], runCallback: ParamHandler, selectedCallback: ParamHandler, playRunSlotEndCallback: ParamHandler, runEndCallback: ParamHandler): void;
        private runHandler;
        private checkAward;
        private runEnd;
        /**
         * 弹射动画
         * @param startIndex 击打起始位置
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        private catapult;
        /**
         * 弹击函数
         * @param startIndex 击打起始位置
         * @param value 当前选中的值
         * @param array 剩余要被击中的值
         * @param runCount 预计演播跑灯圈数
         * @param huoche 开火车
         */
        private runCatapultHandler;
        stop(): void;
        /** 跑帧位置 */
        getCurrentRunIndex(): number;
        /** 跑动是否结束了 */
        getIsRunEnd(): boolean;
    }
    /**
     * 金币动画
     */
    export class GoldAniUtils {
        /**
         * 默认金币图标
         */
        static defaultIcon: string;
        /**
         * 默认声音
         */
        static defaultSound: string;
        /**
         * 配置金币默认显示的面板
         */
        static defaultScene: fgui.GComponent;
        private loaders;
        private count;
        private startPoint;
        private endPoint;
        private completeFun;
        private goldTween;
        /** 宽 */
        goldW: number;
        /** 高 */
        goldH: number;
        icon: string;
        sound: Laya.Sound | string;
        parent: fgui.GComponent;
        constructor(icon?: string, parent?: fgui.GComponent, sound?: string | Laya.Sound);
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param startObject 开始对象 如果传入null 将用舞台中心做为起点
         * @param endObject 结束对象
         * @param endHandler 结束回调
         * @deprecated
         * @see play
         */
        playObject(num: number, startObject: fgui.GObject, endObject: fgui.GObject, endHandler?: ParamHandler): void;
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param start 开始位置
         * @param end 结束位置
         * @param complete 结束回调
         */
        play(num: number, start: Laya.Point | fgui.GObject, end: Laya.Point | fgui.GObject, complete?: ParamHandler): void;
        private onPlayAwardEnd;
        /************************************  普通金币掉落动画  ***********************************/
        /**
         * 播放移动目标到指定目标位置
         * @param targetObject 要被移动的对象
         * @param endObject 结束对象
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldAni(targetObject: fgui.GObject, endObject: fgui.GObject, endHandler?: ParamHandler, parent?: fgui.GComponent, props?: GoldAniData): void;
        /**
         * 播放移动目标到指定位置
         * @param targetObject 要被移动的对象
         * @param startPoint 起始位置
         * @param endPoint 结束位置
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldPointAni(targetObject: fgui.GObject, startPoint: PointType, endPoint: PointType, endHandler?: ParamHandler, parent?: fgui.GComponent, props?: GoldAniData): void;
        private addChild;
        private globalToLocal;
        private get scene();
        clearGoldLoader(): void;
        dispose(): void;
    }
    export class JSUtils {
        /**
         * 刷新页面  如果有父页面  刷新父页面
         */
        static reloadAll(): void;
        /** 刷新 */
        static reload(): void;
        /** 进入登录界面 */
        static login(): void;
        /** 充值 */
        static deposit(): void;
        /** 进入刮刮卡 */
        static jackpot(): void;
        /** 打开指定的web页面 不关闭游戏的前提下 */
        static openWebPageWithoutLeaveGame(value: string): void;
        /** 关闭游戏
         * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
         * @param [data = null]
         * */
        static gameClose(type?: number, data?: any): void;
        /**
         * 弹窗
         * @param msg 内容文本
         * @param title 标题
         * @param okText ok文本
         * @param cancelText 取消文本
         */
        static alert(msg: string, title?: string, okText?: string, cancelText?: string): void;
        /**
         * 打开一个原生页面
         * @param page 页面 如： "/giftPage?token=***"
         * login,register,userSetting,webDetail,gameDetail,editNickName,forgetMain,changePwd,home,deposit,promotion,withdraw,profile
         * @param [isCloseGame=true] 是否关闭游戏
         * @param fromUrl 登录注册等成功后，需打开的界面地址
         */
        static openPage(page: string, isCloseGame?: boolean, fromUrl?: string): void;
        /** 进入游戏进度条 */
        static progress(value: number): void;
        static getProgress: typeof JSUtils.progress;
        /** 通知进入游戏了 */
        static gameOnload(): void;
        /** 上传头像 */
        static uploadAvatar(): void;
        /**
         * @deprecated
         * @see JSUtils.uploadAvatar
         */
        static updateHead: typeof JSUtils.uploadAvatar;
        /**
         * @deprecated
         * @see JSUtils.alert
         */
        static openModal: typeof JSUtils.alert;
    }
    export class ObjectUtil {
        private static colorTransform;
        private static colorMatrixFilters;
        static setColorTransform(source: Laya.Sprite, value: string): void;
        static setColorMatrixFilter(source: Laya.Sprite, value: string): void;
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
        static copy(source: any, isCls?: boolean): any;
        /**
         * 将二进制转换成 base64 图片字符
         * @param buffer
         */
        static arrayBufferToBase64(buffer: ArrayBuffer): string;
        /**
         * ArrayBuffer 转为字符串，参数为 ArrayBuffer对象
         * @param buf
         */
        static ab2str(buf: ArrayBuffer): string;
        /**
         * 字符串转为 ArrayBuffer 对象，参数为字符串
         * @param str
         */
        static str2ab(str: string): ArrayBuffer;
        /**
         * 解析数据
         * @param xml
         * @param handler 解析完成回调 ( 返回数组 [xml, texture] )
         * @param content
         */
        private static onLoadTexture;
        /**
         * 获取指定坐标下存在的对象
         * @param x x坐标 或 point对象
         * @param y y坐标 默认0
         */
        static getObjectsUnderPoint(x: number | Laya.Point, y?: number): Laya.Sprite[];
        /**
         * 获取指定位置的颜色值 16进制
         * @param texture
         * @param x x坐标 或 point对象 和 Laya.Sprite
         * @param y y坐标 默认-1
         */
        static getPixel(texture: Laya.Sprite | Laya.Texture, x?: number | Laya.Point, y?: number): string;
        /**
         * 根据类名获取对象 如 com.test.Test可获取Test对象
         * @param classStr
         */
        static getClass(classStr: string): any;
    }
    export class RotationUtils {
        /** 当前速度 */
        private speed;
        /** 加速度 */
        private addSpeed;
        /** 要被旋转的对象 */
        private comp;
        /** 总的角位移 */
        private rotationTotal;
        /** 最终停止的位置 */
        private runEndIndex;
        /** 旋转结束后调用函数 */
        private endCall;
        /** 转动开始消弱后调用函数 */
        private proCall;
        /** 缓动 */
        private tween;
        /** 速度最大值 */
        maxSpeed: number;
        /** 减速后最小值 */
        minSpeed: number;
        /** 格子数量 */
        count: number;
        /** 第一个奖区起始点与0点位置的偏移比例 */
        skew: number;
        /** 最少圈数 */
        minCircle: number;
        /** 最多圈数 */
        maxCircle: number;
        /** 指针所停位置离奖区边缘的比例 */
        offset: number;
        /** 旋转花费的时间，单位毫秒。 只有tween有用 */
        duration: number;
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollFrame(comp: fgui.GObject, runEndIndex: number, callback: ParamHandler, proCall?: ParamHandler, isClockwise?: boolean): void;
        /**
         *
         * @param comp 要旋转的对象
         * @param runEndIndex 最终停止的位置
         * @param callback 转动停止后调用函数
         * @param proCall 转动开始消弱后调用函数
         * @param isClockwise 是否是顺时针方向转动
         *
         */
        rollTween(comp: fgui.GObject, runEndIndex: number, callback: ParamHandler, proCall?: ParamHandler, isClockwise?: boolean): void;
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
        private roll;
        private updateHandler;
        private onRollEndHandler;
        private runHandler;
        /** 销毁动画 */
        diapose(): void;
        /** 立即停止到结束为止 */
        stop(): void;
    }
    export class ShowUtils {
        static showSize(spr: Laya.Sprite): void;
    }
    /** 状态吗获取显示信息 */
    export class StateCode {
        /**
         * 获取显示信息
         * @param data 一个object对象  如果带有message错误文字  直接使用 否则用code命令获取错误内容
         */
        static getShowMessage(data?: any): any;
        /**
         * 显示错误信息
         * @param code 错误代号
         */
        static getInfo(code: number): string;
        /**
         * 此错误是后在执行范围内
         * @param code 执行错误代码
         * @param msg 提示文案或具有错误信息的object *.msg *.message
         */
        static execute(code: number, msg?: string | any): boolean;
        /** 游戏暂停中，返回大厅 */
        static showGameOff(): void;
    }
    /**
     * 流量统计
     */
    export class StatFlow {
        private static _instance;
        static get inst(): StatFlow;
        /** 未发送的流量统计 */
        private static NOT_SEND_STAT_FLOW;
        /** 公共流量计算接口 */
        private by;
        /**
         * 计算流量
         * @param url
         * @param value
         */
        castFlow(url: string, value: string): void;
        /** 添加用户统计 */
        private addUserStat;
        /** 根据用户id获取用户统计信息 */
        private getUserStat;
    }
    export class ActivityButton extends tsCore.EButton {
        private tempValue;
        private clickInvalid;
        callback: ParamHandler;
        private contentText;
        /** 当没有优惠卷使用的时候 是否自动隐藏 */
        isAutoHide: boolean;
        /** 自定义更新文字显示 */
        updateText: ParamHandler;
        protected onConstruct(): void;
        private stopUseActivityHandler;
        private useActivityHandler;
        private updateShow;
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value: number): void;
        private clickHandler;
        private addedHandler;
        /** 打开拖动 */
        openDrag(): void;
        private onDragEnd;
        private onDragStart;
    }
    /**
     * 弹窗层
     * @author boge
     */
    export class AlertPanel extends fgui.GComponent {
        private static _instance;
        static get inst(): AlertPanel;
        constructor();
        private __winResize;
    }
    /**
     * 洗牌的牌
     * @author boge
     *
     */
    export class CardDeck extends BaseView {
        static NAME: string;
        private load;
        /** 在数组中的位置 */
        pos: number;
        protected onConstruct(): void;
        shuffle(func: ParamHandler): void;
        private plusMinus;
        setUrl(url: string): void;
        revert(): void;
        static create(): CardDeck;
    }
    export class GlobalWaiting extends fgui.GComponent {
        /** 显示内容 */
        private messageText;
        protected onConstruct(): void;
        private onInit;
        set text(value: string);
    }
    /** 提示框 */
    export class HomePrompt<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {
        private static _instance;
        static get instance(): HomePrompt<BaseGameData>;
        /** 当前显示面板控制器 */
        private controller;
        /** ok按钮 */
        private okBtn;
        /** 取消 */
        private cancelBtn;
        /** 显示的内容 */
        private message;
        private callback;
        private cancelCallback;
        constructor();
        protected onInit(): void;
        private cancelHandler;
        private okHandler;
        protected onShown(): void;
        /**
         * 显示提示框
         * @param code 0 公告提示框 1两个选择按钮提示
         * @param content 显示内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param callback 确定调用函数
         * @param cancelCallback 取消调用函数
         * @param obj 附带设置 (okName:'', cancelName:'')
         *
         */
        showTip(code: number, content: string | number | any[], callback?: Function, cancelCallback?: Function, obj?: any): void;
        hideRecord(): void;
    }
    export class HtmlWindow extends fgui.Window implements tsCore.IRecord {
        private static _instance;
        static get inst(): HtmlWindow;
        private closeHandler;
        /** 页面名字 */
        private htmlText;
        private btn;
        private obj;
        private tempX;
        private tempY;
        /** 加载动画控制器 */
        private loadMovieClip;
        protected onInit(): void;
        protected onShown(): void;
        private sizeChangeHandler;
        /**
         * 新打开一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         */
        openHtml(url: string, full?: boolean, closeHandler?: ParamHandler): void;
        /**
         * 弹出一个html浏览窗口
         * @param url 加载地址
         * @param full 是否全屏
         * @param closeHandler 此界面关闭后回调
         *
         */
        showTip(url: string, full?: boolean, closeHandler?: ParamHandler): void;
        private popFullIframeHandler;
        /** 修正宽高 */
        _syncInputTransform(): void;
        share(type: number, url: string, content: string): void;
        hide(): void;
        hideRecord(): void;
        showRecord(): void;
    }
    /** 图片窗口 */
    export class ImageWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {
        private static _instance;
        static get inst(): ImageWindow;
        protected onInit(): void;
        showTip(url: string): void;
    }
    /** 加载界面 */
    export class LoadingWindow extends BaseView {
        private static _instance;
        static get inst(): LoadingWindow;
        private headText;
        private loader;
        private mesText;
        /** 当前进度 */
        private tempValue;
        private dian;
        private controller;
        protected onInit(): void;
        /**
         * 显示加载页
         * @param index 显示的形式
         * @param headText 使用头文本
         *
         */
        show(index?: number, headText?: string): void;
        /**
         * 切换显示状态
         * @param index 显示的形式
         * @param headText 使用头文本
         */
        changeView(index?: number, headText?: string): void;
        private changeHandler;
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        updateMsg(value: number, tempCount?: number, totalCount?: number): void;
        /**
         * 更新进度
         * @param value 当前模块进度值
         * @param tempCount 当前加载进度模块 1 开始
         * @param totalCount 总共要加载的模块数
         */
        static getProgress(value: number, tempCount?: number, totalCount?: number): number;
        /**
         * 显示加载错误提示
         * @param value
         *
         */
        showError(value: string): void;
        private getMsg;
        /** 替换加载图片 */
        loaderUrl(url: string): void;
        hide(): void;
    }
    export class NoticeView extends BaseView {
        private richText;
        private tempX;
        /** 是否在滚动 */
        private isRun;
        private gameData;
        constructor();
        protected onInit(): void;
        protected addedHandler(): void;
        showText(values: any[]): void;
        /** 开始滚动 */
        private startRun;
        private loopHandler;
        /** 更新内容 并重置位置 */
        private updateNoticeContent;
        private stopRun;
        /** 重置位置 */
        private resetMsgPosition;
        dispose(): void;
    }
    /** 文案提示 */
    export class PromptTip extends tsCore.ELabel {
        private target;
        private downward;
        protected onInit(): void;
        static createPromptTip(): PromptTip;
        /**
         * 显示提示文本
         * @param comp 绑定显示按钮位置
         * @param downward 是否在下面
         */
        show(comp: fgui.GComponent, downward?: any): void;
        private showViewHandler;
        hide(): void;
        private updatePoint;
        dispose(): void;
    }
    /** 提示框 */
    export class PromptWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {
        private static _instance;
        static get inst(): PromptWindow<BaseGameData>;
        private titleText?;
        private content?;
        /** 确定取消 */
        private cancelBtn?;
        private closeBtn?;
        /** 确定 */
        private continueBtn?;
        /** 提示框的击中类型 */
        private controller;
        private controller2;
        private controller3;
        private continueFun;
        private callback;
        /** 缓存的提示框 */
        private cacheMessage;
        constructor();
        protected onInit(): void;
        private continueHandler;
        private cancelHandler;
        protected onHide(): void;
        /** 结束回调 */
        endCallHandler(): void;
        /** 清理缓存 */
        clearCache(): void;
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
        showTip(msg: string | number | any[] | PromptData, callback?: ParamHandler, isAction?: boolean): void;
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
        showCancelTip(msg: string | number | any[], options?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction?: boolean): void;
        private _showWindow;
        private _show;
        dispose(): void;
        /**
         * 判断是否是接口 用 prototype 是否存在判断
         * @param optional
         */
        isPromptData(optional: any): optional is PromptData;
    }
    /** 提示框 */
    export class RechargeSuccessWindow<T extends BaseGameData = BaseGameData> extends BaseWindow<T> {
        private static _instance;
        static get inst(): RechargeSuccessWindow<BaseGameData>;
        private content;
        private callback;
        /** 确定 */
        private continueBtn;
        /** 缓存的提示框 */
        private cacheMessage;
        constructor();
        protected onInit(): void;
        private continueHandler;
        protected onHide(): void;
        /** 结束回调 */
        endCallHandler(): void;
        /** 清理缓存 */
        clearCache(): void;
        protected doShowAnimation(): void;
        /**
         * 带确认按钮的提示框
         * @param msg
         * @param callback
         * @param isAction
         */
        showTip(msg: string, callback?: ParamHandler, isAction?: boolean): void;
        dispose(): void;
    }
    /**
     * 房间通告
     * @author boge
     */
    export class RoomNotice extends fgui.GComponent {
        private loader;
        private userName;
        private money;
        protected onConstruct(): void;
        show(name: string, money: number, url: string): void;
        hide(): void;
        dispose(): void;
    }
    /** 加载 */
    export class WaitResult extends fgui.GComponent {
        private static _instance;
        static get inst(): WaitResult;
        private img;
        private graph;
        protected onConstruct(): void;
        show(): void;
        private showContent;
        hide(): void;
    }
    export {};
}

/**
 * 游戏资源配置
 */
declare type ResConfig = {
    /** 加载的资源列表 */
    res: LoadRes[]
    /** 加载的js文件名字 */
    js: string
    /** 执行启动函数 */
    completeFun: Function
    /** 引导帮助文档 */
    couponHelp?: string[]
    /** 指引 */
    guide?: (string | LoadRes)[] | string | LoadRes
    /** 游戏赔率 */
    odds?: number[][] | any[][]
}

/**
 * 优惠券
 */
declare type Coupons = {
    /** id */
    id: number
    /** 当前数量 */
    num: number
    /** 原总数量 */
    total_number: number
    /** 劵的面值 */
    faceValue: number
    /** 投注最低使用额度 */
    bet_limit: number
    /** 过期时间 */
    expire_time: number
    /** 1抵用券 2投注劵 */
    type: number
    /** 来源 */
    source?: number
    /** 支持的游戏 */
    games: number[]
    /** 是否正在使用 */
    isUse: boolean
}

/**
 * 对话框修改显示数据
 */
declare type IPromptData = {
    /** 按钮确定文案 */
    okName?: string
    /** 按钮取消文案 */
    cancelName?: string
}

declare type PromptData = {
    /** 文字或id */
    msg: string | number | any[]
    /** 标题 */
    title?: string
    /** 按钮名字修改 */
    obj?: IPromptData
    /** 取消按键 */
    callback?: ParamHandler
    /** 确认按键 */
    continue?: ParamHandler
    /** 是否动画弹出 默认true */
    isAction?: boolean
}

declare type HttpData = {
    /**
     * 游戏状态 非0 表示正常
     */
    game_status: number
    /** 当前游戏奖池 */
    game_pool: number
    /** 用户当前的bet值 */
    user_really_bet: number
    /** 距离下次获得奖励总共需要多少BET */
    get_ticket_inc_bet: number
    /** 已经获得的奖励 */
    scratcher_tickets: any[]
    [key: string]: any
}

declare type FreeSpinData = {
    /** 免费游戏剩余次数 */
    left_times: number
    /** 游戏bet数据 */
    free_spin_data: any
    [key: string]: any
}

declare type GoldAniData = {
    x?: number, y?: number, scaleX?: number, scaleY?: number, duration?: number, delay?: number, ease?: Function
}