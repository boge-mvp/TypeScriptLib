import {Environment, EnvType} from "./kit/ConfigKit";
import {DateUtils} from "./utils/DateUtils";
import Render = Laya.Render;

export enum LogLevel {
    ALL,
    /**
     * 跟踪
     */
    TRACE = 100,
    DEBUG = 200,
    INFO = 300,
    WARN = 400,
    ERROR = 500,
    /**
     * 致命错误
     */
    FATAL = 600,
    OFF = 700
}

/**
 * 定义日志格式
 */
export class Log {

    /**
     * @default LogLevel.ALL
     */
    static level = LogLevel.ALL
    /**
     * 最大保存日志条数
     * @default 1000
     */
    static MAX_HISTORY = 1000
    static history: { level: number, time?: number, data: any[] }[] = []

    static trace(...value: unknown[]) {
        Log.append({level: LogLevel.TRACE, data: value})
        if (Environment.active === EnvType.PROD || Log.level > LogLevel.TRACE) return
        // Log._log(value)
        Laya.Browser.onLayaRuntime ? console.log(...value) : console.trace(...value)
    }

    static debug(...value: unknown[]) {
        Log.append({level: LogLevel.DEBUG, data: value})
        if (Environment.active === EnvType.PROD || Log.level > LogLevel.DEBUG) return
        Laya.Browser.onLayaRuntime ? console.log(...value) : console.debug(...value)
    }

    static info(...value: unknown[]) {
        Log.append({level: LogLevel.INFO, data: value})
        if (Log.level > LogLevel.INFO) return
        console.log(...value)
    }

    static warn(...value: unknown[]) {
        Log.append({level: LogLevel.INFO, data: value})
        if (Log.level > LogLevel.WARN) return
        Laya.Browser.onLayaRuntime ? console.log(...value) : console.warn(...value)
    }

    /**
     * 错误
     * @param value
     */
    static error(...value: unknown[]) {
        Log.append({level: LogLevel.ERROR, data: value})
        if (Log.level > LogLevel.ERROR) return
        Laya.Browser.onLayaRuntime ? console.log(...value) : console.error(...value)
    }

    /**
     * 致命的错误
     * @param value
     */
    static fatal(...value: unknown[]) {
        Log.append({level: LogLevel.FATAL, data: value})
        if (Log.level > LogLevel.FATAL) return
        Laya.Browser.onLayaRuntime ? console.log(...value) : console.error(...value)
    }

    /**
     * @internal
     */
    static log(fmt = "[HH:mm:ss]") {
        const logs = [...Log.history]
        let time: any[]
        for (const value of logs) {
            time = [DateUtils.formatDate(value.time ?? 0, fmt), LogLevel[value.level]]
            console.log.apply(window, time.concat(value.data))
        }
    }

    /**
     * @internal
     */
    private static append(data: { data: any[], time?: number, level: LogLevel }) {
        if (Render.isConchApp) return
        data.time ??= Date.now()
        Log.history.push(data)
        if (Log.history.length > Log.MAX_HISTORY + 500) {
            Log.history.splice(0, 500)
        }
    }

}