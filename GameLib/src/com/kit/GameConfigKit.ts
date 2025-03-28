import {Player} from "../Player"
import ConfigKit = tsCore.ConfigKit;
import StringUtil = tsCore.StringUtil;

export class GameConfigKit {

    /**
     * 在window上配置的属性名字
     * @default gameIdConfig
     */
    static CONFIG_NAME = "gameIdConfig"
    /**
     * 场景初始化完成 自动通知加载完成并关闭加载页
     * @type {boolean}
     * @default true
     */
    static autoSendOnLoadEnd = true

    /**
     * 获取游戏配置表
     */
    static gameConfig(): { [key: number]: string } {
        return ConfigKit.get(GameConfigKit.CONFIG_NAME)
    }

    /**
     * 根据游戏id获取配置的游戏名 如果没有 null
     * @param [code=0] 不传将使用当前已经打开游戏id
     */
    static gameName(code: number = null) {
        code ??= Player.inst.gameId
        if (code <= 0) return null
        const config = GameConfigKit.gameConfig()
        return config ? config[code] : null
    }

    /**
     * 获取游戏名字的标准样式
     * @param [code=null] 游戏id 不填将使用当前已在用得到游戏id
     * @param [format=null] 格式化样式，将空白替换成指定的值 不设置将用驼峰命名
     */
    static gameNameCanonical(code: number = null, format: string = null) {
        let name = GameConfigKit.gameName(code)
        if (name) {
            if (format != null) {
                name = name.replace(/\s+/g, format)
            } else {
                const names = name.split(/\s+/g)
                if (names.length > 1) {
                    name = ""
                    for (const name1 of names) {
                        name += name1.charAt(0).toUpperCase() + name1.substring(1).toLowerCase()
                    }
                }
            }
        }
        return name ? name : null
    }

    /**
     * 根据游戏名获取游戏id 如果不存在返回-1
     * @param [name=null]
     */
    static gameCode(name: string = null) {
        name ??= Player.inst.gameName
        name ??= GameConfigKit.gameNameCanonical()
        const config = GameConfigKit.gameConfig()
        if (name && config) {
            for (const key in config) {
                if (StringUtil.trimAll(config[key]) == name) {
                    return parseInt(key)
                }
            }
        }
        return -1
    }

    /**
     * 获取游戏配置数据
     * @param [name=null] 游戏名字,如果不传，将获取当前打开游戏名字
     * @param [ignoreCase=false] 是否忽略名字大小写
     */
    static gameRes(name: string = null, ignoreCase: boolean = false): ResConfig {
        name ??= Player.inst.gameName
        name ??= GameConfigKit.gameNameCanonical()
        // @ts-ignore
        const table: { [key: string]: ResConfig } = window.ConfigureTable
        if (table) {
            const eqName = ignoreCase ? name.toLowerCase() : name
            for (const tableKey in table) {
                const findName = ignoreCase ? tableKey.toLowerCase() : tableKey
                if (findName == eqName) {
                    return table[tableKey]
                }
            }
        }
        return name ? ignoreCase ? window[name] : window[name] : null
    }

}