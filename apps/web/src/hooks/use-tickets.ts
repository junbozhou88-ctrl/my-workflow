import { useCallback, useEffect, useState } from "react";
import { listTickets, type Ticket } from "@/lib/api";

export type TicketsState = "loading" | "error" | "empty" | "ready";

/**
 * 查询当前用户工单列表，维护 loading/error/empty/ready 四态。
 * `refetch` 供新增/编辑/删除后刷新。
 */
export function useTickets() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [state, setState] = useState<TicketsState>("loading");

	const refetch = useCallback(async () => {
		setState("loading");
		try {
			const data = await listTickets();
			setTickets(data);
			setState(data.length === 0 ? "empty" : "ready");
		} catch {
			setState("error");
		}
	}, []);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { tickets, state, refetch, count: tickets.length };
}
