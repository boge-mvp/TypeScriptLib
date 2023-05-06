import {GSkeleton} from "../view/GSkeleton"
import {GSpineSkeleton} from "../view/GSpineSkeleton"

export class SpineUtils {

    /**
     * 对指定 skeleton 进行设置
     * @param skeleton
     * @param url
     * @param [nameOrIndex = 0] 播放名字或位置
     * @param [loop = true] 循环
     * @param playComplete
     * @param loaderComplete
     * @param [aniMode = -1]
     */
    static playSpine(skeleton: GSkeleton | GSpineSkeleton, url: string, nameOrIndex: string | number | (string | number)[] | ISkeletonPlay = 0,
                     loop = true, playComplete?: ParamHandler, loaderComplete?: ParamHandler, aniMode = -1) {
        skeleton.offAll(Laya.Event.STOPPED)
        skeleton.on(Laya.Event.STOPPED, this, function (handler: ParamHandler) {
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
                Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]))
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
            Laya.Handler.create(this, SpineUtils.parseComplete, [skeleton, nameOrIndex, loop, loaderComplete]), aniMode)
    }

    private static parseComplete(skeleton: GSkeleton | GSpineSkeleton,
                                 nameOrIndex: string | number | (string | number)[] | ISkeletonPlay,
                                 loop: boolean, loaderComplete: ParamHandler, fac?: Laya.Templet) {
        runFun(loaderComplete)
        if (!Array.isArray(nameOrIndex) && typeof nameOrIndex === "object") {
            runFun(nameOrIndex.loaderComplete)
        }
        if (skeleton && (typeof nameOrIndex === "number" ? nameOrIndex >= 0 : nameOrIndex)) skeleton.play(nameOrIndex, loop)
    }

    /**
     * 创建spine 骨骼动画组件
     * @param url 根据传入的json 或 sk自动创建 GSpineSkeleton、GSkeleton
     * @param optional
     * @param skeletonClass 指定一个类型 GSpineSkeleton、GSkeleton
     */
    static createSpine<T extends new () => GSkeleton | GSpineSkeleton | undefined>(url: string | ISkeletonData,
                                                                                   optional?: ISkeletonData | T,
                                                                                   skeletonClass?: T) {

        if (optional && !this.isInterface(optional)) {
            skeletonClass = optional
            optional = null
        }

        if (typeof url !== "string") {
            optional = url
            url = optional.url
        }
        // 配置属性为null 或者不是配置属性
        if (!optional || !this.isInterface(optional)) {
            optional = {url: url}
        }

        // @ts-ignore
        skeletonClass ??= Laya.Utils.getFileExtension(url) === "json" ? GSpineSkeleton : GSkeleton

        let skeleton = new skeletonClass()
        if (optional.ver && skeleton instanceof GSpineSkeleton) {
            skeleton.ver = optional.ver
        }
        optional.rotation && (skeleton.rotation = optional.rotation)
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
        SpineUtils.playSpine(skeleton, url, optional.play, optional.play?.loop, optional.playComplete, optional.loaderComplete, optional.aniMode)
        return skeleton as T extends { new(): infer R } ? R : GSkeleton | GSpineSkeleton
    }

    /**
     * 判断是否是接口 用_displayObject 是否存在判断
     * @param optional
     */
    static isInterface(optional): optional is ISkeletonData {
        return !("_displayObject" in optional)
    }


}