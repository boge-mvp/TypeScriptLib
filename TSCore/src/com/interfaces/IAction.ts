
export interface IAction {

    /**
     * 注册事件处理器
     * @param action 事件标识
     * @param handler 事件处理器
     * @param group 分组名称
     * @param order 执行顺序（数值越大执行越晚，默认值：100）
     */
    regActionHandler(action: string | number, handler: Laya.Handler, group?: string, order?: number): void

    /**
     * 注册事件
     * @param action 事件标识
     * @param caller 调用者
     * @param method 事件处理方法
     * @param group 分组名称
     * @param order 执行顺序（数值越大执行越晚，默认值：100）
     */
    regAction(action: string | number, caller: any, method: Function, group?: string, order?: number): void

    /**
     * 移除所有事件分组中的指定事件
     * @param args 要移除的事件标识列表
     */
    removeAllAction(...args: string[]): void

    /**
     * 移除指定分组
     * @param groupKey 分组名称
     */
    removeGroup(groupKey: string): void

    /**
     * 移除分组中的指定事件
     * @param groupKey 分组名称
     * @param args 要移除的事件标识列表
     */
    removeGroupActions(groupKey: string, ...args: string[]): void

    /**
     * 移除事件处理器
     * @param action 事件标识
     * @param method 事件处理方法
     * @param group 分组名称
     */
    removeActionHandler(action: string | number, method: Function, group?: string): void

    /**
     * 从分组中移除指定的函数处理器
     * @param groupObj 分组对象
     * @param action 事件标识
     * @param method 事件处理方法
     */
    removeFunction(groupObj: any, action: string | number, method: Function): void

    /**
     * 移除指定调用者的全部事件处理器
     * @param caller 调用者
     */
    removeTargetAll(caller: any): void

    /**
     * 从分组中移除指定调用者的处理器
     * @param groupObj 分组对象
     * @param caller 调用者
     */
    removeTarget(groupObj: any, caller: any): void

    /**
     * 检查是否存在指定事件
     * @param action 事件标识
     * @returns 是否存在事件
     */
    hasAction(action: string | number): boolean

    /**
     * 向指定分组发送事件
     * @param group 分组名称
     * @param action 事件标识
     * @param args 事件参数
     */
    sendGroupAction(group: string, action: string | number, ...args: any[]): void

    /**
     * 发送事件到所有分组
     * @param action 事件标识
     * @param args 事件参数
     */
    sendAction(action: string | number, ...args: any[]): void


}