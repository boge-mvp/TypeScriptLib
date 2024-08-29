import Skeleton = Laya.Skeleton;
import Templet = Laya.Templet;
import GraphicsAni = Laya.GraphicsAni;
import Handler = Laya.Handler;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Point = Laya.Point;
import Texture = Laya.Texture;
import HTMLImage = Laya.HTMLImage;
import UIPackage = fgui.UIPackage;
import BoneSlot = Laya.BoneSlot;
import TextureFormat = Laya.TextureFormat;
import {ESkeleton} from "../extends/ESkeleton";
import {Log} from "../Log";

export class GSkeleton extends ESkeleton {

    /**
     * 骨骼更新
     * ````
     * GSkeleton cmd:DrawTextureCmd
     * GSpineSkeleton spine.Slot
     * ````
     */
    static readonly UPDATE_BONE_SLOT = "update_bone_slot"

    /** 是否使用混合模式 */
    isBlendModeAdd = false
    /** 使用混合模式的插槽 */
    blendBoneSlotNames: string[] = []
    /** 指定的骨骼忽略XY偏移量 */
    readonly clearBoneSlotOffset: string[] = []
    /** 指定的骨骼忽略X偏移量 */
    readonly clearBoneSlotOffsetX: string[] = []
    /** 指定的骨骼忽略Y偏移量 */
    readonly clearBoneSlotOffsetY: string[] = []
    aniMode = 0
    private _loadAniMode = 0
    /** 自定义缓存的Templet名字 */
    cacheName = ""

    constructor(aniMode = 0) {
        super()
        this.aniMode = aniMode
    }

    protected override createDisplayObject() {
        // super.createDisplayObject()
        this._displayObject = new Skeleton(null, this.aniMode)
        this._displayObject["$owner"] = this
        this["_touchable"] = this._displayObject.mouseEnabled = this._displayObject.mouseThrough = false
        this._displayObject.on(Event.STOPPED, this, this.onPlayStopped)

        this._container = this._displayObject
    }

    get asSkeleton() {
        return this._displayObject as Skeleton
    }

    /**
     * 通过加载直接创建动画
     * @param    url        要加载的动画文件路径
     * @param    handler    加载完成的回调函数
     * @param    aniMode        与<code>Skeleton.init</code>的<code>aniMode</code>作用一致
     */
    load(url: string, handler: ParamHandler, aniMode = 0) {
        this.displayObject["_skinIndex"] = 0
        this.displayObject["_skinName"] = "default"
        this._aniPath = url
        this.asSkeleton["_aniPath"] = url
        this._complete = handler
        this._loadAniMode = aniMode
        const content = Loader.getRes(url)
        if (!content) {
            Laya.loader.load([{url: url, type: Loader.BUFFER}], Handler.create(this, this._onLoaded))
        } else {
            this._onLoaded()
        }
        // (<Skeleton>this._displayObject).load(url, handler, aniMode)
    }

    /**
     * 加载完成
     */
    private _onLoaded() {
        const arraybuffer: ArrayBuffer = Loader.getRes(this._aniPath)
        if (!arraybuffer) {
            this._aniPath = null
            return
        }
        Templet["TEMPLET_DICTIONARY"] ??= {}
        let tFactory: Templet
        tFactory = Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName]
        if (tFactory) {
            if (tFactory.isParseFail) {
                this._parseFail()
            } else {
                if (tFactory.isParserComplete) {
                    this._parseComplete()
                } else {
                    tFactory.on(Event.COMPLETE, this, this._parseComplete)
                    tFactory.on(Event.ERROR, this, this._parseFail)
                }
            }

        } else {
            tFactory = new Templet()
            tFactory._setCreateURL(this._aniPath)
            Templet["TEMPLET_DICTIONARY"][this._aniPath + this.cacheName] = tFactory
            tFactory.on(Event.COMPLETE, this, this._parseComplete)
            tFactory.on(Event.ERROR, this, this._parseFail)
            tFactory.isParserComplete = false
            tFactory.parseData(null, arraybuffer)
        }
    }

    /**
     * 解析完成
     */
    private _parseComplete() {
        if (this.isDisposed) return
        const tTemple: Templet = Templet["TEMPLET_DICTIONARY"]?.[this._aniPath + this.cacheName]
        if (tTemple) {
            this.asSkeleton.init(tTemple, this._loadAniMode)
            // this.play(0, true)
        }
        runFun(this._complete, this)
    }

    /**
     * 解析失败
     */
    private _parseFail() {
        Log.error("[Error]:" + this._aniPath + " Parsing failed")
    }

    /**
     * 延迟播放动画
     * @param    playDelay    延迟时间
     * @param    nameOrIndex    动画名字或者索引
     * @param    loop        是否循环播放
     * @param    force        false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param    start        起始时间
     * @param    end            结束时间
     * @param    freshSkin    是否刷新皮肤数据
     */
    playDelay(playDelay: number, nameOrIndex: string | number | (string | number)[] | ISkeletonPlay, loop: boolean, force = true, start = 0, end = 0, freshSkin = true) {
        if (!this.asSkeleton.templet) return
        Laya.timer.once(playDelay, this, this.play, [nameOrIndex, loop, force, start, end, freshSkin])
    }

    /**
     * 通过名字显示一套皮肤
     * @param    name    皮肤的名字
     * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
     */
    showSkinByName(name: string, freshSlotIndex = true) {
        this.asSkeleton.showSkinByName(name, freshSlotIndex)
    }

    /**
     * 通过索引显示一套皮肤
     * @param    skinIndex    皮肤索引
     * @param    freshSlotIndex    是否将插槽纹理重置到初始化状态
     */
    showSkinByIndex(skinIndex: number, freshSlotIndex = true) {
        this.asSkeleton.showSkinByIndex(skinIndex, freshSlotIndex)
    }

    getAniIndexByName(name: string) {
        return this.asSkeleton.getAniIndexByName(name)
    }

    getAllAnimation() {
        return this.asSkeleton.templet?._anis
    }

    getAllSkin(): SkinData[] {
        return this.asSkeleton.templet?.skinDataArray
    }

    // AnimationContent
    getAnimation(aniIndex: number | string): AnimationContent {
        if (typeof aniIndex === "string") {
            return this.getAllAnimation().find(value => value.name === aniIndex)
        }
        return this.getAllAnimation()[aniIndex]
    }

    /**
     * 获取动画时长 毫秒
     * @param aniIndex
     */
    getAnimDuration(aniIndex: number | string | (number | string)[]) {
        if (Array.isArray(aniIndex)) {
            let duration = 0
            for (let i = 0; i < aniIndex.length; i++) {
                duration += this.getAnimDuration(aniIndex[i])
            }
            return duration
        }
        return this.getAnimation(aniIndex)?.playTime || 0
    }

    getAnimFrame(aniIndex: number | string) {
        return this.getAnimation(aniIndex).totalKeyframeDatasLength
    }

    get currAniIndex(): number {
        return this.asSkeleton["_currAniIndex"]
    }

    /**
     * 根据动作名和插槽骨骼名,来获取该骨骼在该动作播放时,每一帧该骨骼坐标位置,返回所有帧数骨骼坐标位置组成的列表
     * @param nameOrIndex
     * @param boneName
     */
    getBoneCoords(nameOrIndex: string | number, boneName: string): number[] {
        return this.asSkeleton["getBoneCoords"](nameOrIndex, boneName)
    }

    getSlotXByName(name: string) {
        const slot = this.getBoneSlotByName(name)
        return slot ? slot.currDisplayData.transform.x : 0
    }

    getSlotYByName(name: string) {
        const slot = this.getBoneSlotByName(name)
        return slot ? -slot.currDisplayData.transform.y : 0
    }

    getSlotPointByName(name: string) {
        const slot = this.getBoneSlotByName(name)
        return slot ? new Point(slot.currDisplayData.transform.x, -slot.currDisplayData.transform.y) : null
    }

    getBoneSlotByName(name: string) {
        let slot: BoneSlot = null
        if (this.asSkeleton.templet) {
            slot = this.asSkeleton.getSlotByName(name)
        }
        return slot
    }

    private static _emptyTexture: Texture
    static get emptyTexture() {
        GSkeleton._emptyTexture ??= Texture.create(HTMLImage.create(50, 50, TextureFormat.R8G8B8A8), 0, 0, 50, 50)
        return GSkeleton._emptyTexture
    }


    /**
     * 设置插槽的某个皮肤
     * @param slotName 插槽名字
     * @param skin Texture 或 fairy gui 的路径  如：//package/skin
     */
    setSlotSkin(slotName: string, skin: Texture | string = GSkeleton.emptyTexture) {
        let texture = null
        if (skin && typeof skin === "string") {
            const packageItem = UIPackage.getItemByURL(skin)
            if (packageItem) {
                texture = packageItem.load() as Texture
            }
        } else {
            texture = skin
        }
        let slot = this.getBoneSlotByName(slotName)
        if (this.aniMode > 0) {
            this.asSkeleton.setSlotSkin(slotName, texture)
            return
        }
        slot = this.getBoneSlotByName(slotName)
        if (slot) {
            if (texture && texture != GSkeleton.emptyTexture) {
                slot.currDisplayData.width = texture.width
                slot.currDisplayData.height = texture.height
                slot.currDisplayData.transform.scY = -1
            }
            slot.currDisplayData.texture = texture
            slot.currTexture = texture
            this.clearCache()
        } else {
            Log.debug("not found BoneSlot name = " + slotName)
        }
    }

    /**
     * 换装的时候，需要清一下缓冲区
     */
    private clearCache() {
        if (this.aniMode == 0) {
            const _graphicsCache: GraphicsAni[][] = this.asSkeleton.templet["_graphicsCache"]
            for (let i = 0, n = _graphicsCache.length; i < n; i++) {
                for (let j = 0, len = _graphicsCache[i].length; j < len; j++) {
                    let gp = _graphicsCache[i][j]
                    if (gp && gp != this.displayObject.graphics) {
                        GraphicsAni.recycle(gp)
                    }
                }
                _graphicsCache[i].length = 0
            }
        }
    }

    override on(type: string, thisObject: any, listener: Function, args: any[] = null) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.push(new Handler(thisObject, listener, args))
            return
        }
        super.on(type, thisObject, listener, args)
    }

    override off(type: string, thisObject: any, listener: Function) {
        if (type == Event.STOPPED) {
            for (let i = this.stoppedHandler.length - 1; i > -1; i--) {
                const handler = this.stoppedHandler[i]
                if (handler.caller == thisObject && handler.method == listener) {
                    handler.clear()
                    this.stoppedHandler.splice(i, 1)
                }
            }
            return
        }
        super.off(type, thisObject, listener)
    }

    offAll(type: string = null) {
        if (type == Event.STOPPED) {
            this.stoppedHandler.length = 0
            return
        }
        this.displayObject.offAll(type)
    }

    override dispose() {
        const obj = Templet["TEMPLET_DICTIONARY"]
        if (obj) {
            const tTemple: Templet = obj[this._aniPath + this.cacheName]
            if (tTemple) delete obj[this._aniPath + this.cacheName]
        }
        // tTemple?.destroy()
        while (this.stoppedHandler.length) {
            this.stoppedHandler.shift().clear()
        }
        Laya.timer.clearAll(this)
        super.dispose()
    }

}