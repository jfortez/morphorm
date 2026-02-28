"use client";
import { Forma, type FieldsConfig } from "morphorm";
import * as z from "zod";

const formSchema = z.object({
	age: z.number(),
	name: z.string(),
	email: z.string(),
});

interface FormContext {
	userId: string;
	isAdmin: boolean;
}

// Test 1: Array mode - name typed as keyof schema ("age" | "email" | "name")
export const FormWithArray = () => (
	<div>
		<Forma
			schema={formSchema}
			fields={[
				{
					label: "age",
					name: "age",
					placeholder: "age",
					size: 6,
					type: "text",
				},
				{
					label: "name",
					name: "name",
					placeholder: "name",
					size: 6,
					type: "text",
				},
			]}
		/>
	</div>
);

// Test 2: Function mode - field.type is FieldType ("text" | "number" | "checkbox" | ...)
export const FormWithFunction = () => (
	<div>
		<Forma
			schema={formSchema}
			fields={(autoFields) => {
				return autoFields.map((field) => ({
					...field,
					size: 4,
					type: field.type,
				}));
			}}
		/>
	</div>
);

// Test 3: Object mode - partial transformations by field name
export const FormWithObject = () => (
	<div>
		<Forma
			schema={formSchema}
			fields={{
				name: { size: 6, label: "Full Name" },
				email: { size: 6 },
				age: (field) => ({ ...field, size: 12 }),
			}}
		/>
	</div>
);

// Test 4: With Context - use explicit generic parameters for proper type inference
// The order of generics is: Schema, Components, Context
export const FormWithContext = () => (
	<div>
		<Forma<typeof formSchema, {}, FormContext>
			schema={formSchema}
			context={{ userId: "123", isAdmin: true }}
			fields={(autoFields) => {
				return autoFields.map((field) => ({
					...field,
					size: 6,
					// context is typed as FormContext
					disabled: ({ context }) => !context.isAdmin,
					// watchContext infers keys: "userId" | "isAdmin"
					watchContext: ["userId"],
				}));
			}}
		/>
	</div>
);

// Alternative: Pre-define fields configuration with explicit types
const fieldsConfig: FieldsConfig<typeof formSchema, {}, FormContext> = (autoFields) => {
	return autoFields.map((field) => ({
		...field,
		size: 6,
		disabled: ({ context }) => !context.isAdmin,
		watchContext: ["userId"],
	}));
};

export const FormWithPreDefinedFields = () => (
	<div>
		<Forma<typeof formSchema, {}, FormContext>
			schema={formSchema}
			context={{ userId: "123", isAdmin: true }}
			fields={fieldsConfig}
		/>
	</div>
);
