import { IElementConfig } from "./IElementConfig";
import { IGraphConfig } from "./IGraphConfig";
import { IIconConfig } from "./IIconConfig";
import { ITextConfig } from "./ITextConfig";
import { IButtonConfig } from "./IButtonConfig";
import { IListConfig } from "./IListConfig";
import { IControllerConfig } from "./IControllerConfig";
import { UIFactoryTransitions } from "./UIFactoryTransitions";
import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";
import { UIFactoryGears } from "./UIFactoryGears";
import { UIFactoryLayout } from "./UIFactoryLayout";
import { UIFactoryExtensions } from "./UIFactoryExtensions";
import { UIFactoryPipeline } from "./UIFactoryPipeline";
import { IGraphicsCmdConfig } from "./IGraphicsCmdConfig";
import { ITransitionConfig, TransitionActionType } from "./ITransitionConfig";
import { IPanelConfig } from "./IPanelConfig";
import { ISliderConfig } from "./ISliderConfig";
import { IProgressBarConfig } from "./IProgressBarConfig";

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
export type ElementCreator<T extends IElementConfig = IElementConfig, R extends fgui.GObject = fgui.GObject> =
    (elData: T, containerW: number, containerH: number) => R;

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
    public static customCreators: Record<string, ElementCreator<any, any>> = {};

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
     * @returns 实例化的 FGUI 对象，类型不匹配或未知时返回 null
     */
    public static createElement<T extends fgui.GObject = fgui.GObject>(
        elData: IElementConfig,
        containerW: number,
        containerH: number
    ): Nullable<T> {
        let node: Nullable<fgui.GObject> = null;

        if (UIFactory.customCreators[elData.type]) {
            node = UIFactory.customCreators[elData.type](elData, containerW, containerH);
        } else {
            // 严格对齐官方步骤：纯实例化阶段，不提前灌入 text / url
            node = UIFactoryPipeline.instantiateNode(elData);
            if (node) {
                // 统一分流前置赋值 (setup_beforeAdd)
                UIFactoryPipeline.setup_beforeAdd(node, elData);

                // 若为复合容器类型，级联构建内部
                if (elData.type === "panel" && (node instanceof fgui.GComponent)) {
                    UIFactory.fillPanel(node, elData as IPanelConfig);
                } else if (elData.type === "button" && (node instanceof fgui.GButton)) {
                    UIFactory.fillPanel(node, elData as IButtonConfig);
                } else if (elData.type === "slider" && (node instanceof fgui.GSlider)) {
                    UIFactory.fillPanel(node, elData as ISliderConfig);
                } else if (elData.type === "progressbar" && (node instanceof fgui.GProgressBar)) {
                    UIFactory.fillPanel(node, elData as IProgressBarConfig);
                } else if (elData.type === "list" && (node instanceof fgui.GList)) {
                    const lConf = elData as IListConfig;
                    if (lConf.defaultItem) node.defaultItem = lConf.defaultItem;
                    if (lConf.listLayout) node.layout = fgui.ListLayoutType[lConf.listLayout];
                    if (lConf.lineGap !== undefined) node.lineGap = lConf.lineGap;
                    if (lConf.columnGap !== undefined) node.columnGap = lConf.columnGap;
                    if (lConf.autoResizeItem !== undefined) node.autoResizeItem = lConf.autoResizeItem;
                    UIFactory.fillPanel(node, lConf);
                }
            }
        }

        if (node && elData.graphics) {
            UIFactory.applyGraphics(node, elData.graphics);
        }

        return node as Nullable<T>;
    }

    /**
     * 创建纯文本组件 (fgui.GBasicTextField)
     *
     * @param elData 文本声明式配置
     * @returns 实例化的 GBasicTextField 对象
     */
    public static createText(elData: ITextConfig): fgui.GTextField {
        return UIFactory.createElement<fgui.GTextField>(elData, 0, 0)!;
    }

    /**
     * 创建 UBB 富文本组件 (fgui.GRichTextField)
     *
     * @param elData 富文本声明式配置
     * @returns 实例化的 GRichTextField 对象
     */
    public static createRichTextField(elData: ITextConfig): fgui.GRichTextField {
        return UIFactory.createElement<fgui.GRichTextField>({ ...elData, isUbb: true }, 0, 0)!;
    }

    /**
     * 创建交互式文本输入框 (fgui.GTextInput)
     *
     * @param elData 输入框声明式配置
     * @returns 实例化的 GTextInput 对象
     */
    public static createTextInput(elData: ITextConfig): fgui.GTextInput {
        return UIFactory.createElement<fgui.GTextInput>({ ...elData, isInput: true }, 0, 0)!;
    }

    /**
     * 创建图像与装载器组件 (fgui.GLoader)
     *
     * @param elData 图像配置对象
     * @returns 实例化的 GLoader 对象
     */
    public static createIcon(elData: IIconConfig): fgui.GLoader {
        return UIFactory.createElement<fgui.GLoader>(elData, 0, 0)!;
    }

    /**
     * 创建矢量图形组件 (fgui.GGraph)
     *
     * @param elData 图形配置对象（支持矩形、圆角矩形、圆、椭圆等）
     * @returns 实例化的 GGraph 对象
     */
    public static createGraph(elData: IGraphConfig): fgui.GGraph {
        return UIFactory.createElement<fgui.GGraph>(elData, 0, 0)!;
    }

    /**
     * 创建列表组件 (fgui.GList / PureList)
     *
     * @param elData 列表配置对象
     * @param containerW 父容器宽度
     * @param containerH 父容器高度
     * @returns 实例化的列表对象
     */
    public static createList(elData: IListConfig, containerW: number, containerH: number): fgui.GList {
        return UIFactory.createElement<fgui.GList>(elData, containerW, containerH)!;
    }

    /**
     * 创建按钮组件 (fgui.GButton)
     *
     * 支持普通按钮、多选复选框（Check）及单选按钮（Radio）模式。
     *
     * @param elData 按钮配置对象
     * @returns 实例化的 GButton 对象
     */
    public static createButton(elData: IButtonConfig): fgui.GButton {
        return UIFactory.createElement<fgui.GButton>(elData, 0, 0)!;
    }

    /**
     * 创建容器面板 (EPanel / fgui.GComponent)
     *
     * 支持绝对定位、单向流式排版、Flexbox 弹性自适应折行、控制器及滚动视口挂载。
     *
     * @param elData 面板容器配置对象
     * @param containerW 可选容器基准宽度
     * @param containerH 可选容器基准高度
     * @returns 实例化的 GComponent 对象
     */
    public static createPanel(elData: IPanelConfig, containerW?: number, containerH?: number): fgui.GComponent {
        const node = UIFactory.createElement<fgui.GComponent>(elData, containerW || 0, containerH || 0)!;
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

        if (config.pages && Array.isArray(config.pages)) {
            for (const p of config.pages) {
                ctrl.addPage(p);
            }
        }

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

        if (owner) {
            owner.addController(ctrl);
        }

        const targetIndex = config.selectedIndex !== undefined ? config.selectedIndex :
            (config.selectedPage ? ctrl["_pageNames"].indexOf(config.selectedPage) : 0);
        const safeIndex = targetIndex >= 0 ? targetIndex : 0;

        if (ctrl.parent) {
            ctrl.selectedIndex = safeIndex;
        } else {
            ctrl["_selectedIndex"] = safeIndex;
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
    public static fillTransitionValue(actionType: number, source: any, target: any): void {
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
        flowState?: any
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
                console.warn(`Laya.Graphics 不支持方法: ${cmd}`);
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
        panelNode["_buildingDisplayList"] = true;

        let initW = elData.width || panelNode.width || 0;
        let initH = elData.height || panelNode.height || 0;

        panelNode.sourceWidth = initW;
        panelNode.sourceHeight = initH;
        panelNode.initWidth = initW;
        panelNode.initHeight = initH;
        panelNode.setSize(initW, initH);

        let overflowVal: any = elData.overflow;
        if (typeof overflowVal === "string") {
            const key = (overflowVal.charAt(0).toUpperCase() + overflowVal.slice(1).toLowerCase()) as keyof typeof fgui.OverflowType;
            overflowVal = fgui.OverflowType[key] ?? overflowVal;
        }
        if (overflowVal === fgui.OverflowType.Scroll) {
            if (elData.padding) {
                panelNode.margin.top = elData.padding.top ?? 0;
                panelNode.margin.bottom = elData.padding.bottom ?? 0;
                panelNode.margin.left = elData.padding.left ?? 0;
                panelNode.margin.right = elData.padding.right ?? 0;
            }
            panelNode.setupScrollPanel(overflowVal, elData.scrollType);
        }

        if (elData.controllers && elData.controllers.length > 0) {
            for (const ctrlData of elData.controllers) {
                UIFactory.createController(ctrlData, panelNode);
            }
        }

        const childElements = elData.elements || [];
        let panelMaxHeight = elData.height || 0;
        let panelMaxWidth = elData.width || 0;

        const isVerticalFlow = elData.layoutType === "vertical";
        const isHorizontalFlow = elData.layoutType === "horizontal";

        const padTop = elData.padding?.top ?? 0;
        const padBottom = elData.padding?.bottom ?? 0;
        const padLeft = elData.padding?.left ?? 0;
        const padRight = elData.padding?.right ?? 0;

        const childNodes: Nullable<fgui.GObject>[] = [];
        let totalH = 0;
        let totalW = 0;
        let maxChildH = 0;
        let maxChildW = 0;
        let flowChildCount = 0;

        let wrapCurrentX = padLeft;
        let wrapCurrentRowMaxH = 0;
        let wrapTotalH = 0;
        let wrapHasItemInRow = false;
        const maxLineWidth = (initW > 0 ? initW : 0) - padRight;

        // =========================================================================
        // 【官方 Phase 1: setup_beforeAdd 离散化构建】
        // 严格锁定 _underConstruct = true，在排版与齿轮未就绪前杜绝任何误触
        // =========================================================================
        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = UIFactory.createElement<fgui.GObject>(childData, childData.width || 0, childData.height || 0);
            if (childNode) {
                // 官方生命周期保护：进入构建保护期
                childNode["_underConstruct"] = true;
                childNodes.push(childNode);
                const childIsAbsolute = childData.position === "absolute";
                if (!childIsAbsolute) {
                    flowChildCount++;
                    const layout = childData.layout || {};
                    const scaleY = childNode.scaleY !== undefined ? Math.abs(childNode.scaleY) : 1;
                    const scaleX = childNode.scaleX !== undefined ? Math.abs(childNode.scaleX) : 1;
                    const elH = childNode.height * scaleY;
                    const elW = childNode.width * scaleX;

                    if (isVerticalFlow) {
                        const offsetY = layout.offsetY || 0;
                        const gapValue = (i > 0 && elData.gap !== undefined) ? elData.gap : 0;
                        totalH += offsetY + gapValue + elH;
                    } else if (isHorizontalFlow && !elData.flexWrap) {
                        const offsetX = layout.offsetX || 0;
                        const gapValue = (i > 0 && elData.gap !== undefined) ? elData.gap : 0;
                        totalW += offsetX + gapValue + elW;
                    } else if (isHorizontalFlow && elData.flexWrap) {
                        const offsetX = layout.offsetX || 0;
                        const offsetY = layout.offsetY || 0;
                        const gapValue = (wrapHasItemInRow && elData.gap !== undefined) ? elData.gap : 0;
                        const projectedX = wrapCurrentX + offsetX + gapValue + elW;
                        const currentItemH = offsetY + elH;

                        if (wrapHasItemInRow && projectedX > maxLineWidth && maxLineWidth > padLeft) {
                            const rowGap = elData.gap ?? 0;
                            wrapTotalH += wrapCurrentRowMaxH + rowGap;
                            wrapCurrentRowMaxH = currentItemH;
                            wrapCurrentX = padLeft + offsetX + elW;
                        } else {
                            wrapCurrentX = wrapCurrentX + offsetX + gapValue + elW;
                            if (currentItemH > wrapCurrentRowMaxH) {
                                wrapCurrentRowMaxH = currentItemH;
                            }
                            wrapHasItemInRow = true;
                        }
                    }

                    if (elH > maxChildH) maxChildH = elH;
                    if (elW > maxChildW) maxChildW = elW;
                }
            } else {
                childNodes.push(null);
            }
        }

        if (wrapHasItemInRow) {
            wrapTotalH += wrapCurrentRowMaxH;
        }

        if (!elData.height) {
            if (isVerticalFlow && totalH > 0) {
                initH = totalH + padTop + padBottom;
            } else if (isHorizontalFlow && elData.flexWrap && wrapTotalH > 0) {
                initH = wrapTotalH + padTop + padBottom;
            } else if (isHorizontalFlow && maxChildH > 0) {
                initH = maxChildH + padTop + padBottom;
            }
        }
        if (!elData.width) {
            if (isHorizontalFlow && !elData.flexWrap && totalW > 0) {
                initW = totalW + padLeft + padRight;
            } else if (isVerticalFlow && maxChildW > 0) {
                initW = maxChildW + padLeft + padRight;
            }
        }

        panelNode.sourceWidth = initW;
        panelNode.sourceHeight = initH;
        panelNode.initWidth = initW;
        panelNode.initHeight = initH;
        panelNode.setSize(initW, initH);

        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            if (childNode) {
                panelNode.addChild(childNode);
            }
        }

        let startOffsetY = 0;
        let startOffsetX = 0;
        const justifyContent = elData.justifyContent;
        let perGapSpaceX = 0;
        let perGapSpaceY = 0;
        if (justifyContent && justifyContent !== "flex-start") {
            if (isVerticalFlow && initH > 0) {
                const availableH = initH - padTop - padBottom;
                const freeSpaceH = availableH - totalH;
                if (freeSpaceH > 0) {
                    if (justifyContent === "center") startOffsetY = freeSpaceH / 2;
                    else if (justifyContent === "flex-end") startOffsetY = freeSpaceH;
                    else if (justifyContent === "space-between" && flowChildCount > 1) perGapSpaceY = freeSpaceH / (flowChildCount - 1);
                    else if (justifyContent === "space-around" && flowChildCount > 0) {
                        const unit = freeSpaceH / flowChildCount;
                        startOffsetY = unit / 2;
                        perGapSpaceY = unit;
                    }
                }
            } else if (isHorizontalFlow && !elData.flexWrap && initW > 0) {
                const availableW = initW - padLeft - padRight;
                const freeSpaceW = availableW - totalW;
                if (freeSpaceW > 0) {
                    if (justifyContent === "center") startOffsetX = freeSpaceW / 2;
                    else if (justifyContent === "flex-end") startOffsetX = freeSpaceW;
                    else if (justifyContent === "space-between" && flowChildCount > 1) perGapSpaceX = freeSpaceW / (flowChildCount - 1);
                    else if (justifyContent === "space-around" && flowChildCount > 0) {
                        const unit = freeSpaceW / flowChildCount;
                        startOffsetX = unit / 2;
                        perGapSpaceX = unit;
                    }
                }
            }
        }

        const flowState = {
            accumulatedX: padLeft + startOffsetX,
            accumulatedY: padTop + startOffsetY,
            perGapSpaceX,
            perGapSpaceY,
            lastNode: null as Nullable<fgui.GObject>,
            currentRowMaxHeight: 0,
            index: 0
        };

        let minChildY = Infinity;
        let minChildX = Infinity;

        // =========================================================================
        // 【官方 Phase 2: 排版定位】
        // =========================================================================
        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = childNodes[i];
            if (childNode) {
                flowState.index = i;
                const posInfo = UIFactory.setupElementPosition(childNode, childData, initW, initH, elData, flowState);
                flowState.lastNode = childNode;

                const actualBottom = posInfo.targetY + posInfo.elH;
                const actualRight = posInfo.targetX + posInfo.elW;
                if (actualBottom > panelMaxHeight) panelMaxHeight = actualBottom;
                if (actualRight > panelMaxWidth) panelMaxWidth = actualRight;
                if (childNode.y < minChildY) minChildY = childNode.y;
                if (childNode.x < minChildX) minChildX = childNode.x;
            }
        }

        // =========================================================================
        // 【官方 Phase 2.5: setupRelations 独立关系装配】
        // 对齐官方 constructFromResource2 (第 3402~3408 行)：
        // 必须在所有子元件完成 addChild 与初始坐标/尺寸定位后，再统一建立 Relations，
        // 确保无论关联目标在 elements 数组中的先后顺序如何，都能获取到目标准确的初始坐标与宽高！
        // =========================================================================
        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = childNodes[i];
            if (childNode) {
                const layout = childData.layout || {};
                const alignX = layout.alignX;
                const alignY = layout.alignY;
                const isFlexWrapFlow = isHorizontalFlow && elData.flexWrap && childData.position !== "absolute";

                if (layout.leftPercent !== undefined || alignX === "center" || alignX === "right") {
                    let relTypeX = fgui.RelationType.Left_Left;
                    if (alignX === "center") relTypeX = fgui.RelationType.Center_Center;
                    else if (alignX === "right") relTypeX = fgui.RelationType.Right_Right;
                    childNode.addRelation(panelNode, relTypeX);
                }

                if (!isFlexWrapFlow) {
                    if (layout.topPercent !== undefined || alignY === "middle" || alignY === "bottom") {
                        let relTypeY = fgui.RelationType.Top_Top;
                        if (alignY === "middle") relTypeY = fgui.RelationType.Middle_Middle;
                        else if (alignY === "bottom") relTypeY = fgui.RelationType.Bottom_Bottom;
                        childNode.addRelation(panelNode, relTypeY);
                    }
                }

                // 显式声明的官方关联系统绑定 (Relations)
                if (childData.relations && Array.isArray(childData.relations)) {
                    for (const r of childData.relations) {
                        let targetNode: Nullable<fgui.GObject> = panelNode;
                        if (r.target && r.target !== "parent") {
                            targetNode = panelNode.getChild(r.target);
                        }
                        if (targetNode) {
                            let relType = r.type;
                            if (typeof relType === "string") {
                                const relKey = relType as keyof typeof fgui.RelationType;
                                relType = fgui.RelationType[relKey] !== undefined ? fgui.RelationType[relKey] : relType;
                            }
                            childNode.addRelation(targetNode, relType as number, r.usePercent || false);
                        } else {
                            console.warn(`[UIFactory] 组件 "${childNode.name}" 找不到关联目标 "${r.target}"`);
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 【官方 Phase 3: setup_afterAdd 统一分流内容注入与齿轮装配】
        // 集中在 UIFactoryPipeline.setup_afterAdd 中，灌入真实内容 text/url 并解除构建锁
        // =========================================================================
        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = childNodes[i];
            if (childNode) {
                UIFactoryPipeline.setup_afterAdd(childNode, childData, panelNode, i, UIFactory.setupElementGears);
            }
        }

        if (!isVerticalFlow && !elData.height && minChildY < Infinity && minChildY > 0) {
            panelMaxHeight += minChildY;
        }
        const finalMaxHeight = panelMaxHeight + panelNode.margin.top + panelNode.margin.bottom;
        // 自动撑高容器高度：当子元件实际撑开的内容高度超出显式声明的高度时，必须自动撑大容器高度；若显式声明了滚动容器，则保持固定视口高度由 scrollPane 处理滚动
        if (finalMaxHeight > panelNode.height && (!elData.height || !panelNode.scrollPane)) {
            panelNode.height = finalMaxHeight;
        }

        if (!isHorizontalFlow && !elData.width && minChildX < Infinity && minChildX > 0) {
            panelMaxWidth += minChildX;
        }
        const finalMaxWidth = panelMaxWidth + panelNode.margin.left + panelNode.margin.right;
        if (finalMaxWidth > panelNode.width && !elData.width) {
            panelNode.width = finalMaxWidth;
        }

        if (elData.background) {
            panelNode.drawBackground(elData.background);
        }

        if (elData.transitions && elData.transitions.length > 0) {
            for (const transData of elData.transitions) {
                UIFactory.createTransition(transData, panelNode);
            }
        }

        // =========================================================================
        // 【官方 Phase 5: finalize 闭环终态激活】
        // 按照官方 GComponent 顺序：
        // 1. applyAllControllers()
        // 2. 解除构建与显示列表锁 (_buildingDisplayList = false, _underConstruct = false)
        // 3. buildNativeDisplayList() 提交显示树
        // 4. setBoundsChangedFlag() 刷新包围盒
        // 5. constructExtension (高级扩展组件装配，对齐 GComponent 第 3462 行)
        // =========================================================================
        if (typeof panelNode.applyAllControllers === "function") {
            panelNode.applyAllControllers();
        }

        panelNode["_buildingDisplayList"] = false;
        panelNode["_underConstruct"] = false;

        if (typeof panelNode["buildNativeDisplayList"] === "function") {
            panelNode["buildNativeDisplayList"]();
        }

        if (typeof panelNode.setBoundsChangedFlag === "function") {
            panelNode.setBoundsChangedFlag();
        }

        // Phase 4: 高级组件扩展类装配（官方在 buildNativeDisplayList 之后执行）
        UIFactory.setupComponentExtension(panelNode, elData);
    }
}
