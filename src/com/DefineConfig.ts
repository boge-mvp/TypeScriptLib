import {GGraphicsAni} from "./view/GGraphicsAni"
import {GSkeleton} from "./view/GSkeleton"
import {MyDrawTextureCmd} from "./core/MyDrawTextureCmd"
import ColorFilter = Laya.ColorFilter
import Texture = Laya.Texture
import Pool = Laya.Pool
import CallLater = Laya.CallLater
import Timer = Laya.Timer;
import PopupMenu = fgui.PopupMenu;
import GObject = fgui.GObject;
import GButton = fgui.GButton;
import GRoot = fgui.GRoot;
import {StringUtil} from "./utils/StringUtil";
import {Log} from "./Log";

export class DefineConfig {

    static init() {
        DefineConfig.defineLaya()
        DefineConfig.defineFairy()
    }

    private static defineLaya() {
        Object.defineProperty(Laya.Stage.prototype, "_changeCanvasSize", {
            value: function () {
                Log.debug("_changeCanvasSize = " + Laya.Browser.clientWidth + " | " + Laya.Browser.clientHeight)
                if (Laya.Browser.clientHeight == Laya.Browser.clientWidth) {
                    Log.debug("refuse =!")
                    this.setScreenSize(this._width, this._height)
                    return
                }
                this.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio)
            }
        })

        Object.defineProperty(Laya.Stage.prototype, "temp_updateTimers", {
            // @ts-ignore
            value: Laya.Stage.prototype._updateTimers
        })
        Object.defineProperty(Laya.Stage.prototype, "_updateTimers", {
            value: function () {
                if (!this.pauseUpdateTimer) this.temp_updateTimers()
            }
        })

        Object.defineProperty(Laya.KeyBoardManager, "_addEvent", {
            value: function (type) {
                (window.parent || window).addEventListener(type, function (e: any) {
                    Laya.KeyBoardManager["_dispatch"](e, type)
                })
            }
        })


        Object.defineProperty(Laya.DrawTextureCmd, "create", {
            value: function (texture: Texture, x: number, y: number, width: number, height: number, matrix: Laya.Matrix | null, alpha: number, color: string | null, blendMode: string | null, uv?: number[]) {
                const cmd = Pool.getItemByClass("DrawTextureCmd", MyDrawTextureCmd)
                cmd.texture = texture
                texture["_addReference"]()
                cmd.x = x
                cmd.y = y
                cmd.width = width
                cmd.height = height
                cmd.matrix = matrix
                cmd.alpha = alpha
                cmd.color = color
                cmd.blendMode = blendMode
                cmd.uv = uv == undefined ? null : uv
                if (color) {
                    cmd.colorFlt = new ColorFilter()
                    cmd.colorFlt.setColor(color)
                }
                return cmd
            }
        })

        Object.defineProperty(Laya.GraphicsAni, "create", {
            value: GGraphicsAni.create
        })
        Object.defineProperty(Laya.GraphicsAni.prototype, "_renderAll", {
            value: function (sprite: Laya.Sprite, context: Laya.Context, x: number, y: number) {
                const cmds = this.cmds
                const obj = fgui.GObject.cast(sprite)
                let cmd: any
                let i = 0, n = cmds.length
                for (; i < n; i++) {
                    cmd = cmds[i]
                    if (cmd instanceof MyDrawTextureCmd) {
                        if (obj instanceof GSkeleton && obj.blendBoneSlotNames.indexOf(cmd.name) > -1) {
                            // cmd.blendMode = BlendMode.ADD
                            cmd.blendMode = "add"
                        }
                    }
                    cmd.run(context, x, y)

                    if (cmd instanceof MyDrawTextureCmd && this._sp != null && this._sp.hasListener(GSkeleton.UPDATE_BONE_SLOT + cmd.name)) {
                        this._sp.event(GSkeleton.UPDATE_BONE_SLOT + cmd.name, cmd)
                    }

                }
            }
        })
        // 更改值 并保留调用原始的
        Object.defineProperty(Laya.GraphicsAni.prototype, "tempSaveToCmd", {
            value: Laya.GraphicsAni.prototype["_saveToCmd"]
        })
        Object.defineProperty(Laya.GraphicsAni.prototype, "_saveToCmd", {
            value: function (fun: Function, args: any) {
                if (args instanceof MyDrawTextureCmd) {
                    let sk: fgui.GObject
                    if (this._sp != null && (sk = fgui.GObject.cast(this._sp)) != null && sk instanceof GSkeleton) {
                        if (sk.clearBoneSlotOffset.indexOf(this.boneSlotName) >= 0) {
                            args.x = 0
                            args.y = 0
                        } else if (sk.clearBoneSlotOffsetX.indexOf(this.boneSlotName) >= 0) {
                            args.x = 0
                        } else if (sk.clearBoneSlotOffsetY.indexOf(this.boneSlotName) >= 0) {
                            args.y = 0
                        }
                    }
                    args.name = this.boneSlotName || ""
                }
                return this.tempSaveToCmd.call(this, fun, args)
            }
        })

        DefineConfig.defineSpineSkeleton()

        Object.defineProperty(Laya.Skeleton.prototype, "getAniIndexByName", {
            value: function (name: string) {
                let index = -1
                let i = 0, n = this._templet.getAnimationCount()
                for (; i < n; i++) {
                    const animation = this._templet.getAnimation(i)
                    if (animation && name == animation.name) {
                        index = i
                        break
                    }
                }
                return index
            }
        })
        Object.defineProperty(Laya.Skeleton.prototype, "getBoneCoords", {
            value: function (nameOrIndex: string | number, boneName: string) {
                const arrCoords: number[] = []
                let aniClipIndex: number
                if (typeof nameOrIndex === "string") {
                    aniClipIndex = this.getAniIndexByName(nameOrIndex)
                } else {
                    aniClipIndex = nameOrIndex
                }
                const curOriginalData: Float32Array = new Float32Array(this._templet.getTotalkeyframesLength(aniClipIndex))

                const interval = 1000.0 / this._player.cacheFrameRate
                const playTime = this._templet.getAniDuration(aniClipIndex)
                const lenJ = playTime / interval
                for (let j = 0; j < lenJ; j++) {
                    const curTime = j * this._player.cacheFrameRateInterval
                    this._templet.getOriginalData(aniClipIndex, curOriginalData, this._player.templet._fullFrames[aniClipIndex], j, curTime)

                    let tStartIndex = 0
                    let tParentTransform: Laya.Transform
                    let tSrcBone: Laya.Bone
                    const boneCount = this._templet.srcBoneMatrixArr.length
                    const tSectionArr: number[] = this._aniSectionDic[aniClipIndex]
                    let i = 0, n = 0
                    for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
                        tSrcBone = this._boneList[i]
                        tParentTransform = this._templet.srcBoneMatrixArr[i]
                        tStartIndex++
                        tStartIndex++
                        tStartIndex++
                        tStartIndex++
                        const boneX = tParentTransform.x + curOriginalData[tStartIndex++]
                        const boneY = tParentTransform.y + curOriginalData[tStartIndex++]
                        if (tSrcBone.name == boneName) {
                            arrCoords.push(boneX)
                            arrCoords.push(boneY)
                            break
                        }
                        if (this._templet.tMatrixDataLen === 8) {
                            tStartIndex++
                            tStartIndex++
                        }
                    }
                }

                return arrCoords

            }
        })

        Object.defineProperty(Laya.BoneSlot.prototype, "tempDraw", {
            value: Laya.BoneSlot.prototype.draw
        })
        Object.defineProperty(Laya.BoneSlot.prototype, "draw", {
            value: function (graphics, boneMatrixArray, noUseSave = false, alpha = 1) {
                graphics.boneSlotName = this.name
                this.tempDraw.call(this, graphics, boneMatrixArray, noUseSave, alpha)
            }
        })

        Object.defineProperty(Laya.Templet.prototype, "_parseTexturePath", {
            value: function () {
                if (this._isDestroyed) {
                    this.destroy()
                    return
                }
                let i = 0
                this._loadList = []
                let tByte = new Laya.Byte(this.getPublicExtData())
                let tX = 0, tY = 0, tWidth = 0, tHeight = 0
                let tFrameX = 0, tFrameY = 0, tFrameWidth = 0, tFrameHeight = 0
                let tTempleData = 0
                let tTextureLen = tByte.getInt32()
                let tTextureName = tByte.readUTFString()
                let tTextureNameArr = tTextureName.split("\n")
                let tSrcTexturePath: string
                for (i = 0; i < tTextureLen; i++) {
                    tSrcTexturePath = this._path + tTextureNameArr[i * 2]
                    tTextureName = tTextureNameArr[i * 2 + 1]

                    tX = tByte.getFloat32()
                    tY = tByte.getFloat32()
                    tWidth = tByte.getFloat32()
                    tHeight = tByte.getFloat32()

                    tTempleData = tByte.getFloat32()
                    tFrameX = isNaN(tTempleData) ? 0 : tTempleData
                    tTempleData = tByte.getFloat32()
                    tFrameY = isNaN(tTempleData) ? 0 : tTempleData
                    tTempleData = tByte.getFloat32()
                    tFrameWidth = isNaN(tTempleData) ? tWidth : tTempleData
                    tTempleData = tByte.getFloat32()
                    tFrameHeight = isNaN(tTempleData) ? tHeight : tTempleData
                    if (this._loadList.indexOf(tSrcTexturePath) == -1) {
                        this._loadList.push(tSrcTexturePath)
                    }
                }


                let loadFile: string[] = this._loadList.filter(function (loadPath: string) {
                    const content = Laya.loader.getRes(loadPath)
                    return content == null
                })

                if (loadFile.length > 0) {
                    Laya.loader.load(loadFile, Laya.Handler.create(this, this._textureComplete))
                } else {
                    this._textureComplete()
                }
            }
        })
        Object.defineProperty(Laya.Templet.prototype, "deleteAniData", {
            value: function (aniIndex: number) {
            }
        })

        Object.defineProperties(Laya.Text.prototype, {
            _isDrawRemoveLine: {
                value: false,
                writable: true,
                enumerable: true
            },
            removeLineColor: {
                value: null,
                writable: true
            },
            removeLineWidth: {
                value: 1,
                writable: true
            },
            removeLineTilt: {
                value: true,
                writable: true
            }
        })
        Object.defineProperty(Laya.Text.prototype, "_drawUnderline", {
            value: function (align: string, x: number, y: number, lineIndex: number) {
                let lineWidth = this._lineWidths[lineIndex]
                switch (align) {
                    case 'center':
                        x -= lineWidth / 2
                        break
                    case 'right':
                        x -= lineWidth
                        break
                    case 'left':
                    default:
                        break
                }

                if (this.isDrawRemoveLine) {
                    if (this.removeLineTilt) {
                        y += this._charSize.height
                        this._graphics.drawLine(x, 0, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth)
                    } else {
                        y += this._charSize.height / 2
                        this._graphics.drawLine(x, y, x + lineWidth, y, this.removeLineColor || this.color, this.removeLineWidth)
                    }
                } else {
                    y += this._charSize.height
                    this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1)
                }
            }
        })
        Object.defineProperty(Laya.Text.prototype, "isDrawRemoveLine", {
            get() {
                return this._isDrawRemoveLine
            },
            set(v: any) {
                this.underline = v
                this._isDrawRemoveLine = v
            }
        })

        //修复单行文本对齐异常
        Object.defineProperty(Laya.HTMLDivElement.prototype, "_updateGraphic", {
            value: function () {
                this._doClears();
                this.graphics.clear(true);
                this._repaintState = 0;
                this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
                const bounds = this._element.getBounds();
                if (bounds) this.setSelfBounds(bounds);
                //this.hitArea = bounds;
                const sizeW = bounds.width > this.width ? bounds.width : this.width;
                this.size(sizeW, bounds.height);
            }
        })
        // 修复 宽高设置无用
        Object.defineProperty(Laya.HTMLDivElement.prototype, "width", {
            get() {
                if (this.contextWidth > super.width) {
                    return this.contextWidth
                }
                return super.width
            },
            set(value: number) {
                super.width = value
                this.style.width = value
            }
        })
        Object.defineProperty(Laya.HTMLDivElement.prototype, "height", {
            get() {
                if (this.contextHeight > super.height) {
                    return this.contextHeight
                }
                return super.height
            },
            set(value: number) {
                super.height = value
                this.style.height = value
            }
        })

        // 清理所有数据
        Object.defineProperty(CallLater.prototype, "clear", {
            value: function (caller: any) {
                for (let i = 0; i < this._laters.length; i++) {
                    const handler = this._laters[i]
                    if (handler.caller == caller) {
                        handler.clear()
                    }
                }
            }
        })
        // 清理所有数据
        Object.defineProperty(CallLater.prototype, "clearAll", {
            value: function () {
                for (let i = 0; i < this._laters.length; i++) {
                    if (this._laters.length > i) this._laters[i].clear()
                }
            }
        })

        DefineConfig.defineTimer()

    }

    private static defineFairy() {

        Object.defineProperty(PopupMenu.prototype, "__clickItem2", {
            value: function (itemObject: GObject) {
                if (!(itemObject instanceof GButton))
                    return
                if (itemObject.grayed) {
                    this._list.selectedIndex = -1
                    return
                }
                let c = itemObject.asCom.getController("checked")
                if (c && c.selectedIndex != 0) {
                    if (c.selectedIndex == 1)
                        c.selectedIndex = 2
                    else
                        c.selectedIndex = 1
                }
                let r = <GRoot>(this._contentPane.parent)
                r?.hidePopup(this.contentPane)
                if (itemObject.data != null) {
                    (<Laya.Handler>itemObject.data).run()
                }
            }
        })

        Object.defineProperties(fgui.GLoader.prototype, {
            loadRetryCount: {
                value: 0,
                writable: true
            },
            loadCount: {
                value: 0,
                writable: true
            }
        })

        Object.defineProperty(fgui.GLoader.prototype, "temp_loadExternal", {
            value: function () {
                fgui.AssetProxy.inst.load(this._url, Laya.Handler.create(this, (url: string, tex: Laya.Texture) => {
                    if (this._url === url) this.__getResCompleted(tex)
                }, [this._url]), null, Laya.Loader.IMAGE);


            }
        })
        Object.defineProperty(fgui.GLoader.prototype, "loadExternal", {
            value: function () {
                this.loadCount = 0
                this.temp_loadExternal()
            }
        })

        Object.defineProperty(fgui.GLoader.prototype, "temp_onExternalLoadSuccess", {
            value: fgui.GLoader.prototype["onExternalLoadSuccess"]
        })
        Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadSuccess", {
            value: function (texture: Laya.Texture) {
                this.temp_onExternalLoadSuccess(texture)
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })

        Object.defineProperty(fgui.GLoader.prototype, "temp_loadFromPackage", {
            value: fgui.GLoader.prototype["loadFromPackage"]
        })
        Object.defineProperty(fgui.GLoader.prototype, "loadFromPackage", {
            value: function (itemURL: string) {
                this.temp_loadFromPackage(itemURL)
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })

        Object.defineProperty(fgui.GLoader.prototype, "temp_onExternalLoadFailed", {
            value: fgui.GLoader.prototype["onExternalLoadFailed"]
        })
        Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadFailed", {
            value: function () {
                if (this.loadRetryCount > 0 && this.loadCount < this.loadRetryCount) {
                    this.loadCount++
                    this.temp_loadExternal()
                    return
                }
                this.temp_onExternalLoadFailed()
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })


    }

    private static defineTimer() {
        Object.defineProperty(Timer.prototype, "tempClearAll", {
            value: Timer.prototype.clearAll
        })
        Object.defineProperty(Timer.prototype, "clearAll", {
            value: function (caller: any) {
                this.tempClearAll(caller)
                CallLater.I.clear(caller)
            }
        })
        Object.defineProperty(Timer.prototype, "clearAllTimer", {
            value: function () {
                //处理handler
                for (let i = 0; i < this._handlers.length; i++) {
                    if (i < this._handlers.length) this._handlers[i].clear()
                }
                CallLater.I.clearAll()
            }
        })
    }

    private static defineSpineSkeleton() {
        // 修改4.0
        if (spine.AssetManager.prototype["success"]) {
            Object.defineProperty(spine.AssetManager.prototype, "tempSuccess", {
                // @ts-ignore
                value: spine.AssetManager.prototype.success
            })
            Object.defineProperty(Laya.SpineAssetManager.prototype, "success", {
                value: function (callback: (path: string, asset) => void, path: string, data: any) {
                    this.tempSuccess(callback, path, data)
                    if (!callback) {
                        if (typeof data !== "string") {
                            data = JSON.stringify(data)
                        }
                        this.assets[path] = data.replace(/3\.8\.75/g, "3.8")
                    }
                }
            })
            // // 有预加载  立即返回  默认是延迟返回
            // Object.defineProperty(spine.Downloader.prototype, "tempDownloadText", {
            //     value: spine.Downloader.prototype.downloadText
            // })
            // Object.defineProperty(spine.Downloader.prototype, "downloadText", {
            //     value: function (url: string, success?: (path: string, text: string) => void, error?: (path: string, message: string) => void) {
            //         const content = Laya.loader.getRes(url)
            //         if (content) {
            //             if (this.rawDataUris[url])
            //                 url = this.rawDataUris[url];
            //             if (this.start(url, success, error))
            //                 return;
            //             this.finish(url, 200, new Uint8Array(content))
            //         } else this.tempDownloadText(url, success, error)
            //     }
            // })
        } else {
            // 修改3.x
            Object.defineProperty(spine.AssetManager.prototype, "tempLoadText", {
                value: spine.AssetManager.prototype.loadText
            })
            Object.defineProperty(spine.AssetManager.prototype, "loadText", {
                value: function (path: string, success?: (path: string, text: string) => void, error?: (path: string, message: string) => void) {
                    if (!success) {
                        this.tempLoadText(path, (path: string, text: any) => {
                            if (typeof text !== "string") {
                                text = JSON.stringify(text)
                            }
                            this.assets[path] = text.replace(/3\.8\.75/g, "3.8")
                        })
                    } else this.tempLoadText(path, success, error)
                }
            })
            // // 有预加载  立即返回  默认是延迟返回
            // Object.defineProperty(spine.AssetManager.prototype, "tempDownloadText", {
            //     // @ts-ignore
            //     value: spine.AssetManager.prototype.downloadText
            // })
            // Object.defineProperty(spine.AssetManager.prototype, "downloadText", {
            //     value: function (url: string, success?: (data: any) => void, error?: (message: string, path: string) => void) {
            //         const content = Laya.loader.getRes(url)
            //         if (content) success(content)
            //         else this.tempDownloadText(url, success, error)
            //     }
            // })
        }

        // 销毁 templet 检查判断
        Object.defineProperty(Laya.SpineSkeleton.prototype, "tempDestroy", {
            value: Laya.SpineSkeleton.prototype.destroy
        })
        Object.defineProperty(Laya.SpineSkeleton.prototype, "destroy", {
            value: function (destroyChild = true) {
                if (this._templet == null) this._templet = new Laya.SpineTempletBase()
                if (this.state == null) this.state = new spine.AnimationState(null)
                this.tempDestroy(destroyChild)
            }
        })

        // 添加动画渲染通知
        Object.defineProperty(Laya.SpineSkeleton.prototype, "tempUpdate", {
            // @ts-ignore
            value: Laya.SpineSkeleton.prototype._update
        })
        Object.defineProperty(Laya.SpineSkeleton.prototype, "_update", {
            value: function () {
                this.tempUpdate()
                let events = this._events
                let slot: string[] = []
                for (const key in events) {
                    if (key.startsWith(GSkeleton.UPDATE_BONE_SLOT)) {
                        slot.push(StringUtil.remove(key, GSkeleton.UPDATE_BONE_SLOT))
                    }
                }
                let skeleton: spine.Skeleton = this.skeleton
                for (const value of skeleton.slots) {
                    if (slot.indexOf(value.data?.name) > -1) {
                        this.event(GSkeleton.UPDATE_BONE_SLOT + value.data.name, value)
                    }
                }
            }
        })
    }


}


