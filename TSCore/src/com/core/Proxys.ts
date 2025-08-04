import {StringBlock} from "../block/StringBlock";
import {ProxyBlock} from "../block/ProxyBlock";
import {ActionEvent} from "../block/ActionEvent";
import {IKey, IProxy} from "../interfaces/ICommon";

export class Proxys extends mixinExt(StringBlock, ProxyBlock, ActionEvent) implements IProxy, IKey {

    /** 独有的名字 */
    protected key: string

    setKey(value: string) {
        this.key = value
    }

    getKey(): string {
        return this.key
    }

    /**
     * 已做以下处理
     * ```
     * ● 删除 addProxy 添加的缓存
     * ● 删除本身注册的通知
     * ```
     */
    dispose() {
        this.removeProxy(this.key)
        this.removeTargetAll(this)
    }

}