import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { TICKET_LIMIT_PER_USER, tickets } from "../db/schema";
import { zodErrorHook } from "../lib/validation";
import { requireUser } from "../middleware/auth";
import { createTicketSchema, updateTicketSchema } from "../schemas/ticket";
import type { AppEnv } from "../types";

export const ticketsRoute = new Hono<AppEnv>();

ticketsRoute.use("*", requireUser);

// GET /api/tickets — 当前用户工单列表，按创建时间倒序
ticketsRoute.get("/", async (c) => {
	const db = createDb(c.env.DB);
	const userId = c.get("userId");
	const rows = await db
		.select()
		.from(tickets)
		.where(eq(tickets.userId, userId))
		.orderBy(desc(tickets.createdAt));
	return c.json(rows);
});

// POST /api/tickets — 新增工单，服务端强制每用户 30 条上限
ticketsRoute.post(
	"/",
	zValidator("json", createTicketSchema, zodErrorHook),
	async (c) => {
		const db = createDb(c.env.DB);
		const userId = c.get("userId");
		const input = c.req.valid("json");

		const now = Date.now();
		const row = {
			id: crypto.randomUUID(),
			userId,
			...input,
			status: "pending" as const,
			createdAt: now,
			updatedAt: now,
		};

		// 原子化强制 30 条上限：仅当当前用户工单数 < 上限时才插入，
		// 避免 COUNT + INSERT 两步之间的并发竞态（D1 无交互式事务）。
		const result = await db.run(sql`
			INSERT INTO tickets (id, user_id, contact_name, email, phone, description, status, created_at, updated_at)
			SELECT ${row.id}, ${userId}, ${row.contactName}, ${row.email}, ${row.phone}, ${row.description}, ${row.status}, ${now}, ${now}
			WHERE (SELECT COUNT(*) FROM tickets WHERE user_id = ${userId}) < ${TICKET_LIMIT_PER_USER}
		`);

		if (result.meta.changes === 0) {
			return c.json(
				{
					error: {
						code: "LIMIT_EXCEEDED",
						message: `最多只能创建 ${TICKET_LIMIT_PER_USER} 条工单`,
					},
				},
				409
			);
		}

		return c.json(row, 201);
	}
);

// PUT /api/tickets/:id — 修改工单（含状态），仅限归属当前用户
ticketsRoute.put(
	"/:id",
	zValidator("json", updateTicketSchema, zodErrorHook),
	async (c) => {
		const db = createDb(c.env.DB);
		const userId = c.get("userId");
		const id = c.req.param("id");
		const input = c.req.valid("json");

		const result = await db
			.update(tickets)
			.set({ ...input, updatedAt: Date.now() })
			.where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
			.returning();

		const updated = result[0];
		if (!updated) {
			return c.json(
				{ error: { code: "NOT_FOUND", message: "工单不存在" } },
				404
			);
		}
		return c.json(updated);
	}
);

// DELETE /api/tickets/:id — 删除工单，仅限归属当前用户
ticketsRoute.delete("/:id", async (c) => {
	const db = createDb(c.env.DB);
	const userId = c.get("userId");
	const id = c.req.param("id");

	const result = await db
		.delete(tickets)
		.where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
		.returning({ id: tickets.id });

	if (result.length === 0) {
		return c.json({ error: { code: "NOT_FOUND", message: "工单不存在" } }, 404);
	}
	return c.body(null, 204);
});
