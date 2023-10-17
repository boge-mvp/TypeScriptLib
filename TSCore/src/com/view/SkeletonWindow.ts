import {EWindow} from "../extends/EWindow";
import {SpineUtils} from "../utils/SpineUtils";
import {GSkeleton} from "./GSkeleton";
import {GSpineSkeleton} from "./GSpineSkeleton";

/**
 * 带 Skeleton 动画
 */
export class SkeletonWindow extends EWindow {

    protected skeleton: GSkeleton | GSpineSkeleton
    protected loadComplete = false
    protected waitShow = false
    protected skeletonData: ISkeletonData

    protected override onInit(data?: ISkeletonData) {
        super.onInit();

        if (data) {

            this.skeletonData = data

            const newData: ISkeletonData = Object.create(data)
            newData.loaderComplete = this._onLoadComplete.bind(this)

            this.skeleton = SpineUtils.createSpine(newData)
            this.addChild(this.skeleton)
        } else throw Error("error data null")
    }



    protected _onLoadComplete() {
        this.loadComplete = true
        this.onLoadComplete()
        runFun(this.skeletonData.loaderComplete)
        if (this.waitShow) {
            this.waitShow = false
            this.doShowAnimation()
        }
    }

    /**
     * 骨骼动画加载完成
     * @protected
     */
    protected onLoadComplete() {
    }

    /**
     * 当初始化程序结束  但是加载程序尚未完成 执行
     */
    protected customLoader() {}

    /**
     * @deprecated
     * @see onShowAnimation
     */
    protected override doShowAnimation() {
        if (!this.loadComplete) {
            this.visible = false
            this.waitShow = true
            this.customLoader()
            return
        }
        this.visible = true
        this.onShowAnimation()
    }

    /**
     * ```
     * 初始化以及加载的骨骼动画都准备接续
     * 代替 doShowAnimation 重写  务必保留 super.onShowAnimation()
     * ```
     */
    protected onShowAnimation() {
        super.doShowAnimation()
    }

}