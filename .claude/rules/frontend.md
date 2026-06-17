---
description: 前端（web 应用与 UI 包）开发规范
globs: "apps/web/**, packages/ui/**, apps/fumadocs/**"
---

# 前端

## apps/web

- **React 19** 函数组件；用 ref 作为 prop，不用 `React.forwardRef`
- **TanStack Router**：文件式路由在 `src/routes/`；`src/routeTree.gen.ts` 由插件生成，**不要手改**
- 构建：**Vite 8**（`vite dev` / `vite build`）
- 样式：**Tailwind v4**（`@tailwindcss/vite`）；合并 class 用 UI 包的 `cn()`
- 表单：`react-hook-form` + `@hookform/resolvers` + zod
- 通知：`sonner`；主题：`next-themes`；图标：`lucide-react`
- hooks 在顶层调用，依赖数组写全

## packages/ui（@my-workflow-lambda/ui）

- 基于 **shadcn + @base-ui/react** 的共享组件库
- 通过子路径导出消费：`@my-workflow-lambda/ui/components/*`、`/hooks/*`、`/lib/*`、`/globals.css`
- 新增组件放对应目录，遵循既有 cva/variant 模式；UI 包内不引入业务逻辑

## apps/fumadocs

- **Next.js 16 + fumadocs**（文档站，dev 端口 4000）
- 内容用 MDX；`fumadocs-mdx` 在 postinstall 生成 source，`.source` 已忽略
- Server Components 做异步取数，避免 async Client Component
