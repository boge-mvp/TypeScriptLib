import GComponent = fgui.GComponent;
import { UIFactory } from "./UIFactory";

/**
 * 纯代码列表项的对象池
 *
 * fgui 原生 GObjectPool 按 resourceURL 分桶缓存；纯代码构造的 GComponent
 * 无 resourceURL（归还被丢弃、取件必为 null），故子类化覆写：
 * - 若传入 url 且在 UIFactory 配置注册表中命中模板，则按 url 分桶缓存并调用 UIFactory.createFromConfig(url) 实例化；
 * - 若未传入 url 或未命中模板，则统一使用默认单桶缓存，取件空桶时新建 GComponent、归还得回桶内复用（不 dispose）。
 */
export class PureCodeItemPool extends fgui.GObjectPool {

    private _items: fgui.GObject[] = [];
    private _urlBuckets: Record<string, fgui.GObject[]> = {};

    /**
     * 从对象池获取可用实例，命中 UIFactory 模板时自动按模板实例化
     *
     * @param url 模板路径或注册标识（纯代码无模板列表可不传）
     * @returns 实例化的 GObject 显示对象
     */
    override getObject(url?: string): fgui.GObject {
        if (url && UIFactory.getConfig(url)) {
            const bucket = this._urlBuckets[url];
            if (bucket && bucket.length > 0) {
                return bucket.pop()!;
            }
            const created = UIFactory.createFromConfig(url);
            if (created) {
                created["_purePoolUrl"] = url;
                return created;
            }
        }
        return this._items.pop() ?? new GComponent();
    }

    /**
     * 将用完的列表项回收回桶内（不执行物理 dispose，供下次高速复用）
     *
     * @param obj 回收的显示对象
     */
    override returnObject(obj: fgui.GObject): void {
        const poolUrl = obj["_purePoolUrl"] as string | undefined;
        if (poolUrl) {
            if (!this._urlBuckets[poolUrl]) {
                this._urlBuckets[poolUrl] = [];
            }
            this._urlBuckets[poolUrl].push(obj);
            return;
        }
        this._items.push(obj);
    }

    /**
     * 彻底清空并销毁对象池中的全部缓存实例
     */
    override clear(): void {
        this._items.forEach(o => o.dispose());
        this._items.length = 0;
        for (const key of Object.keys(this._urlBuckets)) {
            this._urlBuckets[key].forEach(o => o.dispose());
        }
        this._urlBuckets = {};
    }
}

/**
 * 纯代码列表（非 GList 扩展语义：替换 _pool 供给机制的手写实现）
 *
 * 核心机制：
 * 替换列表私有 _pool 为 PureCodeItemPool：不依赖 fgui 资源包 URL，
 * 由外部 itemRenderer 负责填充内容或通过 defaultItem 自动实例化 JSON 模板。
 */
export class PureList extends fgui.GList {

    /**
     * 构造纯代码列表，自动替换内部 _pool 为纯代码专用的对象池
     */
    constructor() {
        super();
        this["_pool"] = new PureCodeItemPool();
    }

}

/**
 * 纯代码树形视图（替换 _pool 为 PureCodeItemPool，支持纯 JSON 模板实例化树节点）
 */
export class PureTree extends fgui.GTree {

    /**
     * 构造纯代码树形视图，自动替换内部 _pool 为支持 JSON 模板的对象池
     */
    constructor() {
        super();
        this["_pool"] = new PureCodeItemPool();
    }

}
