import { z } from "zod";

export const TICKET_STATUSES = ["pending", "processing", "completed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
	pending: "待处理",
	processing: "处理中",
	completed: "已完成",
};

export const TICKET_LIMIT_PER_USER = 30;

// 与服务端 schema 对齐（apps/server/src/schemas/ticket.ts）
const PHONE_REGEX = /^[\d\s+()-]{6,20}$/;
const DESCRIPTION_MIN = 5;
const DESCRIPTION_MAX = 500;
const CONTACT_NAME_MAX = 50;

export const ticketFormSchema = z.object({
	contactName: z
		.string()
		.trim()
		.min(1, "请输入联系人")
		.max(CONTACT_NAME_MAX, `联系人不超过 ${CONTACT_NAME_MAX} 字`),
	email: z.email("请输入有效的邮箱地址"),
	phone: z.string().trim().regex(PHONE_REGEX, "请输入有效的电话号码"),
	description: z
		.string()
		.trim()
		.min(DESCRIPTION_MIN, `描述至少 ${DESCRIPTION_MIN} 个字`)
		.max(DESCRIPTION_MAX, `描述不超过 ${DESCRIPTION_MAX} 个字`),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

export const editTicketFormSchema = ticketFormSchema.extend({
	status: z.enum(TICKET_STATUSES),
});

export type EditTicketFormValues = z.infer<typeof editTicketFormSchema>;
