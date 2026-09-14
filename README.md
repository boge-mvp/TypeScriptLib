# TypeScriptLib - LayaBox游戏开发框架

## 项目概述

TypeScriptLib 是一个基于 LayaAir 引擎的专业游戏开发框架，包含两个核心子项目：TSCore（核心框架）和 GameLib（游戏业务库）。该框架提供了完整的游戏开发解决方案，涵盖从基础工具库到高级游戏业务逻辑的全方位支持。

## 核心特性

### 🎮 完整的游戏开发生态
- **TSCore**: 提供底层核心框架和工具库
- **GameLib**: 封装游戏业务逻辑和常用组件
- **统一入口**: 通过 npm 包统一管理和使用

### 🔧 技术优势
- 基于 **TypeScript 严格模式** 开发，内置 `Nullable<T>` 空值安全类型体系，提供完整的类型安全支持
- 深度集成 LayaAir 游戏引擎，内置 FairyGUI 界面系统与 Spine 骨骼动画支持
- **纯代码 FGUI 界面工厂（UIFactory）**：声明式配置驱动构建 UI 组件
- **等比缩放与屏幕自适应（ScaleKit）**、滚动策略模式、装饰器系统（`@Ready` 等）
- 语言包 O(1) 预解析检索，支持运行时文案替换与删除（`setStr` / `removeStr`）
- 提供完善的资源管理和加载机制、组件自动销毁清理机制

### 🛠️ 构建工具链
- **全新 Rollup 构建管线**：命名空间注入、装饰器/泛型 AST 转换、tslib 与 core-js polyfill 自动注入
- 内置**多平台 webp 转换引擎**（libwebp v1.3.0），支持按平台动态下载
- GitHub Packages 自动发布流水线（`beta` / `latest` 双通道）

---

## 📦 安装与使用方式

项目已完全迁移至 **GitHub Packages** 托管，所有的编译产物都通过 npm 包进行统一的版本管理。

### 方法一：通过 GitHub Packages 安装 (推荐)

这是最标准、最稳定的安装方式，支持版本控制且开箱即用。

#### 1. 配置认证
在项目根目录或用户目录下创建/修改 `.npmrc` 文件。你需要一个 **GitHub 个人访问令牌 (PAT)**。

**如何获取令牌：**
1. 访问 GitHub [Settings -> Developer settings -> Personal access tokens](https://github.com/settings/tokens)。
2. 生成一个新令牌 (Classic)，并勾选 **`read:packages`** 权限（如果是私有仓库，还需勾选 **`repo`**）。
3. 详细步骤请参考官方文档：[Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

```text
# 告诉 npm：@boge-mvp 作用域的包去 GitHub 下载
@boge-mvp:registry=https://npm.pkg.github.com/

# 配置认证信息
//npm.pkg.github.com/:_authToken=你的_GITHUB_访问令牌
```

#### 2. 执行安装命令

> [!WARNING]
> **💡 关于 pnpm Workspace (多包工作区) 环境的温馨提示：**
> 如果您的项目是一个多包工作区（最外层目录下含有 `pnpm-workspace.yaml`），直接在最外层执行 pnpm 安装可能会触发以下安全拦截警示：
> `ERR_PNPM_ADDING_TO_ROOT Running this command will add the dependency to the workspace root...`
>
> **解决方法（二选一）：**
> 1. **推荐：** 先在终端 `cd` 进入具体的游戏子项目目录（如 `cd apps/game`），再运行下面的非 `-w` 安装命令。
> 2. **全局化：** 如果您确实需要把依赖装在整个工作区的“最外层根目录”，请在下面的 pnpm 命令尾端追加 `-w`（即开发依赖合并全局安装：`-Dw`）。

##### A. 安装正式版本 (Stable - 推荐用于生产环境)

因为这个框架只在开发、编译和类型匹配阶段起作用（最终打包时代码已自动混入），我们**强烈推荐所有的安装均使用开发依赖方式（NPM 用 `-D` / pnpm 用 `-D` 或者是 `-Dw`）**引入：

* **方式 A：使用 NPM 别名安装（⭐ 强烈推荐）**
  ```bash
  # 使用 npm (设置别名为 game-lib 并作为开发依赖)
  npm install game-lib@npm:@boge-mvp/game-lib@latest -D
  
  # 或使用 pnpm (设置别名为 game-lib 并作为开发依赖)
  pnpm add game-lib@npm:@boge-mvp/game-lib@latest -D
  ```

* **方式 B：标准范围安装**
  ```bash
  # 使用 npm
  npm install @boge-mvp/game-lib@latest -D
  
  # 或使用 pnpm
  pnpm add @boge-mvp/game-lib@latest -D
  ```

##### B. 安装测试版本 (Beta / Pre-release - 用于功能预览)

当您在进行新特性测试和验证时，可通过 `beta` 分发标签安全地下载测试包：

* **方式 A：一键安装最新的测试版（⭐ 自动获取最新，无需每次都指定具体版本号）**
  - 使用 `@beta` 动态标签。每次执行该命令都会由注册表自动解析并下载最新的那个测试版本：
  ```bash
  # 别名安装方式
  npm install game-lib@npm:@boge-mvp/game-lib@beta -D
  pnpm add game-lib@npm:@boge-mvp/game-lib@beta -D
  
  # 标准安装方式
  npm install @boge-mvp/game-lib@beta -D
  pnpm add @boge-mvp/game-lib@beta -D
  ```

* **方式 B：安装指定的特定测试版本**
  - 如果需要固定调试或回滚至某个特定的历史测试版本，可显式声明版本号（格式为 `X.Y.Z-beta.N`）：
  ```bash
  # 别名安装方式（以安装 2.4.3-beta.0 为例）
  npm install game-lib@npm:@boge-mvp/game-lib@2.4.3-beta.0 -D
  pnpm add game-lib@npm:@boge-mvp/game-lib@2.4.3-beta.0 -D
  
  # 标准安装方式
  npm install @boge-mvp/game-lib@2.4.3-beta.0 -D
  pnpm add @boge-mvp/game-lib@2.4.3-beta.0 -D
  ```

##### C. 查询与验证当前最新版本命令

如果您需要查询 and 确认 GitHub Packages 上当前各个标签（如 `latest` 正式版、`beta` 测试版）具体指向的实际版本号，可在终端中直接执行以下命令：

```bash
# 查询该依赖库所有的分发标签（dist-tags）及其当前绑定的具体版本号
npm view @boge-mvp/game-lib dist-tags
```

> **💡 命令输出示例：**
> ```text
> { latest: '2.4.2', beta: '2.4.3-beta.0' }
> ```

---

### 方法二：在 package.json 中手动声明

```json
{
  "dependencies": {
    "// 方式 A：使用别名指向 GitHub Packages (推荐)": "",
    "game-lib": "npm:@boge-mvp/game-lib@^2.4.2",
    
    "// 方式 B：标准声明": "",
    "@boge-mvp/game-lib": "^2.4.2"
  }
}
```

---

## 🚀 进阶用法

**代码导入对比说明：**
```javascript
// 如果你使用的是 方式A (别名安装)：
const { webp } = require("game-lib")

// 如果你使用的是 方式B (标准安装)：
const { webp } = require("@boge-mvp/game-lib")
```

*(以下示例均基于已使用 `game-lib` 作为别名安装的前提)*

### 导出 API 一览

npm 包统一入口 `index.js` 共导出 **22 个** API，按功能分组如下：

| 分组 | API | 说明 |
|---|---|---|
| **主打包入口** | `buildLibrary` | 库工程打包（命名空间注入、js/dts 产物、压缩） |
| | `rollupPack` | 应用工程 Rollup 打包 |
| | `compile` | TypeScript 编译 |
| | `packResources` | npm 包资源整理打包 |
| | `removeTemp` | 清理构建临时产物 |
| **插件与转换器** | `rollupRename` | Rollup 重命名插件 |
| | `generics` | 泛型 AST 转换插件 |
| | `decorators` | 装饰器 AST 转换插件 |
| | `addMetadata` | AST 元数据注入 |
| | `createNamespaceTransformer` | 命名空间转换器工厂 |
| | `scanNode` | AST 节点扫描 |
| **管线原子能力** | `buildPolyfillBundle` | core-js polyfill 打包 |
| | `buildTslibHelpers` | tslib helper 注入 |
| | `concatSource` | 产物源码拼接 |
| | `namespaceAssign` | 命名空间赋值包装 |
| | `namespaceConverge` | 命名空间收敛包装 |
| | `astDependencies` | AST 依赖解析 |
| **辅助工具** | `webp` | WebP 转换引擎实例（多平台） |
| | `clean` | 目录清理 |
| | `log` | 构建日志输出 |
| | `writeFile` / `createDirectory` | 文件与目录写入工具 |

### 1. 使用 webp 转换工具
库内置了 webp 处理能力，可直接在构建脚本中调用：

```javascript
const { webp } = require("game-lib")

// 参数：输入路径, 输出路径, cwebp 参数
webp.cwebp('temp/img/a.jpg', 'temp/img/a.jpg.webp', '-q 60')
```

### 2. 使用 Gulp 自动化构建库
如果你的项目也需要按照此框架规范打包：

```javascript
const gulp = require("gulp")
const { buildLibrary, clean } = require("game-lib")

const project = "myGameLib"

gulp.task("clean", () => clean(["bin"]))

function buildLib(done) {
    buildLibrary({
        src: {
            globs: ["src/**/*.ts"],
        },
        outName: project,
        dist: "./bin"
    }, done, {
        js: { namespace: project, isMinify: true },
        dts: {
            namespace: project,
            globalDtsFile: ["./src/define.d.ts"]
        }
    })
}

gulp.task('build', gulp.series("clean", buildLib))
```

### 3. 使用 Rollup 打包应用
```javascript
const { rollupPack } = require("game-lib")

async function bundle() {
    await rollupPack("src/Main.ts", "game.min.js", {
        outDir: "./dist",
        minify: true,
        sourcemap: true
    })
}
```

---

## 项目结构

```
TypeScriptLib/
├── TSCore/               # 核心框架库源码（utils / kit / view / uifactory 等模块）
├── GameLib/              # 游戏业务库源码
├── demo/                 # 构建示例工程
├── template/             # 引擎运行时模板库（LayaAir / FairyGUI / Spine / reflect 等）
├── lib/                  # 构建管线底层模块
├── libs/                 # 类型声明依赖 (.d.ts)
├── bin/                  # 导出的声明文件 (.d.ts)
├── dist/                 # 编译后的 JS 产物
├── webp/                 # WebP 转换引擎（libwebp v1.3.0，多平台）
├── assets/               # 框架内置配置资源
├── .github/workflows/    # CI 自动发布工作流 (publish.yml)
├── pnpm-workspace.yaml   # pnpm 多包工作区配置（root + TSCore + GameLib）
├── index.js              # npm 包统一导出入口
└── packNpmLib.js         # npm 包资源打包脚本
```

---

## 🤖 自动发布 (CI/CD)

本仓库配置了 GitHub Actions 自动发布流水线（`.github/workflows/publish.yml`）：

1. 推送 `v*` 格式的版本标签触发工作流；
2. CI 自动以 **Node 22 + pnpm 9** 安装依赖并完成构建；
3. 按标签类型自动分流发布至 GitHub Packages：
   - 标签含 `-`（如 `v2.4.3-beta.0`）→ 以 **`beta`** 分发标签发布；
   - 标签不含 `-`（如 `v2.4.2`）→ 以 **`latest`** 分发标签发布。

```bash
# 发布正式版
git tag v2.4.3
git push origin v2.4.3

# 发布测试版
git tag v2.4.3-beta.0
git push origin v2.4.3-beta.0
```

---

## 开发环境要求

- Node.js >= 22.0.0 (推荐，与 CI 保持一致)
- pnpm >= 9.0.0 (本仓库为 pnpm 多包工作区：root + TSCore + GameLib)
- TypeScript >= 6.0.0
- LayaAir Engine >= 2.0.0

**构建命令**：`npm run build`（依次执行 clean → build:tscore → build:gamelib → packResources）

## 许可证

MIT License
