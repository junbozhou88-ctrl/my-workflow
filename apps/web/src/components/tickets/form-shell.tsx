import { Link } from "@tanstack/react-router";
import { CircleCheckBig, Plus } from "lucide-react";
import type { ReactNode } from "react";

/** 新增/编辑工单页的共享视觉外壳（背景 + 顶栏 + 卡片头）。 */
export function FormShell({
	title,
	subtitle,
	children,
}: Readonly<{ title: string; subtitle: string; children: ReactNode }>) {
	return (
		<main className="min-h-screen overflow-x-hidden bg-[#0A0E11] text-white">
			<div className="relative isolate min-h-screen">
				<BlurredBackground />
				<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1336px] flex-col px-6 pt-[28px] pb-12">
					<TopBar />
					<section className="flex flex-1 items-start justify-center pt-[120px] sm:pt-[154px]">
						<div className="w-full max-w-[701px] overflow-hidden rounded-[18px] border border-white/14 bg-[rgba(31,34,38,0.94)] shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-[30px]">
							<div className="border-white/8 border-b px-[33px] pt-[35px] pb-[18px]">
								<div className="flex items-center gap-3">
									<HeaderIcon />
									<h1 className="font-extrabold text-[32px] text-white tracking-[-0.05em]">
										{title}
									</h1>
								</div>
								<p className="mt-[10px] font-semibold text-[#AAB08D] text-[15px] tracking-[-0.02em]">
									{subtitle}
								</p>
							</div>
							{children}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

function BlurredBackground() {
	return (
		<>
			<div className="absolute inset-0 bg-[#0B1013]" />
			<div className="absolute inset-x-0 top-0 h-[85px] border-white/[0.035] border-b bg-[linear-gradient(180deg,rgba(10,15,18,0.98)_0%,rgba(10,15,18,0.94)_100%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_37%,rgba(95,125,32,0.12)_0%,rgba(95,125,32,0.04)_8%,rgba(11,16,19,0)_16%)] blur-[15px]" />
			<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,15,0.12)_0%,rgba(8,12,15,0.24)_36%,rgba(8,12,15,0.36)_100%)]" />
			<div className="absolute inset-0 bg-[rgba(5,8,10,0.44)]" />
		</>
	);
}

function HeaderIcon() {
	return (
		<span className="relative inline-flex size-[37px] items-center justify-center text-[#95EA00]">
			<CircleCheckBig className="size-[33px]" strokeWidth={2.1} />
			<Plus
				className="absolute right-[-2px] bottom-[4px] size-[13px]"
				strokeWidth={2.6}
			/>
		</span>
	);
}

function TopBar() {
	return (
		<header className="flex items-center justify-between px-[38px]">
			<Link
				className="font-extrabold text-[#95EA00] text-[17px] tracking-[-0.045em]"
				to="/"
			>
				Ace Tennis Club
			</Link>
			<div className="size-[22px] rounded-full bg-[#95EA00]/18" />
		</header>
	);
}
