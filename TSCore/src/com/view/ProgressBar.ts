import GProgressBar = fgui.GProgressBar;
import GTweener = fgui.GTweener;
import GTween = fgui.GTween;
import EaseType = fgui.EaseType;
import {ActionEvent, ViewBlock} from "../block/Block"
import ToolSet = fgui.ToolSet;
import ProgressTitleType = fgui.ProgressTitleType;
import ObjectPropID = fgui.ObjectPropID;
import GTextField = fgui.GTextField;

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

    override update(newValue: number) {
        // super.update(newValue);

        // @ts-ignore
        var percent = ToolSet.clamp01((newValue - this._min) / (this._max - this._min));
        // @ts-ignore
        const titleObject: GTextField = this._titleObject
        // @ts-ignore
        const max = this._max
        // @ts-ignore
        if (this._titleObject) {
            // @ts-ignore
            switch (this._titleType) {
                case ProgressTitleType.Percent:
                    if (titleObject.templateVars && titleObject.text.contains("{num=")) {
                        titleObject
                            .setVar("num", Math.floor(newValue) + "")
                            .flushVars()
                    } else
                    titleObject.text = Math.floor(percent * 100) + "%";
                    break;

                case ProgressTitleType.ValueAndMax:
                    if (titleObject.templateVars && titleObject.text.contains("{num=", "{max=")) {
                        titleObject
                            .setVar("num", Math.floor(newValue) + "")
                            .setVar("max", max)
                            .flushVars()
                    } else
                    titleObject.text = Math.floor(newValue) + "/" + Math.floor(max);
                    break;

                case ProgressTitleType.Value:
                    if (titleObject.templateVars && titleObject.text.contains("{num=")) {
                        titleObject
                            .setVar("num", Math.floor(newValue) + "")
                            .flushVars()
                    } else
                    titleObject.text = "" + Math.floor(newValue);
                    break;

                case ProgressTitleType.Max:
                    if (titleObject.templateVars && titleObject.text.contains("{max=")) {
                        titleObject
                            .setVar("max", Math.floor(max) + "")
                            .flushVars()
                    } else
                    titleObject.text = "" + Math.floor(max);
                    break;
            }
        }

        // @ts-ignore
        var fullWidth: number = this.width - this._barMaxWidthDelta;
        // @ts-ignore
        var fullHeight: number = this.height - this._barMaxHeightDelta;
        // @ts-ignore
        if (!this._reverse) {
            // @ts-ignore
            if (this._barObjectH) {
                // @ts-ignore
                if (!this.setFillAmount(this._barObjectH, percent)) this._barObjectH.width = Math.round(fullWidth * percent);
            }
            // @ts-ignore
            if (this._barObjectV) {
                // @ts-ignore
                if (!this.setFillAmount(this._barObjectV, percent)) this._barObjectV.height = Math.round(fullHeight * percent);
            }
        } else {
            // @ts-ignore
            if (this._barObjectH) {
                // @ts-ignore
                if (!this.setFillAmount(this._barObjectH, 1 - percent)) {
                    // @ts-ignore
                    this._barObjectH.width = Math.round(fullWidth * percent);
                    // @ts-ignore
                    this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
                }

            }
            // @ts-ignore
            if (this._barObjectV) {
                // @ts-ignore
                if (!this.setFillAmount(this._barObjectV, 1 - percent)) {
                    // @ts-ignore
                    this._barObjectV.height = Math.round(fullHeight * percent);
                    // @ts-ignore
                    this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
                }
            }
        }
        // @ts-ignore
        this._aniObject?.setProp(ObjectPropID.Frame, Math.floor(percent * 100));
    }

}