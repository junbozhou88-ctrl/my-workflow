# ticket-api — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo（pnpm + Turborepo），后端 Serverless
- 涉及层: 边缘运行时（Cloudflare Workers / Hono）、数据库（Cloudflare D1 + Drizzle ORM）
- 遵循 `.claude/rules/backend-api.md`（Hono 约定、zod 校验、按领域拆路由）与 `.claude/rules/security.md`（env 集中、输入校验、CORS）

## 功能模块设计

### 模块 1: 运行时迁移与 Wrangler 配置

将 `apps/server` 从 `@hono/node-server` 迁移到 Workers：入口改为 `export default app`，移除 `serve(...)`。新增 `apps/server/wrangler.jsonc`，声明 D1 绑定 `DB` 与 `vars.CORS_ORIGIN`。

**涉及层及关键设计:**

- 运行时：Hono 实例直接 `export default`；本地用 `wrangler dev`，部署 `wrangler deploy`
- env：D1 通过 Workers binding 注入（`c.env.DB`），不再走 dotenv；CORS_ORIGIN 走 wrangler `vars`
- 包脚本调整：`dev` → `wrangler dev`，新增 `deploy`、`db:generate`、`db:migrate`

### 模块 2: D1 + Drizzle 数据层

用 Drizzle 定义 `tickets` schema，drizzle-kit 生成 migration，应用到本地与远端 D1。

**涉及层及关键设计:**

- `src/db/schema.ts`：tickets 表（见数据模型），`userId` 建索引
- `src/db/index.ts`：`drizzle(c.env.DB, { schema })` 工厂，按请求构造
- migration 输出到 `apps/server/drizzle/`，`wrangler d1 migrations apply`

### 模块 3: 用户身份中间件

Hono 中间件解析 `x-user-id` 头，校验为非空 UUID 格式，写入 `c.set('userId', id)`；缺失/非法返回 400。

### 模块 4: 工单 CRUD 路由

`src/routes/tickets.ts` 用 `app.route('/api/tickets', ticketsRouter)` 挂载：

- `GET /`：`where(eq(userId))` + `orderBy(desc(createdAt))`
- `POST /`：`@hono/zod-validator` 校验 body → 先 `count` 当前用户工单，≥30 抛 409 → insert（id=crypto.randomUUID()，status=pending，时间戳=Date.now()）
- `PUT /:id`：校验 body → `update ... where(eq(id) && eq(userId))`，受影响行数为 0 返回 404
- `DELETE /:id`：`delete where(eq(id) && eq(userId))`，0 行返回 404

### 模块 5: 校验 schema 与错误处理

`src/schemas/ticket.ts` 集中 zod schema（create/update 复用）。统一错误：`app.onError` 返回 `{ error: { code, message } }`，校验失败 400、上限 409、未找到 404。

## 接口契约

基址：`/api`，所有请求需带 `x-user-id` 头。

| Method | Path                | Body                                              | 成功         | 失败                          |
| ------ | ------------------- | ------------------------------------------------- | ------------ | ----------------------------- |
| GET    | `/api/tickets`      | -                                                 | 200 Ticket[] | 400 缺 userId                 |
| POST   | `/api/tickets`      | `{contactName,email,phone,description}`           | 201 Ticket   | 400 校验 / 409 超 30 上限     |
| PUT    | `/api/tickets/:id`  | `{contactName,email,phone,description,status}`    | 200 Ticket   | 400 / 404 不存在或非本人      |
| DELETE | `/api/tickets/:id`  | -                                                 | 204          | 404 不存在或非本人            |

校验规则（zod）：
- `email`: `z.string().email()`
- `phone`: `z.string().regex(/^[\d\s+\-()]{6,20}$/)`
- `contactName`: `z.string().min(1).max(50)`
- `description`: `z.string().min(5).max(500)`
- `status`（仅 PUT）: `z.enum(["pending","processing","completed"])`

错误响应：`{ "error": { "code": "VALIDATION|LIMIT_EXCEEDED|NOT_FOUND|UNAUTHENTICATED", "message": string } }`

## 数据模型

D1 表 `tickets`（Drizzle）：

| 列          | 类型             | 约束                              |
| ----------- | ---------------- | --------------------------------- |
| id          | text (PK)        | UUID                              |
| userId      | text             | not null, **index**               |
| contactName | text             | not null                          |
| email       | text             | not null                          |
| phone       | text             | not null                          |
| description | text             | not null                          |
| status      | text             | not null, default 'pending'       |
| createdAt   | integer (epoch ms) | not null                        |
| updatedAt   | integer (epoch ms) | not null                        |

## 安全考虑

- 所有写/读以 `userId` 为隔离边界；跨用户操作返回 404 而非 403，避免泄露资源存在性
- 入参全部 zod 校验后再落库
- CORS 仅放行 `CORS_ORIGIN`，方法限 GET/POST/PUT/DELETE/OPTIONS
- `x-user-id` 仅作数据隔离标识，非鉴权凭证（本版本无登录，符合 PRD 范围）

## 技术决策

| 决策             | 选项                                  | 理由                                                         |
| ---------------- | ------------------------------------- | ------------------------------------------------------------ |
| 运行时           | Cloudflare Workers（vs Node server）  | 用户指定 Serverless；Hono 原生支持 Workers，迁移成本低       |
| 数据库           | Cloudflare D1（vs KV / DO）           | 工单是关系型可查询数据 + count 限制，D1（SQLite）最贴合       |
| ORM              | Drizzle（vs 原生 D1 prepared）        | 类型安全、与 TS/zod 栈一致、migration 工具完善               |
| 用户标识载体     | `x-user-id` 头（vs cookie）           | 前端可控、易隔离、刷新后由 localStorage 还原                 |
| 跨用户访问响应   | 404（vs 403）                         | 不泄露资源存在性                                             |
