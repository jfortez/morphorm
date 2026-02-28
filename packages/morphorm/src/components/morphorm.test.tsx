import { cleanup, render, screen } from "@testing-library/react";
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
});
