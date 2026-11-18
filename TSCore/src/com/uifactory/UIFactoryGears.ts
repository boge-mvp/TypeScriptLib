import { IElementConfig } from "./IElementConfig";

/**
 * UIFactory 官方状态机与齿轮装配引擎
 *
 * 核心规范：
 * 1. 100% 遵循 FairyGUI 官方二进制构建规范 (GObject.setup_afterAdd / GearBase.setup)；
 * 2. 遵守直接父级作用域铁律（Direct-Parent Scoping Law）：严格基于直接父容器 panelNode.getController(...) 绑定控制器，
 *    零跨层级祖先爬树，零外挂事件监听，全生命周期交由 FGUI 原生的 applyController -> handleControllerChanged 驱动；
 * 3. 支持全系 10 大 Gears 状态机：
 *    - Gear 0: GearDisplay (显隐控制)
 *    - Gear 1: GearXY (双轴坐标平滑移动，支持补间动画)
 *    - Gear 2: GearSize (尺寸宽高与缩放过渡)
 *    - Gear 3: GearLook (透明度、旋转、置灰、可触控 4维联动)
 *    - Gear 4: GearColor (文本与矢量图形颜色/描边)
 *    - Gear 5: GearAnimation (序列帧动画播放/定格)
 *    - Gear 6: GearText (多语言/动态文案映射)
 *    - Gear 7: GearIcon (资源图标/纹理路径切换)
 *    - Gear 8: GearDisplay2 (二级条件与/或复合门控)
 *    - Gear 9: GearFontSize (文本字号跨阶跳变)
 */
export class UIFactoryGears {

    /**
     * 为子组件装配全系 FGUI Gear 状态机 (0~9 大齿轮)
     *
     * 对应官方 setup_afterAdd 阶段的 gear.setup(buffer) 流程。
     *
     * @param childNode 待装配齿轮的目标子元件
     * @param childData 子元件声明式配置（可能包含 gearDisplay、gearXY 等字段）
     * @param panelNode 直接父级宿主容器
     * @param index 子元件所在索引
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

        // 0. GearDisplay (显隐)
        if (childData.gearDisplay) {
            const gear = childNode.getGear(0) as fgui.GearDisplay;
            const ctrl = getController(childData.gearDisplay.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearDisplay.pages && Array.isArray(childData.gearDisplay.pages)) {
                    gear.pages = childData.gearDisplay.pages.map(p => mapPageNameToId(ctrl, p));
                }
                gear.apply();
                // 确保在构建期不因 checkGearDisplay 误触发，在控制器统一 applyController 时刷新
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearDisplay.controller}"。`);
            }
        }

        // 1. GearXY (位移)
        if (childData.gearXY) {
            const gear = childNode.getGear(1) as fgui.GearXY;
            const ctrl = getController(childData.gearXY.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearXY.pages) {
                    for (const pName in childData.gearXY.pages) {
                        const val = childData.gearXY.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = {
                            x: val.x || 0,
                            y: val.y || 0,
                            px: val.px !== undefined ? val.px : 0,
                            py: val.py !== undefined ? val.py : 0
                        };
                    }
                }
                if (gear.tweenConfig) {
                    gear.tweenConfig.tween = childData.gearXY.tween !== undefined ? childData.gearXY.tween : true;
                    gear.tweenConfig.duration = childData.gearXY.duration !== undefined ? childData.gearXY.duration : 0.3;
                    gear.tweenConfig.easeType = childData.gearXY.easeType !== undefined ? childData.gearXY.easeType : fgui.EaseType.QuadOut;
                    gear.tweenConfig.delay = childData.gearXY.delay || 0;
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearXY.controller}"。`);
            }
        }

        // 2. GearSize (尺寸与缩放)
        if (childData.gearSize) {
            const gear = childNode.getGear(2) as fgui.GearSize;
            const ctrl = getController(childData.gearSize.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearSize.pages) {
                    for (const pName in childData.gearSize.pages) {
                        const val = childData.gearSize.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = {
                            width: val.width !== undefined ? val.width : childNode.width,
                            height: val.height !== undefined ? val.height : childNode.height,
                            scaleX: val.scaleX !== undefined ? val.scaleX : (val.scale !== undefined ? val.scale : childNode.scaleX),
                            scaleY: val.scaleY !== undefined ? val.scaleY : (val.scale !== undefined ? val.scale : childNode.scaleY)
                        };
                    }
                }
                if (gear.tweenConfig) {
                    gear.tweenConfig.tween = childData.gearSize.tween !== undefined ? childData.gearSize.tween : true;
                    gear.tweenConfig.duration = childData.gearSize.duration !== undefined ? childData.gearSize.duration : 0.3;
                    gear.tweenConfig.easeType = childData.gearSize.easeType !== undefined ? childData.gearSize.easeType : fgui.EaseType.QuadOut;
                    gear.tweenConfig.delay = childData.gearSize.delay || 0;
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearSize.controller}"。`);
            }
        }

        // 3. GearLook (外观：透明度、旋转、置灰、可触控)
        if (childData.gearLook) {
            const gear = childNode.getGear(3) as fgui.GearLook;
            const ctrl = getController(childData.gearLook.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearLook.pages) {
                    for (const pName in childData.gearLook.pages) {
                        const val = childData.gearLook.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = {
                            alpha: val.alpha !== undefined ? val.alpha : childNode.alpha,
                            rotation: val.rotation !== undefined ? val.rotation : childNode.rotation,
                            grayed: val.grayed !== undefined ? val.grayed : childNode.grayed,
                            touchable: val.touchable !== undefined ? val.touchable : childNode.touchable
                        };
                    }
                }
                if (gear.tweenConfig) {
                    gear.tweenConfig.tween = childData.gearLook.tween !== undefined ? childData.gearLook.tween : true;
                    gear.tweenConfig.duration = childData.gearLook.duration !== undefined ? childData.gearLook.duration : 0.3;
                    gear.tweenConfig.easeType = childData.gearLook.easeType !== undefined ? childData.gearLook.easeType : fgui.EaseType.QuadOut;
                    gear.tweenConfig.delay = childData.gearLook.delay || 0;
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearLook.controller}"。`);
            }
        }

        // 4. GearColor (颜色)
        if (childData.gearColor) {
            // 包装层扩展 (对齐开发规范)：弥补 FGUI 官方 GGraph.setProp 遗漏 OutlineColor 的缺陷
            if (typeof fgui !== "undefined" && fgui.GGraph && !(fgui.GGraph.prototype as any)._outlineColorInjected) {
                (fgui.GGraph.prototype as any)._outlineColorInjected = true;
                const originSetProp = fgui.GGraph.prototype.setProp;
                fgui.GGraph.prototype.setProp = function (index: number, value: any) {
                    if (index === fgui.ObjectPropID.OutlineColor) {
                        this["_lineColor"] = value;
                        if (this["_type"] !== 0) this["updateGraph"]();
                    } else {
                        originSetProp.call(this, index, value);
                    }
                };
                const originGetProp = fgui.GGraph.prototype.getProp;
                fgui.GGraph.prototype.getProp = function (index: number) {
                    if (index === fgui.ObjectPropID.OutlineColor) {
                        return this["_lineColor"];
                    }
                    return originGetProp.call(this, index);
                };
            }

            const gear = childNode.getGear(4) as fgui.GearColor;
            const ctrl = getController(childData.gearColor.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearColor.pages) {
                    for (const pName in childData.gearColor.pages) {
                        const val = childData.gearColor.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = {
                            color: val.color || "#ffffff",
                            strokeColor: val.strokeColor || "#000000"
                        };
                    }
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearColor.controller}"。`);
            }
        }

        // 5. GearAnimation (帧动画控制)
        if (childData.gearAnimation) {
            const gear = childNode.getGear(5) as fgui.GearAnimation;
            const ctrl = getController(childData.gearAnimation.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearAnimation.pages) {
                    for (const pName in childData.gearAnimation.pages) {
                        const val = childData.gearAnimation.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = {
                            playing: val.playing !== undefined ? val.playing : true,
                            frame: val.frame || 0
                        };
                    }
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearAnimation.controller}"。`);
            }
        }

        // 6. GearText (文本联动)
        if (childData.gearText) {
            const gear = childNode.getGear(6) as fgui.GearText;
            const ctrl = getController(childData.gearText.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearText.pages) {
                    for (const pName in childData.gearText.pages) {
                        const val = childData.gearText.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = typeof val === "string" ? val : (val.text || "");
                    }
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearText.controller}"。`);
            }
        }

        // 7. GearIcon (图标联动)
        if (childData.gearIcon) {
            const gear = childNode.getGear(7) as fgui.GearIcon;
            const ctrl = getController(childData.gearIcon.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearIcon.pages) {
                    for (const pName in childData.gearIcon.pages) {
                        const val = childData.gearIcon.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = typeof val === "string" ? val : (val.icon || val.url || "");
                    }
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearIcon.controller}"。`);
            }
        }

        // 8. GearDisplay2 (二级条件显隐)
        if (childData.gearDisplay2) {
            const gear = childNode.getGear(8) as fgui.GearDisplay2;
            const ctrl = getController(childData.gearDisplay2.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearDisplay2.pages && Array.isArray(childData.gearDisplay2.pages)) {
                    gear.pages = childData.gearDisplay2.pages.map(p => mapPageNameToId(ctrl, p));
                }
                if (childData.gearDisplay2.condition !== undefined) {
                    gear.condition = childData.gearDisplay2.condition;
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearDisplay2.controller}"。`);
            }
        }

        // 9. GearFontSize (字号联动)
        if (childData.gearFontSize) {
            const gear = childNode.getGear(9) as fgui.GearFontSize;
            const ctrl = getController(childData.gearFontSize.controller);
            if (ctrl) {
                gear.controller = ctrl;
                if (childData.gearFontSize.pages) {
                    for (const pName in childData.gearFontSize.pages) {
                        const val = childData.gearFontSize.pages[pName];
                        const pId = mapPageNameToId(ctrl, pName);
                        gear["_storage"][pId] = val;
                    }
                }
                gear.apply();
            } else {
                console.warn(`[UIFactory] 组件 "${childData.name || index}" 未在直接父容器中找到控制器 "${childData.gearFontSize.controller}"。`);
            }
        }
    }
}
