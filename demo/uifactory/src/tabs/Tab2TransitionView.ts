import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import GTextField = fgui.GTextField;

export class Tab2TransitionView {

    private _container!: GComponent;

    public setupInteractions(panel: GComponent): void {
        this._container = panel;
        const transLog = this._container.getChild("transLog") as GTextField;
        const slideCard = this._container.getChild("slideCardContainer") as GComponent;
        const pageCtrl = slideCard.getController("transPageCtrl");

        const easeCtrl = this._container.getController("easeCtrl");
        const actionCtrl = this._container.getController("actionCtrl");
        const durationCtrl = this._container.getController("durationCtrl");

        const appendLog = (msg: string) => {
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
                appendLog(`[Radio驱动] 动效时长设为: ${durationCtrl.selectedPage} 秒`);
            });
        }

        // 2. 播放预置正统 FGUI Transition (直接从控制器 Page 提取真实数值)
        const btnPlay = this._container.getChild("btnPlayCustom") as GButton;
        btnPlay.onClick(this, () => {
            const goldChest = this._container.getChild("goldChest") as GComponent;

            // 复位宝箱基础变换 (绝对坐标: x=304, y=224)
            goldChest.setScale(1, 1);
            goldChest.setXY(304, 224);
            goldChest.alpha = 1;
            goldChest.rotation = 0;

            // 核心：直接获取 Controller 页面值，零中介转换
            const actionName = actionCtrl ? actionCtrl.selectedPage : "scale";
            const easeName = easeCtrl ? easeCtrl.selectedPage : "QuadOut";
            // @ts-ignore
            const easeType = fgui.EaseType[easeName] !== undefined ? fgui.EaseType[easeName] : fgui.EaseType.QuadOut;
            const duration = durationCtrl ? parseFloat(durationCtrl.selectedPage) : 0.5;
            const transName = `trans_${actionName}`;
            const trans = this._container.getTransition(transName);
            if (!trans) {
                appendLog(`❌ 未找到预置动效配置: ${transName}`);
                return;
            }

            // 动态注入用户选定的时长与 Ease 缓动曲线
            const items = trans["_items"] || [];
            for (const item of items) {
                if (item.tweenConfig) {
                    item.tweenConfig.duration = duration;
                    item.tweenConfig.easeType = easeType;
                }
            }
            trans["_totalDuration"] = duration;

            // 正统 FGUI Transition 启动播放 (底层由 FGUI GTween 原生接管)
            trans.stop(true, false);
            trans.play(Laya.Handler.create(this, () => {
                appendLog(`✅ 原生动效 [${transName}] 播放完成！`);
            }));

            appendLog(`执行正统 Transition: [${transName}] | 曲线: ${easeName} | 时长: ${duration}s`);
        });

        // 3. 触发切页动效联动
        const btnTrigger = this._container.getChild("btnTriggerPageTrans") as GButton;
        btnTrigger.onClick(this, () => {
            pageCtrl.selectedIndex = pageCtrl.selectedIndex === 0 ? 1 : 0;
            appendLog(`切页至 ${pageCtrl.selectedPage}，PlayTransitionAction 自动播放 pageSlideIn`);
        });
    }
}
