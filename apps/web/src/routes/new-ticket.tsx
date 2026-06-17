import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FormShell } from "@/components/tickets/form-shell";
import { TicketForm } from "@/components/tickets/ticket-form";
import { useTickets } from "@/hooks/use-tickets";
import { createTicket, TicketApiError } from "@/lib/api";
import type { EditTicketFormValues } from "@/lib/ticket-schema";

export const Route = createFileRoute("/new-ticket")({
	component: NewTicketPage,
});

function NewTicketPage() {
	const navigate = useNavigate();
	const { count, state } = useTickets();
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const handleSubmit = async (values: EditTicketFormValues) => {
		setSubmitting(true);
		setServerError(null);
		try {
			await createTicket({
				contactName: values.contactName,
				email: values.email,
				phone: values.phone,
				description: values.description,
			});
			toast.success("工单创建成功");
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
			<FormShell
				subtitle="请填写下方信息，我们的VIP客户经理将尽快与您联系。"
				title="新增工单"
			>
				<div className="px-[33px] pt-[30px] pb-[40px]">
					<div className="h-[300px] animate-pulse rounded-[12px] bg-white/8" />
				</div>
			</FormShell>
		);
	}

	return (
		<FormShell
			subtitle="请填写下方信息，我们的VIP客户经理将尽快与您联系。"
			title="新增工单"
		>
			<TicketForm
				currentCount={count}
				defaultValues={{
					contactName: "",
					email: "",
					phone: "",
					description: "",
					status: "pending",
				}}
				mode="create"
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
