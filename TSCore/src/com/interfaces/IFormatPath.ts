export interface IFormatPath {

    /**
     * 格式化路径
     * @param url 格式化后的路径
     */
    path?(url: string): string

    /**
     * 调用自定义的方法
     * @param url 原始请求地址
     * @param version 从版本控制中获取的版本号 可能为空
     * @return 返回处理后的版本号
     */
    version?(url: string, version: string | number): string | number

    /**
     * 调用自定义的方法
     * @param url 原始请求地址
     * @param version 从版本控制中获取的版本号 可能为空
     * @return 返回处理后的版本号
     * @deprecated
     * @see IFormatPath.version
     */
    call?(url: string, version: string | number): string | number

    /** 值越大 越后执行 默认:100 */
    order?: number

}
