# ticket-form — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始设计 |

## 项目架构

- 架构类型: monorepo，前端 apps/web
- 涉及层: 前端（表单 + 弹窗 + 提交）；对接 2.ticket-api
- 遵循 `.claude/rules/frontend.md`（react-hook-form + zod + UI 包）

## 功能模块设计

### 模块 1: 校验 schema 与表单组件

`src/components/tickets/ticket-form.tsx`：react-hook-form + `zodResolver`。schema 与 2.ticket-api 对齐（email/phone/contactName/description，编辑时加 status enum）。字段含清晰 label 与 inline 错误提示。

**涉及层及关键设计:**

- 前端：受控表单；schema 单独放 `src/lib/ticket-schema.ts`，新增/编辑复用
- 校验：email 格式、phone 正则、contactName 必填、description 5–500

### 模块 2: 新增弹窗

`<CreateTicketDialog>`：UI 包 Dialog 包裹 ticket-form（无 status 字段）。提交→`createTicket(values)`→成功 close + `refetch()` + sonner 成功；新工单服务端默认 pending。

### 模块 3: 编辑弹窗

`<EditTicketDialog ticket={...}>`：表单 `defaultValues` 回显，含 status 下拉（待处理/处理中/已完成）。提交→`updateTicket(id, values)`→成功 close + refetch。

### 模块 4: 30 上限控制

「新增工单」按钮依据 `useTickets()` 的数量：≥30 时禁用并展示提示（tooltip/文案）。提交若仍触发服务端 409，捕获后展示「最多只能创建 30 条」错误。

### 模块 5: 提交失败处理

提交期间按钮 loading 防重复。失败时：不关闭弹窗、保留 RHF 表单值、按错误码映射文案（400 字段错误 / 409 上限 / 其他通用），sonner + inline 提示。

## 接口契约

- 消费 2.ticket-api：`POST /api/tickets`、`PUT /api/tickets/:id`（契约见 `specs/2.ticket-api/design.md`）
- 复用 3.ticket-list：`useTickets()`（数量与 refetch）、修改入口由列表操作列触发打开编辑弹窗

## 数据模型

- 复用 Ticket 类型与状态枚举（pending/processing/completed）

## 安全考虑

- 前端校验仅为体验，最终以 2.ticket-api 服务端校验与 30 上限为准
- 防重复提交（提交中禁用按钮）

## 技术决策

| 决策       | 选项                                 | 理由                                     |
| ---------- | ------------------------------------ | ---------------------------------------- |
| 表单方案   | react-hook-form + zodResolver        | 项目已内置依赖，schema 可与后端对齐      |
| 新增/编辑  | 共用表单 + 两个 Dialog 包装          | 复用校验与字段，差异仅 status 与提交动作 |
| 30 上限    | 前端禁用 + 服务端 409 兜底           | 体验即时反馈，安全以服务端为准           |
