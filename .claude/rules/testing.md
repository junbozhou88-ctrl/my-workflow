---
description: 测试约定与文件命名（当前仓库尚未配置测试框架）
---

# 测试

> 现状：仓库尚未引入测试框架（无 vitest/playwright 配置与测试文件）。下列为新增测试时应遵循的约定。

## 框架选型

- 单元 / 组件测试：优先 **Vitest**（与 Vite + React 19 生态一致），React 组件配 `@testing-library/react`
- E2E：优先 **Playwright**
- server（Hono）可用 `app.request()` 直接做 handler 级测试，无需起服务

## 约定

- 测试文件与源码同目录，命名 `*.test.ts` / `*.test.tsx`
- 断言写在 `it()` / `test()` 内部
- 异步测试用 `async/await`，不用 done 回调
- 禁止提交 `.only` / `.skip`
- describe 嵌套保持扁平
- 测试脚本统一接入 Turborepo（在各 package `package.json` 加 `test`，并在 `turbo.json` 注册 task）
