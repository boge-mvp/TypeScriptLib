/**
 * 应用运行监听器接口，用于监听应用启动过程中的各个阶段
 */
export interface IAppRunListener {
    /**
     * 当开始初始化应用时调用
     *
     * @see onProxyComponentComplete
     */
    onStartInitialize?(): void;

    /**
     * 对与需要代理处理的类初始化完成
     *
     * @see onCreateMain
     */
    onProxyComponentComplete?(): void;

    /**
     * 创建主应用类后调用
     * 此刻只是创建，尚未给主应用类属性赋值 但已加入bean池
     * @param mainContext 已经创建好的主类
     *
     * @see onBeanFuncInitializing
     */
    onCreateMain?(mainContext: any): void;

    /**
     * 即将初始化被 @Bean 标记的函数
     * @see onComponentInitializing
     */
    onBeanFuncInitializing?(): void;

    /**
     * 即将初始化被 @Component 标记的类
     * @see onComponentProgress
     */
    onComponentInitializing?(): void;

    /**
     * @Component 初始化过程
     * @param target 已经初始化好的类
     * @see onMainAppInitializing
     */
    onComponentProgress?(target: any): void;

    /**
     * 即将初始化主应用类时调用
     * @see onComplete
     */
    onMainAppInitializing?(): void;

    /**
     * 应用完全初始化完成时调用
     */
    onComplete?(): void;

}