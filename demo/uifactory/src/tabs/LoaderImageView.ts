import GComponent = fgui.GComponent;
import GTextField = fgui.GTextField;
import GImage = fgui.GImage;
import GLoader = fgui.GLoader;
import GButton = fgui.GButton;

/**
 * 2. 图标与图片裁剪交互控制器
 */
export class LoaderImageView extends GComponent {

    private _fillStep: number = 0.65;
    private _iconIdx: number = 1;

    protected override onConstruct(): void {
        super.onConstruct();

        const iconScale = this.getChild("iconScale") as Nullable<GLoader>;
        const loaderStatus = this.getChild("loaderStatusText") as Nullable<GTextField>;
        (this.getChild("btnSwapIcon") as Nullable<GButton>)?.onClick(this, () => {
            this._iconIdx = (this._iconIdx % 8) + 1;
            const url = `res/symbols/item_${this._iconIdx}.png`;
            if (iconScale) iconScale.url = url;
            if (loaderStatus) loaderStatus.text = `当前图集：item_${this._iconIdx}.png`;
        });

        const imgRadial = this.getChild("imgRadial") as Nullable<GImage>;
        const imgHorz = this.getChild("imgHorz") as Nullable<GImage>;
        const imgVert = this.getChild("imgVert") as Nullable<GImage>;
        const lblRadial = this.getChild("lblRadial") as Nullable<GTextField>;
        const lblHorz = this.getChild("lblHorz") as Nullable<GTextField>;
        const lblVert = this.getChild("lblVert") as Nullable<GTextField>;
        const imgStatus = this.getChild("imgStatusText") as Nullable<GTextField>;

        (this.getChild("btnAnimateFill") as Nullable<GButton>)?.onClick(this, () => {
            this._fillStep = this._fillStep >= 0.95 ? 0.25 : Number((this._fillStep + 0.2).toFixed(2));
            if (imgRadial) imgRadial.fillAmount = this._fillStep;
            if (imgHorz) imgHorz.fillAmount = this._fillStep;
            if (imgVert) imgVert.fillAmount = this._fillStep;
            if (lblRadial) lblRadial.text = `Radial360 (${this._fillStep})`;
            if (lblHorz) lblHorz.text = `Horizontal (${this._fillStep})`;
            if (lblVert) lblVert.text = `Vertical (${this._fillStep})`;
            if (imgStatus) imgStatus.text = `当前裁剪进度：${Math.round(this._fillStep * 100)}%`;
        });
    }
}
