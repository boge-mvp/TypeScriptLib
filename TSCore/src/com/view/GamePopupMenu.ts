import PopupMenu = fgui.PopupMenu;
import GButton = fgui.GButton;
import ButtonMode = fgui.ButtonMode;
import GObject = fgui.GObject;
import PopupDirection = fgui.PopupDirection;
import Event = Laya.Event;

export type PopupMenuConfig = {/** 方向 */ dir?: PopupDirection | boolean,/** 相对目标居中 */ center?: boolean }

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

    /**
     * 显示菜单
     * @param target 在指定的对象上显示
     * @param options 详细配置
     */
    showInScene(target?: GObject, options?: PopupMenuConfig) {
        this.show(target, options?.dir)
        if (this.contentPane && target && options?.center) {
            const w = (this.contentPane.width - target.width) / 2
            this.contentPane.setXY(this.contentPane.x + w, this.contentPane.y)
        }
    }

    override show(target?: GObject, dir?: PopupDirection | boolean) {
        if (target instanceof GButton && target.mode == ButtonMode.Check) this.target = target
        super.show(target, dir)
    }

    addIconItem(caption: string, handler?: Laya.Handler) {
        let item = this._list.addItemFromPool().asButton
        item.icon = caption
        item.data = handler
        item.grayed = false
        let c = item.getController("checked")
        if (c) c.selectedIndex = 0
        return item
    }

    addSelectIconItem(caption: string, select: string, handler: Laya.Handler = null) {
        let item: GButton = this._list.addItemFromPool().asButton;
        item.icon = caption;
        item.selectedIcon = select;
        item.data = handler;
        item.grayed = false;
        if (select) {
            item.mode = ButtonMode.Check;
        }
        let c = item.getController("checked");
        if (c) c.selectedIndex = 0
        return item;
    }

    addIconTitleItem(title: string, caption: string, select: string, handler?: Laya.Handler) {
        let item = this._list.addItemFromPool().asButton
        item.icon = caption
        item.selectedIcon = select
        item.text = title
        item.data = handler
        item.grayed = false
        if (select) {
            item.mode = ButtonMode.Check
        }
        let c = item.getController("checked")
        if (c) c.selectedIndex = 0
        return item
    }

    override dispose() {
        Laya.timer.clearAll(this)
        super.dispose()
    }

}