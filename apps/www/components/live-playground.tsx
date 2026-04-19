// oxlint-disable curly
"use client";

import { useState, useMemo } from "react";
import { Form } from "morphorm";
import * as z from "zod";
import { CodeBlock } from "./code-block";

type Size = 4 | 6 | 8 | 12;
type FieldKey = "name" | "email" | "age" | "bio" | "subscribe";

const ALL_FIELDS: FieldKey[] = ["name", "email", "age", "bio", "subscribe"];
const SIZES: Size[] = [4, 6, 8, 12];

interface PlayState {
	active: FieldKey[];
	nameMin: number;
	ageMin: number;
	sizes: Record<FieldKey, Size>;
}

const INIT: PlayState = {
	active: ["name", "email", "subscribe"],
	nameMin: 2,
	ageMin: 18,
	sizes: { name: 6, email: 6, age: 4, bio: 12, subscribe: 12 },
};

function buildSchema(s: PlayState) {
	const shape: Record<string, z.ZodTypeAny> = {};
	if (s.active.includes("name"))
		shape.name = z.string().min(s.nameMin, `Min ${s.nameMin} char${s.nameMin !== 1 ? "s" : ""}`);
	if (s.active.includes("email")) shape.email = z.string().email("Valid email required");
	if (s.active.includes("age")) shape.age = z.number().min(s.ageMin, `Must be ${s.ageMin}+`);
	if (s.active.includes("bio")) shape.bio = z.string().optional();
	if (s.active.includes("subscribe")) shape.subscribe = z.boolean();
	if (Object.keys(shape).length === 0) shape._empty = z.string().optional();
	return z.object(shape);
}

function buildFields(s: PlayState) {
	const result: {
		name: string;
		label: string;
		type: "text" | "number" | "textarea" | "checkbox";
		size: Size;
	}[] = [];
	if (s.active.includes("name"))
		result.push({ name: "name", label: "Name", type: "text", size: s.sizes.name });
	if (s.active.includes("email"))
		result.push({ name: "email", label: "Email", type: "text", size: s.sizes.email });
	if (s.active.includes("age"))
		result.push({ name: "age", label: "Age", type: "number", size: s.sizes.age });
	if (s.active.includes("bio"))
		result.push({ name: "bio", label: "Bio", type: "textarea", size: s.sizes.bio });
	if (s.active.includes("subscribe"))
		result.push({
			name: "subscribe",
			label: "Subscribe to updates",
			type: "checkbox",
			size: s.sizes.subscribe,
		});
	return result;
}

function buildCode(s: PlayState) {
	const lines: string[] = [];
	lines.push('import { Form } from "morphorm"');
	lines.push('import * as z from "zod"');
	lines.push("");
	lines.push("const schema = z.object({");
	if (s.active.includes("name")) lines.push(`  name: z.string().min(${s.nameMin}),`);
	if (s.active.includes("email")) lines.push("  email: z.string().email(),");
	if (s.active.includes("age")) lines.push(`  age: z.number().min(${s.ageMin}),`);
	if (s.active.includes("bio")) lines.push("  bio: z.string().optional(),");
	if (s.active.includes("subscribe")) lines.push("  subscribe: z.boolean(),");
	lines.push("})");
	lines.push("");
	lines.push("export function MyForm() {");
	lines.push("  return (");
	lines.push("    <Form");
	lines.push("      schema={schema}");
	lines.push("      showSubmit");
	lines.push("      fields={[");
	if (s.active.includes("name"))
		lines.push(`        { name: "name", type: "text", size: ${s.sizes.name} },`);
	if (s.active.includes("email"))
		lines.push(`        { name: "email", type: "text", size: ${s.sizes.email} },`);
	if (s.active.includes("age"))
		lines.push(`        { name: "age", type: "number", size: ${s.sizes.age} },`);
	if (s.active.includes("bio"))
		lines.push(`        { name: "bio", type: "textarea", size: ${s.sizes.bio} },`);
	if (s.active.includes("subscribe"))
		lines.push(`        { name: "subscribe", type: "checkbox", size: ${s.sizes.subscribe} },`);
	lines.push("      ]}");
	lines.push("    />");
	lines.push("  )");
	lines.push("}");
	return lines.join("\n");
}

function SegBtn({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			onClick={onClick}
			className={`px-2.5 h-7 font-mono text-[11px] border transition-colors ${
				active
					? "border-accent/70 text-foreground bg-accent/10"
					: "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}

export function LivePlayground() {
	const [state, setState] = useState<PlayState>(INIT);

	const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

	const schema = useMemo(() => buildSchema(state), [state]);
	const fields = useMemo(() => buildFields(state), [state]);
	const code = useMemo(() => buildCode(state), [state]);

	const formKey = useMemo(
		() => [...state.active].sort().join(",") + "|" + state.nameMin + "|" + state.ageMin,
		[state.active, state.nameMin, state.ageMin],
	);

	const toggle = (key: FieldKey) => {
		setState((prev) => {
			const has = prev.active.includes(key);
			if (has && prev.active.length <= 1) return prev;
			const next = has ? prev.active.filter((k) => k !== key) : [...prev.active, key];
			return { ...prev, active: next };
		});
		setSubmitted(null);
	};

	const setSize = (key: FieldKey, size: Size) =>
		setState((prev) => ({ ...prev, sizes: { ...prev.sizes, [key]: size } }));

	return (
		<div className="border border-border overflow-hidden bg-card">
			<div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
				<div className="flex items-center gap-3">
					<div className="flex gap-1.5">
						<span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
						<span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
						<span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
					</div>
					<span className="font-mono text-[11px] text-muted-foreground">live-playground.tsx</span>
				</div>
				<span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest">
					interactive
				</span>
			</div>

			<div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-wrap gap-x-8 gap-y-4 items-start">
				<div>
					<div className="font-mono text-[9px] text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">
						schema fields
					</div>
					<div className="flex flex-wrap gap-1.5">
						{ALL_FIELDS.map((key) => (
							<button
								key={key}
								onClick={() => toggle(key)}
								className={`px-3 py-1.5 font-mono text-xs border transition-colors ${
									state.active.includes(key)
										? "border-accent/70 text-foreground bg-accent/10"
										: "border-border text-muted-foreground hover:border-accent/30 hover:text-foreground"
								}`}
							>
								{state.active.includes(key) ? "✓ " : ""}
								{key}
							</button>
						))}
					</div>
				</div>

				{(state.active.includes("name") || state.active.includes("age")) && (
					<div>
						<div className="font-mono text-[9px] text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">
							zod constraints
						</div>
						<div className="flex flex-wrap gap-4">
							{state.active.includes("name") && (
								<div className="flex items-center gap-2">
									<span className="font-mono text-[11px] text-muted-foreground">name.min</span>
									<div className="flex gap-1">
										{[1, 2, 3, 4, 5].map((v) => (
											<SegBtn
												key={v}
												active={state.nameMin === v}
												onClick={() => {
													setState((p) => ({ ...p, nameMin: v }));
													setSubmitted(null);
												}}
											>
												{v}
											</SegBtn>
										))}
									</div>
								</div>
							)}
							{state.active.includes("age") && (
								<div className="flex items-center gap-2">
									<span className="font-mono text-[11px] text-muted-foreground">age.min</span>
									<div className="flex gap-1">
										{[0, 13, 18, 21].map((v) => (
											<SegBtn
												key={v}
												active={state.ageMin === v}
												onClick={() => {
													setState((p) => ({ ...p, ageMin: v }));
													setSubmitted(null);
												}}
											>
												{v}
											</SegBtn>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				<div>
					<div className="font-mono text-[9px] text-muted-foreground/60 tracking-[0.2em] uppercase mb-2">
						field sizes (12-col grid)
					</div>
					<div className="flex flex-wrap gap-3">
						{state.active.map((key) => (
							<div
								key={key}
								className="flex items-center gap-2"
							>
								<span className="font-mono text-[11px] text-muted-foreground w-18">{key}</span>
								<div className="flex gap-1">
									{SIZES.map((s) => (
										<SegBtn
											key={s}
											active={state.sizes[key] === s}
											onClick={() => setSize(key, s)}
										>
											{s}
										</SegBtn>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
				<div className="flex flex-col">
					<div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-2 shrink-0">
						<span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
						<span className="font-mono text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
							generated code
						</span>
					</div>
					<div className="text-[12px] font-mono overflow-x-auto flex-1">
						<CodeBlock>{code}</CodeBlock>
					</div>
				</div>

				<div className="flex flex-col">
					<div className="px-4 py-2 border-b border-border bg-muted/10 flex items-center gap-2 shrink-0">
						<span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
						<span className="font-mono text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
							live preview
						</span>
					</div>
					<div className="p-8 flex-1">
						<Form
							key={formKey}
							schema={schema as z.ZodObject<z.ZodRawShape>}
							fields={fields as never}
							showSubmit
							onSubmit={(v) => setSubmitted(v as Record<string, unknown>)}
						/>
						{submitted && (
							<div className="mt-6 border border-border overflow-hidden">
								<div className="px-4 py-2 bg-muted/20 border-b border-border flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-[#28c840]" />
									<span className="font-mono text-[10px] text-accent tracking-[0.18em] uppercase">
										submitted
									</span>
								</div>
								<pre className="p-4 text-xs font-mono text-foreground/70 overflow-auto leading-relaxed">
									{JSON.stringify(submitted, null, 2)}
								</pre>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
