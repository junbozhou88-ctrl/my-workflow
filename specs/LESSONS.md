# 开发踩坑与决策记录

## 2026-06-17 — ticket-api / 全 feature

### 架构决策

- **后端运行时**：apps/server 从 `@hono/node-server` 迁移到 **Cloudflare Workers**（`export default app`）。移除 `serve()`、`@hono/node-server`、`dotenv`、`@my-workflow-lambda/env/server` 依赖——Workers runtime 无 `process.env`，env 改走 Hono `c.env` 绑定（`Bindings = { DB, CORS_ORIGIN }`）。
- **数据库**：Cloudflare D1 + Drizzle ORM。migration 由 `drizzle-kit generate` 生成到 `drizzle/`，由 `wrangler d1 migrations apply` 落库。
- **当前用户**：`x-user-id` 头（UUID）。**这不是鉴权凭证**，仅作数据隔离标识（PRD 本版本无登录）。Codex review 指出该头可伪造——属已知、PRD 范围内的接受项，非缺陷；如未来加登录需换成真实会话。

### 踩坑

- **drizzle-orm@0.45.2 安装损坏**：pnpm 抽取出的 `sqlite-core/index.js`/`index.d.ts` 缺失（只剩 `.map`），导致 `tsc` 报 `Cannot find module 'drizzle-orm/sqlite-core'`、drizzle-kit 报 `Cannot find module './alias.cjs'`。`pnpm install --force` 无效（复用损坏的 store）。**改钉 `drizzle-orm@0.44.4` 后正常**。
- **workerd 构建脚本被 pnpm 拦截**：首次装 wrangler 报 `ERR_PNPM_IGNORED_BUILDS: workerd`。需在 `pnpm-workspace.yaml` 的 `allowBuilds` 加 `workerd: true` 再 install。
- **30 条上限的并发竞态**：`COUNT` + `INSERT` 两步非原子，并发 POST 可越过上限（Codex review 指出）。D1 无交互式事务，改为**单条条件 INSERT**：`INSERT ... SELECT ... WHERE (SELECT COUNT(*) ...) < 30`，再判 `result.meta.changes === 0` 返回 409。已用 30+1 并发场景验证。
- **wrangler 输出管道**：`wrangler ... | tail` 会因 tail 提前关闭管道触发 `write EPIPE`。改为重定向到文件再读。
- **wrangler d1 migrations 重复文件**：目录里出现过 `0000_create_tickets 2.sql`/`meta 2`（带 ` 2` 后缀、`-rw-------` 权限的副本，疑似编辑器/同步产物），导致重复 apply 报 `table already exists`。删除副本 + 清 `.wrangler/state` 后重跑。注意别让此类副本进 git。

### 待用户配合（部署前）

- `wrangler.jsonc` 的 `d1_databases[0].database_id` 当前是占位符。需执行 `pnpm -F server exec wrangler d1 create tickets-db` 拿到真实 id 填入，再 `pnpm -F server run db:migrate:remote` 应用远端 migration。
- `.claude/rules/backend-api.md` 仍描述旧的 `@hono/node-server :3000`，迁移后已过时（N8 文档同步处理）。

## 2026-06-17 — ticket-list / ticket-form（前端集成）

### 关键背景

- 仓库中首页（`routes/index.tsx`）与新增页（`routes/new-ticket.tsx`）**已存在精致的网球主题静态 UI**（mock 数据、路由式而非弹窗）。这是 PLAN 中 feature 1（tennis-homepage）被移除的原因。故 feature 3/4 实际是**集成**：把静态页接到真实 ticket-api，保持既有视觉与路由式 UX（未改成 PRD 描述的弹窗——尊重用户已实现的设计）。
- 编辑页改用**搜索参数** `/edit-ticket?id=` 而非路径参数 `/edit-ticket/$id`：TanStack 的 `$id` 文件名会触发 biome `useFilenamingConvention`，搜索参数规避了该冲突且无需改全局 lint 配置。

### 踩坑

- **react-hook-form 未直接安装**：web 只声明了 `@hookform/resolvers`，没有 `react-hook-form` 本体，Vite/Rolldown 构建报无法解析。需显式 `pnpm -F web add react-hook-form`。
- **`toast` 不在 UI 包导出**：`@my-workflow-lambda/ui/components/sonner` 只导出 `Toaster`。`toast` 直接从 `sonner` 包导入（web 已有该依赖）。
- **生成 UI 与 lint 冲突**：现有 `theme-provider.tsx`（noBarrelFile）、`__root.tsx`（空 interface noBannedTypes）在初始提交即有 lint 债，非本次改动，未处理。

### Codex review 修复（前端）

- 编辑页把「加载失败」误显示为「工单不存在」——补了独立的 error + 重试分支。
- 新增页 30 上限在列表异步加载完成前 `count=0` 有绕过窗口——改为加载期间显示骨架，待 `useTickets` ready 后再渲染表单（服务端 409 本就兜底）。

### 待确认 / 建议

- 浏览器点击式 E2E（四态视觉、移动端卡片、提交/编辑/删除全流程）建议本地双开 `pnpm dev:server` + `pnpm dev:web` 手动核验；本轮已完成后端 live E2E + 前端 build/type/lint + codex review。
