import GRoot = fgui.GRoot;
import GComponent = fgui.GComponent;
import GButton = fgui.GButton;
import UIFactory = tsCore.UIFactory;
import IPanelConfig = tsCore.IPanelConfig;
import { Tab1GearsView } from "./tabs/Tab1GearsView";
import { Tab2TransitionView } from "./tabs/Tab2TransitionView";
import { Tab3ButtonsView } from "./tabs/Tab3ButtonsView";
import { Tab4FlexboxView } from "./tabs/Tab4FlexboxView";
import { Tab5SlotView } from "./tabs/Tab5SlotView";
import { Tab6RelationsView } from "./tabs/Tab6RelationsView";

/**
 * UIFactory 纯代码引擎 — 官方全特性交互验证工作台 (主协调器)
 *
 * 核心规范：
 * 1. 界面视图 100% 声明式数据驱动：所有 UI 布局树完全解耦在 res/layout/*.json 静态配置文件中；
 * 2. 彻底杜绝代码中写大段对象字面量硬编码或通过函数循环动态填值造配置；
 * 3. TypeScript 业务类仅负责资源拉取、容器实例化与具名节点交互绑定。
 */
export class UIFactoryTestApp {

    private static _instance: UIFactoryTestApp;
    private _root!: GComponent;
    private _bodyContainer!: GComponent;
    private _tabController!: fgui.Controller;

    private _tab1View = new Tab1GearsView();
    private _tab2View = new Tab2TransitionView();
    private _tab3View = new Tab3ButtonsView();
    private _tab4View = new Tab4FlexboxView();
    private _tab5View = new Tab5SlotView();
    private _tab6View = new Tab6RelationsView();

    static start() {
        if (!this._instance) {
            this._instance = new UIFactoryTestApp();
            this._instance.init();
        }
    }

    private init() {
        console.log("[UIFactoryTestApp] 初始化 LayaAir 2.x 画布与 FGUI 底座...");

        // 1. 初始化 1480x720 纯 WebGL 画布（左侧 216px 垂直导航菜单栏 + 右侧 1248px Demo 展示区）
        Laya.init(1480, 720, Laya.WebGL);

        // 2. 官方标准视口模式：SHOWALL 保持全局宽高比完整展示
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.bgColor = "#0f172a";

        // 3. 统一全局现代矢量中文字体，消除宋体点阵边缘毛刺
        fgui.UIConfig.defaultFont = "Microsoft YaHei, PingFang SC, sans-serif";

        if (tsCore.DefineConfig && typeof tsCore.DefineConfig.init === "function") {
            tsCore.DefineConfig.init();
        }

        // 4. 挂载 FGUI GRoot 根节点并对齐设计尺寸
        const groot = GRoot.inst;
        if (groot.displayObject && !groot.displayObject.parent) {
            Laya.stage.addChild(groot.displayObject);
        }

        // 5. 创建主底板容器 (1480x720) 并全屏对齐
        this._root = UIFactory.createPanel({
            type: "panel",
            name: "rootPanel",
            width: 1480,
            height: 720,
            background: { color: "#0f172a" }
        }, 1480, 720);

        groot.addChild(this._root);
        this._root.makeFullScreen();

        // 6. 异步拉取工业级单一集中布局合包 (res/ui_bundle.json)，由数据驱动界面极速装配
        this._loadLayoutConfigsAndBuild();
    }

    private async _loadLayoutConfigsAndBuild(): Promise<void> {
        console.log("[UIFactoryTestApp] 开始加载单一 UI 布局二进制加密合包 (res/ui_bundle.bin)...");
        try {
            // 极速 1 次 HTTP 请求加载全部界面布局数据并完成全局解密与内存分配！
            await UIFactory.loadBundle("res/ui_bundle.bin");

            console.log("[UIFactoryTestApp] 二进制合包解密解压完成，开始极速实例化主界面...");

            // 1. 装配 Header 标题栏 (纯路径直驱)
            const header = UIFactory.createFromLayout("res/layout/header.json", { width: 1480, height: 50 }, 1480, 50);
            if (header) {
                this._root.addChild(header);
            }

            // 2. 装配主工作台 (纯路径直驱，通过内部精确 src 自动级联实例化引用的 tab1~tab6 独立页面)
            this._bodyContainer = UIFactory.createFromLayout("res/layout/mainView.json", { width: 1480, height: 670 }, 1480, 670)!;
            this._root.addChild(this._bodyContainer);

            this._tabController = this._bodyContainer.getController("tabCtrl");
            this._setupTabInteractions();

            // 3. 业务逻辑绑定：各视图控制器仅接收实例化后的容器并绑定事件
            this._tab1View.setupInteractions(this._bodyContainer.getChild("tab1Panel") as GComponent);
            this._tab2View.setupInteractions(this._bodyContainer.getChild("tab2Panel") as GComponent);
            this._tab3View.setupInteractions(this._bodyContainer.getChild("tab3Panel") as GComponent);
            this._tab4View.setupInteractions(this._bodyContainer.getChild("tab4Panel") as GComponent, UIFactory.getLayout("res/layout/tab4Flexbox.json")!);
            this._tab5View.setupInteractions(this._bodyContainer.getChild("tab5Panel") as GComponent, UIFactory.getLayout("res/layout/slotItem.json")!);
            this._tab6View.setupInteractions(this._bodyContainer.getChild("tab6Panel") as GComponent);

            console.log("[UIFactoryTestApp] 全部视图控制器交互逻辑绑定完成！");
        } catch (e) {
            console.error("[UIFactoryTestApp] 布局合包加载或分配失败:", e);
        }
    }

    private _setupTabInteractions(): void {
        const sidebar = this._bodyContainer.getChild("sidebarPanel") as GComponent;
        const tabList = sidebar.getChild("tabList") as fgui.GList;

        // 官方原生绑定：将 GList 的 selectionController 绑定至父容器的 tabCtrl 页面状态机
        tabList.selectionController = this._tabController;

        tabList.on(fgui.Events.STATE_CHANGED, this, () => {
            if (tabList.selectedIndex >= 0 && this._tabController.selectedIndex !== tabList.selectedIndex) {
                this._tabController.selectedIndex = tabList.selectedIndex;
            }
        });
        this._tabController.on(fgui.Events.STATE_CHANGED, this, () => {
            if (tabList.selectedIndex !== this._tabController.selectedIndex) {
                tabList.selectedIndex = this._tabController.selectedIndex;
            }
        });
    }
}

UIFactoryTestApp.start();
