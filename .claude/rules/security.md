---
description: 密钥处理、环境变量、输入校验等安全规范
---

# 安全

## 密钥与环境变量

- **禁止硬编码密钥/凭证**。所有 env 通过 `@my-workflow-lambda/env`（`@t3-oss/env-core` + zod）集中定义并校验：
  - 服务端：`@my-workflow-lambda/env/server`
  - 前端：`@my-workflow-lambda/env/web`（仅暴露可公开变量）
- `.env` / `.env*.local` 已在 `.gitignore` 中，不要提交

## 输入校验

- 所有外部输入用 **zod** 校验（前端表单、server 请求体/参数）
- server 端建议配合 `@hono/zod-validator` 做 schema 校验

## 前端

- `target="_blank"` 必须加 `rel="noopener"`
- 避免 `dangerouslySetInnerHTML`；不直接赋值 `document.cookie`
- 不使用 `eval()`

## server

- CORS 通过 `env.CORS_ORIGIN` 配置，不要用通配 `*` 放开生产源
- 仅开放需要的方法（当前 `GET/POST/OPTIONS`）
