import {MyLoader} from "./core/MyLoader";
import Utils = Laya.Utils;
import Render = Laya.Render;
import {StringUtil} from "./utils/StringUtil";
import {Log} from "./Log";

export enum EnvType { PROD, DEV, TEST}

/**
 * 配置工具
 */
export class ConfigKit {

    /**
     * 将自动检测当前环境是否支持webp图片
     *
     * 如果网址携带参数webp将会强制使用webp图片
     */
    static useWebp() {
        let isWebp = false
        if (!Render.isConchApp && window.location.protocol != "http:") {
            isWebp = window.document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0
        }
        if (isWebp || Utils.getQueryString("webp")) {
            MyLoader.isWebp = true
            Log.info("Support webp")
        }
        return isWebp
    }

    /**
     * 运行环境检测
     */
    static env(url?: string) {
        url ??= window.location.host
        Environment.active = Environment.DEFAULT_ENV
        if (Environment.verify(url, Environment.TEST)) {
            Environment.active = EnvType.TEST
        } else if (Environment.verify(url, Environment.DEV)) {
            Environment.active = EnvType.DEV
        } else if (Environment.verify(url, Environment.PROP)) {
            Environment.active = EnvType.PROD
        }
        return Environment.active
    }

}


export class Environment {

    static TEST = "test|debug"
    static DEV = "dev|staging"
    static PROP = "prod|production|release"
    /**
     * 默认环境
     * @default EnvType.PROD
     */
    static DEFAULT_ENV = EnvType.PROD

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
    static active = Environment.DEFAULT_ENV

    /**
     * 验证环境
     * @param url url window.location.host
     * @param value 判断条件
     */
    static verify(url: string, value: string) {
        if (StringUtil.isEmpty(url) || StringUtil.isEmpty(value)) return false
        return new RegExp("(?<=\\/|-|(\\.))" + value + "(?=(\\.)|-)").test(url)
    }


}
