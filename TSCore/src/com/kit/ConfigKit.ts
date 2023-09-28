import {ELoader} from "../core/ELoader";
import Utils = Laya.Utils;
import Render = Laya.Render;
import {StringUtil} from "../utils/StringUtil";
import {Log} from "../Log";

export enum EnvType { PROD, DEV, TEST}

/**
 * 配置工具
 */
export class ConfigKit {

    /**
     * 从 window 中获取指定的对象
     */
    static get<T>(key: string): T | null {
        return window[key]
    }

    /**
     * 将自动检测当前环境是否支持webp图片
     *
     * 如果网址携带参数webp将会强制使用webp图片
     */
    static useWebp() {
        let isWebp = false
        if (!Render.isConchApp && window.location.protocol != "http:") {
            isWebp = window.document.createElement('canvas')?.toDataURL('image/webp')?.indexOf('data:image/webp') == 0
        }
        if (isWebp || Utils.getQueryString("webp")) {
            ELoader.isWebp = true
            Log.info("Support webp")
        }
        return isWebp
    }

    /**
     * 运行环境检测
     * @param url 检测地址
     * @param [isPathName=true] 是否检测路径
     */
    static env(url?: string, isPathName = true) {
        let value = Utils.getQueryString("env")
        if (StringUtil.isNotEmpty(value)) {
            const valueEnv = Environment.findEnv(value)
            if (valueEnv) {
                Environment.active = valueEnv
                return valueEnv
            }
        }
        let checkUrl = url ?? window.location.host
        Environment.active = Environment.DEFAULT_ENV
        if(!ConfigKit._check(checkUrl) && !url && isPathName) {
            ConfigKit._check(window.location.pathname)
        }
        return Environment.active
    }

    /**
     * 检测
     * @param url
     */
    private static _check(url:string) {
        if (Environment.verify(url, Environment.TEST)) {
            Environment.active = EnvType.TEST
            return true
        } else if (Environment.verify(url, Environment.DEV)) {
            Environment.active = EnvType.DEV
            return true
        } else if (Environment.verify(url, Environment.PROP)) {
            Environment.active = EnvType.PROD
            return true
        }
        return false
    }

}


export class Environment {

    static TEST = ["test", "debug", "localhost"]
    static DEV = ["dev", "staging"]
    static PROP = ["prod", "production", "release"]
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
     * 默认使用 window.location.host 判断环境
     * @default EnvType.PROD
     */
    static active = Environment.DEFAULT_ENV

    /**
     * 验证环境
     * @param url url window.location.host
     * @param value 判断条件
     */
    static verify(url: string, value: string[]) {
        if (StringUtil.isEmpty(url) || value?.length < 1) return false
        // 后行断言在旧版本的 JavaScript 以及某些浏览器和环境中是不支持的，因此使用非捕获组更具有兼容性。
        return new RegExp(`\\b(${value.join("|")})\\b`).test(url)
        // return new RegExp("(?<=\\/|-|(\\.))" + value.join("|") + "(?=(\\.)|-)").test(url)
    }

    /**
     * 查询指定的环境是否存在
     * @param value test, debug, localhost, dev, staging, prod, production, release
     */
    static findEnv(value: string) {
        if (Environment.TEST.indexOf(value) != -1) return EnvType.TEST
        if (Environment.DEV.indexOf(value) != -1) return EnvType.DEV
        return Environment.PROP.indexOf(value) != -1 ? EnvType.PROD : null

    }
}
