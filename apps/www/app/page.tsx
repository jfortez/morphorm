"use client";
import { useState } from "react";
import { Form } from "morphorm";
import * as z from "zod";
import type { FieldComponentProps } from "morphorm";
import { useFieldContext } from "morphorm";
import "morphorm/styles.css";

const basicSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Valid email required"),
	age: z.number().min(18, "Must be 18+"),
});

const arraySchema = z.object({
	tasks: z
		.array(
			z.object({
				title: z.string().min(1, "Title is required"),
				completed: z.boolean(),
			}),
		)
		.min(1, "At least 1 task required"),
});

const nestedSchema = z.object({
	profile: z.object({
		name: z.string().min(1, "Name required"),
		email: z.string().email("Valid email required"),
	}),
	preferences: z.object({
		theme: z.string(),
		notifications: z.boolean(),
	}),
});

const CustomInput = (props: FieldComponentProps) => {
	const field = useFieldContext<string>();
	return (
		<input
			{...props}
			className="custom-input"
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};

function SectionNav({
	sections,
	activeSection,
	onSectionChange,
}: {
	sections: { id: string; label: string }[];
	activeSection: string;
	onSectionChange: (id: string) => void;
}) {
	return (
		<nav className="flex flex-wrap gap-2 mb-12 p-1 bg-neutral-200/50 rounded-full">
			{sections.map((section) => (
				<button
					key={section.id}
					onClick={() => onSectionChange(section.id)}
					className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
						activeSection === section.id
							? "bg-neutral-900 text-white shadow-lg"
							: "bg-transparent text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
					}`}
				>
					{section.label}
				</button>
			))}
		</nav>
	);
}

function FormCard({ title, children, highlight = false }: { title: string; children: React.ReactNode; highlight?: boolean }) {
	return (
		<div className={`p-8 rounded-2xl border transition-all duration-200 ${
			highlight
				? "bg-white border-neutral-900 shadow-xl ring-2 ring-neutral-900/10"
				: "bg-neutral-50 border-neutral-200 hover:border-neutral-300 hover:shadow-md"
		}`}>
			<h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-6">{title}</h3>
			{children}
		</div>
	);
}

function SubmitResult({ result }: { result: string }) {
	return (
		<div className="mt-8 p-6 bg-neutral-900 text-white rounded-xl">
			<h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Submitted Values</h4>
			<pre className="text-sm font-mono overflow-auto">{result}</pre>
		</div>
	);
}

function BasicFormsSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: z.infer<typeof basicSchema>) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Basic Forms</h2>
				<p className="text-neutral-500 mt-2">Forms with different field configuration modes</p>
			</div>

			<FormCard title="Array Config">
				<Form
					schema={basicSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "firstName", label: "First Name", type: "text", size: 6 },
						{ name: "lastName", label: "Last Name", type: "text", size: 6 },
						{ name: "email", label: "Email", type: "text", size: 12 },
						{ name: "age", label: "Age", type: "number", size: 12 },
					]}
				/>
			</FormCard>

			<FormCard title="Object Config">
				<Form
					schema={basicSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={{
						firstName: { size: 6, type: "text" },
						lastName: { size: 6, type: "text" },
						email: { size: 12, type: "text" },
						age: { size: 12, type: "number" },
					}}
				/>
			</FormCard>

			<FormCard title="Function Config">
				<Form
					schema={basicSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={(fields) =>
						fields.map((f) => ({
							...f,
							size: 6,
							type: "text" as const,
						}))
					}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function ArrayFieldsSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: z.infer<typeof arraySchema>) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Array Fields</h2>
				<p className="text-neutral-500 mt-2">Dynamic lists with add and remove functionality</p>
			</div>

			<FormCard title="Dynamic Tasks">
				<Form
					schema={arraySchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "tasks.title", label: "Task Title", type: "text", size: 6 },
						{ name: "tasks.completed", label: "Done", type: "checkbox", size: 6 },
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function NestedFieldsSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Nested Fields</h2>
				<p className="text-neutral-500 mt-2">Object-based nested schema structures</p>
			</div>

			<FormCard title="Nested Objects">
				<Form
					schema={nestedSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "profile.name", label: "Profile Name", type: "text", size: 6 },
						{ name: "profile.email", label: "Profile Email", type: "text", size: 6 },
						{ name: "preferences.theme", label: "Theme", type: "text", size: 6 },
						{ name: "preferences.notifications", label: "Notifications", type: "checkbox", size: 6 },
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function CustomComponentsSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	const schema = z.object({
		customField: z.string().min(1, "Required"),
	});

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Custom Components</h2>
				<p className="text-neutral-500 mt-2">Using your own field components</p>
			</div>

			<FormCard title="Custom Input">
				<Form
					schema={schema}
					onSubmit={handleSubmit}
					showSubmit
					components={{ text: CustomInput }}
					fields={[{ name: "customField", label: "Custom Field", type: "text" }]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function WatchDependenciesSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	const watchSchema = z.object({
		firstName: z.string(),
		lastName: z.string(),
		fullName: z.string(),
		country: z.string(),
		city: z.string(),
		agreeTerms: z.boolean(),
		submitName: z.string(),
	});

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Watch Dependencies</h2>
				<p className="text-neutral-500 mt-2">Fields that react to changes in other fields</p>
			</div>

			<FormCard title="Computed Field">
				<Form
					schema={watchSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "firstName", label: "First Name", type: "text", size: 6 },
						{ name: "lastName", label: "Last Name", type: "text", size: 6 },
						{
							name: "fullName",
							label: "Full Name (Auto)",
							type: "text",
							size: 12,
							watch: ["firstName", "lastName"],
							disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
						},
					]}
				/>
			</FormCard>

			<FormCard title="Conditional Field">
				<Form
					schema={watchSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "agreeTerms", label: "I agree to terms", type: "checkbox", size: 12 },
						{
							name: "submitName",
							label: "Submit Button Label",
							type: "text",
							size: 12,
							watch: ["agreeTerms"],
							disabled: ({ fieldValues }) => !fieldValues.agreeTerms,
						},
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function ContextSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	const contextSchema = z.object({
		adminField: z.string(),
		userField: z.string(),
		searchField: z.string(),
	});

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Context</h2>
				<p className="text-neutral-500 mt-2">External context affecting field behavior</p>
			</div>

			<FormCard title="Context-based Disabled">
				<Form
					schema={contextSchema}
					onSubmit={handleSubmit}
					context={{ isAdmin: false }}
					showSubmit
					fields={[
						{
							name: "adminField",
							label: "Admin Field",
							type: "text",
							size: 12,
							disabled: ({ context }) => !context.isAdmin,
						},
					]}
				/>
			</FormCard>

			<FormCard title="Context in Labels">
				<Form
					schema={contextSchema}
					onSubmit={handleSubmit}
					context={{ userRole: "admin" }}
					showSubmit
					fields={[
						{
							name: "userField",
							label: ({ context }) =>
								context?.userRole === "admin" ? "Admin User Field" : "Regular User Field",
							type: "text",
							size: 12,
						},
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function SubmitBehaviorSection() {
	const [submitResult, setSubmitResult] = useState<string>("");
	const [cancelCount, setCancelCount] = useState<number>(0);

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	const handleCancel = () => {
		setCancelCount((c) => c + 1);
	};

	const submitSchema = z.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Valid email required"),
	});

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Submit Behavior</h2>
				<p className="text-neutral-500 mt-2">Testing form submission and validation</p>
			</div>

			<FormCard title="Enter Key Submit" highlight>
				<p className="text-sm text-neutral-500 mb-6">Press Enter in any field to submit the form</p>
				<Form
					schema={submitSchema}
					onSubmit={handleSubmit}
					showSubmit
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "email", label: "Email", type: "text", size: 12 },
					]}
				/>
			</FormCard>

			<FormCard title="Cancel Button">
				<p className="text-sm text-neutral-500 mb-4">Cancel resets the form and increments counter</p>
				<p className="text-2xl font-bold text-neutral-900 mb-6">{cancelCount}</p>
				<Form
					schema={submitSchema}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					showSubmit
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "email", label: "Email", type: "text", size: 12 },
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

function InitialValuesSection() {
	const [submitResult, setSubmitResult] = useState<string>("");

	const handleSubmit = (values: any) => {
		setSubmitResult(JSON.stringify(values, null, 2));
	};

	const initialSchema = z.object({
		name: z.string(),
		age: z.number(),
		active: z.boolean(),
	});

	return (
		<section className="space-y-10">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Initial Values</h2>
				<p className="text-neutral-500 mt-2">Pre-populated form fields</p>
			</div>

			<FormCard title="With Defaults">
				<Form
					schema={initialSchema}
					onSubmit={handleSubmit}
					showSubmit
					initialValues={{
						name: "John Doe",
						age: 30,
						active: true,
					}}
					fields={[
						{ name: "name", label: "Name", type: "text", size: 12 },
						{ name: "age", label: "Age", type: "number", size: 12 },
						{ name: "active", label: "Active", type: "checkbox", size: 12 },
					]}
				/>
			</FormCard>

			{submitResult && <SubmitResult result={submitResult} />}
		</section>
	);
}

export default function Home() {
	const [activeSection, setActiveSection] = useState<string>("basic");

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

	return (
		<div className="min-h-screen bg-neutral-100/50 py-16 px-6">
			<div className="max-w-3xl mx-auto">
				<header className="text-center mb-16">
					<h1 className="text-5xl font-bold text-neutral-900 tracking-tight">Morphorm</h1>
					<p className="text-neutral-500 mt-4 text-lg">Form library for React</p>
				</header>

				<SectionNav
					sections={sections}
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

				<footer className="mt-20 text-center text-sm text-neutral-400">
					Built with Morphorm
				</footer>
			</div>
		</div>
	);
}
