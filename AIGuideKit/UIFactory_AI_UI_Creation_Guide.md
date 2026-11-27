# UIFactory 纯代码 UI 构建与多端自适应指南 (面向 AI 界面构建与代码生成)

> **文档性质**：面向代码生成智能体（AI Agent）及开发者的**UIFactory 架构与语义契约实战指南**。
> **JSON Schema 单一字段事实源**：`AIGuideKit/uifactory-layout.schema.json`（由 `TSCore/src/com/uifactory/I*Config.ts` 通过 `node scripts/gen-uifactory-schema.js` 自动生成）。所有组件字段名、必填项、数字/字符串枚举值以该 Schema 为唯一事实源，本文档聚焦 **Schema 无法表达的架构选型、跨字段因果关系与运行期物理约束**。
> **命名空间约定**：纯代码工厂入口在全局或框架中以 `UIFactory` 命名暴露，本文所有示例均直接以 `UIFactory.xxx` 纯净语法示范。

---

## 一、 技术选型与职责边界 (Scope & Responsibilities)

在构建游戏 UI 界面与交互逻辑时，严格遵循以下三级优先级决策模型，确保整个应用界面位于统一的自适应视口与事件树内：

```
                            需要创建 UI 元素 / 组件
                                       │
          ┌───────────────────────────┴───────────────────────────┐
  ① 优先命中：属于 text/icon/graph/panel/list/button？     ② 兜底：属于进度条/滑条/输入框/动效/控制器？
          │                                                       │
          ▼                                                       ▼
   【使用 UIFactory 工厂配置化创建】                          【使用 fgui 原生组件类实例化并挂载】
   UIFactory.createElement / createPanel                     new fgui.GProgressBar() / GSlider / Controller
   （自动执行两遍测量排版、响应式自适应布局）                       （保持在 FGUI 命名空间，与工厂产物无缝混排）
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                       │
                                       ▼
                         ❌【 绝对红线禁令（严禁触碰） 】❌
                      禁止：new Laya.Sprite() / Text() / Image()
                      禁止：直接将原生显示对象 addChild 到 Stage / 舞台
```

### 职责边界与禁令机理：
1. **适配比例分裂**：底层引擎原生对象的缩放计算游离在 FGUI 的 `GRoot` 与关联系统（Relation）之外，在宽屏、折叠屏或平板上必定产生拉伸变形或位置错位；
2. **事件与裁剪穿透**：FGUI 的滚动视口（ScrollPane）无法对外部原生对象执行矢量视口裁剪，且两者的命中测试（HitTest）与事件冒泡链路完全冲突。

---

## 二、 响应式与人机工程学排版契约 (Responsive & Ergonomic Spec)

在编写纯代码配置时，必须将**“防变形、防拉伸、防挤压”**与人机工程学规范置于首位：

### 2.1 响应式自适应布局
1. **相对定位与百分比优先**：
   - 优先通过 `layout: { alignX: "center", alignY: "middle" }` 或 `leftPercent / topPercent`（0~1 比例值）进行弹性定位；
   - 绝对坐标 `x / y` 仅作为辅助微调手段，不推荐作为常规响应式界面的主要布局手段。
2. **百分比宽高与行/列权重分配**：
   - 容器与面板推荐使用百分比尺寸（如 `width: 0.85` 代表占屏幕/父级宽度的 85%）；
   - 在网格或横向流式布局中，子项宽度推荐根据所在的列权重定义百分比（如 `0.3` 代表一行自动弹性三等分），彻底杜绝极端分辨率下的挤压变形。

### 2.2 人机工程学空间网格与触控交互规范
1. **8pt / 4pt 空间度量网格**：
   - 所有间距（`gap`）、内边距（`padding`）、组件高度严格遵循 8pt / 4pt 网格阶梯（4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64），保持视觉呼吸感与规整韵律。
2. **触控与光标交互热区标准**：
   - **移动端触控目标**：单个交互目标的物理点击热区推荐 $\ge 44 \times 44\text{pt}$ / $48 \times 48\text{dp}$；
   - **小图标触控补偿**：当视觉图标较小（如 16x16px 或 20x20px 的关闭/更多按钮）时，应通过外层容器或透明内边距（Padding）扩展 Hitbox，确保点击区域达标；
   - **防误触间距**：相邻的两个可点击交互元素之间，外间距推荐保持 $\ge 8\text{px}$（推荐 $12\text{px} \sim 16\text{px}$）。
3. **父子嵌套圆角曲率守恒定律**：
   - 当外层容器嵌套内层卡片/元素且具有内边距（Padding）时，遵循同心圆角法则：
     $$R_{\text{outer}} = R_{\text{inner}} + \text{Padding}$$
   - 避免内外层简单机械使用相同圆角导致转角厚薄不均与挤压感。
4. **60-30-10 空间调色与视觉对比度**：
   - **60% 基础主基调色**：界面大面积背景（如深色模式 `#0B0F19` / `#0F172A`）；
   - **30% 结构层级色**：卡片底板、次级容器、边框分割线（如 `#1E293B` / `#334155`）；
   - **10% 焦点强调色**：核心 CTA 按钮、选中指示态（如 `#16A34A` / `#38BDF8`）；
   - 正文与背景文本对比度推荐符合 WCAG 2.2 标准（常规文本对比度 $\ge 4.5:1$）。

### 2.3 纯正 FGUI 组件角色定位：Graph 背景、Group 分区与 Panel 边界
在构建纯代码界面时，必须严格遵守以下三大组件角色的正统职责划分：
1. **背景底板 / 装饰线框 ➔ 100% 使用 `type: "graph"` (GGraph)**：
   - 所有的卡片底板、面板背景框、高亮边框，**必须使用轻量、极速的原生 `graph` 绘制**（配置 `shape: "rect"`、`fillColor`、`lineColor`、`cornerRadius` 等）；
   - 背景与装饰线框统一由轻量原生 `graph` 承载，规避空 panel 带来的额外组件对象开销与多余渲染层级。
2. **同页面功能区域划分 ➔ 100% 使用 `type: "group"` (GGroup)**：
   - 若在同一个界面内划分若干功能区域（如卡片区域、检视器区、操作按钮组），**首选原生的 `type: "group"`（GGroup）**；
   - 所有子元件直接平铺挂在 Root 根节点下，声明 `"group": "groupName"` 归属到该组，保持单页面层级深度永远为 1，彻底消灭层级穿透与时序断裂！
3. **面板嵌套规则与组件解耦铁律 (The Panel Nesting & Decoupling Law)**：
   - **允许嵌套容器 Panel**：当需要整体裁剪（如 ScrollPane 视口）、独立显示矩阵变换（如旋转与等比缩放）时，允许在页面内使用子 Panel 作为功能容器；
   - **控制器与动效 Root-Only 铁律**：页面内部的所有子 Panel 禁止内联声明 `controllers` 与 `transitions`；若子模块需要独立的业务状态机或自治动效，必须将其抽离为独立自治的 JSON 布局文件，并通过 `"src": "res/layout/xxx.json"` 进行外部引用！

### 2.4 FGUI GGroup (组) 全特性深度应用与选型决策指南

在 FairyGUI 架构哲学中，`GGroup` 并非单纯的静态标签，而是具备**轻量、高效、穿透联动**特性的强大逻辑排版节点：

#### 1. GGroup 的两大核心原生联动能力（源码级保障）
- **位移联动广播 (moveChildren)**：
  在 FairyGUI 底层（`fairygui.js` 第 783~784 行、第 4762 行），当 GGroup 的 `x` / `y` 坐标发生变化（包括被 `Transition` 的 XY 动作或 `GearXY` 驱动）时，会自动触发 `moveChildren(dx, dy)`，**组内所有子图元毫秒级无损同步位移**！
- **透明度联动广播 (handleAlphaChanged)**：
  在 FairyGUI 底层（`fairygui.js` 第 4897 行），当 GGroup 的 `alpha` 发生变化（包括被 `Transition` 的 Alpha 动作驱动）时，会自动触发 `handleAlphaChanged()`，**组内所有子图元同步淡入淡出**！

#### 2. GGroup 在出场补间动效中的实战范式
当卡片或功能块的出场动画仅涉及**“位移滑入 (XY) 与淡入 (Alpha)”**时，**绝对无需将卡片拆为独立的外部文件或嵌套 Panel**，直接在同一页面内使用 GGroup 拍平包裹即可：
```json
{
  "transitions": [
    {
      "name": "cardSlideIn",
      "items": [
        { "type": "xy", "target": "cardGroup", "startValue": [450, 0], "endValue": [0, 0], "duration": 0.45, "easeType": 5 },
        { "type": "alpha", "target": "cardGroup", "startValue": 0, "endValue": 1, "duration": 0.3 }
      ]
    }
  ],
  "elements": [
    { "type": "group", "name": "cardGroup", "gearDisplay": { "controller": "pageCtrl", "pages": ["pageA"] } },
    { "type": "graph", "name": "cardBg", "width": 520, "height": 120, "fillColor": "#1e293b", "cornerRadius": 8, "group": "cardGroup" },
    { "type": "text", "text": "卡片标题", "x": 16, "y": 16, "group": "cardGroup" },
    { "type": "button", "name": "btnAction", "x": 380, "y": 36, "group": "cardGroup" }
  ]
}
```
*优势：单页面层级深度严格为 1，零文件碎片，极简纯粹，且出场滑入动效 100% 顺畅生效！*

#### 3. GGroup 的能力边界与物理限制
| 功能特性 | GGroup 是否支持 | 物理原因与底层机理 | 应对方案 |
| :--- | :---: | :--- | :--- |
| **位移联动 (XY)** | ✅ 100% 支持 | 底层 `moveChildren(dx, dy)` 广播 | 直接将 Transition/GearXY target 设为 Group |
| **淡入淡出 (Alpha)** | ✅ 100% 支持 | 底层 `handleAlphaChanged()` 广播 | 直接将 Transition Alpha target 设为 Group |
| **显隐切换 (Visible)** | ✅ 100% 支持 | 底层 `internalVisible` 继承机制 | Group 挂载 `gearDisplay` 统一控显隐 |
| **流式排版 (Layout)** | ✅ 100% 支持 | 原生支持 `layout: "horizontal" / "vertical"` 与 `gap` | 设置 `layoutType` 自动测算并排版 |
| **等比缩放 (Scale)** | ❌ 不支持 | GGroup 是逻辑包围盒，无独立显示矩阵 | 选用 GComponent (Panel) 承载 |
| **任意旋转 (Rotation)** | ❌ 不支持 | GGroup 无底层显示对象容器，无法施加旋转矩阵 | 选用 GComponent (Panel) 承载 |
| **视口滚动 (Scroll)** | ❌ 不支持 | GGroup 无法持有 ScrollPane 裁剪视口 | 选用带 `scroll: true` 的 Panel |

#### 4. GGroup vs Panel (GComponent) 选型决策
```
                    需要组织一组子图元或构建界面功能块
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
仅涉及普通分区/位移滑入/淡入淡出/排版流？                   需要旋转/缩放/视口裁剪/独立自治状态机？
       │                                                         │
       ▼                                                         ▼
【选用 GGroup + GGraph 拍平】                             【选用 GComponent (Panel)】
- 页面层级深度严格为 1                                    - 若带独立控制器/动效：必须 src 外部引用
- 零文件碎片，同文件自闭环                                - 若纯功能容器：可在页面内作为子容器挂载
- 内存最小，排版最快
```

---

## 三、 声明式配置驱动与组件模型 (Declarative Component Model)

### 3.1 元素多态路由表 (官方 18 大原生组件对齐)

| type 配置值 | 产出 FGUI 对象 | 创建函数 | 典型适用场景 |
|---|---|---|---|
| `"text"` | `fgui.GBasicTextField` | `createText` | 普通文本展示 |
| `"text"` + `isUbb: true` | `fgui.GRichTextField` | `createRichTextField` | 带颜色/加粗/超链接标签的 UBB 富文本 |
| `"text"` + `isInput: true` | `fgui.GTextInput` | `createTextInput` | 交互式单行/多行文本输入框 |
| `"icon"` | `fgui.GLoader` | `createIcon` | 远程/本地图片与图标装载 |
| `"graph"` | `fgui.GGraph` | `createGraph` | 矩形/圆角底板、装饰线条与几何图形 |
| `"panel"` | `EPanel` (GComponent) | `createPanel` | 弹性容器面板（支持递归嵌套子元素） |
| `"list"` | `PureList` (GList) | `createList` | 虚拟化无限循环滚动列表/网格 (支持 selectionController) |
| `"button"` | `fgui.GButton` | `createButton` | 具有按压反馈、Checkbox 勾选或 Radio 单选能力的按钮 |
| `"slider"` | `fgui.GSlider` | `createSlider` | 原生滑动条 (bar + grip 拖拽手柄 + title) |
| `"progressbar"` | `fgui.GProgressBar` | `createProgressBar` | 原生进度指示条 (bar + title) |
| `"group"` | `fgui.GGroup` | `createGroup` | 逻辑与排版分组，子元件配置 `group` 自动归属 |
| `"label"` | `fgui.GLabel` | `createLabel` | 官方标准复合标签，支持内置 title 与 icon |
| `"combobox"` | `fgui.GComboBox` | `createComboBox` | 原生下拉菜单选框，支持双向绑定 selectionController |
| `"scrollbar"` | `fgui.GScrollBar` | `createScrollBar` | 原生独立滚动条 (grip + bar + arrow1/arrow2) |
| `"tree"` | `fgui.GTree` | `createTree` | 原生树形组件 (继承 GList，支持多级缩进与展开折叠) |
| `"movieclip"` | `fgui.GMovieClip` | `createMovieClip` | 原生序列帧动画播放组件 (frame/timeScale/playing) |
| `"loader3d"` | `fgui.GLoader3D` | `createLoader3D` | 原生 3D 模型与 Spine 骨骼渲染装载器 |
| `"image"` | `fgui.GImage` | `createImage` | 原生静态图片组件 (支持翻转与多种 fillMethod 环形填充) |

### 3.2 原生扩展部件语义与运行时契约（字段详情见 `uifactory-layout.schema.json`）

1. **GButton (`button`)**：
   - 内置 `"button"` 控制器页面名固定为 **`["up", "down", "over", "selectedOver"]`**，`gearColor` 描边色字段为 **`"strokeColor"`**（非 `"outlineColor"`）。
   - `downEffect: 2, downEffectValue: 0.92` 为中心向心缩放（自动设置 `pivot=0.5`）。
   - `mode: "Check"` 内部勾选图元绑定 `gearDisplay: { controller: "button", pages: ["down", "selectedOver"] }`；选中自动改文案直接配 `title` + `selectedTitle`（注：`btn.title` getter 永远返回 `_title`，实际显示文本在 `btn.getChild("title").text`）。
   - `mode: "Radio"` 配合 `relatedController` + `pageId` 由根节点控制器自动互斥。
2. **GProgressBar / GSlider**：
   - 子元件标准命名：`"bar"` / `"bar_v"`（填充条）、`"title"`（文本）、`"grip"`（`GSlider` 手柄）及建议透明全高热区 `"bg"`（`fillColor: null` + `changeOnClick: true`）。
   - **`GSlider` 初始位置因果约束**：正向滑块 `grip` 初始必须置于 `bar` **右/底端**；`reverse: true` 时 `grip` 初始必须置于 `bar` **左/顶端**（由引擎绑定 `Left_Left` / `Top_Top`）。
   - **`GProgressBar` 动效**：运行期通过原生 `progress.tweenValue(val, duration)` 触发平滑过渡。
3. **GImage vs GLoader**：
   - **`GImage` (`"image"`)** 与 **`GLoader` (`"icon"`)** 均使用 **`url`**（非 `src`），字段类型见 Schema：`GImage` 的 `flip`（`0:None, 1:Horizontal, 2:Vertical, 3:Both`）与 `fillMethod`（`0:None, 1:Horz, 2:Vert, 3:R90, 4:R180, 5:R360`）为数字枚举；`GLoader` 的 `fill` 为字符串枚举（`"none" | "scale" | "scaleMatchHeight" | "scaleMatchWidth" | "scaleFree" | "scaleNoBorder"`，亦兼容 `0..5`）且 `UIFactory.createIcon` 必填 `url`。
4. **GList / GComboBox / ScrollPane / GScrollBar / GTree**：
   - **`GList` (`"list"`)**：行卡片需随滚动条占位/悬浮自适应宽度时，必须用 `type: "list"` + `autoResizeItem: true`，且行模板内部配合合法 `relations`；虚拟列表 `itemRenderer` 必须使用 `Laya.Handler.create(this, fn, undefined, false)`。
   - **`GComboBox` (`"combobox"`)**：`dropdown` 内 `list` 与 `defaultItem` 宽度须与主按钮一致，避免右侧留白。
   - **`ScrollPane` 与 `GScrollBar`**：滚动容器可直接配置 `vtScrollBar` / `hzScrollBar` / `scrollBarDisplay`（`visible` 常显 / `auto` 滚动时显现 0.5s 淡出 / `hidden` 隐藏）/ `scrollBarFloating`（`true` 悬浮不占 `viewWidth`）/ `scrollBarDisplayOnLeft` / `scrollBarMargin`，亦可用独立 `scrollbar` + `target` 同级绑定。
   - 全部 18 种内置类型均提供 `UIFactory.create*` 静态工厂方法。

---

## 四、 页面状态机 (Controller) 与齿轮联动 (Gears) 契约

### 4.1 控制器 (Controllers) 与动效 (Transitions) 的根节点声明规则 (Root-Only Declaration Rule)

在 FairyGUI 架构中，控制器（GController）与动效（Transition）属于组件（GComponent）级别的核心属性：
1. **单页面根节点唯一性**：在单个 JSON 页面配置文件中，`controllers` 与 `transitions` **必须且只能在 Root 根节点声明**；
2. **根节点命名不作死板限制**：根节点的命名完全支持任意业务语义名称（如 `name: "tab1Panel"`、`name: "settingDialog"` 等，不限死叫 root），只要它是该页面 JSON 顶层容器即可；
3. **子节点禁止内联声明**：页面内部的子节点（如嵌套的子 panel、row 容器、group 等）禁止直接内联声明 `controllers` 或 `transitions`；
4. **子模块独立状态机解耦规范**：若页面的某个子模块需要拥有独立的控制器（例如独立的单选组或子状态机）或专属动效，**应将其抽离为独立的 JSON 配置文件（自治组件），并在父页面中通过 `"src": "res/layout/xxx.json"` 进行外部引用**。每个独立组件在自身根节点上合法声明其属性。

### 4.2 控制器与齿轮层级驱动规则

在 FGUI 官方架构中，控制器切换时父容器调用 `applyController(c) -> child.handleControllerChanged(c)` 驱动子元件。页面内统一由 Root 根节点声明状态机，齿轮通过控制器名称进行状态响应绑定。

### 4.3 全系 10 大 Gears 状态机配置总表

每个子元件均可在配置中声明以下齿轮，随控制器的页面切换自动执行状态迁移：

| 齿轮属性 | FGUI 原生类 | 功能说明 | 关键配置参数范例 |
|---|---|---|---|
| `gearDisplay` | GearDisplay (0) | 页面显隐控制（未选中页面完全移出渲染树，零渲染开销） | `gearDisplay: { controller: "modeCtrl", pages: ["viewA"] }` |
| `gearXY` | GearXY (1) | 双轴坐标平滑移动，支持缓动补间（**页面值必须为对象 `{ x, y }`，严禁 `[x, y]` 数组**） | `gearXY: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { x: 10, y: 20 }, viewB: { x: 80, y: 100 } } }` |
| `gearSize` | GearSize (2) | 宽高与缩放平滑过渡（**页面值必须为对象 `{ width, height, scaleX?, scaleY? }`，严禁数组**） | `gearSize: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { width: 60, height: 60, scaleX: 1.0, scaleY: 1.0 }, viewB: { width: 90, height: 90, scaleX: 1.2, scaleY: 1.2 } } }` |
| `gearLook` | GearLook (3) | 透明度、旋转、置灰(grayed)、可触控(touchable) 4维联动 | `gearLook: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { alpha: 1.0, rotation: 0 }, viewB: { alpha: 0.5, rotation: 45 } } }` |
| `gearColor` | GearColor (4) | 文本或矢量底色的颜色切换 | `gearColor: { controller: "modeCtrl", pages: { viewA: { color: "#2563eb" }, viewB: { color: "#dc2626" } } }` |
| `gearAnimation`| GearAnimation (5) | 序列帧动画播放/定格控制 | `gearAnimation: { controller: "modeCtrl", pages: { viewA: { playing: true }, viewB: { playing: false, frame: 0 } } }` |
| `gearText` | GearText (6) | 多语言或动态提示文案映射 | `gearText: { controller: "modeCtrl", pages: { viewA: "状态正常", viewB: "紧急警告" } }` |
| `gearIcon` | GearIcon (7) | 图标与资源纹理路径映射 | `gearIcon: { controller: "modeCtrl", pages: { viewA: "icon_a.png", viewB: "icon_b.png" } }` |
| `gearDisplay2` | GearDisplay2 (8) | 复合多条件布尔逻辑求值（AND 且 / OR 或） | `gearDisplay2: { controller: "subCtrl", pages: ["page1"], condition: 1 }` (1=OR, 0=AND) |
| `gearFontSize` | GearFontSize (9) | 文本字号跨阶跳变 | `gearFontSize: { controller: "modeCtrl", pages: { viewA: 14, viewB: 20 } }` |

### 4.4 声明式属性控制 (Gears) 优先契约

> **设计准则**：在控制器切页驱动界面内容变化时，**避免在业务代码中手写循环或事件回调去手动修改组件属性**（如手动 `btn.title = "xxx"`、`graph.fillColor = "#..."`、`panel.visible = false` 等）。
> **推荐 100% 使用官方属性控制 (Gears)**：
> 1. **文案切换**：使用 `gearText`，由控制器自动替换文本；
> 2. **颜色切换**：使用 `gearColor`，由控制器自动切换矢量填充色与描边色；
> 3. **显隐排版**：使用 `gearDisplay` / `gearDisplay2`，由控制器自动管理渲染树节点的挂载与剔除；
> 4. **位移与缩放**：使用 `gearXY` / `gearSize`，由控制器自动执行平滑补间动画；
> 5. **列表与下拉双向绑定**：在 `GList` 与 `GComboBox` 上直接声明 `selectionController` 与 `pageController`，选中项切换与控制器状态双向自动联动，零手写胶水代码。

### 4.5 相对关联 (`relations`) 与动效 (`transitions`)

- **`relations`**：格式为 `"relations": [{ "target": "目标名或空字符串", "type": "枚举名", "usePercent"?: true }]`（结构定义见 Schema `IBaseElementConfig.relations`）。`type` 必须使用合法 FGUI `RelationType` 枚举名（如 `"Left_Left"`, `"Right_Right"`, `"Center_Center"`, `"Middle_Middle"`, `"Width"`, `"Height"`, `"Size"`, `"LeftExt_Left"` 等，严禁编造 `"Width_Width"`）。
- **`transitions` 与 `PlayTransitionAction`**：在根面板配置 `"transitions"` 数组，并通过 `this.getTransition("name").play(...)` 或控制器 `actions`（`type: "playTransition"`）触发；完整 `items[].type` 枚举由 Schema（`ITransitionItemConfig`）约束：

```json
{
  "controllers": [
    {
      "name": "pageCtrl",
      "pages": ["hidden", "shown"],
      "selectedIndex": 0,
      "actions": [
        { "type": "playTransition", "fromPage": ["hidden"], "toPage": ["shown"], "transitionName": "enterAnim", "playTimes": 1, "delay": 0 }
      ]
    }
  ],
  "transitions": [
    {
      "name": "enterAnim",
      "items": [
        { "time": 0, "type": "alpha", "target": "cardBox", "tween": true, "duration": 0.35, "startValue": 0, "endValue": 1, "easeType": 5 },
        { "time": 0, "type": "scale", "target": "cardBox", "tween": true, "duration": 0.4, "startValue": [0.85, 0.85], "endValue": [1, 1], "easeType": 27 }
      ]
    }
  ]
}
```
- 常用 `easeType`：`0: Linear`, `5: QuadOut`, `24: ElasticOut`, `27: BackOut`, `30: BounceOut`；运行期可通过 `trans.timeScale = 0.5 / dur` 控制倍速，通过 `trans.play(null, 1, 0, 0, -1, reverse)` 控制正向/反向播放。

---

## 五、 Spine 3.8 骨骼动画与矢量特效挂载（黄金桥接法则）

由于 Spine 动画和 2D 粒子系统属于底层原生渲染对象，不能直接 `addChild` 到舞台破坏 FGUI 适配。**必须使用 GGraph 矢量占位符作为宿主媒介**：

### 1. 声明占位媒介
```typescript
{
    type: "graph",
    name: "hero_spine_holder",
    width: 200,
    height: 240,
    layout: { alignX: "center", alignY: "middle" } // 弹性居中
}
```

### 2. 代码安全挂接与坐标对齐
```typescript
// 1. 获取占位符并转换为 GGraph
const holder = panel.getChild("hero_spine_holder").asGraph;

// 2. 实例化原生 Spine 或粒子
const spineAnim = new Laya.SpineSkeleton();
spineAnim.load("res/spine/hero.json");

// 3. 【黄金桥接】：挂入 FGUI 渲染流
holder.setNativeObject(spineAnim);

// 4. 纠正轴心：Spine 轴心通常在脚底中心，对其进行居中微调
spineAnim.x = holder.width / 2;
spineAnim.y = holder.height;
```

---

## 六、 确定性通用范式 (通用设置弹窗实战)

以下是一套兼具多端弹性自适应、控制器分页、多选复选、单选互斥与动效的通用界面配置范例。控制器严格遵循 **Root-Only 声明规则**，已通过 `validateLayoutConfig` 静态校验：

```typescript
const settingDialogConfig: IPanelConfig = {
    type: "panel",
    name: "settingDialog",
    width: 0.85,  // 占屏幕宽 85%，多端自适应
    height: 0.75, // 占屏幕高 75%
    background: {
        type: "graph",
        fillColor: "#0f172a",
        lineColor: "#334155",
        lineSize: 2,
        cornerRadius: 16 // 符合嵌套圆角公式：R_outer (16) = R_inner (8) + Padding (8)
    },
    // 单页面所有状态机统一在 Root 根节点声明
    controllers: [
        { name: "radioCtrl", pages: ["speedFast", "speedNormal"], selectedIndex: 0 }
    ],
    layoutType: "vertical",
    alignItems: "center",
    padding: { top: 24, bottom: 24, left: 32, right: 32 },
    gap: 16,
    elements: [
        // 标题栏
        {
            type: "text",
            name: "dialogTitle",
            text: "系统通用设置中心",
            fontSize: 24,
            bold: true,
            color: "#38bdf8"
        },
        // 单选互斥逻辑组 (使用 GGroup 拍平，同页面层级深度严格为 1，无冗余 Panel 嵌套)
        {
            type: "group",
            name: "radioGroupRow"
        },
        {
            type: "button",
            name: "btnFast",
            group: "radioGroupRow",
            width: 220,
            height: 44, // 满足触控最小尺寸标准 >= 44pt
            mode: "Radio",
            relatedController: "radioCtrl",
            pageId: "speedFast",
            elements: [
                { type: "graph", name: "bg", width: 220, height: 44, fillColor: "#1e293b", cornerRadius: 8 },
                { type: "text", name: "title", text: "高速模式 (Fast)", align: "center", valign: "middle", width: 220, height: 44, color: "#ffffff" }
            ]
        },
        {
            type: "button",
            name: "btnNormal",
            group: "radioGroupRow",
            width: 220,
            height: 44,
            mode: "Radio",
            relatedController: "radioCtrl",
            pageId: "speedNormal",
            elements: [
                { type: "graph", name: "bg", width: 220, height: 44, fillColor: "#1e293b", cornerRadius: 8 },
                { type: "text", name: "title", text: "常规模式 (Normal)", align: "center", valign: "middle", width: 220, height: 44, color: "#ffffff" }
            ]
        },
        // 底部确认大按钮 (具有中心等比缩放按压反馈)
        {
            type: "button",
            name: "btnConfirm",
            width: 260,
            height: 52,
            downEffect: 2,
            downEffectValue: 0.92,
            elements: [
                { type: "graph", name: "bg", width: 260, height: 52, fillColor: "#16a34a", cornerRadius: 8 },
                { type: "text", name: "title", text: "保存并应用配置", fontSize: 16, bold: true, color: "#ffffff", align: "center", valign: "middle", width: 260, height: 52 }
            ]
        }
    ]
};

// 创建并挂载到全局 GRoot
const settingDialog = UIFactory.createPanel(settingDialogConfig, 0, 0);
fgui.GRoot.inst.addChild(settingDialog);
```

---

## 七、 架构物理红线与避坑清单 (Physical Invariants & Redlines)

为确保代码生成与纯代码配置在任何运行环境下 100% 稳定运行、杜绝黑屏/拉伸/死锁，必须严格遵守以下十三大物理红线：

### 1. 🚨 铁律一：滚动容器（overflow: 2）的直接子级禁止使用相对居中（layout: alignX/alignY）
- **现象与根因**：ScrollPane 视口滚动会高频修改视口偏移，而 `layout: { alignX: "center", alignY: "middle" }` 会在底层建立 `Center_Center` 关联。一旦滚动或容器尺寸变动，两者相互拉扯，导致内容在视口中**剧烈抖动、闪烁甚至瞬间跳回屏幕中央**！
- **正确规范**：滚动视口的直接子节点**必须使用常规流式布局（如 layoutType: "vertical"）或纯绝对坐标（x/y）**；若局部模块确需居中，必须包裹在内层定宽定高容器中，由内层容器居中子节点。

### 2. 🚨 铁律二：多行流式换行（flexWrap: true）容器必须显式声明宽度
- **现象与根因**：引擎计算折行换行阈值完全依赖容器可用宽度（`width - padding.left - padding.right`）。若容器未显式设置 `width`，引擎无法推导单行折行终点，会导致**所有子节点全挤在第一行单行溢出，或容器高度推算失真为 0**！
- **正确规范**：凡配置 `layoutType: "horizontal"` 且 `flexWrap: true` 的容器，**父容器必须提供显式的 width**（可以是百分比如 `0.9`，也可以是物理宽度如 `600`）；高度无需指定，引擎会自动虚拟推演所有折行并自适应撑开总高度。

### 3. 🚨 铁律三：动态文案与段落文本必须配置显式 width 边界
- **现象与根因**：FGUI 文本在未配置 `width` 时默认为 `AutoSizeType.Both`（单行向右无限延展）。虽然 UIFactory 会自动将 `\n` 转义为 `<br/>`，但如果文本缺失宽度限制，普通长文案永远不会自然换行，甚至直接冲出屏幕！
- **正确规范**：凡是动态多行提示、公告或段落文本，**必须显式声明 `width`**，使其自动切换为 `AutoSizeType.Height`（固定宽度、高度随文本自动撑开）。

### 4. 🚨 铁律四：控制器必须在 Root 声明，受控齿轮首选通过 GGroup 拍平或 src 外部解耦
- **现象与根因**：在 FGUI 官方架构中，控制器切页是通过 `parent.applyController(c) -> child.handleControllerChanged(c)` 仅向下派发一层。如果在嵌套子 Panel 中内联声明控制器，不仅会破坏单页面单一事实源，还会被引擎 `validateLayoutConfig` 校验直接拦截报错；而若让深层嵌套的孙子节点直接挂载根级齿轮，也会因跨层而无法接收到父级的切页广播！
- **正确规范**：单页面所有控制器**必须且只能在 Root 根节点声明**。需要受状态机驱动的子元件推荐直接挂载在 Root 下并通过 `GGroup` 拍平分组；若局部子模块需要深层排版且受状态机控制，必须将该子模块抽离为独立的 JSON 布局文件并通过 `"src": "res/layout/xxx.json"` 进行外部引用解耦。

### 5. 🚨 铁律五：单选按钮组（Radio）控制器由 Root 统一管理，子 Panel 仅作为排版容器
- **现象与根因**：单选互斥依赖 `Radio` 模式按钮配置的 `relatedController` 与页面状态机联动。如果在嵌套的行/列容器中重复声明 `controllers`，会触发引擎校验异常；而若单选按钮的 `relatedController` 命名与根控制器不匹配，则会导致互斥链条断裂，出现多个单选同时被选中或切页死锁。
- **正确规范**：单选组关联的控制器必须在页面 Root 根节点声明，单选按钮只需配置 `relatedController: "radioCtrl", pageId: "..."`，中间包裹单选按钮的水平/垂直 Panel 仅作为排版容器，严禁在子容器内重复内联声明同名控制器。

### 6. 🚨 铁律六：缩放/旋转/弹跳补间动效必须显式指定几何中心轴心点（Pivot）
- **现象与根因**：FGUI 组件默认轴心点为左上角 `(0, 0)`。在此状态下直接执行缩放弹跳（Scale 1.0 -> 1.2）或旋转动效，元素会沿着左上角向右下方膨胀偏移，导致**视觉中心大幅跑偏、动效漂移错位**！
- **正确规范**：凡是作为动效主体、缩放弹出窗口、旋转图标的节点，必须显式声明 `pivotX: 0.5, pivotY: 0.5, asAnchor: true`，确保缩放与旋转严格以几何中心为基准，绝对布局 `(x, y)` 保持零位移。

### 7. 🚨 铁律七：HTML 宿主中绝对禁止通过 CSS 强行拉伸 #layaCanvas
- **现象与根因**：在 HTML/CSS 中如果写了 `#layaCanvas { width: 100%; height: 100%; }`，浏览器会将 1280×720 的 Canvas WebGL 渲染缓冲在 DOM 层暴力放大插值，导致**全屏文字发虚发糊、边缘严重毛刺，且鼠标物理点击坐标产生几十到上百像素的严重错位**！
- **正确规范**：HTML 宿主必须保持纯净 `<style>body{margin:0;background:#000;overflow:hidden}</style>`，严禁对 Canvas 附加任何宽高拉伸样式，将渲染分辨率与鼠标逆投影矩阵 100% 交由引擎原生管理。

### 8. 🚨 铁律八：高密度微图元（>50个）必须封装为独立原子微容器
- **现象与根因**：大量密集型微小图元（如点阵网格、散落金币粒子、掉落物碎片）若全部平铺在根面板，会导致根面板的 DisplayList 和坐标脏标记计算极度繁重，引发丢帧卡顿。
- **正确规范**：必须将其封装为独立的“原子级微容器（Sub-Panel）”，让微图元在独立面板内部完成局部排布，根面板仅持有一个轻量级的子容器句柄。

### 9. 🚨 铁律九：UI 布局配置必须 100% 静态数据驱动，严禁在业务代码中动态拼装配置
- **现象与根因**：在 TypeScript 代码中硬编码大段 UI 对象字面量，或使用 `_createCard`、`_createOptionBtn`、`_createSliderRow`、`.map(...)` 等辅助函数在运行时“动态填值、拼接配置”，会导致 UI 结构与业务逻辑高度耦合，无法独立审阅、调试、热更或被可视化工具与转译器逆向解析，严重违背数据驱动设计。
- **正确规范**：所有 UI 布局树必须作为独立的纯静态声明式 JSON 文件（如 `res/layout/*.json`）存放；业务代码仅负责通过加载器拉取 JSON、调用 `UIFactory.createPanel(config)` 实例化，并通过 `container.getChild("...")` 绑定交互事件与状态更新。

### 10. 🚨 铁律十：原生滑块 (GSlider) 手柄关联必须在初始满宽状态下建立
- **现象与根因**：GSlider 的拖拽手柄 `grip` 依托 FGUI 官方关联系统（Relations）通过 `Right_Right`/`Bottom_Bottom`（正向）或 `Left_Left`/`Top_Top`（`reverse: true` 反向）跟随 `bar` 位移。如果在 `bar` 被当前值提前缩窄后再建立关联，关联系统会记录错误的初始相对偏移，导致滑块手柄大幅跑偏或冲出轨道。
- **正确规范**：扩展装配管线必须在 `bar` 处于设计满宽（`_barMaxWidth`）状态下完成 `grip` 与 `bar` 的 `addRelation`（正向放右/底端，反向放左/顶端），随后再设置 `value` 并触发 `update()` 驱动手柄同步至目标位置。

### 11. 🚨 铁律十一：独立工厂 `create*` 显式定位与禁止对面板使用 `scale` 适配
- **现象与根因**：独立调用 `UIFactory.createSlider`、`createProgressBar`、`createPanel` 等返回的对象坐标默认为 `(0, 0)`（因为 `x`/`y` 通常由父容器管线应用）；同时，若对包含 `GComboBox` 等弹窗组件的父面板使用 `scaleX/scaleY` 缩放适配，挂载于未缩放 `GRoot` 上的下拉弹窗将无法继承父级缩放而出现宽度错位。
- **正确规范**：独立调用 `UIFactory.create*` 后挂载到父容器前必须显式 `inst.setXY(conf.x ?? 0, conf.y ?? 0)`；除非专门测试缩放功能（如 `GearSize`/缩放动效靶子），否则严禁对面板容器使用 `scaleX`/`scaleY` 缩放适配，应直接按目标视口 `1:1` 布局。

### 12. 🚨 铁律十二：官方无动态 API 时「改 JSON 重构组件」测试原则
- **现象与根因**：FGUI 官方部分属性仅在构造期读取（如 `GProgressBar._reverse`、`GSlider._reverse`、`ScrollPane._scrollBarDisplay`），运行期无动态 setter/getter；直接修改私有字段会引发几何关联状态不一致。
- **正确规范**：需要动态切换此类属性时，在视图控制器中克隆原始配置 JSON、修改目标字段（如 `reverse`、反向 `grip.x`、`scrollBarDisplay`），销毁旧实例（`dispose()`）后通过 `UIFactory.create*` 重新走完整创建流程并 `addChildAt` 放回原位。

### 13. 🚨 铁律十三：JSON 优先配置与 TypeScript 运行期集成边界
- **JSON 优先**：能在 JSON 中声明的能力（`list.selectionController`、`button.relatedController`、`mode: "Check"` + `title`/`selectedTitle`、`gearText` 等）一律在 JSON 中实现，禁止在 `.ts` 中编写重复的按钮绑定循环或手动文案切换代码。
- **TypeScript 严格类型边界**：`GTextField.align` / `valign` 类型为字符串字面量 `"left" | "center" | "right"` 与 `"top" | "middle" | "bottom"`（禁止赋 `fgui.AlignType` 枚举值）；`GList.itemRenderer` 必须使用 `Laya.Handler.create(this, fn, undefined, false)`。
