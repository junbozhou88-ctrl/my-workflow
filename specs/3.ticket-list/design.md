# ticket-list — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo，前端 apps/web
- 涉及层: 前端（数据获取 + 展示）；对接 2.ticket-api
- 遵循 `.claude/rules/frontend.md`、`.claude/rules/security.md`

## 功能模块设计

### 模块 1: 身份持久化与 API client

`src/lib/user-id.ts`：读取 localStorage（key `tennis-ticket-user-id`），无则 `crypto.randomUUID()` 写入。`src/lib/api.ts`：封装 fetch，自动注入 `x-user-id` 头与 API 基址（取自 `@my-workflow-lambda/env/web` 的 `VITE_SERVER_URL`），统一解析错误响应 `{error:{code,message}}`。

**涉及层及关键设计:**

- 前端：纯工具模块；导出 `getClientUserId()`、`apiFetch()`、`listTickets()`、`deleteTicket(id)`

### 模块 2: 工单查询 hook 与状态机

`src/hooks/use-tickets.ts`：管理 `status: 'loading'|'error'|'empty'|'ready'` 与 `tickets`、`refetch`。首次挂载拉取列表，导出供列表组件与 feature 4 复用。

**涉及层及关键设计:**

- 状态推导：loading→（成功且空→empty / 成功有数据→ready / 失败→error）
- 暴露 `refetch()` 供新增/编辑/删除后刷新

### 模块 3: 工单表格与状态标签

`src/components/tickets/ticket-table.tsx`：列=联系人/邮箱/电话/描述/状态/创建时间/操作。状态用 `<StatusBadge>`（pending 灰、processing 蓝、completed 绿）。创建时间格式化为本地可读时间。操作列「修改」「删除」按钮。

### 模块 4: 四态展示

容器组件按 hook 状态渲染：加载→骨架/spinner（复用 `loader.tsx`）；empty→网球主题友好空状态插画+提示；error→错误文案 + 重试按钮；ready→表格。该容器即挂载进 `1.T-005` 的 TicketSection slot。

### 模块 5: 删除流程

「删除」触发确认对话框（UI 包 AlertDialog）；确认→`deleteTicket(id)`→成功 `refetch()` + sonner 成功提示；失败→保留数据 + sonner 错误提示，对话框关闭。

### 模块 6: 移动端适配

`md` 以下表格切换为卡片式列表（每工单一卡，字段纵向排列，操作按钮大点击区），避免横向溢出。

## 接口契约

- 消费 2.ticket-api：`GET /api/tickets`、`DELETE /api/tickets/:id`（契约见 `specs/2.ticket-api/design.md`）
- 对外：导出 `useTickets()` 供 feature 4 复用其 `refetch` 与列表数据（含数量，用于 30 上限判断）

## 数据模型

- 复用 Ticket 类型（建议在共享处定义 TS 类型，或前端镜像 2.ticket-api 的字段）

## 安全考虑

- clientUserId 仅本地标识，不存敏感信息
- 渲染工单文本走 React 默认转义，不用 `dangerouslySetInnerHTML`

## 技术决策

| 决策         | 选项                              | 理由                                   |
| ------------ | --------------------------------- | -------------------------------------- |
| 数据获取     | 自建 hook + fetch（vs 引入 query 库） | 范围小，避免新增依赖；如后续复杂可换 TanStack Query |
| 移动端表格   | 卡片式（vs 横向滚动）             | PRD 要求不严重溢出 + 易点击，卡片体验更好 |
| 身份存储 key | localStorage `tennis-ticket-user-id` | 刷新持久、浏览器间天然隔离             |
