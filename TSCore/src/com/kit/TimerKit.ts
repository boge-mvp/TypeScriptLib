import Pool = Laya.Pool;
import GObject = fgui.GObject;
import Browser = Laya.Browser;

/**
 * TimerKit 类用于管理定时任务，提供添加、移除和执行定时回调的功能。
 * 支持基于对象生命周期或自定义条件的任务控制，并与 Laya 引擎的 timer 集成。
 */
export class TimerKit {

    /**
     * 常量名称，用于从对象池中获取/回收 TaskHandler 实例
     */
    static NAME = "TimerDecorators"

    /**
     * 存储所有注册的任务处理器列表
     */
    private static tasks: TaskHandler[] = []

    /**
     * 标识当前是否处于暂停状态
     */
    isPause = false

    /**
     * 注册任务队列（备用）
     */
    static REG_TASK: TaskHandler[] = []

    /**
     * 启动定时器更新循环，每帧调用 onUpdate 方法
     * @returns 返回自身实例以支持链式调用
     */
    start() {
        this.stop()
        Laya.timer.frameLoop(1, this, this.onUpdate)
        return this
    }

    /**
     * 停止定时器更新循环
     * @returns 返回自身实例以支持链式调用
     */
    stop() {
        Laya.timer.clear(this, this.onUpdate)
        return this
    }

    /**
     * 暂停定时任务的执行
     */
    pause() {
        this.isPause = true
    }

    /**
     * 恢复定时任务的执行
     */
    resume() {
        this.isPause = false
    }

    /**
     * 获取指定目标和处理函数对应的任务处理器
     * @param target 目标 GObject 对象
     * @param fun 处理函数
     * @returns 找到的 TaskHandler 或 undefined
     */
    static getHandler(target: GObject, fun: ParamHandler) {
        const index = TimerKit.tasks.findIndex(value => value.target == target && value.handler == fun)
        return TimerKit.tasks[index]
    }

    /**
     * 移除并回收指定的目标及处理函数对应的定时任务
     * @param target 目标 GObject 对象
     * @param fun 处理函数
     */
    static remove(target: GObject, fun: ParamHandler) {
        const index = TimerKit.tasks.findIndex(value => value.target == target && value.handler == fun)
        if (index > -1) {
            const handlers = TimerKit.tasks.splice(index, 1)
            handlers.forEach(value => Pool.recover(TimerKit.NAME, value))
        }
    }

    /**
     * 添加一个任务处理器到全局任务列表中
     * @param task 要添加的 TaskHandler 实例
     */
    static addTask(task: TaskHandler) {
        TimerKit.tasks.push(task)
    }

    /**
     * 从对象池中获取一个新的 TaskHandler 实例
     * @returns 新创建或复用的 TaskHandler 实例
     */
    static getNewTask() {
        return Pool.getItemByClass(TimerKit.NAME, TaskHandler)
    }

    /**
     * 添加一个新的定时任务处理器
     * 若已存在相同目标和方法的任务则重置其数据；否则新建一个任务加入队列
     * @param target 目标 GObject 对象
     * @param fun 回调函数
     * @param interval 执行间隔时间（毫秒），默认为 0 表示每次帧更新都执行
     * @param custom 可选的自定义执行条件函数
     */
    static addHandler(target: GObject, fun: (...args) => any, interval = 0, custom?: () => boolean) {
        if (!target || !fun) return
        let handler = this.getHandler(target, fun)
        if (handler) {
            handler.initData(target, fun, interval, custom)
        }
        handler = this.getNewTask()
        handler.initData(target, fun, interval, custom)
        this.addTask(handler)
    }

    /**
     * 定时器主更新逻辑，在每一帧被调用
     * 判断每个任务是否满足运行条件，若满足则执行回调
     */
    private onUpdate() {
        if (this.isPause) return
        const time = Browser.now()

        // 遍历所有任务进行判断和执行
        for (let i = 0; i < TimerKit.tasks.length; i++) {
            const task = TimerKit.tasks[i]

            // 如果有自定义条件且满足，或者组件未销毁、可见性正常并且到达执行周期，则执行任务
            if ((task.customConditions && task.customConditions()) ||
                (!task.target.isDisposed
                    && task.target.parent
                    && task.target.alpha > 0
                    && task.target.internalVisible2
                    && task.lastRunTime + task.interval < time
                )
            ) {
                task.lastRunTime = time
                task.handler.call(task.target)
            }
        }

    }

}

/**
 * TaskHandler 类表示一个具体的定时任务项，封装了任务的目标对象、回调函数及相关配置信息
 */
class TaskHandler {
    /**
     * 关联的目标对象
     */
    target: GObject

    /**
     * 自定义执行条件函数，当该函数返回 true 时任务会无视默认的可见性检查而强制执行
     * 该函数不接收参数，需要在函数内部自行获取所需状态来决定是否应该执行任务
     */
    customConditions: () => boolean

    /**
     * 实际要执行的回调函数
     */
    handler: (...args) => any

    /**
     * 执行间隔时间（毫秒）
     */
    interval: number

    /**
     * 目标类属性（扩展用途）
     */
    targetClassProperty: any

    /**
     * 上次执行的时间戳
     */
    lastRunTime: number

    /**
     * 初始化任务处理器的数据
     * @param target 目标对象
     * @param fun 回调函数
     * @param interval 执行间隔时间，默认为 0
     * @param custom 自定义执行条件函数（可选）
     * @returns 返回自身实例以支持链式调用
     */
    initData(target: GObject, fun: (...args) => any, interval = 0, custom?: () => boolean) {
        this.target = target
        this.handler = fun
        this.customConditions = custom
        this.interval = interval
        this.lastRunTime = 0
        return this
    }

    /**
     * 设置目标类属性字段（可用于标识来源等）
     * @param targetClassProperty 属性值
     * @returns 返回自身实例以支持链式调用
     */
    setTargetClass(targetClassProperty: any) {
        this.targetClassProperty = targetClassProperty
        return this
    }

    /**
     * 创建当前任务的一个副本（深拷贝关键字段）
     * @returns 新的 TaskHandler 实例
     */
    copy() {
        return TimerKit.getNewTask().initData(this.target, this.handler, this.interval, this.customConditions).setTargetClass(this.targetClassProperty)
    }
}
