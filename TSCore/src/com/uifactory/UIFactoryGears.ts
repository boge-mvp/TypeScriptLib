import { IElementConfig } from "./IElementConfig";

/**
 * UIFactory 官方状态机与齿轮装配引擎
 * 100% 遵循 FairyGUI 官方二进制构建规范 (GObject.setup_afterAdd: 1566~1573 / GearBase.setup: 15430)
 * 严格基于直接父级控制器 panelNode.getController(...) 绑定，零外挂事件监听，零祖先爬树
 */
export class UIFactoryGears {

    /**
     * 为子组件装配全系 FGUI Gear 状态机 (0~9 大齿轮)
     * 对应官方 setup_afterAdd 阶段的 gear.setup(buffer) 流程
     */
    public static setupElementGears(childNode: fgui.GObject, childData: IElementConfig, panelNode: fgui.GComponent, index: number): void {
        const getController = (ctrlName?: string): fgui.Controller | null => {
            if (ctrlName) {
                return panelNode.getController(ctrlName);
            }
            return (panelNode.controllers && panelNode.controllers.length > 0) ? panelNode.controllers[0] : null;
        };

        const mapPageNameToId = (ctrl: fgui.Controller, pageName: string): string => {
            const pid = ctrl.getPageIdByName(pageName);
            return pid ? pid : pageName;
        };

        // 处理按钮 relatedController 与 pageId（官方直接父级绑定）
        if (childData.type === "button") {
            const rawBtn = childNode as any;
            if (childData.relatedController && typeof childData.relatedController === "string") {
                const ctrl = getController(childData.relatedController);
                if (ctrl) {
                    rawBtn["_relatedController"] = ctrl;
                    if (childData.pageId !== undefined) {
                        rawBtn["_relatedPageId"] = mapPageNameToId(ctrl, childData.pageId);
                    }
                    if (childNode instanceof fgui.GButton && rawBtn["_relatedPageId"]) {
                        (childNode as fgui.GButton).selected = (rawBtn["_relatedPageId"] === ctrl.selectedPageId);
                    }
                } else {
                    console.warn(`[UIFactory] 按钮 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.relatedController}"。`);
                }
            }
        }

        // 0. GearDisplay (显隐)
        if (childData.gearDisplay) {
            const rawGear = (childNode as any).getGear(0);
            const ctrl = getController(childData.gearDisplay.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearDisplay.pages && Array.isArray(childData.gearDisplay.pages)) {
                    rawGear.pages = childData.gearDisplay.pages.map(p => mapPageNameToId(ctrl, p));
                }
                rawGear.apply();
                if (typeof (childNode as any).checkGearDisplay === "function") {
                    (childNode as any).checkGearDisplay();
                }
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearDisplay.controller}"。`);
            }
        }

        // 1. GearXY (位移)
        if (childData.gearXY) {
            const rawGear = (childNode as any).getGear(1);
            const ctrl = getController(childData.gearXY.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearXY.pages) {
                    for (const pName in childData.gearXY.pages) {
                        const val = childData.gearXY.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = {
                            x: val.x || 0,
                            y: val.y || 0,
                            px: val.px !== undefined ? val.px : 0,
                            py: val.py !== undefined ? val.py : 0
                        };
                    }
                }
                if (rawGear.tweenConfig) {
                    rawGear.tweenConfig.tween = childData.gearXY.tween !== undefined ? childData.gearXY.tween : true;
                    rawGear.tweenConfig.duration = childData.gearXY.duration !== undefined ? childData.gearXY.duration : 0.3;
                    rawGear.tweenConfig.easeType = childData.gearXY.easeType !== undefined ? childData.gearXY.easeType : fgui.EaseType.QuadOut;
                    rawGear.tweenConfig.delay = childData.gearXY.delay || 0;
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearXY.controller}"。`);
            }
        }

        // 2. GearSize (尺寸与缩放)
        if (childData.gearSize) {
            const rawGear = (childNode as any).getGear(2);
            const ctrl = getController(childData.gearSize.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearSize.pages) {
                    for (const pName in childData.gearSize.pages) {
                        const val = childData.gearSize.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = {
                            width: val.width !== undefined ? val.width : childNode.width,
                            height: val.height !== undefined ? val.height : childNode.height,
                            scaleX: val.scaleX !== undefined ? val.scaleX : (val.scale !== undefined ? val.scale : (childNode as any).scaleX),
                            scaleY: val.scaleY !== undefined ? val.scaleY : (val.scale !== undefined ? val.scale : (childNode as any).scaleY)
                        };
                    }
                }
                if (rawGear.tweenConfig) {
                    rawGear.tweenConfig.tween = childData.gearSize.tween !== undefined ? childData.gearSize.tween : true;
                    rawGear.tweenConfig.duration = childData.gearSize.duration !== undefined ? childData.gearSize.duration : 0.3;
                    rawGear.tweenConfig.easeType = childData.gearSize.easeType !== undefined ? childData.gearSize.easeType : fgui.EaseType.QuadOut;
                    rawGear.tweenConfig.delay = childData.gearSize.delay || 0;
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearSize.controller}"。`);
            }
        }

        // 3. GearLook (外观：透明度、旋转、置灰、可触控)
        if (childData.gearLook) {
            const rawGear = (childNode as any).getGear(3);
            const ctrl = getController(childData.gearLook.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearLook.pages) {
                    for (const pName in childData.gearLook.pages) {
                        const val = childData.gearLook.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = {
                            alpha: val.alpha !== undefined ? val.alpha : childNode.alpha,
                            rotation: val.rotation !== undefined ? val.rotation : childNode.rotation,
                            grayed: val.grayed !== undefined ? val.grayed : childNode.grayed,
                            touchable: val.touchable !== undefined ? val.touchable : childNode.touchable
                        };
                    }
                }
                if (rawGear.tweenConfig) {
                    rawGear.tweenConfig.tween = childData.gearLook.tween !== undefined ? childData.gearLook.tween : true;
                    rawGear.tweenConfig.duration = childData.gearLook.duration !== undefined ? childData.gearLook.duration : 0.3;
                    rawGear.tweenConfig.easeType = childData.gearLook.easeType !== undefined ? childData.gearLook.easeType : fgui.EaseType.QuadOut;
                    rawGear.tweenConfig.delay = childData.gearLook.delay || 0;
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearLook.controller}"。`);
            }
        }

        // 4. GearColor (颜色)
        if (childData.gearColor) {
            const rawGear = (childNode as any).getGear(4);
            const ctrl = getController(childData.gearColor.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearColor.pages) {
                    for (const pName in childData.gearColor.pages) {
                        const val = childData.gearColor.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = {
                            color: val.color || "#ffffff",
                            strokeColor: val.strokeColor || "#000000"
                        };
                    }
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearColor.controller}"。`);
            }
        }

        // 5. GearAnimation (帧动画控制)
        if (childData.gearAnimation) {
            const rawGear = (childNode as any).getGear(5);
            const ctrl = getController(childData.gearAnimation.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearAnimation.pages) {
                    for (const pName in childData.gearAnimation.pages) {
                        const val = childData.gearAnimation.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = {
                            playing: val.playing !== undefined ? val.playing : true,
                            frame: val.frame || 0
                        };
                    }
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearAnimation.controller}"。`);
            }
        }

        // 6. GearText (文本联动)
        if (childData.gearText) {
            const rawGear = (childNode as any).getGear(6);
            const ctrl = getController(childData.gearText.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearText.pages) {
                    for (const pName in childData.gearText.pages) {
                        const val = childData.gearText.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = typeof val === "string" ? val : (val.text || "");
                    }
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearText.controller}"。`);
            }
        }

        // 7. GearIcon (图标联动)
        if (childData.gearIcon) {
            const rawGear = (childNode as any).getGear(7);
            const ctrl = getController(childData.gearIcon.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearIcon.pages) {
                    for (const pName in childData.gearIcon.pages) {
                        const val = childData.gearIcon.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = typeof val === "string" ? val : (val.icon || val.url || "");
                    }
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearIcon.controller}"。`);
            }
        }

        // 8. GearDisplay2 (二级条件显隐)
        if (childData.gearDisplay2) {
            const rawGear = (childNode as any).getGear(8);
            const ctrl = getController(childData.gearDisplay2.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearDisplay2.pages && Array.isArray(childData.gearDisplay2.pages)) {
                    rawGear.pages = childData.gearDisplay2.pages.map(p => mapPageNameToId(ctrl, p));
                }
                if (childData.gearDisplay2.condition !== undefined) {
                    rawGear.condition = childData.gearDisplay2.condition;
                }
                rawGear.apply();
                if (typeof (childNode as any).checkGearDisplay === "function") {
                    (childNode as any).checkGearDisplay();
                }
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearDisplay2.controller}"。`);
            }
        }

        // 9. GearFontSize (字号联动)
        if (childData.gearFontSize) {
            const rawGear = (childNode as any).getGear(9);
            const ctrl = getController(childData.gearFontSize.controller);
            if (ctrl) {
                rawGear.controller = ctrl;
                if (childData.gearFontSize.pages) {
                    for (const pName in childData.gearFontSize.pages) {
                        const val = childData.gearFontSize.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        rawGear["_storage"][pId] = val;
                    }
                }
                rawGear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearFontSize.controller}"。`);
            }
        }
    }
}
