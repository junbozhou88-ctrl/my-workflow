import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
	type EditTicketFormValues,
	editTicketFormSchema,
	STATUS_LABELS,
	TICKET_LIMIT_PER_USER,
	TICKET_STATUSES,
} from "@/lib/ticket-schema";

const inputClassName =
	"h-[50px] w-full rounded-[8px] border border-[#56616A] bg-[#F7F6F4] px-[15px] text-[16px] font-medium tracking-[-0.01em] text-[#191D1E] shadow-[inset_0_1px_1px_rgba(0,0,0,0.07)] outline-none placeholder:text-[#DADCD4] aria-[invalid=true]:border-[#E5484D]";

const textareaClassName =
	"h-[128px] w-full resize-none rounded-[8px] border border-[#46505A] bg-[#14191B] px-[15px] py-[14px] text-[16px] font-medium tracking-[-0.01em] text-[#ECEFE8] outline-none placeholder:text-[#454A48] aria-[invalid=true]:border-[#E5484D]";

const selectClassName =
	"h-[50px] w-full rounded-[8px] border border-[#46505A] bg-[#14191B] px-[15px] text-[16px] font-medium tracking-[-0.01em] text-[#ECEFE8] outline-none";

type TicketFormProps = Readonly<{
	mode: "create" | "edit";
	defaultValues: EditTicketFormValues;
	submitting: boolean;
	serverError?: string | null;
	currentCount?: number;
	onSubmit: (values: EditTicketFormValues) => void;
	onCancel: () => void;
}>;

export function TicketForm({
	mode,
	defaultValues,
	submitting,
	serverError,
	currentCount = 0,
	onSubmit,
	onCancel,
}: TicketFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<EditTicketFormValues>({
		resolver: zodResolver(editTicketFormSchema),
		defaultValues,
	});

	const atLimit = mode === "create" && currentCount >= TICKET_LIMIT_PER_USER;

	return (
		<form
			className="px-[33px] pt-[30px] pb-[33px]"
			onSubmit={handleSubmit(onSubmit)}
		>
			{serverError ? (
				<div className="mb-6 flex items-center gap-2 rounded-[10px] border border-[#E5484D]/40 bg-[#E5484D]/12 px-4 py-3 font-semibold text-[#F2A9AB] text-[14px]">
					<CircleAlert className="size-[16px] shrink-0" strokeWidth={2.2} />
					<span>{serverError}</span>
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-x-[26px] gap-y-[24px] sm:grid-cols-2">
				<Field
					error={errors.contactName?.message}
					htmlFor="contactName"
					label="联系人"
				>
					<input
						aria-invalid={Boolean(errors.contactName)}
						className={inputClassName}
						id="contactName"
						placeholder="请输入姓名"
						type="text"
						{...register("contactName")}
					/>
				</Field>
				<Field error={errors.phone?.message} htmlFor="phone" label="联系电话">
					<input
						aria-invalid={Boolean(errors.phone)}
						className={inputClassName}
						id="phone"
						placeholder="+86 123 4567 8900"
						type="tel"
						{...register("phone")}
					/>
				</Field>
				<Field
					className="sm:col-span-2"
					error={errors.email?.message}
					htmlFor="email"
					label="电子邮箱"
				>
					<input
						aria-invalid={Boolean(errors.email)}
						className={inputClassName}
						id="email"
						placeholder="example@club.com"
						type="email"
						{...register("email")}
					/>
				</Field>
				<Field
					className="sm:col-span-2"
					error={errors.description?.message}
					htmlFor="description"
					label="描述"
				>
					<textarea
						aria-invalid={Boolean(errors.description)}
						className={textareaClassName}
						id="description"
						placeholder="请详细描述您的问题或需求..."
						{...register("description")}
					/>
				</Field>
				{mode === "edit" ? (
					<Field
						className="sm:col-span-2"
						error={errors.status?.message}
						htmlFor="status"
						label="状态"
					>
						<select
							className={selectClassName}
							id="status"
							{...register("status")}
						>
							{TICKET_STATUSES.map((status) => (
								<option key={status} value={status}>
									{STATUS_LABELS[status]}
								</option>
							))}
						</select>
					</Field>
				) : null}
			</div>

			<div className="mt-[48px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{mode === "create" ? (
					<div
						className={`flex items-center gap-[9px] font-semibold text-[12px] tracking-[-0.01em] ${
							atLimit ? "text-[#F2A9AB]" : "text-[#8C917E]"
						}`}
					>
						<CircleAlert className="size-[15px]" strokeWidth={2.2} />
						<span>
							{atLimit
								? `已达上限，最多只能创建 ${TICKET_LIMIT_PER_USER} 条工单`
								: `工单数量限制: ${currentCount}/${TICKET_LIMIT_PER_USER}`}
						</span>
					</div>
				) : (
					<span />
				)}
				<div className="flex items-center gap-[19px]">
					<button
						className="inline-flex h-[48px] items-center justify-center rounded-full px-[19px] font-bold text-[#D9DDCF] text-[16px] tracking-[-0.03em] transition-colors duration-150 hover:text-white"
						onClick={onCancel}
						type="button"
					>
						取消
					</button>
					<button
						className="inline-flex h-[49px] min-w-[118px] items-center justify-center rounded-full bg-[#95EA00] px-[26px] font-extrabold text-[#11160D] text-[16px] tracking-[-0.03em] shadow-[0_8px_22px_rgba(149,234,0,0.21)] transition-transform duration-150 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
						disabled={submitting || atLimit}
						type="submit"
					>
						{submitting ? "提交中…" : "提交"}
					</button>
				</div>
			</div>
		</form>
	);
}

function Field({
	children,
	className,
	error,
	htmlFor,
	label,
}: Readonly<{
	children: ReactNode;
	className?: string;
	error?: string;
	htmlFor: string;
	label: string;
}>) {
	return (
		<div className={`block ${className ?? ""}`}>
			<label
				className="mb-[11px] block font-bold text-[#95EA00] text-[13px] tracking-[-0.015em]"
				htmlFor={htmlFor}
			>
				{label}
			</label>
			{children}
			{error ? (
				<span className="mt-[7px] block font-semibold text-[#F2A9AB] text-[13px]">
					{error}
				</span>
			) : null}
		</div>
	);
}
