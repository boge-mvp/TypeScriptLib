import GComponent = fgui.GComponent;
import GTextField = fgui.GTextField;

/**
 * Tab 1: 10 大 Gears 状态机与齿轮矩阵检视面板
 *
 * 遵循官方规范：直接继承 fgui.GComponent，并在 onConstruct 生命周期钩子中自闭环完成所有逻辑绑定。
 */
export class GearsView extends GComponent {

    private _currentAnimFrame: number = 0;

    protected override onConstruct(): void {
        super.onConstruct();

        const gearCtrl = this.getController("gearCtrl");
        const condCtrl = this.getController("condCtrl");
        const lookCtrl = this.getController("lookCtrl");
        const scaleCtrl = this.getController("scaleCtrl");

        const badge = (this.getChild("inspectorBadge") || this.getChild("badgeBg")) as GComponent;
        const inspLog = this.getChild("inspectorLog") as GTextField;
        const condTip = this.getChild("condTip") as GTextField;
        const animStatus = this.getChild("animStatus") as GTextField;

        const updateCondTip = () => {
            if (condTip && gearCtrl && condCtrl) {
                const isAMet = gearCtrl.selectedPage === "stateB";
                const isBMet = condCtrl.selectedPage === "c2";
                condTip.text = `A=${gearCtrl.selectedPage}${isAMet ? "✅" : "❌"} B=${condCtrl.selectedPage}${isBMet ? "✅" : "❌"}\n门控: ${isAMet || isBMet ? "显现 ✅" : "隐藏 ❌"}`;
            }
        };

        // 1. 顶部条件 A/B 控制器只读日志监听 (按钮与10大Gears由 FGUI 官方自闭环接管，0行手写代码)
        if (gearCtrl) {
            gearCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                updateCondTip();
                if (inspLog) inspLog.text = `[官方控制器驱动] 条件 A 迁移至: ${gearCtrl.selectedPage}，左侧10大Gears图元原生自适应！`;
            });
        }
        if (condCtrl) {
            condCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                updateCondTip();
                if (inspLog) inspLog.text = `[官方控制器驱动] 条件 B 迁移至: ${condCtrl.selectedPage}，双条件门控原生求值！`;
            });
        }
        updateCondTip();

        // 2. 动画帧模拟播放
        Laya.timer.loop(300, this, () => {
            if (!animStatus) return;
            if (gearCtrl && gearCtrl.selectedPage === "stateA") {
                this._currentAnimFrame = (this._currentAnimFrame + 1) % 4;
                animStatus.text = `A: 循环播放中 第${this._currentAnimFrame}帧 ▶`;
            } else {
                animStatus.text = "B: 暂停 定格第2帧 ⏸";
            }
        });

        // 3. 检视器只读审计日志监听
        if (lookCtrl) {
            lookCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                if (inspLog) {
                    inspLog.text = `[官方GearLook纯配置驱动] lookCtrl 切至: ${lookCtrl.selectedPage} -> 置灰=${badge.grayed}, 触控=${badge.touchable}, 旋转=${badge.rotation}°, 透明度=${badge.alpha}`;
                }
            });
        }

        if (scaleCtrl) {
            scaleCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                if (inspLog) inspLog.text = `[官方GearSize驱动] scaleCtrl 切至: ${scaleCtrl.selectedPage}，FGUI 原生等比缩放目标元件！`;
            });
        }

        const colorCtrl = this.getController("colorCtrl");
        if (colorCtrl) {
            colorCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                if (inspLog) inspLog.text = `[官方GearColor驱动] colorCtrl 切至: ${colorCtrl.selectedPage}，矢量填充色平滑迁移！`;
            });
        }

        if (badge) {
            badge.onClick(this, () => {
                if (inspLog) inspLog.text = `[触控命中验证] 🎯 成功点击了测试徽章目标！(当前 touchable=${badge.touchable})`;
            });
        }
    }
}
