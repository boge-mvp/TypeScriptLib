import Event = Laya.Event;
import Templet = Laya.Templet;
import Handler = Laya.Handler;
import {GSkeleton} from "../view/GSkeleton"
import {GSpineSkeleton} from "../view/GSpineSkeleton"
import {ISkeletonData, ISkeletonPlay} from "../interfaces/ICommon";

export class SpineUtils {

    /**
     * 对指定 skeleton 进行设置
     * @param skeleton
     * @param url
     * @param [nameOrIndex = 0] 播放名字或位置
     * @param [loop = true] 循环
     * @param playComplete
     * @param loaderComplete
     * @param aniMode
     */
    static playSpine(skeleton: GSkeleton | GSpineSkeleton, url: string, nameOrIndex: string | number | (string | number)[] | ISkeletonPlay = 0,
                     loop = true, playComplete?: ParamHandler, loaderComplete?: ParamHandler, aniMode = -1) {
        skeleton.offAll(Event.STOPPED)
        skeleton.on(Event.STOPPED, this, function (handler: ParamHandler) {
            runFun(handler)
        }, [playComplete])
        if (skeleton instanceof GSpineSkeleton) {
            if (skeleton.aniPath == url && skeleton.asSkeleton != null) {
                // loaderComplete && loaderComplete.run()
                SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete)
                return
            }
            // 界面显示了  在加载资源
            skeleton.load(url,
                Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]))
            return
        }
        if (skeleton.asSkeleton.url == url && skeleton.asSkeleton.templet) {
            // loaderComplete && loaderComplete.run()
            SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete, null)
            return
        }
        if (aniMode == -1) aniMode = skeleton.aniMode
        // 界面显示了  在加载资源
        skeleton.load(url,
            Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]), aniMode)
    }

    private static parseComplete(skeleton: GSkeleton | GSpineSkeleton,
                                 nameOrIndex: string | number | (string | number)[] | ISkeletonPlay,
                                 loop: boolean, loaderComplete: ParamHandler, fac?: Templet) {
        if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
            loaderComplete ??= nameOrIndex.loaderComplete
        }
        runFun(loaderComplete)
        if (skeleton && nameOrIndex) skeleton.play(nameOrIndex, loop)
    }

    /**
     * 创建spine 骨骼动画组件
     * @param url 根据传入的json 或 sk自动创建 GSpineSkeleton、GSkeleton
     * @param optional
     * @param SkeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
     */
    static createSpine<T extends GSkeleton | GSpineSkeleton>(url: string, optional?: ISkeletonData,
                                                             SkeletonClass?: { new(v?): T }): T {
        optional ||= {}

        // @ts-ignore
        SkeletonClass ??= Laya.Utils.getFileExtension(url) === "json" ? GSpineSkeleton : GSkeleton

        const skeleton = new SkeletonClass()

        SpineUtils.playSpine(skeleton, url, optional.play)

        if (optional.scale) {
            skeleton.setScale(optional.scale, optional.scale)
        } else {
            skeleton.setScale(optional.scaleX ?? skeleton.scaleX, optional.scaleY ?? skeleton.scaleY)
        }
        skeleton.setXY(optional.x ?? 0, optional.y ?? 0)

        if (optional.relation) {
            let relation = optional.relation
            relation.lr = relation.ud = relation.target
            relation.lr && skeleton.addRelation(relation.lr, fgui.RelationType.Center_Center, relation.usePercent ?? true)
            relation.ud && skeleton.addRelation(relation.ud, fgui.RelationType.Middle_Middle, relation.usePercent ?? true)
        }
        return skeleton
    }


}