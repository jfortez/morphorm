"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Form } from "morphorm";
import * as z from "zod";
import { GitHub } from "@/components/github-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Copy, Check } from "lucide-react";
import { repo } from "../utils/info";
import { CodeExample } from "../components/code-example";

const demoSchema = z.object({
	name: z.string().min(1, "Name required"),
	email: z.string().email("Valid email required"),
	notify: z.boolean(),
});

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
		<div className="w-full max-w-md border border-border rounded-sm overflow-hidden">
			<div className="flex border-b border-border">
				{PKG_MANAGERS.map((p) => (
					<button
						key={p.id}
						onClick={() => setActive(p.id)}
						className={`px-3 py-2 font-mono text-xs transition-colors ${
							active === p.id
								? "text-foreground bg-muted"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
						}`}
					>
						{p.id}
					</button>
				))}
			</div>
			<div className="flex items-center gap-3 px-4 py-3 bg-card">
				<span className="text-muted-foreground font-mono text-sm select-none">$</span>
				<span className="flex-1 font-mono text-sm text-foreground">{current.cmd}</span>
				<button
					onClick={copy}
					className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Copy command"
				>
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
				</button>
			</div>
		</div>
	);
}

const features = [
	{
		tag: "schema-first",
		title: "Zero boilerplate",
		desc: "Define a Zod schema. Morphorm derives your fields, layout, and validation — automatically.",
		icon: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 15 15"
				fill="none"
			>
				<path
					d="M7.5 1L1 4v7l6.5 3L14 11V4L7.5 1z"
					stroke="currentColor"
					strokeWidth="1.2"
					strokeLinejoin="round"
				/>
				<path
					d="M1 4l6.5 3M7.5 7v7M14 4l-6.5 3"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>
		),
	},
	{
		tag: "reactive",
		title: "Watch system",
		desc: "Fields subscribe to other fields. Labels, placeholders, disabled — all update live without wiring.",
		icon: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 15 15"
				fill="none"
			>
				<circle
					cx="3"
					cy="7.5"
					r="1.5"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<circle
					cx="12"
					cy="7.5"
					r="1.5"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<circle
					cx="7.5"
					cy="3"
					r="1.5"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<path
					d="M4.5 7.5h3M9 7.5h3M7.5 4.5v6"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>
		),
	},
	{
		tag: "composable",
		title: "Bring your own",
		desc: "Override any field with your own component. Full access to field state via useFieldContext.",
		icon: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 15 15"
				fill="none"
			>
				<rect
					x="1"
					y="1"
					width="5"
					height="5"
					rx="1"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<rect
					x="9"
					y="1"
					width="5"
					height="5"
					rx="1"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<rect
					x="1"
					y="9"
					width="5"
					height="5"
					rx="1"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				<rect
					x="9"
					y="9"
					width="5"
					height="5"
					rx="1"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>
		),
	},
	{
		tag: "grid layout",
		title: "12-col grid",
		desc: "Responsive 12-column grid built in. Each field has a size prop. Fill spacers break rows.",
		icon: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 15 15"
				fill="none"
			>
				<path
					d="M1 3h13M1 7.5h13M1 12h13M5 1v13M10 1v13"
					stroke="currentColor"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
			</svg>
		),
	},
];

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-foreground/20 font-(--font-geist-sans)">
			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					backgroundImage: "radial-gradient(circle, var(--dot-color) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			<div
				className="fixed inset-0 pointer-events-none z-0"
				style={{
					background:
						"radial-gradient(ellipse 90% 55% at 50% 0%, transparent 40%, var(--background) 100%)",
				}}
			/>
			<div
				className="fixed top-0 left-1/2 -translate-x-1/2 w-150 h-75 pointer-events-none z-0"
				style={{
					background: "radial-gradient(ellipse at top, var(--glow-start) 0%, transparent 70%)",
				}}
			/>

			<div className="relative z-10">
				<nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
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
								className="px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
							>
								examples
							</Link>
							<a
								href={repo}
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
								aria-label="GitHub"
							>
								<GitHub className="w-4 h-4" />
							</a>
							<ThemeToggle />
						</div>
					</div>
				</nav>

				<section className="max-w-5xl mx-auto px-8 pt-32 pb-28">
					<motion.div
						variants={stagger}
						initial="hidden"
						animate="show"
						className="flex flex-col items-start gap-7"
					>
						<motion.div
							variants={slideUp}
							className="flex items-center gap-3"
						>
							<span className="h-px w-6 bg-border" />
							<span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
								alpha · v0.1
							</span>
						</motion.div>

						<div className="relative inline-block overflow-hidden">
							<h1 className="font-mono text-[clamp(4rem,12vw,8rem)] font-bold tracking-tight leading-none text-foreground">
								{"morphorm".split("").map((char, i) => (
									<motion.span
										key={i}
										className="inline-block"
										initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										transition={{
											duration: 0.6,
											delay: 0.05 + i * 0.065,
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
							className="text-muted-foreground text-xl leading-relaxed max-w-lg font-(--font-geist-sans)"
						>
							Type-safe, schema-driven forms for React.{" "}
							<span className="text-muted-foreground/60">
								Define once. Render everywhere. Zero boilerplate.
							</span>
						</motion.p>

						<motion.div
							variants={slideUp}
							className="flex flex-col  items-start gap-4 pt-1 w-full"
						>
							<InstallCommand />
							<div className="flex items-center gap-3">
								<Link
									href="/examples"
									className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-mono font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
								>
									examples →
								</Link>
								<a
									href={repo}
									target="_blank"
									rel="noopener noreferrer"
									className="px-5 py-2.5 border border-border text-muted-foreground text-sm font-mono hover:border-foreground/30 hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-2"
								>
									<GitHub className="w-3.5 h-3.5" />
									github
								</a>
							</div>
						</motion.div>
					</motion.div>
				</section>

				<div className="max-w-5xl mx-auto px-8">
					<div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
				</div>

				<section className="max-w-5xl mx-auto px-8 py-28">
					<motion.div
						variants={stagger}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
					>
						<motion.div
							variants={slideUp}
							className="mb-12"
						>
							<span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
								why morphorm
							</span>
						</motion.div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40">
							{features.map((f) => (
								<motion.div
									key={f.tag}
									variants={slideUp}
									className="bg-background p-7 flex flex-col gap-4 group hover:bg-muted/40 transition-colors"
								>
									<div className="text-muted-foreground group-hover:text-foreground/70 transition-colors">
										{f.icon}
									</div>
									<div>
										<span className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.2em] uppercase block mb-2">
											{f.tag}
										</span>
										<h3 className="text-foreground text-sm font-semibold mb-2">{f.title}</h3>
										<p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</section>

				<div className="max-w-5xl mx-auto px-8">
					<div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
				</div>

				<section className="max-w-5xl mx-auto px-8 py-28">
					<motion.div
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, margin: "-80px" }}
						variants={stagger}
					>
						<motion.div
							variants={slideUp}
							className="mb-10 flex items-end justify-between"
						>
							<div>
								<span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase block mb-2">
									live demo
								</span>
								<h2 className="text-2xl font-semibold text-foreground tracking-tight">
									Try it right now
								</h2>
							</div>
							<Link
								href="/examples"
								className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								more examples →
							</Link>
						</motion.div>

						<motion.div
							variants={fadeIn}
							className="border border-border bg-card/50 overflow-hidden"
						>
							<div className="flex items-center gap-2 px-5 py-3 bg-muted/60 border-b border-border">
								<div className="flex gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-border" />
									<span className="w-2.5 h-2.5 rounded-full bg-border" />
									<span className="w-2.5 h-2.5 rounded-full bg-border" />
								</div>
								<span className="ml-3 font-mono text-[11px] text-muted-foreground/50">
									{"<Form schema={demoSchema} showSubmit />"}
								</span>
							</div>
							<div className="p-8 max-w-lg mx-auto">
								<Form
									schema={demoSchema}
									showSubmit
									fields={[
										{ name: "name", label: "Name", type: "text", size: 6 },
										{ name: "email", label: "Email", type: "text", size: 6 },
										{ name: "notify", label: "Send me updates", type: "checkbox", size: 12 },
									]}
									onSubmit={(v) => console.log(v)}
								/>
							</div>
						</motion.div>
					</motion.div>
				</section>

				<div className="max-w-5xl mx-auto px-8">
					<div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
				</div>

				<section className="max-w-5xl mx-auto px-8 py-28">
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<div className="mb-10">
							<span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase block mb-2">
								get started
							</span>
							<h2 className="text-2xl font-semibold text-foreground tracking-tight">
								As simple as it looks
							</h2>
						</div>

						<div className="border border-border overflow-hidden">
							<div className="flex items-center justify-between px-5 py-3 bg-muted/60 border-b border-border">
								<div className="flex items-center gap-3">
									<div className="flex gap-1.5">
										<span className="w-2.5 h-2.5 rounded-full bg-border" />
										<span className="w-2.5 h-2.5 rounded-full bg-border" />
										<span className="w-2.5 h-2.5 rounded-full bg-border" />
									</div>
									<span className="font-mono text-[11px] text-muted-foreground">form.tsx</span>
								</div>
								<span className="font-mono text-[10px] text-border tracking-widest">morphorm</span>
							</div>
							<div className="text-[13px] font-mono overflow-x-auto leading-6 bg-card">
								<CodeExample />
							</div>
						</div>
					</motion.div>
				</section>

				<footer className="border-t border-border/60 px-8 py-8 max-w-5xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="font-mono text-xs text-muted-foreground/30">morphorm</span>
						<span className="font-mono text-xs text-muted-foreground/20">© 2025</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							href="/examples"
							className="font-mono text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
						>
							examples
						</Link>
						<a
							href={repo}
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground/30 hover:text-muted-foreground transition-colors"
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
