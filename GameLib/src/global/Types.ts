/**
 * 绑定视图URL到特定的GComponent类型
 *
 * 此函数用于在给定的URL和一个GComponent类型之间建立关联。如果URL是唯一的`isUnique=true`，它会被添加到一个特殊集合中，
 * 从而确保该 URL 对应的类不会被后续的绑定操作覆盖。
 *
 * @example
 *
 * bindView("ui://package/uiName", MyUIClass)
 *  可以简写成：
 * bindView("//package/uiName", MyUIClass)
 *
 * //以下这种只能在游戏已经确认的时候使用，会自动根据游戏名字做为包填入
 * bindView("uiName", MyUIClass)
 *
 * @param url 视图的资源URL。如果URL不包含"/"，它会被视为简单名称并自动加上当前游戏的名称作为前缀
 * @param type GComponent的类型，必须是一个构造函数（new () => fgui.GComponent）
 * @param isUnique 指示是否为唯一绑定。若设为 `true`，则该url的绑定关系将不会被后续相同url的绑定操作所覆盖，默认为 `false`
 */
function bindView(url: string, type: { new(): fgui.GComponent }, isUnique = false) {
    // 精确判断是否为完整URL（以 "ui://" 或 "//" 开头），否则才进行自动补全
    if (!url.startsWith("ui://") && !url.startsWith("//") && !url.includes("/")) {
        // @ts-ignore
        const simpleName = gameLib.Player.inst.simpleName
        if (!simpleName) {
            throw new Error("Failed to resolve package name from simple name, gameLib.Player.inst.simpleName is undefined");

        }
        url = `//${simpleName}/${url}`
    }
    if (!packageItemExt.has(url)) {
        fgui.UIObjectFactory.setPackageItemExtension(url, type)
    }
    if (isUnique) {
        packageItemExt.add(url)
    }
}

/**
 * @internal
 */
const packageItemExt = new Set()

/**
 * 根据url 创建一个对象
 * @param url 如果url不带/符号 则自动转成 gameName/url
 * @param userClass
 */
function createView<T extends fgui.GObject>(url: string, userClass?: { new(): T }) {
    if (!url.includes("/")) {
        // @ts-ignore
        url = `//${gameLib.Player.inst.simpleName}/${url}`
    }
    return fgui.UIPackage.createObjectFromURL(url, userClass) as T
}

Object.defineProperty(tsCore.SoundUtils, "playGameMusic", {
    value: function (url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number, coverBefore = false) {
        // @ts-ignore
        url = `sounds/${gameLib.Player.inst.simpleName}/${url}`
        return tsCore.SoundUtils.playMusic(url, loops, complete, volume, startTime, coverBefore)
    }
})

Object.defineProperty(tsCore.SoundUtils, "playGameSound", {
    value: function (url: string, loops?: number, complete?: Laya.Handler, volume?: number, startTime?: number) {
        // @ts-ignore
        url = `sounds/${gameLib.Player.inst.simpleName}/${url}`
        return tsCore.SoundUtils.playSound(url, loops, complete, volume, startTime)
    }
})

Object.defineProperty(tsCore.SoundUtils, "stopGameSound", {
    value: function (url: string) {
        // @ts-ignore
        url = `sounds/${gameLib.Player.inst.simpleName}/${url}`
        return tsCore.SoundUtils.stopSound(url)
    }
})

const ofNewObject = fgui.UIObjectFactory.newObject
Object.defineProperty(fgui.UIObjectFactory, "newObject", {
    value: function (type: number | fgui.PackageItem, userClass?: new () => fgui.GObject) {
        if (typeof type !== "number" && !userClass) {
            const url = `//${type.owner?.name}/${type.name}`
            const class2 = fgui.UIObjectFactory.extensions[url]
            if (class2 && type.extensionType != class2) {
                type.extensionType = class2
                return ofNewObject(type, class2)
            }
        }
        return ofNewObject(type, userClass)

    }
})