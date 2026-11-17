import { IElementConfig } from "./IElementConfig";
import { ITextConfig } from "./ITextConfig";
import { IGraphConfig } from "./IGraphConfig";
import { IIconConfig } from "./IIconConfig";
import { IButtonConfig } from "./IButtonConfig";
import { EPanel } from "./EPanel";
import { PureList } from "./PureList";
import { UIFactory } from "./UIFactory";

/**
 * UIFactory 构建管线原子执行器
 * 严格按照官方 FGUI (setup_beforeAdd / setup_afterAdd) 的两阶段离散时序执行属性赋值与内容灌入
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

        // 2. 根据组件类型执行各自的 setup_beforeAdd (完全对齐子类 setup_beforeAdd 源码)
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
            if (tConf.underline) node.underline = tConf.underline;
            if (tConf.italic) node.italic = tConf.italic;
            if (tConf.bold) node.bold = tConf.bold;
            if (tConf.stroke && tConf.strokeColor) {
                node.strokeColor = tConf.strokeColor;
                node.stroke = tConf.stroke;
            }

            // GTextInput 特有 beforeAdd 属性 (对齐 GTextInput.setup_beforeAdd)
            if (node instanceof fgui.GTextInput) {
                if (tConf.promptText !== undefined) {
                    node.promptText = tConf.promptText;
                }
                node.editable = true;
            }

            // 【排版高度保障】：在 beforeAdd 阶段预先填入文本并计算真实渲染尺寸
            if (tConf.text) {
                const rawText = tConf.text.replace(/\\n/g, "\n");
                if (node instanceof fgui.GRichTextField) {
                    node.text = rawText.replace(/\n/g, "<br/>");
                } else {
                    node.text = rawText;
                }
            }
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
            // 对齐 GLoader.setup_beforeAdd (第 7729 行)
            const iConf = elData as IIconConfig;
            if (iConf.fill) {
                const fillMap: Record<string, number> = {
                    none: fgui.LoaderFillType.None,
                    scale: fgui.LoaderFillType.Scale,
                    scaleMatchHeight: fgui.LoaderFillType.ScaleMatchHeight,
                    scaleMatchWidth: fgui.LoaderFillType.ScaleMatchWidth,
                    scaleFree: fgui.LoaderFillType.ScaleFree,
                    scaleNoBorder: fgui.LoaderFillType.ScaleNoBorder
                };
                node.fill = fillMap[iConf.fill] ?? fgui.LoaderFillType.None;
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
        }
    }

    /**
     * 【官方步骤 3: 后置初始化与内容安全注入 (setup_afterAdd)】
     *
     * 对应官方 GObject.setup_afterAdd 阶段：
     * 1. 此时节点已加入父级层级树（child.parent 已确立），且已完成尺寸测量与 RelationType 关系绑定；
     * 2. 安全灌入真实可变内容：文本内容的 text/promptText、图标图片的 url、按钮的 title/icon/selectedTitle/selectedIcon 及关联控制器；
     * 3. 集中调度装配全系 10 大 Gears 状态机；
     * 4. 安全解除构建保护锁：`node["_underConstruct"] = false`，组件正式投入运行。
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

            // 对齐 GButton.setup_afterAdd 第 3858~3860 行：关联单选组或切页控制器
            if (bConf.relatedController) {
                let targetCtrl: Nullable<fgui.Controller> = null;
                if (typeof bConf.relatedController === "string") {
                    // 优先从直接父级查找，找不到则向上级父容器查找
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
                        node.selected = (node.relatedPageId === targetCtrl.selectedPageId);
                    }
                }
            }
        }

        // 3. 集中装配齿轮 Gears
        setupGearsFunc(node, elData, parentNode, index);

        // 4. 官方生命周期保护期结束，解除锁定
        node["_underConstruct"] = false;
    }
}
