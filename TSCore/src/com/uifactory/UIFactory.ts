import { IElementConfig } from "./IElementConfig";
import { IGraphConfig } from "./IGraphConfig";
import { IIconConfig } from "./IIconConfig";
import { ITextConfig } from "./ITextConfig";
import {IButtonConfig} from "./IButtonConfig";
import {IListConfig} from "./IListConfig";
import {PureList} from "./PureList";
import {IControllerConfig} from "./IControllerConfig";
import { UIFactoryTransitions } from "./UIFactoryTransitions";
import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";
import { UIFactoryGears } from "./UIFactoryGears";
import {UIFactoryLayout} from "./UIFactoryLayout";
import {UIFactoryExtensions} from "./UIFactoryExtensions";
import {UIFactoryPipeline} from "./UIFactoryPipeline";
import { IGraphicsCmdConfig } from "./IGraphicsCmdConfig";
import {ITransitionConfig, TransitionActionType } from "./ITransitionConfig";
import { IPanelConfig } from "./IPanelConfig";
import { EPanel } from "./EPanel";

export type ElementCreator<T extends IElementConfig = IElementConfig, R extends fgui.GObject = fgui.GObject> =
    (elData: T, containerW: number, containerH: number) => R;

export class UIFactory {

    public static resBasePath: string = "";
    public static customCreators: Record<string, ElementCreator<any, any>> = {};

    public static formatResUrl(url: string): string {
        if (url && UIFactory.resBasePath && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith(UIFactory.resBasePath)) {
            return UIFactory.resBasePath + url;
        }
        return url;
    }

    public static registerCreator<T extends IElementConfig, R extends fgui.GObject>(
        type: string,
        creator: ElementCreator<T, R>
    ): void {
        UIFactory.customCreators[type] = creator;
    }

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

    public static createText(elData: ITextConfig): fgui.GTextField {
        return UIFactory.createElement<fgui.GTextField>(elData, 0, 0)!;
    }

    public static createRichTextField(elData: ITextConfig): fgui.GRichTextField {
        return UIFactory.createElement<fgui.GRichTextField>({ ...elData, isUbb: true }, 0, 0)!;
    }

    public static createTextInput(elData: ITextConfig): fgui.GTextInput {
        return UIFactory.createElement<fgui.GTextInput>({ ...elData, isInput: true }, 0, 0)!;
    }

    public static createIcon(elData: IIconConfig): fgui.GLoader {
        return UIFactory.createElement<fgui.GLoader>(elData, 0, 0)!;
    }

    public static createGraph(elData: IGraphConfig): fgui.GGraph {
        return UIFactory.createElement<fgui.GGraph>(elData, 0, 0)!;
    }

    public static createList(elData: IListConfig, containerW: number, containerH: number): fgui.GList {
        return UIFactory.createElement<fgui.GList>(elData, containerW, containerH)!;
    }

    public static createButton(elData: IButtonConfig): fgui.GButton {
        return UIFactory.createElement<fgui.GButton>(elData, 0, 0)!;
    }

    public static createPanel(elData: IPanelConfig, containerW?: number, containerH?: number): fgui.GComponent {
        const node = UIFactory.createElement<fgui.GComponent>(elData, containerW || 0, containerH || 0)!;
        if (elData.x !== undefined) node.x = elData.x;
        if (elData.y !== undefined) node.y = elData.y;
        return node;
    }

    public static createScrollPanel(owner: fgui.GComponent, scrollType: fgui.ScrollType, touchEnabled: boolean = true): fgui.ScrollPane {
        const scrollPane = new fgui.ScrollPane(owner);
        const internal = scrollPane as unknown as {
            _scrollType: fgui.ScrollType;
            _maskContainer: { scrollRect: Laya.Rectangle | null };
        };
        internal._scrollType = scrollType;
        internal._maskContainer.scrollRect = new Laya.Rectangle();
        scrollPane.touchEffect = touchEnabled;
        scrollPane.mouseWheelEnabled = touchEnabled;
        scrollPane.bouncebackEffect = true;
        scrollPane.setSize(owner.width, owner.height);
        return scrollPane;
    }

    public static createController(config: IControllerConfig, owner?: fgui.GComponent): fgui.Controller {
        const ctrl = new fgui.Controller();
        if (config.name) ctrl.name = config.name;

        if (config.pages && Array.isArray(config.pages)) {
            for (const p of config.pages) {
                ctrl.addPage(p);
            }
        }

        if (config.actions && Array.isArray(config.actions)) {
            const rawCtrl = ctrl as any;
            if (!rawCtrl._actions) rawCtrl._actions = [];
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
                    rawCtrl._actions.push(action);
                }
            }
        }

        if (owner) {
            owner.addController(ctrl);
        }

        const targetIndex = config.selectedIndex !== undefined ? config.selectedIndex :
            (config.selectedPage ? (ctrl as any)._pageNames.indexOf(config.selectedPage) : 0);
        const safeIndex = targetIndex >= 0 ? targetIndex : 0;

        if (ctrl.parent) {
            ctrl.selectedIndex = safeIndex;
        } else {
            (ctrl as any)._selectedIndex = safeIndex;
        }

        return ctrl;
    }

    public static createTransition(config: ITransitionConfig, owner: fgui.GComponent): fgui.Transition {
        return UIFactoryTransitions.createTransition(config, owner);
    }

    public static mapActionType(type: TransitionActionType | number): number {
        return UIFactoryTransitions.mapActionType(type);
    }

    public static fillTransitionValue(actionType: number, source: any, target: any): void {
        UIFactoryTransitions.fillTransitionValue(actionType, source, target);
    }

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

    public static setupElementGears(childNode: fgui.GObject, childData: IElementConfig, panelNode: fgui.GComponent, index: number): void {
        UIFactoryGears.setupElementGears(childNode, childData, panelNode, index);
    }

    public static setupComponentExtension(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        UIFactoryExtensions.setupComponentExtension(panelNode, elData);
    }

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
     * FGUI 官方五阶段标准初始管线协调器
     */
    public static fillPanel(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        const rawPanel = panelNode as any;
        rawPanel["_buildingDisplayList"] = true;

        let initW = elData.width || panelNode.width || 0;
        let initH = elData.height || panelNode.height || 0;

        panelNode.sourceWidth = initW;
        panelNode.sourceHeight = initH;
        panelNode.initWidth = initW;
        panelNode.initHeight = initH;
        panelNode.setSize(initW, initH);

        if (elData.padding) {
            panelNode.margin.top = elData.padding.top ?? 0;
            panelNode.margin.bottom = elData.padding.bottom ?? 0;
            panelNode.margin.left = elData.padding.left ?? 0;
            panelNode.margin.right = elData.padding.right ?? 0;
        }

        let overflowVal: any = elData.overflow;
        if (typeof overflowVal === "string") {
            overflowVal = (fgui.OverflowType as any)[overflowVal.charAt(0).toUpperCase() + overflowVal.slice(1).toLowerCase()] ?? overflowVal;
        }
        panelNode.setupScrollPanel(overflowVal, elData.scrollType);

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
                (childNode as any)["_underConstruct"] = true;
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
        // 【官方 Phase 2: setupRelations 排版定位与关系装配】
        // =========================================================================
        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = childNodes[i];
            if (childNode) {
                flowState.index = i;
                const posInfo = UIFactory.setupElementPosition(childNode, childData, initW, initH, elData, flowState);
                flowState.lastNode = childNode;

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

                const actualBottom = posInfo.targetY + posInfo.elH;
                const actualRight = posInfo.targetX + posInfo.elW;
                if (actualBottom > panelMaxHeight) panelMaxHeight = actualBottom;
                if (actualRight > panelMaxWidth) panelMaxWidth = actualRight;
                if (childNode.y < minChildY) minChildY = childNode.y;
                if (childNode.x < minChildX) minChildX = childNode.x;
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

        const finalMaxHeight = panelMaxHeight + panelNode.margin.top + panelNode.margin.bottom;
        if (!isVerticalFlow && !elData.height && minChildY < Infinity && minChildY > 0) {
            panelMaxHeight + minChildY;
        }
        // 自动撑高容器高度：当子元件实际撑开的内容高度超出显式声明的高度时，必须自动撑大容器高度；若显式声明了滚动容器，则保持固定视口高度由 scrollPane 处理滚动
        if (finalMaxHeight > panelNode.height && (!elData.height || !panelNode.scrollPane)) {
            panelNode.height = finalMaxHeight;
        }

        const finalMaxWidth = panelMaxWidth + panelNode.margin.left + panelNode.margin.right;
        if (!isHorizontalFlow && !elData.width && minChildX < Infinity && minChildX > 0) {
            panelMaxWidth + minChildX;
        }
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
        // 【官方 Phase 4: constructExtension 高级组件扩展类装配】
        // =========================================================================
        UIFactory.setupComponentExtension(panelNode, elData);

        // =========================================================================
        // 【官方 Phase 5: finalize 闭环终态激活】
        // 按照官方 GComponent 顺序：解除显示列表构建锁 -> 运行控制器 -> 提交显示树
        // =========================================================================
        rawPanel["_buildingDisplayList"] = false;

        if (typeof (panelNode as any).applyAllControllers === "function") {
            (panelNode as any).applyAllControllers();
        }

        if (typeof rawPanel["buildNativeDisplayList"] === "function") {
            rawPanel["buildNativeDisplayList"]();
        }

        if (typeof rawPanel["setBoundsChangedFlag"] === "function") {
            rawPanel["setBoundsChangedFlag"]();
        }
    }
}
