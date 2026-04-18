"use client";
import { useState } from "react";
import Link from "next/link";
import { Form } from "morphorm";
import * as z from "zod";
import type { FieldComponentProps } from "morphorm";
import { useFieldContext } from "morphorm";
import { ContextEditor } from "@/components/context-editor";
import { GitHub } from "@/components/github-icon";
import { ThemeToggle } from "@/components/theme-toggle";

const basicSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email required"),
	age: z.number().min(18, "Must be 18+"),
});

const arraySchema = z.object({
	tasks: z
		.array(z.object({ title: z.string().min(1, "Title is required"), completed: z.boolean() }))
		.min(1, "At least 1 task required"),
});

const nestedSchema = z.object({
	profile: z.object({
		name: z.string().min(1, "Name required"),
		email: z.string().email("Valid email required"),
	}),
	preferences: z.object({ theme: z.string(), notifications: z.boolean() }),
});

const CustomInput = (props: FieldComponentProps) => {
	const field = useFieldContext<string>();
	return (
		<input
			{...props}
			style={{
				border: "1.5px solid #6366f1",
				borderRadius: "6px",
				padding: "8px 12px",
				width: "100%",
				fontFamily: "inherit",
				fontSize: "14px",
				outline: "none",
				background: "#1e1b4b",
				color: "#a5b4fc",
			}}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};

const sections = [
	{ id: "basic", label: "Basic" },
	{ id: "arrays", label: "Arrays" },
	{ id: "nested", label: "Nested" },
	{ id: "custom", label: "Custom" },
	{ id: "watch", label: "Watch" },
	{ id: "context", label: "Context" },
	{ id: "submit", label: "Submit" },
	{ id: "initial", label: "Initial" },
];

function SectionNav({
	activeSection,
	onSectionChange,
}: {
	activeSection: string;
	onSectionChange: (id: string) => void;
}) {
	return (
		<nav className="flex flex-wrap gap-1.5 mb-12 p-1.5 bg-muted rounded-xl border border-border">
			{sections.map((s) => (
				<button
					key={s.id}
					onClick={() => onSectionChange(s.id)}
					className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
						activeSection === s.id
							? "bg-card text-foreground shadow-sm border border-border"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{s.label}
				</button>
			))}
		</nav>
	);
}

function FormCard({
	title,
	description,
	children,
	highlight = false,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	highlight?: boolean;
}) {
	return (
		<div
			className={`rounded-xl border transition-all duration-200 overflow-hidden ${
				highlight
					? "bg-card border-border shadow-lg"
					: "bg-card/80 border-border hover:border-foreground/20"
			}`}
		>
			<div className="px-7 py-5 border-b border-border">
				<h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-0.5">
					{title}
				</h3>
				{description && (
					<p className="text-xs text-muted-foreground leading-relaxed mt-1">{description}</p>
				)}
			</div>
			<div className="p-7">{children}</div>
		</div>
	);
}

function SubmitResult({ result }: { result: string }) {
	return (
		<div className="mt-6 rounded-xl overflow-hidden border border-border">
			<div className="px-5 py-3 bg-muted border-b border-border">
				<span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
					submitted values
				</span>
			</div>
			<pre className="p-5 text-xs font-mono overflow-auto text-foreground/80 bg-surface leading-relaxed">
				{result}
			</pre>
		</div>
	);
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
	return (
		<div className="mb-10">
			<h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
			<p className="text-muted-foreground mt-1.5 text-sm">{desc}</p>
		</div>
	);
}

function BasicFormsSection() {
	const [result, setResult] = useState("");
	const submit = (v: z.infer<typeof basicSchema>) => setResult(JSON.stringify(v, null, 2));

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Basic Forms"
				desc="Three ways to configure fields — array, object, or function."
			/>

			<FormCard
				title="Array Config"
				description="Ordered array of field definitions. Explicit control over every field."
			>
				<Form
					schema={basicSchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "firstName", label: "First Name", type: "text", size: 6 },
						{ name: "lastName", label: "Last Name", type: "text", size: 6 },
						{ name: "email", label: "Email", type: "text", size: 12 },
						{ name: "age", label: "Age", type: "number", size: 12 },
					]}
				/>
			</FormCard>

			<FormCard
				title="Object Config"
				description="Keyed object — override only the fields you care about."
			>
				<Form
					schema={basicSchema}
					onSubmit={submit}
					showSubmit
					fields={{
						firstName: { size: 6, type: "text" },
						lastName: { size: 6, type: "text" },
						email: { size: 12, type: "text" },
						age: { size: 12, type: "number" },
					}}
				/>
			</FormCard>

			<FormCard
				title="Function Config"
				description="Transform function — auto-generated fields passed in, return the final array."
			>
				<Form
					schema={basicSchema}
					onSubmit={submit}
					showSubmit
					fields={(fields) => fields.map((f) => ({ ...f, size: 6 as const }))}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function ArrayFieldsSection() {
	const [result, setResult] = useState("");
	const submit = (v: z.infer<typeof arraySchema>) => setResult(JSON.stringify(v, null, 2));

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Array Fields"
				desc="Dynamic lists — add and remove items at runtime."
			/>

			<FormCard
				title="Dynamic Tasks"
				description="Zod array schema renders add/remove UI automatically. Nested fields use dot-notation paths."
			>
				<Form
					schema={arraySchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "tasks.title", label: "Task Title", type: "text", size: 8 },
						{ name: "tasks.completed", label: "Done", type: "checkbox", size: 4 },
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function NestedFieldsSection() {
	const [result, setResult] = useState("");
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Nested Fields"
				desc="Deeply nested schemas via dot-notation paths."
			/>

			<FormCard
				title="Nested Objects"
				description="Use dot-notation (e.g. profile.name) to reference fields inside nested Zod objects."
			>
				<Form
					schema={nestedSchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "profile.name", label: "Profile Name", type: "text", size: 6 },
						{ name: "profile.email", label: "Profile Email", type: "text", size: 6 },
						{ name: "preferences.theme", label: "Theme", type: "text", size: 6 },
						{
							name: "preferences.notifications",
							label: "Notifications",
							type: "checkbox",
							size: 6,
						},
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function CustomComponentsSection() {
	const [result, setResult] = useState("");
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	const schema = z.object({
		username: z.string().min(1, "Required"),
		bio: z.string().optional(),
	});

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Custom Components"
				desc="Replace any field type with your own component."
			/>

			<FormCard
				title="Custom Input via useFieldContext"
				description="Pass a components map to override field types. useFieldContext() gives access to value, handleChange, handleBlur, and validation state."
			>
				<Form
					schema={schema}
					onSubmit={submit}
					showSubmit
					components={{ text: CustomInput }}
					fields={[
						{ name: "username", label: "Username", type: "text", size: 12 },
						{ name: "bio", label: "Bio", type: "text", size: 12 },
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function WatchDependenciesSection() {
	const [result, setResult] = useState("");
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	const placeholderSchema = z.object({
		firstName: z.string(),
		lastName: z.string(),
		fullName: z.string(),
	});
	const conditionalSchema = z.object({ agreeTerms: z.boolean(), signature: z.string() });
	const labelSchema = z.object({ country: z.string(), city: z.string() });

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Watch Dependencies"
				desc="Fields that react to changes in other fields — placeholder, label, disabled state."
			/>

			<FormCard
				title="Reactive Placeholder"
				description="The 'Full Name' field watches firstName and lastName. Its placeholder updates live via fieldValues — type in either field to see it react."
			>
				<Form
					schema={placeholderSchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "firstName", label: "First Name", type: "text", size: 6 },
						{ name: "lastName", label: "Last Name", type: "text", size: 6 },
						{
							name: "fullName",
							label: "Full Name",
							type: "text",
							size: 12,
							watch: ["firstName", "lastName"],
							placeholder: ({ fieldValues }) =>
								`e.g. ${fieldValues.firstName || "First"} ${fieldValues.lastName || "Last"}`,
						},
					]}
				/>
			</FormCard>

			<FormCard
				title="Conditional Disabled"
				description="'Signature' watches the checkbox. Check the box to unlock the field."
			>
				<Form
					schema={conditionalSchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{
							name: "agreeTerms",
							label: "I agree to the terms of service",
							type: "checkbox",
							size: 12,
						},
						{
							name: "signature",
							label: "Signature",
							type: "text",
							size: 12,
							watch: ["agreeTerms"],
							disabled: ({ fieldValues }) => !fieldValues.agreeTerms,
							placeholder: ({ fieldValues }) =>
								fieldValues.agreeTerms
									? "Type your full name as a signature"
									: "Accept the terms above to sign",
						},
					]}
				/>
			</FormCard>

			<FormCard
				title="Reactive Label"
				description="The city field's label updates based on what you type in country."
			>
				<Form
					schema={labelSchema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "country", label: "Country", type: "text", size: 6 },
						{
							name: "city",
							label: ({ fieldValues }) =>
								fieldValues.country ? `City in ${fieldValues.country}` : "City",
							type: "text",
							size: 6,
							watch: ["country"],
						},
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function ContextSection() {
	const [result, setResult] = useState("");
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	const [accessCtx, setAccessCtx] = useState<Record<string, unknown>>({
		isAdmin: false,
		tier: "free",
	});
	const [roleCtx, setRoleCtx] = useState<Record<string, unknown>>({ userRole: "user" });

	const accessSchema = z.object({
		publicField: z.string(),
		adminOnlyField: z.string(),
		proFeatureField: z.string(),
	});
	const labelSchema = z.object({ userField: z.string(), searchField: z.string() });

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Context"
				desc="External context flowing into field behavior. Edit values in real time to see fields react."
			/>

			<FormCard
				title="Context-based Access Control"
				description="Toggle isAdmin or change tier — fields update their labels, placeholders, and disabled state immediately."
			>
				<ContextEditor
					value={accessCtx}
					onChange={setAccessCtx}
					fields={[
						{ key: "isAdmin", type: "boolean", label: "isAdmin" },
						{ key: "tier", type: "select", label: "tier", options: ["free", "pro", "enterprise"] },
					]}
				/>
				<Form
					schema={accessSchema}
					onSubmit={submit}
					context={accessCtx}
					showSubmit
					fields={[
						{ name: "publicField", label: "Public Field", type: "text", size: 12 },
						{
							name: "adminOnlyField",
							label: ({ context }) =>
								context?.isAdmin ? "Admin Field (unlocked)" : "Admin Field (locked)",
							type: "text",
							size: 12,
							watchContext: ["isAdmin"],
							disabled: ({ context }) => !context?.isAdmin,
							placeholder: ({ context }) =>
								context?.isAdmin ? "Admin access granted" : "Requires admin role",
						},
						{
							name: "proFeatureField",
							label: ({ context }) =>
								context?.tier === "free"
									? "Pro Feature (upgrade to edit)"
									: `Pro Feature (${context?.tier})`,
							type: "text",
							size: 12,
							watchContext: ["tier"],
							disabled: ({ context }) => context?.tier === "free",
							placeholder: ({ context }) =>
								context?.tier === "free"
									? "Available on Pro and Enterprise plans"
									: "Pro feature unlocked",
						},
					]}
				/>
			</FormCard>

			<FormCard
				title="Context in Labels & Placeholders"
				description="Change the userRole to see labels and placeholders adapt instantly."
			>
				<ContextEditor
					value={roleCtx}
					onChange={setRoleCtx}
					fields={[
						{
							key: "userRole",
							type: "select",
							label: "userRole",
							options: ["user", "editor", "admin"],
						},
					]}
				/>
				<Form
					schema={labelSchema}
					onSubmit={submit}
					context={roleCtx}
					showSubmit
					fields={[
						{
							name: "userField",
							label: ({ context }) => {
								const r = context?.userRole;
								return r === "admin"
									? "Admin Display Name"
									: r === "editor"
										? "Editor Display Name"
										: "Your Display Name";
							},
							type: "text",
							size: 12,
							watchContext: ["userRole"],
							placeholder: ({ context }) => `Shown to others as a ${context?.userRole ?? "user"}`,
						},
						{
							name: "searchField",
							label: "Search Query",
							type: "text",
							size: 12,
							watchContext: ["userRole"],
							placeholder: ({ context }) => {
								const r = context?.userRole;
								if (r === "admin") {
									return "Search all users, content, and logs...";
								}
								if (r === "editor") {
									return "Search your content and drafts...";
								}
								return "Search public content...";
							},
						},
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function SubmitBehaviorSection() {
	const [result, setResult] = useState("");
	const [cancelCount, setCancelCount] = useState(0);
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	const schema = z.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Valid email required"),
	});

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Submit Behavior"
				desc="Submission, cancellation, and validation."
			/>

			<FormCard
				title="Enter Key Submit"
				description="Press Enter in any field to submit. Validation runs before onSubmit is called."
				highlight
			>
				<Form
					schema={schema}
					onSubmit={submit}
					showSubmit
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "email", label: "Email", type: "text", size: 12 },
					]}
				/>
			</FormCard>

			<FormCard
				title="Cancel Button"
				description="Cancel resets the form to initial values and fires onCancel."
			>
				<div className="flex items-baseline gap-2 mb-6">
					<span className="text-3xl font-bold tabular-nums text-foreground">{cancelCount}</span>
					<span className="text-sm text-muted-foreground">cancellations</span>
				</div>
				<Form
					schema={schema}
					onSubmit={submit}
					onCancel={() => setCancelCount((c) => c + 1)}
					showSubmit
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "email", label: "Email", type: "text", size: 12 },
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

function InitialValuesSection() {
	const [result, setResult] = useState("");
	const submit = (v: unknown) => setResult(JSON.stringify(v, null, 2));

	const schema = z.object({ name: z.string(), age: z.number(), active: z.boolean() });

	return (
		<section className="space-y-6">
			<SectionHeader
				title="Initial Values"
				desc="Pre-populate forms with default data."
			/>

			<FormCard
				title="With Defaults"
				description="Pass initialValues to pre-fill the form. Fields are fully editable — these are just starting values."
			>
				<Form
					schema={schema}
					onSubmit={submit}
					showSubmit
					initialValues={{ name: "John Doe", age: 30, active: true }}
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "age", label: "Age", type: "number", size: 12 },
						{ name: "active", label: "Active", type: "checkbox", size: 12 },
					]}
				/>
			</FormCard>

			{result && <SubmitResult result={result} />}
		</section>
	);
}

export default function ExamplesPage() {
	const [activeSection, setActiveSection] = useState("basic");

	return (
		<div className="min-h-screen bg-background font-[var(--font-geist-sans)]">
			<nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
				<div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
					<Link
						href="/"
						className="font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
					>
						← morphorm
					</Link>
					<div className="flex items-center gap-1">
						<a
							href="https://github.com"
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

			<div className="max-w-3xl mx-auto px-6 py-14">
				<header className="mb-10">
					<h1 className="text-3xl font-bold text-foreground tracking-tight">Examples</h1>
					<p className="text-muted-foreground mt-1.5 text-sm">Interactive demos of every feature</p>
				</header>

				<SectionNav
					activeSection={activeSection}
					onSectionChange={setActiveSection}
				/>

				<main>
					{activeSection === "basic" && <BasicFormsSection />}
					{activeSection === "arrays" && <ArrayFieldsSection />}
					{activeSection === "nested" && <NestedFieldsSection />}
					{activeSection === "custom" && <CustomComponentsSection />}
					{activeSection === "watch" && <WatchDependenciesSection />}
					{activeSection === "context" && <ContextSection />}
					{activeSection === "submit" && <SubmitBehaviorSection />}
					{activeSection === "initial" && <InitialValuesSection />}
				</main>

				<footer className="mt-20 pt-8 border-t border-border flex items-center justify-between">
					<span className="font-mono text-xs text-muted-foreground/30">morphorm</span>
					<Link
						href="/"
						className="font-mono text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors"
					>
						← back to home
					</Link>
				</footer>
			</div>
		</div>
	);
}
