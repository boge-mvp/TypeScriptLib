import { IElementConfig } from "./IElementConfig";
import { ITextConfig } from "./ITextConfig";
import { IGraphConfig } from "./IGraphConfig";
import { IIconConfig } from "./IIconConfig";
import { IButtonConfig } from "./IButtonConfig";
import { IListConfig } from "./IListConfig";
import { IGroupConfig } from "./IGroupConfig";
import { ILabelConfig } from "./ILabelConfig";
import { IComboBoxConfig } from "./IComboBoxConfig";
import { IScrollBarConfig } from "./IScrollBarConfig";
import { ITreeConfig } from "./ITreeConfig";
import { IMovieClipConfig } from "./IMovieClipConfig";
import { ILoader3DConfig } from "./ILoader3DConfig";
import { IImageConfig } from "./IImageConfig";
import { EPanel } from "./EPanel";
import { PureList } from "./PureList";
import { UIFactory } from "./UIFactory";

/**
 * UIFactory 构建管线原子执行器
 *
 * 严格按照官方 FGUI (setup_beforeAdd / setup_afterAdd) 的两阶段离散时序执行属性赋值与内容灌入。
 */
export class UIFactoryPipeline {

    /**
     * 【官方步骤 1: 纯实例化 (Instantiation)】
     *
     * 仅根据元素声明的 type 调用具体子类的构造函数创建空节点，绝不提前灌入 text / url / gears 数据。
     * 这与 FairyGUI 官方 UIObjectFactory.newObject(type) 的设计完全一致。
     *
     * @param elData 声明式元素配置对象
     * @returns 实例化的空 FGUI 组件对象，若类型无法识别则返回 null
     */
    public static instantiateNode(elData: IElementConfig): fgui.GObject | null {
        switch (elData.type) {
            case "text":
                if (elData.isInput) {
                    const inputNode = new fgui.GTextInput();
                    inputNode.editable = true;
                    if (elData.promptText !== undefined) {
                        inputNode.promptText = elData.promptText;
                    }
                    return inputNode;
                } else if (elData.isUbb) {
                    return new fgui.GRichTextField();
                } else {
                    return new fgui.GBasicTextField();
                }
            case "icon":
                return new fgui.GLoader();
            case "graph":
                return new fgui.GGraph();
            case "button":
                if (elData.skin) {
                    return fgui.UIPackage.createObjectFromURL(elData.skin) as fgui.GButton;
                } else {
                    return new fgui.GButton();
                }
            case "panel":
                return new EPanel();
            case "list":
                return new PureList();
            case "slider":
                return new fgui.GSlider();
            case "progressbar":
                return new fgui.GProgressBar();
            case "group":
                return new fgui.GGroup();
            case "label":
                return new fgui.GLabel();
            case "combobox":
                return new fgui.GComboBox();
            case "scrollbar":
                return new fgui.GScrollBar();
            case "tree":
                return new fgui.GTree();
            case "movieclip":
                return new fgui.GMovieClip();
            case "loader3d":
                return new fgui.GLoader3D();
            case "image":
                return new fgui.GImage();
            default:
                return null;
        }
    }

    /**
     * 【官方步骤 2: 前置初始化与分流赋值 (setup_beforeAdd)】
     *
     * 对应官方 GObject.setup_beforeAdd 阶段：
     * 1. 开启构建保护锁 `_underConstruct = true`，确保后续排版调用 setXY/setSize 时不会误触发齿轮拦截；
     * 2. 注入通用基础图元属性（alpha、rotation、visible、touchable、grayed、scale、pivot、size）；
     * 3. 按子类分流注入各类型特有样式（文本的 autoSize/字体/颜色、图形的矩形/圆/圆角、Loader的填充模式、按钮的按压反馈与 mode）；
     * 4. 严格禁止在此时提前赋值 text / url，杜绝引发过早排版和网络加载。
     *
     * @param node 刚刚实例化的空 FGUI 目标对象
     * @param elData 声明式元素配置对象
     */
    public static setup_beforeAdd(node: fgui.GObject, elData: IElementConfig): void {
        node["_underConstruct"] = true;

        // 1. 全组件通用基础属性 (对齐 GObject.setup_beforeAdd)
        if (elData.name) node.name = elData.name;
        if (elData.alpha !== undefined) node.alpha = elData.alpha;
        if (elData.rotation !== undefined) node.rotation = elData.rotation;
        if (elData.visible !== undefined) node.visible = elData.visible;
        if (elData.touchable !== undefined) node.touchable = elData.touchable;
        if (elData.grayed !== undefined) node.grayed = elData.grayed;
        if (elData.data !== undefined) node.data = elData.data;
        if (elData.blendMode) node.blendMode = elData.blendMode;

        if (elData.scaleX !== undefined || elData.scaleY !== undefined || elData.scale !== undefined) {
            const sx = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1);
            const sy = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1);
            node.setScale(sx, sy);
        }

        if (elData.pivotX !== undefined || elData.pivotY !== undefined) {
            node.setPivot(elData.pivotX || 0, elData.pivotY || 0, elData.asAnchor || false);
        }

        if (elData.width !== undefined && elData.height !== undefined) {
            node.setSize(elData.width, elData.height);
        } else if (elData.width !== undefined) {
            node.width = elData.width;
        } else if (elData.height !== undefined) {
            node.height = elData.height;
        }

        // 2. 根据组件类型执行各自的 setup_beforeAdd (完全对齐官方子类 setup_beforeAdd 源码)
        if (node instanceof fgui.GTextField) {
            const tConf = elData as ITextConfig;
            const hasW = tConf.width !== undefined && tConf.width > 0;
            const hasH = tConf.height !== undefined && tConf.height > 0;
            if (hasW && hasH) {
                node.autoSize = fgui.AutoSizeType.None;
            } else if (hasW && !hasH) {
                node.autoSize = fgui.AutoSizeType.Height;
            } else {
                node.autoSize = fgui.AutoSizeType.Both;
            }

            if (tConf.singleLine) node.singleLine = true;
            if (tConf.font) node.font = tConf.font;
            if (tConf.fontSize) node.fontSize = tConf.fontSize;
            if (tConf.color) node.color = tConf.color;
            if (tConf.align) node.align = tConf.align;
            if (tConf.valign) node.valign = tConf.valign;
            if (tConf.leading) node.leading = tConf.leading;
            if (tConf.letterSpacing) node.letterSpacing = tConf.letterSpacing;
            if (tConf.underline !== undefined) node.underline = tConf.underline;
            if (tConf.italic !== undefined) node.italic = tConf.italic;
            if (tConf.bold !== undefined) node.bold = tConf.bold;
            if (tConf.stroke !== undefined) node.stroke = tConf.stroke;
            if (tConf.strokeColor) node.strokeColor = tConf.strokeColor;

            // 文本排版排空拦截：直接强制执行 typeset，确保 autoSize 为 Height/Both 时即刻计算出真实的 textHeight！
            if (node["_textField"]) {
                node["_textField"]["typeset"]();
            } else if (typeof node.ensureSizeCorrect === "function") {
                node.ensureSizeCorrect();
            }
        } else if (node instanceof fgui.GGraph) {
            const gConf = elData as IGraphConfig;
            const lineSize = gConf.lineSize || 0;
            const lineColor = gConf.lineColor || "#000000";
            const fillColor = (gConf.fillColor ?? null) as unknown as string;
            const cornerRadius = gConf.cornerRadius;
            if (gConf.shape === "ellipse" || gConf.shape === "circle") {
                node.drawEllipse(lineSize, lineColor, fillColor);
            } else if (cornerRadius !== undefined) {
                const arr = Array.isArray(cornerRadius) ? cornerRadius : [cornerRadius, cornerRadius, cornerRadius, cornerRadius];
                node.drawRect(lineSize, lineColor, fillColor, arr);
            } else {
                node.drawRect(lineSize, lineColor, fillColor);
            }
        } else if (node instanceof fgui.GLoader) {
            const iConf = elData as IIconConfig;
            if (iConf.fill !== undefined) {
                if (typeof iConf.fill === "string") {
                    const fillMap: Record<string, number> = {
                        none: fgui.LoaderFillType.None,
                        scale: fgui.LoaderFillType.Scale,
                        scalematchheight: fgui.LoaderFillType.ScaleMatchHeight,
                        scalematchwidth: fgui.LoaderFillType.ScaleMatchWidth,
                        scalefree: fgui.LoaderFillType.ScaleFree,
                        scalenoborder: fgui.LoaderFillType.ScaleNoBorder
                    };
                    node.fill = fillMap[iConf.fill.toLowerCase()] ?? fgui.LoaderFillType.None;
                } else {
                    node.fill = iConf.fill;
                }
            } else if (iConf.width && iConf.height) {
                node.fill = fgui.LoaderFillType.ScaleFree;
            }
            if (iConf.shrinkOnly !== undefined) node.shrinkOnly = iConf.shrinkOnly;
            if (iConf.autoSize !== undefined) node.autoSize = iConf.autoSize;
            if (iConf.align) node.align = iConf.align;
            if (iConf.valign) node.verticalAlign = iConf.valign;
            if (iConf.color) node.color = iConf.color;
        } else if (node instanceof fgui.GButton) {
            const bConf = elData as IButtonConfig;
            let parsedMode = fgui.ButtonMode.Common;
            if (bConf.mode !== undefined) {
                if (typeof bConf.mode === "string") {
                    const l = bConf.mode.toLowerCase();
                    if (l === "check") parsedMode = fgui.ButtonMode.Check;
                    else if (l === "radio") parsedMode = fgui.ButtonMode.Radio;
                } else {
                    parsedMode = bConf.mode;
                }
            }
            node["_mode"] = parsedMode;
            if (bConf.downEffect !== undefined) {
                node["_downEffect"] = bConf.downEffect;
                if (bConf.downEffectValue !== undefined) {
                    node["_downEffectValue"] = bConf.downEffectValue;
                }
                if (bConf.downEffect === 2) {
                    node.setPivot(0.5, 0.5, node.pivotAsAnchor);
                }
            }
            if (!bConf.controllers || !bConf.controllers.some(c => c.name === "button")) {
                bConf.controllers = [
                    { name: "button", pages: ["up", "down", "over", "selectedOver"], selectedIndex: 0 },
                    ...(bConf.controllers || [])
                ];
            }
        } else if (node instanceof fgui.GGroup) {
            const grpConf = elData as IGroupConfig;
            if (grpConf.groupLayout !== undefined) {
                if (typeof grpConf.groupLayout === "string") {
                    const lMap: Record<string, number> = { none: 0, horizontal: 1, vertical: 2 };
                    node.layout = lMap[grpConf.groupLayout.toLowerCase()] ?? 0;
                } else {
                    node.layout = grpConf.groupLayout;
                }
            }
            if (grpConf.lineGap !== undefined) node.lineGap = grpConf.lineGap;
            if (grpConf.columnGap !== undefined) node.columnGap = grpConf.columnGap;
            if (grpConf.excludeInvisibles !== undefined) node.excludeInvisibles = grpConf.excludeInvisibles;
            if (grpConf.autoSizeDisabled !== undefined) node.autoSizeDisabled = grpConf.autoSizeDisabled;
            if (grpConf.mainGridIndex !== undefined) node.mainGridIndex = grpConf.mainGridIndex;
            if (grpConf.mainGridMinSize !== undefined) node.mainGridMinSize = grpConf.mainGridMinSize;
        } else if (node instanceof fgui.GImage) {
            const imgConf = elData as IImageConfig;
            if (imgConf.color) node.color = imgConf.color;
            if (imgConf.flip !== undefined) node.flip = imgConf.flip;
            if (imgConf.fillMethod !== undefined) node.fillMethod = imgConf.fillMethod;
            if (imgConf.fillOrigin !== undefined) node.fillOrigin = imgConf.fillOrigin;
            if (imgConf.fillClockwise !== undefined) node.fillClockwise = imgConf.fillClockwise;
            if (imgConf.fillAmount !== undefined) node.fillAmount = imgConf.fillAmount;
        } else if (node instanceof fgui.GMovieClip) {
            const mcConf = elData as IMovieClipConfig;
            if (mcConf.color) node.color = mcConf.color;
            if (mcConf.timeScale !== undefined) node.timeScale = mcConf.timeScale;
            if (mcConf.playing !== undefined) node.playing = mcConf.playing;
            if (mcConf.frame !== undefined) node.frame = mcConf.frame;
        } else if (node instanceof fgui.GLoader3D) {
            const l3dConf = elData as ILoader3DConfig;
            if (l3dConf.color) node.color = l3dConf.color;
            if (l3dConf.animationName) node.animationName = l3dConf.animationName;
            if (l3dConf.skinName) node.skinName = l3dConf.skinName;
            if (l3dConf.playing !== undefined) node.playing = l3dConf.playing;
            if (l3dConf.loop !== undefined) node.loop = l3dConf.loop;
            if (l3dConf.frame !== undefined) node.frame = l3dConf.frame;
        } else if (node instanceof fgui.GTree) {
            const treeConf = elData as ITreeConfig;
            if (treeConf.indent !== undefined) node.indent = treeConf.indent;
            if (treeConf.clickToExpand !== undefined) node.clickToExpand = treeConf.clickToExpand;
            if (treeConf.treeNodeRender) node.treeNodeRender = treeConf.treeNodeRender;
            if (treeConf.treeNodeWillExpand) node.treeNodeWillExpand = treeConf.treeNodeWillExpand;
        } else if (node instanceof fgui.GComboBox) {
            const cbConf = elData as IComboBoxConfig;
            if (cbConf.visibleItemCount !== undefined) node.visibleItemCount = cbConf.visibleItemCount;
            if (cbConf.titleColor) node.titleColor = cbConf.titleColor;
            if (cbConf.titleFontSize) node.titleFontSize = cbConf.titleFontSize;
            if (cbConf.popupDirection !== undefined) {
                if (typeof cbConf.popupDirection === "string") {
                    const pMap: Record<string, number> = { auto: 0, up: 1, down: 2 };
                    node.popupDirection = pMap[cbConf.popupDirection.toLowerCase()] ?? 0;
                } else {
                    node.popupDirection = cbConf.popupDirection;
                }
            }
        }
    }

    /**
     * 【官方步骤 3: 后置初始化与内容安全注入 (setup_afterAdd)】
     *
     * 对应官方 GObject.setup_afterAdd 阶段：
     * 1. 此时节点已加入父级层级树（child.parent 已确立），且已完成尺寸测量与 RelationType 关系绑定；
     * 2. 安全灌入真实可变内容：文本内容的 text/promptText、图标图片的 url、按钮的 title/icon/selectedTitle/selectedIcon 及关联控制器；
     * 3. 归属组 (group) 绑定：若声明了 group 属性，自动连接到父容器中的 GGroup 组对象；
     * 4. 集中调度装配全系 10 大 Gears 状态机；
     * 5. 安全解除构建保护锁：`node["_underConstruct"] = false`，组件正式投入运行。
     *
     * @param node 已加入显示列表的目标 FGUI 对象
     * @param elData 声明式元素配置对象
     * @param parentNode 直接父级容器 GComponent
     * @param index 子元件在父容器中的索引顺序
     * @param setupGearsFunc 齿轮装配引擎回调函数
     */
    public static setup_afterAdd(
        node: fgui.GObject,
        elData: IElementConfig,
        parentNode: fgui.GComponent,
        index: number,
        setupGearsFunc: (childNode: fgui.GObject, childData: IElementConfig, panelNode: fgui.GComponent, index: number) => void
    ): void {
        // 1. 文本内容此时才注入 (对齐 GTextField.setup_afterAdd)
        if (node instanceof fgui.GTextField) {
            const tConf = elData as ITextConfig;
            if (tConf.text) {
                const rawText = tConf.text.replace(/\\n/g, "\n");
                if (node instanceof fgui.GRichTextField) {
                    node.text = rawText.replace(/\n/g, "<br/>");
                } else {
                    node.text = rawText;
                }
            }
            if (typeof node.ensureSizeCorrect === "function") {
                node.ensureSizeCorrect();
            }
        }
        // 2. 外部资源 URL 此时才注入并开始加载 (对齐 GLoader.setup_afterAdd)
        else if (node instanceof fgui.GLoader) {
            const iConf = elData as IIconConfig;
            if (iConf.url) {
                const resPath = UIFactory.formatResUrl(iConf.url);
                node.url = Laya.URL.formatURL(resPath);
            }
        }
        // 3. 按钮 Title 与 Icon 注入 (对齐 GButton.setup_afterAdd 第 3832 行)
        else if (node instanceof fgui.GButton) {
            const bConf = elData as IButtonConfig;
            if (bConf.title) node.title = bConf.title;
            if (bConf.icon) node.icon = bConf.icon;
            if (bConf.selectedTitle) node.selectedTitle = bConf.selectedTitle;
            if (bConf.selectedIcon) node.selectedIcon = bConf.selectedIcon;
            if (bConf.titleColor) node.titleColor = bConf.titleColor;
            if (bConf.titleFontSize) node.titleFontSize = bConf.titleFontSize;
            if (bConf.selected !== undefined) node.selected = bConf.selected;
            if (bConf.sound) node["_sound"] = bConf.sound;
            if (bConf.soundVolumeScale !== undefined) node["_soundVolumeScale"] = bConf.soundVolumeScale;

            // 对齐 GButton.setup_afterAdd 第 3858~3860 行：关联单选组或切页控制器
            if (bConf.relatedController) {
                let targetCtrl: Nullable<fgui.Controller> = null;
                if (typeof bConf.relatedController === "string") {
                    let curP: Nullable<fgui.GComponent> = parentNode;
                    while (curP) {
                        targetCtrl = curP.getController(bConf.relatedController);
                        if (targetCtrl) break;
                        curP = curP.parent as fgui.GComponent;
                    }
                } else {
                    targetCtrl = bConf.relatedController;
                }
                if (targetCtrl) {
                    node.relatedController = targetCtrl;
                    if (bConf.pageId) {
                        const page = targetCtrl.getPageIdByName ? targetCtrl.getPageIdByName(bConf.pageId) : bConf.pageId;
                        node.relatedPageId = page || bConf.pageId;
                    }
                    if (bConf.selected !== undefined) {
                        node.selected = bConf.selected;
                    } else if (node.relatedPageId && targetCtrl.selectedPageId) {
                        node.selected = (node.relatedPageId === targetCtrl.selectedPageId);
                    }
                }
            }
        }
        // 4. GLabel 内容注入 (对齐 GLabel.setup_afterAdd)
        else if (node instanceof fgui.GLabel) {
            const lConf = elData as ILabelConfig;
            if (lConf.title) node.title = lConf.title;
            if (lConf.icon) node.icon = UIFactory.formatResUrl(lConf.icon);
            if (lConf.titleColor) node.titleColor = lConf.titleColor;
            if (lConf.titleFontSize) node.titleFontSize = lConf.titleFontSize;
            if (lConf.color) node.color = lConf.color;
            if (lConf.editable !== undefined) node.editable = lConf.editable;
        }
        // 5. GComboBox 选项数据与选择控制器注入 (对齐 GComboBox.setup_afterAdd)
        else if (node instanceof fgui.GComboBox) {
            const cbConf = elData as IComboBoxConfig;
            if (cbConf.items) node.items = cbConf.items;
            if (cbConf.values) node.values = cbConf.values;
            if (cbConf.icons) node.icons = cbConf.icons.map(u => UIFactory.formatResUrl(u));
            if (cbConf.selectedIndex !== undefined) node.selectedIndex = cbConf.selectedIndex;
            if (cbConf.value !== undefined) node.value = cbConf.value;

            if (cbConf.selectionController) {
                let targetCtrl: Nullable<fgui.Controller> = null;
                if (typeof cbConf.selectionController === "string") {
                    let curP: Nullable<fgui.GComponent> = parentNode;
                    while (curP) {
                        targetCtrl = curP.getController(cbConf.selectionController);
                        if (targetCtrl) break;
                        curP = curP.parent as fgui.GComponent;
                    }
                } else {
                    targetCtrl = cbConf.selectionController;
                }
                if (targetCtrl) {
                    node.selectionController = targetCtrl;
                }
            }
        }
        // 6. GList / GTree 属性控制器与分页控制器双向绑定
        else if (node instanceof fgui.GList) {
            const listConf = elData as IListConfig;
            if (listConf.selectionController) {
                let targetCtrl: Nullable<fgui.Controller> = null;
                if (typeof listConf.selectionController === "string") {
                    let curP: Nullable<fgui.GComponent> = parentNode;
                    while (curP) {
                        targetCtrl = curP.getController(listConf.selectionController);
                        if (targetCtrl) break;
                        curP = curP.parent as fgui.GComponent;
                    }
                } else {
                    targetCtrl = listConf.selectionController;
                }
                if (targetCtrl) {
                    node.selectionController = targetCtrl;
                }
            }
            if (listConf.pageController && node.scrollPane) {
                let targetCtrl: Nullable<fgui.Controller> = null;
                if (typeof listConf.pageController === "string") {
                    let curP: Nullable<fgui.GComponent> = parentNode;
                    while (curP) {
                        targetCtrl = curP.getController(listConf.pageController);
                        if (targetCtrl) break;
                        curP = curP.parent as fgui.GComponent;
                    }
                } else {
                    targetCtrl = listConf.pageController;
                }
                if (targetCtrl) {
                    node.scrollPane.pageController = targetCtrl;
                }
            }
        }
        // 7. GMovieClip 资源注入
        else if (node instanceof fgui.GMovieClip) {
            const mcConf = elData as IMovieClipConfig;
            if (mcConf.url) {
                node.url = UIFactory.formatResUrl(mcConf.url);
            }
        }
        // 8. GLoader3D 资源注入
        else if (node instanceof fgui.GLoader3D) {
            const l3dConf = elData as ILoader3DConfig;
            if (l3dConf.url) {
                node.url = UIFactory.formatResUrl(l3dConf.url);
            }
        }
        // 9. GImage 资源注入
        else if (node instanceof fgui.GImage) {
            const imgConf = elData as IImageConfig;
            if (imgConf.url) {
                const tex = UIFactory.getFguiTexture(imgConf.url);
                if (tex && node.image) {
                    node.image.texture = tex;
                }
            }
        }

        // 10. 组关联与通用后置属性绑定 (对齐 GObject.setup_afterAdd 第 1558~1564 行)
        if (elData.tooltips) node.tooltips = elData.tooltips;
        if (elData.group && parentNode) {
            const grp = parentNode.getChild(elData.group);
            if (grp instanceof fgui.GGroup) {
                node.group = grp;
            }
        }

        // 11. 集中装配齿轮 Gears
        setupGearsFunc(node, elData, parentNode, index);

        // 12. 官方生命周期保护期结束，解除锁定
        node["_underConstruct"] = false;
    }
}
