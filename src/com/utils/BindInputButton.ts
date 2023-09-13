export class BindInputButton {

    btn: fgui.GButton
    array: any[]
    /** 当绑定的输入组件 内容修改后调用 */
    callback: Function

    /**
     *
     * @param btn
     * @param array
     */
    constructor(btn: fgui.GButton, ...array: any[]) {
        this.btn = btn
        this.array = array

        let value: any
        let input: fgui.GTextInput
        let gbtn: fgui.GButton
        for (let i = 0; i < array.length; i++) {
            value = array[i]
            if (value instanceof fgui.GTextInput) {
                input = value as fgui.GTextInput
                input.on(Laya.Event.INPUT, this, this.changeHandler)
            } else if (value instanceof fgui.GButton) {
                gbtn = value as fgui.GButton
                gbtn.on(fgui.Events.STATE_CHANGED, this, this.changeHandler)
            }
        }
    }

    /** 检查一次状态 */
    check() {
        this.changeHandler()
    }

    private changeHandler() {
        let enabled = true; // 注释

        let value: any
        let input: fgui.GTextInput
        let gbtn: fgui.GButton
        for (let i = 0; i < this.array.length; i++) {
            value = this.array[i]
            if (value instanceof fgui.GTextInput) {
                input = value as fgui.GTextInput
                if (input.text.length == 0 || input.text == input.promptText) {
                    enabled = false
                }
            } else if (value instanceof fgui.GButton) {
                gbtn = value as fgui.GButton
                if (gbtn.selected == false) {
                    enabled = false
                }
            }
        }
        this.btn.enabled = enabled
        if (this.callback) this.callback()
    }

}