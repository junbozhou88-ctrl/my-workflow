---
description: 分支、commit、PR 规范
---

# Git 工作流

## Commit

- 使用 **Conventional Commits**：`feat:` / `fix:` / `chore:` / `docs:` / `refactor:` / `test:` 等
- 单次 commit 聚焦单一改动

## 钩子

- **Husky** 已启用（`prepare: husky`）
- Claude Code 的 PostToolUse hook 会在 Write/Edit 后自动运行 `pnpm run fix`（跳过 `correctness/noUnusedImports`）
- 提交前确保 `pnpm check` 通过

## 分支与 PR

- 从 `main` 切分支开发，不直接在 `main` 上提交功能改动
- PR 前跑通 `pnpm build` 与 `pnpm check-types`
