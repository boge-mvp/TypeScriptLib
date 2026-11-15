# UIFactory 纯代码 UI 构建与多端自适应指南 (面向 AI 界面构建与代码生成)

> **文档性质**：面向代码生成智能体（AI Agent）及开发者的**通用界面构建实战指南**。
> **核心目标**：指导 AI 学习如何使用 `UIFactory` 声明式配置驱动（JSON Schema）构建高品质、多端响应式防拉伸变形的 FGUI 纯代码界面，以及挂接 Spine 3.8 骨骼动画与矢量特效。
> **命名空间约定**：纯代码工厂入口在全局或框架中以 `UIFactory` 命名暴露，本文所有示例均直接以 `UIFactory.xxx` 纯净语法示范。

---

## 一、 技术选型决策铁律（AI 必须执行）

在构建游戏 UI 界面与交互逻辑时，必须严格遵守以下三级优先级决策链，**绝对禁止直接创建底层引擎原生 UI 对象挂载到外部舞台**：

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

### 为什么禁止原生 UI 对象直接构建界面：
1. **适配比例分裂**：原生对象的缩放计算游离在 FGUI 的 `GRoot` 与关联系统（Relation）之外，在宽屏、折叠屏或平板上必定产生拉伸变形或位置错位；
2. **事件与裁剪穿透**：FGUI 的滚动视口（ScrollPane）无法对外部原生对象执行矢量视口裁剪，且两者的命中测试（HitTest）与事件冒泡链路完全冲突。

---

## 二、 响应式自适应排版设计思想 (多端防拉伸变形)

在编写纯代码配置时，AI 必须将**“防变形、防拉伸、防挤压”**置于首位：

1. **相对定位与百分比首选**：
   - 优先通过 `layout: { alignX: "center", alignY: "middle" }` 或 `leftPercent / topPercent`（0~1 比例值）进行弹性定位；
   - 绝对坐标 `x / y` 仅作为辅助微调手段，不推荐作为常规响应式界面的主要布局手段。
2. **百分比宽高与行/列权重分配**：
   - 容器与面板推荐使用百分比尺寸（如 `width: 0.85` 代表占屏幕/父级宽度的 85%）；
   - 在网格或横向流式布局中，子项宽度推荐根据所在的列权重定义百分比（如 `0.3` 代表一行自动弹性三等分），彻底杜绝极端分辨率下的挤压变形。
3. **8pt 空间度量网格**：
   - 所有间距（gap）、内边距（padding）、组件高度严格遵循 8pt 网格阶梯（8, 12, 16, 20, 24, 32, 40, 48, 56），保持视觉呼吸感。

---

## 三、 UIFactory 元素配置与声明式范式

### 3.1 元素多态路由表

| type 配置值 | 产出 FGUI 对象 | 创建函数 | 典型适用场景 |
|---|---|---|---|
| `"text"` | `fgui.GBasicTextField` | `createText` | 普通文本展示 |
| `"text"` + `isUbb: true` | `fgui.GRichTextField` | `createRichTextField` | 带颜色/加粗/超链接标签的 UBB 富文本 |
| `"text"` + `isInput: true` | `fgui.GTextInput` | `createTextInput` | 交互式单行/多行文本输入框 |
| `"icon"` | `fgui.GLoader` | `createIcon` | 远程/本地图片与图标装载 |
| `"graph"` | `fgui.GGraph` | `createGraph` | 矩形/圆角底板、装饰线条与几何图形 |
| `"panel"` | `EPanel` (GComponent) | `createPanel` | 弹性容器面板（支持递归嵌套子元素） |
| `"list"` | `PureList` (GList) | `createList` | 虚拟化无限循环滚动列表/网格 |
| `"button"` | `fgui.GButton` | `createButton` | 具有按压反馈、Checkbox 勾选或 Radio 单选能力的按钮 |

---

## 四、 页面状态机 (Controller) 与齿轮联动 (Gears) 规范

### 4.1 控制器与齿轮直接父子层级铁律（Direct-Parent Scoping Law）

> **最高约束**：在 FGUI 官方架构中，**Controller 必须声明在受控元素的直接父容器（Parent Panel）上**！
> 严禁跨层级隔代绑定齿轮。当直接父容器上的控制器发生页面切换时，父容器会自动调用原生的 `applyController(c) -> child.handleControllerChanged(c)`，毫秒级精准驱动子元件，零死锁、零事件竞争！

### 4.2 全系 10 大 Gears 状态机配置总表

每个子元件均可在配置中声明以下齿轮，随直接父级控制器的页面切换自动执行状态迁移：

| 齿轮属性 | FGUI 原生类 | 功能说明 | 关键配置参数范例 |
|---|---|---|---|
| `gearDisplay` | GearDisplay (0) | 页面显隐控制（未选中页面完全移出渲染树，零渲染开销） | `gearDisplay: { controller: "modeCtrl", pages: ["viewA"] }` |
| `gearXY` | GearXY (1) | 双轴坐标平滑移动，支持缓动补间 | `gearXY: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { x: 10, y: 20 }, viewB: { x: 80, y: 100 } } }` |
| `gearSize` | GearSize (2) | 宽高与缩放平滑过渡 | `gearSize: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { width: 60, height: 60, scale: 1.0 }, viewB: { width: 90, height: 90, scale: 1.2 } } }` |
| `gearLook` | GearLook (3) | 透明度、旋转、置灰(grayed)、可触控(touchable) 4维联动 | `gearLook: { controller: "modeCtrl", tween: true, duration: 0.4, pages: { viewA: { alpha: 1.0, rotation: 0 }, viewB: { alpha: 0.5, rotation: 45 } } }` |
| `gearColor` | GearColor (4) | 文本或矢量底色的颜色切换 | `gearColor: { controller: "modeCtrl", pages: { viewA: { color: "#2563eb" }, viewB: { color: "#dc2626" } } }` |
| `gearAnimation`| GearAnimation (5) | 序列帧动画播放/定格控制 | `gearAnimation: { controller: "modeCtrl", pages: { viewA: { playing: true }, viewB: { playing: false, frame: 0 } } }` |
| `gearText` | GearText (6) | 多语言或动态提示文案映射 | `gearText: { controller: "modeCtrl", pages: { viewA: "状态正常", viewB: "紧急警告" } }` |
| `gearIcon` | GearIcon (7) | 图标与资源纹理路径映射 | `gearIcon: { controller: "modeCtrl", pages: { viewA: "icon_a.png", viewB: "icon_b.png" } }` |
| `gearDisplay2` | GearDisplay2 (8) | 复合多条件布尔逻辑求值（AND 且 / OR 或） | `gearDisplay2: { controller: "subCtrl", pages: ["page1"], condition: 1 }` (1=OR, 0=AND) |
| `gearFontSize` | GearFontSize (9) | 文本字号跨阶跳变 | `gearFontSize: { controller: "modeCtrl", pages: { viewA: 14, viewB: 20 } }` |

---

## 五、 原生组件全家桶构建规范 (Button, Checkbox, Radio, Slider, Input)

### 5.1 GButton 按压反馈与模式
- **中心向心缩放**（推荐纯代码按钮）：配置 `downEffect: 2, downEffectValue: 0.92`。UIFactory 会自动设置 `setPivot(0.5, 0.5, pivotAsAnchor)`，保持顶层布局 `(x, y)` 零位移，按压时向几何中心平滑微缩。
- **滤镜变暗反馈**：配置 `downEffect: 1, downEffectValue: 0.65`（适合带底图按钮）。
- **Checkbox 复选模式**：配置 `mode: "Check"`。内部放置对勾文本或图元，并绑定 `gearDisplay: { controller: "button", pages: ["down", "selectedOver"] }`，即可实现全自动原生的勾选显隐！
- **Radio 单选模式**：配置 `mode: "Radio", relatedController: "radioCtrl", pageId: "optA"`，且必须与其兄弟单选按钮共同放置在持有 `"radioCtrl"` 的直接父容器中。

### 5.2 进度条与可拖拽滑动条 (GProgressBar / GSlider)
- 在组件容器中，只需包含具有规范名称的子元件：
  - 名为 `"bar"` 或 `"bar_v"` 的图元：映射为进度填充体；
  - 名为 `"title"` 的文本：映射为百分比文本；
  - 名为 `"grip"` 的图元（GSlider 特有）：映射为手柄并自动激活物理拖拽手势！

### 5.3 交互式输入框 (GTextInput)
- 配置 `type: "text", isInput: true, promptText: "请输入内容..."`，UIFactory 自动产出原生 `fgui.GTextInput`，底层自动挂载系统原生输入框并支持光标对焦与键盘键入。

---

## 六、 Spine 3.8 骨骼动画与粒子特效挂载（黄金桥接法则）

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
// 1. 获取占位符并强转为 GGraph
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

## 七、 界面完全自适应实战范式 (通用通用设置弹窗)

以下是一套兼具多端弹性自适应、控制器分页、多选复选、单选互斥与动效的通用界面配置范例：

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
        cornerRadius: 12
    },
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
        // 单选互斥选项组容器 (直接持有 radioCtrl 控制器)
        {
            type: "panel",
            name: "radioGroupRow",
            width: 500,
            height: 48,
            layoutType: "horizontal",
            justifyContent: "space-around",
            controllers: [
                { name: "radioCtrl", pages: ["speedFast", "speedNormal"], selectedIndex: 0 }
            ],
            elements: [
                {
                    type: "button",
                    name: "btnFast",
                    width: 220,
                    height: 44,
                    mode: "Radio",
                    relatedController: "radioCtrl",
                    pageId: "speedFast",
                    elements: [
                        { type: "graph", name: "bg", width: 220, height: 44, fillColor: "#1e293b", cornerRadius: 6 },
                        { type: "text", name: "title", text: "高速模式 (Fast)", align: "center", valign: "middle", width: 220, height: 44, color: "#ffffff" }
                    ]
                },
                {
                    type: "button",
                    name: "btnNormal",
                    width: 220,
                    height: 44,
                    mode: "Radio",
                    relatedController: "radioCtrl",
                    pageId: "speedNormal",
                    elements: [
                        { type: "graph", name: "bg", width: 220, height: 44, fillColor: "#1e293b", cornerRadius: 6 },
                        { type: "text", name: "title", text: "常规模式 (Normal)", align: "center", valign: "middle", width: 220, height: 44, color: "#ffffff" }
                    ]
                }
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

## 八、 AI 界面构建与代码生成黄金避坑与禁止规则 (红线清单)

为确保 AI 生成的代码在任何环境下 100% 稳定运行、杜绝黑屏/拉伸/死锁，必须严格遵循以下八大铁律：

### 1. 🚨 铁律一：滚动容器（overflow: 2）的直接子级绝对禁止使用相对居中（layout: alignX/alignY）
- **现象与根因**：ScrollPane 视口滚动会高频修改视口偏移，而 `layout: { alignX: "center", alignY: "middle" }` 会在底层建立 `Center_Center` 关联。一旦滚动或容器尺寸变动，两者相互拉扯，导致内容在视口中**剧烈抖动、闪烁甚至瞬间跳回屏幕中央**！
- **正确规范**：滚动视口的直接子节点**必须使用常规流式布局（如 layoutType: "vertical"）或纯绝对坐标（x/y）**；若局部模块确需居中，必须包裹在内层定宽定高容器中，由内层容器居中子节点。

### 2. 🚨 铁律二：多行流式换行（flexWrap: true）容器必须显式声明宽度
- **现象与根因**：引擎计算折行换行阈值完全依赖容器可用宽度（`width - padding.left - padding.right`）。若容器未显式设置 `width`，引擎无法推导单行折行终点，会导致**所有子节点全挤在第一行单行溢出，或容器高度推算失真为 0**！
- **正确规范**：凡配置 `layoutType: "horizontal"` 且 `flexWrap: true` 的容器，**父容器必须提供显式的 width**（可以是百分比如 `0.9`，也可以是物理宽度如 `600`）；高度无需指定，引擎会自动虚拟推演所有折行并自适应撑开总高度。

### 3. 🚨 铁律三：动态文案与段落文本必须配置显式 width 边界
- **现象与根因**：FGUI 文本在未配置 `width` 时默认为 `AutoSizeType.Both`（单行向右无限延展）。虽然 UIFactory 会自动将 `\n` 转义为 `<br/>`，但如果文本缺失宽度限制，普通长文案永远不会自然换行，甚至直接冲出屏幕！
- **正确规范**：凡是动态多行提示、公告或段落文本，**必须显式声明 `width`**，使其自动切换为 `AutoSizeType.Height`（固定宽度、高度随文本自动撑开）。

### 4. 🚨 铁律四：控制器与齿轮必须属于直接父容器（Direct-Parent Scoping）
- **现象与根因**：在 FGUI 官方架构中，`gear.controller = this.parent.getController(...)`。若将齿轮声明在曾祖父容器的控制器上，父级切换时官方的 `applyController` 根本无法跨层遍历到孙子节点，导致**齿轮状态机完全失效、点击无响应**！
- **正确规范**：受控子元件（如 Tab 页签内容、单选按钮）的控制器，**必须直接声明在该元件的直接父级 Panel 上**。若顶级大按钮需要控制深层内容，应通过脚本在顶级事件中同步修改该子面板的控制器索引。

### 5. 🚨 铁律五：单选按钮组（Radio）必须与兄弟项同置于持有该控制器的父容器内
- **现象与根因**：单选互斥依赖父级的 `radioRow.applyController` 依次触发所有兄弟单选按钮的 `handleControllerChanged` 进行反选。若单选按钮散落在不同层级的子容器中，**会导致互斥链条断裂，出现多个单选同时被选中，或点击几次后死锁固定在一侧无法切回**！
- **正确规范**：所有互斥的 `mode: "Radio"` 按钮，必须集中放置在同一个配置了对应 `relatedController` 的父级 Panel 容器内。

### 6. 🚨 铁律六：缩放/旋转/弹跳补间动效必须显式指定几何中心轴心点（Pivot）
- **现象与根因**：FGUI 组件默认轴心点为左上角 `(0, 0)`。在此状态下直接执行缩放弹跳（Scale 1.0 -> 1.2）或旋转动效，元素会沿着左上角向右下方膨胀偏移，导致**视觉中心大幅跑偏、动效漂移错位**！
- **正确规范**：凡是作为动效主体、缩放弹出窗口、旋转图标的节点，必须显式声明 `pivotX: 0.5, pivotY: 0.5, asAnchor: true`，确保缩放与旋转严格以几何中心为基准，绝对布局 `(x, y)` 保持零位移。

### 7. 🚨 铁律七：HTML 宿主中绝对禁止通过 CSS 强行拉伸 #layaCanvas
- **现象与根因**：在 HTML/CSS 中如果写了 `#layaCanvas { width: 100%; height: 100%; }`，浏览器会将 1280×720 的 Canvas WebGL 渲染缓冲在 DOM 层暴力放大插值，导致**全屏文字发虚发糊、边缘严重毛刺，且鼠标物理点击坐标产生几十到上百像素的严重错位**！
- **正确规范**：HTML 宿主必须保持纯净 `<style>body{margin:0;background:#000;overflow:hidden}</style>`，严禁对 Canvas 附加任何宽高拉伸样式，将渲染分辨率与鼠标逆投影矩阵 100% 交由引擎原生管理。

### 8. 🚨 铁律八：高密度微图元（>50个）必须封装为独立原子微容器
- **现象与根因**：大量密集型微小图元（如点阵网格、散落金币粒子、掉落物碎片）若全部平铺在根面板，会导致根面板的 DisplayList 和坐标脏标记计算极度繁重，引发丢帧卡顿。
- **正确规范**：必须将其封装为独立的“原子级微容器（Sub-Panel）”，让微图元在独立面板内部完成局部排布，根面板仅持有一个轻量级的子容器句柄。
