import GRoot = fgui.GRoot;
import GComponent = fgui.GComponent;
import UIFactory = tsCore.UIFactory;
import DefineConfig = tsCore.DefineConfig;

import { MainView } from "./MainView";
import { PrimitivesView } from "./tabs/PrimitivesView";
import { MediaView } from "./tabs/MediaView";
import { FormView } from "./tabs/FormView";
import { ContainersView } from "./tabs/ContainersView";
import { FlexboxWorkbench } from "./tabs/FlexboxWorkbench";
import { RelationsWorkbench } from "./tabs/RelationsWorkbench";
import { GearsView } from "./tabs/GearsView";
import { TransitionsView } from "./tabs/TransitionsView";
import { ShowcaseExtensionView } from "./tabs/ShowcaseExtensionView";

/**
 * UIFactory 纯代码引擎 — 官方全特性交互验证工作台 (主启动入口)
 *
 * 核心规范：
 * 1. 100% 对齐官方 UIObjectFactory.setExtension 机制：
 *    将主界面与各独立子页面直接映射为自定义 UI 类 (继承自 fgui.GComponent / GButton 等)；
 * 2. 界面构建终态自动触发各个类的 onConstruct 生命周期方法，业务交互逻辑自包含自闭环；
 * 3. 入口类仅负责注册映射、加载合包并拉起主界面，零手动组件拼装，零外部胶水代码。
 */
export class UIFactoryTestApp {

    private static _instance: UIFactoryTestApp;
    private _root!: MainView;

    static start() {
        if (!this._instance) {
            this._instance = new UIFactoryTestApp();
            this._instance.init()
        }
    }

    private async init() {
        // 1. 优先注入 tsCore 底层原生增强补丁
        DefineConfig.init();

        console.log("[UIFactoryTestApp] 初始化 LayaAir 2.x 画布与 FGUI 底座...");

        // 2. 初始化 1480x720 纯 WebGL 画布
        Laya.init(1480, 720, Laya.WebGL);
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.bgColor = "#0f172a";
        fgui.UIConfig.defaultFont = "Microsoft YaHei, PingFang SC, sans-serif";

        if (GRoot.inst.displayObject && !GRoot.inst.displayObject.parent) {
            Laya.stage.addChild(GRoot.inst.displayObject);
        }

        // 3. 全场景类映射注册 (100% 对齐官方 fgui.UIObjectFactory.setExtension)
        //    主页面与 9 个正交测试 Tab 视图均映射为继承自 fgui.GComponent 的实体类
        UIFactory.setExtension("res/layout/mainView.json", MainView);
        UIFactory.setExtension("res/layout/primitivesPanel.json", PrimitivesView);
        UIFactory.setExtension("res/layout/mediaPanel.json", MediaView);
        UIFactory.setExtension("res/layout/formPanel.json", FormView);
        UIFactory.setExtension("res/layout/containersPanel.json", ContainersView);
        UIFactory.setExtension("res/layout/flexboxWorkbench.json", FlexboxWorkbench);
        UIFactory.setExtension("res/layout/relationsWorkbench.json", RelationsWorkbench);
        UIFactory.setExtension("res/layout/gearsPanel.json", GearsView);
        UIFactory.setExtension("res/layout/transitionsPanel.json", TransitionsView);
        UIFactory.setExtension("res/layout/showcaseExtensionPanel.json", ShowcaseExtensionView);

        // 4. 异步加载布局合包
        await UIFactory.loadBundle("res/ui_bundle.bin");

        // 5. 实例化主界面 (自动命中 MainView，子节点自动命中各 TabView，并自动触发各自的 onConstruct！)
        this._root = UIFactory.createFromConfig<MainView>("res/layout/mainView.json")!;
        GRoot.inst.addChild(this._root);
        this._root.makeFullScreen();

        console.log("[UIFactoryTestApp] 主界面与全量 Tab 扩展类全自动构建并就绪！");
    }
}

UIFactoryTestApp.start();
