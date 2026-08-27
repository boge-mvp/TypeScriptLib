import GBasicTextField = fgui.GBasicTextField;
import GTextField = fgui.GTextField;
import GRichTextField = fgui.GRichTextField;
import ScrollType = fgui.ScrollType;
import GLoader = fgui.GLoader;
import LoaderFillType = fgui.LoaderFillType;
import Handler = Laya.Handler;
import ToolSet = fgui.ToolSet;
import GComponent = fgui.GComponent;
import {EPanel} from "./EPanel";
import {EList} from "./EList";
import {IBaseElementConfig} from "./IBaseElementConfig";
import {IButtonConfig} from "./IButtonConfig";
import {IElementConfig} from "./IElementConfig";
import {IGraphConfig} from "./IGraphConfig";
import {IGraphicsCmdConfig} from "./IGraphicsCmdConfig";
import {IIconConfig} from "./IIconConfig";
import {ILayoutConfig} from "./ILayoutConfig";
import {IListConfig} from "./IListConfig";
import {IPanelConfig} from "./IPanelConfig";
import {ITextConfig} from "./ITextConfig";
import {IViewConfig} from "./IViewConfig";
/**
 * 纯代码 FGUI 组件工厂
 *
 * 基于结构化配置（IElementConfig 体系）在运行期创建整套 FGUI 界面：
 * 文本/图片/矢量图形/面板/列表/按钮多态路由、弹性流式布局引擎
 * （vertical/horizontal 流 + alignItems/justifyContent + 百分比定位）、
 * 反射式滚动容器激活（去 fgui 编辑器资源包依赖）。
 */
export class EUIFactory {

    private static customCreators: {
        [type: string]: (elData: IElementConfig, containerW: number, containerH: number) => fgui.GObject
    } = {};

    /**
     * 注册自定义元件类型创建器，实现业务元件在 UI 工厂的零侵入扩展
     */
    public static registerCreator(type: string, creator: (elData: IElementConfig, containerW: number, containerH: number) => fgui.GObject) {
        EUIFactory.customCreators[type] = creator;
    }

    /**
     * 元件多态工厂核心路由：根据配置中的 type 类型，自动派发并路由分流到特定的 UI 创建器中
     * @param elData 待解析的单个元件配置
     * @param containerW 外部容器的参考像素宽度
     * @param containerH 外部容器的参考像素高度
     * @returns 返回初始化完毕的具体多态 FGUI 节点实例
     */
    static createElement<T extends fgui.GObject>(elData: IElementConfig, containerW: number, containerH: number): T {
        let node: Nullable<T> = null;
        // 优先匹配自定义注册的类型创建器 (type -> function)
        if (EUIFactory.customCreators[elData.type]) {
            node = EUIFactory.customCreators[elData.type](elData, containerW, containerH) as T;
        } else {
            if (elData.type === "text") {
                if (elData.isUbb === true) {
                    node = EUIFactory.createRichTextField(elData) as unknown as T;
                } else {
                    node = EUIFactory.createText(elData) as unknown as T;
                }
            } else if (elData.type === "icon") {
                node = EUIFactory.createIcon(elData) as unknown as T;
            } else if (elData.type === "graph") {
                node = EUIFactory.createGraph(elData) as unknown as T;
            } else if (elData.type === "panel") {
                node = EUIFactory.createPanel(elData, containerW, containerH) as unknown as T;
            } else if (elData.type === "list") {
                node = EUIFactory.createList(elData, containerW, containerH) as unknown as T;
            } else if (elData.type === "button") {
                node = EUIFactory.createButton(elData) as unknown as T;
            }
        }
        if (node && elData.graphics && elData.graphics.length > 0) {
            EUIFactory.applyGraphics(node, elData.graphics);
        }
        return node as T;
    }

    /**
     * 工厂函数：基于配置数据创建富文本对象 (GRichTextField)
     * 并强制启用 UBB 富文本语法解析，自动换行解析
     */
    static createRichTextField(elData: ITextConfig): fgui.GRichTextField {
        const textNode = new GRichTextField()
        textNode.ubbEnabled = true
        EUIFactory.createTextField(elData, textNode)
        return textNode
    }

    /**
     * 工厂函数：基于配置数据创建普通文本对象 (GBasicTextField)
     */
    static createText(elData: ITextConfig): fgui.GBasicTextField {
        const textNode = new GBasicTextField()
        EUIFactory.createTextField(elData, textNode)
        return textNode
    }

    /**
     * 核心公共装配函数：统一为 FGUI 各种多态文本组件（普通/富文本）注入字体、行距、描边及对齐等参数
     * @param elData 静态或动态映射来的文本配置数据
     * @param textNode 待装饰的 FGUI 文本底层组件实例
     */
    static createTextField(elData: ITextConfig, textNode: GTextField) {

        if (elData.name) textNode.name = elData.name;

        const initW = elData.width || 0
        const initH = elData.height || 0

        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1)
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1)
        textNode.setScale(scaleX, scaleY)

        const pX = elData.pivotX !== undefined ? elData.pivotX : 0
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0
        textNode.setPivot(pX, pY, elData.asAnchor)
        textNode.rotation = elData.rotation !== undefined ? elData.rotation : 0

        textNode.fontSize = elData.fontSize || 20
        textNode.color = elData.color || "#ffffff"
        textNode.align = elData.align || "left"
        textNode.valign = elData.valign || "middle"
        textNode.leading = elData.leading || 4
        textNode.letterSpacing = elData.letterSpacing || 0
        textNode.underline = elData.underline === true
        textNode.italic = elData.italic === true
        textNode.bold = elData.bold === true
        textNode.singleLine = elData.singleLine === true
        textNode.setSize(initW, initH)

        if (initW > 0 && initH > 0) {
            textNode.autoSize = fgui.AutoSizeType.None
        } else if (initW > 0) {
            textNode.autoSize = fgui.AutoSizeType.Height
        } else {
            textNode.autoSize = fgui.AutoSizeType.Both
        }

        if (elData.stroke) {
            textNode.stroke = elData.stroke
            textNode.strokeColor = elData.strokeColor || "#000000"
        }
        let text = elData.text || ""
        if (textNode instanceof fgui.GRichTextField && textNode.ubbEnabled) {
            text = ToolSet.encodeHTML(text)
            text = text.replace(/\n/g, "<br/>")
        }
        textNode.text = text
        textNode.ensureSizeCorrect()
    }

    /**
     * 工厂函数：创建并初始化 FGUI 图像装载器 (GLoader)
     * 支持指定宽高缩放、旋转锚点、加载外部物理 URL 以及装配九宫格 (sizeGrid)
     */
    static createIcon(elData: IIconConfig): fgui.GLoader {
        const iconNode = new GLoader()

        if (elData.name) iconNode.name = elData.name;

        const initW = elData.width || 80
        const initH = elData.height || 80
        iconNode.setSize(initW, initH)

        if (elData.clip) {
            iconNode.displayObject.scrollRect = new Laya.Rectangle(0, 0, initW, initH);
        }

        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1)
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1)
        iconNode.setScale(scaleX, scaleY)

        iconNode.align = "center"
        iconNode.verticalAlign = "middle"

        if (elData.fill !== undefined) {
            if (typeof elData.fill === "number") {
                iconNode.fill = elData.fill;
            } else {
                const fillMap: { [key: string]: number } = {
                    "none": LoaderFillType.None,
                    "scale": LoaderFillType.Scale,
                    "scalematchheight": LoaderFillType.ScaleMatchHeight,
                    "scalematchwidth": LoaderFillType.ScaleMatchWidth,
                    "scalefree": LoaderFillType.ScaleFree,
                    "scalenoborder": LoaderFillType.ScaleNoBorder
                };
                const fillStr = String(elData.fill).toLowerCase();
                iconNode.fill = fillMap[fillStr] !== undefined ? fillMap[fillStr] : LoaderFillType.None;
            }
        } else {
            iconNode.fill = LoaderFillType.None;
        }

        const pX = elData.pivotX !== undefined ? elData.pivotX : 0
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0
        iconNode.setPivot(pX, pY, elData.asAnchor)
        iconNode.rotation = elData.rotation !== undefined ? elData.rotation : 0

        iconNode.on(Laya.Event.COMPLETE, this, function () {
            const tex = iconNode.content?.texture
            if (tex) {
                let sizeChanged = false;
                if (!elData.width) {
                    iconNode.width = tex.width;
                    sizeChanged = true;
                }
                if (!elData.height) {
                    iconNode.height = tex.height;
                    sizeChanged = true;
                }
                if (sizeChanged && iconNode.parent) {
                    iconNode.parent.ensureBoundsCorrect();
                }
            }
        })
        iconNode.url = Laya.URL.formatURL(elData.url)
        return iconNode
    }

    /**
     * 工厂函数：基于 FGUI 绘制能力在运行期动态绘制矢量几何图形 (GGraph)
     * 支持边框线宽、边框颜色、内部纯色填充、以及极为灵活的多度圆角数组解析
     */
    static createGraph(elData: IGraphConfig): fgui.GGraph {
        const graphNode = new fgui.GGraph()

        if (elData.name) graphNode.name = elData.name;

        const initW = elData.width || 0
        const initH = elData.height || 0
        graphNode.setSize(initW, initH)

        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1)
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1)
        graphNode.setScale(scaleX, scaleY)

        const pX = elData.pivotX !== undefined ? elData.pivotX : 0
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0
        graphNode.setPivot(pX, pY, elData.asAnchor)
        graphNode.rotation = elData.rotation !== undefined ? elData.rotation : 0

        const lineSize = elData.lineSize !== undefined ? elData.lineSize : 0
        const lineColor = elData.lineColor || null
        const fillColor = elData.fillColor || null
        graphNode.alpha = elData.alpha !== undefined ? elData.alpha : 1

        let cornerRadius: undefined | number[] = elData.cornerRadius as number[] | undefined;
        if (cornerRadius !== undefined) {
            if (!Array.isArray(cornerRadius)) {
                cornerRadius = [cornerRadius]
            }
            const len = cornerRadius.length
            if (len > 4) {
                cornerRadius.length = 4
            } else {
                for (let i = 0; i < 4 - len; i++) {
                    cornerRadius.push(len == 1 ? cornerRadius[0] : 0)
                }
            }
        }
        // 引擎声明 fillColor/lineColor 为必填 string，实际透传 Laya Graphics 支持 null（不绘制）
        graphNode.drawRect(lineSize, lineColor as string, fillColor as string, cornerRadius)
        return graphNode
    }

    /**
     * 动态列表/网格渲染引擎：基于 FGUI List 机制实现高密度、高性能的滚动网格/列表装配
     * 支持 Flow 换行、分页以及单行单列排列，利用 itemRenderer 闭包回调在运行期递归向子项填充 Elements 渲染
     */
    static createList(elData: IListConfig, containerW: number, containerH: number): fgui.GComponent {
        const listNode = new EList();

        if (elData.name) listNode.name = elData.name;

        const layoutStr = elData.listLayout || "SingleColumn";
        let listLayout = fgui.ListLayoutType.SingleColumn;
        if (layoutStr === "SingleRow") {
            listLayout = fgui.ListLayoutType.SingleRow;
        } else if (layoutStr === "FlowHorizontal") {
            listLayout = fgui.ListLayoutType.FlowHorizontal;
        } else if (layoutStr === "FlowVertical") {
            listLayout = fgui.ListLayoutType.FlowVertical;
        } else if (layoutStr === "Pagination") {
            listLayout = fgui.ListLayoutType.Pagination;
        }
        listNode.layout = listLayout;
        const internal = listNode as unknown as Record<string, unknown>;
        internal["_layout"] = listLayout;

        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1);
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1);
        listNode.setScale(scaleX, scaleY);

        elData.width = elData.width || containerW
        elData.height = elData.height || containerH

        EUIFactory.fillPanel(listNode, elData)

        const initW = elData.width || containerW || listNode.width;
        const initH = elData.height || listNode.height;
        listNode.setSize(initW, initH);

        const pX = elData.pivotX !== undefined ? elData.pivotX : 0;
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0;
        listNode.setPivot(pX, pY, elData.asAnchor);

        listNode.rotation = elData.rotation !== undefined ? elData.rotation : 0;

        internal["_lineGap"] = elData.lineGap !== undefined ? elData.lineGap : 10;
        internal["_columnGap"] = elData.columnGap !== undefined ? elData.columnGap : 10;
        internal["_autoResizeItem"] = elData.autoResizeItem !== undefined ? elData.autoResizeItem : false;
        if (elData.lineCount !== undefined) {
            if (layoutStr === "Pagination" || layoutStr === "FlowVertical") {
                internal["_lineCount"] = elData.lineCount;
            }
        }
        if (elData.columnCount !== undefined) {
            if (layoutStr === "FlowHorizontal" || layoutStr === "Pagination") {
                internal["_columnCount"] = elData.columnCount;
            }
        }
        if (elData.align) {
            internal["_align"] = elData.align;
        }
        if (elData.verticalAlign) {
            internal["_verticalAlign"] = elData.verticalAlign;
        }

        const items = elData.items || [];

        listNode.itemRenderer = Handler.create(this, function (idx: number, itemObj: fgui.GComponent) {
            itemObj.removeChildren();
            const itemData = items[idx];
            if (itemData) {
                itemData.width = itemData.width || elData.itemWidth
                itemData.height = itemData.height || elData.itemHeight
                if (itemData.type === "panel" || itemData.type === "list") {
                    EUIFactory.fillPanel(itemObj, itemData);
                    if (itemData.graphics && itemData.graphics.length > 0) {
                        EUIFactory.applyGraphics(itemObj, itemData.graphics);
                    }
                } else {
                    itemObj.sourceWidth = itemData.width || 0;
                    itemObj.sourceHeight = itemData.height || 0;
                    itemObj.setSize(itemData.width || 0, itemData.height || 0);
                    const childNode = EUIFactory.createElement(itemData, itemData.width || 0, itemData.height || 0);
                    if (childNode) itemObj.addChild(childNode);
                }
            }
        }, null, false);

        listNode.setBoundsChangedFlag();

        listNode.numItems = items.length;

        return listNode;
    }

    /**
     * 工厂函数：创建并初始化 FGUI 按钮组件 (GButton)
     * 支持资源皮肤与无皮肤纯代码两种模式（通过 elements 结构化配置子元件）
     */
    static createButton(elData: IButtonConfig): fgui.GButton {
        let btnNode: fgui.GButton;

        if (elData.skin) {
            btnNode = fgui.UIPackage.createObjectFromURL(Laya.URL.formatURL(elData.skin)) as fgui.GButton;
            const initW = elData.width || btnNode.width || 120;
            const initH = elData.height || btnNode.height || 50;
            btnNode.setSize(initW, initH);
        } else {
            btnNode = createUI(fgui.GButton, function (this: fgui.GButton) {
                const initW = elData.width || 120;
                const initH = elData.height || 50;
                this.setSize(initW, initH);
                // 无皮肤纯代码按钮必须启用整块矩形命中：GComponent 默认 opaque=false 时
                // displayObject.mouseThrough=true，自身矩形不参与命中，而子级 GGraph 的
                // 矢量 hitArea（HitArea.hit=graphics）在 Laya 下 contains 恒为 false，
                // 会导致按钮完全无法点击。opaque=true 即编辑器导出组件的标准命中形态。
                this.opaque = true;
            });
        }

        if (elData.name) btnNode.name = elData.name;

        // --- 子元件创建与定位（走标准 fillPanel 流程） ---
        EUIFactory.fillPanel(btnNode, elData);

        // --- button 自身变换 ---
        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1);
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1);
        btnNode.setScale(scaleX, scaleY);

        const pX = elData.pivotX !== undefined ? elData.pivotX : 0;
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0;
        btnNode.setPivot(pX, pY, elData.asAnchor);
        btnNode.rotation = elData.rotation !== undefined ? elData.rotation : 0;

        btnNode.setBoundsChangedFlag()
        return btnNode;
    }

    /**
     * 外部面板创建网关：实例化全新的 EPanel 子面板，并对其装配缩放、旋转锚点并分发填充
     * @param elData 子面板的层级配置数据
     * @param containerW 外部容器的参考像素宽度
     * @param containerH 外部容器的参考像素高度
     * @returns 返回完全初始化并填充嵌套子级完毕的子面板容器组件
     */
    static createPanel(elData: IPanelConfig, containerW: number, containerH: number): EPanel {
        const panelNode = new EPanel();
        if (elData.name) panelNode.name = elData.name;

        const scaleX = elData.scaleX !== undefined ? elData.scaleX : (elData.scale !== undefined ? elData.scale : 1);
        const scaleY = elData.scaleY !== undefined ? elData.scaleY : (elData.scale !== undefined ? elData.scale : 1);
        panelNode.setScale(scaleX, scaleY);
        elData.width = elData.width || containerW
        elData.height = elData.height || containerH
        EUIFactory.fillPanel(panelNode, elData);
        const pX = elData.pivotX !== undefined ? elData.pivotX : 0;
        const pY = elData.pivotY !== undefined ? elData.pivotY : 0;
        panelNode.rotation = elData.rotation !== undefined ? elData.rotation : 0;
        panelNode.setPivot(pX, pY, elData.asAnchor);
        panelNode.setBoundsChangedFlag()
        return panelNode;
    }

    /**
     * 反射式底层构建：在运行期纯代码物理装配 FGUI 内部滚动面板 (ScrollPane)
     * 解决去 fgui 编辑器资源包依赖后，代码动态托管 ScrollView 交互的问题
     * @param owner 拥有该滚动层的主容器组件
     * @param scrollType 滚动方向："Horizontal" (横向) | "Vertical" (纵向) | "Both" (双向)
     * @param touchEnabled 是否启用手势触控以及滚轮交互 (默认 true)
     * @returns 返回装配完毕并具有回弹阻尼的滚动窗口实例
     */
    static createScrollPanel(owner: fgui.GComponent, scrollType: ScrollType, touchEnabled: boolean = true): fgui.ScrollPane {
        const scrollPane = new fgui.ScrollPane(owner)
        const internal = scrollPane as unknown as {
            _scrollType: fgui.ScrollType
            _maskContainer: { scrollRect: Laya.Rectangle | null }
        }
        internal._scrollType = scrollType
        internal._maskContainer.scrollRect = new Laya.Rectangle();
        scrollPane.touchEffect = touchEnabled
        scrollPane.mouseWheelEnabled = touchEnabled
        scrollPane.bouncebackEffect = true
        scrollPane.setSize(owner.width, owner.height)
        return scrollPane
    }

    /**
     * 面板填充渲染核心：为指定的 fgui.GComponent 容器填充多态背景 (支持纯图片 URL、嵌套 Icon/Graph/Text 对象)
     * 并在该面板内部递归遍历、创建、自适应对齐装配子级 Elements 元素列表，并校正自适应高度
     * @param panelNode 需要填充承载内容的目标 FGUI 容器组件
     * @param elData 面板或列表项的层级配置数据
     */
    static fillPanel(panelNode: fgui.GComponent, elData: IBaseElementConfig & IViewConfig) {
        let initW = elData.width || panelNode.width || 0;
        let initH = elData.height || panelNode.height || 0;

        panelNode.sourceWidth = initW
        panelNode.sourceHeight = initH
        panelNode.initWidth = initW
        panelNode.initHeight = initH
        panelNode.setSize(initW, initH);

        if (elData.padding) {
            panelNode.margin.top = elData.padding.top ?? 0;
            panelNode.margin.bottom = elData.padding.bottom ?? 0;
            panelNode.margin.left = elData.padding.left ?? 0;
            panelNode.margin.right = elData.padding.right ?? 0;
        }

        panelNode.setupScrollPanel(elData.overflow, elData.scrollType);

        const childElements = elData.elements || [];
        let panelMaxHeight = elData.height || 0;
        let panelMaxWidth = elData.width || 0;

        const isVerticalFlow = elData.layoutType === "vertical";
        const isHorizontalFlow = elData.layoutType === "horizontal";

        // ==========================================
        // 【第一轮大循环：Measure & Instantiate】
        // 职责：一并完成所有子节点的创建，并同步测算出主轴上的 totalW / totalH 总占位
        // ==========================================
        const childNodes: Nullable<fgui.GObject>[] = [];
        let totalH = 0;
        let totalW = 0;
        let maxChildH = 0;
        let maxChildW = 0;
        let flowChildCount = 0;

        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = EUIFactory.createElement<fgui.GObject>(childData, childData.width || 0, childData.height || 0);
            if (childNode) {
                panelNode.addChild(childNode);
                childNodes.push(childNode);

                // 子组件有 position:absolute 表示绝对定位，不参与流布局累加
                const childIsAbsolute = childData.position === "absolute";
                if (!childIsAbsolute) {
                    flowChildCount++;
                    const layout = childData.layout || {};
                    const scaleY = childNode.scaleY !== undefined ? Math.abs(childNode.scaleY) : 1;
                    const scaleX = childNode.scaleX !== undefined ? Math.abs(childNode.scaleX) : 1;
                    const elH = childNode.height * scaleY;
                    const elW = childNode.width * scaleX;

                    if (isVerticalFlow) {
                        const offsetY = layout.offsetY || 0;
                        const gapValue = (i > 0 && elData.gap !== undefined) ? elData.gap : 0;
                        totalH += offsetY + gapValue + elH;
                    } else if (isHorizontalFlow && !elData.flexWrap) {
                        const offsetX = layout.offsetX || 0;
                        const gapValue = (i > 0 && elData.gap !== undefined) ? elData.gap : 0;
                        totalW += offsetX + gapValue + elW;
                    }

                    if (elH > maxChildH) maxChildH = elH;
                    if (elW > maxChildW) maxChildW = elW;
                }
            } else {
                childNodes.push(null);
            }
        }

        // ==========================================
        // 【预计算父容器缺失尺寸（两遍布局：Measure → Layout）】
        // 若父容器无显式高度/宽度，根据子节点测量值预计算，确保 setupElementPosition 拿到正确的 W
        // ==========================================
        const padTop = elData.padding?.top ?? 0;
        const padBottom = elData.padding?.bottom ?? 0;
        const padLeft = elData.padding?.left ?? 0;
        const padRight = elData.padding?.right ?? 0;

        if (!elData.height) {
            if (isVerticalFlow && totalH > 0) {
                initH = totalH + padTop + padBottom;
            } else if (isHorizontalFlow && maxChildH > 0) {
                initH = maxChildH + padTop + padBottom;
            }
        }
        if (!elData.width) {
            if (isHorizontalFlow && !elData.flexWrap && totalW > 0) {
                initW = totalW + padLeft + padRight;
            } else if (isVerticalFlow && maxChildW > 0) {
                initW = maxChildW + padLeft + padRight;
            }
        }


        panelNode.sourceWidth = initW;
        panelNode.sourceHeight = initH;
        panelNode.initWidth = initW;
        panelNode.initHeight = initH;
        panelNode.setSize(initW, initH);

        // ==========================================
        // 【常数步骤：O(1) 计算对齐原点】
        // ==========================================
        let startOffsetY = 0;
        let startOffsetX = 0;

        const justifyContent = elData.justifyContent;
        let perGapSpaceX = 0;
        let perGapSpaceY = 0;
        if (justifyContent && justifyContent !== "flex-start") {
            if (isVerticalFlow && initH > 0) {
                const availableH = initH - padTop - padBottom;
                const freeSpaceH = availableH - totalH;
                if (freeSpaceH > 0) {
                    if (justifyContent === "center") {
                        startOffsetY = freeSpaceH / 2;
                    } else if (justifyContent === "flex-end") {
                        startOffsetY = freeSpaceH;
                    } else if (justifyContent === "space-between" && flowChildCount > 1) {
                        perGapSpaceY = freeSpaceH / (flowChildCount - 1);
                    } else if (justifyContent === "space-around" && flowChildCount > 0) {
                        perGapSpaceY = freeSpaceH / flowChildCount;
                        startOffsetY = perGapSpaceY / 2;
                    } else if (justifyContent === "space-evenly" && flowChildCount > 0) {
                        perGapSpaceY = freeSpaceH / (flowChildCount + 1);
                        startOffsetY = perGapSpaceY;
                    }
                }
            } else if (isHorizontalFlow && initW > 0 && !elData.flexWrap) {
                const availableW = initW - padLeft - padRight;
                const freeSpaceW = availableW - totalW;
                if (freeSpaceW > 0) {
                    if (justifyContent === "center") {
                        startOffsetX = freeSpaceW / 2;
                    } else if (justifyContent === "flex-end") {
                        startOffsetX = freeSpaceW;
                    } else if (justifyContent === "space-between" && flowChildCount > 1) {
                        perGapSpaceX = freeSpaceW / (flowChildCount - 1);
                    } else if (justifyContent === "space-around" && flowChildCount > 0) {
                        perGapSpaceX = freeSpaceW / flowChildCount;
                        startOffsetX = perGapSpaceX / 2;
                    } else if (justifyContent === "space-evenly" && flowChildCount > 0) {
                        perGapSpaceX = freeSpaceW / (flowChildCount + 1);
                        startOffsetX = perGapSpaceX;
                    }
                }
            }
        }

        // ==========================================
        // 【阶段三】定位与关系建立（坐标计算已移交 setupElementPosition）
        // ==========================================
        const flowState = {
            accumulatedX: startOffsetX,
            accumulatedY: startOffsetY,
            perGapSpaceX: perGapSpaceX,
            perGapSpaceY: perGapSpaceY,
            lastNode: null as Nullable<fgui.GObject>,
            currentRowMaxHeight: 0,
            index: 0
        };

        let minChildY = Infinity;
        let minChildX = Infinity;

        for (let i = 0; i < childElements.length; i++) {
            const childData = childElements[i];
            const childNode = childNodes[i];
            if (childNode) {
                flowState.index = i;
                const posInfo = EUIFactory.setupElementPosition(childNode, childData, initW, initH, elData, flowState);

                // 建立子元件与父面板（panelNode）的对齐跟随关联关系
                const layout = childData.layout || {};
                let alignX = layout.alignX;
                if (childData.x === undefined && layout.leftPercent === undefined && layout.rightPercent === undefined && alignX === undefined) {
                    if (isVerticalFlow && elData.alignItems) {
                        if (elData.alignItems === "center") {
                            alignX = "center";
                        } else if (elData.alignItems === "flex-end") {
                            alignX = "right";
                        }
                    }
                }

                let alignY = layout.alignY;
                if (childData.y === undefined && layout.topPercent === undefined && layout.bottomPercent === undefined && alignY === undefined) {
                    if (isHorizontalFlow && elData.alignItems) {
                        if (elData.alignItems === "center") {
                            alignY = "middle";
                        } else if (elData.alignItems === "flex-end") {
                            alignY = "bottom";
                        }
                    }
                }

                const isAbsolute = childData.position === "absolute";

                // 主轴关系智能隔离：如果是水平流式布局，主轴是水平方向，禁止在 X 轴上建立父级跟随对齐关系
                if (!isHorizontalFlow || isAbsolute) {
                    if (alignX === "right" || layout.rightPercent !== undefined) {
                        childNode.addRelation(panelNode, fgui.RelationType.Right_Right);
                    } else if (alignX === "center") {
                        childNode.addRelation(panelNode, fgui.RelationType.Center_Center);
                    }
                }

                // 主轴关系智能隔离：如果是垂直流式布局，主轴是垂直方向，禁止在 Y 轴上建立父级跟随对齐关系
                if (!isVerticalFlow || isAbsolute) {
                    if (alignY === "bottom" || layout.bottomPercent !== undefined) {
                        childNode.addRelation(panelNode, fgui.RelationType.Bottom_Bottom);
                    } else if (alignY === "middle") {
                        childNode.addRelation(panelNode, fgui.RelationType.Middle_Middle);
                    }
                }

                // 流式兄弟关系（Top_Bottom / Left_Right）
                if (isVerticalFlow && !isAbsolute && flowState.lastNode) {
                    childNode.addRelation(flowState.lastNode, fgui.RelationType.Top_Bottom);
                }
                if (isHorizontalFlow && !isAbsolute && flowState.lastNode) {
                    childNode.addRelation(flowState.lastNode, fgui.RelationType.Left_Right);
                }
                if (!isAbsolute) {
                    flowState.lastNode = childNode;
                }

                // 刷新面板实际物理内容边界（高度和宽度）
                const actualBottom = childNode.y + posInfo.elH;
                if (actualBottom > panelMaxHeight) {
                    panelMaxHeight = actualBottom;
                }
                const actualRight = childNode.x + posInfo.elW;
                if (actualRight > panelMaxWidth) {
                    panelMaxWidth = actualRight;
                }

                if (childNode.y < minChildY) {
                    minChildY = childNode.y;
                }
                if (childNode.x < minChildX) {
                    minChildX = childNode.x;
                }
            }
        }

        // 处理高度自动撑开
        const finalMaxHeight = panelMaxHeight + panelNode.margin.top + panelNode.margin.bottom;
        // [自愈算法] 绝对布局下，若最顶端子元件贴顶（其 y 小于 padTop），智能补偿 padding.top
        if (!isVerticalFlow && !elData.height && minChildY < Infinity) {
            if (minChildY > 0) {
                panelMaxHeight + minChildY;
            }
        }
        if (finalMaxHeight > panelNode.height && !elData.height) {
            panelNode.height = finalMaxHeight;
        }

        // 处理宽度自动撑开
        const finalMaxWidth = panelMaxWidth + panelNode.margin.left + panelNode.margin.right;
        // [自愈算法] 绝对布局下，若最左侧子元件贴边（其 x 小于 padLeft），智能补偿 padding.left
        if (!isHorizontalFlow && !elData.width && minChildX < Infinity) {
            if (minChildX > 0) {
                panelMaxWidth + minChildX;
            }
        }
        if (finalMaxWidth > panelNode.width && !elData.width) {
            panelNode.width = finalMaxWidth;
        }

        if (elData.background) {
            panelNode.drawBackground(elData.background)
        }
    }

    /**
     * 【物理定位与弹性排版核心引擎】
     * 职责：
     *   在运行时动态计算并装配 FGUI 元件在宿主容器中的真实像素坐标。本方法是无资源包依赖动态排版的核心，
     *   支持绝对坐标配置、容器百分比自适应（Left/Right/Top/Bottom 百分比）及对齐模式（左中右、顶中底）叠加物理偏移量。
     *
     * 优先级决策链（Priority Decision Chain）：
     *   1. 绝对定位优先级最高：若配置中直接提供了物理 `x` 或 `y` 坐标，直接使用该物理坐标，忽略任何自适应 `layout` 属性。
     *   2. 相对百分比定位次之：若 `layout` 声明了百分比（如 `leftPercent` 或 `rightPercent`），则按照容器尺寸进行浮点比例换算。
     *   3. 经典对齐模式最低：若以上皆无，则通过 `alignX`/`alignY` 对齐模式，结合物理偏移量 `offsetX`/`offsetY` 换算具体像素。
     *
     * 缩放校准（Scale Correction）防漂移模型：
     *   FGUI 中由于部分元件可能存在镜像（ScaleX = -1）或在不同分辨率下被局部缩放，若直接使用原始 width/height 会导致
     *   定位原点大范围漂移。此处通过 Math.abs(scale) 强制校准其真实占位物理尺寸：
     *     真实物理宽 (elW) = 原始宽 (node.width) * |node.scaleX|
     *     真实物理高 (elH) = 原始高 (node.height) * |node.scaleY|
     *
     * 物理排版换算公式：
     *   - 靠右百分比：x = containerW * (1 - rightPercent) - elW  (从右边界向左倒扣百分比并扣除组件物理宽度)
     *   - 右对齐偏移：x = containerW - elW - offsetX            (自右边缘向内扣除组件宽度与额外物理偏移量)
     *   - 居中对齐偏移：x = (containerW - elW) / 2 + offsetX     (居中对齐基准线，叠加物理微调位移)
     *
     * @param node 待定位的目标 FGUI 组件节点
     * @param elData 元件的定位排版原始配置数据
     * @param containerW 父容器的当前物理像素参考宽度
     * @param containerH 父容器的当前物理像素参考高度
     * @param parentData 宿主父容器的排版与内边距配置字典（用以获取父级排布属性及内边距扣除）
     * @param flowState 流式布局累加状态
     * @returns 返回计算所得的真实物理空间坐标及组件占位尺寸数据，供给一维流向后续级联累加
     */
    static setupElementPosition(
        node: fgui.GObject,
        elData: IElementConfig,
        containerW: number,
        containerH: number,
        parentData?: IBaseElementConfig & IViewConfig,
        flowState?: {
            accumulatedX: number;
            accumulatedY: number;
            perGapSpaceX?: number;
            perGapSpaceY?: number;
            lastNode: Nullable<fgui.GObject>;
            currentRowMaxHeight: number;
            index: number;
        }
    ): { targetX: number; targetY: number; elW: number; elH: number; } {
        // [步骤 1] 提取和获取元件的布局配置字典，默认回退为空对象，避免空指针崩溃
        const layout = elData.layout || {};
        const parentLayoutType = parentData?.layoutType;
        const parentAlignItems = parentData?.alignItems;
        const isVerticalFlow = parentLayoutType === "vertical";
        const isHorizontalFlow = parentLayoutType === "horizontal";
        const isPositionAbsolute = elData.position === "absolute";

        // [运行时冲突强拦截] 校验 layout 属性中单轴定位的互斥红线
        const hasLeftPct = layout.leftPercent !== undefined;
        const hasRightPct = layout.rightPercent !== undefined;
        const hasAlignX = layout.alignX !== undefined;
        if ((hasLeftPct || hasRightPct) && hasAlignX) {
            throw new Error(`[LayoutError] Element '${node.name || "unnamed"}' has conflicting layout properties! Horizontal percentage positioning (leftPercent or rightPercent) and absolute horizontal alignment (alignX) cannot be configured at the same time!`);
        }

        const hasTopPct = layout.topPercent !== undefined;
        const hasBottomPct = layout.bottomPercent !== undefined;
        const hasAlignY = layout.alignY !== undefined;
        if ((hasTopPct || hasBottomPct) && hasAlignY) {
            throw new Error(`[LayoutError] Element '${node.name || "unnamed"}' has conflicting layout properties! Vertical percentage positioning (topPercent or bottomPercent) and absolute vertical alignment (alignY) cannot be configured at the same time!`);
        }

        // [步骤 2] 获取元件轴向缩放比的绝对值，计算乘积以得到真实的宿主物理占位尺寸（防负比例镜像偏移）
        const scaleX = node.scaleX !== undefined ? Math.abs(node.scaleX) : 1;
        const scaleY = node.scaleY !== undefined ? Math.abs(node.scaleY) : 1;
        const elW = node.width * scaleX;
        const elH = node.height * scaleY;

        let targetX = 0;
        let targetY = 0;

        // 提取父级内边距偏移 (IPaddingConfig)
        const parentPadding = parentData?.padding;
        const padTop = parentPadding?.top ?? 0;
        const padBottom = parentPadding?.bottom ?? 0;
        const padLeft = parentPadding?.left ?? 0;
        const padRight = parentPadding?.right ?? 0;

        const contentW = containerW - padLeft - padRight;
        const contentH = containerH - padTop - padBottom;

        // 物理隔离：如果父容器开启了滚动，FGUI 的 ScrollPane 会自动使用 margin 缩进内容，
        // 此时子元件在滚动容器中的坐标定位偏置应设为 0，防止双重 padding 推开。
        const applyPadLeft = 0;
        const applyPadTop = 0;

        // [步骤 3] 排版定位核心判定 (主轴流式 + 交叉轴对齐)

        // 判定主轴/交叉轴：流式布局中，主轴由 flowState 累加控制，交叉轴由对齐逻辑控制
        // isPositionAbsolute: 子元件自身有 absolute → 不参与流式累加，走交叉轴对齐
        const hasFlow = !!flowState && !isPositionAbsolute;
        const isMainAxisX = hasFlow && isHorizontalFlow;
        const isMainAxisY = hasFlow && isVerticalFlow;
        const isFlexWrapY = hasFlow && isHorizontalFlow && parentData?.flexWrap;

        // ==========================================
        // 3.1 水平方向位置精确换算 (targetX)
        // ==========================================
        if (isMainAxisX && flowState) {
            // (a) 主轴流式累加（横向流 X 轴）
            const offsetX = layout.offsetX || 0;
            let gapValue = (flowState.index > 0 && parentData?.gap !== undefined) ? parentData.gap : 0;
            gapValue += (flowState.index > 0) ? (flowState.perGapSpaceX || 0) : 0;

            // flexWrap 换行检测
            if (parentData?.flexWrap && flowState.lastNode) {
                const projectedX = flowState.accumulatedX + offsetX + gapValue + elW;
                const maxW = containerW - padRight;
                if (projectedX > maxW) {
                    const rowGap = parentData.gap ?? 0;
                    flowState.accumulatedY += flowState.currentRowMaxHeight + rowGap;
                    flowState.currentRowMaxHeight = 0;
                    flowState.accumulatedX = padLeft;
                    flowState.lastNode = null;
                    gapValue = 0;
                }
            }

            targetX = flowState.accumulatedX + offsetX + gapValue;
            if (!isPositionAbsolute) flowState.accumulatedX = targetX + elW;
        } else {
            // (b) 交叉轴对齐 / 绝对定位
            if (elData.x !== undefined) {
                targetX = elData.x;
            } else {
                let alignX = layout.alignX;
                if (layout.leftPercent === undefined && layout.rightPercent === undefined && alignX === undefined) {
                    if (parentLayoutType === "vertical" && parentAlignItems) {
                        if (parentAlignItems === "center") {
                            alignX = "center";
                        } else if (parentAlignItems === "flex-end") {
                            alignX = "right";
                        } else {
                            alignX = "left";
                        }
                    }
                }
                if (alignX === undefined) {
                    alignX = "left";
                }

                if (layout.leftPercent !== undefined) {
                    targetX = applyPadLeft + (contentW - elW) * layout.leftPercent;
                } else if (layout.rightPercent !== undefined) {
                    targetX = applyPadLeft + (contentW - elW) * (1 - layout.rightPercent);
                } else {
                    const offsetX = layout.offsetX || 0;
                    if (alignX === "left") {
                        targetX = applyPadLeft + offsetX;
                    } else if (alignX === "right") {
                        targetX = contentW > 0 ? (applyPadLeft + contentW - elW + offsetX) : (applyPadLeft + offsetX);
                    } else if (alignX === "center") {
                        targetX = contentW > 0 ? (applyPadLeft + (contentW - elW) / 2 + offsetX) : (applyPadLeft + offsetX);
                    }
                }
            }
        }

        // ==========================================
        // 3.2 垂直方向位置精确换算 (targetY)
        // ==========================================
        if (isMainAxisY && flowState) {
            // (a) 主轴流式累加（纵向流 Y 轴）
            const offsetY = layout.offsetY || 0;
            let gapValue = (flowState.index > 0 && parentData?.gap !== undefined) ? parentData.gap : 0;
            gapValue += (flowState.index > 0) ? (flowState.perGapSpaceY || 0) : 0;
            targetY = flowState.accumulatedY + offsetY + gapValue;
            if (!isPositionAbsolute) flowState.accumulatedY = targetY + elH;
        } else if (isFlexWrapY && flowState) {
            // (b) flexWrap 行 Y（横向流换行的 Y 由流控制）
            targetY = flowState.accumulatedY + (layout.offsetY || 0);
            const currentElHeight = (layout.offsetY || 0) + elH;
            if (currentElHeight > flowState.currentRowMaxHeight) {
                flowState.currentRowMaxHeight = currentElHeight;
            }
        } else {
            // (c) 交叉轴对齐 / 绝对定位
            if (elData.y !== undefined) {
                targetY = elData.y;
            } else {
                let alignY = layout.alignY;
                if (layout.topPercent === undefined && layout.bottomPercent === undefined && alignY === undefined) {
                    if (parentLayoutType === "horizontal" && parentAlignItems) {
                        if (parentAlignItems === "center") {
                            alignY = "middle";
                        } else if (parentAlignItems === "flex-end") {
                            alignY = "bottom";
                        } else {
                            alignY = "top";
                        }
                    }
                }
                if (alignY === undefined) {
                    alignY = "top";
                }

                if (layout.topPercent !== undefined) {
                    targetY = applyPadTop + (contentH - elH) * layout.topPercent;
                } else if (layout.bottomPercent !== undefined) {
                    targetY = applyPadTop + (contentH - elH) * (1 - layout.bottomPercent);
                } else {
                    const offsetY = layout.offsetY || 0;
                    if (alignY === "top") {
                        targetY = applyPadTop + offsetY;
                    } else if (alignY === "bottom") {
                        targetY = contentH > 0 ? (applyPadTop + contentH - elH + offsetY) : (applyPadTop + offsetY);
                    } else if (alignY === "middle") {
                        targetY = contentH > 0 ? (applyPadTop + (contentH - elH) / 2 + offsetY) : (applyPadTop + offsetY);
                    }
                }
            }
        }

        // [步骤 4] 物理应用与返回
        // 1. 调用 FGUI 官方 API 刷新该节点的容器像素坐标，触发 Laya 物理渲染刷新
        node.setXY(targetX, targetY);
        // 2. 返回计算所得的关键定位数据集，供给上层 vertical / flow 排版流作为累加基准
        return {targetX, targetY, elW, elH};
    }

    /**
     * 将高内聚、强类型安全的矢量绘图指令按顺序应用于指定节点的 Laya.Graphics 上
     * @param node 目标 FGUI 元件节点
     * @param graphicsConfig 矢量绘图指令数组
     */
    public static applyGraphics(node: fgui.GObject, graphicsConfig: IGraphicsCmdConfig[]): void {
        if (!graphicsConfig || !Array.isArray(graphicsConfig) || !node || !node.displayObject) return;
        const g = node.displayObject.graphics as unknown as Record<string, Function>;
        if (!g) return;
        for (const item of graphicsConfig) {
            if (!item || typeof item !== "object") continue;
            const cmd = item.cmd;
            const args = [...(item.args || [])];

            if (typeof g[cmd] === "function") {
                g[cmd](...args);
            } else {
                console.warn(`Laya.Graphics 不支持方法: ${cmd}`);
            }
        }
    }


}
