import ColorFilter = Laya.ColorFilter;
import Texture = Laya.Texture;
import Pool = Laya.Pool;
import CallLater = Laya.CallLater;
import Timer = Laya.Timer;
import PopupMenu = fgui.PopupMenu;
import GObject = fgui.GObject;
import GButton = fgui.GButton;
import GRoot = fgui.GRoot;
import {GGraphicsAni} from "./view/GGraphicsAni"
import {GSkeleton} from "./view/GSkeleton"
import {EDrawTextureCmd} from "./extends/EDrawTextureCmd"
import {SoundUtils} from "./utils/SoundUtils";
import {Log} from "./Log";
import {ETexture} from "./extends/ETexture";
import {UIFactory} from "./uifactory/UIFactory";
import {IBaseElementConfig} from "./uifactory/IBaseElementConfig";
import {IGraphConfig} from "./uifactory/IGraphConfig";
import {IIconConfig} from "./uifactory/IIconConfig";

export class DefineConfig {

    static init() {
        DefineConfig.defineLaya()
        DefineConfig.defineFairy()
    }

    /**
     *
     * @internal
     */
    private static defineLaya() {
        Object.defineProperty(Laya.Stage.prototype, "_changeCanvasSize", {
            value: function () {
                // Log.debug("_changeCanvasSize = " + Laya.Browser.clientWidth + " | " + Laya.Browser.clientHeight)
                if (Laya.Browser.clientHeight == Laya.Browser.clientWidth) {
                    Log.debug("refuse =!")
                    this.setScreenSize(this._width, this._height)
                    return
                }
                this.setScreenSize(Laya.Browser.clientWidth * Laya.Browser.pixelRatio, Laya.Browser.clientHeight * Laya.Browser.pixelRatio)
            }
        })

        // @ts-ignore
        const temp_updateTimers = Laya.Stage.prototype._updateTimers
        Object.defineProperty(Laya.Stage.prototype, "_updateTimers", {
            value: function () {
                if (!this.pauseUpdateTimer) temp_updateTimers()
            }
        })

        // 修复 LayaAir 2.x 原生 HitArea 缺失对 DrawPath 命令识别的官方已知缺陷 (确保 FGUI 中使用圆角的 GGraph 具有正常点击与拾取能力)
        if (Laya.HitArea) {
            const orig_isHitCmd = Laya.HitArea["_isHitCmd"];
            Laya.HitArea["_isHitCmd"] = function (x: number, y: number, cmd: any) {
                if (cmd && cmd.cmdID === "DrawPath") {
                    // cmd.paths 形如 [["moveTo", r0, 0], ["lineTo", w - r1, 0], ["arcTo", w, 0, w, r1, r1], ..., ["lineTo", w, h - r3], ...]
                    // 计算出路径外接包围盒进行精准矩形测试
                    let maxW = 0;
                    let maxH = 0;
                    if (cmd.paths && Array.isArray(cmd.paths)) {
                        for (let i = 0; i < cmd.paths.length; i++) {
                            const p = cmd.paths[i];
                            if (p && p[0] === "arcTo") {
                                if (p[1] > maxW) maxW = p[1];
                                if (p[2] > maxH) maxH = p[2];
                            }
                        }
                    }
                    if (maxW > 0 && maxH > 0) {
                        return x >= cmd.x && x <= cmd.x + maxW && y >= cmd.y && y <= cmd.y + maxH;
                    }
                    return false;
                }
                return orig_isHitCmd.call(this, x, y, cmd);
            };
        }

        Object.defineProperty(Laya.KeyBoardManager, "_addEvent", {
            value: function (type: any) {
                windowMy?.addEventListener(type, function (e: any) {
                    Laya.KeyBoardManager["_dispatch"](e, type)
                })
            }
        })

        // @ts-ignore
        Object.defineProperty(Laya.SoundManager, "autoStopMusic", {
            set(v: any) {
                // @ts-ignore
                Laya.stage.off(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur)
                // @ts-ignore
                Laya.stage.off(Laya.Event.FOCUS, null, _stageOnFocus)
                // @ts-ignore
                Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange)
                // @ts-ignore
                Laya.SoundManager._autoStopMusic = v
                if (v) {
                    // @ts-ignore
                    Laya.stage.on(Laya.Event.BLUR, null, Laya.SoundManager._stageOnBlur)
                    // @ts-ignore
                    Laya.stage.on(Laya.Event.FOCUS, null, _stageOnFocus)
                    // @ts-ignore
                    Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, null, _visibilityChange)
                }
            }
        })

        function _stageOnFocus() {
            // @ts-ignore
            Laya.SoundManager._stageOnFocus()
            // @ts-ignore
            const musicChannel: Laya.SoundChannel = Laya.SoundManager._musicChannel
            // @ts-ignore
            if (!Laya.SoundManager._blurPaused && musicChannel) {
                if (musicChannel.isStopped) musicChannel.resume()
                return
            }
            let bgMusic = Laya.SoundManager["_bgMusic"]
            // @ts-ignore
            Laya.SoundManager._blurPaused = false
            if (musicChannel) {
                if (musicChannel.isStopped) {
                    musicChannel.resume()
                } else {
                    musicChannel.play()
                }
            } else if (bgMusic && !Laya.SoundManager.musicMuted) {
                // 没有正在播放的声音  并且背景音乐又存在 不是静音状态
                Laya.SoundManager["_bgMusic"] = null
                SoundUtils.playMusic(bgMusic)
            }
        }

        function _visibilityChange() {
            if (Laya.stage.isVisibility) {
                _stageOnFocus()
            } else {
                // @ts-ignore
                Laya.SoundManager._stageOnBlur()
            }
        }

        Object.defineProperty(Laya.DrawTextureCmd, "create", {
            value: function (texture: Texture, x: number, y: number, width: number, height: number, matrix: Laya.Matrix | null, alpha: number, color: string | null, blendMode: string | null, uv?: number[]) {
                const cmd = Pool.getItemByClass("DrawTextureCmd", EDrawTextureCmd)
                cmd.texture = texture
                texture._addReference()
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
                    if (cmd instanceof EDrawTextureCmd) {
                        if (cmd.name && obj instanceof GSkeleton && obj.blendBoneSlotNames.indexOf(cmd.name) > -1) {
                            // cmd.blendMode = BlendMode.ADD
                            //#__NO_MANGLE_PROP_START__
                            cmd.blendMode = "add"
                        }
                    }
                    cmd.run(context, x, y)

                    if (cmd instanceof EDrawTextureCmd && this._sp && this._sp.hasListener(GSkeleton.UPDATE_BONE_SLOT + cmd.name)) {
                        this._sp.event(GSkeleton.UPDATE_BONE_SLOT + cmd.name, cmd)
                    }

                }
            }
        })
        // 更改值 并保留调用原始的
        const tempSaveToCmd = Laya.GraphicsAni.prototype._saveToCmd
        Object.defineProperty(Laya.GraphicsAni.prototype, "_saveToCmd", {
            value: function (fun: Function, args: any) {
                if (args instanceof EDrawTextureCmd) {
                    let sk: fgui.GObject
                    if (this._sp && (sk = fgui.GObject.cast(this._sp)) !== null && sk instanceof GSkeleton) {
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
                return tempSaveToCmd.call(this, fun, args)
            }
        })

        Object.defineProperty(Laya.Byte.prototype, "writeFguiString", {
            value: function (str: Nullable<string>, stringTable: string[]): void {
                if (!str) {
                    this.writeInt16(65534); // fgui null占位
                    return;
                }
                if (str === "") {
                    this.writeInt16(65533); // fgui 空字符串占位
                    return;
                }
                let idx = stringTable.indexOf(str);
                if (idx === -1) {
                    idx = stringTable.length;
                    stringTable.push(str);
                }
                this.writeInt16(idx);
            }
        })

        Object.defineProperties(Laya.Event, {
            SPINE_PLAY: {
                value: true,
                writable: true,
                configurable: true
            }
        })

        DefineConfig.defineSpineSkeleton()
        DefineConfig.defineSkeleton()
        DefineConfig.defineText()
        DefineConfig.defineTimer()

        // 动态注入 Laya.Texture 静态扩展方法
        Object.defineProperty(Laya.Texture, "createGradientTexture", {
            value: function (config: any) {
                return ETexture.createGradientTexture(config);
            }
        });
    }

    /**
     *
     * @internal
     */
    private static defineFairy() {
        if (!fgui || !fgui.GRoot) return
        Object.defineProperty(GRoot.prototype, "playOneShotSound", {
            value: function (url: string, volumeScale?: number) {
                if (fgui.ToolSet.startsWith(url, "ui://"))
                    return
                if (!volumeScale) volumeScale = 1
                SoundUtils.playSound(url, 1, undefined, volumeScale)
            }
        })
        Object.defineProperty(GButton.prototype, "__click", {
            value: function (evt: Laya.Event) {
                if (this._sound) {
                    let pi = fgui.UIPackage.getItemByURL(this._sound);
                    if (pi)
                        GRoot.inst.playOneShotSound(pi.file, this._soundVolumeScale);
                    else
                        GRoot.inst.playOneShotSound(this._sound, this._soundVolumeScale);
                }
                if (this._mode == fgui.ButtonMode.Check) {
                    if (this._changeStateOnClick) {
                        this.selected = !this._selected;
                        fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                    }
                } else if (this._mode == fgui.ButtonMode.Radio) {
                    if (this._changeStateOnClick && !this._selected) {
                        this.selected = true;
                        fgui.Events.dispatch(fgui.Events.STATE_CHANGED, this.displayObject, evt);
                    }
                } else {
                    if (this._relatedController)
                        this._relatedController.selectedPageId = this._relatedPageId;
                }
            }
        })

        // 给window添加排序  order
        Object.defineProperty(GRoot.prototype, "showWindow", {
            value: function (win: fgui.Window) {
                this.addChild(win)
                const cnt = this.numChildren
                let wins: fgui.Window[] = []
                for (let i = cnt - 1; i >= 0; i--) {
                    const g = this.getChildAt(i)
                    if ((g instanceof fgui.Window) && g.modal) {
                        wins.push(g)
                    }
                }

                let pos = -1
                const winOrder = win.order || 0
                for (let i = 0; i < wins.length; i++) {
                    let order = wins[i].order || 0
                    if (winOrder > order) {
                        pos = i
                        this.setChildIndexBefore(win, this.getChildIndex(wins[i]))
                    }
                }

                if (pos == -1) {
                    win.requestFocus()
                }

                if (win.x > this.width)
                    win.x = this.width - win.width;
                else if (win.x + win.width < 0)
                    win.x = 0;

                if (win.y > this.height)
                    win.y = this.height - win.height;
                else if (win.y + win.height < 0)
                    win.y = 0;

                this.adjustModalLayer()
            }
        })

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
                runFun(itemObject.data)
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
                }, [this._url]), undefined, Laya.Loader.IMAGE)
            }
        })
        Object.defineProperty(fgui.GLoader.prototype, "loadExternal", {
            value: function () {
                this.loadCount = 0
                this.temp_loadExternal()
            }
        })

        const GLoader_onExternalLoadSuccess = fgui.GLoader.prototype["onExternalLoadSuccess"]
        Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadSuccess", {
            value: function (texture: Laya.Texture) {
                GLoader_onExternalLoadSuccess.call(this, texture)
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })

        const GLoader_loadFromPackage = fgui.GLoader.prototype["loadFromPackage"]
        Object.defineProperty(fgui.GLoader.prototype, "loadFromPackage", {
            value: function (itemURL: string) {
                GLoader_loadFromPackage.call(this, itemURL)
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })

        const GLoader_onExternalLoadFailed = fgui.GLoader.prototype["onExternalLoadFailed"]
        Object.defineProperty(fgui.GLoader.prototype, "onExternalLoadFailed", {
            value: function () {
                if (this.loadRetryCount > 0 && this.loadCount < this.loadRetryCount) {
                    this.loadCount++
                    this.temp_loadExternal()
                    return
                }
                GLoader_onExternalLoadFailed.call(this)
                this.displayObject?.event(Laya.Event.COMPLETE)
            }
        })

        // 修复 HTML 富文本空格被清除的问题
        const tagOpen = /\[\w{1,15}(?:=[^\]]{0,30})?]/
        const tagClose = /\[\/\w{1,15}]/
        const tag = `(?:${tagOpen.source}|${tagClose.source})`
        const regExp = new RegExp(`(?<=${tag})\\s+|\\s+(?=${tag})`, 'g')
        const UBBParser_parse = fgui.UBBParser.prototype.parse
        Object.defineProperty(fgui.UBBParser.prototype, "parse", {
            value: function (text: string, remove?: boolean): string {
                text = text.replace(regExp, m => "&nbsp;".repeat(m.length))
                return UBBParser_parse.call(this, text, remove)
            }
        })

        Object.defineProperty(fgui.GComponent.prototype, "getChildByNames", {
            value: function (...name: string[]) {
                let child = null
                for (const key of name) {
                    child = this.getChild(key)
                    if (child) return child
                }
                return child
            }
        })

        Object.defineProperty(fgui.GComponent.prototype, "setupScrollPanel", {
            value: function (this: fgui.GComponent, overflowType?: fgui.OverflowType, scrollType?: fgui.ScrollType) {
                if (overflowType == undefined)
                    overflowType = fgui.OverflowType.Visible
                if (overflowType == fgui.OverflowType.Scroll) {
                    if (this._displayObject == this._container) {
                        this._container = new Laya.Sprite();
                        this._displayObject.addChild(this._container);
                    }
                    this._scrollPane = UIFactory.createScrollPanel(this, scrollType ?? fgui.ScrollType.Vertical)
                } else this.setupOverflow(overflowType)
            }
        })

        const GComponent_setBounds = fgui.GComponent.prototype.setBounds
        Object.defineProperty(fgui.GComponent.prototype, "setBounds", {
            value: function (this: fgui.GComponent, ax: number, ay: number, aw: number, ah: number) {
                GComponent_setBounds.call(this, ax, ay, aw, ah)
                const w = Math.round(ax + aw)
                const h = Math.round(ay + ah)
                if (this._scrollPane) {
                    this._displayObject?.graphics?.drawRect(0, 0, w, h, color("#6c6666", 0))
                }
            }
        })

        const GComponent_handleSizeChanged = fgui.GComponent.prototype["handleSizeChanged"]
        Object.defineProperty(fgui.GComponent.prototype, "handleSizeChanged", {
            value: function (this: fgui.GComponent) {
                GComponent_handleSizeChanged.call(this)
                const renderBg = this["renderBg"]
                if (renderBg) {
                    this.drawBackground(renderBg)
                }
            }
        })

        Object.defineProperty(fgui.GComponent.prototype, "drawBackground", {
            value: function (this: fgui.GComponent, config?: string | IIconConfig | IGraphConfig | IBaseElementConfig) {
                this["renderBg"] = config
                this.displayObject.graphics.clear()
                if (!config) return
                const initW = this.width
                const initH = this.height
                if (typeof config === "string") {
                    if (config.startsWith("#") || config.startsWith("rgb")) {
                        this.displayObject.graphics.drawRect(0, 0, initW, initH, config)
                    } else {
                        let tex = UIFactory.getFguiTexture(config)
                        if (tex == null) this.displayObject.graphics.loadImage(Laya.URL.formatURL(UIFactory.formatResUrl(config)), 0, 0, initW, initH)
                        else this.displayObject.graphics.drawTexture(tex, 0, 0, initW, initH)
                    }
                } else if (typeof config === "object") {
                    if ("type" in config && config.type === "icon") {
                        let tex = UIFactory.getFguiTexture(config.url)
                        if (tex == null) this.displayObject.graphics.loadImage(Laya.URL.formatURL(UIFactory.formatResUrl(config.url)), 0, 0, initW, initH)
                        else this.displayObject.graphics.drawTexture(tex, 0, 0, initW, initH)
                    } else {
                        const graphBg = config as IGraphConfig & { color?: string };
                        const w = initW || graphBg.width || this.width
                        const h = initH || graphBg.height || this.height
                        const fillColor = graphBg.fillColor || graphBg.color || null
                        const lineSize = graphBg.lineSize || 0
                        const lineColor = graphBg.lineColor || "#000000"
                        const cornerRadius = graphBg.cornerRadius
                        if (cornerRadius !== undefined) {
                            const r = Array.isArray(cornerRadius) ? cornerRadius : [cornerRadius, cornerRadius, cornerRadius, cornerRadius]
                            const paths = [
                                ["moveTo", r[0], 0],
                                ["lineTo", w - r[1], 0],
                                ["arcTo", w, 0, w, r[1], r[1]],
                                ["lineTo", w, h - r[3]],
                                ["arcTo", w, h, w - r[3], h, r[3]],
                                ["lineTo", r[2], h],
                                ["arcTo", 0, h, 0, h - r[2], r[2]],
                                ["lineTo", 0, r[0]],
                                ["arcTo", 0, 0, r[0], 0, r[0]],
                                ["closePath"]
                            ]
                            this.displayObject.graphics.drawPath(
                                0, 0, paths,
                                fillColor ? { fillStyle: fillColor } : null,
                                lineSize > 0 ? { strokeStyle: lineColor, lineWidth: lineSize } : undefined
                            )
                        } else {
                            this.displayObject.graphics.drawRect(0, 0, w, h, fillColor, lineSize > 0 ? lineColor : undefined, lineSize)
                        }
                    }
                }
            }
        })

        // 扩展 FGUI 官方 GGraph.setProp/getProp 弥补其遗漏 OutlineColor (描边颜色) 的已知缺陷
        if (fgui.GGraph) {
            const orig_GGraph_setProp = fgui.GGraph.prototype.setProp;
            Object.defineProperty(fgui.GGraph.prototype, "setProp", {
                value: function (this: fgui.GGraph, index: number, value: any) {
                    if (index === fgui.ObjectPropID.OutlineColor) {
                        this["_lineColor"] = value;
                        if (this["_type"] !== 0) this["updateGraph"]();
                    } else {
                        orig_GGraph_setProp.call(this, index, value);
                    }
                }
            });
            const orig_GGraph_getProp = fgui.GGraph.prototype.getProp;
            Object.defineProperty(fgui.GGraph.prototype, "getProp", {
                value: function (this: fgui.GGraph, index: number) {
                    if (index === fgui.ObjectPropID.OutlineColor) {
                        return this["_lineColor"];
                    }
                    return orig_GGraph_getProp.call(this, index);
                }
            });
        }

        // 扩展 FGUI 官方 GLoader3D.loadExternal 支持纯路径加载外部 Spine 3.8/4.0 资源 (.json / .skel)
        if (fgui.GLoader3D) {
            const orig_GLoader3D_onChange = fgui.GLoader3D.prototype["onChange"];
            Object.defineProperty(fgui.GLoader3D.prototype, "onChange", {
                value: function (this: fgui.GLoader3D) {
                    const content = this["_content"];
                    if (!content) return;
                    if (typeof content["showSkinByName"] === "function") {
                        orig_GLoader3D_onChange.call(this);
                        return;
                    }
                    // Laya.SpineSkeleton 适配分支
                    if (this["_animationName"]) {
                        if (this["_playing"]) {
                            if (typeof content.play === "function") {
                                content.play(this["_animationName"], this["_loop"], true);
                            }
                        } else if (typeof content.stop === "function") {
                            content.stop();
                        }
                    } else if (typeof content.stop === "function") {
                        content.stop();
                    }
                    if (this["_skinName"] && typeof content.getSkeleton === "function") {
                        const sk = content.getSkeleton();
                        if (sk && typeof sk.setSkinByName === "function") {
                            try {
                                sk.setSkinByName(this["_skinName"]);
                                if (typeof sk.setSlotsToSetupPose === "function") {
                                    sk.setSlotsToSetupPose();
                                }
                            } catch (e) {
                                // ignore invalid skin name
                            }
                        }
                    }
                }
            });

            Object.defineProperty(fgui.GLoader3D.prototype, "loadExternal", {
                value: function (this: fgui.GLoader3D) {
                    const url = this["_url"];
                    if (!url || !Laya.SpineTemplet) return;
                    const formattedUrl = Laya.URL.formatURL(url);
                    const isSpine = /\.json(\?.*)?$/i.test(formattedUrl) || /\.skel(\?.*)?$/i.test(formattedUrl);
                    if (!isSpine) return;

                    const savedUrl = url;
                    const templet = new Laya.SpineTemplet(Laya.SpineVersion ? Laya.SpineVersion.v3_8 : Laya.SpineVersion?.v3_8);
                    templet.on(Laya.Event.COMPLETE, this, (spine: Laya.SpineTempletBase) => {
                        if (this.isDisposed) return;
                        const t = spine || templet;
                        const skel = t.buildArmature()
                        const sw = t?.skeletonData?.width || this.width || 160;
                        const sh = t?.skeletonData?.height || this.height || 160;
                        this["sourceWidth"] = sw;
                        this["sourceHeight"] = sh;
                        this.setSkeleton(skel.getSkeleton(), new Laya.Point(sw * 0.5, sh * 0.5));
                        // setSkeleton 内部会置空 _url，恢复 _url 以便业务侧读取
                        this["_url"] = savedUrl;
                    });
                    templet.loadAni(formattedUrl);
                }
            });
        }

    }

    /**
     *
     * @internal
     */
    private static defineText() {
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
        Object.defineProperty(Laya.Text.prototype, "isDrawRemoveLine", {
            get() {
                return this._isDrawRemoveLine
            },
            set(v: any) {
                this.underline = v
                this._isDrawRemoveLine = v
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

        if (!Laya.HTMLDivElement) return
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
    }

    /**
     *
     * @internal
     */
    private static defineTimer() {

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

    /**
     *
     * @internal
     */
    private static defineSkeleton() {
        if (!Laya.Skeleton) return
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

        const tempDraw = Laya.BoneSlot.prototype.draw
        Object.defineProperty(Laya.BoneSlot.prototype, "draw", {
            value: function (graphics: Laya.GraphicsAni, boneMatrixArray: any[], noUseSave = false, alpha = 1) {
                graphics.boneSlotName = this.name
                tempDraw.call(this, graphics, boneMatrixArray, noUseSave, alpha)
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
                    return !content
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

    }

    /**
     *
     * @internal
     */
    private static defineSpineSkeleton() {
        if (!Laya.SpineTempletBase) return
        Object.defineProperties(Laya.SpineTempletBase.prototype, {
            loadResUrl: {
                value: null,
                writable: true
            }
        })
        // @ts-ignore
        const SpineTemplet_3_x_loadAni = Laya.SpineTemplet_3_x.prototype.loadAni
        // @ts-ignore
        Object.defineProperty(Laya.SpineTemplet_3_x.prototype, "loadAni", {
            value: function (jsonOrSkelUrl: string) {
                this.loadResUrl = jsonOrSkelUrl
                SpineTemplet_3_x_loadAni.call(this, jsonOrSkelUrl)
            }
        })
        // @ts-ignore
        const SpineTemplet_4_0_loadAni = Laya.SpineTemplet_4_0.prototype.loadAni
        // @ts-ignore
        Object.defineProperty(Laya.SpineTemplet_4_0.prototype, "loadAni", {
            value: function (jsonOrSkelUrl: string) {
                this.loadResUrl = jsonOrSkelUrl
                SpineTemplet_4_0_loadAni.call(this, jsonOrSkelUrl)
            }
        })

        // 修改4.0
        if (spine.AssetManager.prototype.success) {
            // @ts-ignore
            const SpineAssetManager_success = spine.AssetManager.prototype.success
            Object.defineProperty(Laya.SpineAssetManager.prototype, "success", {
                value: function (callback: (path: string, asset: any) => void, path: string, data: any) {
                    SpineAssetManager_success.call(this, callback, path, data)
                    if (!callback) {
                        if (typeof data !== "string") {
                            data = JSON.stringify(data)
                        }
                        this.assets[path] = data.replace(/3\.8\.75/g, "3.8")
                    }
                }
            })
        } else {
            // 修改3.x
            const AssetManager_loadText = spine.AssetManager.prototype.loadText
            Object.defineProperty(spine.AssetManager.prototype, "loadText", {
                value: function (path: string, success?: (path: string, text: string) => void, error?: (path: string, message: string) => void) {
                    if (!success) {
                        AssetManager_loadText.call(this, path, (path: string, text: any) => {
                            if (typeof text !== "string") {
                                text = JSON.stringify(text)
                            }
                            this.assets[path] = text.replace(/3\.8\.75/g, "3.8")
                        })
                    } else AssetManager_loadText.call(this, path, success, error)
                }
            })
        }

        // 销毁 templet 检查判断
        const SpineSkeleton_destroy = Laya.SpineSkeleton.prototype.destroy
        Object.defineProperty(Laya.SpineSkeleton.prototype, "destroy", {
            value: function (destroyChild = true) {
                this._templet ??= new Laya.SpineTempletBase()
                this.state ??= new spine.AnimationState(null as unknown as spine.AnimationStateData)
                SpineSkeleton_destroy.call(this, destroyChild)
            }
        })

        const SpineSkeleton_init = Laya.SpineSkeleton.prototype.init
        Object.defineProperty(Laya.SpineSkeleton.prototype, "init", {
            value: function (templet: Laya.SpineTempletBase) {
                let that = this
                SpineSkeleton_init.call(this, templet)
                this.state.listeners[0].event = function (entry: spine.TrackEntry, event: spine.Event) {
                    let eventData = {
                        audioValue: event.data.audioPath,
                        audioPath: event.data.audioPath,
                        floatValue: event.floatValue,
                        intValue: event.intValue,
                        name: event.data.name,
                        stringValue: event.stringValue,
                        time: event.time * 1000,
                        balance: event.balance,
                        volume: event.volume
                    };
                    // console.log("event:", entry, event);
                    that.event(Laya.Event.LABEL, eventData);
                    if (that._playAudio && eventData.audioValue) {
                        let time = (that.currentPlayTime * 1000 - eventData.time) / 1000
                        if (time < 0) time = 0
                        SoundUtils.playSound(templet["_textureDic"].root + eventData.audioValue, 1,
                            undefined, 1, time)
                        Laya.SoundManager.playbackRate = that._playbackRate
                    }
                }


            }
        })

        Object.defineProperty(Laya.SpineSkeleton.prototype, "_onAniSoundStoped", {
            value: function (force: boolean) {
                let _channel: Laya.SoundChannel
                for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                    _channel = this._soundChannelArr[i];
                    if (_channel && (_channel.isStopped || force)) {
                        !_channel.isStopped && _channel.stop();
                        this._soundChannelArr.splice(i, 1);
                        // SoundManager.removeChannel(_channel); //  是否需要? 去掉有什么好处? 是否还需要其他操作?
                        len--;
                        i--;
                    }
                }
            }
        })

        // 添加动画渲染通知
        // @ts-ignore
        const SpineSkeleton_update = Laya.SpineSkeleton.prototype._update
        Object.defineProperty(Laya.SpineSkeleton.prototype, "_update", {
            value: function () {
                SpineSkeleton_update.call(this)
                let events = this._events
                let slot: string[] = []
                let slots: string[] = []
                let bones: string[] = []
                for (const key in events) {
                    if (key.startsWith(GSkeleton.UPDATE_BONE_SLOT)) {
                        slot.push(key.removeAll(GSkeleton.UPDATE_BONE_SLOT))
                    } else if (key.startsWith(GSkeleton.UPDATE_BONE_RENDER)) {
                        bones.push(key.removeAll(GSkeleton.UPDATE_BONE_RENDER))
                    } else if (key.startsWith(GSkeleton.UPDATE_SLOT_RENDER)) {
                        slots.push(key.removeAll(GSkeleton.UPDATE_SLOT_RENDER))
                    }
                }
                let skeleton: spine.Skeleton = this.skeleton

                if (slot.length > 0) {
                    for (const value of skeleton.slots) {
                        if (slot.indexOf(value.data?.name) > -1) {
                            this.event(GSkeleton.UPDATE_BONE_SLOT + value.data.name, value)
                        }
                    }
                }
                if (slots.length > 0) {
                    skeleton.slots
                        .filter(value => slots.includes(value.data?.name))
                        .forEach(value =>
                            this.event(GSkeleton.UPDATE_SLOT_RENDER + value.data.name, value)
                        )
                }

                if (bones.length > 0) {
                    skeleton.bones
                        .filter(value => bones.includes(value.data?.name))
                        .forEach(value =>
                            this.event(GSkeleton.UPDATE_BONE_RENDER + value.data.name, value)
                        )
                }

            }
        })
    }

}


