"use client";
import { Forma } from "morphorm";
import "morphorm/styles.css";
import * as z from "zod";

const formSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	fullName: z.string(),
});

const schema = z.object({
	name: z.string(),
	age: z.number(),
	tasks: z.array(
		z.object({
			title: z.string(),
			notes: z.string().optional(),
			priority: z.string().optional(),
		}),
	),
});

export const FormWithArray = () => (
	<Forma
		schema={schema}
		context={{ userRole: "admin" }}
		fields={[
			{
				name: "name",
				label: "Name",
				type: "text",
			},
			{
				name: "age",
				label: "Age",
				type: "number",
				watch: ["name"],
			},
			{
				name: "tasks.title",
				label: "Task Title",
				type: "text",
			},
			{
				name: "tasks.notes",
				label: "Task Notes",
				type: "textarea",
				watch: ["tasks.title"],
				watchContext: ["userRole"],
				disabled: ({ fieldValues }) => !fieldValues.tasks.title,
				placeholder: ({ context }) =>
					context?.userRole ? `Add notes for ${context.userRole}...` : "Add notes...",
			},
			{
				name: "tasks.priority",
				label: ({ context }) => (context?.userRole ? `Priority (${context.userRole})` : "Priority"),
				type: "text",
				watchContext: ["userRole"],
			},
		]}
		showSubmit
	/>
);

export const FormWithFunction = () => (
	<div data-testid="form-function-container">
		<Forma<typeof formSchema>
			schema={formSchema}
			fields={(autoFields) => {
				return autoFields.map((field) => ({
					...field,
					size: 4,
					...(field.name === "fullName" ? { watch: ["firstName", "lastName"] } : {}),
				}));
			}}
		/>
	</div>
);

export const FormWithObject = () => (
	<div data-testid="form-object-container">
		<Forma<typeof formSchema>
			schema={formSchema}
			fields={{
				firstName: { size: 6, type: "text" },
				lastName: { size: 6, type: "text" },
				fullName: {
					size: 12,
					type: "text",
					watch: ["firstName", "lastName"],
					disabled: ({ fieldValues }) => !fieldValues.firstName,
				},
			}}
		/>
	</div>
);

export const FormWithContext = () => (
	<div data-testid="form-context-container">
		<Forma
			schema={formSchema}
			context={{ userId: "123", isAdmin: true }}
			fields={[
				{
					name: "isActive",
					type: "checkbox",
					size: 6,
				},
				{
					name: "age",
					type: "number",
					size: 6,
					watch: ["isActive"],
					disabled: ({ context }) => !context.isAdmin,
					watchContext: ["isAdmin"],
				},
			]}
		/>
	</div>
);

export const FormWithObjectFunction = () => (
	<div data-testid="form-object-function-container">
		<Forma<typeof formSchema>
			schema={formSchema}
			fields={{
				firstName: { size: 6, type: "text" },
				lastName: (field) => ({
					...field,
					size: 6,
				}),
				fullName: {
					size: 12,
					type: "text",
					watch: ["firstName", "lastName"],
					disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
				},
			}}
		/>
	</div>
);
