import {ActionEvent, ProxyBlock, StringBlock} from "../block/Block"
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

    dispose() {
        this.removeProxy(this.key)
        this.removeTargetAll(this)
    }

}