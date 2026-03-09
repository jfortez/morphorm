import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { Forma } from "./morphorm";
import * as z from "zod";

const basicSchema = z.object({
	age: z.number().min(0).optional(),
	email: z.string().email("should be a valid email"),
	name: z.string().min(1, "Name is required"),
});

describe("FormKit", () => {
	const mockSubmit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("Basic Rendering", () => {
		it("renders form with auto-generated fields from schema", () => {
			render(
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma<typeof schema>
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
				<Forma
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
});
