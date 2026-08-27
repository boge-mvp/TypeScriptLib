import GComponent = fgui.GComponent;

/**
 * 纯代码列表项供给的 GList 扩展
 *
 * 覆写列表对象池的取件逻辑：不依赖 fgui 资源包 URL，直接返回纯代码构造的
 * 空组件，由外部 itemRenderer 负责填充内容。配合 numItems 使用时，列表项
 * 全部走纯代码创建。
 */
export class EList extends fgui.GList {

    override getFromPool(url?: string): fgui.GObject {
        return new GComponent();
    }
}
