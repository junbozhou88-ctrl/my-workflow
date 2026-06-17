# ticket-api — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始任务 |

## 项目信息

- 项目名: my-workflow-lambda
- 架构类型: monorepo（pnpm + Turborepo），后端 Serverless（Cloudflare Workers + D1）
- specs 路径: specs/2.ticket-api/

## 任务列表

### 功能 1: 数据层

- [x] T-001: Drizzle 定义 `tickets` schema（含字段与 userId 索引）+ drizzle-kit 生成 migration ~30min
- [x] T-002: `apps/server/wrangler.jsonc` 配置 D1 绑定 `DB` 与 `CORS_ORIGIN`，本地 `db:migrate` 跑通 ~30min

### 功能 2: 运行时迁移

- [x] T-003: server 入口由 `@hono/node-server` 迁移到 Workers（`export default app`），`dev` 改 `wrangler dev` ~30min

### 功能 3: 工单接口

- [x] T-004: `x-user-id` 身份中间件（解析+UUID 校验，缺失返回 400） ~15min
- [x] T-005: `GET /api/tickets` 查询当前用户工单（按 createdAt 倒序） ~15min
- [x] T-006: `POST /api/tickets` 新增（zod 校验 + 服务端 count≥30 返回 409 + 默认 pending） ~30min
- [x] T-007: `PUT /api/tickets/:id` 修改（含 status，归属校验，0 行返回 404） ~30min
- [x] T-008: `DELETE /api/tickets/:id` 删除（归属校验，0 行返回 404）+ 统一 onError/CORS ~30min

## 依赖关系

- T-002 依赖 T-001
- T-004 依赖 T-003
- T-005 / T-006 / T-007 / T-008 依赖 T-002、T-004

## 风险点

- Workers runtime 不支持 Node 内置模块：迁移时移除 `serve()` 与任何 `node:` 依赖，env 改用 `c.env` 绑定
- D1 本地与远端是两套库：需分别 `wrangler d1 migrations apply --local` / `--remote`
- @hono/zod-validator 与 zod v4 的兼容性：锁定可用版本，必要时手动 `safeParse`
