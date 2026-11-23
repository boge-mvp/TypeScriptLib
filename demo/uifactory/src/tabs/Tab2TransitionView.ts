import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;

/**
 * Tab 2: 声明式 Transition 动效与缓动定制检视面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class Tab2TransitionView extends GComponent {

    protected override onConstruct(): void {
        super.onConstruct();

        const transLog = this.getChild("transLog") as GTextField;
        const slideCard = this.getChild("slideCardContainer") as GComponent;
        const pageCtrl = slideCard ? slideCard.getController("transPageCtrl") : null;

        const easeCtrl = this.getController("easeCtrl");
        const actionCtrl = this.getController("actionCtrl");
        const durationCtrl = this.getController("durationCtrl");

        const appendLog = (msg: string) => {
            if (!transLog) return;
            const t = new Date().toLocaleTimeString();
            const prev = transLog.text || "";
            transLog.text = `[${t}] ${msg}\n` + prev.slice(0, 800);
        };

        // 1. 控制器状态机监听 (纯只读审计输出，直驱 Controller Page 值，0 行字典映射代码！)
        if (easeCtrl) {
            easeCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                // @ts-ignore
                appendLog(`[Radio驱动] 缓动曲线选中: ${easeCtrl.selectedPage} (EaseType=${fgui.EaseType[easeCtrl.selectedPage]})`);
            });
        }

        if (actionCtrl) {
            actionCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                appendLog(`[Radio驱动] 动效动作选中: ${actionCtrl.selectedPage}`);
            });
        }

        if (durationCtrl) {
            durationCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                appendLog(`[Radio驱动] 动效时长选中: ${durationCtrl.selectedPage}`);
            });
        }

        if (pageCtrl) {
            pageCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                appendLog(`[动效切页] 卡片状态迁移至: ${pageCtrl.selectedPage}，FGUI 原生触发挂载的 Transition！`);
            });
        }

        const btnPlay = this.getChild("btnPlayCustom") as GButton;
        if (btnPlay) {
            btnPlay.onClick(this, () => {
                appendLog(`[动效触发] 播放自定义 Transition 动效`);
            });
        }

        const btnTrigger = this.getChild("btnTriggerPageTrans") as GButton;
        if (btnTrigger && pageCtrl) {
            btnTrigger.onClick(this, () => {
                const nextIdx = (pageCtrl.selectedIndex + 1) % pageCtrl.pageCount;
                pageCtrl.selectedIndex = nextIdx;
            });
        }
    }
}
