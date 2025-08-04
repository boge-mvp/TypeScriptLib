export interface IPlatform {

    /**
     * 调用方法
     * @param    methodName  方法名
     * @param    args     参数
     * @return 返回值 目前只用android能直接返回
     */
    call(methodName: string, ...args): any

    /**
     * 调用方法通过回调接收返回值
     * @param    callback     回调方法 参数为返回值
     * @param    methodName   方法名
     * @param    args     参数
     */
    callWithBack(callback: Function, methodName: string, ...args): void

}