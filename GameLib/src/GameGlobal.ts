/**
 * 给资源绑定一个实现对象
 * @example
 *
 * bindView("ui://package/uiName", MyUIClass)
 *  可以简写成：
 * bindView("//package/uiName", MyUIClass)
 *
 * //以下这种只能在游戏已经确认的时候使用，会自动根据游戏名字做为包填入
 * bindView("uiName", MyUIClass)
 *
 * @param url
 * @param type
 */
function bindView(url: string, type: { new(): fgui.GComponent }) {
    if (!url.includes("/")) {
        // @ts-ignore
        url = `//${gameLib.Player.inst.simpleName}/${url}`
    }
    fgui.UIObjectFactory.setPackageItemExtension(url, type)
}

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