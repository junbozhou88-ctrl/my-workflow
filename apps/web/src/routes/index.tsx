import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/tickets/confirm-dialog";
import { StatusBadge } from "@/components/tickets/status-badge";
import { useTickets } from "@/hooks/use-tickets";
import { deleteTicket, type Ticket, TicketApiError } from "@/lib/api";
import { TICKET_LIMIT_PER_USER } from "@/lib/ticket-schema";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const footerLinks = ["隐私政策", "服务条款", "联赛规则", "联系我们"] as const;

function formatDateTime(epochMs: number): string {
	const d = new Date(epochMs);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function HomeComponent() {
	return (
		<main className="min-h-screen overflow-x-hidden bg-[#0A0E11] text-white">
			<div className="relative isolate min-h-screen">
				<BackgroundLayers />
				<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 pt-8 pb-12 sm:px-8 lg:px-0">
					<SiteHeader />
					<HeroSection />
					<TicketsSection />
					<footer className="mx-auto mt-auto flex w-[calc(100%-40px)] max-w-[1440px] flex-col gap-8 border-white/4 border-t pt-16 pb-5 text-white/78 lg:flex-row lg:items-end lg:justify-between lg:pt-[70px]">
						<div>
							<p className="font-bold text-[28px] text-white tracking-[-0.03em]">
								Ace Tennis Club
							</p>
							<p className="mt-4 text-[#8E938C] text-[18px]">
								© 2024 Ace 网球俱乐部. 保留所有权利。
							</p>
						</div>
						<nav
							aria-label="Footer"
							className="flex flex-wrap gap-x-10 gap-y-4 font-semibold text-[#D3D7CB] text-[16px]"
						>
							{footerLinks.map((item) => (
								<a
									className="transition-colors duration-150 hover:text-white"
									href="/"
									key={item}
								>
									{item}
								</a>
							))}
						</nav>
					</footer>
				</div>
			</div>
		</main>
	);
}

function TicketsSection() {
	const { tickets, state, refetch, count } = useTickets();
	const [pendingDelete, setPendingDelete] = useState<Ticket | null>(null);
	const [deleting, setDeleting] = useState(false);

	const atLimit = count >= TICKET_LIMIT_PER_USER;

	const handleDelete = async () => {
		if (!pendingDelete) {
			return;
		}
		setDeleting(true);
		try {
			await deleteTicket(pendingDelete.id);
			toast.success("工单已删除");
			setPendingDelete(null);
			await refetch();
		} catch (error) {
			const message =
				error instanceof TicketApiError
					? error.message
					: "删除失败，请稍后重试";
			toast.error(message);
			setPendingDelete(null);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<section className="mx-auto mt-12 w-[calc(100%-40px)] max-w-[1440px] rounded-[23px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.08)_18%,rgba(255,255,255,0.05)_100%)] px-5 pt-6 pb-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-[18px] sm:px-8 sm:pt-8 sm:pb-9 lg:px-[49px] lg:pt-[28px] lg:pb-[46px]">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<h2 className="font-extrabold text-[28px] text-white tracking-[-0.04em] drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)] sm:text-[40px] lg:text-[55px]">
						我的服务工单
					</h2>
					{atLimit ? (
						<p className="mt-2 font-semibold text-[#F2A9AB] text-[14px]">
							已达上限，最多只能创建 {TICKET_LIMIT_PER_USER} 条工单
						</p>
					) : null}
				</div>
				{atLimit ? (
					<button
						className="mt-1 inline-flex h-[60px] cursor-not-allowed items-center justify-center gap-4 self-start rounded-[18px] bg-[#95EA00]/40 px-7 font-semibold text-[#11160D]/70 text-[18px]"
						disabled
						title={`最多只能创建 ${TICKET_LIMIT_PER_USER} 条工单`}
						type="button"
					>
						<Plus className="size-[26px] stroke-[2.2]" />
						<span className="translate-y-[1px]">新增工单</span>
					</button>
				) : (
					<Link
						aria-label="新增工单"
						className="mt-1 inline-flex h-[60px] items-center justify-center gap-4 self-start rounded-[18px] bg-[#95EA00] px-7 font-semibold text-[#11160D] text-[18px] shadow-[0_8px_30px_rgba(149,234,0,0.22)] transition-transform duration-150 hover:scale-[1.01]"
						to="/new-ticket"
					>
						<Plus className="size-[26px] stroke-[2.2]" />
						<span className="translate-y-[1px]">新增工单</span>
					</Link>
				)}
			</div>

			<div className="mt-8">
				{state === "loading" ? <LoadingState /> : null}
				{state === "error" ? (
					<ErrorState
						onRetry={() => {
							refetch();
						}}
					/>
				) : null}
				{state === "empty" ? <EmptyState /> : null}
				{state === "ready" ? (
					<>
						<TicketTable onDelete={setPendingDelete} tickets={tickets} />
						<TicketCards onDelete={setPendingDelete} tickets={tickets} />
					</>
				) : null}
			</div>

			<ConfirmDialog
				confirmLabel="删除"
				description={`确定要删除「${pendingDelete?.contactName ?? ""}」的这条工单吗？此操作不可撤销。`}
				loading={deleting}
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => {
					handleDelete();
				}}
				open={pendingDelete !== null}
				title="删除工单"
			/>
		</section>
	);
}

function TicketTable({
	tickets,
	onDelete,
}: Readonly<{ tickets: Ticket[]; onDelete: (t: Ticket) => void }>) {
	return (
		<div className="hidden overflow-x-auto md:block">
			<table className="w-full min-w-[1140px] border-collapse">
				<thead>
					<tr className="border-white/10 border-b">
						<ColumnHeader className="w-[110px]">联系人</ColumnHeader>
						<ColumnHeader className="w-[300px]">邮箱</ColumnHeader>
						<ColumnHeader className="w-[180px]">电话</ColumnHeader>
						<ColumnHeader className="w-[260px]">描述</ColumnHeader>
						<ColumnHeader className="w-[120px]">状态</ColumnHeader>
						<ColumnHeader className="w-[180px]">创建时间</ColumnHeader>
						<ColumnHeader className="w-[160px]">操作</ColumnHeader>
					</tr>
				</thead>
				<tbody>
					{tickets.map((item) => (
						<tr
							className="border-white/8 border-b last:border-b-0"
							key={item.id}
						>
							<BodyCell className="pt-[28px] font-semibold text-white sm:text-[23px]">
								{item.contactName}
							</BodyCell>
							<BodyCell className="pt-[28px] text-white/78">
								{item.email}
							</BodyCell>
							<BodyCell className="pt-[28px] text-white/78">
								{item.phone}
							</BodyCell>
							<BodyCell className="max-w-[260px] truncate pt-[28px] text-white/76">
								{item.description}
							</BodyCell>
							<BodyCell className="pt-[28px]">
								<StatusBadge status={item.status} />
							</BodyCell>
							<BodyCell className="pt-[28px] text-white/60">
								{formatDateTime(item.createdAt)}
							</BodyCell>
							<BodyCell className="pt-[28px]">
								<div className="flex items-center gap-[14px]">
									<Link
										aria-label="编辑"
										className="inline-flex items-center gap-1.5 font-medium text-[15px] text-white/68 transition-colors hover:text-white"
										search={{ id: item.id }}
										to="/edit-ticket"
									>
										<Pencil className="size-[18px] stroke-[2.2]" />
										编辑
									</Link>
									<span className="text-white/18">|</span>
									<button
										aria-label="删除"
										className="inline-flex items-center gap-1.5 font-medium text-[15px] text-white/68 transition-colors hover:text-[#F2A9AB]"
										onClick={() => onDelete(item)}
										type="button"
									>
										<Trash2 className="size-[18px] stroke-[2.2]" />
										删除
									</button>
								</div>
							</BodyCell>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function TicketCards({
	tickets,
	onDelete,
}: Readonly<{ tickets: Ticket[]; onDelete: (t: Ticket) => void }>) {
	return (
		<div className="flex flex-col gap-4 md:hidden">
			{tickets.map((item) => (
				<article
					className="rounded-[16px] border border-white/12 bg-white/5 p-5"
					key={item.id}
				>
					<div className="flex items-start justify-between gap-3">
						<p className="font-bold text-[20px] text-white">
							{item.contactName}
						</p>
						<StatusBadge status={item.status} />
					</div>
					<dl className="mt-4 grid grid-cols-1 gap-2 text-[15px] text-white/72">
						<Row label="邮箱" value={item.email} />
						<Row label="电话" value={item.phone} />
						<Row label="描述" value={item.description} />
						<Row label="创建时间" value={formatDateTime(item.createdAt)} />
					</dl>
					<div className="mt-5 flex items-center gap-3">
						<Link
							className="inline-flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] border border-white/16 font-semibold text-[15px] text-white"
							search={{ id: item.id }}
							to="/edit-ticket"
						>
							<Pencil className="size-[17px] stroke-[2.2]" />
							编辑
						</Link>
						<button
							className="inline-flex h-[44px] flex-1 items-center justify-center gap-2 rounded-[12px] border border-[#E5484D]/40 font-semibold text-[#F2A9AB] text-[15px]"
							onClick={() => onDelete(item)}
							type="button"
						>
							<Trash2 className="size-[17px] stroke-[2.2]" />
							删除
						</button>
					</div>
				</article>
			))}
		</div>
	);
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
	return (
		<div className="flex gap-2">
			<dt className="shrink-0 text-white/40">{label}</dt>
			<dd className="break-words text-white/80">{value}</dd>
		</div>
	);
}

function LoadingState() {
	return (
		<div
			aria-busy="true"
			aria-label="加载中"
			className="flex flex-col gap-3"
			role="status"
		>
			{[0, 1, 2, 3].map((i) => (
				<div
					className="h-[56px] animate-pulse rounded-[12px] bg-white/8"
					key={i}
				/>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border border-white/14 border-dashed py-16 text-center">
			<p className="font-bold text-[22px] text-white">还没有工单</p>
			<p className="max-w-[420px] text-[15px] text-white/55">
				无论是课程咨询、场地预订还是装备问题，点击右上角「新增工单」开启你的第一条服务请求。
			</p>
		</div>
	);
}

function ErrorState({ onRetry }: Readonly<{ onRetry: () => void }>) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-[#E5484D]/30 bg-[#E5484D]/8 py-16 text-center">
			<p className="font-bold text-[20px] text-white">加载工单失败</p>
			<p className="text-[15px] text-white/60">请检查网络连接后重试。</p>
			<button
				className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#95EA00] px-6 font-extrabold text-[#11160D] text-[15px] transition-transform hover:scale-[1.01]"
				onClick={onRetry}
				type="button"
			>
				重试
			</button>
		</div>
	);
}

function BackgroundLayers() {
	return (
		<>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_13%,rgba(255,243,219,0.96)_0%,rgba(255,220,152,0.88)_6%,rgba(226,154,63,0.44)_16%,rgba(55,34,13,0.22)_30%,rgba(8,12,14,0.9)_46%,rgba(8,12,14,1)_100%)]" />
			<div className="absolute inset-x-0 top-0 h-[102px] border-white/18 border-b bg-[linear-gradient(180deg,#141515_0%,#181816_100%)]" />
			<div className="absolute top-[98px] left-1/2 h-[654px] w-full -translate-x-1/2 overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(35,24,10,0.12)_0%,rgba(20,18,13,0.34)_26%,rgba(5,8,7,0.74)_100%)]" />
				<div className="absolute top-[24px] left-1/2 h-[304px] w-[304px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,241,202,0.94)_26%,rgba(255,215,128,0.68)_44%,rgba(240,156,37,0.28)_62%,rgba(240,156,37,0)_78%)] blur-[14px]" />
				<div className="absolute top-[284px] left-1/2 h-[4px] w-[1498px] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.76)_10%,rgba(255,255,255,0.85)_50%,rgba(255,255,255,0.76)_90%,rgba(255,255,255,0)_100%)] opacity-90 blur-[1px]" />
				<div className="absolute inset-x-0 bottom-0 h-[222px] bg-[linear-gradient(180deg,rgba(92,122,18,0.14)_0%,rgba(72,94,15,0.3)_24%,rgba(60,90,16,0.62)_55%,rgba(17,33,11,0.92)_100%)]" />
				<div className="absolute inset-x-0 bottom-0 h-[210px] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(6,10,12,0.14)_25%,rgba(6,10,12,0.54)_70%,rgba(6,10,12,0.94)_100%)]" />
			</div>
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_57%,rgba(160,255,0,0.08)_0%,rgba(160,255,0,0)_30%)]" />
		</>
	);
}

function BodyCell({
	children,
	className,
}: Readonly<{ children: ReactNode; className?: string }>) {
	return (
		<td
			className={`whitespace-nowrap pb-[32px] text-[18px] leading-[1.5] tracking-[-0.02em] ${className ?? ""}`}
		>
			{children}
		</td>
	);
}

function ColumnHeader({
	children,
	className,
}: Readonly<{ children: ReactNode; className?: string }>) {
	return (
		<th
			className={`pb-4 text-left font-semibold text-[#D3D8C8] text-[15px] tracking-[-0.02em] ${className ?? ""}`}
			scope="col"
		>
			{children}
		</th>
	);
}

function HeroSection() {
	return (
		<section className="relative mx-auto w-full max-w-[1600px] pt-[244px] text-center">
			<h1 className="text-balance px-4 font-extrabold text-[42px] text-white tracking-[-0.06em] drop-shadow-[0_5px_6px_rgba(0,0,0,0.8)] sm:text-[64px] lg:text-[92px]">
				Ace 网球俱乐部服务中心
			</h1>
			<p className="mx-auto mt-5 max-w-[950px] text-balance px-6 font-semibold text-[#F4F1E5] text-[20px] tracking-[-0.03em] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] sm:text-[28px] lg:text-[42px]">
				您的精英训练、个性化指导和高级场地预订服务入口。
			</p>
		</section>
	);
}

function SiteHeader() {
	return (
		<header className="mx-auto flex w-[calc(100%-40px)] max-w-[1440px] items-center justify-between">
			<a
				className="font-extrabold text-[#95EA00] text-[26px] tracking-[-0.05em] drop-shadow-[0_0_12px_rgba(149,234,0,0.14)] sm:text-[30px]"
				href="/"
			>
				Ace Tennis Club
			</a>
			<div aria-hidden="true" className="size-11" />
		</header>
	);
}
