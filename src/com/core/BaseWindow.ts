import Point = Laya.Point
import Ease = Laya.Ease
import Tween = Laya.Tween
import GRoot = fgui.GRoot
import {SceneManager} from "../manager/SceneManager"
import {AppRecordManager} from "../manager/AppRecordManager"
import {ActionLib} from "../actions/ActionLib"
import {Factory} from "../Factory"
import {BaseProxy} from "./BaseProxy"
import {LanguageUtils} from "../utils/LanguageUtils"
import {StringUtil} from "../utils/StringUtil"
import Handler = Laya.Handler;
import {IKey, IRecord, IView} from "../interfaces/ICommon";

export class BaseWindow extends fgui.Window implements IView, IRecord {

    /** 动画显示或关闭 */
    protected isAction = true
    /** 是否加入后退记录 */
    joinRecord = true
    /** 动画起始点 */
    startPoint: Point

    protected onInit() {
        let scale = SceneManager.inst.getEqualRatioScale()
        this.contentPane.setSize(this.width * scale, this.height * scale)
        this.setSize(this.contentPane.width, this.contentPane.height)
        if (this.isAction) {
            this.setPivot(0.5, 0.5)
        }
    }

    protected updateSizePoint() {
        this.center()
    }

    protected doHideAnimation() {
        this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        if (this.isAction) {
            let tempX = this.x
            let tempY = this.y
            if (this.startPoint != null) {
                tempX = this.startPoint.x - this.contentPane.width / 2
                tempY = this.startPoint.y - this.contentPane.height / 2
            }
            Tween.to(this, {
                scaleX: 0.3,
                scaleY: 0.3,
                x: tempX,
                y: tempY
            }, 400, Ease.backIn, Handler.create(this, this.hideImmediately))
        } else {
            this.hideImmediately()
        }
    }

    protected doShowAnimation() {
        this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        this.displayObject.stage.on(Laya.Event.RESIZE, this, this.updateSizePoint)
        this.touchable = true
        if (this.joinRecord) AppRecordManager.addHistory(null, this)
        this.updateSizePoint()
        if (this.isAction) {
            this.setScale(.3, .3)
            let tempX = this.x
            let tempY = this.y
            if (this.startPoint != null) {
                this.setXY(this.startPoint.x - this.contentPane.width / 2, this.startPoint.y - this.contentPane.height / 2)
            }
            Tween.to(this, {scaleX: 1, scaleY: 1, x: tempX, y: tempY}, 400, Ease.backOut,
                Handler.create(this, this.onShown))
        } else {
            this.onShown()
        }
    }

    protected closeEventHandler() {
        if (this.parent) {
            if (this.joinRecord) {
                AppRecordManager.backHistory()
            } else {
                this.hideRecord()
            }
        }
    }

    protected onHide() {
        this.sendAction(ActionLib.GAME_RUN_SCENE_EVENT)
        AppRecordManager.invalidHistory(this)
    }

    hideRecord() {
        this.touchable = false
        GRoot.inst.closeModalWait()
        this.hide()
    }

    showRecord() {

    }


    dispose() {
        this.parent = null
        AppRecordManager.invalidHistory(this)
        Tween.clearAll(this)
        if (this.displayObject != null) this.displayObject.stage.off(Laya.Event.RESIZE, this, this.updateSizePoint)
        if (this.displayObject != null && !this.displayObject.destroyed)
            super.dispose()
    }

    regAction(action: string, caller: any, method: Function, group: string = null) {
        Factory.inst.regAction(action, caller, method, group)
    }

    regActionHandler(action: string, handler: Handler, group: string = null) {
        Factory.inst.regActionHandler(action, handler, group)
    }

    removeAllAction(...arge: any[]) {
        Factory.inst.removeAllAction.apply(Factory.inst, arge)
    }

    removeGroup(group: string) {
        Factory.inst.removeGroup(group)
    }

    removeGroupActions(group: string, ...arge) {
        arge.unshift(group)
        Factory.inst.removeGroupActions.apply(Factory.inst, arge)
    }

    removeActionHandler(action: string, method: Function, group: string = null) {
        Factory.inst.removeActionHandler(action, method, group)
    }

    sendAction(action: string, ...arge) {
        arge.unshift(action)
        Factory.inst.sendAction.apply(Factory.inst, arge)
    }

    sendGroupAction(group: string, action: string, ...arge) {
        arge.unshift(action)
        arge.unshift(group)
        Factory.inst.sendGroupAction.apply(Factory.inst, arge)
    }

    /** 注册游戏数据 */
    regGameAction(action: string, caller: any, method: Function) {
        this.regAction(action, caller, method, BaseProxy.GAME_GROUP)
    }

    /** 根据语言包id获取字符串 */
    getString(id: string | number, ...args): string {
        let content = LanguageUtils.inst.getStr(id)
        args.unshift(content)
        return StringUtil.format.apply(null, args)
    }

    removeFunction(groupObj: any, action: string, method: Function): void {
        Factory.inst.removeFunction(groupObj, action, method)
    }

    removeTarget(groupObj: any, caller: any): void {
        Factory.inst.removeTarget(groupObj, caller)
    }

    removeTargetAll(caller: any): void {
        Factory.inst.removeTargetAll(caller)
    }

    getProxy<T>(name: string | { new(): T }): T {
        return Factory.inst.getProxy(name)
    }

    addView<T extends IView & IKey>(key: string | { new(): T }, view: T): boolean {
        return Factory.inst.addView(key, view)
    }

    getView<T>(key: string | { new(): T }): T {
        return Factory.inst.getView(key)
    }

    removeView<T extends IView & IKey>(key: string | T) {
        Factory.inst.removeView(key)
    }

}