/**
 * FGui装饰器用于简化FGUI组件的访问
 * 它通过名称字符串来定位和返回FGUI组件、控制器或过渡动画
 * @param name 组件的名称路径，使用点号分隔
 *
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
 */
function Fgui(name: string): any {
    return function (targetPrototype: any, propertyKey: string) {
        return {
            configurable: true,
            get(this: fgui.GComponent) {
                const pathSegments = name.split(".")
                let current: fgui.GObject = this
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
    let obj: fgui.GObject
    // 遍历子对象名称数组，逐层查找子对象
    for (const child of childs) {
        if (target instanceof fgui.GComponent) {
            obj = target.getChild(child)
        } else {
            obj = null
            break
        }
    }
    return obj
}

/**
 * 定时循环执行装饰器
 * 用于装饰类方法，使其按照指定间隔循环执行
 * @param interval - 执行间隔时间(毫秒)
 * @param custom - 自定义执行条件函数，当该函数返回 true 时任务会无视默认的可见性检查而强制执行
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
