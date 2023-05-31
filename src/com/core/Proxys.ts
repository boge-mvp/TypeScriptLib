import {ActionEvent, Factory} from "../Factory"
import {IKey, IProxy} from "../interfaces/ICommon";

export class Proxys extends ActionEvent implements IProxy, IKey {

    /** 独有的名字 */
    protected key: string

    addProxy<T extends IProxy & IKey>(key: string | { new(): T }, proxy: T): boolean {
        return Factory.inst.addProxy(key, proxy)
    }

    getProxy<T>(key: string | { new(): T }): T {
        return Factory.inst.getProxy(key)
    }

    removeProxy<T extends IProxy & IKey>(key: string | T) {
        Factory.inst.removeProxy(key)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

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