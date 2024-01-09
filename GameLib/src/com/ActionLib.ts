export enum ActionLib {

    // 初始化设备数据
    INIT_DEVICE_DATA = "init_device_data",
    // 检查登录状态
    CHECK_LOGIN_STATE = "check_login_state",

    // 开始加载主资源
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


    // 游戏公用事件
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
    GAME_UPDATE_AUTO_BET_NUMBER = GAME_UPDATE_AUTO_SPIN_NUMBER,
    /**
     * 游戏更新免费次数
     * @deprecated
     * @see GAME_UPDATE_AUTO_SPIN_NUMBER
     */
    GAME_UPDATE_FREE_COUNT = GAME_UPDATE_AUTO_SPIN_NUMBER,
    /** 播放收金币动画 */
    GAME_PLAY_COLLECT_GOLD_COINS_ANI = "game_play_collect_gold_coins_ani",
    /** 显示结算UI */
    GAME_SHOW_SETTLE_WIN_UI = "game_show_settle_win_ui",
    /** 显示默认提示语 */
    GAME_SHOW_DEFAULT_TIP = "game_show_default_tip",
    /** 执行播放背景音乐 */
    GAME_PLAY_BG_MUSIC = "game_play_bg_music",
    /** 更新总投注 */
    GAME_UPDATE_TOTAL_BET = "game_update_total_bet",
    /** 更新bounds信息 */
    GAME_UPDATE_BOUNDS_INFO = "game_update_bounds_info",


    // FREE SPIN 都是在scene startGame中启动 以及显示中奖弹窗
    /**
     * 在 scene.startGame 中修改isFreeModel后的 请求第一次free spin
     */
    GAME_FREE_SPIN_START = "game_free_spin_start",
    /**
     * free 结束通知显示结束  开启结算弹窗
     */
    GAME_FREE_SPIN_END = "game_free_spin_end",
    /**
     * free spin继续未完成流程
     */
    SHOW_FREE_SPIN_GO_ON = "show_free_spin_go_on",
    /** 显示获得free奖励窗口 */
    GAME_SHOW_FREE_WINDOW = "game_show_free_window",
    /** 隐藏获得free奖励窗口 */
    GAME_HIDE_FREE_WINDOW = "game_hide_free_window",
    /** 显示结算free窗口 */
    GAME_SHOW_FREE_OUT_WINDOW = "game_show_free_out_window",
    /** 隐藏结算free窗口 */
    GAME_HIDE_FREE_OUT_WINDOW = "game_hide_free_out_window",
    /** 显示freeUI
     * @deprecated
     * @see GAME_FREE_SPIN_START
     * */
    GAME_SHOW_FREE_UI = "game_show_free_ui",
    /** 隐藏freeUI
     * @deprecated
     * @see GAME_FREE_SPIN_END
     * */
    GAME_HIDE_FREE_UI = "game_hide_free_ui",
    /**
     * 显示free 结束界面
     * @deprecated
     * @see GAME_SHOW_FREE_OUT_WINDOW
     */
    GAME_SHOW_FREE_FINISH_VIEW = "game_show_free_finish_view",



}
