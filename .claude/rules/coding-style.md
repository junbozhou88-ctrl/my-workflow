---
description: 命名、缩进、import、注释规范，以 Biome/Ultracite 配置为准
globs: "**/*.{ts,tsx,css}"
---

# 代码风格

Biome（Ultracite preset，见根目录 `biome.json`）是格式化与 lint 的唯一事实来源。提交前运行 `pnpm fix`；保存时 PostToolUse hook 也会自动 `ultracite fix`。

## 格式

- 缩进：**Tab**（`indentStyle: "tab"`）
- 字符串：**双引号**（`quoteStyle: "double"`）
- import 自动排序（`organizeImports: on`）；优先具名/具体导入，**禁止 barrel 文件**
- Tailwind class 自动排序，适用于 `clsx` / `cva` / `cn`

## TypeScript

- 全仓库 ESM（`"type": "module"`），workspace exports 直接指向 `.ts` / `.tsx`
- `strictNullChecks` 开启；优先类型收窄而非类型断言
- 避免可推断类型的冗余标注（`noInferrableTypes`）、避免无用 else（`noUselessElse`）
- 不可变值用 `as const`；用具名常量替代魔法数字

## 命名

- 文件：kebab-case（如 `theme-provider.tsx`、`mode-toggle.tsx`）
- 组件：PascalCase；变量/函数：camelCase
- 生成文件 `apps/web/src/routeTree.gen.ts` 不要手改（已被 lint/git 忽略）

## 其他

- 生产代码移除 `console.log` / `debugger`（server 启动日志除外）
- 抛出 `Error` 对象而非字符串；用早返回减少嵌套
