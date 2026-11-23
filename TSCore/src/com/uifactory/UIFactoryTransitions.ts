import {ITransitionConfig, TransitionActionType} from "./ITransitionConfig";

/**
 * UIFactory 声明式过渡动效 (Transition) 引擎
 *
 * 核心特性：
 * 1. 结构化构建：将纯 JSON 动效序列（ITransitionConfig）直接映射为 FairyGUI 原生的 fgui.Transition 对象；
 * 2. 补间映射：支持 XY、Size、Scale、Pivot、Alpha、Rotation、Color、Shake 等 16 种动作类型；
 * 3. 缓动与循环：无缝适配 FGUI 原生 EaseType 缓动算法与 yoyo 往返播放；
 * 4. 自动生命周期：挂接宿主组件的 Event.DISPLAY 与 Event.UNDISPLAY 事件，实现进入舞台自动播放与离开舞台自动终止。
 */
export class UIFactoryTransitions {

    /**
     * 声明式过渡动效 (Transition) 工厂构建器
     *
     * @param config 动效配置对象（含 name、autoPlay、items 序列等）
     * @param owner 宿主组件 GComponent
     * @returns 实例化的 fgui.Transition 对象
     */
    public static createTransition(config: ITransitionConfig, owner: fgui.GComponent): fgui.Transition {
        const trans = new fgui.Transition(owner);
        trans.name = config.name || "transition";
        trans["_autoPlay"] = !!config.autoPlay;
        trans["_autoPlayTimes"] = config.autoPlayTimes !== undefined ? config.autoPlayTimes : 1;
        trans["_autoPlayDelay"] = config.autoPlayDelay || 0;

        if (!owner["_transitions"]) {
            owner["_transitions"] = [];
        }
        owner["_transitions"].push(trans);

        trans["_items"] = [];
        let totalDuration = 0;

        if (config.items && Array.isArray(config.items)) {
            for (let i = 0; i < config.items.length; i++) {
                const itemConf = config.items[i];
                const actionType = this.mapActionType(itemConf.type);

                const item: any = {
                    type: actionType,
                    time: itemConf.time || 0,
                    value: {},
                    displayLockToken: 0
                };

                const targetKey = itemConf.target || itemConf.targetId;
                let targetNode: Nullable<fgui.GObject> = null;
                if (targetKey) {
                    if (typeof targetKey === "object") {
                        item.target = targetKey;
                        item.targetId = targetKey.id || "";
                        targetNode = targetKey;
                    } else {
                        targetNode = owner.getChild(targetKey) || owner.getChildByPath(targetKey);
                        if (targetNode) {
                            item.targetId = targetNode.id;
                            item.target = targetNode;
                        } else {
                            console.warn(`[UIFactory] Transition "${config.name || ""}" target "${targetKey}" was not found in container, action ignored.`);
                            continue;
                        }
                    }
                } else {
                    item.targetId = "";
                    item.target = owner;
                    targetNode = owner;
                }

                const tw: any = itemConf.tweenConfig || (itemConf.tween || itemConf.duration !== undefined ? itemConf : null);
                if (tw && typeof tw === "object") {
                    const duration = tw.duration !== undefined ? tw.duration : 0;
                    const ease = tw.easeType !== undefined ? tw.easeType : fgui.EaseType.QuadOut;
                    item.tweenConfig = {
                        duration: duration,
                        easeType: ease,
                        repeat: tw.repeat !== undefined ? tw.repeat : 0,
                        yoyo: !!tw.yoyo,
                        endLabel: tw.endLabel || "",
                        startValue: { b1: true, b2: true },
                        endValue: { b1: true, b2: true },
                        endHook: tw.endHook || tw.hook || null
                    };

                    this.fillTransitionValue(actionType, tw.startValue, item.tweenConfig.startValue);
                    this.fillTransitionValue(actionType, tw.endValue, item.tweenConfig.endValue);

                    const itemTotal = item.time + duration;
                    if (itemTotal > totalDuration) {
                        totalDuration = itemTotal;
                    }
                } else {
                    this.fillTransitionValue(actionType, itemConf.value, item.value);
                    if (item.time > totalDuration) {
                        totalDuration = item.time;
                    }
                }

                trans["_items"].push(item);
            }
        }

        trans["_totalDuration"] = totalDuration;

        if (trans["_autoPlay"] && owner.displayObject) {
            owner.displayObject.on(Laya.Event.DISPLAY, owner, owner["___added"]);
            owner.displayObject.on(Laya.Event.UNDISPLAY, owner, owner["___removed"]);
        }

        return trans;
    }

    /**
     * 将配置中的动作类型字符串/枚举映射为 FGUI 内部 ActionType 整数
     *
     * @param type 动效动作类型字符串（如 "xy"、"scale"、"alpha"、"shake"）或数字
     * @returns 内部数字动作类型码 (0~16)
     */
    public static mapActionType(type: TransitionActionType | number): number {
        if (typeof type === "number") {
            return type;
        }
        switch (type) {
            case "xy": return 0;
            case "size": return 1;
            case "scale": return 2;
            case "pivot": return 3;
            case "alpha": return 4;
            case "rotation": return 5;
            case "color": return 6;
            case "animation": return 7;
            case "visible": return 8;
            case "sound": return 9;
            case "transition": return 10;
            case "shake": return 11;
            case "colorFilter": return 12;
            case "skew": return 13;
            case "text": return 14;
            case "icon": return 15;
            default: return 16;
        }
    }

    /**
     * 将外部易读的参数对象注入到 FGUI TransitionValue 内部物理结构中
     *
     * @param actionType 内部动作类型码 (0~16)
     * @param source 外部声明式参数对象（支持数组 [x, y] 或对象 { x, y } / { scaleX, scaleY } 等）
     * @param target FGUI 内部 TransitionValue 存储目标对象
     */
    public static fillTransitionValue(actionType: number, source: any, target: any): void {
        if (source === undefined || source === null || !target) return;
        switch (actionType) {
            case 0: // XY
                target.b1 = source.b1 !== undefined ? source.b1 : true;
                target.b2 = source.b2 !== undefined ? source.b2 : true;
                if (Array.isArray(source)) {
                    target.f1 = source[0] || 0;
                    target.f2 = source[1] || 0;
                } else {
                    target.f1 = source.x !== undefined ? source.x : (source.f1 !== undefined ? source.f1 : 0);
                    target.f2 = source.y !== undefined ? source.y : (source.f2 !== undefined ? source.f2 : 0);
                }
                break;
            case 1: // Size
                target.b1 = source.b1 !== undefined ? source.b1 : true;
                target.b2 = source.b2 !== undefined ? source.b2 : true;
                if (Array.isArray(source)) {
                    target.f1 = source[0] || 0;
                    target.f2 = source[1] || 0;
                } else {
                    target.f1 = source.width !== undefined ? source.width : (source.w !== undefined ? source.w : (source.f1 !== undefined ? source.f1 : 0));
                    target.f2 = source.height !== undefined ? source.height : (source.h !== undefined ? source.h : (source.f2 !== undefined ? source.f2 : 0));
                }
                break;
            case 2: // Scale
                if (Array.isArray(source)) {
                    target.f1 = source[0] !== undefined ? source[0] : 1;
                    target.f2 = source[1] !== undefined ? source[1] : target.f1;
                } else if (typeof source === "number") {
                    target.f1 = source;
                    target.f2 = source;
                } else {
                    target.f1 = source.scaleX !== undefined ? source.scaleX : (source.scale !== undefined ? source.scale : (source.f1 !== undefined ? source.f1 : 1));
                    target.f2 = source.scaleY !== undefined ? source.scaleY : (source.scale !== undefined ? source.scale : (source.f2 !== undefined ? source.f2 : 1));
                }
                break;
            case 3: // Pivot
                if (Array.isArray(source)) {
                    target.f1 = source[0] || 0;
                    target.f2 = source[1] || 0;
                } else {
                    target.f1 = source.pivotX !== undefined ? source.pivotX : (source.f1 !== undefined ? source.f1 : 0);
                    target.f2 = source.pivotY !== undefined ? source.pivotY : (source.f2 !== undefined ? source.f2 : 0);
                }
                break;
            case 4: // Alpha
                target.f1 = typeof source === "number" ? source : (source.alpha !== undefined ? source.alpha : (source.f1 !== undefined ? source.f1 : 1));
                break;
            case 5: // Rotation
                target.f1 = typeof source === "number" ? source : (source.rotation !== undefined ? source.rotation : (source.f1 !== undefined ? source.f1 : 0));
                break;
            case 6: // Color
                target.c = typeof source === "string" ? source : (source.color || source.c || "#ffffff");
                break;
            case 7: // Animation
                target.i = source.frame !== undefined ? source.frame : (source.i || 0);
                target.b = source.playing !== undefined ? source.playing : (source.b !== undefined ? source.b : true);
                break;
            case 8: // Visible
                target.b = typeof source === "boolean" ? source : (source.visible !== undefined ? source.visible : (source.b !== undefined ? source.b : true));
                break;
            case 9: // Sound
                target.s = typeof source === "string" ? source : (source.sound || source.s || "");
                target.f1 = source.volume !== undefined ? source.volume : (source.f1 !== undefined ? source.f1 : 1);
                break;
            case 10: // Transition
                target.s = typeof source === "string" ? source : (source.transName || source.s || "");
                target.i = source.playTimes !== undefined ? source.playTimes : (source.i !== undefined ? source.i : 1);
                break;
            case 11: // Shake
                target.f1 = source.amplitude !== undefined ? source.amplitude : (source.f1 !== undefined ? source.f1 : 0);
                target.f2 = source.duration !== undefined ? source.duration : (source.f2 !== undefined ? source.f2 : 0);
                break;
            case 14: // Text
                target.s = typeof source === "string" ? source : (source.text || source.s || "");
                break;
            case 15: // Icon
                target.s = typeof source === "string" ? source : (source.icon || source.url || source.s || "");
                break;
            default:
                break;
        }
    }
}
