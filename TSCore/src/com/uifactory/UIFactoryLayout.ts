import { IElementConfig } from "./IElementConfig";
import { IBaseElementConfig } from "./IBaseElementConfig";
import { IViewConfig } from "./IViewConfig";

export class UIFactoryLayout {

    /**
     * 【物理定位与弹性排版核心引擎】
     * 职责：
     *   在运行时动态计算并装配 FGUI 元件在宿主容器中的真实像素坐标。本方法是无资源包依赖动态排版的核心，
     *   支持绝对坐标配置、容器百分比自适应（Left/Right/Top/Bottom 百分比）及对齐模式（左中右、顶中底）叠加物理偏移量。
     */
    public static setupElementPosition(
        node: fgui.GObject,
        elData: IElementConfig,
        containerW: number,
        containerH: number,
        parentData?: IBaseElementConfig & IViewConfig,
        flowState?: {
            accumulatedX: number;
            accumulatedY: number;
            perGapSpaceX?: number;
            perGapSpaceY?: number;
            lastNode: Nullable<fgui.GObject>;
            currentRowMaxHeight: number;
            index: number;
        }
    ): { targetX: number; targetY: number; elW: number; elH: number; } {
        const layout = elData.layout || {};
        const parentLayoutType = parentData?.layoutType;
        const parentAlignItems = parentData?.alignItems;
        const isVerticalFlow = parentLayoutType === "vertical";
        const isHorizontalFlow = parentLayoutType === "horizontal";
        const isPositionAbsolute = elData.position === "absolute";

        const hasLeftPct = layout.leftPercent !== undefined;
        const hasRightPct = layout.rightPercent !== undefined;
        const hasAlignX = layout.alignX !== undefined;
        if ((hasLeftPct || hasRightPct) && hasAlignX) {
            throw new Error(`[LayoutError] Element '${node.name || "unnamed"}' has conflicting layout properties! Horizontal percentage positioning and absolute horizontal alignment cannot be configured at the same time!`);
        }

        const hasTopPct = layout.topPercent !== undefined;
        const hasBottomPct = layout.bottomPercent !== undefined;
        const hasAlignY = layout.alignY !== undefined;
        if ((hasTopPct || hasBottomPct) && hasAlignY) {
            throw new Error(`[LayoutError] Element '${node.name || "unnamed"}' has conflicting layout properties! Vertical percentage positioning and absolute vertical alignment cannot be configured at the same time!`);
        }

        const scaleX = node.scaleX !== undefined ? Math.abs(node.scaleX) : 1;
        const scaleY = node.scaleY !== undefined ? Math.abs(node.scaleY) : 1;
        const elW = node.width * scaleX;
        const elH = node.height * scaleY;

        let targetX = 0;
        let targetY = 0;

        const parentPadding = parentData?.padding;
        const padTop = parentPadding?.top ?? 0;
        const padBottom = parentPadding?.bottom ?? 0;
        const padLeft = parentPadding?.left ?? 0;
        const padRight = parentPadding?.right ?? 0;

        const contentW = containerW - padLeft - padRight;
        const contentH = containerH - padTop - padBottom;

        const applyPadLeft = 0;
        const applyPadTop = 0;

        const hasFlow = !!flowState && !isPositionAbsolute;
        const isMainAxisX = hasFlow && isHorizontalFlow;
        const isMainAxisY = hasFlow && isVerticalFlow;
        const isFlexWrapY = hasFlow && isHorizontalFlow && parentData?.flexWrap;

        // ==========================================
        // 3.1 水平方向位置换算 (targetX)
        // ==========================================
        if (isMainAxisX && flowState) {
            const offsetX = layout.offsetX || 0;
            let gapValue = (flowState.index > 0 && parentData?.gap !== undefined) ? parentData.gap : 0;
            gapValue += (flowState.index > 0) ? (flowState.perGapSpaceX || 0) : 0;

            if (parentData?.flexWrap && flowState.lastNode) {
                const projectedX = flowState.accumulatedX + offsetX + gapValue + elW;
                const maxW = containerW - padRight;
                if (projectedX > maxW) {
                    const rowGap = parentData.gap ?? 0;
                    flowState.accumulatedY += flowState.currentRowMaxHeight + rowGap;
                    flowState.currentRowMaxHeight = 0;
                    flowState.accumulatedX = padLeft;
                    flowState.lastNode = null;
                    gapValue = 0;
                }
            }

            targetX = flowState.accumulatedX + offsetX + gapValue;
            if (!isPositionAbsolute) flowState.accumulatedX = targetX + elW;
        } else {
            if (elData.x !== undefined) {
                targetX = elData.x;
            } else {
                let alignX = layout.alignX;
                if (layout.leftPercent === undefined && layout.rightPercent === undefined && alignX === undefined) {
                    if (parentLayoutType === "vertical" && parentAlignItems) {
                        if (parentAlignItems === "center") {
                            alignX = "center";
                        } else if (parentAlignItems === "flex-end") {
                            alignX = "right";
                        } else {
                            alignX = "left";
                        }
                    }
                }
                if (alignX === undefined) {
                    alignX = "left";
                }

                if (layout.leftPercent !== undefined) {
                    targetX = applyPadLeft + (contentW - elW) * layout.leftPercent;
                } else if (layout.rightPercent !== undefined) {
                    targetX = applyPadLeft + (contentW - elW) * (1 - layout.rightPercent);
                } else {
                    const offsetX = layout.offsetX || 0;
                    if (alignX === "left") {
                        targetX = applyPadLeft + offsetX;
                    } else if (alignX === "right") {
                        targetX = contentW > 0 ? (applyPadLeft + contentW - elW + offsetX) : (applyPadLeft + offsetX);
                    } else if (alignX === "center") {
                        targetX = contentW > 0 ? (applyPadLeft + (contentW - elW) / 2 + offsetX) : (applyPadLeft + offsetX);
                    }
                }
            }
        }

        // ==========================================
        // 3.2 垂直方向位置换算 (targetY)
        // ==========================================
        if (isMainAxisY && flowState) {
            const offsetY = layout.offsetY || 0;
            let gapValue = (flowState.index > 0 && parentData?.gap !== undefined) ? parentData.gap : 0;
            gapValue += (flowState.index > 0) ? (flowState.perGapSpaceY || 0) : 0;
            targetY = flowState.accumulatedY + offsetY + gapValue;
            if (!isPositionAbsolute) flowState.accumulatedY = targetY + elH;
        } else if (isFlexWrapY && flowState) {
            targetY = flowState.accumulatedY + (layout.offsetY || 0);
            const currentElHeight = (layout.offsetY || 0) + elH;
            if (currentElHeight > flowState.currentRowMaxHeight) {
                flowState.currentRowMaxHeight = currentElHeight;
            }
        } else {
            if (elData.y !== undefined) {
                targetY = elData.y;
            } else {
                let alignY = layout.alignY;
                if (layout.topPercent === undefined && layout.bottomPercent === undefined && alignY === undefined) {
                    if (parentLayoutType === "horizontal" && parentAlignItems) {
                        if (parentAlignItems === "center") {
                            alignY = "middle";
                        } else if (parentAlignItems === "flex-end") {
                            alignY = "bottom";
                        } else {
                            alignY = "top";
                        }
                    }
                }
                if (alignY === undefined) {
                    alignY = "top";
                }

                if (layout.topPercent !== undefined) {
                    targetY = applyPadTop + (contentH - elH) * layout.topPercent;
                } else if (layout.bottomPercent !== undefined) {
                    targetY = applyPadTop + (contentH - elH) * (1 - layout.bottomPercent);
                } else {
                    const offsetY = layout.offsetY || 0;
                    if (alignY === "top") {
                        targetY = applyPadTop + offsetY;
                    } else if (alignY === "bottom") {
                        targetY = contentH > 0 ? (applyPadTop + contentH - elH + offsetY) : (applyPadTop + offsetY);
                    } else if (alignY === "middle") {
                        targetY = contentH > 0 ? (applyPadTop + (contentH - elH) / 2 + offsetY) : (applyPadTop + offsetY);
                    }
                }
            }
        }

        node.setXY(targetX, targetY);
        return { targetX, targetY, elW, elH };
    }
}
