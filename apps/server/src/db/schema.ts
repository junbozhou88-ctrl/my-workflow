import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TICKET_STATUSES = ["pending", "processing", "completed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const tickets = sqliteTable(
	"tickets",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").notNull(),
		contactName: text("contact_name").notNull(),
		email: text("email").notNull(),
		phone: text("phone").notNull(),
		description: text("description").notNull(),
		status: text("status", { enum: TICKET_STATUSES })
			.notNull()
			.default("pending"),
		createdAt: integer("created_at").notNull(),
		updatedAt: integer("updated_at").notNull(),
	},
	(table) => [index("tickets_user_id_idx").on(table.userId)]
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export const TICKET_LIMIT_PER_USER = 30;
