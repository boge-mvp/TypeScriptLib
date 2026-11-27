import GComponent = fgui.GComponent;
import GMovieClip = fgui.GMovieClip;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;

/**
 * Tab 2 · 序列帧动画 (GMovieClip) 控制器
 */
export class MediaView extends GComponent {

    private _is2xSpeed: boolean = false;

    protected override onConstruct(): void {
        super.onConstruct();

        const mc = this.getChild("demoMovieClip") as GMovieClip;
        const mcStatus = this.getChild("mcStatusText") as GTextField;

        const updateMcStatus = () => {
            if (!mc || !mcStatus) return;
            mcStatus.text = `状态：${mc.playing ? "播放中" : "已暂停"} | frame: ${mc.frame} | timeScale: ${mc.timeScale}x | swing: ${mc.swing}`;
        };

        (this.getChild("btnMcToggle") as GButton)?.onClick(this, () => {
            if (!mc) return;
            mc.playing = !mc.playing;
            updateMcStatus();
        });

        (this.getChild("btnMcSpeed") as GButton)?.onClick(this, () => {
            if (!mc) return;
            this._is2xSpeed = !this._is2xSpeed;
            mc.timeScale = this._is2xSpeed ? 2.0 : 1.0;
            updateMcStatus();
        });

        (this.getChild("btnMcSwing") as GButton)?.onClick(this, () => {
            if (!mc) return;
            mc.swing = !mc.swing;
            updateMcStatus();
        });

        (this.getChild("btnMcStep") as GButton)?.onClick(this, () => {
            if (!mc) return;
            mc.playing = false;
            mc.frame = (mc.frame + 1) % 8;
            updateMcStatus();
        });
    }
}
