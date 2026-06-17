import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ticketsRoute } from "./routes/tickets";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use(logger());
app.use("/*", (c, next) =>
	cors({
		origin: c.env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "x-user-id"],
	})(c, next)
);

app.get("/", (c) => c.text("OK"));
app.route("/api/tickets", ticketsRoute);

app.onError((err, c) => {
	console.error(err);
	return c.json(
		{ error: { code: "INTERNAL", message: "服务器内部错误" } },
		500
	);
});

export default app;
