import GComponent = fgui.GComponent;
import GTextField = fgui.GTextField;
import GRichTextField = fgui.GRichTextField;
import GImage = fgui.GImage;
import GButton = fgui.GButton;

/**
 * Tab 1 · 原子图元与富文本交互控制器
 */
export class PrimitivesView extends GComponent {

    private _fillStep: number = 0.65;

    protected override onConstruct(): void {
        super.onConstruct();

        const rich = this.getChild("richTextSample") as GRichTextField;
        const linkStatus = this.getChild("richLinkStatus") as GTextField;
        if (rich && linkStatus) {
            rich.on(Laya.Event.LINK, this, (url: string) => {
                linkStatus.text = `超链接点击回执：已捕获事件 [${url}] (${new Date().toLocaleTimeString()})`;
            });
        }

        const btnAnimateFill = this.getChild("btnAnimateFill") as GButton;
        const imgRadial = this.getChild("imgRadial") as GImage;
        const imgHorz = this.getChild("imgHorz") as GImage;
        const imgCaption = this.getChild("imgCaption") as GTextField;

        if (btnAnimateFill && imgRadial && imgHorz) {
            btnAnimateFill.onClick(this, () => {
                this._fillStep = this._fillStep >= 0.95 ? 0.25 : Number((this._fillStep + 0.2).toFixed(2));
                imgRadial.fillAmount = this._fillStep;
                imgHorz.fillAmount = this._fillStep;
                if (imgCaption) {
                    imgCaption.text = `Flip=Horizontal            Radial360 (${this._fillStep})            Horizontal (${this._fillStep})          实时调整 fillAmount`;
                }
            });
        }
    }
}
