import PopupMenu = fgui.PopupMenu
import GButton = fgui.GButton
import Controller = fgui.Controller
import ButtonMode = fgui.ButtonMode
import GObject = fgui.GObject
import PopupDirection = fgui.PopupDirection
import Event = Laya.Event

export class GamePopupMenu extends PopupMenu {

    private target: GButton
    closeHandler: ParamHandler

    constructor(resourceURL?: string) {
        super(resourceURL)
        this._contentPane.on(Event.UNDISPLAY, this, this.onUnDisplay)
    }

    private onUnDisplay() {
        runFun(this.closeHandler)
        Laya.timer.once(100, this, () => {
            if (this.target && this.target.selected) this.target.selected = false
        })
    }

    show(target?: GObject, dir?: PopupDirection | boolean) {
        if (target instanceof GButton && target.mode == ButtonMode.Check) this.target = target
        super.show(target, dir)
    }

    addIconItem(caption: string, handler?: Laya.Handler) {
        let item = this._list.addItemFromPool().asButton
        item.icon = caption
        item.data = handler
        item.grayed = false
        let c: Controller = item.getController("checked")
        if (c != null)
            c.selectedIndex = 0
        return item
    }

    addSelectIconItem(caption: string, select: string, handler: Laya.Handler = null) {
        let item: GButton = this._list.addItemFromPool().asButton;
        item.icon = caption;
        item.selectedIcon = select;
        item.data = handler;
        item.grayed = false;
        if (select != null) {
            item.mode = ButtonMode.Check;
        }
        let c: Controller = item.getController("checked");
        if (c != null)
            c.selectedIndex = 0;
        return item;
    }

    addIconTitleItem(title: string, caption: string, select: string, handler?: Laya.Handler) {
        let item = this._list.addItemFromPool().asButton
        item.icon = caption
        item.selectedIcon = select
        item.text = title
        item.data = handler
        item.grayed = false
        if (select != null) {
            item.mode = ButtonMode.Check
        }
        let c = item.getController("checked")
        if (c != null)
            c.selectedIndex = 0
        return item
    }

    dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

}