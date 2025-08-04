
export class BindInputKit {

    private component: fgui.GComponent
    private readonly array: (fgui.GTextInput | fgui.GButton)[]
    /** 当绑定的输入组件 内容修改后调用 */
    private callback: ParamHandler

    /**
     *
     * @param component 被约束的组件
     * @param array 起到约束作用的组件
     */
    constructor(component: fgui.GComponent, ...array: (fgui.GTextInput | fgui.GButton)[]) {
        this.component = component
        this.array = array

        let value: any
        let input: fgui.GTextInput
        let gbtn: fgui.GButton
        for (let i = 0; i < array.length; i++) {
            value = array[i]
            if (value instanceof fgui.GTextInput) {
                input = value as fgui.GTextInput
                input.on(Laya.Event.INPUT, this, this.onStateChanged)
            } else if (value instanceof fgui.GButton) {
                gbtn = value as fgui.GButton
                gbtn.on(fgui.Events.STATE_CHANGED, this, this.onStateChanged)
            }
        }
    }

    private onStateChanged() {
        let enabled = true // 注释
        for (const value of this.array) {
            if (value instanceof fgui.GTextInput && (value.text.length == 0 || value.text == value.promptText)) {
                enabled = false
            } else if (value instanceof fgui.GButton && !value.selected) {
                enabled = false
            }
        }
        this.component.enabled = enabled
        runFun(this.callback)
    }

    /** 检查一次状态 */
    check() {
        this.onStateChanged()
    }

}