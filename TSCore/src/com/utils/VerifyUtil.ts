import LocalStorage = Laya.LocalStorage;
import {DateUtils} from "./DateUtils";

export class VerifyUtil {

    /**
     * 验证指定的键今日已经使用过
     * @param key 键
     * @param callback 自定义在未使用的情况下调用的方法.如果此值为null,那么将不会自动更改使用状态
     * @return boolean 返回指定键在检查前是否已经被使用
     */
    static verifyData(key: string, callback?: () => boolean) {
        const value = LocalStorage.getJSON(key)
        let time = Date.now()
        if (!value || !DateUtils.isSameDay(value, time)) {
            callback?.call(null) && LocalStorage.setJSON(key, time)
            return false
        }
        return true
    }

}