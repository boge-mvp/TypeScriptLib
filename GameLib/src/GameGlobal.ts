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
        const name = gameLib.GameConfigKit.gameNameCanonical()
        url = `//${name.charAt(0).toLowerCase()}${name.substring(1)}/${url}`
    }
    fgui.UIObjectFactory.setPackageItemExtension(url, type)
}






