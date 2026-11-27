import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GList = fgui.GList;

/**
 * 主界面工作台根组件 (MainView)
 *
 * 对应布局文件: res/layout/mainView.json
 * 100% 对齐官方 fgui.UIObjectFactory.setExtension 扩展类机制：
 * 继承自 fgui.GComponent，在 onConstruct 生命周期钩子中完成初始化，自包含自闭环。
 */
export class MainView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        const tabCtrl = this.getController("tabCtrl");
        const header = this.getChild("header") as Nullable<GComponent>;
        const tabList = this.getChild("tabList") as Nullable<GList>;
        const totalTabs = 9;

        if (tabCtrl && tabList) {
            const tabButtons: Nullable<GButton>[] = [];
            for (let i = 0; i < totalTabs; i++) {
                const btn = tabList.getChild(`tabBtn_${i}`) as Nullable<GButton>;
                tabButtons.push(btn);
                if (btn) {
                    btn.relatedController = tabCtrl;
                    btn.relatedPageId = String(i);
                    btn.onClick(this, () => {
                        if (tabCtrl.selectedIndex !== i) {
                            tabCtrl.selectedIndex = i;
                        } else {
                            btn.selected = true;
                        }
                    });
                }
            }
            const statusHint = header ? header.getChild("statusHint") : null;
            const syncTabUI = () => {
                for (let i = 0; i < tabButtons.length; i++) {
                    const btn = tabButtons[i];
                    if (btn) {
                        btn.selected = (tabCtrl.selectedIndex === i);
                    }
                }
                if (statusHint) {
                    statusHint.text = `TAB ${tabCtrl.selectedIndex + 1}/${totalTabs} ACTIVE (1480×720)`;
                }
            };
            tabCtrl.on(fgui.Events.STATE_CHANGED, this, syncTabUI);
            syncTabUI();
        }

        console.log("[MainView] onConstruct 自动触发生命周期，主界面及内部各 Tab 扩展类构建就绪！");
    }
}
