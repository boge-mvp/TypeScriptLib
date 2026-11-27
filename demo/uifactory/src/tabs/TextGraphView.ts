import GComponent = fgui.GComponent;
import GTextField = fgui.GTextField;
import GRichTextField = fgui.GRichTextField;

/**
 * 1. 文本与矢量图元交互控制器
 */
export class TextGraphView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        const rich = this.getChild("richTextSample") as Nullable<GRichTextField>;
        const linkStatus = this.getChild("richLinkStatus") as Nullable<GTextField>;
        if (rich && linkStatus) {
            rich.on(Laya.Event.LINK, this, (url: string) => {
                linkStatus.text = `超链接点击回执：已捕获事件 [${url}] (${new Date().toLocaleTimeString()})`;
            });
        }
    }
}
