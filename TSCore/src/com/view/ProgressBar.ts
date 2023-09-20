import GProgressBar = fgui.GProgressBar;
import GTweener = fgui.GTweener;
import GTween = fgui.GTween;
import EaseType = fgui.EaseType;
import {ActionEvent, ViewBlock} from "../block/Block"

export class ProgressBar extends mixinExt(ActionEvent, ViewBlock, GProgressBar) {
    tweenValue2(value: number, duration: number, complete?: ParamHandler): GTweener {
        let oldValule: number
        let tweener: GTweener = GTween.getTween(this, this.update)
        if (tweener) {
            oldValule = tweener.value.x
            tweener.kill()
        } else
            oldValule = this.value
        this["_value"] = value
        return GTween.to(oldValule, this.value, duration)
            .setTarget(this, this.update)
            .onComplete(() => {
                runFun(complete)
            })
            .setEase(EaseType.Linear)
    }

}