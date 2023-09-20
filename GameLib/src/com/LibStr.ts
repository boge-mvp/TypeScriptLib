export const enum LibStr {

    /** 等待处理 */
    WAITING = 1000,
    /** 进入游戏中 */
    LOADING,
    /** 游戏暂停中 */
    GAME_OFF,
    /** 投注金币大于最大值 */
    ANTE_MAX_MONEY,
    /** 还需XX秒才可以再次发言 */
    SEND_CHAT_TIMER_ERROR,
    /** 网络访问失败，请检查网络 */
    NET_ERROR,
    /** 当前不可投注 */
    CANNOT_BET,
    /** 未登陆，请先登陆 */
    FIRST_LOG,
    /** 中奖结果正在计算中 */
    WINING_RESULTS,
    /** 游戏错误 退出游戏 */
    GAME_ERROR,
    /** 押注失败 */
    BET_FAIL,
    /** 获取游戏开奖超时 */
    GET_GAME_RESULTS_TIME_OUT,
    /** 你离开游戏太久了，将你剔除游戏 */
    SYSTEM_BACK_LOBBY,
    /** demo 游戏币无法提现  提示 */
    PROMPT_GUEST,
    /** 当前版本过低 */
    APP_VERSION_TOO_LOW,
    /** 提示玩家玩真钱场 */
    SHOW_INVITE_REAL_MONEY,
    /** 提示玩家没有满足使用优惠券的需要 */
    REQUIREMENT_STAKE,
    /** 未找到游戏 */
    GAME_NOT_FOUND,
    /** 充值成功提示语 */
    RECHARGE_SUCCESS,
    /** 需要押注的最大钱 */
    NEED_BET_BONUS,
    /** 错误 */
    ERR,
    /** 钱不够了 快充值 */
    RECHARGE,
    /** 余额不足 */
    INSUFFICIENT,
    /** 登录 */
    LOGIN,
    /** 踢出游戏 */
    OUT_GAME,
    /** 提示玩法 */
    TIPS_FOR_PLAYING,
    /** 赢钱数 */
    WON_MONEY,
    /** coins 赢钱数 */
    WON_COINS,
    /** 输钱了 */
    LOST,
    /** 硬币不足 */
    INSUFFICIENT_COINS,
    /** 输入 PIN 继续充值 */
    ENTER_PIN_CONTINUE,
    /** 下载app提示 */
    DOWNLOAD_MSG,
    /** 礼包不可用 */
    GIFT_NOT_AVAILABLE,
    /** 提供可用礼包 */
    CASH_GIFTS_AVAILABLE,
    /** 退出app */
    EXIT_APP,
    /** 存款玩游戏 */
    DEPOSIT_PLAY,
    /** 登录玩游戏 */
    LOGIN_PLAY,
    /** 当前投注额 */
    CURRENT_BET_AMOUNT,
    /** gift投注提示 */
    GIFT_BET_TIP,
    /** 中奖通告 */
    WIN_NOTICE,
    /** 当前没有可用gift */
    NOT_GIFT,
    /** 正在使用的劵 */
    USE_IN_GIFT,
    /** gift消费提示 */
    DEDUCT_TIP,
    /** gift拒绝消费提示 */
    DEDUCT_REFUSE_TIP,
    /** 赌注限制 */
    STAKES_RESTRICT,
    /** 赌注需求 */
    STAKES_NEEDS,
    /** 获得更多礼包 */
    GET_MORE_GIFT,
    HOW_TO_PLAY,
    /** 点击按钮 */
    PRESS_BET_BUTTONS,
    GIFT_HELP,
    FREE_SPIN,
    WILD_RESPIN,
    /** bonus 游戏 */
    BONUS_GAME,
    /** 总赢 */
    TOTAL_WIN,
    /** 需要支付 */
    ABOUT_TO_PAY,
    /** 欢迎提示 */
    WELCOME_TO_GAME,
    /** 赢的线 */
    WON_LINE,
    /** 自动spin */
    AUTO_SPINS,
    /** 充值 */
    DEPOSIT,
    /** 提示切换余额会导致倍数归零 */
    CHANGE_BET_PROMPT,
    /** 再来一次 */
    TRY_AGAIN,
    /** 货币单位 */
    UNIT,
    /** 金币单位 */
    COINS,
    /** stop */
    STOP,
    /** Confirm Use */
    CONFIRM_USE,
    /** 继续 */
    CONTINUE,
    /** OK */
    OK,
    /** 取消 */
    CANCEL,
    /** 重发 */
    RESEND,
    /** 赢钱展示 */
    WINS,

}

