# AGENTS.md

## 仓库定位

LayaAir 游戏开发框架（npm 包 `@boge-mvp/game-lib`，发布于 GitHub Packages），pnpm workspace 三包：根（构建工具链 + 发布）、`TSCore/`（核心框架源码）、`GameLib/`（业务库源码）。

自举架构：根 `lib/` 的 `buildLibrary` 工具链（Rollup 管线）构建 TSCore/GameLib 自身；`index.js` 导出 22 个 API（buildLibrary / rollupPack / compile / webp / rollup 插件等）供下游游戏项目使用。

## 常用命令（根目录执行）

- `npm run build:tscore` — 日常源码改动的快速验证闭环（产物 `TSCore/bin/tsCore.js/.min.js/.d.ts`）
- `npm run build:gamelib` — 依赖 `TSCore/bin/*.d.ts`，**必须先跑 build:tscore（顺序敏感）**
- `npm run build` — 完整发布链 clean → tscore → gamelib → packResources（刷新根 `bin/ dist/ webp/ assets/`，即 npm 包内容物）
- `npm run pack` — build + npm pack；`npm run build:demo` — demo 示例工程
- 改 TSCore 源码后根目录 `bin/tsCore.d.ts` 不会立即刷新，需完整 `npm run build`（packResources 阶段）

## 验证基线

- 无独立测试套件；**构建成功即唯一闭环标准**（`build:tscore` 输出 95 js / 95 dts 零报错为基线）
- 构建日志的循环依赖警告（eloader↔log↔configkit、uifactory 配置组、app↔eventcontroller）为既有噪音，非错误，无需修复

## 发布（CI）

- 仅 `v*` tag 触发 `.github/workflows/publish.yml`；**push master 不触发任何 CI**
- tag 去 `v` 前缀作为版本号；版本含 `-` 发 `beta` tag，否则 `latest`
- `package.json` 的 `version` 字段是过时的（CI 用 tag 覆盖），不要手动同步它
- CI 环境：pnpm 10 + Node 24 + `pnpm install --frozen-lockfile` —— **改动根 package.json 依赖后必须本地 `pnpm install` 重新生成 `pnpm-lock.yaml` 并一并提交，否则 CI 必挂 `ERR_PNPM_OUTDATED_LOCKFILE`**
- 最新 tag：`git tag --sort=-v:refname`

## 源码约定

- TSCore `strict: true`（`Nullable<T>` 全量标注）、`composite`、include `../libs` + `src`
- 产物命名空间 `tsCore` / `gameLib`；dts 全局注入 `define.d.ts` / `entity.d.ts`
- 源码改动默认保持未提交，由维护者决定提交时机；提交只纳入任务相关文件（`index.js`、`README.md` 等本地改动不得混入任务提交）

## 关键目录

- `lib/` — 构建工具链实现（被 TSCore/GameLib 的 build.js require）
- `template/` — LayaAir/FGUI/Spine 引擎运行时模板库（随包分发）
- `webp/` — libwebp v1.3.0 多平台二进制

## 专职 Agent 路由与分工

- **`uifactory-expert` (UIFactory 专职维护智能体，定义于 `.opencode/agents/uifactory-expert.md`)**
  - **管辖范围**：
    1. 底层代码：`TSCore/src/com/uifactory/` 全目录代码（包含 `UIFactory.ts`、`PureList.ts`、`EPanel.ts` 及全部 12 个 `I*Config.ts` 协议文件）；
    2. 指南规范：`AIGuideKit/` 目录（核心主档为 `AIGuideKit/纯代码创建UI规则.md`）。
  - **强制路由铁律**：凡涉及该引擎目录下的任何代码排查、缺陷修复、排版算法优化、新组件扩展、配置协议演进，以及《UIFactory 纯代码构建指南》的维护修订与避坑约束沉淀，**必须由 `uifactory-expert` 智能体专门处理**，严禁其他通用智能体直接无序修改。
  - **双向同步与闭环验证要求**：
    1. 规范双向同步：代码变更或实战避坑约束沉淀必须同步更新到 `AIGuideKit/纯代码创建UI规则.md`；
    2. 代码验证基线：代码改动后必须在根目录执行 `npm run build:tscore` 确保输出 95 js / 95 dts 且 0 报错。
