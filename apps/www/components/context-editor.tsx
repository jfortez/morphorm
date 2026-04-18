"use client";

type FieldDef =
	| { key: string; type: "boolean"; label: string }
	| { key: string; type: "select"; label: string; options: string[] }
	| { key: string; type: "text"; label: string };

interface ContextEditorProps {
	value: Record<string, unknown>;
	onChange: (next: Record<string, unknown>) => void;
	fields: FieldDef[];
}

export function ContextEditor({ value, onChange, fields }: ContextEditorProps) {
	const set = (key: string, val: unknown) => onChange({ ...value, [key]: val });

	return (
		<div className="mb-6 px-4 py-3 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
			<p className="font-mono text-[9px] tracking-[0.15em] uppercase text-neutral-400 dark:text-neutral-700 mb-3">
				context editor — edit values to see the form react
			</p>
			<div className="flex flex-wrap gap-x-5 gap-y-2.5">
				{fields.map((f) => {
					if (f.type === "boolean") {
						return (
							<label
								key={f.key}
								className="flex items-center gap-2.5 cursor-pointer select-none"
							>
								<button
									type="button"
									role="switch"
									aria-checked={!!value[f.key]}
									onClick={() => set(f.key, !value[f.key])}
									className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
										value[f.key]
											? "bg-neutral-900 dark:bg-white"
											: "bg-neutral-200 dark:bg-neutral-700"
									}`}
								>
									<span
										className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 transition-transform duration-200 ${
											value[f.key] ? "translate-x-4" : "translate-x-0"
										}`}
									/>
								</button>
								<span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
									{f.label}
								</span>
								<span
									className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
										value[f.key]
											? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
											: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600"
									}`}
								>
									{String(value[f.key])}
								</span>
							</label>
						);
					}

					if (f.type === "select") {
						return (
							<label
								key={f.key}
								className="flex items-center gap-2"
							>
								<span className="text-xs font-mono text-neutral-500 dark:text-neutral-500">
									{f.label}
								</span>
								<select
									value={String(value[f.key] ?? "")}
									onChange={(e) => set(f.key, e.target.value)}
									className="text-xs border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono focus:outline-none"
								>
									{f.options.map((o) => (
										<option
											key={o}
											value={o}
										>
											{o}
										</option>
									))}
								</select>
							</label>
						);
					}

					return (
						<label
							key={f.key}
							className="flex items-center gap-2"
						>
							<span className="text-xs font-mono text-neutral-500 dark:text-neutral-500">
								{f.label}
							</span>
							<input
								type="text"
								value={String(value[f.key] ?? "")}
								onChange={(e) => set(f.key, e.target.value)}
								className="text-xs border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 font-mono w-28 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
							/>
						</label>
					);
				})}
			</div>
		</div>
	);
}
