# LayaAir 2.x + UIFactory (FairyGUI 纯代码) + Spine 3.8 界面与动画特效开发指南 (AI 专用)

本指南专为 AI 研发环境定制，旨在指导 AI 代码生成引擎或开发智能体，如何正确利用底层 5 个核心运行库及底座框架，在 LayaAir 引擎中以**纯代码、配置驱动（JSON Schema）**的方式优雅、零差错地构建高品质的游戏 UI 界面、Spine 3.8 骨骼动画和特效。

---

## 一、 核心运行库加载顺序与拓扑依赖

由于库之间存在强耦合和全局变量依赖，项目运行在 H5 或小游戏端时，**必须严格按照以下拓扑顺序完成 JS 文件的引入加载**：

1. **`laya.core.min.js`** (LayaAir 2.x 核心引擎，提供基础生命周期、渲染和事件系统)
2. **`laya.ani.min.js`** (Laya 动画基础库，laya.spine 依赖部分骨骼及底层动画状态接口)
3. **`spine-core-3.8.min.js`** (Spine 3.8 官方底层解析库，负责 IK 约束、姿态计算与网格变形数学)
4. **`laya.spine.min.js`** (Laya 官方 Spine 适配器，将 spine-core 底层数学转换成 Laya 渲染指令)
5. **`fairygui.min.js`** (FairyGUI 2D UI 引擎运行时，提供 GObject 树形列表和适配关联支持)
6. **`tsCore.min.js`** (底层核心框架底座，**自动托管注册并挂载 `fgui.GRoot.inst` 到 Laya 舞台**，并对外暴露配置工厂 **`UIFactory`**)

---

## 二、 纯代码界面构建：技术选型决策铁律

在编写界面和交互逻辑时，必须严格遵守以下三级优先级决策链，**严禁直接创建 Laya 原生 UI 对象挂载到外部**：

```
                            需要创建 UI 元素 / 组件
                                       │
          ┌───────────────────────────┴───────────────────────────┐
  ① 优先命中：属于 text/icon/graph/panel/list/button？     ② 兜底：属于进度条/滑条/输入框/动效/控制器？
          │                                                       │
          ▼                                                       ▼
   【使用 UIFactory 工厂配置化创建】                          【直接 new fgui.XXX() 实例化并挂载】
   UIFactory.createElement / createPanel                     new fgui.GProgressBar() / Controller
   （自动执行流式布局、两遍测量与对齐）                            （保持在 FGUI 命名空间，与工厂产物混排）
          │                                                       │
          └───────────────────────────┬───────────────────────────┘
                                       │
                                       ▼
                         ❌【 绝对红线禁令（严禁触碰） 】❌
                      禁止：new Laya.Sprite() / Text() / Image()
                      禁止：直接将 Laya 原生显示对象 addChild 到 Stage
```

### 为什么必须封杀 Laya 原生 UI 对象：
- **适配分裂**: Laya 原生对象的缩放与自适应跟 FGUI 独立的 `GRoot` 比例适配不一致，容易在宽屏/刘海屏上出现界面漂移、坐标脱节。
- **点击穿透**: 混用会导致 FGUI 滚动容器（ScrollPane）的滑动裁剪对 Laya 原生对象失效，且两者的命中测试（HitTest）和事件冒泡链路完全冲突。

---

## 三、 声明式 UI 工厂 (UIFactory) 快速上手

`UIFactory` 通过结构化配置对象树（JSON）描述 UI，进行运行期装配，并支持强大的 **两遍布局引擎（Measure & Layout）**。

### 1. 自动初始化
- 在该框架环境下，**`fgui.GRoot.inst` 的实例化和舞台挂载已由底座框架自动托管**（在生命周期 `onEngine` 中执行）。
- **业务层绝对禁止**调用 `attachTo` 或手动将 GRoot `addChild` 到 Laya 舞台，直接使用 `fgui.GRoot.inst.addChild(view)` 即可！

### 2. 核心布局设计思想（Agents 必须时刻牢记）
- **多端防变形自适应原则**：如今设备屏幕（平板、折叠屏、各种全面屏）尺寸各不统一。在纯代码 UI 构建中，**不首选写死物理像素尺寸大小，也绝不首选绝对定位坐标**，其根本目的在于防止界面在缩放时被拉伸、挤压、变形或错位。
- **相对定位与百分比首选**：无条件优先配置 `layout` 的 `leftPercent` / `topPercent` 等百分比定位，使元素按屏幕占比伸缩。
- **百分比宽高与权重分配**：推荐使用基于父容器或界面比例的百分比大小（如 `width: 0.8`）。多列或多行的布局子项宽高推荐根据其所在的行、列所占据的**权重百分比（如 `0.3` / `0.5`）**，配合流式布局（`layoutType`）和 `justifyContent` 弹性分配，杜绝变形。
- **x / y 的辅助地位**：绝对属性 `x / y` 是底层的合法物理坐标，但不推荐作为自适应定位的首选。常用于绝对粒子挂载、气泡弹出微调或动画运行期的精细偏移校正等辅助场景。

### 3. 配置化面板构建范例
```javascript
// 全局设置资源相对路径前缀（会自动为 icon url 和 graphics loadImage 补全前缀）
UIFactory.resBasePath = "res/gameui/";

// 使用 UIFactory 创建一个垂直流、交叉轴居中、多端响应式防变形自适应的面板
const settingsPanel = UIFactory.createPanel({
    type: "panel",
    name: "mainPanel",
    width: 0.8,  // 占屏幕宽度的 80%（多端自适应，防拉伸变形）
    height: 0.6, // 占屏幕高度切割的 60%
    background: {
        type: "graph",
        width: 1, height: 1, // 100% 占满父容器，不写死固定值
        fillColor: "#1a1a2e",
        lineColor: "#4e4e7a",
        lineSize: 2,
        cornerRadius: 16,
    },
    layoutType: "vertical",
    justifyContent: "center", // 主轴自适应居中
    alignItems: "center",     // 交叉轴居中
    gap: 20,                  // 元素流式间距
    padding: { top: 30, bottom: 30, left: 40, right: 40 }, // 安全内边距
    elements: [
        {
            type: "text",
            name: "titleLabel",
            text: "[color=#ffd700]设置中心[/color]", // UBB 富文本
            isUbb: true,
            fontSize: 32,
            bold: true,
        },
        {
            type: "text",
            text: "请修改您的游戏配置参数",
            fontSize: 20,
            color: "#cccccc",
        },
        {
            type: "button",
            name: "closeBtn",
            width: 0.3, // 占父面板宽度的 30%（百分比自适应，杜绝拉伸）
            height: 50,  // 高度可结合单行文本高度设固定安全值
            elements: [
                {
                    type: "text",
                    text: "确定并保存",
                    fontSize: 22,
                    layout: { alignX: "center", alignY: "middle" }, // 弹性对齐
                }
            ]
        }
    ]
}, 0, 0);

// 直接加到自动托管的 GRoot 根节点上
fgui.GRoot.inst.addChild(settingsPanel);
```

---

## 四、 Spine 3.8 骨骼动画挂载的“黄金桥接法则”

由于 Spine 动画节点（`Laya.SpineSkeleton`）属于原生 Laya 对象，为了遵循 FGUI 管辖链路和适配规则，必须使用 **`GGraph` 矢量占位符作为媒介** 进行完美的宿主挂载。

### 1. 第一步：在 UIFactory 配置中声明占位符
在创建界面的 JSON 配置树中，在特定位置摆放一个宽高的类型为 `"graph"` 的百分比尺寸占位符：
```javascript
const mainView = UIFactory.createPanel({
    type: "panel",
    width: 0.85,  // 自适应 85% 屏幕宽
    height: 0.75, // 自适应 75% 屏幕高
    background: { type: "graph", fillColor: "#0b0b16", cornerRadius: 12 },
    elements: [
        // 声明一个百分比宽高的 Graph 占位符，自适应外部组件尺寸
        {
            type: "graph",
            name: "role_spine_holder",
            width: 0.25, // 占面板宽度的 25%
            height: 0.35, // 占面板高度的 35%
            // 采用相对对齐定位，居中并向上弹性微调
            layout: { alignX: "center", alignY: "bottom", offsetY: -50 }
        }
    ]
}, 0, 0);
fgui.GRoot.inst.addChild(mainView);
```

### 2. 第二步：代码中获取占位符并桥接 Native 对象
```javascript
// 1. 通过运行期命名标识寻址获取 GGraph 占位符
const holder = mainView.getChild("role_spine_holder").asGraph;

// 2. 实例化原生的 Spine 3.8 骨骼节点并加载资源
const heroSpine = new Laya.SpineSkeleton();
heroSpine.load("res/spine/hero.json");

// 3. 【黄金桥接】：将原生 Laya 显示对象安全桥接进 FairyGUI 的渲染流中
holder.setNativeObject(heroSpine);

// 4. 【坐标系轴心纠偏】
// FGUI 占位符的 Pivot 默认在左上角 (0,0)，而 Spine 动画的轴心默认在骨骼根部（常在脚底中心）
// 为使 Spine 精准立在 holder 的正下方中心，需微调其相对偏移坐标（此处使用 x/y 做辅助原点对齐微调）：
heroSpine.x = holder.width / 2; // 水平居中
heroSpine.y = holder.height;    // 脚底与 holder 底部重合
```

---

## 五、 Spine 3.8 底层动画精准控制、换装与特效

一旦桥接成功，即可全面发挥 Spine 3.8 的动画过渡、多皮肤和挂点渲染能力。

### 1. 播放与平滑过渡（过渡动效）
为了消除两段动作切换时的突兀断层，必须提前配置混合融合时间：
```javascript
// 播放待机动作：动作名称, 是否循环
heroSpine.play("idle", true);

// 【平滑融合】：当从 run 切换到 attack 时，自动产生 0.25 秒的数学过渡插值，杜绝瞬闪动作
heroSpine.setMix("run", "attack", 0.25);
heroSpine.setMix("attack", "idle", 0.2);

// 切换动效
heroSpine.play("run", true);
// ... 延迟触发攻击 ...
heroSpine.play("attack", false);
```

### 2. 多皮肤切换（换装）
```javascript
// 动态切换指定名称的皮肤纹理（名称必须与 Spine 编辑器导出命名绝对一致）
heroSpine.setSkinByName("heavy_armor");
```

### 3. 精确事件监听（判定帧与动效对齐）
```javascript
// 1. 监听单次动作播放完成
heroSpine.on(Laya.Event.COMPLETE, this, () => {
    console.log("Spine 动作播放完毕");
});

// 2. 监听 Spine 动画内部配属的自定义判定标签（如受击时刻、法术释放点等）
heroSpine.on(Laya.Event.LABEL, this, (eventData) => {
    // eventData.name 对应 Spine 内配置的事件 Key
    if (eventData.name === "fire_hit") {
        console.log("触发受击点判定，执行飘血 UI 并触发震屏特效");
        triggerDamageEffect();
    }
});
```

### 4. 骨骼挂点（Bone Attachment）
将其他 Laya 原生对象（如 Laya 2D 粒子系统、光效 Sprite）强制绑定到 Spine 骨骼的某个插槽（Slot），实现随角色运动的复合动画：
```javascript
// 创建原生的 Laya 2D 粒子特效
const particleSetting = Laya.loader.getRes("res/particles/glow_sword.part");
const swordGlow = new Laya.Particle2D(particleSetting);
swordGlow.play();

// 【挂点绑定】：将粒子挂载到武器骨骼对应的插槽（Slot）上，完美同步位移、缩放与旋转
heroSpine.addChildToSlot("weapon_slot", swordGlow);
```

---

## 六、 容器内的粒子特效融合规范

除了骨骼挂载，如果需要直接在 UI 面板中呈现一个 Laya 原生 2D 粒子，方法与 Spine 挂载完全一致：
```javascript
// 在配置好的 UI 容器中，寻址获取用于渲染粒子的 GGraph 占位节点
const effectHolder = mainView.getChild("particle_holder").asGraph;

// 创建并初始化粒子系统
const partSetting = Laya.loader.getRes("res/particles/magic_circle.part");
const magicCircle = new Laya.Particle2D(partSetting);
magicCircle.emitter.start();
magicCircle.play();

// 将粒子安全设为 GGraph 宿主节点
effectHolder.setNativeObject(magicCircle);

// 粒子锚定在占位区域的中心点（利用 x/y 进行粒子中心原点对齐微调）
magicCircle.x = effectHolder.width / 2;
magicCircle.y = effectHolder.height / 2;
```

---

## 七、 矢量绘图特效：`graphics` 指令

对于装饰性的线条、渐变色矩形等简单特效，**严禁使用 Laya 原生绘制**，应使用 `UIFactory` 提供的 `graphics` 配置数组。
这是底座在运行时安全托管、自动适配的底层 `Laya.Graphics` 出口：

```javascript
const decoratedBox = UIFactory.createElement({
    type: "graph",
    width: 0.5,  // 占父级 50% 宽，拉伸自适应
    height: 100, // 高度保持固定微调
    graphics: [
        // 指令一：清除画布
        { cmd: "clear", args: [] },
        // 指令二：画一条渐变装饰线：[x1, y1, x2, y2, color, lineWidth]
        { cmd: "drawLine", args: [10, 50, 390, 50, "#00ffcc", 3] },
        // 指令三：画两个发光的几何圆点
        { cmd: "drawCircle", args: [10, 50, 6, "#00ffcc"] },
        { cmd: "drawCircle", args: [390, 50, 6, "#00ffcc"] }
    ]
}, 0, 0);
```

---

## 八、 内存与生命周期管理：杜绝设备闪退

在纯代码环境中，未解绑的原生对象和缓存是造成显存溢出、H5/微端设备卡顿闪退的主因。**业务层卸载 UI 模块时，必须实施以下三步清理法**：

```javascript
function safelyDestroyUI(panelInstance, spineInstance, particleInstance) {
    // 1. 第一步：注销并彻底销毁原生的 Spine 节点
    if (spineInstance) {
        spineInstance.stop();
        spineInstance.offAll(); // 彻底拔掉所有 Laya.Event 监听，解除闭包引用
        spineInstance.destroy(true); // 传入 true，级联物理销毁其所有原生子节点
    }
    
    // 2. 第二步：销毁原生粒子系统并清理发射器
    if (particleInstance) {
        particleInstance.stop();
        particleInstance.destroy(true);
    }
    
    // 3. 第三步：卸载并销毁 FGUI 配置化面板
    if (panelInstance) {
        // 解除占位符对 Native 对象的强引用绑定
        const holder = panelInstance.getChild("role_spine_holder");
        if (holder) {
            holder.asGraph.setNativeObject(null);
        }
        
        // 销毁 GComponent 节点，自动释放其 elements 占用的全部 FGUI 资源
        panelInstance.dispose(); 
    }
}
```

---

## 九、 AI 代码生成核心避坑检查清单

| 检查项 | 错误写法范例 (❌) | 正确规范写法 (✅) |
| :--- | :--- | :--- |
| **GObject初始化** | `fgui.GRoot.inst.attachTo(...)` <br>（导致多头挂载/不兼容报错） | **无需且禁止调用**。<br>底座托管自挂载，直接使用 `addChild()` 即可。 |
| **界面自适应** | 配置绝对像素 `width: 800, height: 600`，使屏幕在平板/宽屏下因比例变动被拉伸变形 | 优先配置 **`width: 0.8, height: 0.6` 等基于屏幕占比的百分比宽高**。 |
| **行列权重分配** | 在流式网格或列表里，给每个卡牌子项写死固定像素宽度 | 结合 `FlowHorizontal` 将子项宽度设为 **`0.3` 等百分比权重比例** 实现响应式换行分布。 |
| **绝对定位属性** | 任何时候都直接使用绝对坐标 `x / y` 定位 UI 元素 | **x / y 不推荐首选**。首选 `layout` 的 `leftPercent` 百分比定位，**x / y 仅克制作为动画原点或粒子挂点等微调辅助**。 |
| **界面实例** | `new fgui.GComponent()` 后手动创建文本和图片进行拼装 | 直接采用 **`UIFactory.createPanel` 声明式 JSON 配置**，流式排列。 |
| **红线禁令** | `const sprite = new Laya.Sprite()` 并 `GRoot.inst.addChild(sprite)` | **绝对红线**！绝不允许原生对象挂 GRoot，必须通过 `GGraph.setNativeObject` 媒介桥接。 |
| **位置漂移** | 认为 `spineAnim.y = 0` 会和占位符顶端对齐 | 纠正轴心位移：`spineAnim.x = holder.width / 2; spineAnim.y = holder.height;` |
| **特效装饰** | 直接在 `component.displayObject.graphics` 上进行 Laya 绘制 | 在元素的配置中提供 **`graphics` 指令数组配置**，交由工厂执行。 |
| **内存防漏** | 仅调用 `view.dispose()`，不管底层挂接的 Spine 和粒子 | 必须先解除引用绑定，显式调用 `spine.destroy(true)`、`particle.destroy(true)`。 |
| **动作平滑** | 频繁调用 `spine.play()` 动作生硬切换 | 提前对特定动作对配置 **`spine.setMix(from, to, duration)`** 动作平滑过渡。 |
