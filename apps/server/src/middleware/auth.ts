import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";

const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 从 `x-user-id` 头识别当前用户（本版本无登录，该 ID 仅作数据隔离标识）。
 * 缺失或非法 UUID 时返回 400，不进入业务逻辑。
 */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
	const userId = c.req.header("x-user-id");
	if (!(userId && UUID_REGEX.test(userId))) {
		return c.json(
			{
				error: {
					code: "UNAUTHENTICATED",
					message: "缺少或非法的 x-user-id 头",
				},
			},
			400
		);
	}
	c.set("userId", userId);
	await next();
});
