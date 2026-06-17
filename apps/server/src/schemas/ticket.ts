import { z } from "zod";
import { TICKET_STATUSES } from "../db/schema";

const PHONE_REGEX = /^[\d\s+()-]{6,20}$/;
const DESCRIPTION_MIN = 5;
const DESCRIPTION_MAX = 500;
const CONTACT_NAME_MAX = 50;

export const createTicketSchema = z.object({
	contactName: z.string().trim().min(1).max(CONTACT_NAME_MAX),
	email: z.email(),
	phone: z.string().trim().regex(PHONE_REGEX, "电话格式不正确"),
	description: z.string().trim().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
});

export const updateTicketSchema = createTicketSchema.extend({
	status: z.enum(TICKET_STATUSES),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
