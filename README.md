# my-workflow-lambda

网球主题的工单（服务请求）管理应用：访客在 Ace Tennis Club 官网首页查看本浏览器创建的工单，并新增 / 编辑 / 删除工单。本版本无登录，「当前用户」由浏览器内持久化的 UUID 标识，每个用户最多 30 条工单（服务端强制）。

基于 [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) 的 pnpm + Turborepo monorepo。

## Features

- **TypeScript** - 全仓库 ESM，端到端类型安全
- **React 19 + TanStack Router** - 文件式路由的前端 (`apps/web`)
- **Hono on Cloudflare Workers** - Serverless API (`apps/server`)
- **Cloudflare D1 + Drizzle ORM** - 边缘 SQLite，工单持久化与查询
- **TailwindCSS v4 + 共享 UI 包** - `packages/ui`
- **zod + @t3-oss/env-core** - 输入校验与类型安全环境变量 (`packages/env`)
- **Turborepo / Biome / Husky** - 构建编排、lint/format、Git 钩子

## Getting Started

安装依赖：

```bash
pnpm install
```

初始化本地 D1 数据库（首次运行，应用 migration）：

```bash
pnpm -F server exec wrangler d1 migrations apply tickets-db --local
```

启动开发服务：

```bash
pnpm run dev
```

- Web 应用：[http://localhost:3001](http://localhost:3001)
- API (wrangler dev)：[http://localhost:3000](http://localhost:3000)

环境变量：

- `apps/web/.env` — `VITE_SERVER_URL`（API 地址，默认 `http://localhost:3000`）
- `apps/server/wrangler.jsonc` — `vars.CORS_ORIGIN`（允许的前端源）+ D1 绑定 `DB`

## API

所有 `/api/tickets` 请求需带 `x-user-id` 头（前端自动注入 localStorage 中的 UUID）。

| Method | Path | 说明 |
| ------ | ---- | ---- |
| GET | `/api/tickets` | 当前用户工单列表（按创建时间倒序） |
| POST | `/api/tickets` | 新增工单（zod 校验，达 30 条返回 409） |
| PUT | `/api/tickets/:id` | 修改工单（含状态，仅限本人） |
| DELETE | `/api/tickets/:id` | 删除工单（仅限本人） |

工单状态：`pending` / `processing` / `completed`。

## 部署

后端为 Cloudflare Worker：

```bash
pnpm -F server exec wrangler d1 create tickets-db   # 取得 database_id 填入 wrangler.jsonc
pnpm -F server run db:migrate:remote                # 应用远端 D1 migration
pnpm -F server run deploy                           # wrangler deploy
```

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@my-workflow-lambda/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Initialize hooks: `pnpm run prepare`
- Run checks: `pnpm run check`

## Project Structure

```
my-workflow-lambda/
├── apps/
│   ├── web/         # 前端 (React 19 + TanStack Router + Vite)
│   ├── server/      # API (Hono on Cloudflare Workers + D1/Drizzle)
│   └── fumadocs/    # 文档站 (Next.js + fumadocs)
├── packages/
│   ├── ui/          # 共享 shadcn/ui 组件与样式
│   ├── env/         # 类型安全环境变量 (t3-env + zod)
│   └── config/      # 共享 tsconfig
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run check`: Run Biome formatting and linting
