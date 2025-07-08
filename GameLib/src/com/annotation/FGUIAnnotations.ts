/**
 * FguiBindView装饰器用于将一个类绑定到特定的FGUI视图资源
 * 它可以自动处理视图资源的加载和初始化，并将它们与相应的类关联起来
 * 主要用于简化FGUI组件类与资源文件的绑定过程
 *
 * 使用方式：
 * 1. 直接通过字符串传入FGUI视图资源路径
 *    示例:
 *    ```
 *    @FguiBindView("res/ui/ExampleView")
 *    class ExampleView extends fgui.GComponent {
 *        // 类实现
 *    }
 *    ```
 * 2. 绑定已命名类（若未提供URL，则优先从类元数据获取，否则使用类名）
 *    示例:
 *    ```
 *    @FguiBindView
 *    class ExampleView extends fgui.GComponent {
 *        // 类实现
 *    }
 *    ```
 * @param target - 可选参数，FGUI视图资源路径(url) 或被装饰的类本身
 * @see {@link bindView}
 */
function FguiBindView<T extends { new(...args: any[]): fgui.GComponent }>(target: string | any) {
    if (typeof target === 'string') {
        let url = target;
        // 这个内部函数是实际的类装饰器
        return function (classTarget: T) {
            _FguiBindView(classTarget, url);
        };
    } else {
        _FguiBindView(target);
    }
}

/**
 * _FguiBindView是FguiBindView装饰器的辅助函数
 * 它负责实际的视图绑定逻辑
 * 如果外部没有提供url，它尝试从类的元数据中获取，如果还获取不到，则使用类的名称
 * @param classTarget - 被装饰的类构造函数
 * @param url - 视图资源的url，可选参数
 * @internal
 */
function _FguiBindView<T extends { new(...args: any[]): fgui.GComponent }>(classTarget: T, url?: string) {
    // 如果外部没有提供url，尝试从类的元数据中获取，如果还获取不到，则使用类的名称
    url = url || Reflect.getMetadata("class:name", classTarget) || classTarget.name;
    bindView(url, classTarget)
}
