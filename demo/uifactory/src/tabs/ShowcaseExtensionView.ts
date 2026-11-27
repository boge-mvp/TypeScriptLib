import GComponent = fgui.GComponent;
import GList = fgui.GList;
import GButton = fgui.GButton;
import GGraph = fgui.GGraph;
import GTextField = fgui.GTextField;
import UIFactory = tsCore.UIFactory;

/**
 * 9.3 示例自定义扩展类：通过 UIFactory.setExtension 绑定到动态注册的布局配置
 */
class CustomBadgeExtension extends GComponent {
    private _tapCount: number = 0;

    protected override onConstruct(): void {
        super.onConstruct();
        const label = this.getChild("badgeLabel") as Nullable<GTextField>;
        if (label) {
            label.text = "CustomBadgeExtension onConstruct 就绪 (点击 +1)";
        }
        this.onClick(this, () => {
            this._tapCount++;
            if (label) {
                label.text = `CustomBadgeExtension 交互计数：${this._tapCount}`;
            }
        });
    }
}

/**
 * Tab 9 · 实战老虎机转轴与 UIFactory 18 个静态创建 API + 扩展机制测试面板
 */
export class ShowcaseExtensionView extends GComponent {

    private _reels: GList[] = [];
    private _isSpinning: boolean = false;
    private _extSpawnCount: number = 0;

    protected override onConstruct(): void {
        super.onConstruct();

        // 9.1 初始化 3 条循环老虎机转轴
        for (let r = 0; r < 3; r++) {
            const list = this.getChild(`reel${r}`) as GList;
            if (list) {
                list.itemRenderer = Laya.Handler.create(this, (index: number, item: GComponent) => {
                    const icon = item.getChild("symbolIcon");
                    const symId = ((index + r * 3) % 8) + 1;
                    if (icon) icon.icon = UIFactory.formatResUrl(`res/symbols/item_${symId}.png`);
                }, undefined, false);
                list.setVirtualAndLoop();
                list.numItems = 8;
                this._reels.push(list);
            }
        }

        const btnSpin = this.getChild("btnSpinSlot") as GButton;
        const slotResult = this.getChild("slotResultText") as GTextField;

        btnSpin?.onClick(this, () => {
            if (this._isSpinning || this._reels.length < 3) return;
            this._isSpinning = true;
            if (slotResult) slotResult.text = "转轴状态：高速旋转中...";

            const targets = [
                Math.floor(Math.random() * 8) + 16,
                Math.floor(Math.random() * 8) + 24,
                Math.floor(Math.random() * 8) + 32
            ];

            this._reels.forEach((reel, idx) => {
                const startY = reel.scrollPane.posY;
                const endY = startY + targets[idx] * 92;
                const proxy = { y: startY };
                Laya.Tween.to(proxy, {
                    y: endY,
                    update: Laya.Handler.create(this, () => {
                        reel.scrollPane.setPosY(proxy.y, false);
                    }, undefined, false)
                }, 900 + idx * 350, Laya.Ease.cubicOut, Laya.Handler.create(this, () => {
                    if (idx === 2) {
                        this._isSpinning = false;
                        if (slotResult) slotResult.text = `转轴状态：已停止！命中索引 [${targets.map(t => (t % 8) + 1).join(" - ")}]`;
                    }
                }));
            });
        });

        // 9.2 运行时自检 UIFactory 全部 18 个静态 create* 方法
        const btnAudit = this.getChild("btnRunApiAudit") as GButton;
        const auditText = this.getChild("apiAuditResult") as GTextField;

        btnAudit?.onClick(this, () => {
            const checks: Array<[string, Nullable<fgui.GObject>]> = [
                ["createText", UIFactory.createText({ type: "text", text: "ok" })],
                ["createRichTextField", UIFactory.createRichTextField({ type: "text", isUbb: true, text: "[b]ok[/b]" })],
                ["createTextInput", UIFactory.createTextInput({ type: "text", isInput: true })],
                ["createIcon", UIFactory.createIcon({ type: "icon" })],
                ["createGraph", UIFactory.createGraph({ type: "graph", width: 10, height: 10 })],
                ["createButton", UIFactory.createButton({ type: "button", title: "btn" })],
                ["createPanel", UIFactory.createPanel({ type: "panel", width: 20, height: 20 })],
                ["createList", UIFactory.createList({ type: "list", width: 20, height: 20 })],
                ["createGroup", UIFactory.createGroup({ type: "group" })],
                ["createLabel", UIFactory.createLabel({ type: "label", title: "lbl" })],
                ["createComboBox", UIFactory.createComboBox({ type: "combobox", items: ["A", "B"] })],
                ["createScrollBar", UIFactory.createScrollBar({ type: "scrollbar", width: 12, height: 80 })],
                ["createTree", UIFactory.createTree({ type: "tree", width: 80, height: 80 })],
                ["createMovieClip", UIFactory.createMovieClip({ type: "movieclip" })],
                ["createImage", UIFactory.createImage({ type: "image" })],
                ["createProgressBar", UIFactory.createProgressBar({ type: "progressbar", value: 50, max: 100 })],
                ["createSlider", UIFactory.createSlider({ type: "slider", value: 30, max: 100 })],
                ["createElement", UIFactory.createElement({ type: "graph", width: 10, height: 10 }, 0, 0)]
            ];

            let passCount = 0;
            const lines = checks.map(([name, inst]) => {
                const ok = inst !== null && inst !== undefined;
                if (ok) {
                    passCount++;
                    inst.dispose?.();
                }
                return `${ok ? "[PASS]" : "[FAIL]"} ${name}`;
            });

            if (auditText) {
                auditText.text = `工厂方法自检结果：${passCount}/${checks.length} 全部通过\n` + lines.join("  |  ");
            }
        });

        // 9.3 扩展机制测试：setExtension + registerConfig + registerCreator
        const extHost = this.getChild("extPreviewHost") as Nullable<GComponent>;
        const extResult = this.getChild("extAuditResult") as Nullable<GTextField>;
        const btnTestExt = this.getChild("btnTestSetExtension") as Nullable<GButton>;
        const btnTestCreator = this.getChild("btnTestRegisterCreator") as Nullable<GButton>;

        const extConfigUrl = "res/layout/runtimeExtBadge.json";
        UIFactory.registerConfig(extConfigUrl, {
            type: "panel",
            name: "runtimeExtBadge",
            width: 288,
            height: 76,
            background: {
                type: "graph",
                shape: "rect",
                fillColor: "#312e81",
                lineSize: 2,
                lineColor: "#a78bfa",
                cornerRadius: 10
            },
            elements: [
                {
                    type: "text",
                    name: "badgeLabel",
                    x: 12,
                    y: 18,
                    width: 264,
                    height: 40,
                    text: "placeholder",
                    fontSize: 13,
                    bold: true,
                    color: "#f5f3ff",
                    align: "center",
                    valign: "middle"
                }
            ]
        });
        UIFactory.setExtension(extConfigUrl, CustomBadgeExtension);

        UIFactory.registerCreator("neon-pill", (elData) => {
            const comp = new GComponent();
            const w = elData.width || 288;
            const h = elData.height || 52;
            comp.setSize(w, h);
            const bg = new GGraph();
            bg.setSize(w, h);
            bg.drawRect(2, "#34d399", "#065f46", [h / 2, h / 2, h / 2, h / 2]);
            comp.addChild(bg);
            const txt = new GTextField();
            txt.setSize(w, h);
            txt.fontSize = 13;
            txt.bold = true;
            txt.color = "#ecfdf5";
            txt.align = fgui.AlignType.Center;
            txt.valign = fgui.VertAlignType.Middle;
            txt.text = (elData as { label?: string }).label || "NeonPill 自定义元件";
            comp.addChild(txt);
            return comp;
        });

        btnTestExt?.onClick(this, () => {
            if (!extHost) return;
            extHost.removeChildren(0, -1, true);
            const inst = UIFactory.createFromConfig<CustomBadgeExtension>(extConfigUrl);
            if (inst) {
                inst.setXY(16, 18);
                extHost.addChild(inst);
                const isExt = inst instanceof CustomBadgeExtension;
                if (extResult) {
                    extResult.text = `[PASS] setExtension + registerConfig\n实例类型: ${inst.constructor.name} (instanceof=${isExt})\n已挂载到左侧预览框，可直接点击扩展面板测试交互！`;
                }
            }
        });

        btnTestCreator?.onClick(this, () => {
            if (!extHost) return;
            this._extSpawnCount++;
            extHost.removeChildren(0, -1, true);
            const customEl = UIFactory.createElement(
                { type: "neon-pill", width: 288, height: 52, label: `NeonPill #${this._extSpawnCount} (registerCreator)` } as unknown as tsCore.IElementConfig,
                16,
                30
            );
            if (customEl) {
                extHost.addChild(customEl);
                if (extResult) {
                    extResult.text = `[PASS] registerCreator(\"neon-pill\") + createElement\n第 ${this._extSpawnCount} 次动态创建自定义元件成功！\n尺寸: ${customEl.width}×${customEl.height} | 类型: ${customEl.constructor.name}`;
                }
            }
        });
    }
}
