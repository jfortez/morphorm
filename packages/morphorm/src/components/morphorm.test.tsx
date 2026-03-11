import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { Form } from "./morphorm";
import { useForm, Provider } from "./provider";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
import { FormSubmit } from "./submit";
import { generateGrid } from "../core/layout";
import * as z from "zod";

const basicSchema = z.object({
	age: z.number().min(0).optional(),
	email: z.string().email("should be a valid email"),
	name: z.string().min(1, "Name is required"),
});

describe("Morphorm", () => {
	const mockSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Grid Generation", () => {
		it("uses default size 12 when field size is undefined", () => {
			const rows = generateGrid([
				{
					mode: "value",
					name: "name",
					schema: [],
					type: "text",
				},
			] as any);

			expect(rows).toHaveLength(1);
			expect(rows[0]![0]!.size).toBe(12);
			expect(rows[0]!).toHaveLength(1);
		});

		it("creates filler placeholder and starts a new row when using spacer type fill", () => {
			const rows = generateGrid([
				{
					mode: "value",
					name: "first",
					schema: [],
					size: 3,
					type: "text",
				},
				{
					type: "fill",
				},
				{
					mode: "value",
					name: "second",
					schema: [],
					size: 6,
					type: "text",
				},
			] as any);

			expect(rows).toHaveLength(2);
			expect(rows[0]![0]!.name).toBe("first");
			expect(rows[0]![0]!.size).toBe(3);
			expect(rows[0]![1]!.type).toBe("hidden");
			expect(rows[0]![1]!.size).toBe(9);
			expect(rows[1]![0]!.name).toBe("second");
			expect(rows[1]![0]!.size).toBe(6);
			expect(rows[1]![1]!.type).toBe("hidden");
			expect(rows[1]![1]!.size).toBe(6);
		});
	});

	describe("Basic Rendering", () => {
		it("renders form with auto-generated fields from schema", () => {
			render(
				<Form
					schema={basicSchema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
			expect(screen.getByTestId("field-age")).toBeInTheDocument();
			expect(screen.getByTestId("input-name")).toBeInTheDocument();
			expect(screen.getByTestId("input-email")).toBeInTheDocument();
			expect(screen.getByTestId("number-age")).toBeInTheDocument();
		});

		it("renders with custom fields configuration (array mode)", () => {
			render(
				<Form
					schema={basicSchema}
					fields={[
						{
							label: "Full Name",
							name: "name",
							placeholder: "Enter your full name",
							type: "text",
						},
						{
							label: "Email Address",
							name: "email",
							type: "text",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("input-name")).toHaveAttribute(
				"placeholder",
				"Enter your full name",
			);
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
		});
	});

	describe("Fields Configuration - Function Mode", () => {
		it("transforms all auto-generated fields using function", () => {
			render(
				<Form
					schema={basicSchema}
					fields={(autoFields) => {
						return autoFields.map((field) => ({
							...field,
							size: 6,
							label: `Modified ${field.label}`,
							type: "text",
						}));
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-name")).toHaveTextContent(/modified name/i);
			expect(screen.getByTestId("label-email")).toHaveTextContent(/modified email/i);
			expect(screen.getByTestId("label-age")).toHaveTextContent(/modified age/i);
			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
			expect(screen.getByTestId("field-age")).toBeInTheDocument();
		});

		it("filters fields using function transformer", () => {
			render(
				<Form
					schema={basicSchema}
					fields={(autoFields) => {
						return autoFields
							.filter((field) => field.name !== "age")
							.map((field) => ({ ...field, type: "text" }));
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
			expect(screen.queryByTestId("field-age")).not.toBeInTheDocument();
		});

		it("reorders fields using function transformer", () => {
			render(
				<Form
					schema={basicSchema}
					fields={(autoFields) => {
						const reordered = [...autoFields].reverse();
						return reordered.map((field) => ({ ...field, type: "text" }));
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const fields = screen.getAllByTestId(/field-/);
			expect(fields.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("Fields Configuration - Object Mode", () => {
		it("transforms specific fields using object with partial values", () => {
			render(
				<Form
					schema={basicSchema}
					fields={{
						name: { size: 6, label: "Custom Name Label" },
						email: { size: 6 },
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-name")).toHaveTextContent(/custom name label/i);
			expect(screen.getByTestId("label-email")).toBeInTheDocument();
			expect(screen.getByTestId("label-age")).toBeInTheDocument();
		});

		it("transforms specific fields using object with functions", () => {
			render(
				<Form
					schema={basicSchema}
					fields={{
						name: (field) => ({
							...field,
							size: 4,
							label: `Func: ${field.label}`,
						}),
						email: (field) => ({
							...field,
							size: 4,
						}),
						age: (field) => ({
							...field,
							size: 4,
						}),
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-name")).toHaveTextContent(/func: name/i);
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
			expect(screen.getByTestId("field-age")).toBeInTheDocument();
		});

		it("mixes partial values and function transformations in object mode", () => {
			render(
				<Form
					schema={basicSchema}
					fields={{
						name: { size: 6, label: "Static Override" },
						email: (field) => ({
							...field,
							size: 6,
							label: "Dynamic Override",
						}),
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-name")).toHaveTextContent(/static override/i);
			expect(screen.getByTestId("label-email")).toHaveTextContent(/dynamic override/i);
			expect(screen.getByTestId("field-age")).toBeInTheDocument();
		});

		it("preserves unmodified fields when using object mode", () => {
			render(
				<Form
					schema={basicSchema}
					fields={{
						name: { size: 6, label: "Custom Name Label" },
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-name")).toHaveTextContent(/custom name label/i);
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
			expect(screen.getByTestId("field-age")).toBeInTheDocument();
		});

		it("function transformer can return undefined to skip modifications", () => {
			render(
				<Form
					schema={basicSchema}
					fields={{
						name: () => undefined,
						email: { size: 6 },
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
		});
	});

	describe("Fields Configuration - Array Mode with Transformations", () => {
		it("supports spacer type (fill) in array mode", () => {
			render(
				<Form
					schema={basicSchema}
					fields={[
						{
							label: "Name",
							name: "name",
							size: 6,
							type: "text",
						},
						{ type: "fill" },
						{
							label: "Email",
							name: "email",
							size: 6,
							type: "text",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("field-email")).toBeInTheDocument();
		});
	});

	describe("Watch and Field Dependencies", () => {
		it("disables field when watched fields are empty", () => {
			const schema = z.object({
				firstName: z.string(),
				lastName: z.string(),
				fullName: z.string(),
			});

			render(
				<Form
					schema={schema}
					fields={[
						{ name: "firstName", type: "text", size: 6 },
						{ name: "lastName", type: "text", size: 6 },
						{
							name: "fullName",
							type: "text",
							size: 12,
							watch: ["firstName", "lastName"],
							disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const fullNameInput = screen.getByTestId("input-fullName") as HTMLInputElement;
			expect(fullNameInput.disabled).toBe(true);
		});

		it("updates label based on watched field values", () => {
			const schema = z.object({
				country: z.string(),
				city: z.string(),
			});

			render(
				<Form
					schema={schema}
					fields={[
						{ name: "country", type: "text", size: 6 },
						{
							name: "city",
							type: "text",
							size: 6,
							watch: ["country"],
							label: ({ fieldValues }) =>
								fieldValues.country ? `City in ${fieldValues.country}` : "City",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-city")).toHaveTextContent(/city/i);
		});

		it("enables field only when specific watched field has value", () => {
			const schema = z.object({
				agreeToTerms: z.boolean(),
				submitButton: z.string(),
			});

			render(
				<Form
					schema={schema}
					fields={[
						{ name: "agreeToTerms", type: "checkbox", size: 12 },
						{
							name: "submitButton",
							type: "text",
							size: 12,
							watch: ["agreeToTerms"],
							disabled: ({ fieldValues }) => !fieldValues.agreeToTerms,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const submitInput = screen.getByTestId("input-submitButton") as HTMLInputElement;
			expect(submitInput.disabled).toBe(true);
		});
	});

	describe("WatchContext and External Context", () => {
		it("disables field based on context value", () => {
			const schema = z.object({
				adminField: z.string(),
			});

			render(
				<Form
					schema={schema}
					context={{ isAdmin: false }}
					fields={[
						{
							name: "adminField",
							type: "text",
							size: 12,
							disabled: ({ context }) => !context.isAdmin,
							watchContext: ["isAdmin"],
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const adminInput = screen.getByTestId("input-adminField") as HTMLInputElement;
			expect(adminInput.disabled).toBe(true);
		});

		it("shows different label based on context", () => {
			const schema = z.object({
				userField: z.string(),
			});

			render(
				<Form
					schema={schema}
					context={{ userRole: "guest" }}
					fields={[
						{
							name: "userField",
							type: "text",
							size: 12,
							label: ({ context }) =>
								context.userRole === "admin"
									? "Admin Configuration"
									: context.userRole === "user"
										? "User Settings"
										: "Guest Information",
							watchContext: ["userRole"],
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("label-userField")).toHaveTextContent(/guest information/i);
		});

		it("updates placeholder based on context", () => {
			const schema = z.object({
				searchField: z.string(),
			});

			render(
				<Form
					schema={schema}
					context={{ searchType: "products" }}
					fields={[
						{
							name: "searchField",
							type: "text",
							size: 12,
							placeholder: ({ context }) => `Search ${context.searchType}...`,
							watchContext: ["searchType"],
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("input-searchField")).toHaveAttribute(
				"placeholder",
				"Search products...",
			);
		});

		it("combines watch and watchContext for complex logic", () => {
			const schema = z.object({
				amount: z.number(),
				discountCode: z.string(),
			});

			render(
				<Form
					schema={schema}
					context={{ isPremiumUser: true, maxDiscount: 50 }}
					fields={[
						{ name: "amount", type: "number", size: 6 },
						{
							name: "discountCode",
							type: "text",
							size: 6,
							watch: ["amount"],
							watchContext: ["isPremiumUser", "maxDiscount"],
							disabled: ({ fieldValues, context }) => !fieldValues.amount || !context.isPremiumUser,
							description: ({ context }) =>
								context.isPremiumUser
									? `Max discount: ${context.maxDiscount}%`
									: "Premium users only",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const discountInput = screen.getByTestId("input-discountCode") as HTMLInputElement;
			expect(discountInput.disabled).toBe(true);
			expect(screen.getByTestId("description-discountCode")).toHaveTextContent(
				/max discount: 50%/i,
			);
		});
	});

	describe("Interactive Field Dependencies", () => {
		it("renders with dynamic placeholder based on initial values", () => {
			const schema = z.object({
				firstName: z.string(),
				lastName: z.string(),
				fullName: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						firstName: "John",
						lastName: "Doe",
						fullName: "",
					}}
					fields={[
						{
							name: "firstName",
							type: "text",
							size: 6,
							label: "First Name",
						},
						{
							name: "lastName",
							type: "text",
							size: 6,
							label: "Last Name",
						},
						{
							name: "fullName",
							type: "text",
							size: 12,
							label: "Full Name",
							watch: ["firstName", "lastName"],
							placeholder: ({ fieldValues }) => {
								const first = fieldValues.firstName || "First";
								const last = fieldValues.lastName || "Last";
								return `${first} ${last}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const fullNameInput = screen.getByTestId("input-fullName") as HTMLInputElement;
			expect(fullNameInput.disabled).toBe(false);
			expect(fullNameInput.placeholder).toBe("John Doe");
			expect(fullNameInput).toHaveValue("");
		});

		it("renders with disabled field when watch values are empty", () => {
			const schema = z.object({
				firstName: z.string(),
				lastName: z.string(),
				fullName: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						firstName: "",
						lastName: "",
						fullName: "",
					}}
					fields={[
						{
							name: "firstName",
							type: "text",
							size: 6,
							label: "First Name",
						},
						{
							name: "lastName",
							type: "text",
							size: 6,
							label: "Last Name",
						},
						{
							name: "fullName",
							type: "text",
							size: 12,
							label: "Full Name",
							watch: ["firstName", "lastName"],
							placeholder: ({ fieldValues }) => {
								const first = fieldValues.firstName || "Enter first name";
								const last = fieldValues.lastName || "Enter last name";
								return `${first} ${last}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const fullNameInput = screen.getByTestId("input-fullName") as HTMLInputElement;
			expect(fullNameInput.disabled).toBe(true);
			expect(fullNameInput.placeholder).toBe("Enter first name Enter last name");
		});

		it("renders company fields as disabled when isCompany is false", () => {
			const schema = z.object({
				isCompany: z.boolean(),
				companyName: z.string(),
				taxId: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						isCompany: false,
						companyName: "",
						taxId: "",
					}}
					fields={[
						{
							name: "isCompany",
							type: "checkbox",
							size: 12,
							label: "Is this a company?",
						},
						{
							name: "companyName",
							type: "text",
							size: 6,
							label: "Company Name",
							watch: ["isCompany"],
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
							description: ({ fieldValues }) =>
								fieldValues.isCompany ? "Enter your company name" : "Enable company mode to edit",
						},
						{
							name: "taxId",
							type: "text",
							size: 6,
							label: ({ fieldValues }) => (fieldValues.isCompany ? "Tax ID (Required)" : "Tax ID"),
							watch: ["isCompany"],
							placeholder: ({ fieldValues }) => (fieldValues.isCompany ? "XX-XXXXXXX" : "N/A"),
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const companyNameInput = screen.getByTestId("input-companyName") as HTMLInputElement;
			const taxIdInput = screen.getByTestId("input-taxId") as HTMLInputElement;

			expect(companyNameInput.disabled).toBe(true);
			expect(taxIdInput.disabled).toBe(true);
			expect(taxIdInput.placeholder).toBe("N/A");
			expect(screen.getByTestId("label-taxId")).toHaveTextContent("Tax ID");
			expect(screen.getByTestId("description-companyName")).toHaveTextContent(
				"Enable company mode to edit",
			);
		});

		it("renders company fields as enabled when isCompany is true", () => {
			const schema = z.object({
				isCompany: z.boolean(),
				companyName: z.string(),
				taxId: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						isCompany: true,
						companyName: "Acme Corp",
						taxId: "12-3456789",
					}}
					fields={[
						{
							name: "isCompany",
							type: "checkbox",
							size: 12,
							label: "Is this a company?",
						},
						{
							name: "companyName",
							type: "text",
							size: 6,
							label: "Company Name",
							watch: ["isCompany"],
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
							description: ({ fieldValues }) =>
								fieldValues.isCompany ? "Enter your company name" : "Enable company mode to edit",
						},
						{
							name: "taxId",
							type: "text",
							size: 6,
							label: ({ fieldValues }) => (fieldValues.isCompany ? "Tax ID (Required)" : "Tax ID"),
							watch: ["isCompany"],
							placeholder: ({ fieldValues }) => (fieldValues.isCompany ? "XX-XXXXXXX" : "N/A"),
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const companyNameInput = screen.getByTestId("input-companyName") as HTMLInputElement;
			const taxIdInput = screen.getByTestId("input-taxId") as HTMLInputElement;

			expect(companyNameInput.disabled).toBe(false);
			expect(taxIdInput.disabled).toBe(false);
			expect(taxIdInput.placeholder).toBe("XX-XXXXXXX");
			expect(screen.getByTestId("label-taxId")).toHaveTextContent("Tax ID (Required)");
			expect(screen.getByTestId("description-companyName")).toHaveTextContent(
				"Enter your company name",
			);
			expect(companyNameInput).toHaveValue("Acme Corp");
			expect(taxIdInput).toHaveValue("12-3456789");
		});

		it("renders total and discount fields with low order value", () => {
			const schema = z.object({
				quantity: z.number(),
				unitPrice: z.number(),
				total: z.number(),
				discountCode: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						quantity: 5,
						unitPrice: 50,
						total: 0,
						discountCode: "",
					}}
					fields={[
						{
							name: "quantity",
							type: "number",
							size: 4,
							label: "Quantity",
						},
						{
							name: "unitPrice",
							type: "number",
							size: 4,
							label: "Unit Price ($)",
						},
						{
							name: "total",
							type: "number",
							size: 4,
							label: "Total ($)",
							watch: ["quantity", "unitPrice"],
							placeholder: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								return `$${(qty * price).toFixed(2)}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.quantity || !fieldValues.unitPrice,
							description: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								const total = qty * price;
								if (total > 1000) {
									return "High value order - discount available";
								}
								if (total > 0) {
									return `Subtotal: $${total.toFixed(2)}`;
								}
								return "Enter quantity and price";
							},
						},
						{
							name: "discountCode",
							type: "text",
							size: 12,
							label: "Discount Code",
							watch: ["quantity", "unitPrice"],
							placeholder: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								const total = qty * price;
								return total > 1000 ? "SAVE20 for 20% off" : "No discount available";
							},
							disabled: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								return qty * price <= 1000;
							},
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const totalInput = screen.getByTestId("number-total") as HTMLInputElement;
			const discountInput = screen.getByTestId("input-discountCode") as HTMLInputElement;

			expect(totalInput.disabled).toBe(false);
			expect(totalInput.placeholder).toBe("$250.00");
			expect(screen.getByTestId("description-total")).toHaveTextContent("Subtotal: $250.00");
			expect(discountInput.disabled).toBe(true);
			expect(discountInput.placeholder).toBe("No discount available");
		});

		it("renders total and discount fields with high order value", () => {
			const schema = z.object({
				quantity: z.number(),
				unitPrice: z.number(),
				total: z.number(),
				discountCode: z.string(),
			});

			render(
				<Form<typeof schema>
					schema={schema}
					initialValues={{
						quantity: 25,
						unitPrice: 60,
						total: 0,
						discountCode: "",
					}}
					fields={[
						{
							name: "quantity",
							type: "number",
							size: 4,
							label: "Quantity",
						},
						{
							name: "unitPrice",
							type: "number",
							size: 4,
							label: "Unit Price ($)",
						},
						{
							name: "total",
							type: "number",
							size: 4,
							label: "Total ($)",
							watch: ["quantity", "unitPrice"],
							placeholder: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								return `$${(qty * price).toFixed(2)}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.quantity || !fieldValues.unitPrice,
							description: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								const total = qty * price;
								if (total > 1000) {
									return "High value order - discount available";
								}
								if (total > 0) {
									return `Subtotal: $${total.toFixed(2)}`;
								}
								return "Enter quantity and price";
							},
						},
						{
							name: "discountCode",
							type: "text",
							size: 12,
							label: "Discount Code",
							watch: ["quantity", "unitPrice"],
							placeholder: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								const total = qty * price;
								return total > 1000 ? "SAVE20 for 20% off" : "No discount available";
							},
							disabled: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								return qty * price <= 1000;
							},
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const totalInput = screen.getByTestId("number-total") as HTMLInputElement;
			const discountInput = screen.getByTestId("input-discountCode") as HTMLInputElement;

			expect(totalInput.disabled).toBe(false);
			expect(totalInput.placeholder).toBe("$1500.00");
			expect(screen.getByTestId("description-total")).toHaveTextContent(
				"High value order - discount available",
			);
			expect(discountInput.disabled).toBe(false);
			expect(discountInput.placeholder).toBe("SAVE20 for 20% off");
		});
	});

	describe("Reactive Watch Tests", () => {
		it("reactively updates placeholder when typing (no initialValues)", async () => {
			const schema = z.object({
				firstName: z.string(),
				lastName: z.string(),
				fullName: z.string(),
			});

			const user = userEvent.setup();

			render(
				<Form<typeof schema>
					schema={schema}
					fields={[
						{
							name: "firstName",
							type: "text",
							size: 6,
							label: "First Name",
						},
						{
							name: "lastName",
							type: "text",
							size: 6,
							label: "Last Name",
						},
						{
							name: "fullName",
							type: "text",
							size: 12,
							label: "Full Name",
							watch: ["firstName", "lastName"],
							placeholder: ({ fieldValues }) => {
								const first = fieldValues.firstName || "Enter";
								const last = fieldValues.lastName || "name";
								return `${first} ${last}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.firstName || !fieldValues.lastName,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const fullNameInput = screen.getByTestId("input-fullName") as HTMLInputElement;
			const firstNameInput = screen.getByTestId("input-firstName");
			const lastNameInput = screen.getByTestId("input-lastName");

			expect(fullNameInput.disabled).toBe(true);
			expect(fullNameInput.placeholder).toBe("Enter name");

			await user.type(firstNameInput, "John");
			expect(fullNameInput.placeholder).toBe("John name");

			await user.type(lastNameInput, "Doe");
			expect(fullNameInput.placeholder).toBe("John Doe");
			expect(fullNameInput.disabled).toBe(false);

			await user.clear(firstNameInput);
			expect(fullNameInput.placeholder).toBe("Enter Doe");
			expect(fullNameInput.disabled).toBe(true);
		});

		it("reactively updates company fields when checkbox changes", async () => {
			const schema = z.object({
				isCompany: z.boolean(),
				companyName: z.string(),
				taxId: z.string(),
			});

			const user = userEvent.setup();

			render(
				<Form<typeof schema>
					schema={schema}
					fields={[
						{
							name: "isCompany",
							type: "checkbox",
							size: 12,
							label: "Is this a company?",
						},
						{
							name: "companyName",
							type: "text",
							size: 6,
							label: "Company Name",
							watch: ["isCompany"],
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
							description: ({ fieldValues }) =>
								fieldValues.isCompany ? "Enter company name" : "Check box to enable",
						},
						{
							name: "taxId",
							type: "text",
							size: 6,
							label: ({ fieldValues }) => (fieldValues.isCompany ? "Tax ID (Required)" : "Tax ID"),
							watch: ["isCompany"],
							placeholder: ({ fieldValues }) => (fieldValues.isCompany ? "XX-XXXXXXX" : "N/A"),
							disabled: ({ fieldValues }) => !fieldValues.isCompany,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const checkbox = screen.getByTestId("checkbox-isCompany");
			const companyNameInput = screen.getByTestId("input-companyName") as HTMLInputElement;
			const taxIdInput = screen.getByTestId("input-taxId") as HTMLInputElement;

			expect(companyNameInput.disabled).toBe(true);
			expect(taxIdInput.disabled).toBe(true);
			expect(taxIdInput.placeholder).toBe("N/A");
			expect(screen.getByTestId("label-taxId")).toHaveTextContent("Tax ID");

			await user.click(checkbox);

			expect(companyNameInput.disabled).toBe(false);
			expect(taxIdInput.disabled).toBe(false);
			expect(taxIdInput.placeholder).toBe("XX-XXXXXXX");
			expect(screen.getByTestId("label-taxId")).toHaveTextContent("Tax ID (Required)");
			expect(screen.getByTestId("description-companyName")).toHaveTextContent("Enter company name");

			await user.click(checkbox);

			expect(companyNameInput.disabled).toBe(true);
			expect(taxIdInput.disabled).toBe(true);
			expect(taxIdInput.placeholder).toBe("N/A");
			expect(screen.getByTestId("label-taxId")).toHaveTextContent("Tax ID");
		});

		it("reactively calculates totals from multiple fields", async () => {
			const schema = z.object({
				quantity: z.number(),
				unitPrice: z.number(),
				total: z.number(),
			});

			const user = userEvent.setup();

			render(
				<Form<typeof schema>
					schema={schema}
					fields={[
						{
							name: "quantity",
							type: "number",
							size: 6,
							label: "Quantity",
						},
						{
							name: "unitPrice",
							type: "number",
							size: 6,
							label: "Unit Price",
						},
						{
							name: "total",
							type: "number",
							size: 12,
							label: "Total",
							watch: ["quantity", "unitPrice"],
							placeholder: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								return `Total: $${(qty * price).toFixed(2)}`;
							},
							disabled: ({ fieldValues }) => !fieldValues.quantity || !fieldValues.unitPrice,
							description: ({ fieldValues }) => {
								const qty = Number(fieldValues.quantity) || 0;
								const price = Number(fieldValues.unitPrice) || 0;
								const total = qty * price;
								if (total > 100) {
									return "High value!";
								}
								if (total > 0) {
									return `Subtotal: $${total.toFixed(2)}`;
								}
								return "Enter values";
							},
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const totalInput = screen.getByTestId("number-total") as HTMLInputElement;
			const quantityInput = screen.getByTestId("number-quantity");
			const priceInput = screen.getByTestId("number-unitPrice");

			expect(totalInput.disabled).toBe(true);
			expect(totalInput.placeholder).toBe("Total: $0.00");

			await user.type(quantityInput, "5");
			expect(totalInput.disabled).toBe(true);

			await user.type(priceInput, "10");
			expect(totalInput.disabled).toBe(false);
			expect(totalInput.placeholder).toBe("Total: $50.00");
			expect(screen.getByTestId("description-total")).toHaveTextContent("Subtotal: $50.00");

			await user.clear(quantityInput);
			await user.type(quantityInput, "20");
			expect(totalInput.placeholder).toBe("Total: $200.00");
			expect(screen.getByTestId("description-total")).toHaveTextContent("High value!");
		});
	});

	describe("Type Safety and Edge Cases", () => {
		it("handles empty schema", () => {
			const emptySchema = z.object({});
			const { container } = render(
				<Form
					schema={emptySchema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(container.querySelector("form")).toBeInTheDocument();
		});

		it("handles schema with only optional fields", () => {
			const optionalSchema = z.object({
				nickname: z.string().optional(),
				bio: z.string().optional(),
			});

			render(
				<Form
					schema={optionalSchema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-nickname")).toBeInTheDocument();
			expect(screen.getByTestId("field-bio")).toBeInTheDocument();
		});

		it("correctly maps schema types to field types", () => {
			const typeSchema = z.object({
				name: z.string(),
				age: z.number(),
				active: z.boolean(),
			});

			const { container } = render(
				<Form
					schema={typeSchema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const textInputs = container.querySelectorAll('input[type="text"]');
			const numberInputs = container.querySelectorAll('input[type="number"]');
			const checkboxes = container.querySelectorAll('input[type="checkbox"]');

			expect(textInputs.length).toBeGreaterThanOrEqual(1);
			expect(numberInputs.length).toBeGreaterThanOrEqual(1);
			expect(checkboxes.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Array Fields", () => {
		it("renders array field with only schema", () => {
			const schema = z.object({
				contacts: z.array(
					z.object({
						name: z.string(),
						email: z.string().email(),
					}),
				),
			});

			render(
				<Form
					schema={schema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByText(/no items/i)).toBeInTheDocument();
			expect(screen.getByText(/add/i)).toBeInTheDocument();
		});

		it("renders array field with initial values", () => {
			const schema = z.object({
				products: z.array(
					z.object({
						name: z.string(),
						price: z.number(),
					}),
				),
			});

			render(
				<Form
					schema={schema}
					initialValues={{
						products: [{ name: "Widget", price: 29.99 }],
					}}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.queryByText(/no items/i)).not.toBeInTheDocument();
			expect(screen.getByTestId("input-products[0].name")).toBeInTheDocument();
			expect(screen.getByTestId("input-products[0].price")).toBeInTheDocument();
			expect(screen.getByTestId("number-products[0].price")).toHaveValue(29.99);
			expect(screen.getByTestId("input-products[0].name")).toHaveValue("Widget");
			expect(screen.getByText(/add/i)).toBeInTheDocument();
		});

		it("renders array field with custom fields configuration", async () => {
			const schema = z.object({
				todos: z.array(
					z.object({
						title: z.string(),
						completed: z.boolean(),
					}),
				),
			});

			const user = userEvent.setup();

			render(
				<Form
					schema={schema}
					fields={[
						{
							name: "todos.title",
							label: "Custom Title",
							type: "text",
						},
						{
							name: "todos.completed",
							type: "checkbox",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByText(/no items/i)).toBeInTheDocument();
			expect(screen.getByText(/add/i)).toBeInTheDocument();

			const addButton = screen.getByText(/add todos/i);
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-todos[0].title")).toBeInTheDocument();
			});
			expect(screen.getByTestId("label-todos[0].title")).toHaveTextContent(/custom title/i);
		});

		it("renders array field with custom fields configuration and default values", async () => {
			const schema = z.object({
				todos: z.array(
					z.object({
						title: z.string(),
						completed: z.boolean(),
					}),
				),
			});

			const user = userEvent.setup();

			render(
				<Form
					schema={schema}
					initialValues={{
						todos: [
							{ title: "First Task", completed: true },
							{ title: "Second Task", completed: false },
						],
					}}
					fields={[
						{
							name: "todos.title",
							label: "Task",
							type: "text",
						},
						{
							name: "todos.completed",
							label: "Is Task Completed",
							type: "checkbox",
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.queryByText(/no items/i)).not.toBeInTheDocument();
			expect(screen.getByTestId("input-todos[0].title")).toBeInTheDocument();
			expect(screen.getByTestId("checkbox-todos[0].completed")).toBeInTheDocument();
			expect(screen.getByTestId("checkbox-todos[0].completed")).toBeChecked();
			expect(screen.getByTestId("input-todos[1].title")).toBeInTheDocument();
			expect(screen.getByTestId("checkbox-todos[1].completed")).toBeInTheDocument();
			expect(screen.getByTestId("checkbox-todos[1].completed")).not.toBeChecked();
			expect(screen.getByTestId("input-todos[0].title")).toHaveValue("First Task");
			expect(screen.getByTestId("input-todos[1].title")).toHaveValue("Second Task");

			const addButton = screen.getByText(/add todos/i);
			await user.click(addButton);
		});

		it("renders array field with context", async () => {
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

			const user = userEvent.setup();

			render(
				<Form
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
							label: ({ context }) =>
								context?.userRole ? `Priority (${context.userRole})` : "Priority",
							type: "text",
							watchContext: ["userRole"],
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByText(/no items/i)).toBeInTheDocument();

			const addButton = screen.getByText(/add tasks/i);
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-tasks[0].title")).toBeInTheDocument();
			});

			const notesInput = screen.getByTestId("textarea-tasks[0].notes") as HTMLTextAreaElement;

			expect(notesInput).toBeInTheDocument();
			expect(notesInput.disabled).toBe(true);
			expect(notesInput.placeholder).toBe("Add notes for admin...");

			const priorityLabel = screen.getByTestId("label-tasks[0].priority");
			expect(priorityLabel).toHaveTextContent(/priority \(admin\)/i);

			const titleInput = screen.getByTestId("input-tasks[0].title") as HTMLInputElement;
			await user.type(titleInput, "Important Task");

			await waitFor(() => {
				expect(notesInput.disabled).toBe(false);
			});

			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-tasks[1].title")).toBeInTheDocument();
			});

			const notesInput2 = screen.getByTestId("textarea-tasks[1].notes") as HTMLTextAreaElement;
			expect(notesInput2.disabled).toBe(true);

			const titleInput2 = screen.getByTestId("input-tasks[1].title") as HTMLInputElement;
			await user.type(titleInput2, "Another Task");

			await waitFor(() => {
				expect(notesInput2.disabled).toBe(false);
			});
		});

		it("subscribes array watch to sibling value of the same index only", async () => {
			const schema = z.object({
				tasks: z.array(
					z.object({
						title: z.string(),
						notes: z.string().optional(),
					}),
				),
			});

			const user = userEvent.setup();

			render(
				<Form
					schema={schema}
					initialValues={{
						tasks: [
							{ title: "", notes: "" },
							{ title: "", notes: "" },
						],
					}}
					fields={[
						{ name: "tasks.title", type: "text", label: "Task Title" },
						{
							name: "tasks.notes",
							type: "textarea",
							label: "Task Notes",
							watch: ["tasks.title"],
							disabled: ({ fieldValues }) => !fieldValues.tasks.title,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const title0 = screen.getByTestId("input-tasks[0].title") as HTMLInputElement;
			const title1 = screen.getByTestId("input-tasks[1].title") as HTMLInputElement;
			const notes0 = screen.getByTestId("textarea-tasks[0].notes") as HTMLTextAreaElement;
			const notes1 = screen.getByTestId("textarea-tasks[1].notes") as HTMLTextAreaElement;

			expect(notes0.disabled).toBe(true);
			expect(notes1.disabled).toBe(true);

			await user.type(title0, "Item 0 title");
			await waitFor(() => {
				expect(notes0.disabled).toBe(false);
			});
			expect(notes1.disabled).toBe(true);

			await user.type(title1, "Item 1 title");
			await waitFor(() => {
				expect(notes1.disabled).toBe(false);
			});

			await user.clear(title0);
			await waitFor(() => {
				expect(notes0.disabled).toBe(true);
			});
			expect(notes1.disabled).toBe(false);
		});

		it("does not recompute array watch field when unrelated non-array field changes", async () => {
			const schema = z.object({
				name: z.string(),
				tasks: z.array(
					z.object({
						title: z.string(),
						notes: z.string().optional(),
					}),
				),
			});

			const user = userEvent.setup();
			const notesDisabledSpy = vi.fn(({ fieldValues }: any) => !fieldValues.tasks.title);

			render(
				<Form
					schema={schema}
					initialValues={{
						name: "",
						tasks: [
							{ title: "", notes: "" },
							{ title: "", notes: "" },
						],
					}}
					fields={[
						{ name: "name", type: "text", label: "Name" },
						{ name: "tasks.title", type: "text", label: "Task Title" },
						{
							name: "tasks.notes",
							type: "textarea",
							label: "Task Notes",
							watch: ["tasks.title"],
							disabled: notesDisabledSpy,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const initialCalls = notesDisabledSpy.mock.calls.length;
			const nameInput = screen.getByTestId("input-name");

			await user.type(nameInput, "A");
			await waitFor(() => {
				expect(nameInput).toHaveValue("A");
			});

			expect(notesDisabledSpy.mock.calls.length).toBe(initialCalls);
		});
		it("does not render orphan scalar field when using array child path in fields config", async () => {
			const schema = z.object({
				name: z.string(),
				tasks: z.array(
					z.object({
						title: z.string(),
					}),
				),
			});

			const user = userEvent.setup();

			render(
				<Form<typeof schema>
					schema={schema}
					fields={[
						{ name: "name", type: "text", label: "Name" },
						{ name: "tasks.title", type: "text", label: "Task Title" },
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.queryByTestId("field-tasks.title")).not.toBeInTheDocument();

			const addButton = screen.getByText(/add tasks/i);
			await user.click(addButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-tasks[0].title")).toBeInTheDocument();
			});

			expect(screen.queryByTestId("field-tasks.title")).not.toBeInTheDocument();
			expect(screen.getAllByTestId("field-tasks[0].title")).toHaveLength(1);
		});
		it("handles personal profile with full name tracking, privilege context, and two array groups", async () => {
			const schema = z.object({
				firstName: z.string(),
				lastName: z.string(),
				fullName: z.string(),
				status: z.string(),
				email: z.email(),
				phone: z.string(),
				addresses: z.array(
					z.object({
						type: z.string(),
						line1: z.string(),
						city: z.string(),
						notes: z.string().optional(),
					}),
				),
				emergencyContacts: z.array(
					z.object({
						contactName: z.string(),
						relationship: z.string(),
						contactPhone: z.string(),
					}),
				),
			});

			const user = userEvent.setup();

			render(
				<Form
					schema={schema}
					context={{ role: "manager", canEditSensitive: true }}
					initialValues={{
						firstName: "John",
						lastName: "Doe",
						fullName: "",
						status: "active",
						email: "john.doe@example.com",
						phone: "555-1234",
						addresses: [
							{ city: "Madrid", line1: "Main St 123", notes: "Leave at gate", type: "home" },
							{ city: "", line1: "Business Ave 45", notes: "", type: "office" },
						],
						emergencyContacts: [
							{ contactName: "Jane Doe", contactPhone: "555-9999", relationship: "spouse" },
							{ contactName: "Carlos Perez", contactPhone: "555-8888", relationship: "" },
						],
					}}
					fields={[
						{ name: "firstName", type: "text", label: "First Name" },
						{ name: "lastName", type: "text", label: "Last Name" },
						{
							name: "fullName",
							type: "text",
							label: "Full Name",
							watch: ["firstName", "lastName"],
							watchContext: ["canEditSensitive"],
							disabled: ({ context, fieldValues }) =>
								!context.canEditSensitive || !fieldValues.firstName || !fieldValues.lastName,
							placeholder: ({ fieldValues }) => {
								const first = fieldValues.firstName || "First";
								const last = fieldValues.lastName || "Last";
								return `${first} ${last}`;
							},
						},
						{ name: "email", type: "text", label: "Email" },
						{
							name: "status",
							type: "text",
							label: "Status",
						},
						{
							name: "phone",
							type: "text",
							label: "Phone",
							watch: ["status"],
							disabled: ({ fieldValues }) => fieldValues.status !== "active",
						},
						{ name: "addresses.type", type: "text", label: "Address Type" },
						{ name: "addresses.line1", type: "text", label: "Address Line" },
						{ name: "addresses.city", type: "text", label: "City" },
						{
							name: "addresses.notes",
							type: "textarea",
							label: "Address Notes",
							watch: ["addresses.city"],
							watchContext: ["role"],
							disabled: ({ fieldValues }) => !fieldValues.addresses.city,
							placeholder: ({ context }) => `Notes for ${context.role}`,
						},
						{ name: "emergencyContacts.contactName", type: "text", label: "Contact Name" },
						{ name: "emergencyContacts.relationship", type: "text", label: "Relationship" },
						{
							name: "emergencyContacts.contactPhone",
							type: "text",
							label: "Emergency Phone",
							watch: ["emergencyContacts.contactName", "emergencyContacts.relationship"],
							disabled: ({ fieldValues }) =>
								!fieldValues.emergencyContacts.contactName ||
								!fieldValues.emergencyContacts.relationship,
						},
					]}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			const firstName = screen.getByTestId("input-firstName") as HTMLInputElement;
			const lastName = screen.getByTestId("input-lastName") as HTMLInputElement;
			const fullName = screen.getByTestId("input-fullName") as HTMLInputElement;
			const status = screen.getByTestId("input-status") as HTMLInputElement;
			const phone = screen.getByTestId("input-phone") as HTMLInputElement;

			expect(firstName).toHaveValue("John");
			expect(lastName).toHaveValue("Doe");
			expect(fullName.disabled).toBe(false);
			expect(fullName.placeholder).toBe("John Doe");
			expect(phone.disabled).toBe(false);

			await user.clear(firstName);
			await waitFor(() => {
				expect(fullName.disabled).toBe(true);
			});
			expect(fullName.placeholder).toBe("First Doe");

			await user.type(firstName, "Jane");
			await waitFor(() => {
				expect(fullName.disabled).toBe(false);
			});
			expect(fullName.placeholder).toBe("Jane Doe");

			await user.clear(status);
			await user.type(status, "inactive");
			await waitFor(() => {
				expect(phone.disabled).toBe(true);
			});

			await user.clear(status);
			await user.type(status, "active");
			await waitFor(() => {
				expect(phone.disabled).toBe(false);
			});

			const addressNotes0 = screen.getByTestId(
				"textarea-addresses[0].notes",
			) as HTMLTextAreaElement;
			const addressNotes1 = screen.getByTestId(
				"textarea-addresses[1].notes",
			) as HTMLTextAreaElement;
			const addressCity0 = screen.getByTestId("input-addresses[0].city") as HTMLInputElement;
			const addressCity1 = screen.getByTestId("input-addresses[1].city") as HTMLInputElement;

			expect(addressNotes0.disabled).toBe(false);
			expect(addressNotes1.disabled).toBe(true);
			expect(addressNotes0.placeholder).toBe("Notes for manager");

			await user.type(addressCity1, "Barcelona");
			await waitFor(() => {
				expect(addressNotes1.disabled).toBe(false);
			});

			await user.clear(addressCity0);
			await waitFor(() => {
				expect(addressNotes0.disabled).toBe(true);
			});
			expect(addressNotes1.disabled).toBe(false);

			const contactPhone0 = screen.getByTestId(
				"input-emergencyContacts[0].contactPhone",
			) as HTMLInputElement;
			const contactPhone1 = screen.getByTestId(
				"input-emergencyContacts[1].contactPhone",
			) as HTMLInputElement;
			const contactName0 = screen.getByTestId(
				"input-emergencyContacts[0].contactName",
			) as HTMLInputElement;
			const relationship1 = screen.getByTestId(
				"input-emergencyContacts[1].relationship",
			) as HTMLInputElement;

			expect(contactPhone0.disabled).toBe(false);
			expect(contactPhone1.disabled).toBe(true);

			await user.type(relationship1, "friend");
			await waitFor(() => {
				expect(contactPhone1.disabled).toBe(false);
			});

			await user.clear(contactName0);
			await waitFor(() => {
				expect(contactPhone0.disabled).toBe(true);
			});
			expect(contactPhone1.disabled).toBe(false);

			const addAddressButton = screen.getByText(/add addresses/i);
			await user.click(addAddressButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-addresses[2].city")).toBeInTheDocument();
			});

			const addressNotes2 = screen.getByTestId(
				"textarea-addresses[2].notes",
			) as HTMLTextAreaElement;
			expect(addressNotes2.disabled).toBe(true);

			const addContactButton = screen.getByText(/add emergency contacts/i);
			await user.click(addContactButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-emergencyContacts[2].contactName")).toBeInTheDocument();
			});

			const contactPhone2 = screen.getByTestId(
				"input-emergencyContacts[2].contactPhone",
			) as HTMLInputElement;
			expect(contactPhone2.disabled).toBe(true);
		});
	});

	describe("FormaProvider and Form Composition", () => {
		it("renders form with FormaProvider without breaking", () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
						showSubmit
					/>
				</Provider>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("input-name")).toBeInTheDocument();
		});

		it(" FormaSubmit renders and can submit form when inside FormaProvider", async () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			const user = userEvent.setup();

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<FormSubmit />
				</Provider>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();

			const nameInput = screen.getByTestId("input-name");
			await user.type(nameInput, "John Doe");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSubmit).toHaveBeenCalledWith({ name: "John Doe" });
			});
		});

		it("FormaSubmit shows custom submit text", () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<FormSubmit submitText="Save Form" />
				</Provider>,
			);

			expect(screen.getByRole("button", { name: /save form/i })).toBeInTheDocument();
		});

		it("FormaSubmit shows cancel button when showCancelButton is true", () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<FormSubmit
						showCancelButton
						cancelText="Reset"
					/>
				</Provider>,
			);

			expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
		});

		it("FormaSubmit hides cancel button when showCancelButton is false", () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<FormSubmit showCancelButton={false} />
				</Provider>,
			);

			expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
		});

		it("supports multiple isolated forms with formKey", () => {
			const schema1 = z.object({
				firstName: z.string(),
			});
			const schema2 = z.object({
				lastName: z.string(),
			});

			render(
				<Provider>
					<Form
						schema={schema1}
						scopeId="form1"
						onSubmit={mockSubmit}
					/>
					<Form
						schema={schema2}
						scopeId="form2"
						onSubmit={mockSubmit}
					/>
				</Provider>,
			);

			expect(screen.getByTestId("field-firstName")).toBeInTheDocument();
			expect(screen.getByTestId("field-lastName")).toBeInTheDocument();
		});

		it("FormaSubmit with specific formKey submits correct form", async () => {
			const schema1 = z.object({
				firstName: z.string(),
			});
			const schema2 = z.object({
				lastName: z.string(),
			});

			const mockSubmit1 = vi.fn();
			const mockSubmit2 = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider>
					<Form
						schema={schema1}
						scopeId="form1"
						onSubmit={mockSubmit1}
					/>
					<Form
						schema={schema2}
						scopeId="form2"
						onSubmit={mockSubmit2}
					/>
					<FormSubmit
						formKey="form1"
						submitText="Submit Form 1"
					/>
					<FormSubmit
						formKey="form2"
						submitText="Submit Form 2"
					/>
				</Provider>,
			);

			const firstNameInput = screen.getByTestId("input-firstName");
			await user.type(firstNameInput, "John");

			const submitButton1 = screen.getByRole("button", { name: /submit form 1/i });
			await user.click(submitButton1);

			await waitFor(() => {
				expect(mockSubmit1).toHaveBeenCalledWith({ firstName: "John" });
			});
			expect(mockSubmit2).not.toHaveBeenCalled();
		});

		it("FormaSubmit disables during submission", async () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			const user = userEvent.setup();

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={async () => {
							await new Promise((resolve) => setTimeout(resolve, 100));
						}}
					/>
					<FormSubmit />
				</Provider>,
			);

			const nameInput = screen.getByTestId("input-name");
			await user.type(nameInput, "John");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(submitButton).toBeDisabled();
			});
		});

		it("useForma hook returns form instance within FormaProvider", () => {
			const schema = z.object({
				name: z.string(),
			});

			let capturedForm: any;

			const TestComponent = () => {
				const form = useForm();
				capturedForm = form;
				return <div data-testid="test-component">Test</div>;
			};

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<TestComponent />
				</Provider>,
			);

			expect(screen.getByTestId("test-component")).toBeInTheDocument();
			expect(capturedForm).toBeDefined();
			expect(typeof capturedForm.handleSubmit).toBe("function");
			expect(typeof capturedForm.reset).toBe("function");
		});

		it("useForma with formKey returns specific form instance", () => {
			const schema1 = z.object({ name: z.string() });
			const schema2 = z.object({ email: z.string().email() });

			let capturedForm1: any;
			let capturedForm2: any;

			const TestComponent = () => {
				capturedForm1 = useForm("form1");
				capturedForm2 = useForm("form2");
				return <div data-testid="test-component">Test</div>;
			};

			render(
				<Provider>
					<Form
						schema={schema1}
						scopeId="form1"
						onSubmit={mockSubmit}
					/>
					<Form
						schema={schema2}
						scopeId="form2"
						onSubmit={mockSubmit}
					/>
					<TestComponent />
				</Provider>,
			);

			expect(screen.getByTestId("test-component")).toBeInTheDocument();
			expect(capturedForm1).toBeDefined();
			expect(capturedForm2).toBeDefined();
			expect(capturedForm1).not.toBe(capturedForm2);
		});

		it("Forma works without provider (backward compatibility)", () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			render(
				<Form
					schema={schema}
					onSubmit={mockSubmit}
					showSubmit
				/>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();
			expect(screen.getByTestId("input-name")).toBeInTheDocument();
		});

		it("formRef callback receives form instance", () => {
			const schema = z.object({
				name: z.string(),
			});

			let capturedForm: any;

			render(
				<Form
					schema={schema}
					onSubmit={mockSubmit}
					ref={(form) => {
						capturedForm = form;
					}}
				/>,
			);

			expect(capturedForm).toBeDefined();
			expect(typeof capturedForm.handleSubmit).toBe("function");
			expect(typeof capturedForm.reset).toBe("function");
		});

		it("formRef works with FormaProvider", () => {
			const schema = z.object({
				name: z.string(),
			});

			let capturedForm: any;

			render(
				<Provider>
					<Form
						schema={schema}
						scopeId="myForm"
						onSubmit={mockSubmit}
						ref={(form) => {
							capturedForm = form;
						}}
					/>
				</Provider>,
			);

			expect(capturedForm).toBeDefined();
			expect(typeof capturedForm.handleSubmit).toBe("function");
		});

		it(" FormaSubmit can use dynamic submit text function", async () => {
			const schema = z.object({
				name: z.string().min(1, "Name is required"),
			});

			const user = userEvent.setup();

			render(
				<Provider>
					<Form
						schema={schema}
						onSubmit={mockSubmit}
					/>
					<FormSubmit submitText={(isSubmitting) => (isSubmitting ? "Saving..." : "Save")} />
				</Provider>,
			);

			expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();

			const nameInput = screen.getByTestId("input-name");
			await user.type(nameInput, "John");

			const submitButton = screen.getByRole("button", { name: /save/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSubmit).toHaveBeenCalled();
			});
		});

		it("FormaSubmit with mode='combined' submits all form values together", async () => {
			const personalSchema = z.object({
				firstName: z.string().min(1, "First name required"),
				lastName: z.string().min(1, "Last name required"),
			});

			const addressSchema = z.object({
				street: z.string().min(1, "Street required"),
				city: z.string().min(1, "City required"),
			});

			const mockCombinedSubmit = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider mode="combined">
					<Form
						scopeId="personal"
						schema={personalSchema}
					/>
					<Form
						scopeId="address"
						schema={addressSchema}
					/>
					<FormSubmit onSubmit={mockCombinedSubmit} />
				</Provider>,
			);

			const firstNameInput = screen.getByTestId("input-firstName");
			const lastNameInput = screen.getByTestId("input-lastName");
			const streetInput = screen.getByTestId("input-street");
			const cityInput = screen.getByTestId("input-city");

			await user.type(firstNameInput, "John");
			await user.type(lastNameInput, "Doe");
			await user.type(streetInput, "Main St");
			await user.type(cityInput, "NYC");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockCombinedSubmit).toHaveBeenCalledWith({
					personal: { firstName: "John", lastName: "Doe" },
					address: { street: "Main St", city: "NYC" },
				});
			});
		});

		it("FormaSubmit with mode='combined' works with default form (no key)", async () => {
			const schema1 = z.object({
				email: z.string().email("Valid email required"),
			});

			const schema2 = z.object({
				phone: z.string().min(1, "Phone required"),
			});

			const mockCombinedSubmit = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider mode="combined">
					<Form
						scopeId="contact"
						schema={schema2}
					/>
					<Form schema={schema1} />
					<FormSubmit onSubmit={mockCombinedSubmit} />
				</Provider>,
			);

			const emailInput = screen.getByTestId("input-email");
			const phoneInput = screen.getByTestId("input-phone");

			await user.type(emailInput, "john@example.com");
			await user.type(phoneInput, "123456");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockCombinedSubmit).toHaveBeenCalledWith({
					email: "john@example.com",
					contact: { phone: "123456" },
				});
			});
		});

		it("FormaSubmit mode='single' only submits one form", async () => {
			const schema1 = z.object({
				name: z.string().min(1, "Name required"),
			});

			const schema2 = z.object({
				email: z.string().email("Valid email required"),
			});

			const mockSubmit1 = vi.fn();
			const mockSubmit2 = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider>
					<Form
						scopeId="form1"
						schema={schema1}
						onSubmit={mockSubmit1}
					/>
					<Form
						scopeId="form2"
						schema={schema2}
						onSubmit={mockSubmit2}
					/>
					<FormSubmit formKey="form1" />
				</Provider>,
			);

			const nameInput = screen.getByTestId("input-name");
			const emailInput = screen.getByTestId("input-email");

			await user.type(nameInput, "John");
			await user.type(emailInput, "john@example.com");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSubmit1).toHaveBeenCalledWith({ name: "John" });
			});
			expect(mockSubmit2).not.toHaveBeenCalled();
		});

		it("complex multi-form wizard with arrays, context, and cross-form subscriptions", async () => {
			const personalSchema = z.object({
				firstName: z.string().min(1, "First name required"),
				lastName: z.string().min(1, "Last name required"),
				employeeType: z.enum(["fulltime", "contractor", "intern"]),
			});

			const employmentSchema = z.object({
				jobHistory: z.array(
					z.object({
						company: z.string().min(1, "Company required"),
						role: z.string().min(1, "Role required"),
						isCurrentRole: z.boolean(),
						endDate: z.string().optional(),
					}),
				),
			});

			const emergencySchema = z.object({
				contacts: z.array(
					z.object({
						name: z.string().min(1, "Contact name required"),
						phone: z.string().min(1, "Phone required"),
						relationship: z.string(),
					}),
				),
			});

			const mockCombinedSubmit = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider mode="combined">
					<Form
						scopeId="personal"
						schema={personalSchema}
						context={{ companyName: "Acme Corp" }}
						fields={[
							{ name: "firstName", type: "text", size: 6 },
							{ name: "lastName", type: "text", size: 6 },
							{
								name: "employeeType",
								type: "text",
								size: 12,
							},
						]}
					/>
					<Form
						scopeId="employment"
						schema={employmentSchema}
						context={{ companyName: "Acme Corp" }}
						fields={[
							{
								name: "jobHistory.company",
								type: "text",
								label: "Company Name",
							},
							{
								name: "jobHistory.role",
								type: "text",
								label: "Job Title",
							},
							{
								name: "jobHistory.isCurrentRole",
								type: "checkbox",
								label: "I currently work here",
							},
							{
								name: "jobHistory.endDate",
								type: "text",
								label: "End Date",
							},
						]}
					/>
					<Form
						scopeId="emergency"
						schema={emergencySchema}
						fields={[
							{ name: "contacts.name", type: "text", label: "Contact Name" },
							{ name: "contacts.phone", type: "text", label: "Phone Number" },
							{ name: "contacts.relationship", type: "text", label: "Relationship" },
						]}
					/>
					<FormSubmit onSubmit={mockCombinedSubmit} />
				</Provider>,
			);

			expect(screen.getByTestId("field-firstName")).toBeInTheDocument();
			expect(screen.getByTestId("field-lastName")).toBeInTheDocument();
			expect(screen.getByTestId("field-employeeType")).toBeInTheDocument();
			expect(screen.getAllByText(/no items/i)).toHaveLength(2);
			expect(screen.getByText(/add job history/i)).toBeInTheDocument();

			const firstNameInput = screen.getByTestId("input-firstName");
			const lastNameInput = screen.getByTestId("input-lastName");
			const employeeTypeInput = screen.getByTestId("input-employeeType");

			await user.type(firstNameInput, "Jane");
			await user.type(lastNameInput, "Smith");
			await user.type(employeeTypeInput, "fulltime");

			const addJobButton = screen.getByText(/add job history/i);
			await user.click(addJobButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-jobHistory[0].company")).toBeInTheDocument();
			});

			const companyInput = screen.getByTestId("input-jobHistory[0].company");
			const roleInput = screen.getByTestId("input-jobHistory[0].role");

			await user.type(companyInput, "Tech Corp");
			await user.type(roleInput, "Software Engineer");

			await user.click(addJobButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-jobHistory[1].company")).toBeInTheDocument();
			});

			await user.click(addJobButton);

			await waitFor(() => {
				expect(screen.getByTestId("field-jobHistory[1].company")).toBeInTheDocument();
			});

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockCombinedSubmit).toHaveBeenCalledWith({
					personal: {
						firstName: "Jane",
						lastName: "Smith",
						employeeType: "fulltime",
					},
					employment: {
						jobHistory: [
							{
								company: "Tech Corp",
								role: "Software Engineer",
								isCurrentRole: false,
								endDate: "",
							},
							{ company: "", role: "", isCurrentRole: false, endDate: "" },
							{ company: "", role: "", isCurrentRole: false, endDate: "" },
						],
					},
					emergency: {},
				});
			});
		});

		it("forms inside Collapsible work with combined submission", async () => {
			const personalSchema = z.object({
				name: z.string().min(1, "Name required"),
			});

			const billingSchema = z.object({
				address: z.string().min(1, "Address required"),
			});

			const mockCombinedSubmit = vi.fn();

			const user = userEvent.setup();

			render(
				<Provider mode="combined">
					<Collapsible defaultOpen>
						<CollapsibleTrigger>Personal Info</CollapsibleTrigger>
						<CollapsibleContent>
							<Form
								scopeId="personal"
								schema={personalSchema}
							/>
						</CollapsibleContent>
					</Collapsible>

					<Collapsible>
						<CollapsibleTrigger>Billing Address</CollapsibleTrigger>
						<CollapsibleContent>
							<Form
								scopeId="billing"
								schema={billingSchema}
							/>
						</CollapsibleContent>
					</Collapsible>

					<FormSubmit onSubmit={mockCombinedSubmit} />
				</Provider>,
			);

			expect(screen.getByTestId("field-name")).toBeInTheDocument();

			const nameInput = screen.getByTestId("input-name");
			await user.type(nameInput, "John Doe");

			const billingTrigger = screen.getByRole("button", { name: /billing address/i });
			await user.click(billingTrigger);

			await waitFor(() => {
				expect(screen.getByTestId("field-address")).toBeInTheDocument();
			});

			const addressInput = screen.getByTestId("input-address");
			await user.type(addressInput, "123 Main St");

			const submitButton = screen.getByRole("button", { name: /submit/i });
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockCombinedSubmit).toHaveBeenCalledWith({
					personal: { name: "John Doe" },
					billing: { address: "123 Main St" },
				});
			});
		});
	});
});
