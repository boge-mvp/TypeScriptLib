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

## 3. 声明式布局与文件命名约定

- **按功能语义命名**：布局文件与控制器类按功能职责命名（如 `primitivesPanel.json` / `PrimitivesView.ts`、`formPanel.json` / `FormView.ts`、`flexboxWorkbench.json`、`relationsWorkbench.json`、`showcaseExtensionPanel.json` / `ShowcaseExtensionView.ts`），禁止使用 `tab1` / `tab2` 等序号前缀。
- **Root-Only 与 GGroup 拍平**：`controllers` 与 `transitions` 仅在根面板声明；功能分区使用 `type: "group"` 拍平；`gearColor.pages` 使用内置 `button` 控制器页面名（`"up" | "down" | "over" | "selectedOver"`）及协议字段 `"strokeColor"`。
- **规范同步**：新增或调整 `TSCore/src/com/uifactory/I*Config.ts` 配置协议时，必须同步更新 `AIGuideKit/UIFactory_AI_UI_Creation_Guide.md`。

## 4. 构建与实机验证基线

1. 若修改了 `TSCore/src/com/uifactory/`，必须先在仓库根目录执行 `npm run build:tscore`（确认 `117 js / 117 dts` 零报错）。
2. 执行 `node demo/uifactory/build.js` 打包 `ui_bundle.bin` 并编译 `bin/uifactoryTestApp.js`（确认 0 报错）。
3. 通过 IntelliJ IDEA 内置 Web 服务访问 `http://localhost:63342/TypeScriptLib/demo/uifactory/bin/index.html` 进行实机交互与截图验证（严禁私起外部 HTTP 服务）。
