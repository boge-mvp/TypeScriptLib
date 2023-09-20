export interface IMarket {

    /**
     * 登录
     * @param    jsonParm
     * @param    callback
     */
    login(jsonParm: string, callback: Function): void

    /**
     * 登出
     * @param    jsonParm
     * @param    callback
     */
    logout(jsonParm: string, callback: Function): void

    /**
     * 授权
     * @param    jsonParm
     * @param    callback
     */
    authorize(jsonParm: string, callback: Function): void

    /**
     * 进入论坛
     * @param    jsonParm
     * @param    callback
     */
    enterBBS(jsonParm: string, callback: Function): void

    /**
     * 刷新票据
     * @param    jsonParm
     * @param    callback
     */
    refreshToken(jsonParm: string, callback: Function): void

    /**
     * 支付
     * @param    jsonParm
     * @param    callback
     */
    recharge(jsonParm: string, callback: Function): void

    /**
     * 分享
     * @param    jsonParm
     * @param    callback
     */
    enterShareAndFeed(jsonParm: string, callback: Function): void

    /**
     * 邀请
     * @param    jsonParm
     * @param    callback
     */
    enterInvite(jsonParm: string, callback: Function): void

    /**
     * 获取游戏好友
     * @param    jsonParm
     * @param    callback
     */
    getGameFriends(jsonParm: string, callback: Function): void

    /**
     * 发送到桌面
     * @param    jsonParm
     * @param    callback
     */
    sendToDesktop(jsonParm: string, callback: Function): void

    /**
     * 发送自定义消息
     * @param    jsonParm
     * @param    callback
     */
    sendMessageToPlatform(jsonParm: string, callback: Function): void

    /**
     * 获取用户信息
     * @param    jsonParm
     * @param    callback
     */
    getUserInfo(jsonParm: string, callback: Function): void

    /**
     * 返回Market名称
     */
    getMarketName(): string

    /**
     * 返回支付类型 自定义
     */
    getPayType(): number

    /**
     * 返回登录类型 自定义
     */
    getLoginType(): number

    /**
     *
     */
    getChargeType(): number

}