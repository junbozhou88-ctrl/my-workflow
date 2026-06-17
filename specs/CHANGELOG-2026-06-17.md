# 变更日志 — 2026-06-17

网球主题工单系统首版开发（feature 2/3/4；feature 1 tennis-homepage 因仓库已存在静态首页 UI 而移出本轮）。

## Feature 2: ticket-api

### 新增
- Cloudflare Workers + D1（Drizzle ORM）工单服务，`/api/tickets` 全套 CRUD
- `x-user-id` 头身份识别中间件（UUID 校验）
- zod 入参校验 + 统一错误响应 `{ error: { code, message } }`
- 每用户 30 条上限，服务端**原子化**强制（单条条件 INSERT）

### 关键文件
- `apps/server/src/index.ts` — Workers 入口（`export default app`）+ CORS/onError
- `apps/server/src/routes/tickets.ts` — CRUD 路由
- `apps/server/src/db/schema.ts` — D1 `tickets` 表（Drizzle）
- `apps/server/src/middleware/auth.ts` — x-user-id 身份中间件
- `apps/server/src/schemas/ticket.ts` + `src/lib/validation.ts` — 校验
- `apps/server/wrangler.jsonc`、`drizzle/0000_create_tickets.sql`

### 架构决策
- 后端由 `@hono/node-server` 迁移到 Cloudflare Workers；env/D1 走 `c.env` 绑定（无 `process.env`）
- 跨用户访问返回 404（不泄露资源存在性）；`x-user-id` 仅数据隔离，非鉴权（PRD 无登录）

## Feature 3: ticket-list

### 新增
- `clientUserId` localStorage 持久化 + API client（自动注入 `x-user-id`）
- `useTickets` 四态查询 hook（loading / empty / error / ready）
- 工单表格 + 状态标签 + 移动端卡片式适配
- 删除二次确认弹窗，失败时保留工单并提示

### 关键文件
- `apps/web/src/lib/{api,user-id,ticket-schema}.ts`、`src/hooks/use-tickets.ts`
- `apps/web/src/components/tickets/{status-badge,confirm-dialog}.tsx`
- `apps/web/src/routes/index.tsx` — 接入真实数据的首页列表

## Feature 4: ticket-form

### 新增
- 共享 `TicketForm`（react-hook-form + zod，与服务端 schema 对齐）
- 新增页 `/new-ticket` 与编辑页 `/edit-ticket?id=`（含状态字段）
- 30 上限前端提示与按钮禁用（+ 服务端 409 兜底）
- 提交失败：弹窗/页面不跳转、保留已填内容、按错误码提示、防重复提交

### 关键文件
- `apps/web/src/components/tickets/{ticket-form,form-shell}.tsx`
- `apps/web/src/routes/{new-ticket,edit-ticket}.tsx`

### 架构决策
- 保持仓库已有的**路由式 UX**（而非 PRD 描述的弹窗），尊重已实现的设计
- 编辑页用搜索参数 `?id=` 而非路径参数 `$id`，规避 biome 文件名规则

## 验证
- ticket-api：本地 D1 live E2E 全 AC 通过（CRUD / 校验 / 隔离 / 30 上限）
- 前端：production build + tsc + biome 通过；Codex review 发现 2 个前端 bug 已修复
- 详见 `specs/LESSONS.md`
