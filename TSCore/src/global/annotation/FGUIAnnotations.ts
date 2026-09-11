/**
 * Fgui 属性装饰器工厂
 * 简化FGUI组件的访问：通过名称字符串来定位并返回FGUI组件、控制器或过渡动画
 * 首次访问命中后将值固化为只读属性；未命中时返回 null 并打印警告
 *
 * ### 生效前提：
 * - 装饰的类必须继承自 fgui.GComponent（内部通过 this.getChild/getController/getTransition 查找）
 * - 属性类型必须是 fgui.GObject / fgui.Controller / fgui.Transition 或其子类
 *   （按编译期 design:type 元数据分派查找方式，需启用 emitDecoratorMetadata），
 *   否则永远返回 null 并在每次访问时打印警告
 *
 * ### 示例代码：
 * ```
 * // 假设你有一个组件类 MyComponent，它继承自 fgui.GComponent
 * class MyComponent extends fgui.GComponent {
 *     // 使用 @Fgui 注解来注入一个子组件
 *     @Fgui("panel.button")
 *     private myButton: fgui.GButton;
 *
 *     // 使用 @Fgui 注解来注入一个控制器
 *     @Fgui("panel.controller")
 *     private myController: fgui.Controller;
 *
 *     // 使用 @Fgui 注解来注入一个过渡动画
 *     @Fgui("panel.transition")
 *     private myTransition: fgui.Transition;
 *
 *     // 构造函数或其他初始化逻辑
 *     constructor() {
 *         super();
 *         // 初始化逻辑...
 *     }
 *
 *     // 示例方法：点击按钮时触发的动作
 *     public initEvents(): void {
 *         this.myButton.onClick(this.onButtonClick, this);
 *     }
 *
 *     private onButtonClick(): void {
 *         console.log("Button clicked!");
 *         // 使用控制器切换状态
 *         if (this.myController) {
 *             this.myController.selectedIndex = 1;
 *         }
 *         // 播放过渡动画
 *         if (this.myTransition) {
 *             this.myTransition.play();
 *         }
 *     }
 * }
 * ```
 * @param name 组件的名称路径，使用点号分隔
 */
function Fgui(name: string): any {
    return function (targetPrototype: any, propertyKey: string) {
        return {
            configurable: true,
            get(this: fgui.GComponent) {
                const pathSegments = name.split(".")
                let current: Nullable<fgui.GObject> = this
                let obj = null
                const classTarget = Reflect.getMetadata("design:type", targetPrototype, propertyKey)
                switch (true) {
                    case classTarget == fgui.GObject || classTarget.prototype instanceof fgui.GObject:
                        obj = fguiFindChild(this, pathSegments)
                        break
                    case classTarget == fgui.Controller || classTarget.prototype instanceof fgui.Controller:
                        if (pathSegments.length > 1) {
                            current = fguiFindChild(this, pathSegments.slice(0, -1))
                            if (current && current instanceof fgui.GComponent) {
                                obj = current.getController(pathSegments[pathSegments.length - 1])
                            }
                        } else obj = this.getController(pathSegments[0])
                        break
                    case classTarget == fgui.Transition || classTarget.prototype instanceof fgui.Transition:
                        if (pathSegments.length > 1) {
                            current = fguiFindChild(this, pathSegments.slice(0, -1))
                            if (current && current instanceof fgui.GComponent) {
                                obj = current.getTransition(pathSegments[pathSegments.length - 1])
                            }
                        } else obj = this.getTransition(pathSegments[0])
                        break
                }
                if (obj) {
                    Object.defineProperty(this, propertyKey, {
                        value: obj,
                        configurable: true,
                        writable: false
                    })
                } else {
                    // @ts-ignore
                    tsCore.Log.warn(`[Fgui] Component not found for property "${propertyKey}" in class "${this.constructor.name}"`);
                }
                return obj
            }
        }
    }
}

/**
 * @internal
 * 递归查找FGUI组件的子对象
 * @param target - 要查找的目标FGUI组件
 * @param childs - 子对象名称数组，按层级顺序排列
 * @returns GObject - 返回找到的最深层子对象，如果查找失败则返回null
 *
 * @example
 * // 假设有一个FGUI组件结构: panel > container > button
 * const panel = fgui.UIPackage.createObject("package", "panel") as fgui.GComponent;
 * const button = fguiFindChild(panel, ["container", "button"]);
 * if (button) {
 *     // 找到了button对象，可以进行操作
 *     button.onClick(() => console.log("Button clicked"));
 * }
 */
function fguiFindChild(target: fgui.GComponent, childs: string[]) {
    let obj: Nullable<fgui.GObject> = target
    // 遍历子对象名称数组，逐层查找子对象
    for (const child of childs) {
        if (obj instanceof fgui.GComponent) {
            obj = obj.getChild(child)
        } else {
            obj = null
            break
        }
    }
    return obj
}

/**
 * TimerLoop 方法装饰器工厂
 * 定时循环执行装饰器，使被装饰的方法按照指定时间间隔循环执行
 *
 * ### 生效前提：
 * - 只能用在被 `@Component` 注解管理的类中（组件实例化时按类名匹配注册任务）
 * - 所在类必须继承自 fgui.GObject（任务目标为显示对象，依赖可见性检查）
 * - 被装饰的必须是方法，不能是属性或其他类型
 *
 * ### 执行条件：
 * - 默认仅当目标组件挂载在显示列表且可见（parent 存在、alpha > 0、internalVisible2）时才会执行
 * - custom 返回 true 时忽略 interval 时间间隔立即尝试执行，但仍受上述可见性条件约束（非强制执行）
 *
 * @param interval - 执行间隔时间(毫秒)
 * @param custom - 自定义调度条件函数，返回 true 时忽略时间间隔，见"执行条件"说明
 * @returns function - 装饰器函数
 *
 * ```
 * class GameLoop {
 *     private isRunning = true;
 *
 *     // 每1000毫秒执行一次update方法
 *     @TimerLoop(1000)
 *     update() {
 *         console.log("Game update");
 *     }
 *
 *     // 每500毫秒执行一次，当isRunning为true时才执行
 *     @TimerLoop(500, () => this.isRunning)
 *     render() {
 *         console.log("Game render");
 *     }
 * }
 * ```
 */
function TimerLoop(interval: number, custom?: () => boolean) {
    return function (targetProperty: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // @ts-ignore
        tsCore.TimerKit.REG_TASK.push(tsCore.TimerKit.getNewTask().initData(
            null,
            descriptor.value,
            interval,
            custom
        ).setTargetClass(targetProperty))
    }
}

/**
 * TimerFrameLoop 方法装饰器工厂
 * 定时(按帧)循环执行装饰器，使被装饰的方法按照指定帧数间隔循环执行（每 frame 帧触发一次）
 *
 * ### 生效前提：
 * - 只能用在被 `@Component` 注解管理的类中（组件实例化时按类名匹配注册任务）
 * - 所在类必须继承自 fgui.GObject（任务目标为显示对象，依赖可见性检查）
 * - 被装饰的必须是方法，不能是属性或其他类型
 *
 * ### 执行条件：
 * - 与 @TimerLoop 一致：默认仅当目标组件在显示列表且可见时才会执行；
 *   custom 返回 true 时忽略帧数间隔立即尝试执行（仍受可见性约束）
 *
 * @param frame - 执行间隔帧数
 * @param custom - 自定义调度条件函数
 */
function TimerFrameLoop(frame: number, custom?: () => boolean) {
    return function (targetProperty: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // @ts-ignore
        tsCore.TimerKit.REG_TASK.push(tsCore.TimerKit.getNewTask().initData(
            null,
            descriptor.value,
            0,
            custom
        ).setTargetClass(targetProperty).setFrame(frame))
    }
}

class RandomTimer {

    protected min: number
    protected max: number

    static create(min: number = 0, max: number = 100) {
        return new RandomTimer(min, max)
    }

    protected constructor(min: number = 0, max: number = 100) {
        this.min = min
        this.max = max
    }

    getNumber(): number {
        return random(this.min, this.max)
    }

}

class RandomTimerSingle extends RandomTimer {

    protected value?: number

    static override create(min: number = 0, max: number = 100) {
        return new RandomTimerSingle(min, max)
    }

    override getNumber(): number {
        return this.value ? this.value : (this.value = super.getNumber())
    }

}