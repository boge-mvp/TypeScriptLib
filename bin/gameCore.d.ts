declare namespace coreLib {
    export class View extends fgui.GComponent implements IView, IKey {
        protected key: string;
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        getView<T>(key: string | {
            new (): T;
        }): T;
        removeView<T extends IView & IKey>(key: string | T): void;
        getProxy<T>(key: string | {
            new (): T;
        }): T;
        setKey(key: string): void;
        getKey(): string;
        dispose(): void;
    }
    export class Proxys implements IProxy, IKey {
        /** 独有的名字 */
        protected key: string;
        constructor();
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: string[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        getProxy<T>(key: string | {
            new (): T;
        }): T;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
        setKey(value: string): void;
        getKey(): string;
        dispose(): void;
    }
    /** 全屏显示基类 */
    export class BaseView extends View implements IRecord {
        /** 自动设置关联 默认false */
        protected autoSetupRelation: boolean;
        constructor();
        protected constructFromXML(xml: any): void;
        protected addedHandler(): void;
        /** 初始化UI */
        protected onInit(): void;
        /** 返回按钮处理事件 */
        protected backHandler(): void;
        hideRecord(): void;
        showRecord(): void;
        dispose(): void;
        /** 设置扩展 */
        protected insertExt(pkgName: string, resName: string, clas: any): void;
        /** 设置扩展 */
        protected insertExtUrl(url: string, clas: any): void;
        /**
         * 资源url解析
         * @param url
         */
        protected parseUrl(url: any): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 根据语言包id获取字符串 */
        getString(id: string | number, ...args: any[]): string;
    }
    /**
     * 切换参数
     * @author boge
     *
     */
    export class ChangeValue {
        /** 加号按钮 */
        private readonly addBtn;
        /** 减号按钮 */
        private readonly minusBtn;
        /** 数据变动显示对象 */
        private label;
        /** 变动数据的存储库 */
        private _antes;
        /** 变更值后调用 */
        dateChange: ParamHandler;
        /** 执行变化前的调用 如果返回false 将停止继续执行 */
        dateChangeBefore: ParamHandler;
        /** 最近的值 */
        lastValue: number;
        /** 是否启用到达最大值后禁用按钮 */
        autoEnabled: boolean;
        /** 是否启用 */
        private isEnabled;
        private jiaLongPressBtn;
        private jianLongPressBtn;
        /** 动态切换值 要在调用金额的方法使用前初始化 */
        dynamicHandler: ParamHandler;
        /**
         *
         * @param addBtn 加
         * @param minusBtn 减
         * @param label 文字
         *
         */
        constructor(addBtn: fgui.GButton, minusBtn: fgui.GButton, label: fgui.GTextField);
        /** 开通按钮长按 */
        set openLong(value: boolean);
        /**
         * 设置到最大
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        max(isEvent?: boolean): void;
        /**
         * 设置到最小
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        min(isEvent?: boolean): void;
        set enabled(value: boolean);
        /**
         * 赌注值
         * @param value 值
         * @param [defaultValue = 1] 默认取值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setAntes(value?: number[], defaultValue?: number, isEvent?: boolean): void;
        /**
         * 设置显示为最接近参考值的值
         * @param value 一个参考值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        setClosest(value: number, isEvent?: boolean): void;
        /**
         * 返回上一个值
         * @param [isEvent = true] 是否派发本次改变值的事件
         */
        before(isEvent?: boolean): void;
        /**
         * 设置切换到指定的位置
         * @param index 下标
         * @param [isEvent = true] 是否派发本次改变值的事件 如果值和当前的值相同 不派发事件
         */
        setPosition(index: number, isEvent?: boolean): void;
        get antes(): number[];
        /** 兼容老版本 */
        getAntes(): number[];
        /**
         * 触发监听事件
         * @param ante 当前显示值
         */
        private sendEventValue;
        private changeAnteHandler;
        /** 获取当前显示文本的数字 */
        getTextToNumber(): number;
        /** 获取当前显示文本 */
        getText(): string;
        dispose(): void;
        /** 检查自动启用停止 */
        private checkAutoEnabled;
    }
    export class UtilsTool {
        private static hiddenIFrameID;
        /**
         * 下载文件
         * @param url
         */
        static downloadURL(url: string): void;
        /**
         * 获取浏览器传入的参数
         * @param name 参数名字
         *
         */
        static getQueryString(name: string): string;
        /**
         * 获取浏览器传入的所有参数
         * @return 所有的参数key=value
         */
        static getRequest(): any;
        /** 随机数  最小值  最大值(不包括)  */
        static random(minNum: number, maxNum: number): number;
        /**
         * 随机数
         * @param minNum 最小值
         * @param maxNum 最大值(不包括)
         * @param p 保留尾数  默认NAN 表示全保留
         * @return
         */
        static randomFloat(minNum: number, maxNum: number, p?: number): number;
        /** 绑定输入框和按钮  当输入框中都存在值后  按钮变成可点击 */
        static bindInputBtn(confirmBtn: fgui.GButton, ...goldText: any[]): BindInputButton;
        /** 绑定按钮长按、点击 */
        static bindLongPressBtn(confirmBtn: fgui.GButton, callback: ParamHandler, ...args: any[]): LongPressBtn;
        /**
         * 比较两个值  获得返回值   用于数组排序   从小到大
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compare(aPrice: number, bPrice: number): 0 | 1 | -1;
        /**
         * 比较两个值  获得返回值   用于数组排序   从大到小
         * @param aPrice 第一个值
         * @param bPrice 第二个值
         * @return 大于第二个值  1   小于第二个值 -1 相等 0
         *
         */
        static compareOn(aPrice: number, bPrice: number): 0 | 1 | -1;
        /**
         * 随机生成字符串
         */
        static randomChar(): string;
        /**
         * 检查谷歌当前版本是否满足最小的版本
         * @param checkVersion 最小的版本号
         * @return
         */
        static checkChromeBrowserVersion(checkVersion: number): boolean;
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
         */
        GAME_SHOW_PROMPT_WINDOW = "game_show_prompt_window",
        /**
         * 显示提示文案窗口 带多参数设置:
         *  ```
         *  msg:string 显示提示 {}
         *  obj:IPromptData 附带设置 (okName:'', cancelName:'')
         *  callback:ParamHandler 取消回调方法
         *  continueFun:ParamHandler 确定回调方法
         *  isAction = true 动画显示或关闭
         *  ```
         */
        GAME_SHOW_PROMPT_CANCEL_WINDOW = "game_show_prompt_cancel_window",
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
        /** 游戏更新免费次数 */
        GAME_UPDATE_FREE_COUNT = "game_update_free_count",
        /** 播放收金币动画 */
        GAME_PLAY_COLLECT_GOLD_COINS_ANI = "game_play_collect_gold_coins_ani",
        /** 显示free窗口 */
        GAME_SHOW_FREE_WINDOW = "game_show_free_window",
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
    /**
     * 实现一个扩展的贝塞尔曲线类
     */
    export class BezierCurves extends fgui.GComponent {
        /** 经过时间 */
        private _t;
        private p1;
        private p2;
        private p3;
        private p4;
        get t(): number;
        set t(value: number);
        getX(): number;
        getY(): number;
        setStartPoint(tempX: number, tempY: number): void;
        setMiddlePoint(tempX: number, tempY: number): void;
        setEndPoint(tempX: number, tempY: number): void;
        /**
         * 释放曲线数据
         */
        recoverData(): void;
    }
    export enum EnvType {
        PROD = 0,
        DEV = 1,
        TEST = 2
    }
    /**
     * 配置工具
     */
    export class ConfigKit {
        /**
         * 将自动检测当前环境是否支持webp图片
         *
         * 如果网址携带参数webp将会强制使用webp图片
         */
        static useWebp(): boolean;
        /**
         * 运行环境检测
         */
        static env(url?: string): EnvType;
    }
    export class Environment {
        static TEST: string[];
        static DEV: string[];
        static PROP: string[];
        /**
         * 默认环境
         * @default EnvType.PROD
         */
        static DEFAULT_ENV: EnvType;
        /**
         * 当前运行环境，默认有三个环境
         * ```
         * dev:开发环境|test:测试环境|prod:生产环境
         * 根据域名判断环境
         * prod: prod|production|release
         * dev : dev|staging
         * test: test|debug
         * 判断依据：
         * https://www.game-prod.com prod 环境
         * https://www.game-prod-info.com prod环境
         * https://www.game-prod-info.dev prod环境
         *
         * https://www.game-dev-prod-info.com dev环境
         * https://dev.game-prod-test-info.com dev环境
         * https://www.dev.game-prod.com dev环境
         * https://www.dev-data.game.com dev环境
         *
         * ```
         * @default EnvType.PROD
         */
        static active: EnvType;
        /**
         * 验证环境
         * @param url url window.location.host
         * @param value 判断条件
         */
        static verify(url: string, value: string[]): boolean;
        static findEnv(value: string): EnvType;
    }
    /** 加载资源配置 */
    export class LoaderConfig {
        /**
         * 清理资源
         * @param res 要清理的资源数组
         */
        static clear(res: LoadRes[]): void;
    }
    export class BaseButton extends fgui.GButton implements IView {
        constructor();
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...args: any[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 根据语言包id获取字符串 */
        getString(id: string | number, ...args: any[]): string;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTarget(groupObj: any, caller: any): void;
        removeTargetAll(caller: any): void;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        getView<T>(key: string | {
            new (): T;
        }): T;
        removeView<T extends IView & IKey>(key: string | T): void;
    }
    export class BaseGameData implements IGameData {
        /** 缓存的下注值 */
        cacheAnte: any;
        /** 服务器发来的当前资金 */
        currentBalance: number;
        /** 后端计算   当前赢的钱 */
        serverWinMoney: number;
        totalWinMoney: number;
        playCount: number;
        /** 缓存 后端计算 当前赢的钱 */
        tempServerWinMoney: number;
        /** 当前玩家选择的自动下注次数 */
        autoBetCount: number;
        /** 当前玩家选择的自动下注次数 (缓存) */
        tempAutoBetCount: number;
        /** 下注额度切换值 */
        betMoney: any[];
        /** 当前押注的钱 */
        betValue: number;
        /** 开奖结果 */
        lotteryId: any[];
        /** 是否已经弹出过一次推荐现金游戏 */
        isRecommend: boolean;
        /** 通知数据 */
        noticeData: any[];
        getTotalBetMoney(): number;
        /**
         * 获取赢钱动画 的播放时长
         * @param level 播放时长等级 0开始
         */
        getWinMoneyAniDuration(level: number): number;
        /**
         * 是否是 BigWin
         * @param isTotal 是否看总金额
         * @return
         */
        isBigWin(isTotal?: boolean): boolean;
        /**
         * 是否是 MegaWin
         * @param isTotal 是否看总金额
         * @return
         */
        isMegaWin(isTotal?: boolean): boolean;
        /**
         * 是否是 SuperWin
         * @param isTotal 是否看总金额
         * @return
         */
        isSuperWin(isTotal?: boolean): boolean;
        reportError(): any;
    }
    export class BaseLabel extends fgui.GLabel implements IView {
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...args: any[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 根据语言包id获取字符串 */
        getString(id: string | number, ...args: any[]): string;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTarget(groupObj: any, caller: any): void;
        removeTargetAll(caller: any): void;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        getView<T>(key: string | {
            new (): T;
        }): T;
        removeView<T extends IView & IKey>(key: string | T): void;
    }
    export class BaseProxy extends Proxys {
        /** 游戏公用组 */
        static GAME_GROUP: string;
        constructor();
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 设置扩展 */
        protected insertExt(pkgName: string, resName: string, clas: any): void;
        /** 设置扩展 */
        protected insertExtUrl(url: string, clas: any): void;
        /** 根据语言包id获取字符串 */
        getString(id: string | number, ...args: any[]): string;
    }
    /** 游戏主页必须继承的类 */
    export class BaseScene extends BaseView implements IGameScene, IGuideScene {
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
        protected constructFromXML(xml: any): void;
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
        /** 引导事件执行 */
        protected onGuideEvent(): void;
        /** 显示引导页 默认不显示引导页 */
        protected showGuide(): boolean;
        /**
         * 加载全屏图片
         * @param value
         */
        protected loadFillImage(value: any): void;
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
        runEvent(): void;
        /** 运行事件开始 */
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
         * 显示邀请进入真钱场
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
    }
    export abstract class BaseSkeleton extends fgui.GComponent implements ISkeleton {
        /** 经过时间 */
        private _t;
        private p1;
        private p2;
        private p3;
        private p4;
        /** 播放动画数组的索引 */
        protected playGroupIndex: number;
        /** 缓存每次播放的名字或下标 */
        nameOrIndex: string | number;
        /** 播放结束执行函数 */
        protected stoppedHandler: Laya.Handler[];
        /**
         * 动画播放速率 1为标准速率
         * @default 1
         */
        playbackRate: number;
        /**
         * 播放数据
         */
        protected skeletonPlay: ISkeletonPlay;
        /** 加载路径 */
        protected _aniPath: string;
        protected _complete: ParamHandler;
        get aniPath(): string;
        /**
         * 播放动画
         *
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放 默认true
         * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    start        起始时间
         * @param    end            结束时间
         * @param    freshSkin    是否刷新皮肤数据
         * @param    playAudio    是否播放音频
         */
        play(nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop?: boolean, force?: boolean, start?: number, end?: number, freshSkin?: boolean, playAudio?: boolean): void;
        /**
         * 播放动画
         * @param skeletonPlay 播放数据
         * @param playGroupIndex 如果是播放数组动画 需要要播放动画的位置
         */
        playAni(skeletonPlay: ISkeletonPlay, playGroupIndex?: number): void;
        private _play;
        protected onPlayStopped(): void;
        paused(): void;
        resume(): void;
        stop(): void;
        getAniNameByIndex(index: number): string;
        getSkeletonPlay(): ISkeletonPlay;
        /**
         * 获取实例 Skeleton
         */
        abstract get asSkeleton(): Laya.Skeleton | Laya.SpineSkeleton;
        abstract getAniIndexByName(name: string): number;
        abstract getAnimDuration(aniIndex: number): number;
        abstract getAnimFrame(aniIndex: number): number;
        abstract getAnimation(aniIndex: number): AnimationContent | spine.Animation;
        abstract get currAniIndex(): number;
        get t(): number;
        set t(value: number);
        getX(): number;
        getY(): number;
        setStartPoint(tempX: number, tempY: number): void;
        setMiddlePoint(tempX: number, tempY: number): void;
        setMiddlePoint2(tempX: number, tempY: number, tempX2: number, tempY2: number): void;
        setEndPoint(tempX: number, tempY: number): void;
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
        constructor();
        /** 总共要投注的钱 */
        getTotalBetMoney(): number;
        /** 获取当前的开奖数据 */
        getLotteryId(): any[];
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
    export class BaseSlotItem extends BaseLabel {
        constructor();
        /** 还原最原始状态 */
        resetUI(): void;
        /** 显示中奖 */
        showWin(): void;
        /** 变暗 */
        dark(): void;
        /** 变暗取消 */
        darkCancel(): void;
    }
    export class BaseSlotView extends BaseView {
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
        constructor();
        protected onInit(): void;
        /**
         * 显示指定按钮下的线
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
        getSlotModel(): SlotModel;
        dispose(): void;
    }
    export class BaseSocket {
        /** 是否已经连接 */
        protected isConnect: boolean;
        /** socket类型注册监听 */
        protected eventManager: {
            [key: string]: ParamHandler;
        };
        /** 关闭链接 */
        close(): void;
        /**
         * 删除socket 事件
         * @param type
         */
        removeSocketEvent(type: number): void;
        /**
         * 注册socket 事件
         * @param type
         * @param handler
         */
        addSocketEvent(type: number, handler: ParamHandler): void;
        /**
         * 发送socket type事件
         * @param type
         * @param obj
         */
        sendEventManager(type: number, ...obj: any[]): void;
    }
    export class BaseStarter extends BaseProxy {
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
    export class BaseWindow extends fgui.Window implements IView, IRecord {
        /** 动画显示或关闭 */
        protected isAction: boolean;
        /** 是否加入后退记录 */
        joinRecord: boolean;
        /** 动画起始点 */
        startPoint: Laya.Point;
        protected onInit(): void;
        protected updateSizePoint(): void;
        protected doHideAnimation(): void;
        protected doShowAnimation(): void;
        protected closeEventHandler(): void;
        protected onHide(): void;
        hideRecord(): void;
        showRecord(): void;
        dispose(): void;
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...arge: any[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...arge: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        sendAction(action: string, ...arge: any[]): void;
        sendGroupAction(group: string, action: string, ...arge: any[]): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        /** 根据语言包id获取字符串 */
        getString(id: string | number, ...args: any[]): string;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTarget(groupObj: any, caller: any): void;
        removeTargetAll(caller: any): void;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        getView<T>(key: string | {
            new (): T;
        }): T;
        removeView<T extends IView & IKey>(key: string | T): void;
    }
    export class Controller implements IController {
        /** 事件缓存的所有组 组名字->组object */
        private obj;
        /**
         * 键值的缓存对象
         */
        private cacheTarget;
        private static _CLSID;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        /**
         * 分组存储对象
         * @param groupKey 分组key
         * @return
         */
        getGroup(groupKey: string): {
            [key: string]: Laya.Handler[];
        };
        regAction(action: string, caller: any, method: Function, group?: string): void;
        clearView(): void;
        clearGroup(): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(groupKey: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        sendAction(action: string, ...args: any[]): void;
        sendActionEvent(group: string, action: string, ...args: any[]): boolean;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        removeView<T extends IView & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        getMap(): {
            [key: string]: any;
        };
        /**
         * 返回类的唯一标识
         */
        private _getClassSign;
    }
    /**
     *
     * @author boge
     *
     */
    export class GameModel extends BaseProxy implements IGameModel {
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
    }
    /**
     * 游戏基础类
     * @author boge
     */
    export abstract class GameServlet extends BaseProxy implements IGameServlet {
        protected _gameModel: IGameModel;
        protected initHandler: ParamHandler;
        /** 开奖获取次数 */
        getLotteryCount: number;
        /** 当前访问接口获得游戏状态 */
        protected gameStatus: number;
        /** 网络通信名字 */
        networkName: string;
        protected constructor();
        /**
         * @param url
         * @param data
         * @param callback
         * @param error
         * @param timeout
         */
        getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): void;
        /**
         * post 请求
         * @param url 请求连接 相对路径
         * @param data 请求数据
         * @param callback 请求完成返回调用函数
         * @param error 错误调用函数
         * @param timeout
         * @param headers
         * @param overtime
         */
        post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: string[], overtime?: number): void;
        /**
         *
         * @param handler
         */
        checkState(handler: ParamHandler): void;
        /**
         * 进入游戏失败
         * @param message 弹窗内容
         */
        /**
         * 进入游戏失败
         * @param isTip 是否需要弹窗
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
        readJackpotData(data: any): void;
        /** 获取投注劵 */
        protected getCoupon(): void;
        /** 收到投注劵数据 */
        protected couponHandler(data: any): void;
        /**
         * 修改检查状态数据
         * @param data
         */
        protected modifyCheckState(data: any): void;
        /**
         * 解析初始化数据
         * @param data
         *
         */
        protected abstract parseInitData(data: any): any;
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
    export class MyDrawTextureCmd extends Laya.DrawTextureCmd {
        /** 骨骼名字
         * @default null */
        name: string;
        recover(): void;
    }
    export class MyLoader {
        /** 加载域名备用 */
        baseUrls: string[];
        private _infoPool;
        static isWebp: boolean;
        static loader: MyLoader;
        /** 检查baseUrl 如果需要设置baseUrls 可以在这里处理  例如： checkBaseUrl = function(url?:string):string[] {} */
        static checkBaseUrl: (url?: string) => string[];
        /** 加载路径格式化 */
        static format: IFormatVer[];
        constructor();
        static formatUrl(url: string): string;
        /**
         * <p>加载资源。资源加载错误时，本对象会派发 Event.ERROR 事件，事件回调参数值为加载出错的资源地址。</p>
         * <p>因为返回值为 LoaderManager 对象本身，所以可以使用如下语法：loaderManager.load(...).load(...);</p>
         * @param    url            要加载的单个资源地址或资源信息数组。比如：简单数组：["a.png","b.png"]；复杂数组[{url:"a.png",type:Laya.Loader.IMAGE,size:100,priority:1},{url:"b.json",type:Laya.Loader.JSON,size:50,priority:1}]。
         * @param    complete    加载结束回调。根据url类型不同分为2种情况：1. url为String类型，也就是单个资源地址，如果加载成功，则回调参数值为加载完成的资源，否则为null；2. url为数组类型，指定了一组要加载的资源，如果全部加载成功，则回调参数值为true，否则为false。
         * @param    progress    加载进度回调。回调参数值为当前资源的加载进度信息(0-1)。
         * @param    type        资源类型。比如：Loader.IMAGE。
         * @param    priority    (default = 1)加载的优先级，优先级高的优先加载。有0-4共5个优先级，0最高，4最低。
         * @param    cache        是否缓存加载结果。
         * @param    group        分组，方便对资源进行管理。
         * @param    ignoreCache    是否忽略缓存，强制重新加载。
         * @param    useWorkerLoader(default = false)是否使用worker加载（只针对IMAGE类型和ATLAS类型，并且浏览器支持的情况下生效）
         * @return 此 LoaderManager 对象本身。
         */
        load(url: string | Array<string | LoadRes>, complete?: Laya.Handler, progress?: Laya.Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean, useWorkerLoader?: boolean): void;
        /** 更新基础路径 */
        private updateBaseUrl;
        private loadAssets;
        private _load;
        private singleCompleteHandler;
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        getRes(url: string): any;
        /**
         * 获取指定资源地址的资源。
         * @param    url 资源地址。
         * @return    返回资源。
         */
        clearRes(url: string): void;
        /** 清理当前未完成的加载，所有未加载的内容全部停止加载。*/
        clearUnLoaded(): void;
    }
    /**
     * 碰撞类
     */
    export class OBB extends View {
        /** 轴心 0 X轴 1 Y轴 */
        private _axes;
        /** 变径长度 */
        protected _extents: number[];
        private _point;
        constructor();
        /**
         * 碰撞检测 判断2矩形最终是否碰撞，需要依次检测4个分离轴，如果在一个轴上没有碰撞，则2个矩形就没有碰撞。
         * @param obb 要参与检测的对象
         * @return
         */
        detectorOBBvsOBB(obb: OBB): boolean;
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        /**
         * 通过旋转设置x轴和y轴
         * @param value 0-360
         */
        set rotation(value: number);
        setXY(xv: number, yv: number): void;
        /**
         * 获取轴上的axisX和axisY投影半径距离
         * @param axis
         */
        getProjectionRadius(axis: Vector2): number;
        get axes(): Vector2[];
        get point(): Vector2;
    }
    class Vector2 {
        private x;
        private y;
        constructor(x?: number, y?: number);
        setXY(x: number, y: number): void;
        sub(v: Vector2): Vector2;
        /**
         * 算出自己在参数v上投影的长度
         * @param v
         */
        dot(v: Vector2): number;
    }
    export abstract class SlotModel extends GameModel {
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
        /** 全部滚动结束调用方法 */
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
         * @return
         *
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
    /**
     * slot游戏滚动效果类 使用了 FrameLoop + Laya.Tween
     */
    export class SlotScrollModel extends SlotModel {
        /** 当前滚动圈数 */
        private rollCount;
        /** 滚动到最大圈数  就可以播放开奖结果了 */
        private rollMaxCount;
        /** 是否已经开始播放结束动画 */
        private isPlayEndTween;
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
    export class SlotScrollTweenModel extends SlotModel {
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
    export class DefineConfig {
        static init(): void;
        private static defineLaya;
        private static defineFairy;
        private static defineTimer;
        private static defineSpineSkeleton;
    }
    export class GoldEffect extends View {
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
    /**
     * 具有贝塞尔曲线运动的loader
     */
    export class GoldLoader extends fgui.GLoader {
        static readonly NAME = "GoldLoaderPool";
        /** 经过时间 */
        private _t;
        private p1;
        private p2;
        private p3;
        private p4;
        /**
         * 从对象池获取一个 GoldLoader
         */
        static create(): GoldLoader;
        constructor();
        /**
         * 将对象放到对应类型标识的对象池中。
         */
        recover(): void;
        get t(): number;
        set t(value: number);
        getX(): number;
        getY(): number;
        setStartPoint(tempX: number, tempY: number): void;
        setMiddlePoint(tempX: number, tempY: number): void;
        setEndPoint(tempX: number, tempY: number): void;
        dispose(): void;
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
        constructor();
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
        playObject(parent: View, goldUrl: string, num: number, endObject: fgui.GObject, endHandler?: ParamHandler): void;
        /**
         * 播放金币动画
         * @param parent 要被添加到的舞台
         * @param goldUrl 金币图片
         * @param num 数量
         * @param endPoint 最后结束坐标
         * @param endHandler 动画播放结束回调
         */
        play(parent: View, goldUrl: string, num: number, endPoint: Laya.Point, endHandler?: ParamHandler): void;
        private onFrameLoop;
        private playEndPointAni;
        playComplete(): void;
        dispose(): void;
    }
    export class Factory implements IAction {
        private static _instance;
        static get inst(): Factory;
        /** 默认的分组名
         * @default group
         * */
        static DEFAULT_GROUP: string;
        /** 默认cacheId标记头
         * @default cache
         * */
        static DEFAULT_CACHE_HEAD: string;
        private controller;
        constructor();
        /**
         * 初始化框架
         */
        static init(): void;
        static initClass(...args: any[]): void;
        protected initController(): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        regAction(action: string, caller: any, method: Function, group?: string): void;
        removeAllAction(...args: string[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...args: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        removeFunction(groupObj: any, action: string, method: Function): void;
        removeTargetAll(caller: any): void;
        removeTarget(groupObj: any, caller: any): void;
        sendAction(action: string, ...args: any[]): void;
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        removeView<T extends IView & IKey>(key: string | T): void;
        getView<T>(key: string | {
            new (): T;
        }): T;
        getProxy<T>(name: string | {
            new (): T;
        }): T;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
        removeProxy<T extends IProxy & IKey>(key: string | T): void;
        /** 清除所有UI缓存 */
        clearView(): void;
        /** 清除所有分组和包含的事件 */
        clearGroup(): void;
    }
    export interface IAction {
        /**
         * 注册事件
         * @param action 事件名字
         * @param handler 处理事件函数
         * @param group 分组集合
         */
        regActionHandler(action: string, handler: Laya.Handler, group?: string): any;
        /**
         * 注册事件
         * @param action 事件名字
         * @param caller 执行域(this)
         * @param method 处理事件函数
         * @param group 分组集合
         */
        regAction(action: string, caller: any, method: Function, group?: string): any;
        /**
         * 删除所有分组中的此动作
         * @param args 动作名字
         */
        removeAllAction(...args: string[]): any;
        /**
         * 删除一个分组
         * @param group 分组集合
         */
        removeGroup(group: string): any;
        /**
         * 删除一个分组的所有动作
         * @param group 分组集合
         * @param args 事件名字 数组
         */
        removeGroupActions(group: string, ...args: string[]): any;
        /**
         * 删除事件
         * @param action 事件名字
         * @param method 删除指定的 Function 处理事件
         * @param group 分组集合
         */
        removeActionHandler(action: string, method: Function, group?: string): void;
        /**
         * 根据方法删除
         * @param groupObj 分组集合
         * @param action 事件名字
         * @param method 执行方法
         */
        removeFunction(groupObj: any, action: string, method: Function): void;
        /**
         * 删除目标所有事件
         * @param caller 目标
         */
        removeTargetAll(caller: any): void;
        /**
         * 删除目标分组所有事件
         * @param groupObj 分组集合
         * @param caller 目标
         */
        removeTarget(groupObj: any, caller: any): void;
        /**
         * 向一个分组集合发送事件
         * @param group 分组
         * @param action 事件名字
         * @param args 发送的数据
         */
        sendGroupAction(group: string, action: string, ...args: any[]): void;
        /**
         * 发送事件
         * @param action 事件名字
         * @param args 发送的数据
         */
        sendAction(action: string, ...args: any[]): void;
    }
    export enum Method {
        GET = "get",
        POST = "post"
    }
    export interface IFormatVer {
        /**
         * 调用自定义的方法
         * @param url 原始请求地址
         * @param version 从版本控制中获取的版本号 可能为空
         * @return 返回处理后的版本号
         */
        call(url: string, version: any): string;
    }
    export interface IKey {
        /**
         * 设置标识
         * @param key
         */
        setKey(key: string): any;
        /**
         * 获取当前的key值
         */
        getKey(): string;
    }
    export interface IView extends IAction {
        /**
         * 添加一个view对象到缓存
         * @param key 键
         * @param view 值
         * @return 如果存在键 不会再存入
         */
        addView<T extends IView & IKey>(key: string | {
            new (): T;
        }, view: T): boolean;
        /**
         * 删除一个键值对
         * @param key 键
         */
        removeView<T extends IView & IKey>(key: string | T): any;
        /**
         * 获取一个值
         * @param key 键
         * @return 值
         */
        getView<T>(key: string | {
            new (): T;
        }): T;
    }
    export interface IProxy extends IAction {
        getProxy<T>(key: string | {
            new (): T;
        }): T;
        removeProxy<T extends IProxy & IKey>(key: string | T): any;
        addProxy<T extends IProxy & IKey>(key: string | {
            new (): T;
        }, proxy: T): boolean;
    }
    export interface IController extends IView, IProxy {
        /** 清除所有UI缓存 */
        clearView(): any;
        /** 清除所有分组和包含的事件 */
        clearGroup(): any;
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
    /**
     * 登录接口
     */
    export interface ILogin {
        /** 使用Token登录 并获取用户数据 */
        loginToken(callback: ParamHandler): any;
    }
    export interface IRecord {
        /**
         * 显示当前界面
         */
        showRecord(): void;
        /**
         * 隐藏当前界面
         */
        hideRecord(): void;
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
         *
         */
        getURL(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): void;
        /**
         * post 请求数据
         * @param url
         * @param data
         * @param callback
         * @param error
         * @param timeout
         * @param headers
         * @param overtime
         *
         */
        post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler, headers?: any[], overtime?: number): void;
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
    export interface ISkeleton {
        /**
         * 通过索引得动画名称
         * @param index
         */
        getAniNameByIndex(index: number): string;
        /**
         * 通过动画名称得索引
         * @param name
         */
        getAniIndexByName(name: string): number;
        /**
         * 通过索引获取动画
         * @param aniIndex
         */
        getAnimation(aniIndex: number): AnimationContent | spine.Animation;
        /**
         * 通过索引获取动画时长
         * @param aniIndex
         */
        getAnimDuration(aniIndex: number): number;
        /**
         * 通过索引获取动画总帧数
         * @param aniIndex
         */
        getAnimFrame(aniIndex: number): number;
        /**
         * 当前播放的索引
         */
        readonly currAniIndex: number;
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
    export enum LogLevel {
        ALL = 0,
        /**
         * 跟踪
         */
        TRACE = 1,
        DEBUG = 2,
        INFO = 3,
        WARN = 4,
        ERROR = 5,
        /**
         * 致命错误
         */
        FATAL = 6,
        OFF = 7
    }
    /**
     * 定义日志格式
     */
    export class Log {
        /**
         * @default LogLevel.ALL
         */
        static level: LogLevel;
        static MAX_HISTORY: number;
        static history: {
            level: number;
            time?: number;
            data: any[];
        }[];
        static trace(...value: any[]): void;
        static debug(...value: any[]): void;
        static info(...value: any[]): void;
        static warn(...value: any[]): void;
        /**
         * 错误
         * @param value
         */
        static error(...value: any[]): void;
        /**
         * 致命的错误
         * @param value
         */
        static fatal(...value: any[]): void;
    }
    /**
     * 统计管理器
     * @author boge
     */
    export class AnalyticsManager {
        /** 开启数据统计 */
        static isOpenAnalytics: boolean;
        constructor();
        /** 打开了一个游戏 */
        static openGame(): void;
        /** 关闭了一个游戏 */
        static closeGame(): void;
        /** 打开统计 */
        static openAnalysis(callback: Function): void;
        /**
         * 发送游戏事件
         * @param eventAction 互动类型 (默认会添加 _)
         */
        static sendGameAnalysis(eventAction: string): void;
        /**
         * 向Google Analytics 发送事件
         * @param eventAction 互动类型
         *
         */
        static send(eventAction: string): void;
        /**
         * 向Google Analytics 发送用户用时
         * @param timingVar 用于标识要记录的变量
         * @param timingValue 向 Google Analytics（分析）报告的，以毫秒为单位的历时时间（例如 20）。
         *
         */
        static sendTiming(timingVar: string, timingValue: number): void;
    }
    export class APP {
        private static _instance;
        static get inst(): APP;
        constructor();
        openGame(gameId: number): void;
        hide(): void;
        share(type: number, url: string, content: string): void;
        /** 打开app */
        openApp(packageName: string, uriPath: string, url: string, jsonData?: any): void;
        showGame(str: string): void;
    }
    /** app管理器 */
    export class AppManager {
        private static jsToJava;
        constructor();
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
        static enterFeedback(sData: any, callback: Function): void;
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
         * 启动服务
         */
        static startServer(): void;
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
    }
    /**
     * app 访问记录管理
     * @author boge
     */
    export class AppRecordManager {
        /**
         * 访问记录
         */
        private static history;
        /** 退出点击上一次时间 */
        private static exitTimer;
        /** 暂停返回上一页 */
        static pauseHistory: boolean;
        /** 进入大厅后执行命令 */
        static executeJson: any;
        /**
         * 添加一个记录
         * @param currentPage 当前的面板
         * @param newPage 添加的新面板
         */
        static addHistory(currentPage: IRecord, newPage: IRecord): void;
        /**
         * 作废指定的记录
         * @param value 记录页面
         *
         */
        static invalidHistory(value: IRecord): void;
        /**
         * 退出游戏
         * @param [isBack = false] 是否用的返回键（非项目内的）
         *
         */
        static backGame(isBack?: boolean): void;
        /**
         * 返回操作
         * @param isBack 是否用的返回键（非项目内的）
         *
         */
        static backHistory(isBack?: boolean): void;
        /** 执行非大厅后退 */
        private static back;
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
        static JavaSendOpen(json: any): void;
        private static open;
        /**
         * 长度
         * @return
         */
        static len(): number;
        /** 清理所有页面缓存 */
        static clearHistory(): void;
    }
    /**
     * 资源管理类
     */
    export class AssetsLoader implements IFormatVer {
        private static _instance;
        static get inst(): AssetsLoader;
        static readonly ma: number;
        /** 资源配置文件名 */
        static CONFIG_RES_NAME: string;
        /** 下载成功 */
        private handler;
        /** 下载失败 */
        private errorHandler;
        /** 加载对象 */
        private loadObj;
        /** 是否是http  */
        readonly httpProtocol: boolean;
        /**
         * 自定义额外加载操作
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
         * 自定义加载资源处理
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
        constructor();
        call(url: string, version: any): string;
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
         */
        loadCommon(handler: ParamHandler): void;
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
         * @param loadRes 整理好的加载数据
         */
        static checkBranch(loadRes: LoadRes[]): void;
        private progressComplete;
        private loadComplete;
        private loadErrorHandler;
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
    }
    /**
     * 舞台
     */
    export class SceneManager extends BaseProxy {
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
        showHomeScene(): void;
        /** 显示登录界面 */
        showLogin(): void;
        /** 退出登录 */
        logout(): void;
        /** 游戏是否进入后台 */
        private visibilityChange;
        /** 得到焦点开始渲染 */
        private focusHandler;
        /** 失去焦点停止渲染 */
        private blurHandler;
        /** 登录提示框 */
        showloginTip(): void;
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioScale(): number;
        /** 获取当前屏幕等比例缩放系数 */
        getEqualRatioRatio(w: number, h: number): Laya.Point;
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
         * @param gameModel 游戏id
         * @return
         *
         */
        checkAloneGame(gameModel: number): boolean;
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
        /** 更新当前游戏中的游戏金币 */
        updateGlod(): void;
        get starter(): BaseStarter;
        get scene(): BaseScene;
        /**
         * 上传错误日志
         * @param data json格式的错误数据
         */
        sendErrorLog(data: any): void;
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
    export class GameHttpRequest extends Laya.HttpRequest {
        /** 请求数据完成 */
        private completeHandler;
        /** 请求错误 */
        private errorHandler;
        /** 超时 */
        private timerOutHandler;
        /** 超时时间 */
        private overtime;
        /**
         * 创建一个请求
         */
        constructor();
        onComplete(value: ParamHandler): void;
        onTimerOut(value: ParamHandler): void;
        onError(value: ParamHandler): void;
        setOvertime(value: number): void;
        send(url: string, data?: any, method?: string, responseType?: string, headers?: string[] | null): void;
        private httpErrorHandler;
        /** 请求返回结果数据 */
        private resultHandler;
        private timeOut;
        /**
         * 终止请求
         */
        abort(): void;
    }
    export class GameSocket extends Laya.EventDispatcher {
        static SOCKET_CLASS_PATH: string;
        protected MAX_CONNECT_TIME: number;
        protected DELAY: number;
        protected socket: any;
        protected options: any;
        protected auth: boolean;
        alive: boolean;
        /**
         * 创建一个socket
         * @param options 参数 url 连接地址 notify 回调方法 auth 认证
         */
        constructor(options: any);
        createConnect(): void;
        protected connect(): void;
        closeHandler(msg?: any): void;
        messageHandler(evt: any): void;
        errorHandler(e: any): void;
        openHandler(): void;
        protected reConnect(): void;
        protected heartbeat(): void;
        protected getAuth(): void;
        send(data: any): void;
        close(): void;
    }
    export enum HttpCode {
        /** 正确返回代码 */
        OK = 200
    }
    export interface IHttpFilter {
        /**
         * 解析发送数据
         * @param url 访问地址
         * @param value 发送的数据
         * @return 发送的数据
         */
        filterSendData(url: string, value: any): any;
        /**
         * 解析返回的数据
         * @param url 访问地址
         * @param value 返回的数据
         * @return 返回的数据
         */
        filterResultData(url: string, value: any): any;
        /**
         * 拦截器 返回true 表示拦截不再继续执行后续的处理   false 表示继续执行后续的处理
         * @param url 访问地址
         * @param value 数据
         * @param complete 成功数据
         * @param error 失败数据
         * @param timeout 超时
         */
        interceptSend(url: string, value: any, complete?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler): boolean;
        /**
         * 错误调用
         * @param error
         */
        errorResult(error: any): void;
        /** 自己解析通信数据 url->Handler   需要有返回方法 false 表示继续默认的处理模式 true 表示中止继续处理 */
        customResult: {
            [key: string]: ((url: string, value: any, complete?: ParamHandler, error?: ParamHandler, timeout?: ParamHandler) => boolean) | Laya.Handler;
        };
        /**
         * 解析服务器的时间 返回服务器时间毫秒
         * @param data
         */
        parseData(data: any): number;
    }
    /** socket管理 */
    export class SocketManager extends BaseSocket {
        private static _instance;
        static get inst(): SocketManager;
        /** 当前连接的房间号 */
        private _roomId;
        /** 接受到的消息 */
        private receiveData;
        private _client;
        static SocketClass: typeof GameSocket;
        constructor();
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
        onMessageReveived(data: any): void;
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
        constructor();
        parseData(json: any): void;
        getValue(json: any, key: string): string;
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
    export enum Urls {
        /** 获取服务器时间 */
        GAME_SERVER_TIME = "/game/server-time",
        /** 优惠券投注 */
        URL_COUPON_BET = "/game/coupon/bet",
        /** 获取用户信息 */
        URL_USER_INFO = "/user/info",
        /** 获取用户账户金额 */
        URL_USER_ACCOUNT_ASSET = "/account/asset",
        /** gift 抽奖开奖结果 */
        URL_GAME_SCRATCHER_LOTTERY = "/game/scratcher/handle",
        /** 获取所有优惠券 */
        URL_GAME_ALL_COUPON = "/coupon/all?"
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
        /** 玩家昵称 */
        nickname: string;
        /** 玩家id */
        userId: number;
        /** 客户端生成的唯一ID */
        uuid: string;
        /** 用户身份码 */
        token: string;
        /** 手机号 */
        mobile: string;
        /** 设备号 */
        device: string;
        /** url参数 */
        urlParam: UrlParam;
        /** 游戏数据 */
        gameData: IGameData;
        /** 游戏类型  id */
        gameModel: number;
        /** 游戏类型  id */
        gameName: string;
        /** 是否是web端口 */
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
        guestModel: IGuestModel;
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
        parseParam: any;
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
         * 获取游客模式的优惠券
         * @return
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
         * @param gameId 游戏ID
         * @return
         */
        getCouponGame(gameId: number): Coupons[];
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
         * @private
         */
        set status(value: number);
        windowOpen(url: string): void;
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
    export interface IConchRenderObject {
        drawSubmesh(submesh: any, drawType: number, renderMode: number, offset: number, count: number): void;
        matrix(matrix: Float32Array): void;
        boundingBox(min: Float32Array, max: Float32Array): void;
    }
    export interface ICPlatformClass {
        /**
         * 创建平台类
         * @param    clsName  类全名
         * @return 创建的类
         */
        createClass(clsName: string): IPlatformClass;
    }
    /**
     * 游戏模式
     */
    export interface IGuestModel {
        /** 游客id */
        guestUID: number;
        /** 游客模式玩次数 */
        guestPlayCount: any;
        /** 清除数据  */
        clearData(): any;
        /**
         * post请求 返回数据  可以在这里对返回数据进行修改
         * @param url 访问网址
         * @param data 押注额度
         */
        playAdd(url: string, data: any): any;
    }
    export interface IMarket {
        /**
         * 登录
         * @param    jsonParm
         * @param    callback
         */
        login(jsonParm: string, callback: Function): void;
        /**
         * 登出
         * @param    jsonParm
         * @param    callback
         */
        logout(jsonParm: string, callback: Function): void;
        /**
         * 授权
         * @param    jsonParm
         * @param    callback
         */
        authorize(jsonParm: string, callback: Function): void;
        /**
         * 进入论坛
         * @param    jsonParm
         * @param    callback
         */
        enterBBS(jsonParm: string, callback: Function): void;
        /**
         * 刷新票据
         * @param    jsonParm
         * @param    callback
         */
        refreshToken(jsonParm: string, callback: Function): void;
        /**
         * 支付
         * @param    jsonParm
         * @param    callback
         */
        recharge(jsonParm: string, callback: Function): void;
        /**
         * 分享
         * @param    jsonParm
         * @param    callback
         */
        enterShareAndFeed(jsonParm: string, callback: Function): void;
        /**
         * 邀请
         * @param    jsonParm
         * @param    callback
         */
        enterInvite(jsonParm: string, callback: Function): void;
        /**
         * 获取游戏好友
         * @param    jsonParm
         * @param    callback
         */
        getGameFriends(jsonParm: string, callback: Function): void;
        /**
         * 发送到桌面
         * @param    jsonParm
         * @param    callback
         */
        sendToDesktop(jsonParm: string, callback: Function): void;
        /**
         * 发送自定义消息
         * @param    jsonParm
         * @param    callback
         */
        sendMessageToPlatform(jsonParm: string, callback: Function): void;
        /**
         * 获取用户信息
         * @param    jsonParm
         * @param    callback
         */
        getUserInfo(jsonParm: string, callback: Function): void;
        /**
         * 返回Market名称
         */
        getMarketName(): string;
        /**
         * 返回支付类型 自定义
         */
        getPayType(): number;
        /**
         * 返回登录类型 自定义
         */
        getLoginType(): number;
        /**
         *
         */
        getChargeType(): number;
    }
    export interface IPlatform {
        /**
         * 调用方法
         * @param    methodName  方法名
         * @param    args     参数
         * @return 返回值 目前只用android能直接返回
         */
        call(methodName: string, ...args: any[]): any;
        /**
         * 调用方法通过回调接收返回值
         * @param    callback     回调方法 参数为返回值
         * @param    methodName   方法名
         * @param    args     参数
         */
        callWithBack(callback: Function, methodName: string, ...args: any[]): void;
    }
    export interface IPlatformClass extends IPlatform {
        /**
         * 创建对象
         * @param    args  构造函数的参数
         * @return  创建出来的对象
         */
        newObject(...args: any[]): IPlatform;
    }
    export class NativeUtils {
        /**@private Market对象 只有加速器模式下才有值*/
        static conchMarket: IMarket;
        /**@private PlatformClass类，只有加速器模式下才有值 */
        static PlatformClass: ICPlatformClass;
    }
    /** 卡牌 */
    export class Card extends BaseLabel {
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
        constructor();
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
    export class BindInputButton {
        btn: fgui.GButton;
        array: any[];
        /** 当绑定的输入组件 内容修改后调用 */
        callback: Function;
        /**
         *
         * @param btn
         * @param array
         */
        constructor(btn: fgui.GButton, array: any[]);
        /** 检查一次状态 */
        check(): void;
        private changeHandler;
    }
    export class Cast {
        /** 计算角度的公式  180 / Math.PI */
        static RAD_TO_DEG: number;
        /** 计算弧度的公式  Math.PI / 180 */
        static DEG_TO_RAD: number;
        /**
         * 角度转弧度
         * @param angle 角度
         */
        static angleToRadians(angle: any): number;
        /**
         * 弧度转角度
         * @param radians 弧度
         */
        static radiansToAngle(radians: any): number;
        /**
         * 计算两点之间的角度角度
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         *
         */
        static angle(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * 计算两点之间的距离
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         *
         */
        static pointDistance(x1: number, y1: number, x2: number, y2: number): number;
        /**
         * 获取两点中间点的坐标
         * @param x1 原始坐标X
         * @param y1 原始坐标Y
         * @param x2 新坐标X
         * @param y2 新坐标Y
         * @return
         */
        static getPointMiddle(x1: number, y1: number, x2: number, y2: number): Laya.Point;
        /**
         * 获取圆上一点的坐标，坐标起点从坐标系右下方向左计算
         * @param x 圆点X坐标
         * @param y 圆点Y坐标
         * @param radius 半径
         * @param radians 弧度(不是角度)
         */
        static roundPoint(x: number, y: number, radius: number, radians: number): Laya.Point;
        /**
         * 补全数字
         * @param data 要处理的数字、或字符串化的数字
         * @param len 数字总长度
         * @param isLast 是否补在尾部
         */
        static fillAVacancy(data: number | string, len: number, isLast?: boolean): string;
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         * @return
         */
        static toFixed(value: number | string, p?: number): number;
        /**
         * 精确小数点  如果有小数点 保留指定数量  如果没有  返回整数
         * @param value 要处理的数字、或字符串化的数字
         * @param p 保留的小数位数
         */
        static toFixedStr(value: number | string, p?: number): string;
        /**
         * 字格式
         * @param value 数值
         * @param beyondLimit 超过此值否才分隔 (默认 1000)
         * @param limit 分隔值 按照此值分隔 (默认 1000)
         * @param unit 单位  (默认 K)
         * @param fixed 最后保留几位小数 (默认 2)
         * @return
         */
        static numberConvert(value: number, beyondLimit?: number, limit?: number, unit?: string, fixed?: number): string;
        /**
         * 将100000转为100,000.00形式
         * @param money
         * @param fixed 是否保留小数(默认false)
         * @return
         */
        static formatMoney(money: string | number, fixed?: boolean): string;
        /**
         * 将100,000.00转为100000形式
         * @param money
         * @param fixed 是否保留小数 (默认false)
         * @return
         */
        static formatMoney2(money: string | number, fixed?: boolean): number;
        /**
         * 打乱数组
         * @param array 要被打乱的数组
         *
         */
        static shuffle(array: any[]): void;
        /** aes加密 */
        static encrypt(word: any, key?: string): any;
        /** aes解密 */
        static decrypt(word: any, key?: string): string;
        /**
         * 文字长度省略
         * @param value 文字内容
         * @param len 最大长度
         * @param symbol 符号
         */
        static stringOmit(value: string, len: number, symbol?: string): string;
        /**
         * 去除重复值
         * @param array
         */
        static removeRepeat(array: any[]): any[];
        private static checkRepeat;
        /**
         * 交换数组中的两个值的位置
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static swapValue(value: any[], stateIndex: number, endIndex: number): void;
        /**
         * 改变值的位置(将数组中的一个值修改到其它位置)
         * @param value 数组
         * @param stateIndex 要被切换掉的值
         * @param endIndex 要新切换到的位置 (该位置必须是总数组的长度-1)
         *
         */
        static changeValue(value: any[], stateIndex: number, endIndex: number): void;
        /**
         * 高度适配
         * @param obj 适配对象
         */
        static heightAdaptation(obj: fgui.GObject): void;
        static evil(fn: any): any;
        static loadScript(str: string): void;
    }
    export class ConfigUtils {
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
         * 根据游戏id获取游戏名字 如果没有 null
         * @param code
         */
        static gameName(code: number): string;
        /**
         * 根据游戏名获取游戏id 如果不存在返回-1
         * @param name
         */
        static gameCode(name: string): number;
        /**
         * 获取游戏配置数据
         * @param name 游戏名字 如果传入null 将尝试获取当前打开的游戏数据
         */
        static gameRes(name?: string): ResConfig;
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
    export class DateUtils {
        /** 星期 默认英文 */
        static weekday: string[];
        /**
         * 格式化时间
         * @param date 时间
         * @param fmt 格式
         * @param isUTC 使用国际时间
         * @example
         * fmt:
         * yyyy：年
         * MM：月
         * dd：
         * hh：1~12小时制(1-12)
         * HH：24小时制(0-23)
         * mm：分
         * ss：秒
         * S：毫秒
         * E：星期几
         * @return
         */
        static formatDate(date: number | Date, fmt: string, isUTC?: boolean): string;
        /**
         * 比较时间大小
         * time1>time2 return 1
         * time1<time2 return -1
         * time1==time2 return 0
         * @param time1
         * @param time2
         */
        static compareTime(time1: any, time2: any): 0 | 1 | -1;
        /**
         * 是否闰年
         * @param year 年份
         */
        static isLeapYear(year: number): boolean;
        /**
         * 获取某个月的天数，从0开始
         * @param year 年份
         * @param month 月份
         */
        static getDaysOfMonth(year: number, month: number): number;
        /**
         * 将天置为0，获取其上个月的最后一天
         * @param year
         * @param month
         */
        static getDaysOfMonth2(year: any, month: any): number;
        /**
         * 距离现在几天的日期：
         * @param days 负数表示今天之前的日期，0表示今天，整数表示未来的日期。 如-1表示昨天的日期，0表示今天，2表示后天
         */
        static fromToday(days: any): string;
        /**
         * 计算一个日期是当年的第几天
         * @param date
         */
        static dayOfTheYear(date: any): number;
        /**
         * 获得时区名和值
         * @param dateObj
         */
        static getZoneNameValue(dateObj: any): {
            name: string;
            value: string;
        };
        /**
         * 判断是否是同一天
         * @param date1 毫秒
         * @param date2 毫秒
         * @return
         */
        static isSameDay(date1: number, date2: number): boolean;
        /**
         * 判断传入的时间小于今天
         * @param time
         */
        static notTomorrow(time: any): boolean;
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
        private endHandler;
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
         * @param startObject 开始对象
         * @param endObject 结束对象
         * @param endHandler 结束回调
         */
        playObject(num: number, startObject: fgui.GObject, endObject: fgui.GObject, endHandler: ParamHandler): void;
        /**
         * 播放金币动画
         * @param num 创建数量
         * @param startPoint 开始位置
         * @param endPoint 结束位置
         * @param endHandler 结束回调
         */
        play(num: number, startPoint: Laya.Point, endPoint: Laya.Point, endHandler: ParamHandler): void;
        /************************************  普通金币掉落动画  ***********************************/
        /**
         * 播放移动目标到指定目标位置
         * @param targetObject 要被移动的对象
         * @param endObject 结束对象
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldAni(targetObject: fgui.GObject, endObject: fgui.GObject, endHandler: ParamHandler, parent?: fgui.GComponent, props?: any): void;
        /**
         * 播放移动目标到指定位置
         * @param targetObject 要被移动的对象
         * @param startPoint 起始位置
         * @param endPoint 结束位置
         * @param endHandler 完成回调
         * @param parent 父对象
         * @param props 附带的属性变化 或参数 duration,delay,ease
         */
        playGoldPointAni(targetObject: fgui.GObject, startPoint: Laya.Point, endPoint: Laya.Point, endHandler: ParamHandler, parent?: any, props?: any): void;
        private addChild;
        private globalToLocal;
        private get scene();
        dispose(): void;
    }
    export class HTTPUtils {
        static defaultResponseType: string;
        /** 检查服务器时间间隔 */
        static checkTimer: number;
        /** 差值 */
        static difference: number;
        /**
         * 检查服务器时间 CheckServerTimer
         */
        static serverTimerUrl: string;
        /** 过滤器 */
        static filter: IHttpFilter;
        private readonly ghr;
        /**
         * 请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
         */
        private url;
        /**
         * (default = null)发送的数据。
         */
        private data;
        /**
         * 用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
         * @default null
         */
        private method;
        /**
         * (default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
         */
        private responseType;
        /**
         * (default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
         */
        private headers;
        /** 完成 */
        private complete;
        /** 错误 */
        private error;
        /** 超时 */
        private timeout;
        constructor();
        static create(): HTTPUtils;
        setUrl(url: string): HTTPUtils;
        setData(data: any): HTTPUtils;
        setMethod(data: Method | string): HTTPUtils;
        setResponseType(data: string): HTTPUtils;
        setHeaders(array: string[]): HTTPUtils;
        setOvertime(value: number): HTTPUtils;
        onComplete(handler: ParamHandler): HTTPUtils;
        onError(handler: ParamHandler): HTTPUtils;
        onTimeout(handler: ParamHandler): HTTPUtils;
        /**
         *
         */
        call(): void;
        private timeOutHandler;
        private errorHandler;
        private completeHandler;
        abort(): void;
        getHttp(): GameHttpRequest;
        /** 解析时间 */
        static parseDate(data: any): void;
        static castDifference(serverTime: number): void;
        /** 获取差值 */
        static getDifference(): number;
        /** 当前时间  毫秒 */
        static getTimer(): number;
        /** 当前时间  秒 */
        static getTimerSecond(): number;
        /** 解析json数据格式 */
        static parseJson(data?: any): string;
        /** 开启服务器时间检查 */
        static openCheckServerTimer(value: string): void;
        /** 关闭服务器时间检查 */
        static closeCheckServerTimer(): void;
        private static serverTimerHandler;
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
        /** 关闭游戏
         * @param [type = 0]  0 默认直接退出  1 退出切换到新游戏
         * @param [data = null]
         * */
        static gameClose(type?: number, data?: any): void;
        /** 弹窗 */
        static openModal(value: string): void;
        /** 打开指定的web页面 不关闭游戏的前提下 */
        static openWebPageWithoutLeaveGame(value: string): void;
        /** 进入游戏进度条 */
        static getProgress(value: number): void;
        /** 通知进入游戏了 */
        static gameOnload(): void;
        /**
         * 通知服务器直接离开的房间
         */
        static outGameHttp(): void;
        /**
         * 分析邀请
         * @param type 1 开  2 关
         */
        static shareDetail(type: number): void;
        /** 上传头像 */
        static updateHead(): void;
    }
    export class LanguageUtils {
        private static _instance;
        static get inst(): LanguageUtils;
        /** 语言配置文件 */
        protected xml: XMLDocument;
        /**
         * 自定义需要转换的特殊符号 <br/>
         *
         * @example
         * customConvert = (content:string) => {
         *      return content
         * }
         * <br/>默认 {unit} 会转换成货币单位 Player.inst.getCurrencyUnit
         */
        customConvert: (content: string) => string;
        setXml(xml: XMLDocument): void;
        /**
         * 返回对应的语言
         * @see LibStr
         * @param str key
         */
        getStr(str: number | string): string;
        private __getStr;
    }
    /**
     * 长按、点击按钮绑定
     * @author boge
     *
     */
    export class LongPressBtn {
        /** 按下判定长按的间隔时间 */
        private HOLD_TRIGGER_TIME;
        /** 被绑定的按钮 */
        private btn;
        /** 长按后回调方法 */
        private readonly callback;
        /** 玩家长时间按下 */
        private _isApeHold;
        /** 执行回调方法  附带参数 */
        private readonly args;
        /** 是否单次调用 */
        single: boolean;
        /**
         * 创建一个监听
         * @param btn 绑定按钮
         * @param callback 回调方法
         * @param args 执行回调方法  附带参数
         *
         */
        constructor(btn: fgui.GButton, callback: ParamHandler, ...args: any[]);
        /** 点下按钮 */
        private downHandler;
        /** 松开按钮 */
        private upHandler;
        private onHold;
        private onLoopClick;
        private clickHandler;
        get isApeHold(): boolean;
        dispose(): void;
    }
    /**
     * 数字变动动画
     */
    export class NumberTween {
        static NAME: string;
        private static nums;
        private static _gid;
        private gid;
        private value;
        private target;
        private complete;
        private update;
        /** 当前运行的动画 */
        tween: Laya.Tween;
        /**
         * 创建一个动画
         * @param target 缓动动画绑定类  用于执行清楚动画
         * @param start 开始值
         * @param end 结束值
         * @param duration 执行时长
         * @param ease 执行缓动动画
         * @param complete 执行完成
         * @param update 执行更新
         * @param delay 延迟执行
         */
        static createTween(target: any, start?: number, end?: number, duration?: number, ease?: Function, complete?: ParamHandler, update?: ((value: number) => void) | Laya.Handler, delay?: number): void;
        /**
         * 清理并销毁指定的动画
         * @param target 绑定的执行对象
         */
        static clearTween(target: any): void;
        /**
         * 提前完成动画
         * @param target 要提前完成动画的对象
         */
        static completeTween(target: any): void;
        /**
         * 获取指定对象监听的所有动画
         * @param target 动画对象
         */
        static getTween(target: any): NumberTween[];
        private static getGID;
        private updateHandler;
        private completeHandler;
        /** 直接完成动画 */
        completeTween(): void;
        /**
         * 销毁 并清理动画
         */
        dispose(): void;
        /**
         * 根据动画id删除一个缓动动画
         * @param gid 动画id
         */
        private removeTween;
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
        /**
         * 获取总长度函数
         * @param count 转盘拆分份数
         * @param skew 第一个奖区起始点与0点位置的偏移比例
         * @param Qmin 最少圈数
         * @param Qmax 最多圈数
         * @param location 奖品所在奖区
         * @param offset 指针所停位置离奖区边缘的比例
         * @return
         *
         */
        getRotationLong(count: number, skew: number, Qmin: number, Qmax: number, location: number, offset: number): number;
        private runHandler;
        /** 销毁动画 */
        diapose(): void;
        /** 立即停止到结束为止 */
        stop(): void;
    }
    export class ShowUtils {
        static showSize(spr: Laya.Sprite): void;
    }
    export class SoundUtils {
        /** 需要立即播放的 */
        private static autoPlay;
        /** 加载资源 */
        private static loadAsset;
        private static bgMusicLoop;
        private static bgVolume;
        private static bgComplete;
        private static bgStartTime;
        static addRes(res: LoadRes[]): void;
        static load(url?: string): void;
        private static onLoader;
        /**
         *
         * @param url
         * @param loops
         * @param complete
         * @param volume
         * @param startTime
         * @param coverBefore 如果正在播放指定的音乐  是否覆盖 默认 false
         * @return
         */
        static playMusic(url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number, coverBefore?: boolean): Laya.SoundChannel;
        static playSound(url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number): Laya.SoundChannel;
        static clear(): void;
        static stopSound(url: string): void;
        /**
         * 停止播放所有音效（不包括背景音乐）。
         */
        static stopAllSound(): void;
        /**
         * 停止播放所有声音（包括背景音乐和音效）。
         */
        static stopAll(): void;
        /**
         * 停止播放背景音乐（不包括音效）。
         */
        static stopMusic(): void;
    }
    export class SpineUtils {
        /**
         * 对指定 skeleton 进行设置
         * @param skeleton
         * @param url
         * @param [nameOrIndex = 0] 播放名字或位置
         * @param [loop = true] 循环
         * @param playComplete
         * @param loaderComplete
         * @param [aniMode = -1]
         */
        static playSpine(skeleton: GSkeleton | GSpineSkeleton, url: string, nameOrIndex?: string | number | (string | number)[] | ISkeletonPlay, loop?: boolean, playComplete?: ParamHandler, loaderComplete?: ParamHandler, aniMode?: number): void;
        private static parseComplete;
        /**
         * 创建spine 骨骼动画组件
         * @param url 根据传入的json 或 sk自动创建 GSpineSkeleton、GSkeleton
         * @param optional
         * @param skeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
         */
        static createSpine<T extends new () => GSkeleton | GSpineSkeleton | undefined>(url: string | ISkeletonData, optional?: ISkeletonData | T, skeletonClass?: T): T extends new () => infer R ? R : GSkeleton | GSpineSkeleton;
        /**
         * 判断是否是接口 用_displayObject 是否存在判断
         * @param optional
         */
        static isInterface(optional: any): optional is ISkeletonData;
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
        /** 此错误是后在执行范围内 */
        static execute(code: number, msg?: string): boolean;
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
        constructor();
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
    /**
     * 字符串一些常用方法。
     * @author boge
     *
     */
    export class StringUtil {
        /** 验证是否是有效的html标签 */
        static HTML_TAG_REG: RegExp;
        /** 验证是否是有效的网址 */
        static HTML_URL_REG: RegExp;
        /** 根据大写字母分隔 */
        static UPPERCASE_SPLIT: RegExp;
        static removeTag: RegExp;
        /** 支持字符串格式 ("{0}"). 格式化 */
        static format(format: string, ...args: any[]): string;
        /**
         * 忽略大小字母比较字符是否相等
         * @param char1 字符串一
         * @param char2 字符串二
         * @return
         */
        static equalsIgnoreCase(char1: string, char2: string): boolean;
        /**
         * 是否是数值字符串
         * @param char 指定字符串
         * @return
         */
        static isNumber(char: string): boolean;
        /**
         * 去除所有html 标签形式
         * @param value
         * @return
         *
         */
        static removeHtml(value: string): string;
        /**
         * 是否为合法 Email
         * @param char 指定字符串
         * @return
         */
        static isEmail(char: string): boolean;
        /**
         * 是否是 Double 型数据
         * @param    char    指定字符串
         * @return
         */
        static isDouble(char: string): boolean;
        /**
         * 是否是整数
         * @param    char    指定字符串
         * @return
         */
        static isInteger(char: string): boolean;
        /**
         * 是否是英文字符（包括大小写）
         * @param    char    指定字符串
         * @return
         */
        static isEnglish(char: string): boolean;
        /**
         * 是否是中文
         * @param    char    指定字符串
         * @return
         */
        static isChinese(char: string): boolean;
        /**
         * 万军从中取数字
         * @param char
         * @return
         */
        static getNumbers(char: string): number;
        /**
         * 万军从中取非数字
         * @param char
         * @return
         */
        static getNotNumbers(char: string): string;
        /**
         * 是否是双字节
         * @param    char    指定字符串
         * @return
         */
        static isDoubleChar(char: string): boolean;
        /**
         * 是否是 url 地址
         * @param    char    指定字符串
         * @return
         */
        static isURL(char: string): boolean;
        /**
         * 是否为空
         * @param    char    指定字符串
         * @return
         */
        static isEmpty(char: string): boolean;
        /**
         * 是否不是空
         * @param    char    指定字符串
         * @return
         */
        static isNotEmpty(char: string): boolean;
        /**
         * 是否包含中文
         * @param    char    指定字符串
         * @return
         */
        static hasChineseChar(char: string): boolean;
        /**
         * 检测指定字符串是否匹配指定模式
         * @param    char    指定字符串
         * @param    pattern    指定模式
         * @return
         */
        static checkChar(char: string, pattern: RegExp): boolean;
        /**
         * 比较两个字符串是否相等
         * @param s1 第一个比较字符串。
         * @param s2 第二个比较字符串。
         * @param caseSensitive 是否区分大小写  默认不区分
         * @return
         */
        static stringsAreEqual(s1: string, s2: string, caseSensitive?: boolean): boolean;
        /**
         * 去除首位的空白部分
         * @param input 要被处理的字符串
         * @return
         */
        static trim(input: string): string;
        /**
         * 去除所有的空白部分
         * @param input 要被处理的字符串
         * @return
         *
         */
        static trimAll(input: string | null): string;
        /**
         * 从前面指定的字符串中删除空格。
         * @param input 输入字符串开始的空白将被删除。
         * @return
         *
         */
        static ltrim(input: string): string;
        /**
         *
         * 从指定的字符串的结尾删除空格。
         *
         * @param input 输入字符串结尾的空白将被删除。
         * @return
         *
         */
        static rtrim(input: string): string;
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         */
        static beginsWith(input: string, prefix: string): boolean;
        /**
         * 确定是否按指定字符串开始。
         * @param input 要被处理的字符串
         * @param prefix 字符串的前缀
         */
        static beginsWithAny(input: string, ...prefix: string[]): boolean;
        /**
         * 确定是否按指定字符串结束。
         * @param input 要被处理的字符串
         * @param suffix 字符串的后缀
         */
        static endsWith(input: string, suffix: string): boolean;
        /**
         * 确定是否按指定字符串结束。  只要满足一个就返回 true
         * @param input 要被处理的字符串
         * @param prefix 字符串的后缀
         */
        static endsWithAny(input: string, ...prefix: string[]): boolean;
        /**
         * 删除在输入字符串中删除字符串的所有实例。
         * @param input 要被处理的字符串
         * @param remove 要删除的字符串
         * @return
         */
        static remove(input: string, remove: string): string;
        /**
         * 字符串内容替换
         * @param input 要被处理的字符串
         * @param replace 要被替换掉的字符串
         * @param replaceWith 用来替换的新字符串
         */
        static replace(input: string, replace: string, replaceWith: string): string;
        /**
         * 获取指定符号之后的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         * <br>
         * @example
         * var str = "ssdw/aa"
         * StringUtils.endsCode(str, "/") = aa
         */
        static endsCode(input: string, suffix: string, retain?: boolean, direction?: boolean): string;
        /**
         * 获取指定符号之前的字符串
         * @param input 要处理的字符串
         * @param suffix 要做为依据的最后一个符号
         * @param retain 是否要保留作为依据的符号 (默认不保留)
         * @param direction 是从前开始还是从后开始 (默认从后)
         *
         * @return
         *
         */
        static beginsCode(input: string, suffix: string, retain?: boolean, direction?: boolean): string;
        /**
         * 字符串与对象进行比较。按字典顺序比较两个字符串
         * @param value 源字符串
         * @param anotherString 要比较的字符串
         * @return number 返回值是整型，它是先比较对应字符的大小(ASCII码顺序)，如果第一个字符和参数的第一个字符不等，结束比较，返回他们之间的长度差值，如果第一个字符和参数的第一个字符相等，则以第二个字符和参数的第二个字符做比较，以此类推,直至比较的字符或被比较的字符有一方结束。
         * <br>如果参数字符串等于此字符串，则返回值 0；<br>如果此字符串小于字符串参数，则返回一个小于 0 的值；<br>如果此字符串大于字符串参数，则返回一个大于 0 的值。
         */
        static compareTo(value: string, anotherString: string): number;
        /**
         * 获取资源文件的名字
         * @param url 路径名
         * @param retain 是否去掉尾部标签 默认true
         * @return
         */
        static urlName(url: string, retain?: boolean): string;
        /**
         * 判断此字符串中是否包含
         * @param value
         * @param arge
         * @return
         */
        static contains(value: string, ...arge: any[]): boolean;
        /**
         * 将 Uint8Array 转换成16进制颜色值  至少保证3个值
         * @param value 数据
         * @param defaultColor 默认值  如果不满足要求  直接返回的值 默认#ffffff
         */
        static colorRgb(value: Uint8Array, defaultColor?: string): string;
        /**
         * 转换数据类型
         * @param value 数据
         * @param type 类型
         * @return
         */
        static changeType(value: any, type: string): any;
    }
    /**
     * 文字动画
     */
    export class TextAniUtils {
        /** 默认文本 */
        private _defaultText;
        /** 当前要播放的文本 */
        private _playText;
        /** 显示文本框 */
        private _textField;
        /** 当前动画显示文本 */
        private aniText;
        /** 播放数字动画结束 */
        private _endCallBack;
        /** 保存播放文字动画的位置 */
        private textObj;
        /** 闪烁次数 */
        private twinkleCount;
        /** 是否正在闪烁中*/
        private isTwinkle;
        /** 闪烁执行完成调用 */
        private twinkleCallHandler;
        /** 当前清楚完的数量 */
        private clearCount;
        /** 当前播放结束的数量 */
        private playEndCount;
        /** 要播放的一个数组文字 */
        private playTexts;
        /** 数组文字位置 */
        private playIndex;
        constructor(defaultText: string, textField: fgui.GTextField);
        /**
         * 要播放的一组文字
         * @param tests
         */
        plays(tests: any[]): void;
        /**
         * 播放文字
         * @param playText
         */
        play(playText: string): void;
        /** 直接设置文本 */
        setText(text: string): void;
        private _play;
        private _playClean;
        /**
         * 清理播放的文字
         * @param ani 是否需要动画清理
         */
        clean(ani?: boolean): void;
        /** 清除结束 */
        private cleanTextEndHandler;
        private _playAni;
        /** 显示文字完成 */
        private changeTextEndHandler;
        private changeTextHandler;
        private replacePos;
        /**
         * 播放闪烁
         * @param count 文字闪烁次数
         * @param callback
         */
        playTwinkle(count?: number, callback?: ParamHandler): void;
        private twinkleHandler;
        dispose(): void;
        get playText(): string;
    }
    /**
     * 闪烁动画
     */
    export class TwinkleAniUtils {
        private callback;
        /**
         * 指定对象闪烁
         * @param target 对象
         * @param count 闪烁次数
         * @param callback 完成回调
         */
        play(target: fgui.GObject, count: number, callback: ParamHandler): void;
        private twinkleHandler;
        dispose(): void;
    }
    export class ActivityButton extends BaseButton {
        private tempValue;
        private clickInvalid;
        callback: ParamHandler;
        private contentText;
        /** 当没有优惠卷使用的时候 是否自动隐藏 */
        isAutoHide: boolean;
        /** 自定义更新文字显示 */
        updateText: ParamHandler;
        constructor();
        protected constructFromXML(xml: any): void;
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
        constructor();
        protected constructFromXML(xml: any): void;
        shuffle(func: ParamHandler): void;
        private plusMinus;
        setUrl(url: string): void;
        revert(): void;
        static create(): CardDeck;
    }
    export class GamePopupMenu extends fgui.PopupMenu {
        private target;
        closeHandler: ParamHandler;
        constructor(resourceURL?: string);
        private onUnDisplay;
        show(target?: fgui.GObject, dir?: fgui.PopupDirection | boolean): void;
        addIconItem(caption: string, handler?: Laya.Handler): fairygui.GButton;
        addIconTitleItem(title: string, caption: string, select: string, handler?: Laya.Handler): fairygui.GButton;
        dispose(): void;
    }
    export class GGraphicsAni extends Laya.GraphicsAni {
        boneSlotName: string;
        static create(): GGraphicsAni;
        drawTexture(texture: Laya.Texture | null, x?: number, y?: number, width?: number, height?: number, matrix?: Laya.Matrix | null, alpha?: number, color?: string | null, blendMode?: string | null, uv?: number[]): Laya.DrawTextureCmd | null;
        clear(recoverCmds?: boolean): void;
    }
    export class GLoader3D extends fgui.GObject {
        private _url;
        private _align;
        private _verticalAlign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _playing;
        private _frame;
        private _loop;
        private _animationName;
        private _skinName;
        private _color;
        private _contentItem;
        private _container;
        private _content;
        private _updatingLayout;
        private loadSkeleton;
        /** 是否有描点 */
        isAnchor: boolean;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        get url(): string;
        set url(value: string);
        get icon(): string;
        set icon(value: string);
        get align(): string;
        set align(value: string);
        get verticalAlign(): string;
        set verticalAlign(value: string);
        get fill(): number;
        set fill(value: number);
        get shrinkOnly(): boolean;
        set shrinkOnly(value: boolean);
        get autoSize(): boolean;
        set autoSize(value: boolean);
        get playing(): boolean;
        set playing(value: boolean);
        get frame(): number;
        set frame(value: number);
        get animationName(): string;
        set animationName(value: string);
        get skinName(): string;
        set skinName(value: string);
        get loop(): boolean;
        set loop(value: boolean);
        get color(): string;
        set color(value: string);
        get content(): Laya.Sprite;
        protected loadContent(): void;
        setSkeleton(skeleton: Laya.Skeleton, anchor?: Laya.Point): void;
        private onPlayed;
        private onStopped;
        private onPaused;
        private onLabel;
        /**
         * 播放动画
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         */
        play(nameOrIndex: string | number, loop: boolean): void;
        /**
         * 停止动画
         */
        stop(): void;
        private onChange;
        protected loadExternal(): void;
        private loadEndHandler;
        private updateLayout;
        private clearContent;
        protected handleSizeChanged(): void;
    }
    export class GlobalWaiting extends fgui.GComponent {
        /** 显示内容 */
        private messageText;
        constructor();
        protected constructFromXML(xml: any): void;
        private onInit;
        set text(value: string);
    }
    export class GSkeleton extends BaseSkeleton {
        /**
         * 骨骼更新
         * ````
         * GSkeleton cmd:DrawTextureCmd
         * GSpineSkeleton spine.Slot
         * ````
         */
        static readonly UPDATE_BONE_SLOT = "update_bone_slot";
        /** 是否使用混合模式 */
        isBlendModeAdd: boolean;
        /** 使用混合模式的插槽 */
        blendBoneSlotNames: string[];
        /** 指定的骨骼忽略XY偏移量 */
        readonly clearBoneSlotOffset: string[];
        /** 指定的骨骼忽略X偏移量 */
        readonly clearBoneSlotOffsetX: string[];
        /** 指定的骨骼忽略Y偏移量 */
        readonly clearBoneSlotOffsetY: string[];
        aniMode: number;
        private _loadAniMode;
        /** 自定义缓存的Templet名字 */
        cacheName: string;
        constructor(aniMode?: number);
        protected createDisplayObject(): void;
        get asSkeleton(): Laya.Skeleton;
        /**
         * 通过加载直接创建动画
         * @param    url        要加载的动画文件路径
         * @param    handler    加载完成的回调函数
         * @param    aniMode        与<code>Laya.Skeleton.init</code>的<code>aniMode</code>作用一致
         */
        load(url: string, handler: ParamHandler, aniMode?: number): void;
        /**
         * 加载完成
         */
        private _onLoaded;
        /**
         * 解析完成
         */
        private _parseComplete;
        /**
         * 解析失败
         */
        private _parseFail;
        /**
         * 延迟播放动画
         * @param    playDelay    延迟时间
         * @param    nameOrIndex    动画名字或者索引
         * @param    loop        是否循环播放
         * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
         * @param    start        起始时间
         * @param    end            结束时间
         * @param    freshSkin    是否刷新皮肤数据
         *
         * @deprecated
         */
        playDelay(playDelay: number, nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop: boolean, force?: boolean, start?: number, end?: number, freshSkin?: boolean): void;
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByName(name: string, freshSlotIndex?: boolean): void;
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
         */
        showSkinByIndex(skinIndex: number, freshSlotIndex?: boolean): void;
        getAniIndexByName(name: string): number;
        getAnimation(aniIndex: number): AnimationContent;
        getAnimDuration(aniIndex: number): number;
        getAnimFrame(aniIndex: number): number;
        get currAniIndex(): number;
        /**
         * 根据动作名和插槽骨骼名,来获取该骨骼在该动作播放时,每一帧该骨骼坐标位置,返回所有帧数骨骼坐标位置组成的列表
         * @param nameOrIndex
         * @param boneName
         */
        getBoneCoords(nameOrIndex: string | number, boneName: string): number[];
        getSlotXByName(name: string): number;
        getSlotYByName(name: string): number;
        getSlotPointByName(name: string): Laya.Point;
        getBoneSlotByName(name: string): Laya.BoneSlot;
        private static _emptyTexture;
        static get emptyTexture(): Laya.Texture;
        /**
         * 设置插槽的某个皮肤
         * @param slotName 插槽名字
         * @param skin Laya.Texture 或 fairygui 的路径  如：//package/skin
         */
        setSlotSkin(slotName: string, skin?: Laya.Texture | string): void;
        /**
         * 换装的时候，需要清一下缓冲区
         */
        private clearCache;
        on(type: string, thisObject: any, listener: Function, args?: any[]): void;
        off(type: string, thisObject: any, listener: Function): void;
        offAll(type?: string): void;
        dispose(): void;
    }
    export class GSpineSkeleton extends BaseSkeleton {
        ver: Laya.SpineVersion;
        private spineSkeleton;
        private template;
        constructor(ver?: Laya.SpineVersion);
        protected createDisplayObject(): void;
        get asSkeleton(): Laya.SpineSkeleton;
        /**
         * 获取spine的Skeleton对象
         */
        getSkeletonNative(): spine.Skeleton;
        /**
         * 加载json 或 skel格式的骨骼文件
         * @param jsonOrSkelUrl
         * @param handler 回调方法
         * @param ver
         */
        load(jsonOrSkelUrl: string, handler: ParamHandler, ver?: Laya.SpineVersion): void;
        private onComplete;
        set touchable(value: boolean);
        get touchable(): boolean;
        /**
         * 通过名字显示一套皮肤
         * @param    name    皮肤的名字
         */
        showSkinByName(name: string): void;
        /**
         * 通过索引显示一套皮肤
         * @param    skinIndex    皮肤索引
         */
        showSkinByIndex(skinIndex: number): void;
        getAniIndexByName(aniName: string): number;
        getAnimation(aniIndex: number): spine.Animation;
        getAnimDuration(aniIndex: number): number;
        getAnimFrame(aniIndex: number): number;
        get currAniIndex(): number;
        set hitArea(rec: Laya.Rectangle);
        on(type: string, thisObject: any, listener: Function, args?: any[]): void;
        off(type: string, thisObject: any, listener: Function): void;
        offAll(type?: string): void;
        dispose(): void;
    }
    /** 提示框 */
    export class HomePrompt extends BaseWindow {
        private static _instance;
        static get instance(): HomePrompt;
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
    export class HtmlWindow extends fgui.Window implements IRecord {
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
        constructor();
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
    export class ImageWindow extends BaseWindow {
        private static _instance;
        static get inst(): ImageWindow;
        constructor();
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
        constructor();
        protected onInit(): void;
        /**
         * 显示
         * @param index 显示的形式
         * @param headText 使用头文本
         *
         */
        show(index?: number, headText?: string): void;
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
    /** 消息提示框 */
    export class MessageTip extends fgui.GComponent {
        private static NAME;
        /** 使用中的 */
        private static usePool;
        /** 缓存的内容 */
        private static cacheContent;
        /** 展示时间
         * @default 1800
         */
        static displayTime: number;
        content: fgui.GTextField;
        tween: Laya.Tween;
        /** 缓存的字体大小 */
        tempFontSize: number;
        /** 当前执行的步骤 */
        private steps;
        protected constructFromXML(xml: any): void;
        /**
         * 设置显示文本字体大小
         * @param value 大小
         */
        set fontSize(value: number);
        get fontSize(): number;
        /**
         * 显示文本提示框
         * @see LibStr
         * @param value 内容 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param [duration = 1800ms] 提示内容展示时长
         */
        static showTip(value: string | number | any[], duration?: number): void;
        private static createMsgTip;
        private static createHandler;
        /**
         * 显示弹窗内容
         */
        private showMes;
        /**
         * 向上移动一次的距离
         * @private
         */
        private get moveUpStep();
        private movePoint;
        private showEnd;
        private hideEnd;
        /** 清楚所有提示 */
        static clearAll(): void;
    }
    export class MyGLoader extends fgui.GLoader {
        /**
         * 加载重试次数
         */
        loadRetryCount: number;
        loadCount: number;
        protected loadExternal(): void;
        protected onExternalLoadSuccess(texture: Laya.Texture): void;
        protected loadFromPackage(itemURL: string): void;
        protected onExternalLoadFailed(): void;
    }
    export class NoticeView extends BaseView {
        static NAME: string;
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
    export class NumButton extends BaseButton {
        private component;
        private cornerMarker;
        /** 绑定位置对象 */
        bindObject: any;
        /** 偏移位置 */
        offX: number;
        /** 偏移位置 */
        offY: number;
        private tempValue;
        constructor();
        protected constructFromXML(xml: any): void;
        private stateChangedHandler;
        /** 更新绑定位置 */
        updateBindPoint(): void;
        /**
         * 设置角标
         * @param value 剩余数量
         */
        setCorner(value: number): void;
    }
    export class ProgressBar extends fgui.GProgressBar {
        constructor();
        protected constructFromXML(xml: any): void;
        tweenValue2(value: number, duration: number, complete?: ParamHandler): fgui.GTweener;
        regAction(action: string, caller: any, method: Function, group?: string): void;
        regActionHandler(action: string, handler: Laya.Handler, group?: string): void;
        removeAllAction(...arge: any[]): void;
        removeGroup(group: string): void;
        removeGroupActions(group: string, ...arge: any[]): void;
        removeActionHandler(action: string, method: Function, group?: string): void;
        sendAction(action: string, ...arge: any[]): void;
        sendGroupAction(group: string, action: string, ...arge: any[]): void;
        /** 注册游戏数据 */
        regGameAction(action: string, caller: any, method: Function): void;
        addView(key: string, view: View): boolean;
        removeView(key: string): void;
        getView(key: string): unknown;
        getProxy(name: string): Proxys;
    }
    /** 文案提示 */
    export class PromptTip extends BaseLabel {
        private target;
        private downward;
        constructor();
        protected constructFromXML(xml: any): void;
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
    export class PromptWindow extends BaseWindow {
        private static _instance;
        static get inst(): PromptWindow;
        private content;
        private callback;
        /** 确定取消 */
        private cancelBtn;
        /** 确定 */
        private continueBtn;
        /** 提示框的击中类型 */
        private controller;
        private continueFun;
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
        showTip(msg: string | number | any[], callback?: ParamHandler, isAction?: boolean): void;
        /**
         * 带确认 取消按钮的提示框
         * @param msg 显示提示 参数多个类型:string-直接显示文本 、int-从语言包里面操作文本、array-带替换内容 [int|string, ...string]
         * @param obj 附带设置 (okName:'', cancelName:'')
         * @param callback 取消回调方法
         * @param continueFun 确定回调方法
         * @param isAction 动画显示或关闭
         * @deprecated
         * @see LibStr
         * @see ActionLib.GAME_SHOW_PROMPT_CANCEL_WINDOW
         */
        showCancelTip(msg: string | number | any[], obj?: IPromptData, callback?: ParamHandler, continueFun?: ParamHandler, isAction?: boolean): void;
        protected doShowAnimation(): void;
        dispose(): void;
    }
    /** 提示框 */
    export class RechargeSuccessWindow extends BaseWindow {
        private static _instance;
        static get inst(): RechargeSuccessWindow;
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
        /**
         * 带确认按钮的提示框
         * @param msg
         * @param callback
         * @param isAction
         */
        showTip(msg: string, callback?: ParamHandler, isAction?: boolean): void;
        protected doShowAnimation(): void;
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
        constructor();
        protected constructFromXML(xml: any): void;
        show(name: string, money: number, url: string): void;
        hide(): void;
        dispose(): void;
    }
    /**
     * 上传组件
     * @author boge
     */
    export class Upload {
        private static _instance;
        static get inst(): Upload;
        private _file;
        private target;
        private inputWidth;
        private inputHeight;
        private target2;
        constructor();
        get nativeFile(): any;
        /**
         * 在输入期间，如果 Input 实例的位置改变，调用该方法同步输入框的位置。
         */
        private _syncInputTransform;
        private setScale;
        setSize(w: number, h: number): void;
        setPos(x: number, y: number): void;
        hide(): void;
        show(target: Laya.Sprite, target2: Laya.Sprite): void;
        private blurHandler;
        private focusHandler;
        set focus(value: boolean);
    }
    /** 加载 */
    export class WaitResult extends fgui.GComponent {
        private static _instance;
        static get inst(): WaitResult;
        private img;
        private graph;
        constructor();
        protected constructFromXML(xml: any): void;
        show(): void;
        private showContent;
        hide(): void;
    }
    export {};
}

/**
 * 动态参数 function 或 Laya.Handler
 */
declare type ParamHandler = ((...args) => any) | Laya.Handler

/**
 * 执行 ParamHandler 方法
 * @param func ParamHandler 对象
 * @param args 参数 传入数组会将数组当场一个参数传递
 */
declare function runFun(func: ParamHandler, ...args): any | null

declare module Laya {

// @ts-ignore
    interface Text {

        /** 是否绘制删除线
         * @default false */
        _isDrawRemoveLine: boolean
        /** 是否绘制删除线
         * @default false */
        isDrawRemoveLine: boolean
        /**
         * 是否倾斜
         * @default true */
        removeLineTilt: boolean
        /** 删除线宽度
         * @default 1 */
        removeLineWidth: number
        /** 删除线颜色
         * @default null */
        removeLineColor: string

    }

    interface Stage {
        /**
         * 是否暂停更新所有的Laya.timer._update()
         * @default false
         */
        pauseUpdateTimer?: boolean
    }

    interface CallLater {

        /**
         * 清理对象身上所有的延迟
         * @param    caller 执行域(this)。
         */
        clear(caller: any)

        /**
         * 清理所有的延迟执行
         */
        clearAll()

    }

    interface Timer {

        /** 清空所有的计时器 */
        clearAllTimer()

    }

    interface Skeleton {
        /**
         * 通过动画名称得索引
         * @param name
         */
        getAniIndexByName(name: string): number
    }

}


declare module fgui {

    interface GLoader {

        /**
         * 加载重试次数
         */
        loadRetryCount: number
        loadCount: number

    }

}



declare type AnimationNodeContent = {
    name: string
    parentIndex: number
    parent: AnimationNodeContent
    keyframeWidth: number
    lerpType: number
    interpolationMethod: any[]
    childs: any[]
    keyFrame: Laya.KeyFramesContent[]// = new Vector.<KeyFramesContent>
    playTime: number
    extenData: ArrayBuffer
    dataOffset: number
}

declare type AnimationContent = {
    nodes: AnimationNodeContent[]
    name: string
    /**
     * 播放时长
     */
    playTime: number
    bone3DMap: any
    totalKeyframeDatasLength: number
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
    guide?: string[] | string
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

declare type ISkeletonData = {
    /**
     * 加载url地址
     */
    url?: string
    x?: number
    y?: number
    /** 播放结束调用 */
    playComplete?: ParamHandler
    /** 加载完成调用 */
    loaderComplete?: ParamHandler
    /** 关联对象 */
    relation?: ISKRelation
    /** 播放数据 */
    play?: ISkeletonPlay
    scaleX?: number
    scaleY?: number
    /** xy 公用的缩放值 */
    scale?: number
    /**
     * 动画模式 GSkeleton 专用
     * <table>
     *    <tr><th>模式</th><th>描述</th></tr>
     *    <tr>
     *        <td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存    （内存开销大，计算开销小，支持换装）</td>
     *    </tr>
     *    <tr>
     *        <td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
     * </tr>
     * </table>
     * @default GSkeleton.aniMode
     */
    aniMode?: number
    /**
     * GSpineSkeleton 专用
     * 创建spine版本
     * @default 3.8
     */
    ver?: Laya.SpineVersion
    /**
     * 旋转骨骼动画
     */
    rotation?: number

}

/**
 * skeleton 播放参数
 */
declare type ISkeletonPlay = {
    /**
     * 播放某个动画
     * ```
     * 传入-1表示不自动播放
     * ```
     * @default 0
     */
    nameOrIndex?: string | number | (string | number)[]
    /** 循环播放
     * @default true
     * */
    loop?: boolean
    /**
     * 延迟播放(单位为毫秒)
     * @default 0
     */
    delayPlay?: number
    /**
     * loop 播放延迟(单位为毫秒)
     * @default 0
     */
    delayLoopPlay?: number
    /**
     * 当nameOrIndex是数组并且全局loop为false，此设置才有效
     * @default -1 循环播放动画数组的下标 -1表示不循环
     */
    loopPlayIndex?: number
    /** 加载完成调用
     * @deprecated 只能在ISkeletonData中配置
     * */
    loaderComplete?: ParamHandler
    /**
     *
     * false,如果要播的动画跟上一个相同就不生效
     * true,强制生效
     * @default true
     */
    force?: boolean
    /**
     * 起始时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    start?: number
    /**
     * 结束时间
     * 只有 nameOrIndex 为数字或名字时才有用
     * @default 0
     */
    end?: number
    /**
     * 是否刷新皮肤数据
     * @default true
     */
    freshSkin?: boolean
    /**
     * 播放速率 默认使用Skeleton的速率1
     */
    playbackRate?: number
    /**
     * 是否播放音频
     * @default true
     */
    playAudio?: boolean

}

declare type ISKRelation = {

    /** 上下左右关联对象 */
    target?: fgui.GObject
    /** 左右关联对象 */
    lr?: fgui.GObject
    /** 上下关联对象 */
    ud?: fgui.GObject
    /** 是否使用百分比关联  默认true */
    usePercent?: boolean

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

/**
 * 资源加载数据
 */
declare type LoadRes = {

    /** 加载地址 */
    url: string
    /**
     * 类型字符串
     * @see Laya.Loader.IMAGE
     */
    type?: string
    /** 强制加载 */
    forceLoad?: boolean
    /** 分支 */
    branch?: string

    //------------  Laya 的数据

    size?: number

    priority?: number

    useWorkerLoader?: boolean

    progress?: number

    group?: string

}


