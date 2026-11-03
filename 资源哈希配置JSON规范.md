# 资源哈希配置 JSON 规范

本规范定义资源版本控制所采用的紧凑型 JSON 配置文件的数据格式与属性定义。

---

## 1. 数据格式与示例

文件顶层为一个单一的 JSON 对象（键值对字典）：

```json
{
  "generatedTime": 1741000000000,
  "libs/tsCore.js": "a1b2c3d4",
  "libs/fairygui.js": "8f3e2d1c",
  "res/atlas/comp.png": "f8e7d6c5",
  "res/atlas/comp.atlas": "9b8a7c6d",
  "configs/gameConfig.json": "3c4d5e6f",
  "assets/sound/bgm.mp3": "7a8b9c0d"
}
```

---

## 2. 属性字段说明

| 属性名称 (Key) | 数据类型 (Type) | 是否必选 | 属性说明 | 规范示例 |
| :--- | :--- | :--- | :--- | :--- |
| `generatedTime` | `number` | **可选** | **配置生成时间戳**：构建工具链生成哈希清单时的 Unix 毫秒时间戳（`Date.now()`）。供版本排障与诊断使用，解析时不会被当作资源路径。 | `1741000000000` |
| `[filePath: string]` | `string \| number` | **必选 (动态)** | **资源文件相对路径到 Hash 的映射**：<br>1. **键 (Key)**：资源在项目中的正斜杠相对路径（不含 `?` 参数，不以 `/` 开头）；<br>2. **值 (Value)**：对应文件的内容哈希摘要字符串或数字。 | `"libs/tsCore.js": "a1b2c3d4"` |

---

## 3. 字段规则约束

1. **路径格式**：动态路径键统一使用正斜杠 `/` 分隔，统一为相对路径格式（例如 `"res/atlas/comp.png"`），禁止包含 Windows 反斜杠 `\\`，禁止携带 `?v=...` 等查询参数；
2. **保留字段**：`generatedTime` 为内置保留字段，仅存储时间戳，不作为资源 URL 处理；
3. **有效性**：哈希值必须为非空字符串或有效数字，解析遇到空字符串、`null` 或 `undefined` 会自动忽略。
