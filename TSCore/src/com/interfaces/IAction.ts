
export interface IAction {

    /**
     * 注册事件
     * @param action 事件名字
     * @param handler 处理事件函数
     * @param group 分组集合
     * @param order 值越大 越后执行 默认 100
     */
    regActionHandler(action: string | number, handler: Laya.Handler, group?: string, order?: number): void

    /**
     * 注册事件
     * @param action 事件名字
     * @param caller 执行域(this)
     * @param method 处理事件函数
     * @param group 分组集合
     * @param order 值越大 越后执行 默认 100
     */
    regAction(action: string | number, caller: any, method: Function, group?: string, order?: number): void

    /**
     * 删除所有分组中的此动作
     * @param args 动作名字
     */
    removeAllAction(...args: string[]): void

    /**
     * 删除一个分组
     * @param group 分组集合
     */
    removeGroup(group: string): void

    /**
     * 删除一个分组的所有动作
     * @param group 分组集合
     * @param args 事件名字 数组
     */
    removeGroupActions(group: string, ...args: string[]): void

    /**
     * 删除事件
     * @param action 事件名字
     * @param method 删除指定的 Function 处理事件
     * @param group 分组集合
     */
    removeActionHandler(action: string | number, method: Function, group?: string): void

    /**
     * 根据方法删除
     * @param groupObj 分组集合
     * @param action 事件名字
     * @param method 执行方法
     */
    removeFunction(groupObj: any, action: string | number, method: Function): void

    /**
     * 删除目标所有事件
     * @param caller 目标
     */
    removeTargetAll(caller: any): void

    /**
     * 删除目标分组所有事件
     * @param groupObj 分组集合
     * @param caller 目标
     */
    removeTarget(groupObj: any, caller: any): void

    /**
     * 向一个分组集合发送事件
     * @param group 分组
     * @param action 事件名字
     * @param args 发送的数据
     */
    sendGroupAction(group: string, action: string | number, ...args): void

    /**
     * 发送事件
     * @param action 事件名字
     * @param args 发送的数据
     */
    sendAction(action: string | number, ...args): void


}