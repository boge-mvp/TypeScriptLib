import GComponent = fgui.GComponent;
import GTextField = fgui.GTextField;

export class Tab1GearsView {

    private _container!: GComponent;
    private _currentAnimFrame: number = 0;

    public setupInteractions(panel: GComponent): void {
        this._container = panel;
        const gearCtrl = this._container.getController("gearCtrl");
        const condCtrl = this._container.getController("condCtrl");
        const lookCtrl = this._container.getController("lookCtrl");
        const scaleCtrl = this._container.getController("scaleCtrl");
        const colorCtrl = this._container.getController("colorCtrl");

        const badge = (this._container.getChild("inspectorBadge") || this._container.getChild("badgeBg")) as GComponent;
        const inspLog = this._container.getChild("inspectorLog") as GTextField;
        const condTip = this._container.getChild("condTip") as GTextField;
        const animStatus = this._container.getChild("animStatus") as GTextField;

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

        // 3. 检视器只读审计日志监听 (所有透明/旋转/缩放/换色/置灰/触控 100% 由 JSON 中的 Gears 声明式驱动，0行属性赋值代码！)
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

        if (colorCtrl) {
            colorCtrl.on(fgui.Events.STATE_CHANGED, this, () => {
                if (inspLog) inspLog.text = `[官方GearColor驱动] colorCtrl 切至: ${colorCtrl.selectedPage}，目标元件背景图元由 FGUI 原生自闭环换色与描边同步切换！`;
            });
        }

        // 4. 鼠标点击目标测试元件交互验证 (在 touchable=false 时由 FGUI 底层原生拦截穿透)
        if (badge) {
            badge.onClick(this, () => {
                if (inspLog) inspLog.text = `[${new Date().toLocaleTimeString()}] 🎯 目标测试可视元件被点击！(当前 touchable=${badge.touchable})`;
            });
        }
    }
}
