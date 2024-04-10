import ColorFilter = Laya.ColorFilter;
import Texture = Laya.Texture;
import Sprite = Laya.Sprite;
import Point = Laya.Point;
import StringUtil = tsCore.StringUtil;
import Log = tsCore.Log;

export class ObjectUtil {

    private static colorTransform = new ColorFilter()
    private static colorMatrixFilters = [new ColorFilter()]

    static setColorTransform(source: Sprite, value: string) {
        if (value) {
            let array: number[] = StringUtil.changeType(value, "array,number")
            if (array.length == 8) {

                // ObjectUtil.colorTransform.redMultiplier = array[0]
                // ObjectUtil.colorTransform.greenMultiplier = array[1]
                // ObjectUtil.colorTransform.blueMultiplier = array[2]
                // ObjectUtil.colorTransform.alphaMultiplier = array[3]
                // ObjectUtil.colorTransform.redOffset = array[4]
                // ObjectUtil.colorTransform.greenOffset = array[5]
                // ObjectUtil.colorTransform.blueOffset = array[6]
                // ObjectUtil.colorTransform.alphaOffset = array[7]
                // source.transform.colorTransform = ObjectUtil.colorTransform

                ObjectUtil.colorTransform.adjustColor(array[1], array[2], array[3], array[4])
                ObjectUtil.colorTransform.color(array[4], array[5], array[6], array[7])
                source.filters = [ObjectUtil.colorTransform]
            } else {
                Log.fatal("ObjectUtil.setColorTransform(source, value) The number of color value lengths is not correct, the length should be 8!")
            }
        } else {
            // ObjectUtil.colorTransform.redMultiplier = 1
            // ObjectUtil.colorTransform.greenMultiplier = 1
            // ObjectUtil.colorTransform.blueMultiplier = 1
            // ObjectUtil.colorTransform.alphaMultiplier = 1
            // ObjectUtil.colorTransform.redOffset = 0
            // ObjectUtil.colorTransform.greenOffset = 0
            // ObjectUtil.colorTransform.blueOffset = 0
            // ObjectUtil.colorTransform.alphaOffset = 0
            // source.transform.colorTransform = ObjectUtil.colorTransform
            ObjectUtil.colorTransform.adjustColor(0, 0, 0, 0)
            ObjectUtil.colorTransform.color(255, 255, 255, 1)
            source.filters = [ObjectUtil.colorTransform]
        }
    }

    static setColorMatrixFilter(source: Sprite, value: string) {
        if (value) {
            let array: any[] = StringUtil.changeType(value, "array,number")
            ObjectUtil.colorMatrixFilters[0].setByMatrix(array)
            source.filters = this.colorMatrixFilters
        } else {
            source.filters = null
        }
    }

    /**
     * 深度赋值对象 <br/>
     * ```
     *     赋值          浅层拷贝  深层拷贝  getter/setter
     *
     * Object.assign       ok      no         no
     * JSON.stringify      ok      ok         no
     * Object.create       ok      no         ok
     * ```
     * @param source
     * @param isCls
     *
     * @deprecated Object.create
     *
     */
    static copy(source: any, isCls = false) {
        // if (isCls) {
        // 	let typeName:string = getQualifiedClassName(source)
        // 	let packageName:string = typeName.split("::")[0]
        // 	let type:Class = getDefinitionByName(typeName) as Class
        // 	registerClassAlias(packageName, type)
        // }
        // let copier:ByteArray = new ByteArray()
        // copier.writeObject(source)
        // copier.position = 0
        // return copier.readObject()
        // 其实就是写了个子类继承父类数据而也
        // Object.setPrototypeOf(source, newObject)
        return Object.create(source)
    }


    /**
     * 将二进制转换成 base64 图片字符
     * @param buffer
     */
    static arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = ''
        let bytes = new Uint8Array(buffer)
        let len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return 'data:image/png;base64,' + window.btoa(binary)
    }

    /**
     * ArrayBuffer 转为字符串，参数为 ArrayBuffer对象
     * @param buf
     */
    static ab2str(buf: ArrayBuffer): string {
        return String.fromCharCode.apply(null, new Uint8Array(buf))
    }

    /**
     * 字符串转为 ArrayBuffer 对象，参数为字符串
     * @param str
     */
    static str2ab(str: string): ArrayBuffer {
        let buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
        let bufView = new Uint8Array(buf)
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i)
        }
        return buf
    }

    /**
     * 解析数据
     * @param xml
     * @param handler 解析完成回调 ( 返回数组 [xml, texture] )
     * @param content
     */
    // static parseRole(value: ArrayBuffer, handler: Laya.Handler) {
    // 	let buf: Uint8Array = new Uint8Array(value, 0)
    // 	let inflater = new Zlib.Inflate(buf)
    // 	buf = inflater.decompress()
    // 	let bytes: ByteBuffer = new ByteBuffer(buf)
    // 	let pngIen = bytes.readInt32()
    // 	let pngBytes: Byte = new Byte(bytes.readArrayBuffer(pngIen))
    // 	let xmlLength = bytes.readInt32()
    // 	let xmlBytes: Byte = new Byte(bytes.readArrayBuffer(xmlLength))
    // 	// 将二进制转换成字符串
    // 	let str = ObjectUtil.ab2str(xmlBytes.buffer)
    // 	let xmlStr = Utils.parseXMLFromString(str)
    // 	// 转换成base64 位图信息
    // 	let base64Str = ObjectUtil.arrayBufferToBase64(pngBytes.buffer)
    // 	// 判断如果已经加载  直接使用不再重新加载
    // 	let texture = Laya.loader.getRes(base64Str)
    // 	if (texture) {
    // 		this.onLoadTexture(xmlStr, handler, texture)
    // 	} else {
    // 		Laya.loader.load(base64Str,
    // 			Handler.create(this, this.onLoadTexture, [xmlStr, handler]),
    // 			null, Loader.IMAGE)
    // 	}
    // }

    private static onLoadTexture(xml: XMLDocument, handler: Laya.Handler, content: Texture) {
        handler.runWith([xml, content])
    }

    /**
     * 获取指定坐标下存在的对象
     * @param x x坐标 或 point对象
     * @param y y坐标 默认0
     */
    static getObjectsUnderPoint(x: number | Point, y = 0) {
        if (x instanceof Point) {
            y = x.y
            x = x.x
        }
        let len = Laya.stage.numChildren
        let maps: Sprite[] = []
        for (let i = 0; i < len; i++) {
            let a = Laya.stage.getChildAt(i)
            if (a instanceof Sprite && a.alpha > 0 && a.visible) {
                if (new Laya.Rectangle(a.x, a.y, a.displayWidth, a.displayHeight).contains(x, y)) {
                    maps.push(a)
                }
            }
        }
        return maps
    }

    /**
     * 获取指定位置的颜色值 16进制
     * @param texture
     * @param x x坐标 或 point对象 和 Sprite
     * @param y y坐标 默认-1
     */
    static getPixel(texture: Sprite | Texture, x: number | Point = -1, y = -1) {
        if (x instanceof Point) {
            y = x.y
            x = x.x
        }
        if (texture instanceof Sprite) {
            if (x == -1) {
                x = texture.x
            }
            if (y == -1) {
                y = texture.y
            }
            texture = texture.texture
        }
        if (x == -1) {
            x = 0
        }
        if (y == -1) {
            y = 0
        }
        let arr = texture.getPixels(x, y, 1, 1)
        return StringUtil.colorRgb(arr)
    }

    /**
     * 根据类名获取对象 如 com.test.Test可获取Test对象
     * @param classStr
     */
    static getClass(classStr: string) {
        let c = classStr.split(".")
        let cls = null
        for (let i = 0; i < c.length; i++) {
            if (!cls) {
                cls = window[c[i]]
            } else {
                cls = cls[c[i]]
            }
        }
        return cls
    }

}