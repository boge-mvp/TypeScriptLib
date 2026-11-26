import { ITransitionConfig, ITransitionItemConfig, TransitionActionType } from "./ITransitionConfig";
import { ITransitionTargetValue } from "./ITransitionTargetValue";

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

                const item: {
                    type: number;
                    time: number;
                    value: ITransitionTargetValue;
                    displayLockToken: number;
                    target?: Nullable<fgui.GObject>;
                    targetId?: string;
                    tweenConfig?: {
                        duration: number;
                        easeType: number;
                        repeat: number;
                        yoyo: boolean;
                        endLabel: string;
                        startValue: ITransitionTargetValue;
                        endValue: ITransitionTargetValue;
                        endHook: Nullable<Laya.Handler | (() => void)>;
                    };
                } = {
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

                const tw: Nullable<NonNullable<ITransitionItemConfig["tweenConfig"]> & Partial<ITransitionItemConfig> & { endHook?: Nullable<Laya.Handler | (() => void)>; endLabel?: string }> = itemConf.tweenConfig || (itemConf.tween || itemConf.duration !== undefined ? itemConf : null);
                if (tw && typeof tw === "object") {
                    const duration = tw.duration !== undefined ? tw.duration : 0;
                    const ease = tw.easeType !== undefined ? tw.easeType : fgui.EaseType.QuadOut;
                    const tweenCfg = {
                        duration: duration,
                        easeType: ease,
                        repeat: tw.repeat !== undefined ? tw.repeat : 0,
                        yoyo: !!tw.yoyo,
                        endLabel: tw.endLabel || "",
                        startValue: { b1: true, b2: true } as ITransitionTargetValue,
                        endValue: { b1: true, b2: true } as ITransitionTargetValue,
                        endHook: tw.endHook || tw.hook || null
                    };
                    item.tweenConfig = tweenCfg;

                    this.fillTransitionValue(actionType, tw.startValue, tweenCfg.startValue);
                    this.fillTransitionValue(actionType, tw.endValue, tweenCfg.endValue);

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
    public static fillTransitionValue(actionType: number, source: unknown, target: ITransitionTargetValue): void {
        if (source === undefined || source === null || !target) return;
        const src = (typeof source === "object" && !Array.isArray(source) ? source : {}) as Record<string, unknown>;
        switch (actionType) {
            case 0: // XY
                target.b1 = typeof src.b1 === "boolean" ? src.b1 : true;
                target.b2 = typeof src.b2 === "boolean" ? src.b2 : true;
                if (Array.isArray(source)) {
                    target.f1 = Number(source[0]) || 0;
                    target.f2 = Number(source[1]) || 0;
                } else {
                    target.f1 = src.x !== undefined ? Number(src.x) : (src.f1 !== undefined ? Number(src.f1) : 0);
                    target.f2 = src.y !== undefined ? Number(src.y) : (src.f2 !== undefined ? Number(src.f2) : 0);
                }
                break;
            case 1: // Size
                target.b1 = typeof src.b1 === "boolean" ? src.b1 : true;
                target.b2 = typeof src.b2 === "boolean" ? src.b2 : true;
                if (Array.isArray(source)) {
                    target.f1 = Number(source[0]) || 0;
                    target.f2 = Number(source[1]) || 0;
                } else {
                    target.f1 = src.width !== undefined ? Number(src.width) : (src.w !== undefined ? Number(src.w) : (src.f1 !== undefined ? Number(src.f1) : 0));
                    target.f2 = src.height !== undefined ? Number(src.height) : (src.h !== undefined ? Number(src.h) : (src.f2 !== undefined ? Number(src.f2) : 0));
                }
                break;
            case 2: // Scale
                if (Array.isArray(source)) {
                    target.f1 = source[0] !== undefined ? Number(source[0]) : 1;
                    target.f2 = source[1] !== undefined ? Number(source[1]) : target.f1;
                } else if (typeof source === "number") {
                    target.f1 = source;
                    target.f2 = source;
                } else {
                    target.f1 = src.scaleX !== undefined ? Number(src.scaleX) : (src.scale !== undefined ? Number(src.scale) : (src.f1 !== undefined ? Number(src.f1) : 1));
                    target.f2 = src.scaleY !== undefined ? Number(src.scaleY) : (src.scale !== undefined ? Number(src.scale) : (src.f2 !== undefined ? Number(src.f2) : 1));
                }
                break;
            case 3: // Pivot
                if (Array.isArray(source)) {
                    target.f1 = Number(source[0]) || 0;
                    target.f2 = Number(source[1]) || 0;
                } else {
                    target.f1 = src.pivotX !== undefined ? Number(src.pivotX) : (src.f1 !== undefined ? Number(src.f1) : 0);
                    target.f2 = src.pivotY !== undefined ? Number(src.pivotY) : (src.f2 !== undefined ? Number(src.f2) : 0);
                }
                break;
            case 4: // Alpha
                target.f1 = typeof source === "number" ? source : (src.alpha !== undefined ? Number(src.alpha) : (src.f1 !== undefined ? Number(src.f1) : 1));
                break;
            case 5: // Rotation
                target.f1 = typeof source === "number" ? source : (src.rotation !== undefined ? Number(src.rotation) : (src.f1 !== undefined ? Number(src.f1) : 0));
                break;
            case 6: // Color
                target.c = typeof source === "string" ? source : String(src.color || src.c || "#ffffff");
                break;
            case 7: // Animation
                target.i = src.frame !== undefined ? Number(src.frame) : (Number(src.i) || 0);
                target.b = typeof src.playing === "boolean" ? src.playing : (typeof src.b === "boolean" ? src.b : true);
                break;
            case 8: // Visible
                target.b = typeof source === "boolean" ? source : (typeof src.visible === "boolean" ? src.visible : (typeof src.b === "boolean" ? src.b : true));
                break;
            case 9: // Sound
                target.s = typeof source === "string" ? source : String(src.sound || src.s || "");
                target.f1 = src.volume !== undefined ? Number(src.volume) : (src.f1 !== undefined ? Number(src.f1) : 1);
                break;
            case 10: // Transition
                target.s = typeof source === "string" ? source : String(src.transName || src.s || "");
                target.i = src.playTimes !== undefined ? Number(src.playTimes) : (src.i !== undefined ? Number(src.i) : 1);
                break;
            case 11: // Shake
                target.f1 = src.amplitude !== undefined ? Number(src.amplitude) : (src.f1 !== undefined ? Number(src.f1) : 0);
                target.f2 = src.duration !== undefined ? Number(src.duration) : (src.f2 !== undefined ? Number(src.f2) : 0);
                break;
            case 14: // Text
                target.s = typeof source === "string" ? source : String(src.text || src.s || "");
                break;
            case 15: // Icon
                target.s = typeof source === "string" ? source : String(src.icon || src.url || src.s || "");
                break;
            default:
                break;
        }
    }
}
