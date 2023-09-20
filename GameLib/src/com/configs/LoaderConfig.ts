import ELoader = tsCore.ELoader;


/** 加载资源配置 */
export class LoaderConfig {

    /**
     * 清理资源
     * @param res 要清理的资源数组
     */
    static clear(res: LoadRes[]) {
        for (let i = 0; i < res.length; i++) {
            ELoader.loader.clearRes(res[i].url)
        }
    }

}

