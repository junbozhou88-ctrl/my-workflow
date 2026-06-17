import type { Hook } from "@hono/zod-validator";
import type { Env } from "hono";

/**
 * 统一 zod 校验失败响应为 `{ error: { code, message } }`，
 * 与 design.md 接口契约一致，供前端按错误码映射提示。
 */
export const zodErrorHook: Hook<unknown, Env, string> = (result, c) => {
	if (!result.success) {
		return c.json(
			{ error: { code: "VALIDATION", message: "输入校验失败" } },
			400
		);
	}
};
