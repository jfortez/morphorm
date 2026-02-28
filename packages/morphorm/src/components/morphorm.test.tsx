import { cleanup, render, screen } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { Forma } from "./morphorm";
import * as z from "zod";

const basicSchema = z.object({
	age: z.number().min(0).optional(),
	email: z.email("should be a valid email"),
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

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/enter your full name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/modified name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/modified email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/modified age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.queryByLabelText(/age/i)).not.toBeInTheDocument();
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

			const fields = screen.getAllByRole("textbox");
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

			expect(screen.getByLabelText(/custom name label/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/func: name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/static override/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/dynamic override/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/custom name label/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
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

			expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
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
