export interface IHomeServlet {

    /**
     *
     * @param url
     * @param data
     * @param callback
     * @param error
     */
    post(url: string, data: any, callback?: ParamHandler, error?: ParamHandler): void

    /**
     *
     * @param url
     * @param callback
     * @param error
     */
    netGet(url: string, callback?: ParamHandler, error?: ParamHandler): void

}