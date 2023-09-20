import {GSkeleton} from "../view/GSkeleton"
import {GSpineSkeleton} from "../view/GSpineSkeleton"
import {Log, LogLevel} from "../Log";

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
            if (skeleton.aniPath == url && skeleton.asSkeleton) {
                if (skeleton.asSkeleton.templet) {
                    // loaderComplete && loaderComplete.run()
                    SpineUtils.parseComplete(skeleton, nameOrIndex, loop, loaderComplete)
                }
                // 表示加载中 等待返回结果
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
     * @param url 根据传入的json或sk自动创建实现类GSpineSkeleton、GSkeleton。如果为null，skeletonClass参数必须传入
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

        if (optional.classType && !skeletonClass) {
            // @ts-ignore
            skeletonClass = optional.classType as T
        }

        if (!url && !skeletonClass) {
            throw "The url or skeletonClass must have a non-null"
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

        let onLoadComplete = optional.loaderComplete
        let _onComplete
        if (optional.relation) {
            let relation = optional.relation
            _onComplete = () => {
                const types = relation.types
                if (types) {
                    for (const type of types) {
                        let reTypes = type.relationType
                        if (!Array.isArray(reTypes)) reTypes = [reTypes]
                        reTypes.forEach(value => {
                            skeleton.addRelation(type.target, value, type.usePercent)
                        })
                    }
                }
                if (relation.target) {
                    relation.lr ??= relation.target
                    relation.ud ??= relation.target
                }
                relation.lr && skeleton.addRelation(relation.lr, fgui.RelationType.Center_Center, relation.usePercent ?? true)
                relation.ud && skeleton.addRelation(relation.ud, fgui.RelationType.Middle_Middle, relation.usePercent ?? true)
                Log.debug("loader spine complete", url)
                if (Log.level <= LogLevel.DEBUG)
                    Log.debug("all animation name and skins", skeleton.getAllAnimation()?.map(item => item.name), skeleton.getAllSkin()?.map(item => item.name))
                runFun(onLoadComplete)

            }
        } else {
            _onComplete = () => {
                Log.debug("loader spine complete", url)
                if (Log.level <= LogLevel.DEBUG)
                    Log.debug("all animation name and skins", skeleton.getAllAnimation()?.map(item => item.name), skeleton.getAllSkin()?.map(item => item.name))
                runFun(onLoadComplete)
            }
        }
        if (url) SpineUtils.playSpine(skeleton, url, optional.play, optional.play?.loop, optional.playComplete, _onComplete, optional.aniMode)
        return skeleton as T extends { new(): infer R } ? R : GSkeleton | GSpineSkeleton
    }

    /**
     * 判断是否是接口 用 prototype 是否存在判断
     * @param optional
     */
    static isInterface(optional): optional is ISkeletonData {
        return !("prototype" in optional)
    }


}