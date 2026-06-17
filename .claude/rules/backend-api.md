---
description: 后端 API（Hono on Cloudflare Workers + D1）开发规范
globs: "apps/server/**"
---

# 后端 API

## 运行时与框架

- **Hono 4** 运行于 **Cloudflare Workers**，入口 `src/index.ts` 以 `export default app`（ESM，Web 标准 API，不用 Node 内置模块）
- 开发：`wrangler dev`（`pnpm dev:server`，:3000）；部署：`wrangler deploy`
- 配置：`apps/server/wrangler.jsonc`（D1 绑定 `DB`、`vars.CORS_ORIGIN`、`compatibility_flags: ["nodejs_compat"]`）

## 数据库（Cloudflare D1 + Drizzle）

- schema 在 `src/db/schema.ts`，`createDb(c.env.DB)`（`src/db/index.ts`）按请求构造 drizzle 实例
- migration：`pnpm -F server run db:generate`（drizzle-kit 生成到 `drizzle/`）→ `db:migrate:local` / `db:migrate:remote`（wrangler 应用）
- 注意：drizzle-orm 与 drizzle-kit 版本需匹配（曾遇 0.45.2 安装损坏，已钉 0.44.x）

## 约定

- env 与 D1 一律从 `c.env` 绑定读取（Workers 无 `process.env`），类型见 `src/types.ts` 的 `Bindings`
- 中间件在 app 初始化挂载（`logger()`、`cors()`，CORS 源取 `c.env.CORS_ORIGIN`）
- 当前用户经 `x-user-id` 头识别（`src/middleware/auth.ts`，UUID 校验）——仅数据隔离标识，非鉴权凭证
- 请求体用 `@hono/zod-validator` + 统一错误 hook（`src/lib/validation.ts`）校验，schema 集中在 `src/schemas/`
- 错误响应统一 `{ error: { code, message } }`；跨用户访问返回 404 不泄露存在性
- 计数+写入等需原子性的约束用单条条件 SQL（D1 无交互式事务）
- 按领域拆路由模块，用 `app.route()` 挂载子路由
