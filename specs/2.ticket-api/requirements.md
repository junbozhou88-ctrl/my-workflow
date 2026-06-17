# ticket-api — 需求规格

## 概述

基于 Cloudflare Workers + D1 的工单后端服务，提供按「当前用户」隔离的工单 CRUD、输入校验与每用户最多 30 条的硬性上限。

## 项目信息

- 项目名: my-workflow-lambda
- 架构类型: monorepo（pnpm + Turborepo），后端 Serverless（Cloudflare Workers + D1）

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始需求 |

## 用户故事

- 作为前端，我想要一组工单 CRUD 接口，以便展示和管理当前用户的工单。
- 作为产品，我想要 30 条上限在服务端真实生效，以便限制不被前端绕过。
- 作为用户，我想要我的工单与其他浏览器/设备的数据互相独立。

## 功能需求

1. [F-001] D1 中建立 `tickets` 表，含工单完整字段（见数据模型）
2. [F-002] 通过 `x-user-id` 请求头识别当前用户，缺失/非法则拒绝
3. [F-003] `GET /api/tickets`：返回当前用户的工单列表，按创建时间倒序
4. [F-004] `POST /api/tickets`：新增工单，zod 校验入参，默认状态 `pending`
5. [F-005] 新增前服务端统计当前用户工单数，≥30 时拒绝（HTTP 409）并返回明确消息
6. [F-006] `PUT /api/tickets/:id`：修改工单（含状态），仅允许修改归属当前用户的工单
7. [F-007] `DELETE /api/tickets/:id`：删除归属当前用户的工单
8. [F-008] 统一错误响应结构与 CORS（沿用 `env.CORS_ORIGIN`）

## 非功能需求

- 性能: 单请求 D1 查询走 userId 索引，列表查询 O(log n)
- 安全: 所有写操作校验工单归属，跨用户访问返回 404（不泄露存在性）；入参 zod 校验
- 兼容性: 运行于 Cloudflare Workers runtime（Web 标准 API，不依赖 Node 内置模块）

## 验收标准

- [ ] [AC-001] 带合法 `x-user-id` 调 `GET /api/tickets` 返回该用户工单数组
- [ ] [AC-002] 缺少 `x-user-id` 时返回 400
- [ ] [AC-003] `POST` 非法邮箱/电话/空联系人/过短描述时返回 400 且不写库
- [ ] [AC-004] 同一 userId 已有 30 条时再 `POST` 返回 409，库中仍为 30 条
- [ ] [AC-005] `PUT` 可更新状态为 processing/completed，`updatedAt` 刷新
- [ ] [AC-006] 用 userA 的 id 去 `PUT/DELETE` userB 的工单返回 404，数据不变
- [ ] [AC-007] `DELETE` 成功后该工单不再出现在列表中
- [ ] [AC-008] 服务重启（重新部署）后数据仍在（D1 持久化）

## 依赖

- Cloudflare Workers、Cloudflare D1
- Hono 4、Drizzle ORM、drizzle-kit、Wrangler、zod、@hono/zod-validator

## 开放问题

- 暂无（存储平台已确认为 Cloudflare Workers + D1）
