"use client";
import { Form } from "morphorm";
import * as z from "zod";

const formSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	fullName: z.string(),
});

const schema = z.object({
	name: z
		.string({ error: "Name is Required" })
		.min(1, "Name requires at least 1 character")
		.default(""),
	age: z.number({ error: "Age is Required" }).min(1, "Age Should be more than 0").default(0),
	tasks: z
		.array(
			z.object({
				title: z.string().min(1, "Title is required").default(""),
				notes: z.string().optional().default(""),
				priority: z.string().optional().default(""),
			}),
		)
		.min(1, "At least 1 task is required"),
});

export const FormWithArray = () => (
	<Form
		schema={schema}
		context={{ userRole: "admin" }}
		onSubmit={(e) => {
			console.log(e);
		}}
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
				disabled: ({ fieldValues }) => !fieldValues.name,
			},
			{
				name: "tasks.title",
				label: "Task Title",
				size: 6,

				type: "text",
			},
			{
				name: "tasks.notes",
				label: "Task Notes",
				type: "textarea",
				watch: ["tasks.title"],
				watchContext: ["userRole"],
				size: 6,
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
	<Form<typeof formSchema>
		schema={formSchema}
		fields={(autoFields) => {
			return autoFields.map((field) => ({
				...field,
				size: 4,
				...(field.name === "fullName"
					? {
							watch: ["firstName", "lastName"],
							placeholder: ({ fieldValues }) => `${fieldValues.firstName} ${fieldValues.lastName}`,
						}
					: {}),
			}));
		}}
	/>
);

export const FormWithObject = () => (
	<Form<typeof formSchema>
		schema={formSchema}
		fields={{
			firstName: { size: 6, type: "text" },
			lastName: { size: 6, type: "text" },
			fullName: {
				size: 12,
				type: "text",
				watch: ["firstName", "lastName"],
				disabled: ({ fieldValues }) => !fieldValues.firstName,
				placeholder: ({ fieldValues }) => `${fieldValues.firstName} ${fieldValues.lastName}`,
			},
		}}
	/>
);

export const FormWithContext = () => (
	<Form
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
);

export const FormWithObjectFunction = () => (
	<Form<typeof formSchema>
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
);
