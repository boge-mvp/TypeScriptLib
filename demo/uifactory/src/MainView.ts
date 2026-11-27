import GComponent = fgui.GComponent;

/**
 * 主界面工作台根组件 (MainView)
 *
 * 对应布局文件: res/layout/mainView.json
 * 遵循「JSON 优先」原则：左侧 tabList 通过 selectionController="tabCtrl" 原生双向驱动切页与选中高亮，
 * MainView 仅负责同步顶栏状态提示文本。
 */
export class MainView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        const tabCtrl = this.getController("tabCtrl");
        const header = this.getChild("header") as Nullable<GComponent>;
        const statusHint = header ? header.getChild("statusHint") : null;
        if (tabCtrl && statusHint) {
            const syncStatus = () => {
                statusHint.text = `TAB ${tabCtrl.selectedIndex + 1}/10 ACTIVE (1280×720)`;
            };
            tabCtrl.on(fgui.Events.STATE_CHANGED, this, syncStatus);
            syncStatus();
        }
    }
}
