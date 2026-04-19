"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { GitHub } from "@/components/github-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Copy, Check } from "lucide-react";
import { BoxIcon, ZapIcon, BlocksIcon, LayoutPanelTopIcon } from "lucide-animated";
import { repo } from "../utils/info";
import { CodeExample } from "../components/code-example";
import { LivePlayground } from "../components/live-playground";

const stagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.07 } },
};

const slideUp = {
	hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
	show: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
	},
};

const fadeIn = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.6 } },
};

const PKG_MANAGERS = [
	{ id: "bun", cmd: "bun add morphorm" },
	{ id: "npm", cmd: "npm install morphorm" },
	{ id: "pnpm", cmd: "pnpm add morphorm" },
	{ id: "yarn", cmd: "yarn add morphorm" },
] as const;

const features = [
	{
		tag: "schema-first",
		title: "Zero boilerplate",
		desc: "Define a Zod schema. Morphorm derives your fields, layout, and validation — automatically.",
		icon: <BoxIcon size={16} />,
	},
	{
		tag: "reactive",
		title: "Watch system",
		desc: "Fields subscribe to other fields. Labels, placeholders, disabled — all update live without wiring.",
		icon: <ZapIcon size={16} />,
	},
	{
		tag: "composable",
		title: "Bring your own",
		desc: "Override any field with your own component. Full access to field state via useFieldContext.",
		icon: <BlocksIcon size={16} />,
	},
	{
		tag: "grid layout",
		title: "12-col grid",
		desc: "Responsive 12-column grid built in. Each field has a size prop. Fill spacers break rows.",
		icon: <LayoutPanelTopIcon size={16} />,
	},
];

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2">
			<span className="w-1 h-1 rounded-full bg-accent shrink-0" />
			<span className="font-mono text-[10px] text-muted-foreground tracking-[0.22em] uppercase">
				{children}
			</span>
		</div>
	);
}

function SectionHeader({
	label,
	title,
	action,
}: {
	label: string;
	title: string;
	action?: React.ReactNode;
}) {
	return (
		<motion.div
			variants={slideUp}
			className="mb-12 flex items-start justify-between gap-8"
		>
			<div className="flex flex-col gap-3">
				<SectionLabel>{label}</SectionLabel>
				<h2 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h2>
			</div>
			{action && <div className="shrink-0 pt-1">{action}</div>}
		</motion.div>
	);
}

function ChromeDots({ colored = false }: { colored?: boolean }) {
	return (
		<div className="flex gap-1.5">
			<span className={`w-2.5 h-2.5 rounded-full ${colored ? "bg-[#ff5f57]" : "bg-border"}`} />
			<span className={`w-2.5 h-2.5 rounded-full ${colored ? "bg-[#febc2e]" : "bg-border"}`} />
			<span className={`w-2.5 h-2.5 rounded-full ${colored ? "bg-[#28c840]" : "bg-border"}`} />
		</div>
	);
}

function WindowCard({
	label,
	badge,
	colored = false,
	footer,
	bodyClass,
	children,
}: {
	label: string;
	badge?: string;
	colored?: boolean;
	footer?: React.ReactNode;
	bodyClass?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="border border-border overflow-hidden bg-card">
			<div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
				<div className="flex items-center gap-3">
					<ChromeDots colored={colored} />
					<span className="font-mono text-[11px] text-muted-foreground">{label}</span>
				</div>
				{badge && (
					<span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest">
						{badge}
					</span>
				)}
			</div>
			<div className={bodyClass}>{children}</div>
			{footer && (
				<div className="border-t border-border px-5 py-2 bg-muted/20 flex items-center justify-between">
					{footer}
				</div>
			)}
		</div>
	);
}

function InstallCommand() {
	const [active, setActive] = useState<"bun" | "npm" | "pnpm" | "yarn">("bun");
	const [copied, setCopied] = useState(false);

	const current = PKG_MANAGERS.find((p) => p.id === active)!;

	const copy = () => {
		navigator.clipboard.writeText(current.cmd);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	};

	return (
		<div className="w-full max-w-md border border-border overflow-hidden bg-card">
			<div className="flex border-b border-border">
				{PKG_MANAGERS.map((p) => (
					<button
						key={p.id}
						onClick={() => setActive(p.id)}
						className={`relative px-3.5 py-2.5 font-mono text-xs transition-colors ${
							active === p.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						{p.id}
						{active === p.id && (
							<motion.span
								layoutId="tab-indicator"
								className="absolute bottom-0 left-0 right-0 h-px bg-accent"
							/>
						)}
					</button>
				))}
			</div>
			<div className="flex items-center gap-3 px-4 py-3">
				<span className="text-accent font-mono text-sm select-none">$</span>
				<span className="flex-1 font-mono text-sm text-foreground">{current.cmd}</span>
				<button
					onClick={copy}
					className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Copy command"
				>
					{copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
				</button>
			</div>
		</div>
	);
}

function Divider() {
	return (
		<div className="max-w-5xl mx-auto px-8">
			<div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
		</div>
	);
}

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-foreground/15 font-(--font-geist-sans)">
			<svg
				className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.032]"
				aria-hidden="true"
			>
				<filter id="grain-noise">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.72"
						numOctaves="4"
						stitchTiles="stitch"
						result="noise"
					/>
					<feColorMatrix
						in="noise"
						type="saturate"
						values="0"
					/>
				</filter>
				<rect
					width="100%"
					height="100%"
					filter="url(#grain-noise)"
				/>
			</svg>

			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					backgroundImage: "radial-gradient(circle, var(--dot-color) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>

			<div
				className="orb-a fixed pointer-events-none z-0"
				style={{
					top: "-20vh",
					left: "-14vw",
					width: "min(75vw, 950px)",
					height: "min(75vw, 950px)",
					background: "radial-gradient(circle at 38% 38%, var(--orb-a) 0%, transparent 62%)",
				}}
			/>

			<div
				className="orb-b fixed pointer-events-none z-0"
				style={{
					top: "-24vh",
					right: "-10vw",
					width: "min(54vw, 700px)",
					height: "min(54vw, 700px)",
					background: "radial-gradient(circle at 58% 36%, var(--orb-b) 0%, transparent 62%)",
				}}
			/>

			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					background:
						"radial-gradient(ellipse 110% 90% at 50% -5%, transparent 38%, var(--background) 76%)",
				}}
			/>

			<div
				className="fixed top-0 left-0 right-0 pointer-events-none z-0"
				style={{
					height: "62vh",
					background:
						"radial-gradient(ellipse 52% 85% at 50% 0%, var(--hero-beam) 0%, transparent 70%)",
				}}
			/>

			<div className="relative z-10">
				<nav className="sticky top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-md">
					<div className="max-w-5xl mx-auto px-8 h-12 flex items-center justify-between">
						<Link
							href="/"
							className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
						>
							morphorm
						</Link>
						<div className="flex items-center gap-1">
							<Link
								href="/examples"
								className="px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded transition-colors"
							>
								examples
							</Link>
							<a
								href={repo}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded transition-colors"
								aria-label="GitHub"
							>
								<GitHub className="w-4 h-4" />
							</a>
							<ThemeToggle />
						</div>
					</div>
				</nav>

				<section className="max-w-5xl mx-auto px-8 pt-32 pb-24">
					<motion.div
						variants={stagger}
						initial="hidden"
						animate="show"
						className="flex flex-col items-start gap-8"
					>
						<motion.div variants={slideUp}>
							<SectionLabel>alpha · v0.1</SectionLabel>
						</motion.div>

						<div className="relative inline-block overflow-hidden">
							<h1 className="font-mono text-[clamp(3.5rem,11vw,7.5rem)] font-bold tracking-tight leading-none text-foreground">
								{"morphorm".split("").map((char, i) => (
									<motion.span
										key={i}
										className="inline-block"
										initial={{ opacity: 0, y: 36, filter: "blur(12px)" }}
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										transition={{
											duration: 0.65,
											delay: 0.05 + i * 0.06,
											ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
										}}
									>
										{char}
									</motion.span>
								))}
							</h1>
						</div>

						<motion.p
							variants={slideUp}
							className="text-muted-foreground text-lg leading-relaxed max-w-md"
						>
							Type-safe, schema-driven forms for React. Define once, render everywhere — zero
							boilerplate.
						</motion.p>

						<motion.div
							variants={slideUp}
							className="flex flex-col items-start gap-5 w-full"
						>
							<InstallCommand />
							<div className="flex items-center gap-3">
								<Link
									href="/examples"
									className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-mono font-medium hover:bg-primary/85 transition-colors whitespace-nowrap"
								>
									examples →
								</Link>
								<a
									href={repo}
									target="_blank"
									rel="noopener noreferrer"
									className="px-5 py-2.5 border border-border text-muted-foreground text-sm font-mono hover:border-accent/40 hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-2"
								>
									<GitHub className="w-3.5 h-3.5" />
									github
								</a>
							</div>
						</motion.div>
					</motion.div>
				</section>

				<Divider />

				<section className="max-w-5xl mx-auto px-8 py-24">
					<motion.div
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
					>
						<SectionHeader
							label="why morphorm"
							title="Built different."
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/30">
							{features.map((f) => (
								<motion.div
									key={f.tag}
									variants={slideUp}
									className="group relative bg-background p-8 flex flex-col gap-5 hover:bg-muted/20 transition-colors"
								>
									<span className="absolute left-0 top-8 bottom-8 w-px bg-transparent group-hover:bg-accent/40 transition-colors" />
									<div className="flex items-start gap-4">
										<div className="p-2 rounded-sm bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors shrink-0">
											{f.icon}
										</div>
										<div className="pt-0.5">
											<span className="font-mono text-[9px] text-accent/60 tracking-[0.2em] uppercase block mb-1.5">
												{f.tag}
											</span>
											<h3 className="text-foreground text-sm font-semibold mb-2 leading-snug">
												{f.title}
											</h3>
											<p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</section>

				<Divider />

				<section className="max-w-5xl mx-auto px-8 py-24">
					<motion.div
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
					>
						<SectionHeader
							label="live demo"
							title="Try it right now"
							action={
								<Link
									href="/examples"
									className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									more examples →
								</Link>
							}
						/>

						<motion.div variants={fadeIn}>
							<LivePlayground />
						</motion.div>
					</motion.div>
				</section>

				<Divider />

				<section className="max-w-5xl mx-auto px-8 py-24">
					<motion.div
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
					>
						<SectionHeader
							label="get started"
							title="As simple as it looks"
						/>

						<motion.div variants={fadeIn}>
							<WindowCard
								label="form.tsx"
								badge="tsx"
								colored
								bodyClass="text-[13px] font-mono overflow-x-auto leading-6"
								footer={
									<>
										<div className="flex items-center gap-2">
											<span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
											<span className="font-mono text-[10px] text-muted-foreground">
												schema valid
											</span>
										</div>
										<span className="font-mono text-[10px] text-muted-foreground/40 tracking-widest">
											morphorm
										</span>
									</>
								}
							>
								<CodeExample />
							</WindowCard>
						</motion.div>
					</motion.div>
				</section>

				<footer className="border-t border-border/50 px-8 py-8 max-w-5xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="font-mono text-xs text-muted-foreground">morphorm</span>
						<span className="font-mono text-xs text-muted-foreground/50">© 2025</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							href="/examples"
							className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							examples
						</Link>
						<a
							href={repo}
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground/70 hover:text-foreground transition-colors"
							aria-label="GitHub"
						>
							<GitHub className="w-3.5 h-3.5" />
						</a>
					</div>
				</footer>
			</div>
		</div>
	);
}
