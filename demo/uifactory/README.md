# UIFactory 全功能交互检视测试台 (`demo/uifactory`) 开发与测试规范

为确保 `UIFactory` 纯代码引擎与 Demo 测试台长期保持与 FairyGUI 官方机制 100% 对齐，所有在本目录及 `TSCore/src/com/uifactory/` 下进行的开发与测试必须严格遵守以下规范：

---

## 1. 官方二进制机制 1:1 还原铁律

- **严禁编造非官方挂载逻辑或猴子补丁**：`TSCore/src/com/uifactory/` 中所有组件初始化（如 `GButton`、`GProgressBar`、`GSlider`、`GComboBox`、`GScrollBar`、`ScrollPane`、`Gear*`、`Relations`）必须严格对照 `template/fairygui.js` 的二进制 `setup` / `setup_afterAdd` / `constructExtension` 流程实现。
- **配置字段与内部状态一致**：JSON 布局中声明的官方属性（如 `vtScrollBar`、`hzScrollBar`、`scrollBarDisplay`、`scrollBarFloating`、`reverse`）直接映射至官方 FGUI 对应原生字段与流程，由 `ScrollPane` / `GProgressBar` / `GSlider` 原生自动接管计算。

## 2. 无动态 API 时「改 JSON 重构组件」测试原则

- 当官方 FGUI 组件在运行期**未提供动态 setter/getter**（例如 `GProgressBar._reverse`、`GSlider._reverse` 等仅在构造期读取的属性），而测试台需要提供动态切换测试时：
  - **严禁**在 `TSCore` 中额外强行打补丁或暴露非官方运行时字段；
  - **必须**在 Demo 视图控制器（如 `FormView.ts`）中读取原始构造 JSON，克隆并修改目标属性（如 `reverse`、手柄初始对齐位置等），销毁旧实例后通过 `UIFactory.createSlider` / `UIFactory.createProgressBar` / `UIFactory.createFromConfig` **重新走一遍完整的创建流程**并挂载到原父容器与原位置，真实模拟官方构造行为。

## 3. JSON 优先配置、保持 TS 代码极简干净原则

- **能在 JSON 配置中实现的功能，一律在 JSON 中实现**：
  - 凡是 FGUI / UIFactory 声明式 JSON 原生支持的能力（例如 `list.selectionController`、按钮 `relatedController` / `pageId`、`mode: "Check"` + `title` / `selectedTitle`、10 大 `gear*` 状态联动、`relations` 相对约束、`transitions` 动效），**必须直接在 JSON 中配置完成**，严禁在 `.ts` 视图控制器中手写重复的控制器绑定循环、状态同步函数或按钮文案切换代码，保持 TS 代码量极简干净（仅保留纯交互逻辑、动态业务数据填充及第 2 节无动态 API 时的 JSON 重构）。
  - *显式豁免*：刻意测试 `UIFactory.registerConfig` / `UIFactory.registerCreator` 动态扩展 API 的用例（如 `ShowcaseExtensionView.ts`）除外。

## 4. 声明式布局、基准分辨率与文件命名约定

- **基准分辨率 `1280×720` 与禁止滥用 `scale` 缩放适配**：
  - 测试台舞台固定为 `1280×720`（右侧内容区统一为 `1052×648`），所有模块面板均以 `1:1` 原生尺寸构建与挂载。
  - **除非在专门测试缩放功能（如 `GearSize` / `Transition` 缩放动效靶子）的用例中**，否则严禁对任何面板或容器使用 `scaleX` / `scaleY` 进行缩放适配。
- **按功能语义命名**：布局文件与控制器类按功能职责命名（如 `textGraphPanel.json` / `TextGraphView.ts`、`loaderImagePanel.json` / `LoaderImageView.ts`、`formPanel.json` / `FormView.ts`、`flexboxWorkbench.json`、`relationsWorkbench.json`、`showcaseExtensionPanel.json` / `ShowcaseExtensionView.ts`），禁止使用 `tab1` / `tab2` 等序号前缀。
- **Root-Only 与 GGroup 拍平**：`controllers` 与 `transitions` 仅在根面板声明；功能分区使用 `type: "group"` 拍平；`gearColor.pages` 使用内置 `button` 控制器页面名（`"up" | "down" | "over" | "selectedOver"`）及协议字段 `"strokeColor"`。
- **规范同步**：新增或调整 `TSCore/src/com/uifactory/I*Config.ts` 配置协议时，必须同步更新 `AIGuideKit/UIFactory_AI_UI_Creation_Guide.md`。

## 5. 构建与实机验证基线

1. 若修改了 `TSCore/src/com/uifactory/`，必须先在仓库根目录执行 `npm run build:tscore`（确认 `117 js / 117 dts` 零报错）。
2. 执行 `node demo/uifactory/build.js` 打包 `ui_bundle.bin` 并编译 `bin/uifactoryTestApp.js`（确认 0 报错）。
3. 通过 IntelliJ IDEA 内置 Web 服务访问 `http://localhost:63342/TypeScriptLib/demo/uifactory/bin/index.html` 进行实机交互与截图验证（严禁私起外部 HTTP 服务）。
