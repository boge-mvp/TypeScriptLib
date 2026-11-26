# GameLib 视图 `CREATE_FUI_URL` 默认配置备份（老项目兼容）

## 背景说明

`GameLib` 内置的 9 个通用视图类已将静态字段 `CREATE_FUI_URL` 的默认值统一置为 `null`（类型：`Nullable<string>`）。若未提前赋值便触发创建，框架会拦截创建并在控制台打印警告：
`[<ClassName>] CREATE_FUI_URL is null, cannot create view.`

老项目在升级 `@boge-mvp/game-lib` 后，若继续沿用历史默认的 FairyGUI 包与组件路径（`init` / `common` / `gameCommon`），只需在项目启动入口（如 `Main.ts` 初始化阶段、创建任何视图之前）直接复制粘贴下方代码，即可恢复全部历史默认值。

---

## 一键粘贴赋值代码（免 `import` 全局命名空间版）

```ts
// init 包相关视图
gameLib.LoadingWindow.CREATE_FUI_URL = "//init/LoadingWindow"
gameLib.HomePrompt.CREATE_FUI_URL = "//init/HomePrompt"
gameLib.ImageWindow.CREATE_FUI_URL = "//init/ImageWindow"

// common 包相关视图
gameLib.HtmlWindow.CREATE_FUI_URL = "//common/HtmlWindow"
gameLib.PromptWindow.CREATE_FUI_URL = "//common/PromptWindow"
gameLib.RechargeSuccessWindow.CREATE_FUI_URL = "//common/RechargeSuccessWindow"

// gameCommon 包相关视图
gameLib.CardDeck.CREATE_FUI_URL = "//gameCommon/CardDeck"
gameLib.PromptTip.CREATE_FUI_URL = "//gameCommon/PromptTip"
gameLib.WaitResult.CREATE_FUI_URL = "//gameCommon/WaitResult"
```

> **按需裁剪提示**：若子游戏项目未包含 `init` 包（如单款游戏仅依赖 `common` 与 `gameCommon`），直接删除或注释上方 `init` 包对应的 3 行即可。

---

## 9 个视图类历史默认 URL 对照表

| 序号 | 类名 | 所属 FGUI 包 | 历史默认 `CREATE_FUI_URL` | 源码路径 |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `LoadingWindow` | `init` | `"//init/LoadingWindow"` | `GameLib/src/com/view/LoadingWindow.ts` |
| 2 | `HomePrompt` | `init` | `"//init/HomePrompt"` | `GameLib/src/com/view/HomePrompt.ts` |
| 3 | `ImageWindow` | `init` | `"//init/ImageWindow"` | `GameLib/src/com/view/ImageWindow.ts` |
| 4 | `HtmlWindow` | `common` | `"//common/HtmlWindow"` | `GameLib/src/com/view/HtmlWindow.ts` |
| 5 | `PromptWindow` | `common` | `"//common/PromptWindow"` | `GameLib/src/com/view/PromptWindow.ts` |
| 6 | `RechargeSuccessWindow` | `common` | `"//common/RechargeSuccessWindow"` | `GameLib/src/com/view/RechargeSuccessWindow.ts` |
| 7 | `CardDeck` | `gameCommon` | `"//gameCommon/CardDeck"` | `GameLib/src/com/view/CardDeck.ts` |
| 8 | `PromptTip` | `gameCommon` | `"//gameCommon/PromptTip"` | `GameLib/src/com/view/PromptTip.ts` |
| 9 | `WaitResult` | `gameCommon` | `"//gameCommon/WaitResult"` | `GameLib/src/com/view/WaitResult.ts` |
