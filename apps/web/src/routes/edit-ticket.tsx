import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FormShell } from "@/components/tickets/form-shell";
import { TicketForm } from "@/components/tickets/ticket-form";
import { useTickets } from "@/hooks/use-tickets";
import { TicketApiError, updateTicket } from "@/lib/api";
import type { EditTicketFormValues } from "@/lib/ticket-schema";

export const Route = createFileRoute("/edit-ticket")({
	validateSearch: (search: Record<string, unknown>): { id: string } => ({
		id: typeof search.id === "string" ? search.id : "",
	}),
	component: EditTicketPage,
});

function EditTicketPage() {
	const { id } = Route.useSearch();
	const navigate = useNavigate();
	const { tickets, state, refetch } = useTickets();
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const ticket = tickets.find((t) => t.id === id);

	const handleSubmit = async (values: EditTicketFormValues) => {
		setSubmitting(true);
		setServerError(null);
		try {
			await updateTicket(id, values);
			toast.success("工单已更新");
			await navigate({ to: "/" });
		} catch (error) {
			const message =
				error instanceof TicketApiError
					? error.message
					: "提交失败，请稍后重试";
			setServerError(message);
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	if (state === "loading") {
		return (
			<FormShell subtitle="正在加载工单信息…" title="编辑工单">
				<div className="px-[33px] pt-[30px] pb-[40px]">
					<div className="h-[300px] animate-pulse rounded-[12px] bg-white/8" />
				</div>
			</FormShell>
		);
	}

	if (state === "error") {
		return (
			<FormShell subtitle="加载工单失败，请稍后重试。" title="编辑工单">
				<div className="flex flex-col items-center gap-4 px-[33px] pt-[30px] pb-[40px] text-center">
					<p className="text-[15px] text-white/60">请检查网络连接后重试。</p>
					<button
						className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#95EA00] px-6 font-extrabold text-[#11160D] text-[15px]"
						onClick={() => {
							refetch();
						}}
						type="button"
					>
						重试
					</button>
				</div>
			</FormShell>
		);
	}

	if (!ticket) {
		return (
			<FormShell subtitle="未找到该工单，它可能已被删除。" title="编辑工单">
				<div className="flex flex-col items-center gap-4 px-[33px] pt-[30px] pb-[40px] text-center">
					<p className="text-[15px] text-white/60">
						工单不存在或不属于当前用户。
					</p>
					<Link
						className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#95EA00] px-6 font-extrabold text-[#11160D] text-[15px]"
						to="/"
					>
						返回列表
					</Link>
				</div>
			</FormShell>
		);
	}

	return (
		<FormShell subtitle="修改下方信息后提交，更新将立即生效。" title="编辑工单">
			<TicketForm
				defaultValues={{
					contactName: ticket.contactName,
					email: ticket.email,
					phone: ticket.phone,
					description: ticket.description,
					status: ticket.status,
				}}
				mode="edit"
				onCancel={() => {
					navigate({ to: "/" });
				}}
				onSubmit={(values) => {
					handleSubmit(values);
				}}
				serverError={serverError}
				submitting={submitting}
			/>
		</FormShell>
	);
}
