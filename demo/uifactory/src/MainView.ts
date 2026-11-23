import GComponent = fgui.GComponent;

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
        console.log("[MainView] onConstruct 自动触发生命周期，主界面及内部各 Tab 扩展类构建就绪！");
    }
}
