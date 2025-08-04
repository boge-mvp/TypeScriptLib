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
function Fgui(name: string) {
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
 */
function fguiFindChild(target: fgui.GComponent, childs: string[]) {
    let obj: fairygui.GObject
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
