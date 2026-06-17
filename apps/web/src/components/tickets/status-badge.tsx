import { STATUS_LABELS, type TicketStatus } from "@/lib/ticket-schema";

const STATUS_STYLES: Record<TicketStatus, string> = {
	processing:
		"border border-[#6A8B17] bg-[#80C71A]/20 text-[#A9F036] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
	pending:
		"border border-white/16 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
	completed:
		"border border-[#707861] bg-[#D9E1B0]/12 text-[#C5CF9D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
};

export function StatusBadge({ status }: Readonly<{ status: TicketStatus }>) {
	return (
		<span
			className={`inline-flex min-w-[84px] items-center justify-center rounded-full px-[15px] py-[7px] font-bold text-[14px] tracking-[-0.01em] ${STATUS_STYLES[status]}`}
		>
			{STATUS_LABELS[status]}
		</span>
	);
}
