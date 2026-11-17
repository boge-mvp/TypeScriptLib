import GComponent = fgui.GComponent;

/**
 * 纯代码列表项的对象池
 *
 * fgui 原生 GObjectPool 按 resourceURL 分桶缓存；纯代码构造的 GComponent
 * 无 resourceURL（归还被丢弃、取件必为 null），故子类化覆写：
 * 统一单桶缓存，取件空桶时新建、归还得回桶内复用（不 dispose）。
 * 池长度由虚拟列表可视窗口天然限定（约 3~4 个），无需上限。
 */
class PureCodeItemPool extends fgui.GObjectPool {

    private _items: fgui.GObject[] = [];

    /**
     * 从单桶对象池获取可用实例，若空则新建 GComponent
     *
     * @param url 兼容官方参数（纯代码无需传）
     * @returns 实例化的 GComponent 显示对象
     */
    override getObject(url?: string): fgui.GObject {
        return this._items.pop() ?? new GComponent();
    }

    /**
     * 将用完的列表项回收回桶内（不执行物理 dispose，供下次高速复用）
     *
     * @param obj 回收的显示对象
     */
    override returnObject(obj: fgui.GObject): void {
        this._items.push(obj);
    }

    /**
     * 彻底清空并销毁对象池中的全部缓存实例
     */
    override clear(): void {
        this._items.forEach(o => o.dispose());
        this._items.length = 0;
    }
}

/**
 * 纯代码列表（非 GList 扩展语义：替换 _pool 供给机制的手写实现）
 *
 * 核心机制：
 * 替换列表私有 _pool 为 PureCodeItemPool：不依赖 fgui 资源包 URL，
 * 由外部 itemRenderer 负责填充内容。虚拟/循环模式（setVirtualAndLoop）
 * 的刷新路径（handleScroll1/returnToPool）直接访问 _pool 字段，
 * 替换字段本体后非虚拟（getFromPool 走 _pool）与虚拟两条路径统一生效。
 * 注意：非 E 前缀命名 —— E 前缀在本体系中保留给对原生类的扩展（EView/EButton 等）。
 */
export class PureList extends fgui.GList {

    /**
     * 构造纯代码列表，自动替换内部 _pool 为纯代码专用的单桶对象池
     */
    constructor() {
        super();
        this["_pool"] = new PureCodeItemPool();
    }

}
