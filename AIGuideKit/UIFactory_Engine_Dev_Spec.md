# UIFactory 纯代码 UI 引擎内部架构与开发维护规范 (开发库内核篇)

> **适用对象**：专职维护、扩展与优化 `TSCore/src/com/uifactory/` 布局引擎与组件工厂的**框架内核架构师与智能体**。
> **核心使命**：确保纯代码组件工厂无论在何种复杂布局和动态业务下，其底层的实例化、两遍测量排版、齿轮状态机装配与生命周期流转，**100% 严格对齐 FairyGUI (FGUI) 官方底层二进制反序列化规范**。

---

## 一、 官方二进制构建生命周期管线（The Canonical 6-Phase Pipeline）

在官方 FairyGUI（`template/fairygui.js`）二进制加载（`ByteBuffer`）体系中，组件构建是不可逆的离散阶段推进。UIFactory 的核心管线必须 100% 复刻以下时序，严禁合并或越级执行：

```text
========================================================================================
[Phase 1: 纯实例化] ─── UIFactoryPipeline.instantiateNode(elData)
                     仅调用 new 具体空类，绝对不提前灌入 text / url / gears 数据
        │
[Phase 2: 前置初始化] ─── UIFactoryPipeline.setup_beforeAdd(node, elData)
                     打上 node["_underConstruct"] = true 保护锁！
                     按组件类集中分流注入固有尺寸、物理变换与基础样式（对齐各子类 setup_beforeAdd）
        │
[Phase 3: 测量与排版] ─── panelNode.addChild(childNode) -> setupElementPosition
                     确立 child.parent 引用树，执行两遍测量排版，计算目标像素坐标
        │
[Phase 3.5: 独立关系] ─── setupRelations (遍历子元件建立 RelationType 跟随)
                     对齐官方 constructFromResource2：所有子元件定型后统一建立关联，确保目标基准坐标准确
        │
[Phase 4: 后置初始化] ─── UIFactoryPipeline.setup_afterAdd(node, elData, parentNode, index)
                     此时节点坐标已定型，安全灌入真实内容 (.text / .url / button.title)
                     装配全系 10 大 Gears 状态至 gear["_storage"]
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
| **`UIFactory.ts`** | 主门面入口与协调器：负责 `createElement` 路由、对外 API 暴露（`createPanel`、`createButton` 等）以及协调 6 阶段流水线 |
| **`UIFactoryPipeline.ts`** | 官方原子生命周期执行器：专职负责 `instantiateNode`、`setup_beforeAdd` 与 `setup_afterAdd` 的类分流属性映射 |
| **`UIFactoryLayout.ts`** | 两遍测量排版引擎：负责 Flexbox 流式排布、`flexWrap` 弹性折行、主轴与交叉轴测量及像素定位计算 |
| **`UIFactoryGears.ts`** | 全系 10 大 Gears 状态机装配器：专职负责 GearDisplay、GearXY、GearSize 等齿轮数据写入 `_storage` |
| **`UIFactoryExtensions.ts`** | 扩展组件内部映射装配器：对齐 `constructExtension`，完成 GButton、GProgressBar、GSlider 等部件映射 |
| **`UIFactoryTransitions.ts`** | 动效过渡引擎：声明式 Transition 构建、补间动作映射与 `PlayTransitionAction` 切页自动执行 |
| **`EPanel.ts` / `PureList.ts`** | 容器载体扩展：提供背景绘制、滚动视口装配（`ScrollPane`）与对象池虚拟化列表实现 |

---

## 三、 底层内核开发红线（绝对禁止）

### 1. 严禁祖先爬树与跨层级外挂事件监听
- **官方铁律**：FGUI 源码中，齿轮的控制器获取永远是 `this._controller = this._owner.parent.getControllerAt(...)`。
- **红线**：严禁在 `UIFactoryGears` 中编写 `while(curr.parent)` 向上递归查找祖先控制器的逻辑；严禁使用 `ctrl.on(STATE_CHANGED)` 为子孙节点外挂事件监听！父级切换时必须依靠官方原生的 `parent.applyController(c) -> child.handleControllerChanged(c)` 树状调用。

### 2. 内部私有属性访问规范
- **红线**：禁止在引擎内部将没有公共 setter 的属性强行写成公有赋值（如 `node.mode = x`）；必须直接对原强类型对象统一使用中括号字符串 `node["_mode"] = x`、`gear["_storage"]`、`panelNode["_buildingDisplayList"]` 访问，严禁写多余画蛇添足的 `as any` 强制转换，确保与底层运行时完全贴合且保持强类型代码整洁。

### 3. 构建保护锁 `_underConstruct` 绝不可丢失
- **红线**：在子元件排版和齿轮装配未完结前，必须保持 `node["_underConstruct"] = true`。如果丢失此保护，排版期间调用的 `setXY` / `setSize` 会被 FGUI 的 `updateGear` 拦截并误将排版坐标覆盖掉预设的各页面齿轮状态，引发动画永久失效！

### 4. 严禁私自改动官方库源码
- **红线**：所有针对 FGUI 遗漏特性（如 GearColor 平滑过渡、GGraph 描边色控制）的增强，必须在 `TSCore/src/com/uifactory/` 的包装层实现，严禁修改 `template/fairygui.js` 或 `template/laya.core.js`！

---

## 四、 闭环验证基线

每次对引擎进行任何代码变更或重构后，必须严格执行以下构建与回归测试：

1. **核心库增量构建**：
   在根目录执行 `npm run build:tscore`，确保输出 104 个 js / 104 个 dts，且严格 0 报错；
2. **自动化端到端测试断言**：
   运行 `node scratch/test_full_demo_features.js`，确保全系 10 大齿轮、单选互斥、多选复选、滑动条与动效工作台自动化断言 100% 成功，浏览器控制台错误严格为 0。
