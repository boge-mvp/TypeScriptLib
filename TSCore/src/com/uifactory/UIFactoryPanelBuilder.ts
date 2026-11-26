import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";
import { UIFactory } from "./UIFactory";
import { UIFactoryExtensions } from "./UIFactoryExtensions";
import { UIFactoryPipeline } from "./UIFactoryPipeline";

/**
 * FGUI 五阶段容器构建管线执行器 (从 UIFactory 抽离以保持门面精简)
 */
export class UIFactoryPanelBuilder {

    /**
     * FGUI 官方五阶段标准初始管线协调器 (fillPanel)
     *
     * @param panelNode 待填充初始化的目标 GComponent 容器
     * @param elData 声明式容器配置
     */
    public static fillPanel(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig): void {
        panelNode["_buildingDisplayList"] = true;
        fgui.UIPackage._constructing++;

        try {
            let initW = elData.width || panelNode.width || 0;
            let initH = elData.height || panelNode.height || 0;

            panelNode.sourceWidth = initW;
            panelNode.sourceHeight = initH;
            panelNode.initWidth = initW;
            panelNode.initHeight = initH;
            panelNode.setSize(initW, initH);

            let overflowVal: fgui.OverflowType | undefined = undefined;
            if (typeof elData.overflow === "string") {
                const key = elData.overflow.firstUpperCase() as keyof typeof fgui.OverflowType;
                overflowVal = fgui.OverflowType[key];
            } else if (typeof elData.overflow === "number") {
                overflowVal = elData.overflow;
            }
            if (overflowVal === fgui.OverflowType.Scroll) {
                if (elData.padding) {
                    panelNode.margin.top = elData.padding.top ?? 0;
                    panelNode.margin.bottom = elData.padding.bottom ?? 0;
                    panelNode.margin.left = elData.padding.left ?? 0;
                    panelNode.margin.right = elData.padding.right ?? 0;
                }
                panelNode.setupScrollPanel(overflowVal, elData.scrollType);
                if (elData.pageController && panelNode.scrollPane) {
                    let targetCtrl: Nullable<fgui.Controller> = null;
                    if (typeof elData.pageController === "string") {
                        targetCtrl = panelNode.getController(elData.pageController);
                    } else {
                        targetCtrl = elData.pageController;
                    }
                    if (targetCtrl) {
                        panelNode.scrollPane.pageController = targetCtrl;
                    }
                }
            }

            if (elData.controllers && elData.controllers.length > 0) {
                for (const ctrlData of elData.controllers) {
                    UIFactory.createController(ctrlData, panelNode);
                }
            }

            const childElements = (elData.elements || []).map(el => UIFactory.resolveElementConfig(el));
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

            // Phase 1: setup_beforeAdd 离散化构建
            for (let i = 0; i < childElements.length; i++) {
                const childData = childElements[i];
                const childNode = UIFactory.createElement<fgui.GObject>(childData, childData.width || 0, childData.height || 0);
                if (childNode) {
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

            // Phase 2: 排版定位
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

            // Phase 2.5: setupRelations 独立关系装配
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
                                console.warn(`[UIFactory] Element "${childNode.name}" failed to find relation target "${r.target}"`);
                            }
                        }
                    }
                }
            }

            // Phase 3: setup_afterAdd 统一分流内容注入与齿轮装配
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

            // Phase 5: finalize 闭环终态激活
            if (elData.mask) {
                const maskObj = panelNode.getChild(elData.mask) || panelNode.getChildByPath(elData.mask);
                if (maskObj) {
                    panelNode.setMask(maskObj.displayObject, !!elData.maskInverted);
                } else {
                    console.warn(`[UIFactory] Container "${panelNode.name || 'unnamed'}" failed to find mask target: "${elData.mask}".`);
                }
            }

            panelNode.applyAllControllers();

            panelNode["_buildingDisplayList"] = false;
            panelNode["_underConstruct"] = false;

            panelNode["buildNativeDisplayList"]();
            panelNode.setBoundsChangedFlag();

            UIFactory.setupComponentExtension(panelNode, elData);
            UIFactoryExtensions.bindScrollBarTargets(panelNode, childElements);

            panelNode["onConstruct"]();
        } finally {
            fgui.UIPackage._constructing--;
        }
    }
}
