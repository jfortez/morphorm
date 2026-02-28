"use client";
import { Forma } from "morphorm";
import * as z from "zod";

const formSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	fullName: z.string(),
});

export const FormWithArray = () => (
	<div>
		<Forma<typeof formSchema>
			schema={formSchema}
			fields={[
				{
					name: "firstName",
					size: 6,
					type: "text",
				},
				{
					name: "lastName",
					size: 6,
					type: "text",
				},
				{
					name: "fullName",
					size: 12,
					type: "text",

					watch: ["firstName", "lastName"],
					disabled: ({ fieldValues }) => !fieldValues.firstName && !fieldValues.lastName,
				},
			]}
		/>
	</div>
);

export const FormWithFunction = () => (
	<div>
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
	<div>
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
	<div>
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
	<div>
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
