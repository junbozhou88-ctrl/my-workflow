# ticket-list — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-17 | v1   | 初始任务 |

## 项目信息

- 项目名: my-workflow-lambda
- 架构类型: monorepo，前端 apps/web
- specs 路径: specs/3.ticket-list/

## 任务列表

### 功能 1: 身份与数据获取

- [x] T-001: clientUserId 持久化（localStorage）+ API client 封装（注入 x-user-id、解析错误） ~30min
- [x] T-002: `useTickets` 查询 hook（loading/empty/error/ready 状态机 + refetch） ~30min

### 功能 2: 列表展示

- [x] T-003: 工单表格组件（七列字段 + StatusBadge 状态标签 + 时间格式化） ~30min
- [x] T-004: 四态容器（加载/空/错误重试/数据），挂载进首页 TicketSection slot ~30min
- [x] T-005: 移动端卡片式适配（md 以下表格转卡片，操作按钮易点击） ~30min

### 功能 3: 删除工单

- [x] T-006: 删除二次确认对话框 + 删除联动（成功 refetch + 提示） ~30min
- [x] T-007: 删除失败处理（保留工单 + 明确错误提示） ~15min

## 依赖关系

- T-002 依赖 T-001
- T-003 / T-004 / T-006 依赖 T-002
- T-005 依赖 T-003
- T-007 依赖 T-006
- 跨 feature：本 feature 全部依赖 2.ticket-api（`3.T-002 依赖 2.T-005`，`3.T-006 依赖 2.T-008`）；`3.T-004` 依赖 `1.T-005`

## 风险点

- API 基址需在 env 中配置（VITE_SERVER_URL），跨域走 ticket-api 的 CORS
- 删除/刷新的竞态：删除成功后以 refetch 结果为准，避免乐观更新与服务端不一致
