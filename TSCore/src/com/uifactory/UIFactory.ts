import {IElementConfig} from "./IElementConfig";
import {IGraphConfig} from "./IGraphConfig";
import {IIconConfig} from "./IIconConfig";
import {ITextConfig} from "./ITextConfig";
import {IButtonConfig} from "./IButtonConfig";
import {IListConfig} from "./IListConfig";
import {IControllerConfig} from "./IControllerConfig";
import {UIFactoryTransitions} from "./UIFactoryTransitions";
import {ITransitionTargetValue} from "./ITransitionTargetValue";
import {IBaseElementConfig} from "./IBaseElementConfig";
import {IViewConfig} from "./IViewConfig";
import {UIFactoryGears} from "./UIFactoryGears";
import {UIFactoryLayout} from "./UIFactoryLayout";
import {IFlowLayoutState} from "./IFlowLayoutState";
import {UIFactoryExtensions} from "./UIFactoryExtensions";
import {UIFactoryPipeline} from "./UIFactoryPipeline";
import {IGraphicsCmdConfig} from "./IGraphicsCmdConfig";
import {ITransitionConfig, TransitionActionType} from "./ITransitionConfig";
import {IPanelConfig} from "./IPanelConfig";
import {ISliderConfig} from "./ISliderConfig";
import {IProgressBarConfig} from "./IProgressBarConfig";
import {IGroupConfig} from "./IGroupConfig";
import {ILabelConfig} from "./ILabelConfig";
import {IComboBoxConfig} from "./IComboBoxConfig";
import {IScrollBarConfig} from "./IScrollBarConfig";
import {ITreeConfig} from "./ITreeConfig";
import {IMovieClipConfig} from "./IMovieClipConfig";
import {ILoader3DConfig} from "./ILoader3DConfig";
import {IImageConfig} from "./IImageConfig";
import {IUILayoutBundle} from "./IUILayoutBundle";
import {UIFactoryLoader} from "./UIFactoryLoader";
import {UIFactoryPanelBuilder} from "./UIFactoryPanelBuilder";

/**
 * 自定义组件创建器函数类型
 *
 * @template T 元素配置类型
 * @template R 生成的 FGUI 显示对象类型
 * @param elData 声明式元素配置对象
 * @param containerW 父容器计算宽度
 * @param containerH 父容器计算高度
 * @returns 实例化的 FGUI 组件对象
 */
export type ElementCreator<T extends IElementConfig = IElementConfig, R extends fgui.GObject = fgui.GObject> = {
    bivariantHack(elData: T, containerW: number, containerH: number): R;
}["bivariantHack"];

/**
 * UIFactory 纯代码 FGUI 布局引擎与组件工厂门面
 *
 * 核心职责：
 * 1. 统一工厂入口：提供 createText / createIcon / createButton / createPanel / createList 等标准化 API；
 * 2. 调度 6 阶段标准管线：纯实例化 -> setup_beforeAdd -> 两遍测量排版 -> setupRelations -> setup_afterAdd -> constructExtension -> finalize；
 * 3. 驱动 10 大 Gears 状态机与过渡动效 (Transition) 的自动化装配；
 * 4. 零侵入扩展：支持通过 registerCreator 注册外部自定义组件类型。
 */
export class UIFactory {

    /** 远程或本地静态资源的统一基础路径前缀 */
    public static resBasePath: string = "";

    /** 已注册的自定义元件创建器字典表，键为元素类型 type */
    public static customCreators: Record<string, ElementCreator<IElementConfig, fgui.GObject>> = {};

    /** 已注册的外部独立页面/组件布局配置字典表，支持通过标准路径寻址 */
    public static registeredConfigs: Record<string, IElementConfig> = {};

    /** 已注册的页面/组件布局或 URL 对应的自定义 UI 扩展类映射表 (对齐官方 fgui.UIObjectFactory.extensions) */
    public static extensions: Record<string, new () => fgui.GObject> = {};

    /** UI 布局合包的默认对称加密密钥 (支持商业项目全局覆盖) */
    public static bundleKey: string = "TypeScriptLib_UIFactory_2026_Key";

    /**
     * 注册页面/组件布局的自定义 UI 扩展类 (100% 对齐官方 fgui.UIObjectFactory.setExtension)
     * 支持映射顶级页面、通过 src 引用的子组件或普通配置，支持继承自 GComponent、GButton 等任意 GObject 子类
     *
     * @param pathKey 页面配置文件的相对路径或标识名 (如 "res/layout/mainView.json" 或 "res/layout/tab1Gears.json")
     * @param extensionClass 继承自 fgui.GObject 的用户自定义 UI 类
     */
    public static setExtension<T extends fgui.GObject>(
        pathKey: string,
        extensionClass: new () => T
    ): void {
        const normalized = pathKey.replace(/\\/g, "/");
        UIFactory.extensions[normalized] = extensionClass;
    }

    /**
     * Validates that:
     * 1. "controllers" and "transitions" are only defined on the root node of a layout configuration.
     * 2. Non-root panels cannot contain inline elements unless referenced via "src".
     * 3. All declared Gears reference controllers that actually exist on the root container.
     *
     * @param config The layout panel configuration (IPanelConfig)
     * @param pagePath The path or identifier of the layout being validated
     */
    public static validateLayoutConfig(config: IPanelConfig, pagePath: string = "root"): void {
        UIFactoryLoader.validateLayoutConfig(config, pagePath);
    }

    /**
     * 注册独立页面/组件配置，使其可通过 src="路径" 在任意其他页面中直接引用
     *
     * @param pathKey 页面或组件配置文件的标准相对路径 (如 "res/layout/header.json")
     * @param config 声明式组件配置
     */
    public static registerConfig(pathKey: string, config: IElementConfig): void {
        const normalized = pathKey.replace(/\\/g, "/");
        if (config.type === "panel" || !config.type) {
            UIFactory.validateLayoutConfig(config as IPanelConfig, normalized);
        }
        UIFactory.registeredConfigs[normalized] = config;
    }

    /**
     * 批量导入并注册布局合集包 (UI Layout Bundle)
     *
     * 核心规范：
     * 100% 采用标准相对路径作为 Key (如 "res/layout/header.json")，绝无短名别名污染，
     * 组件内部引用统一写精确路径 (如 src: "res/layout/header.json")，做到路径唯一确定。
     *
     * @param bundle 包含 layouts 字典的合集包对象，或直接传入页面映射字典
     */
    public static registerBundle(bundle: IUILayoutBundle | Record<string, IElementConfig>): void {
        if (!bundle) return;
        const dict = ("layouts" in bundle && typeof bundle.layouts === "object") ? bundle.layouts : (bundle as Record<string, IElementConfig>);
        for (const [key, conf] of Object.entries(dict)) {
            if (!conf) continue;
            UIFactory.registerConfig(key, conf);
        }
    }

    /**
     * 依托 TSCore ELoader 统一资产加载器发起异步数据请求
     *
     * 100% 复用 TSCore 的多域名/多 CDN 容灾、缓存管理与进程生命周期。
     * 加载成功返回数据对象，加载失败（404 或为空）安全返回 null，彻底杜绝 Promise reject 抛错。
     *
     * @param url 目标资源地址
     * @param responseType 期望返回的数据格式 ("arraybuffer" | "json" | "text")
     * @param progress 可选的加载进度回调函数 (0 ~ 1)
     * @returns 响应数据 Promise (成功返回 ArrayBuffer / JSON 对象，失败返回 null)
     */
    public static requestData<T>(
        url: string,
        responseType: "arraybuffer" | "json" | "text" = "text",
        progress?: (ratio: number) => void
    ): Promise<Nullable<T>> {
        return UIFactoryLoader.requestData<T>(url, responseType, progress);
    }

    public static async loadBundle(
        bundleUrl: string,
        options?: { key?: string; extension?: string; onProgress?: (ratio: number) => void }
    ): Promise<Nullable<IUILayoutBundle | IPanelConfig>> {
        return UIFactoryLoader.loadBundle(bundleUrl, options);
    }

    public static extractMissingDependencies(
        config: IElementConfig,
        gathered: Set<string> = new Set<string>()
    ): string[] {
        return UIFactoryLoader.extractMissingDependencies(config, gathered);
    }

    /**
     * 直接从已注册/已加载的配置合集或单配置文件中实例化一个界面显示对象
     *
     * 自动感知配置中的实际类型（支持 panel, button, label, progressbar, slider, combobox, list 等或自定义扩展类），
     * 摆脱单一 panel 限制，依据元素类型多态构建。
     *
     * @template T 期望返回的显示对象类型 (默认为 fgui.GComponent，也可传入 fgui.GButton, fgui.GProgressBar 等任意 GObject 子类)
     * @param nameOrUrl 页面名称或注册标识 (如 "mainView" 或 "res/layout/mainView.json" 或 "res/layout/commonBtn.json")
     * @param overrides 可选的实例覆盖属性 (覆盖坐标 x/y、宽度、高度、文本、关联 relations 等)
     * @param containerW 可选容器基准宽度
     * @param containerH 可选容器基准高度
     * @param userClass 可选的用户自定义扩展类（优先级高于全局 extensions 注册表）
     * @returns 实例化的 GObject 显示对象
     */
    public static createFromConfig<T extends fgui.GObject = fgui.GComponent>(
        nameOrUrl: string,
        overrides?: Partial<IElementConfig>,
        containerW?: number,
        containerH?: number,
        userClass?: new () => T
    ): Nullable<T> {
        const template = UIFactory.getConfig(nameOrUrl);
        if (!template) {
            console.error(`[UIFactory] Component template "${nameOrUrl}" not found! Please ensure layout has been registered.`);
            return null;
        }
        const finalConfig: IElementConfig = (overrides ? {...template, ...overrides} : template) as IElementConfig;
        const normalized = nameOrUrl.replace(/\\/g, "/");
        const customClass = userClass || (UIFactory.extensions[normalized] as new() => T);

        if (finalConfig.type === "panel" || !finalConfig.type) {
            UIFactory.validateLayoutConfig(finalConfig as IPanelConfig, normalized);
        }

        const node = UIFactory.createElement<T>(finalConfig, containerW || 0, containerH || 0, customClass);
        if (node) {
            if (finalConfig.x !== undefined) node.x = finalConfig.x;
            if (finalConfig.y !== undefined) node.y = finalConfig.y;
        }
        return node;
    }

    /**
     * 获取指定 URL、文件路径或名称的组件/页面配置对象
     *
     * 寻址顺序：
     * 1. 优先从 UIFactory.registeredConfigs 内存字典提取；
     * 2. 其次从 Laya.loader.getRes(urlOrName) 提取已预加载的 JSON 配置；
     * 3. 再次尝试拼接 resBasePath 后的地址寻址。
     *
     * @template T 期望返回的配置类型 (默认为 IElementConfig)
     * @param urlOrName 配置文件路径或注册标识
     * @returns 匹配的 IElementConfig，未命中返回 null
     */
    public static getConfig<T extends IElementConfig = IElementConfig>(urlOrName?: string): Nullable<T> {
        if (!urlOrName) return null;
        if (UIFactory.registeredConfigs[urlOrName]) {
            return UIFactory.registeredConfigs[urlOrName] as T;
        }
        const normalized = urlOrName.replace(/\\/g, "/");
        if (UIFactory.registeredConfigs[normalized]) {
            return UIFactory.registeredConfigs[normalized] as T;
        }
        if (typeof Laya !== "undefined" && Laya.loader && typeof Laya.loader.getRes === "function") {
            const res = Laya.loader.getRes(urlOrName) || Laya.loader.getRes(normalized) || Laya.loader.getRes(UIFactory.formatResUrl(urlOrName)) || Laya.loader.getRes(UIFactory.formatResUrl(normalized));
            if (res && typeof res === "object") {
                return res as T;
            }
        }
        return null;
    }

    /**
     * 解析并合并组件声明配置（自动提取并展开 src 引用的独立页面配置）
     *
     * @param elData 声明式元素配置
     * @returns 深度合并了模板结构与实例覆盖属性后的完整元素配置
     */
    public static resolveElementConfig(elData: IElementConfig): IElementConfig {
        if (!elData.src) return elData;
        const templateConf = UIFactory.getConfig(elData.src);
        if (!templateConf) return elData;
        const elView = elData as Partial<IPanelConfig>;
        const tmplView = templateConf as Partial<IPanelConfig>;
        return {
            ...templateConf,
            ...elData,
            type: elData.type || templateConf.type || "panel",
            elements: elView.elements || tmplView.elements,
            controllers: elView.controllers || tmplView.controllers,
            transitions: elView.transitions || tmplView.transitions,
            background: elView.background !== undefined ? elView.background : tmplView.background,
            padding: elView.padding !== undefined ? elView.padding : tmplView.padding,
            layoutType: elView.layoutType !== undefined ? elView.layoutType : tmplView.layoutType,
            gap: elView.gap !== undefined ? elView.gap : tmplView.gap,
            flexWrap: elView.flexWrap !== undefined ? elView.flexWrap : tmplView.flexWrap,
            alignItems: elView.alignItems !== undefined ? elView.alignItems : tmplView.alignItems,
            justifyContent: elView.justifyContent !== undefined ? elView.justifyContent : tmplView.justifyContent
        } as IElementConfig;
    }

    /**
     * 规范化资源 URL 地址
     *
     * @param url 待规范化的资源相对路径或完整 URL
     * @returns 拼接了 resBasePath 后的规范化绝对或相对路径
     */
    public static formatResUrl(url: string): string {
        if (url && UIFactory.resBasePath && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith(UIFactory.resBasePath)) {
            return UIFactory.resBasePath + url;
        }
        return url;
    }

    /**
     * 从 FGUI 资源包中快速提取 Laya.Texture 纹理对象
     *
     * @param url 资源地址（支持带或不带 ui:// 前缀）
     * @returns 匹配的 Laya.Texture，若非包内纹理或不存在则返回 null
     */
    public static getFguiTexture(url?: string): Nullable<Laya.Texture> {
        if (!url) return null;
        if (!url.startsWith("ui:")) url = "ui://" + url;
        const asset = fgui.UIPackage.getItemAssetByURL(url);
        return asset instanceof Laya.Texture ? asset : null;
    }

    /**
     * 注册自定义元件类型创建器，实现业务元件在 UI 工厂的零侵入扩展
     *
     * @template T 元素配置接口类型
     * @template R 产出的 FGUI 组件类型
     * @param type 元件类型唯一标识字符串
     * @param creator 创建器工厂闭包
     */
    public static registerCreator<T extends IElementConfig, R extends fgui.GObject>(
        type: string,
        creator: ElementCreator<T, R>
    ): void {
        UIFactory.customCreators[type] = creator;
    }

    /**
     * 声明式多态创建单个 FGUI 显示对象
     *
     * 遵循官方 6 阶段构建管线，依次执行纯实例化、前置属性分流、级联复合子容器填充与矢量绘图应用。
     *
     * @template T 期望返回的 FGUI 组件类型
     * @param elData 声明式元素配置对象
     * @param containerW 父容器可用宽度基准
     * @param containerH 父容器可用高度基准
     * @param userClass
     * @returns 实例化的 FGUI 对象，类型不匹配或未知时返回 null
     */
    public static createElement<T extends fgui.GObject = fgui.GObject>(
        elData: IElementConfig,
        containerW: number = 0,
        containerH: number = 0,
        userClass?: new () => T
    ): Nullable<T> {
        let finalData: IElementConfig = elData;
        let extClass: (new () => fgui.GObject) | undefined = userClass;

        if (elData.src) {
            const normalizedSrc = elData.src.replace(/\\/g, "/");
            if (!extClass && UIFactory.extensions[normalizedSrc]) {
                extClass = UIFactory.extensions[normalizedSrc];
            }
            const templateConf = UIFactory.getConfig(elData.src);
            if (templateConf) {
                const elView = elData as Partial<IPanelConfig>;
                const tmplView = templateConf as Partial<IPanelConfig>;
                finalData = {
                    ...templateConf,
                    ...elData,
                    type: elData.type || templateConf.type || "panel",
                    elements: elView.elements || tmplView.elements,
                    controllers: elView.controllers || tmplView.controllers,
                    transitions: elView.transitions || tmplView.transitions,
                    background: elView.background !== undefined ? elView.background : tmplView.background,
                    padding: elView.padding !== undefined ? elView.padding : tmplView.padding,
                    layoutType: elView.layoutType !== undefined ? elView.layoutType : tmplView.layoutType,
                    gap: elView.gap !== undefined ? elView.gap : tmplView.gap,
                    flexWrap: elView.flexWrap !== undefined ? elView.flexWrap : tmplView.flexWrap,
                    alignItems: elView.alignItems !== undefined ? elView.alignItems : tmplView.alignItems,
                    justifyContent: elView.justifyContent !== undefined ? elView.justifyContent : tmplView.justifyContent
                } as IElementConfig;
            }
        }

        // 普通配置节点的自定义类匹配（支持依据 name 匹配）
        if (!extClass && elData.name && UIFactory.extensions[elData.name]) {
            extClass = UIFactory.extensions[elData.name];
        }

        let node: Nullable<fgui.GObject> = null;

        if (extClass) {
            // 对齐官方 UIObjectFactory.newObject: 优先实例化注册的自定义扩展类
            node = new extClass();
        } else if (UIFactory.customCreators[finalData.type]) {
            node = UIFactory.customCreators[finalData.type](finalData, containerW, containerH);
        } else {
            // 严格对齐官方步骤：纯实例化阶段，不提前灌入 text / url
            node = UIFactoryPipeline.instantiateNode(finalData);
        }

        if (node) {
            // 统一分流前置赋值 (setup_beforeAdd)
            UIFactoryPipeline.setup_beforeAdd(node, finalData);

            // 若为复合容器类型，级联构建内部
            if (finalData.type === "panel" && (node instanceof fgui.GComponent)) {
                UIFactory.fillPanel(node, finalData as IPanelConfig);
            } else if (finalData.type === "button" && (node instanceof fgui.GButton)) {
                UIFactory.fillPanel(node, finalData as IButtonConfig);
            } else if (finalData.type === "slider" && (node instanceof fgui.GSlider)) {
                UIFactory.fillPanel(node, finalData as ISliderConfig);
            } else if (finalData.type === "progressbar" && (node instanceof fgui.GProgressBar)) {
                UIFactory.fillPanel(node, finalData as IProgressBarConfig);
            } else if (finalData.type === "label" && (node instanceof fgui.GLabel)) {
                UIFactory.fillPanel(node, finalData as ILabelConfig);
            } else if (finalData.type === "combobox" && (node instanceof fgui.GComboBox)) {
                UIFactory.fillPanel(node, finalData as IComboBoxConfig);
            } else if (finalData.type === "scrollbar" && (node instanceof fgui.GScrollBar)) {
                UIFactory.fillPanel(node, finalData as IScrollBarConfig);
            } else if (finalData.type === "tree" && (node instanceof fgui.GTree)) {
                UIFactory.fillPanel(node, finalData as ITreeConfig);
            } else if (finalData.type === "list" && (node instanceof fgui.GList)) {
                const lConf = finalData as IListConfig;
                if (lConf.defaultItem) {
                    if (lConf.defaultItem.startsWith("ui://")) {
                        node.defaultItem = lConf.defaultItem;
                    } else {
                        node["_defaultItem"] = lConf.defaultItem;
                    }
                }
                if (lConf.listLayout) node.layout = fgui.ListLayoutType[lConf.listLayout];
                if (lConf.selectionMode !== undefined) {
                    node.selectionMode = typeof lConf.selectionMode === "string"
                        ? (fgui.ListSelectionMode[lConf.selectionMode] ?? fgui.ListSelectionMode.Single)
                        : lConf.selectionMode;
                }
                if (lConf.lineGap !== undefined) node.lineGap = lConf.lineGap;
                if (lConf.columnGap !== undefined) node.columnGap = lConf.columnGap;
                if (lConf.autoResizeItem !== undefined) node.autoResizeItem = lConf.autoResizeItem;
                UIFactory.fillPanel(node, lConf);
                node.ensureBoundsCorrect();
                if (lConf.selectedIndex !== undefined && lConf.selectedIndex >= 0) {
                    node.selectedIndex = lConf.selectedIndex;
                }
            }
        }

        if (node && finalData.graphics) {
            UIFactory.applyGraphics(node, finalData.graphics);
        }

        return node as Nullable<T>;
    }

    /**
     * 创建纯文本组件 (fgui.GBasicTextField)
     *
     * @param elData 文本声明式配置
     * @returns 实例化的 GBasicTextField 对象
     */
    public static createText<T extends fgui.GTextField>(elData: ITextConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建 UBB 富文本组件 (fgui.GRichTextField)
     *
     * @param elData 富文本声明式配置
     * @returns 实例化的 GRichTextField 对象
     */
    public static createRichTextField<T extends fgui.GRichTextField>(elData: ITextConfig): T {
        return UIFactory.createElement<T>({...elData, isUbb: true}, 0, 0)!;
    }

    /**
     * 创建交互式文本输入框 (fgui.GTextInput)
     *
     * @param elData 输入框声明式配置
     * @returns 实例化的 GTextInput 对象
     */
    public static createTextInput<T extends fgui.GTextInput>(elData: ITextConfig): T {
        return UIFactory.createElement<T>({...elData, isInput: true}, 0, 0)!;
    }

    /**
     * 创建图像与装载器组件 (fgui.GLoader)
     *
     * @param elData 图像配置对象
     * @returns 实例化的 GLoader 对象
     */
    public static createIcon<T extends fgui.GLoader>(elData: IIconConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建矢量图形组件 (fgui.GGraph)
     *
     * @param elData 图形配置对象（支持矩形、圆角矩形、圆、椭圆等）
     * @returns 实例化的 GGraph 对象
     */
    public static createGraph<T extends fgui.GGraph>(elData: IGraphConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建列表组件 (fgui.GList / PureList)
     *
     * @param elData 列表配置对象
     * @param containerW 父容器宽度
     * @param containerH 父容器高度
     * @returns 实例化的列表对象
     */
    public static createList<T extends fgui.GList>(elData: IListConfig, containerW: number = 0, containerH: number = 0): T {
        return UIFactory.createElement<T>(elData, containerW, containerH)!;
    }

    /**
     * 创建按钮组件 (fgui.GButton)
     *
     * 支持普通按钮、多选复选框（Check）及单选按钮（Radio）模式。
     *
     * @param elData 按钮配置对象
     * @returns 实例化的 GButton 对象
     */
    public static createButton<T extends fgui.GButton>(elData: IButtonConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建逻辑与排版组容器组件 (fgui.GGroup)
     *
     * @param elData 组配置对象 (含 layout、excludeInvisibles 等)
     * @returns 实例化的 GGroup 对象
     */
    public static createGroup<T extends fgui.GGroup>(elData: IGroupConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建标准复合标签组件 (fgui.GLabel)
     *
     * @param elData 标签配置对象 (含 title、icon、titleColor 等)
     * @returns 实例化的 GLabel 对象
     */
    public static createLabel<T extends fgui.GLabel>(elData: ILabelConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建原生下拉菜单组件 (fgui.GComboBox)
     *
     * @param elData 下拉选框配置对象 (含 items、values、selectionController 等)
     * @returns 实例化的 GComboBox 对象
     */
    public static createComboBox<T extends fgui.GComboBox>(elData: IComboBoxConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建原生独立滚动条组件 (fgui.GScrollBar)
     *
     * @param elData 滚动条配置对象
     * @returns 实例化的 GScrollBar 对象
     */
    public static createScrollBar<T extends fgui.GScrollBar>(elData: IScrollBarConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建原生树形组件 (fgui.GTree)
     *
     * @param elData 树形配置对象
     * @param containerW 容器宽度
     * @param containerH 容器高度
     * @returns 实例化的 GTree 对象
     */
    public static createTree<T extends fgui.GTree>(elData: ITreeConfig, containerW?: number, containerH?: number): T {
        return UIFactory.createElement<T>(elData, containerW || 0, containerH || 0)!;
    }

    /**
     * 创建原生序列帧动画组件 (fgui.GMovieClip)
     *
     * @param elData 序列帧动画配置对象
     * @returns 实例化的 GMovieClip 对象
     */
    public static createMovieClip<T extends fgui.GMovieClip>(elData: IMovieClipConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建原生 3D / Spine 渲染加载器 (fgui.GLoader3D)
     *
     * @param elData 3D加载器配置对象
     * @returns 实例化的 GLoader3D 对象
     */
    public static createLoader3D<T extends fgui.GLoader3D>(elData: ILoader3DConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建原生轻量图片组件 (fgui.GImage)
     *
     * @param elData 图片配置对象
     * @returns 实例化的 GImage 对象
     */
    public static createImage<T extends fgui.GImage>(elData: IImageConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建进度条组件 (GProgressBar)
     *
     * @param elData 进度条配置对象
     * @returns 实例化的 GProgressBar 对象
     */
    public static createProgressBar<T extends fgui.GProgressBar>(elData: IProgressBarConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建滑动条组件 (GSlider)
     *
     * @param elData 滑动条配置对象
     * @returns 实例化的 GSlider 对象
     */
    public static createSlider<T extends fgui.GSlider>(elData: ISliderConfig): T {
        return UIFactory.createElement<T>(elData, 0, 0)!;
    }

    /**
     * 创建容器面板 (EPanel / fgui.GComponent)
     *
     * 支持绝对定位、单向流式排版、Flexbox 弹性自适应折行、控制器及滚动视口挂载。
     *
     * @param elData 面板容器配置对象
     * @param containerW 可选容器基准宽度
     * @param containerH 可选容器基准高度
     * @param userClass
     * @returns 实例化的 GComponent 对象
     */
    public static createPanel<T extends fgui.GComponent>(
        elData: IPanelConfig,
        containerW?: number,
        containerH?: number,
        userClass?: new () => T
    ): T {
        UIFactory.validateLayoutConfig(elData, elData.name || "panel");
        const node = UIFactory.createElement<T>(elData, containerW || 0, containerH || 0, userClass)!;
        if (elData.x !== undefined) node.x = elData.x;
        if (elData.y !== undefined) node.y = elData.y;
        return node;
    }

    /**
     * 为组件反射装配滚动面板 (fgui.ScrollPane)
     *
     * 在去 FairyGUI 编辑器资源包依赖的纯代码环境下，对齐官方内部逻辑为容器挂载滚动视口。
     *
     * @param owner 宿主组件
     * @param scrollType 滚动方向 (0-横向, 1-纵向, 2-双向)
     * @param touchEnabled 是否支持触控拖拽滚动
     * @returns 实例化的 ScrollPane 对象
     */
    public static createScrollPanel(owner: fgui.GComponent, scrollType: fgui.ScrollType, touchEnabled: boolean = true): fgui.ScrollPane {
        const scrollPane = new fgui.ScrollPane(owner);
        scrollPane["_scrollType"] = scrollType;
        scrollPane["_maskContainer"].scrollRect = new Laya.Rectangle();
        scrollPane.touchEffect = touchEnabled;
        scrollPane.mouseWheelEnabled = touchEnabled;
        scrollPane.bouncebackEffect = true;
        scrollPane.setSize(owner.width, owner.height);
        return scrollPane;
    }

    /**
     * 声明式创建 FGUI 页面状态机控制器 (fgui.Controller)
     *
     * 支持页面定义（pages）、切页动作链（actions，如自动播放动效 PlayTransitionAction）及初始页面定位。
     *
     * @param config 控制器配置对象
     * @param owner 可选挂载宿主容器
     * @returns 实例化的 fgui.Controller 对象
     */
    public static createController(config: IControllerConfig, owner?: fgui.GComponent): fgui.Controller {
        const ctrl = new fgui.Controller();
        if (config.name) ctrl.name = config.name;

        // 1. 映射单选组层级自适应 (对齐 Controller.setup 第 366~367 行)
        if (config.autoRadioGroupDepth !== undefined) {
            ctrl.autoRadioGroupDepth = config.autoRadioGroupDepth;
        }

        // 2. 映射页面 ID 与 Name 成对模型 (对齐 Controller.setup 第 371~375 行)
        if (config.pageDefs && Array.isArray(config.pageDefs)) {
            for (const def of config.pageDefs) {
                if (def.id) {
                    ctrl["_pageIds"].push(def.id);
                    ctrl["_pageNames"].push(def.name);
                } else {
                    ctrl.addPage(def.name);
                }
            }
        } else if (config.pages && Array.isArray(config.pages)) {
            const hasCustomIds = config.pageIds && Array.isArray(config.pageIds) && config.pageIds.length === config.pages.length;
            if (hasCustomIds) {
                for (let i = 0; i < config.pages.length; i++) {
                    ctrl["_pageIds"].push(config.pageIds![i]);
                    ctrl["_pageNames"].push(config.pages[i]);
                }
            } else {
                for (const p of config.pages) {
                    ctrl.addPage(p);
                }
            }
        }

        // 3. 映射切页动作链 actions (PlayTransitionAction 等)
        if (config.actions && Array.isArray(config.actions)) {
            if (!ctrl["_actions"]) ctrl["_actions"] = [];
            for (const actConf of config.actions) {
                if (actConf.type === "playTransition" && fgui.PlayTransitionAction) {
                    const action = new fgui.PlayTransitionAction();
                    action.transitionName = actConf.transitionName;
                    action.playTimes = actConf.playTimes !== undefined ? actConf.playTimes : 1;
                    action.delay = actConf.delay || 0;
                    action.stopOnExit = !!actConf.stopOnExit;
                    if (actConf.fromPage && Array.isArray(actConf.fromPage)) {
                        action.fromPage = actConf.fromPage.map(p => {
                            const pid = ctrl.getPageIdByName(p);
                            return pid ? pid : p;
                        });
                    }
                    if (actConf.toPage && Array.isArray(actConf.toPage)) {
                        action.toPage = actConf.toPage.map(p => {
                            const pid = ctrl.getPageIdByName(p);
                            return pid ? pid : p;
                        });
                    }
                    ctrl["_actions"].push(action);
                }
            }
        }

        // 4. 映射状态变更事件监听
        if (typeof config.onChanged === "function") {
            ctrl.on(fgui.Events.STATE_CHANGED, ctrl, () => {
                config.onChanged!(ctrl);
            });
        }

        if (owner) {
            owner.addController(ctrl);
        }

        // 5. 初始选中定位（对齐 Controller.setup 第 409~412 行）：
        // 严格遵循官方二进制时序：在此阶段仅静默记录 _selectedIndex，绝不提前派发广播！
        // 待容器的所有子元件、关联与齿轮全部装配完成后，由 panelNode.applyAllControllers() 统一广播！
        let homePageIndex = 0;
        if (config.selectedIndex !== undefined) {
            homePageIndex = config.selectedIndex;
        } else if (config.selectedPageId && ctrl["_pageIds"].indexOf(config.selectedPageId) !== -1) {
            homePageIndex = ctrl["_pageIds"].indexOf(config.selectedPageId);
        } else if (config.selectedPage && ctrl["_pageNames"].indexOf(config.selectedPage) !== -1) {
            homePageIndex = ctrl["_pageNames"].indexOf(config.selectedPage);
        }

        if (ctrl.pageCount > 0) {
            ctrl["_selectedIndex"] = (homePageIndex >= 0 && homePageIndex < ctrl.pageCount) ? homePageIndex : 0;
        } else {
            ctrl["_selectedIndex"] = -1;
        }

        return ctrl;
    }

    /**
     * 声明式创建组件过渡动效 (fgui.Transition)
     *
     * @param config 动效配置对象（包含动效名、自动播放、补间动作序列等）
     * @param owner 宿主组件
     * @returns 实例化的 fgui.Transition 对象
     */
    public static createTransition(config: ITransitionConfig, owner: fgui.GComponent): fgui.Transition {
        return UIFactoryTransitions.createTransition(config, owner);
    }

    /**
     * 将动作类型字符串或数字映射为 FGUI Transition 内部 ActionType 枚举数字
     *
     * @param type 动效类型（如 "xy"、"size"、"scale"、"alpha"、"shake" 等）
     * @returns 内部数字类型码 (0~16)
     */
    public static mapActionType(type: TransitionActionType | number): number {
        return UIFactoryTransitions.mapActionType(type);
    }

    /**
     * 将外部易读的参数对象注入到 FGUI TransitionValue 内部物理结构中
     *
     * @param actionType 内部动作类型码
     * @param source 外部易读参数对象
     * @param target FGUI 内部目标 TransitionValue 对象
     */
    public static fillTransitionValue(actionType: number, source: unknown, target: ITransitionTargetValue): void {
        UIFactoryTransitions.fillTransitionValue(actionType, source, target);
    }

    /**
     * 执行单元素物理定位与排版计算
     *
     * 涵盖两遍测量、绝对坐标、百分比换算、Flexbox 流式累计与缩放防漂移校准。
     *
     * @param node 待排版的目标元件
     * @param elData 声明式元素配置
     * @param containerW 父容器可用宽度
     * @param containerH 父容器可用高度
     * @param parentData 父容器完整配置
     * @param flowState 流式排版上下文累计状态
     * @returns 包含计算后 targetX、targetY 及真实占位尺寸 elW、elH 的排版结果
     */
    public static setupElementPosition(
        node: fgui.GObject,
        elData: IElementConfig,
        containerW: number,
        containerH: number,
        parentData?: IBaseElementConfig & IViewConfig,
        flowState?: IFlowLayoutState
    ): { targetX: number; targetY: number; elW: number; elH: number; } {
        return UIFactoryLayout.setupElementPosition(node, elData, containerW, containerH, parentData, flowState);
    }

    /**
     * 为子组件装配 0~9 大 FGUI 原生 Gear 状态机
     *
     * 严格遵循官方 setup_afterAdd 阶段的 gear.setup 规范，仅绑定直接父级控制器。
     *
     * @param childNode 受控子元件
     * @param childData 子元件声明式配置
     * @param panelNode 父级宿主容器
     * @param index 子元件所在索引
     */
    public static setupElementGears(childNode: fgui.GObject, childData: IElementConfig, panelNode: fgui.GComponent, index: number): void {
        UIFactoryGears.setupElementGears(childNode, childData, panelNode, index);
    }

    /**
     * 模拟官方 constructExtension 阶段，装配复合扩展组件内部元件
     *
     * 自动映射 GButton 的 title/icon、GProgressBar 的 bar/title、GSlider 的 bar/grip 及联动关系。
     *
     * @param panelNode 扩展宿主组件
     * @param elData 视图与基础配置
     */
    public static setupComponentExtension(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        UIFactoryExtensions.setupComponentExtension(panelNode, elData);
    }

    /**
     * 向显示对象应用底层矢量绘图指令集 (Laya.Graphics)
     *
     * @param node 目标显示对象
     * @param graphicsConfig 矢量绘图指令配置数组
     */
    public static applyGraphics(node: fgui.GObject, graphicsConfig: IGraphicsCmdConfig[]): void {
        if (!graphicsConfig || !Array.isArray(graphicsConfig) || !node || !node.displayObject) return;
        const g = node.displayObject.graphics as unknown as Record<string, Function>;
        if (!g) return;
        for (const item of graphicsConfig) {
            if (!item || typeof item !== "object") continue;
            const cmd = item.cmd;
            const args = [...(item.args || [])];
            if ((cmd === "loadImage" || cmd === "drawImage") && typeof args[0] === "string") {
                args[0] = UIFactory.formatResUrl(args[0]);
            }
            if (typeof g[cmd] === "function") {
                g[cmd](...args);
            } else {
                console.warn(`[UIFactory] Laya.Graphics does not support command: ${cmd}`);
            }
        }
    }

    /**
     * FGUI 官方五阶段标准初始管线协调器 (fillPanel)
     *
     * 核心时序：
     * 1. 视口与尺寸初始化：设置 sourceWidth/Height，解析 overflow 与 scrollType（滚动容器挂载）；
     * 2. 控制器装配：遍历并挂载当前容器所有的 Controller 页面状态机；
     * 3. 【官方 Phase 1: setup_beforeAdd 离散化构建】：实例化子元件并开启 `_underConstruct = true` 锁；
     * 4. 两遍测量排版引擎：第一遍主轴与交叉轴虚拟推演容器自适应尺寸，第二遍通过 `addChild` 确立层级树；
     * 5. 【官方 Phase 2: 排版定位】：计算子元件 targetX、targetY，处理 Flexbox 流式与换行；
     * 6. 【官方 Phase 2.5: setupRelations 独立关系装配】：在所有子元件完成定位后统一建立 RelationType 跟随；
     * 7. 【官方 Phase 3: setup_afterAdd 统一内容注入】：灌入真实内容 text/url、装配 Gears 并解除构建锁；
     * 8. 【官方 Phase 4: constructExtension 扩展装配】：模拟官方扩展组件映射（GButton、GProgressBar、GSlider 等）；
     * 9. 【官方 Phase 5: finalize 终态激活】：解除 `_buildingDisplayList` 锁，应用控制器并提交显示树。
     *
     * @param panelNode 待填充初始化的目标 GComponent 容器
     * @param elData 声明式容器配置（包含 elements、controllers、layoutType、padding、background 等）
     */
    public static fillPanel(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        UIFactoryPanelBuilder.fillPanel(panelNode, elData);
    }
}
