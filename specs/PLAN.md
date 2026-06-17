# 开发计划索引

## 本次 PRD（2026-06-17）切分为 4 个 feature

来源：`docs/PRD-tennis-work-order.md`（网球主题工单系统）
后端形态：**Serverless — Cloudflare Workers + D1（Drizzle ORM）**

| 序号 | feature          | 说明                                                   | 依赖   | 状态   |
| ---- | ---------------- | ------------------------------------------------------ | ------ | ------ |
| 2    | ticket-api       | Cloudflare Worker + D1 工单服务（CRUD/校验/30 上限）   | -      | ✅ 完成 |
| 3    | ticket-list      | 工单列表查询展示 + 四态 + 删除（含身份持久化）         | 2      | ✅ 完成 |
| 4    | ticket-form      | 新增/编辑工单弹窗（表单校验/状态/30 上限/失败处理）    | 2, 3   | ✅ 完成 |

**推荐执行顺序**：1、2 可并行 → 3 → 4

> 集成衔接：`1.T-005` 在首页预留工单区容器；实际列表由 feature 3 挂载（`3.T-004` 填充该容器，依赖 `1.T-005`）。

## ID 编号约定

- 功能需求 / 任务 / 验收标准 ID **在单个 feature 内编号**，跨 feature 用 `{序号}.` 前缀区分。
- 例：`2.T-001` = 序号 2 这个 feature 的 T-001；`3.F-005` = 序号 3 的 F-005。
- **跨 feature 依赖**写全限定 ID，如 `3.T-001 依赖 2.T-004`。

## 关键技术决策（全局）

- **后端运行时**：apps/server 由 `@hono/node-server` 迁移到 Cloudflare Workers（`export default app`），用 Wrangler 本地开发/部署。
- **数据库**：Cloudflare D1（边缘 SQLite），Drizzle ORM + drizzle-kit migration。
- **当前用户识别**：前端生成 UUID（`clientUserId`）存入 localStorage，每次请求带 `x-user-id` 头；服务端按该 ID 隔离与查询数据，30 条上限服务端强制。
- **工单状态枚举**：`pending`（待处理）/ `processing`（处理中）/ `completed`（已完成）。
