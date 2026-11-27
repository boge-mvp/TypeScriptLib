# UIFactory 纯代码 UI 引擎内部架构与开发维护规范 (开发库内核篇)

> **适用对象**：专职维护、扩展与优化 `TSCore/src/com/uifactory/` 布局引擎与组件工厂的**框架内核架构师与智能体**。
> **核心使命**：确保纯代码组件工厂无论在何种复杂布局和动态业务下，其底层的实例化、两遍测量排版、齿轮状态机装配与生命周期流转，**100% 严格对齐 FairyGUI (FGUI) 官方底层二进制反序列化规范**。

---

## 一、 官方二进制构建生命周期管线（The Canonical 6-Phase Pipeline）

在官方 FairyGUI（`template/fairygui.js`）二进制加载（`ByteBuffer`）体系中，组件构建是不可逆的离散阶段推进。UIFactory 的核心管线必须 100% 复刻以下时序，严禁合并或越级执行：

```text
========================================================================================
[Phase 1: 纯实例化] ─── UIFactoryPipeline.instantiateNode(elData)
                     仅调用 new 具体空类（复合组件先完成内部 fillPanel，再进入外部 setup_beforeAdd）
        │
[Phase 2: 前置初始化] ─── UIFactoryPipeline.setup_beforeAdd(node, elData)
                     打上 node["_underConstruct"] = true 保护锁！
                     按组件类集中分流注入固有尺寸、物理变换、基础样式及 GLoader.url（对齐各子类 setup_beforeAdd）
        │
[Phase 3: 测量与排版] ─── child.parent = panelNode -> _children.push(child) -> setupElementPosition
                     确立 child.parent 引用树，执行两遍测量排版，计算目标像素坐标
        │
[Phase 3.5: 独立关系] ─── setupRelations (遍历子元件建立 RelationType 跟随)
                     对齐官方 constructFromResource2：所有子元件定型后统一建立关联，确保目标基准坐标准确
        │
[Phase 4: 后置初始化] ─── UIFactoryPipeline.setup_afterAdd(node, elData, parentNode, index)
                     此时节点坐标已定型，安全灌入真实内容 (.text / button.title / 仅直接父级控制器绑定)
                     装配全系 10 大 Gears 状态至 gear["_storage"]（不提前 gear.apply()）
                     最后安全解除构建保护锁：node["_underConstruct"] = false;
        │
[Phase 5: 扩展类装配] ─── UIFactoryExtensions.setupComponentExtension(panelNode, elData)
                     对齐 constructExtension：映射 _titleObject, _iconObject, _barObject, _gripObject
        │
[Phase 6: 终态提交]   ─── finalizePanel(panelNode)
                     解除 panelNode["_buildingDisplayList"] = false;
                     执行 panelNode.applyAllControllers() 激活齿轮初始状态；
                     调用 panelNode["buildNativeDisplayList"]() 提交底层 WebGL 渲染树。
========================================================================================
```

---

## 二、 核心架构模块职责与目录边界

引擎代码严格遵守**“单文件严禁超过 1000 行、高内聚低耦合”**原则，严禁在主文件无序堆砌逻辑：

| 子模块文件名 | 职责边界与规范 |
|---|---|
| **`UIFactory.ts`** | 主门面入口与协调器：负责 `createElement` 路由、19 种 `create*` 快捷方法暴露及委派协调 |
| **`UIFactoryPanelBuilder.ts`** | 复合容器填充构建器：负责 `fillPanel` 6 阶段生命周期、测量排版、关系装配与扩展收尾 |
| **`UIFactoryLoader.ts`** | 布局配置校验与合包加载器：负责 `validateLayoutConfig`、`loadBundle` (AES-GCM/Deflate) 与级联依赖收集 |
| **`UIFactoryPipeline.ts`** | 官方原子生命周期执行器：专职负责 `instantiateNode`、`setup_beforeAdd` 与 `setup_afterAdd` 的类分流属性映射 |
| **`UIFactoryLayout.ts`** | 两遍测量排版引擎：负责 Flexbox 流式排布、`flexWrap` 弹性折行、主轴与交叉轴测量及像素定位计算 |
| **`UIFactoryGears.ts`** | 全系 10 大 Gears 状态机装配器：专职负责 GearDisplay、GearXY、GearSize 等齿轮数据写入 `_storage` |
| **`UIFactoryExtensions.ts`** | 扩展组件内部映射装配器：对齐 `constructExtension`，完成 GButton、GComboBox（含 `dropdown`）、GProgressBar、GSlider、GScrollBar（含同级 `target` 绑定）、GTree 声明式节点构建 |
| **`UIFactoryTransitions.ts`** | 动效过渡引擎：声明式 Transition 构建、补间动作映射与 `PlayTransitionAction` 切页自动执行 |
| **`EPanel.ts` / `PureList.ts`** | 容器载体扩展：提供背景绘制、滚动视口装配（`ScrollPane`）、`PureCodeItemPool`（支持命中 `UIFactory` 模板分桶实例化）、`PureList` 与 `PureTree` |

---

## 三、 底层内核开发红线（绝对禁止）

### 1. 严禁祖先爬树与跨层级外挂事件监听
- **官方铁律**：FGUI 源码中，齿轮的控制器获取永远是 `this._controller = this._owner.parent.getControllerAt(...)`。
- **红线**：严禁在 `UIFactoryGears` 中编写 `while(curr.parent)` 向上递归查找祖先控制器的逻辑；严禁使用 `ctrl.on(STATE_CHANGED)` 为子孙节点外挂事件监听！父级切换时必须依靠官方原生的 `parent.applyController(c) -> child.handleControllerChanged(c)` 树状调用。

### 2. 内部私有属性访问规范
- **红线**：禁止在引擎内部将没有公共 setter 的属性强行写成公有赋值（如 `node.mode = x`）；必须直接对原强类型对象统一使用中括号字符串 `node["_mode"] = x`、`gear["_storage"]`、`panelNode["_buildingDisplayList"]` 访问，严禁写多余画蛇添足的 `as any` 强制转换，确保与底层运行时完全贴合且保持强类型代码整洁。
- **纯 JSON 模板 `defaultItem` 绕过 `normalizeURL` 规范**：`fgui.GList` / `fgui.GTree` 的公共 `defaultItem` setter 内部会调用 `fgui.UIPackage.normalizeURL(val)`，当传入非 `ui://` 开头的纯 JSON 路径（如 `"res/layout/listItem.json"`）时会将其洗成 `null`。因此引擎内部仅在路径以 `ui://` 开头时走公共 setter `node.defaultItem = val`，纯 JSON 路径必须直接写入内部字段 `node["_defaultItem"] = val`，交由 `PureCodeItemPool.getObject(url)` 命中并实例化。

### 3. 构建保护锁 `_underConstruct` 绝不可丢失
- **红线**：在子元件排版和齿轮装配未完结前，必须保持 `node["_underConstruct"] = true`。如果丢失此保护，排版期间调用的 `setXY` / `setSize` 会被 FGUI 的 `updateGear` 拦截并误将排版坐标覆盖掉预设的各页面齿轮状态，引发动画永久失效！

### 4. 严禁私自改动官方库源码
- **红线**：所有针对 FGUI 遗漏特性（如 GearColor 平滑过渡、GGraph 描边色控制）的增强，必须在 `TSCore/src/com/uifactory/` 的包装层实现，严禁修改 `template/fairygui.js` 或 `template/laya.core.js`！

### 5. Controllers 与 Transitions 根节点声明规则与校验机制
- **架构规则**：一个 UI 页面配置文件中，`controllers` 与 `transitions` 仅允许在 Root 根节点声明；根节点支持任意业务命名（不限死叫 root）。
- **组件角色规范**：纯背景底板必须使用原生的 `type: "graph"` (GGraph)，严禁滥用空 panel 画背景；同一页面内划分功能区域必须使用原生的 `type: "group"` (GGroup)；带子节点的 panel 必须拆分为外部引用（`src`）。
- **校验防御壳**：引擎在 `UIFactory.validateLayoutConfig` 与构建工具 `bundleLayouts` 中内置了自动验证逻辑：
  1. 若在非 Root 子节点（且未标记 `src` 外部组件）中检测到 `controllers` 或 `transitions`，统一输出标准英文警告或阻断异常；
  2. 若检测到非根 Panel 包含内联 `elements`（未标记 `src`），触发标准规范警告（Rule 2），提示开发者使用 `type: "group"` (GGroup) 拍平或抽离为 `src` 独立文件；
  3. 校验齿轮是否合法绑定到所属控制器的有效页面。

### 6. 统一资产加载与进程安全红线
- **单一加载驱动**：`UIFactory.requestData` 与 `UIFactory.loadBundle` 必须 100% 独家委托 TSCore 内置的 `ELoader.loader.load` 发起资源请求，严禁私自绕过 ELoader 调用底层 `Laya.HttpRequest` 或浏览器 `fetch`；
- **全链路异常防御与进度感知**：加载资源支持 `onProgress` 进度透传，并在网络 404、空数据、二进制头部不足 28 字节、AES-GCM 解密失败、Deflate 解压失败以及 JSON 解析失败全链路施加严密 try-catch 拦截与详细日志输出，杜绝静默失败与白屏死锁；
- **散装外部依赖自动级联加载 (Auto-Cascade Loading)**：在单文件布局加载完成后，引擎自动通过 `UIFactory.extractMissingDependencies` 静态推演子树依赖，对尚未在内存（`UIFactory.getConfig` 未命中）的外部 `src` 组件自动并发调度 `loadBundle` 补齐加载，彻底消除父布局已就绪而子组件漏配/未下载导致的白屏空白；
- **全英文工业级诊断规范**：引擎内核（`UIFactory.ts`、`UIFactoryGears.ts`、`UIFactoryTransitions.ts`）全部控制台警告（console.warn）与报错（console.error）必须统一采用 100% 规范英文输出，杜绝中文日志残留。

---

## 四、 闭环验证基线

每次对引擎进行任何代码变更或重构后，必须严格执行以下构建与回归测试：

1. **自动化端到端测试断言**：
   运行 `node scratch/test_full_demo_features.js`，确保全系 10 大齿轮、单选互斥、多选复选、滑动条与动效工作台自动化断言 100% 成功，浏览器控制台错误严格为 0。
