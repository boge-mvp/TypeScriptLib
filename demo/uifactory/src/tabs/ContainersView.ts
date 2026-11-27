import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GList = fgui.GList;
import GTree = fgui.GTree;
import GTreeNode = fgui.GTreeNode;
import GTextField = fgui.GTextField;
import UIFactory = tsCore.UIFactory;

/**
 * Tab 4 · 复合导航与容器控制器 (PureList / PureTree / ScrollPane + GScrollBar)
 */
export class ContainersView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        // 4.1 500 项虚拟列表
        const list = this.getChild("demoVirtualList") as GList;
        const listStatus = this.getChild("listStatusText") as GTextField;
        if (list) {
            list.itemRenderer = Laya.Handler.create(this, (index: number, item: GComponent) => {
                const icon = item.getChild("icon");
                const title = item.getChild("title");
                const badge = item.getChild("badge");
                const symIdx = (index % 8) + 1;
                if (icon) icon.icon = UIFactory.formatResUrl(`res/symbols/item_${symIdx}.png`);
                if (title) title.text = `虚拟节点资产 #${index + 1}`;
                if (badge) badge.text = `#${String(index + 1).padStart(3, "0")}`;
            }, undefined, false);
            list.setVirtual();
            list.numItems = 40;
            list.on(fgui.Events.CLICK_ITEM, this, (item: GComponent) => {
                const title = item.getChild("title");
                if (listStatus && title) {
                    listStatus.text = `选中列表项：${title.text}`;
                }
            });
        }

        // 4.2 PureTree 节点点击回显
        const tree = this.getChild("demoTree") as GTree;
        const treeStatus = this.getChild("treeStatusText") as GTextField;
        if (tree && treeStatus) {
            tree.on(fgui.Events.CLICK_ITEM, this, (item: GComponent) => {
                const node: GTreeNode | undefined = item.treeNode;
                if (node) {
                    const label = (node.data && node.data.text) ? node.data.text : item.text;
                    treeStatus.text = `选中树节点：${label} (${node.isFolder ? (node.expanded ? "已展开" : "已折叠") : "叶子节点"})`;
                }
            });
        }

        // 4.3 独立 ScrollPane + 滚动条显示规则测试 (支持 JSON 重构切换 display/floating/left)
        let viewport = this.getChild("scrollViewport") as Nullable<GList>;
        const scrollStatus = this.getChild("scrollStatusText") as Nullable<GTextField>;
        const btnSbDisplay = this.getChild("btnSbDisplay") as Nullable<GButton>;
        const btnSbFloating = this.getChild("btnSbFloating") as Nullable<GButton>;
        const btnSbLeft = this.getChild("btnSbLeft") as Nullable<GButton>;

        const sbModes: Array<"visible" | "auto" | "hidden"> = ["visible", "auto", "hidden"];
        let sbModeIdx = 0;
        let sbFloating = false;
        let sbLeft = false;

        const populateViewport = (vp: GList) => {
            vp.itemRenderer = Laya.Handler.create(this, (index: number, item: fgui.GObject) => {
                const comp = item as GComponent;
                const rowTitle = comp.getChild("rowTitle") as Nullable<GTextField>;
                const rowBadge = comp.getChild("rowBadge") as Nullable<GTextField>;
                if (rowTitle) {
                    rowTitle.text = `官方 GList 视口行 #${index + 1} (autoResizeItem)`;
                }
                if (rowBadge) {
                    rowBadge.text = `#${String(index + 1).padStart(2, "0")}`;
                }
            }, undefined, false);
            vp.numItems = 20;
        };

        const syncScrollStatus = () => {
            if (!viewport || !scrollStatus) return;
            const pane = viewport.scrollPane;
            const pct = pane ? Math.round(pane.percY * 100) : 0;
            const vw = pane ? Math.round(pane.viewWidth) : Math.round(viewport.width);
            scrollStatus.text = `进度:${pct}% | viewW:${vw} | ${sbModes[sbModeIdx]} | float=${sbFloating} | left=${sbLeft}`;
        };

        const bindViewportScroll = (vp: GList) => {
            if (vp.scrollPane) {
                vp.on(fgui.Events.SCROLL, this, syncScrollStatus);
            }
        };

        const rebuildViewport = () => {
            const pageConf = UIFactory.getConfig("res/layout/containersPanel.json") as Nullable<tsCore.IPanelConfig>;
            const baseConf = pageConf?.elements?.find((e) => e.name === "scrollViewport") as Nullable<tsCore.IListConfig>;
            if (!viewport || !baseConf) return;
            const childIdx = this.getChildIndex(viewport);
            const clonedConf: tsCore.IListConfig = JSON.parse(JSON.stringify(baseConf));
            clonedConf.scrollBarDisplay = sbModes[sbModeIdx];
            clonedConf.scrollBarFloating = sbFloating;
            clonedConf.scrollBarDisplayOnLeft = sbLeft;
            viewport.dispose();
            const rebuilt = UIFactory.createList(clonedConf);
            rebuilt.setXY(clonedConf.x ?? 0, clonedConf.y ?? 0);
            this.addChildAt(rebuilt, childIdx);
            viewport = rebuilt;
            populateViewport(viewport);
            bindViewportScroll(viewport);
            syncScrollStatus();
        };

        if (viewport) {
            populateViewport(viewport);
            bindViewportScroll(viewport);
            syncScrollStatus();

            btnSbDisplay?.onClick(this, () => {
                sbModeIdx = (sbModeIdx + 1) % sbModes.length;
                btnSbDisplay.title = `显示: ${sbModes[sbModeIdx]}`;
                rebuildViewport();
            });
            btnSbFloating?.on(fgui.Events.STATE_CHANGED, this, () => {
                sbFloating = btnSbFloating.selected;
                rebuildViewport();
            });
            btnSbLeft?.on(fgui.Events.STATE_CHANGED, this, () => {
                sbLeft = btnSbLeft.selected;
                rebuildViewport();
            });
        }
    }
}
