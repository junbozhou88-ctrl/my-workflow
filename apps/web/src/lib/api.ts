import type {
	EditTicketFormValues,
	TicketFormValues,
	TicketStatus,
} from "@/lib/ticket-schema";
import { getClientUserId } from "@/lib/user-id";

const BASE_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export interface Ticket {
	contactName: string;
	createdAt: number;
	description: string;
	email: string;
	id: string;
	phone: string;
	status: TicketStatus;
	updatedAt: number;
	userId: string;
}

/** 携带服务端返回的错误码，供 UI 按码映射提示。 */
export class TicketApiError extends Error {
	readonly code: string;
	constructor(code: string, message: string) {
		super(message);
		this.name = "TicketApiError";
		this.code = code;
	}
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${BASE_URL}${path}`, {
			...init,
			headers: {
				"content-type": "application/json",
				"x-user-id": getClientUserId(),
				...init?.headers,
			},
		});
	} catch {
		throw new TicketApiError("NETWORK", "网络异常，请稍后重试");
	}

	if (res.status === 204) {
		return undefined as T;
	}

	const data: unknown = await res.json().catch(() => null);

	if (!res.ok) {
		const err =
			data && typeof data === "object" && "error" in data
				? (data as { error: { code: string; message: string } }).error
				: { code: "UNKNOWN", message: "请求失败" };
		throw new TicketApiError(err.code, err.message);
	}

	return data as T;
}

export function listTickets(): Promise<Ticket[]> {
	return apiFetch<Ticket[]>("/api/tickets");
}

export function createTicket(input: TicketFormValues): Promise<Ticket> {
	return apiFetch<Ticket>("/api/tickets", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function updateTicket(
	id: string,
	input: EditTicketFormValues
): Promise<Ticket> {
	return apiFetch<Ticket>(`/api/tickets/${id}`, {
		method: "PUT",
		body: JSON.stringify(input),
	});
}

export function deleteTicket(id: string): Promise<void> {
	return apiFetch<void>(`/api/tickets/${id}`, { method: "DELETE" });
}
