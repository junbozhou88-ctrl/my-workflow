import { useEffect } from "react";

type ConfirmDialogProps = Readonly<{
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}>;

/**
 * 轻量二次确认弹窗（删除等破坏性操作用）。受控组件，键盘 Esc 取消。
 */
export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = "确认",
	cancelLabel = "取消",
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	useEffect(() => {
		if (!open) {
			return;
		}
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onCancel();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onCancel]);

	if (!open) {
		return null;
	}

	return (
		<div
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			role="dialog"
		>
			<button
				aria-label="关闭"
				className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
				onClick={onCancel}
				type="button"
			/>
			<div className="relative w-full max-w-[420px] rounded-[18px] border border-white/14 bg-[rgba(31,34,38,0.97)] px-7 pt-7 pb-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
				<h2 className="font-extrabold text-[22px] text-white tracking-[-0.03em]">
					{title}
				</h2>
				<p className="mt-3 text-[#AAB08D] text-[15px] leading-relaxed">
					{description}
				</p>
				<div className="mt-7 flex items-center justify-end gap-4">
					<button
						className="inline-flex h-[44px] items-center justify-center rounded-full px-5 font-bold text-[#D9DDCF] text-[15px] tracking-[-0.02em] transition-colors duration-150 hover:text-white disabled:opacity-50"
						disabled={loading}
						onClick={onCancel}
						type="button"
					>
						{cancelLabel}
					</button>
					<button
						className="inline-flex h-[44px] min-w-[100px] items-center justify-center rounded-full bg-[#E5484D] px-6 font-extrabold text-[15px] text-white tracking-[-0.02em] shadow-[0_8px_22px_rgba(229,72,77,0.25)] transition-transform duration-150 hover:scale-[1.01] disabled:opacity-60"
						disabled={loading}
						onClick={onConfirm}
						type="button"
					>
						{loading ? "处理中…" : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
