# UIFactory — 纯代码 FGUI 界面构建指南

> 适用范围：TSCore 框架下所有**纯代码实现的界面**（不依赖 FGUI 编辑器资源包）。
> 框架以 `tsCore` 命名空间对外暴露 `UIFactory`，本文所有示例直接以 `UIFactory.xxx` 调用。

---

## 一、技术选型铁律（必须遵守）

纯代码构建界面时，组件来源按以下三级优先级决策，**不得越级、不得跳过**：

| 优先级 | 来源 | 适用范围 |
|---|---|---|
| ① 首选 | **UIFactory 配置化工厂** | 凡是它能创建的，一律用它：text / icon / graph / panel / list / button 六类内置元素 + `registerCreator` 注册的自定义类型 |
| ② 兜底 | **fgui 原生组件**（`template/fairygui.min.js` 运行时，`fgui.*` 命名空间） | UIFactory 覆盖不到的组件：GProgressBar、GSlider、GComboBox、GTextInput、GTree、GLoader3D、GMovieClip、GGroup、Transition、Controller 等，直接 `new fgui.XXX()` 实例化后 `addChild` |
| ③ 红线 | ~~Laya 原生显示对象~~ | **绝对禁止**直接使用 `new Laya.Sprite()`、`new Laya.Text()`、`new Laya.Image()`、`new Laya.Button()` 等原生对象创建 UI |

**选型判定流程：**

```
需要创建 UI 元素
  ├─ 类型属于 text/icon/graph/panel/list/button（或已注册的自定义类型）？
  │    └─ 是 → UIFactory.createElement / createPanel 等配置化创建 ✅
  ├─ 是进度条/滑条/下拉框/输入框/树/3D加载器/动效/控制器等 FGUI 组件？
  │    └─ 是 → new fgui.GProgressBar() 等原生实例化 ✅
  └─ 想直接 new Laya.Xxx()？
       └─ 禁止 ❌（见第十章红线说明）
```

**为什么禁止 Laya 原生对象创建 UI：**
- FGUI 拥有独立的显示列表、坐标缩放适配（GRoot/关联 Relation）、命中测试与事件体系；Laya 原生对象游离在该体系之外，混用会导致分辨率适配失效、层级互斥、点击命中行为不一致、滚动容器裁剪失效等隐蔽问题；
- UIFactory 全链路（含矢量绘制 `graphics`）均落到 FGUI 管辖的显示对象上，统一托管、统一适配。

---

## 二、UIFactory 能力总览

### 2.1 元素多态路由表（`createElement` 按 `type` 分发）

| type 配置值 | 产出 FGUI 对象 | 创建函数 | 说明 |
|---|---|---|---|
| `"text"` | `fgui.GBasicTextField` | `createText` | 普通文本 |
| `"text"` + `isUbb:true` | `fgui.GRichTextField` | `createRichTextField` | UBB 富文本（自动启用 ubb 语法解析） |
| `"icon"` | `fgui.GLoader` | `createIcon` | 图片装载器 |
| `"graph"` | `fgui.GGraph` | `createGraph` | 矢量几何图形 |
| `"panel"` | `EPanel` | `createPanel` | 子面板容器（可递归嵌套） |
| `"list"` | `PureList` | `createList` | 动态列表/网格渲染引擎 |
| `"button"` | `fgui.GButton` | `createButton` | 按钮（有皮肤 / 无皮肤纯代码） |
| 自定义 type | 由注册器决定 | `registerCreator` 注册的 creator | 业务元件零侵入扩展（优先于内置类型） |

任何元素创建后若配置了 `graphics` 数组，都会自动执行矢量绘图指令（见 4.7）。

### 2.2 架构特点

- **配置驱动**：界面 = 结构化配置对象树（`IElementConfig` 联合类型体系），一处定义、运行期装配；
- **两遍布局引擎**：`fillPanel` 先 Measure（实例化 + 测量主轴总占位）再 Layout（O(1) 计算对齐原点 + 逐元素定位），父容器无显式尺寸时按子级自动撑开；
- **反射式滚动装配**：`createScrollPanel` 在运行期纯代码装配 FGUI 内部 `ScrollPane`，彻底去除 FGUI 编辑器资源包依赖；
- **缩放防漂移**：定位计算统一使用 `物理占位 = 原始尺寸 × |scale|`，负比例镜像不漂移。

### 2.3 伴生类

| 类 | 角色 |
|---|---|
| `EPanel` | 框架扩展面板容器，内置背景绘制（`drawBackground`）与滚动装配（`setupScrollPanel`）能力，是 `panel` 类型的产出物 |
| `PureList` | 基于 FGUI List 机制的免编辑器资源列表实现，是 `list` 类型的产出物 |

---

## 三、快速上手

最小可运行示例——一个含标题、说明文本、按钮的面板：

```typescript
const panel = UIFactory.createPanel({
    type: "panel",
    width: 600,
    height: 400,
    layoutType: "vertical",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    elements: [
        {
            type: "text",
            name: "titleLabel",
            text: "设置",
            fontSize: 32,
            bold: true,
        },
        {
            type: "text",
            text: "这里是说明文案",
            fontSize: 20,
            color: "#cccccc",
        },
        {
            type: "button",
            name: "closeBtn",
            width: 200,
            height: 60,
            elements: [
                {
                    type: "text",
                    text: "关闭",
                    fontSize: 24,
                    layout: { alignX: "center", alignY: "middle" },
                },
            ],
        },
    ],
}, 0, 0)

fgui.GRoot.inst.addChild(panel)
```

要点：
- 容器型元素（panel/list/button）通过 `elements` 递归声明子级；
- 子级未写死 `x/y` 时，按父容器 `layoutType` 流式排布，未参与流的轴向由 `alignItems` 对齐；
- `name` 是运行期寻址标识（`getChild("closeBtn")`）。

---

## 四、元素类型配置详解

### 4.1 通用物理属性（IBaseElementConfig，所有元素共享）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `name` | string | — | 唯一命名标识，供 `getChild` 寻址 |
| `width` / `height` | number | 0 | 固定像素宽/高；不配或 0 则自适应/自动撑开 |
| `scale` | number | 1 | 整体缩放（等同同时设 scaleX/scaleY） |
| `scaleX` / `scaleY` | number | 1 | 轴向缩放（负值为镜像） |
| `pivotX` / `pivotY` | number | 0 | 锚点坐标百分比（0~1），旋转与位移基准 |
| `asAnchor` | boolean | false | true 时 x/y 代表轴心点位置而非左上角 |
| `alpha` | number | 1 | 不透明度（0~1） |
| `rotation` | number | 0 | 旋转角度（0~360 度） |
| `x` / `y` | number | — | 绝对像素坐标（配置后忽略 layout 排版） |
| `layout` | ILayoutConfig | — | 弹性对齐与百分比定位（见 5.2） |
| `position` | `"absolute"` | — | 脱离父容器流式布局，不受 alignItems/justifyContent 影响 |
| `graphics` | IGraphicsCmdConfig[] | — | 矢量绘图指令组（见 4.7） |

### 4.2 text — 文本（ITextConfig）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `"text"` | — | 必填固定值 |
| `text` | string | "" | 显示内容 |
| `fontSize` | number | 20 | 字号 |
| `color` | string | "#ffffff" | 十六进制颜色 |
| `align` | left/center/right | "left" | 水平对齐 |
| `valign` | top/middle/bottom | "middle" | 垂直对齐 |
| `leading` | number | 4 | 行高间距 |
| `letterSpacing` | number | 0 | 字间距 |
| `underline` | boolean | false | 下划线 |
| `italic` | boolean | false | 斜体 |
| `bold` | boolean | false | 加粗 |
| `singleLine` | boolean | false | 单行限制（不换行） |
| `stroke` | number | — | 描边粗细像素 |
| `strokeColor` | string | "#000000" | 描边颜色 |
| `isUbb` | boolean | false | true 时产出 GRichTextField 并启用 UBB 解析，`\n` 自动转 `<br/>` |

**自动尺寸策略**（autoSize）：
- 同时配置 `width>0 且 height>0` → 固定尺寸（AutoSizeType.None）；
- 仅 `width>0` → 高度自适应（Height）；
- 均未配置 → 宽高双自适应（Both）。

### 4.3 icon — 图片装载器（IIconConfig）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `"icon"` | — | 必填固定值 |
| `url` | string | — | 必填。`"ui://包名/资源名"` 或物理路径 `"res/xxx.png"`（自动拼接 resBasePath，见第七章） |
| `sizeGrid` | string | — | 九宫格切边 `"left,top,right,bottom"`，如 `"30,30,30,30"` |
| `clip` | boolean | false | 超出 width/height 的图像 scrollRect 物理裁剪 |
| `fill` | string/number | none | 填充模式，见下表 |

**fill 填充模式表**（大小写不敏感）：

| 值 | LoaderFillType | 效果 |
|---|---|---|
| `none` | None | 原始尺寸居中显示（默认） |
| `scale` | Scale | 等比缩放铺满 |
| `scalematchheight` | ScaleMatchHeight | 按高匹配 |
| `scalematchwidth` | ScaleMatchWidth | 按宽匹配 |
| `scalefree` | ScaleFree | 自由拉伸（变形） |
| `scalenoborder` | ScaleNoBorder | 无边框缩放（裁切溢出） |

**自适应**：未配置 `width`/`height` 时，图片加载完成后自动按纹理实际尺寸回填并刷新父容器边界。

### 4.4 graph — 矢量图形（IGraphConfig）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `"graph"` | — | 必填固定值 |
| `lineSize` | number | 0 | 描边线宽 |
| `lineColor` | string | null | 描边颜色（null 不绘制描边） |
| `fillColor` | string | null | 填充颜色（null 不填充） |
| `cornerRadius` | number / number[] | — | 圆角：单值=四角相同；数组 `[左上,右上,右下,左下]`（超 4 截断、不足 4 补 0，仅单值时复制） |

底层执行 `GGraph.drawRect(lineSize, lineColor, fillColor, cornerRadius)`，配合通用属性 `alpha` 可做蒙层/底板。

### 4.5 panel — 子面板容器（IPanelConfig = IBaseElementConfig + IViewConfig）

| 字段 | 类型 | 说明 |
|---|---|---|
| `type` | `"panel"` | 必填固定值 |
| 其余 | 见 5.3 容器配置（IViewConfig） | 背景/子级/滚动/流式布局/padding 全支持 |

特点：
- 未配置 width/height 时默认继承外部容器参考尺寸（`createPanel(elData, containerW, containerH)`）；
- `elements` 可无限递归嵌套 panel/list，形成独立层级；
- 容器无显式尺寸时按子级内容自动撑开。

### 4.6 list — 动态列表/网格（IListConfig = IBaseElementConfig + IViewConfig）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `"list"` | — | 必填固定值 |
| `listLayout` | SingleColumn/SingleRow/FlowHorizontal/FlowVertical/Pagination | SingleColumn | 排列布局 |
| `lineGap` | number | 10 | 行间距 |
| `columnGap` | number | 10 | 列间距 |
| `itemWidth` / `itemHeight` | number | — | 强制规定子项格子物理宽/高 |
| `align` | left/center/right | — | 列表整体水平对齐 |
| `verticalAlign` | top/middle/bottom | — | 列表整体垂直对齐 |
| `items` | IPanelConfig[] | [] | 静态数据子项（itemRenderer 递归填充） |
| `lineCount` | number | — | 行数，仅 Pagination / FlowVertical 有效 |
| `columnCount` | number | — | 列数，仅 FlowHorizontal / Pagination 有效 |
| `autoResizeItem` | boolean | false | 子项尺寸是否强制匹配 itemWidth/itemHeight |

**渲染机制**：内部通过 `itemRenderer` 闭包按索引递归填充 —— 子项是 `panel`/`list` 时走 `fillPanel` 整套布局；是普通元素时直接 `createElement`。`items.length` 决定 `numItems`。

### 4.7 button — 按钮（IButtonConfig = IBaseElementConfig + IViewConfig）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `"button"` | — | 必填固定值 |
| `skin` | string | — | FGUI Package 皮肤路径（如 `"ui://common/btn"`）；配置后从资源包实例化 |
| 其余 | 见 5.3 | — | 无皮肤时纯代码装配子元件（默认 120×50） |

**无皮肤纯代码按钮须知**：框架会自动置 `opaque = true` —— GComponent 默认 `mouseThrough` 使自身矩形不参与命中，而子级 GGraph 的矢量 HitArea 在 Laya 引擎下 `contains` 恒为 false，若不开启 opaque 按钮将完全无法点击。这是编辑器导出组件的标准命中形态，无需手工干预。

### 4.8 graphics — 矢量绘图指令（IGraphicsCmdConfig，可附加于任意元素）

按顺序应用于节点底层 `Laya.Graphics`（这是框架内部唯一"借用" Laya 绘制能力的通道，业务代码无需也不应直接触碰）：

| cmd | args |
|---|---|
| `clear` / `destroy` | — |
| `alpha` | `[value]` |
| `drawLine` | `[x1,y1,x2,y2,color,lineWidth?]` |
| `drawLines` | `[x,y,points[],color,lineWidth?]` |
| `drawCurves` | `[x,y,points[],color,lineWidth?]` |
| `drawRect` | `[x,y,w,h,fillColor\|null,lineColor?,lineWidth?]` |
| `drawCircle` | `[x,y,r,fillColor\|null,lineColor?,lineWidth?]` |
| `drawPie` | `[x,y,r,startAngle,endAngle,fillColor\|null,lineColor?,lineWidth?]` |
| `drawPoly` | `[x,y,points[],fillColor\|null,lineColor?,lineWidth?]` |
| `drawPath` | `[x,y,paths[],brush?,pen?]` |
| `loadImage` / `drawImage` | `[url,x,y,w?,h?]`（url 自动拼接 resBasePath） |
| `drawTexture` | `[texture,x?,y?,w?,h?...]` |
| `fillTexture` | `[texture,x,y,w?,h?...]` |
| `fillText` / `strokeText` | `[text,x,y,font,fontSize,color,...]` |

不支持的方法名会触发 `console.warn` 提示。

---

## 五、布局系统

### 5.1 定位优先级决策链（setupElementPosition）

每个子元素的坐标按以下优先级决策（高优先命中后忽略低优先）：

1. **绝对坐标最高**：配置了 `x` / `y` → 直接使用物理坐标；
2. **百分比定位次之**：`layout.leftPercent/rightPercent/topPercent/bottomPercent` → 按容器内容区比例换算（如 `x = contentW × (1 - rightPercent) - elW`）；
3. **对齐模式最低**：`layout.alignX/alignY` + `offsetX/offsetY` 像素微调。

### 5.2 layout 弹性对齐配置（ILayoutConfig）

| 字段 | 取值 | 说明 |
|---|---|---|
| `alignX` | left / center / right | 水平对齐（默认 left） |
| `alignY` | top / middle / bottom | 垂直对齐（默认 top） |
| `offsetX` / `offsetY` | number | 对齐后像素偏移 |
| `leftPercent` / `rightPercent` | number(0~1) | 水平百分比定位 |
| `topPercent` / `bottomPercent` | number(0~1) | 垂直百分比定位 |

**互斥红线（运行时强拦截，抛异常）**：
- 同轴向「百分比定位」与「对齐模式」不可同时配置：
  - `leftPercent|rightPercent` + `alignX` → 抛 `[LayoutError]`；
  - `topPercent|bottomPercent` + `alignY` → 抛 `[LayoutError]`。

### 5.3 容器流式布局（IViewConfig，panel/list/button 共用）

| 字段 | 取值 | 默认 | 说明 |
|---|---|---|---|
| `layoutType` | none / vertical / horizontal | none | none=子级各自 x/y 绝对排布；vertical=纵向流向下累加；horizontal=横向流向右累加 |
| `gap` | number | 0 | 流式子元件固定像素间距 |
| `flexWrap` | boolean | false | horizontal 流的弹性折行（按容器宽度自动换行） |
| `alignItems` | flex-start / center / flex-end / stretch | — | 交叉轴统一对齐（stretch 暂按 flex-start 表现） |
| `justifyContent` | flex-start / center / flex-end / space-between / space-around / space-evenly | — | 主轴排列分配 |
| `elements` | IElementConfig[] | — | 子级列表（递归） |
| `background` | string / IIconConfig / IGraphConfig | — | 容器背景：图片 URL 或嵌套 icon/graph 配置 |
| `padding` | IPaddingConfig | — | 安全内边距（见 5.4） |
| `overflow` | 0/1/2 | — | 溢出处理：0 Visible、1 Hidden、2 Scroll |
| `scrollType` | 0/1/2 | — | 滚动方向：0 横向、1 纵向、2 双向 |

**布局联动关系**：
- 流式布局中兄弟元素自动建立 FGUI Relation（vertical → `Top_Bottom`，horizontal → `Left_Right`）；
- 对齐子元素与父容器建立 Relation（right→`Right_Right`、center→`Center_Center`、bottom→`Bottom_Bottom`、middle→`Middle_Middle`），父容器尺寸变化时子级跟随；
- 主轴方向智能隔离：水平流禁止 X 轴父级跟随、垂直流禁止 Y 轴父级跟随，避免与流式累加冲突；
- `position: "absolute"` 的子级脱离流累加与 alignItems/justifyContent 约束，走交叉轴对齐/绝对坐标。

### 5.4 padding 安全边距（IPaddingConfig）

| 字段 | 声明默认 | 说明 |
|---|---|---|
| `top` / `bottom` | 30 | 顶/底边距 |
| `left` / `right` | 40 | 左/右边距 |

注意：一旦配置了 `padding` 对象，其中未显式给出的方向按 **0** 处理（而非声明默认值）；未配置 `padding` 时沿用 EPanel 自身默认边距。主要在滚动场景中保障内容安全区。

---

## 六、滚动容器

**方式一（推荐）：配置化** —— 容器元素直接配置 `overflow: 2` + `scrollType`（0 横向 / 1 纵向 / 2 双向），`fillPanel` 内部经 `setupScrollPanel` 自动装配。

**方式二：手动装配** —— 已有任意 `fgui.GComponent` 需要追加滚动交互时：

```typescript
const scrollPane = UIFactory.createScrollPanel(myGComponent, fgui.ScrollType.Vertical, true)
```

`createScrollPanel` 以反射方式在运行期装配 FGUI 内部 ScrollPane：设定滚动方向、初始化遮罩 scrollRect、启用触摸/滚轮交互与回弹阻尼（bouncebackEffect=true）。这是去 FGUI 编辑器资源包依赖的关键能力。

---

## 七、资源路径前缀

```typescript
UIFactory.resBasePath = "res/gameui/"   // 全局设置一次
```

`formatResUrl(url)` 自动为**相对路径**拼接前缀；以下前缀豁免不拼接：
- `http` 开头（网络绝对地址）
- `//` 开头（协议相对地址）
- `ui://` 开头（FGUI 资源包 URL）
- `#`、`rgb` 开头（颜色值）

作用范围：icon 的 `url`、graphics 指令中 `loadImage/drawImage` 的第一个参数。

---

## 八、扩展机制 registerCreator

业务自定义元件类型零侵入注册，**优先级高于全部内置类型**：

```typescript
// 注册
UIFactory.registerCreator("myBadge", (elData, containerW, containerH) => {
    const comp = new fgui.GComponent()
    // ... 装配自定义内容（内部仍建议复用 UIFactory.createElement）
    return comp
})

// 使用：与内置 type 无差别
UIFactory.createElement({ type: "myBadge", width: 100, height: 40 }, 0, 0)
```

---

## 九、fgui 原生组件兜底（UIFactory 覆盖不到时）

以下常用 FGUI 组件暂无 UIFactory 配置化入口，直接实例化 `fgui.*` 类（运行时来自 `template/fairygui.min.js`）：

| 组件 | 类 | 典型用途 |
|---|---|---|
| 进度条 | `fgui.GProgressBar` | 加载/血条/经验条 |
| 滑条 | `fgui.GSlider` | 音量/灵敏度调节 |
| 下拉框 | `fgui.GComboBox` | 选项选择 |
| 输入框 | `fgui.GTextInput` | 文本输入 |
| 树 | `fgui.GTree` + `fgui.GTreeNode` | 层级树形展示 |
| 3D 装载器 | `fgui.GLoader3D` | 3D 资源嵌入 |
| 动画 | `fgui.GMovieClip` | 序列帧动画 |
| 组 | `fgui.GGroup` | 批量显隐/布局分组 |
| 动效 | `fgui.Transition` | 缩放/位移过渡动效 |
| 控制器 | `fgui.Controller` | 页签/状态切换 |

```typescript
// 兜底示例：进度条
const bar = new fgui.GProgressBar()
bar.setSize(400, 30)
bar.min = 0
bar.max = 100
bar.value = 65
bar.setPivot(0.5, 0.5, true)
panel.addChild(bar)
```

**约束**：兜底也必须停留在 `fgui` 命名空间内 —— 容器挂载用 `GComponent.addChild`，尺寸/锚点用 GObject 标准 API，与 UIFactory 产物无缝混排；**不得**因兜底滑向 `new Laya.Xxx()`。

---

## 十、红线禁令：禁止 Laya 原生对象创建 UI

以下写法在纯代码界面中**一律禁止**：

```typescript
// ❌ 全部禁止
new Laya.Sprite()
new Laya.Text()
new Laya.Image("res/a.png")
new Laya.Button("skin.png", "点击")
new Laya.Label()
new Laya.ProgressBar()
new Laya.CheckBox() / new Laya.Radio()
new Laya.ComboBox() / new Laya.TextInput() / new Laya.TextArea()
new Laya.Clip() / new Laya.FontClip()
Laya.stage.addChild(...)   // UI 内容直接挂 Laya 舞台
```

**原因**：脱离 FGUI 显示列表管辖 → 分辨率适配失效、Relation 关联断裂、命中测试规则不一致、ScrollPane 裁剪失效、事件冒泡链路不统一。UI 的唯一宿主树是 `fgui.GRoot` 及其 FGUI 子树。

**唯一的例外通道**：`graphics` 绘图指令（4.8）由 UIFactory 内部代为操作 `Laya.Graphics`，属框架自身的受控出口，业务侧只写配置、不直接触碰 Laya 对象。

---

## 十一、综合完整示例

设置面板：graph 背景 + 纵向流（标题/横向工具行/横向流图标列表）+ 装饰图形：

```typescript
UIFactory.resBasePath = "res/gameui/"

const panel = UIFactory.createPanel({
    type: "panel",
    name: "settingsPanel",
    width: 800,
    height: 600,
    background: {
        type: "graph",
        width: 800, height: 600,
        fillColor: "#1a1a2e",
        lineColor: "#4e4e7a",
        lineSize: 2,
        cornerRadius: [16, 16, 16, 16],
    },
    layoutType: "vertical",
    padding: { top: 40, bottom: 40, left: 40, right: 40 },
    gap: 24,
    elements: [
        // 标题：横向流居中
        {
            type: "panel",
            height: 60,
            layoutType: "horizontal",
            justifyContent: "center",
            elements: [{
                type: "text",
                name: "title",
                text: "[color=#ffd700]系统设置[/color]",   // UBB
                isUbb: true,
                fontSize: 36, bold: true,
            }],
        },
        // 工具行：横向流 + 交叉轴居中 + 弹性间隔
        {
            type: "panel",
            height: 56,
            layoutType: "horizontal",
            alignItems: "center",
            justifyContent: "space-between",
            elements: [
                { type: "icon", name: "avatar", url: "avatar.png", width: 48, height: 48, fill: "scale" },
                { type: "text", text: "玩家昵称", fontSize: 24, layout: { alignX: "center", alignY: "middle" } },
                {
                    type: "button",
                    name: "logoutBtn",
                    width: 140, height: 48,
                    elements: [{ type: "text", text: "退出", fontSize: 22, layout: { alignX: "center", alignY: "middle" } }],
                },
            ],
        },
        // 图标列表：横向流自动折行
        {
            type: "list",
            name: "iconList",
            listLayout: "FlowHorizontal",
            height: 320,
            lineGap: 16, columnGap: 16,
            items: [1, 2, 3, 4, 5, 6].map(i => ({
                type: "panel",
                width: 160, height: 120,
                background: { type: "graph", fillColor: "#2a2a4a", cornerRadius: 12 },
                elements: [{
                    type: "icon",
                    url: `icon_${i}.png`,
                    width: 96, height: 96,
                    layout: { alignX: "center", alignY: "middle" },
                }],
            })),
        },
        // 底部装饰线（graphics 指令）
        {
            type: "graph",
            height: 4,
            width: 720,
            graphics: [{ cmd: "drawLine", args: [0, 2, 720, 2, "#4e4e7a", 2] }],
        },
    ],
}, 0, 0)

fgui.GRoot.inst.addChild(panel)
```

示例覆盖：背景嵌套 graph、UBB 富文本、justifyContent 三态、flexWrap 折行列表、graphics 指令、百分比/对齐定位、padding —— 可作为业务界面的配置模板直接扩展。

---

## 附：配置接口文件索引（权威定义出处）

| 接口 | 文件 |
|---|---|
| IBaseElementConfig / IElementConfig / ILayoutConfig | `IBaseElementConfig.ts` / `IElementConfig.ts` / `ILayoutConfig.ts` |
| ITextConfig / IIconConfig / IGraphConfig / IGraphicsCmdConfig | 同目录对应文件 |
| IPanelConfig / IListConfig / IButtonConfig / IViewConfig / IPaddingConfig | 同目录对应文件 |
| 工厂实现 | `UIFactory.ts` |
| 容器实现 | `EPanel.ts` / `PureList.ts` |
