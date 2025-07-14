import Pool = Laya.Pool;
import GObject = fgui.GObject;
import Browser = Laya.Browser;

export class TimerKit {

    static NAME = "TimerDecorators"
    private static tasks: TaskHandler[] = []
    isPause = false
    static REG_TASK: TaskHandler[] = []

    start() {
        stop()
        Laya.timer.frameLoop(1, this, this.onUpdate)
        return this
    }

    stop() {
        Laya.timer.clear(this, this.onUpdate)
        return this
    }

    pause() {
        this.isPause = true
    }

    resume() {
        this.isPause = false
    }

    static getHandler(target: GObject, fun: ParamHandler) {
        const index = TimerKit.tasks.findIndex(value => value.target == target && value.handler == fun)
        return TimerKit.tasks[index]
    }

    static remove(target: GObject, fun: ParamHandler) {
        const index = TimerKit.tasks.findIndex(value => value.target == target && value.handler == fun)
        if (index > -1) {
            const handlers = TimerKit.tasks.splice(index, 1)
            handlers.forEach(value => Pool.recover(TimerKit.NAME, value))
        }
    }

    static addTask(task: TaskHandler) {
        TimerKit.tasks.push(task)
    }

    static getNewTask() {
        return Pool.getItemByClass(TimerKit.NAME, TaskHandler)
    }

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

    private onUpdate() {
        if (this.isPause) return
        const time = Browser.now()
        for (let i = 0; i < TimerKit.tasks.length; i++) {
            const task = TimerKit.tasks[i]
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

class TaskHandler {
    target: GObject
    customConditions: () => boolean
    handler: (...args) => any
    interval: number
    targetClassProperty: any
    lastRunTime: number

    initData(target: GObject, fun: (...args) => any, interval = 0, custom?: () => boolean) {
        this.target = target
        this.handler = fun
        this.customConditions = custom
        this.interval = interval
        this.lastRunTime = 0
        return this
    }

    setTargetClass(targetClassProperty: any) {
        this.targetClassProperty = targetClassProperty
        return this
    }
}