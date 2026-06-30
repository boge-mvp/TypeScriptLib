import {ELoader} from "./extends/ELoader";
import {IFormatPath} from "./interfaces/IFormatPath";

export class Path {

    private path: string

    /** 路径格式化 */
    static formatPath: IFormatPath[] = []

    constructor(base: string, ...subpaths: string[]) {
        this.path = base
        subpaths.forEach( (value) => {
            if (value.startsWith("/")) {
                this.path += value
            } else this.path += `/${value}`
        })
    }

    /**
     * 格式化路径
     * ```
     * 1.当ELoader.isWebp为true的时候，自动将后缀为png/jpg的路径 添加.webp
     * 2.在未使用加速器的环境中，将启用version控制 会自动在url后面添加版本号
     * 3.执行顺序是先执行全路径格式 path()方法，在执行version()版本号方法，最后兼容执行call()方法。
     * ```
     * @param url 要格式化的路径
     * @return 格式化后可直接使用的路径
     */
    static formatUrl(url: string) {
        let isNoWebp = url.indexOf("nowebp=1") !== -1
        url = url.split("?")[0]
        let version = Laya.URL.version[url]
        Path.formatPath.sort((a, b) => a.order - a.order)
        for (const format of Path.formatPath) {
            url = format.path?.(url) ?? url
            version = format.version?.(url, version) ?? version
            version = format.call?.(url, version) ?? version
        }
        if (ELoader.isWebp && !isNoWebp && url.endsWithAny("png", "jpg")) url += ".webp"
        if (!Laya.Browser.onLayaRuntime && version) {
            url = `${url}?v=${version}`
            if (isNoWebp) url += "&nowebp=1"
        } else if (isNoWebp) {
            url = `${url}?nowebp=1`
        }
        return url
    }

    static of(base: string, ...subpaths: string[]) {
        return new Path(base, ...subpaths)
    }

    string() {
        return this.path
    }

}