import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import { Forma } from "./components/morphorm";
import * as z from "zod";

const basicSchema = z.object({
  age: z.number().min(0).optional(),
  email: z.email("should be a valid emial"),
  name: z.string().min(1, "Name is required"),
});

describe("FormKit", () => {
  const mockSubmit = vi.fn();
  const mockCancel = vi.fn();
  const mockStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Basic Rendering", () => {
    it("renders form with auto-generated fields from schema", () => {
      render(<Forma schema={basicSchema} onSubmit={mockSubmit} showSubmit />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    });

    it("renders with custom fields configuration", () => {
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

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      render(<Forma schema={basicSchema} onSubmit={mockSubmit} showSubmit />);

      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/age/i), "30");

      fireEvent.click(screen.getByRole("button", { name: /submit/i }));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          age: 30,
          email: "john@example.com",
          name: "John Doe",
        });
      });
    });

    it("prevents submission with invalid data", async () => {
      render(<Forma schema={basicSchema} onSubmit={mockSubmit} showSubmit />);

      await userEvent.type(screen.getByLabelText(/email/i), "invalid-email");

      fireEvent.click(screen.getByRole("button", { name: /submit/i }));

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled();
      });

      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  describe("Form Cancel", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      render(
        <Forma
          schema={basicSchema}
          onSubmit={mockSubmit}
          onCancel={mockCancel}
          showSubmit
          buttonSettings={{ showCancelButton: true }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe("Dynamic Field Props", () => {
    const dynamicSchema = z.object({
      city: z.string(),
      country: z.string(),
    });

    it("updates field props based on watched field values", async () => {
      const citiesByCountry: Record<string, string[]> = {
        uk: ["London", "Manchester", "Birmingham"],
        usa: ["New York", "Los Angeles", "Chicago"],
      };

      render(
        <Forma
          schema={dynamicSchema}
          fields={[
            {
              fieldProps: {
                items: [
                  { id: "usa", name: "United States" },
                  { id: "uk", name: "United Kingdom" },
                ],
              },
              label: "Country",
              name: "country",
              type: "select",
            },
            {
              fieldProps: {
                items: ({ fieldValues }: { fieldValues: Record<string, unknown> }) => {
                  const country = fieldValues.country as string;
                  return (citiesByCountry[country] || []).map((city) => ({
                    id: city,
                    name: city,
                  }));
                },
              },
              label: "City",
              name: "city",
              type: "select",
              watch: ["country"],
            },
          ]}
          onSubmit={mockSubmit}
          showSubmit
        />,
      );

      const countrySelect = screen.getByLabelText(/country/i);
      await userEvent.click(countrySelect);

      await waitFor(() => {
        expect(screen.getByText(/united states/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/united states/i));

      const citySelect = screen.getByLabelText(/city/i);
      await userEvent.click(citySelect);

      await waitFor(() => {
        expect(screen.getByText(/new york/i)).toBeInTheDocument();
      });
    });

    it("disables field based on watched values", async () => {
      render(
        <Forma
          schema={dynamicSchema}
          fields={[
            {
              label: "Country",
              name: "country",
              type: "text",
            },
            {
              disabled: ({ fieldValues }: { fieldValues: Record<string, unknown> }) =>
                !fieldValues.country,
              label: "City",
              name: "city",
              type: "text",
              watch: ["country"],
            },
          ]}
          onSubmit={mockSubmit}
          showSubmit
        />,
      );

      const cityInput = screen.getByLabelText(/city/i);
      expect(cityInput).toBeDisabled();

      const countryInput = screen.getByLabelText(/country/i);
      await userEvent.type(countryInput, "USA");

      await waitFor(() => {
        expect(cityInput).not.toBeDisabled();
      });
    });
  });

  describe("Context Watching", () => {
    const contextSchema = z.object({
      category: z.string(),
      userId: z.number(),
    });

    it("updates fields when context changes", async () => {
      const categoriesByUser: Record<number, string[]> = {
        1: ["Electronics", "Books"],
        2: ["Clothing", "Shoes"],
      };

      const { rerender } = render(
        <Forma
          schema={contextSchema}
          fields={[
            {
              fieldProps: {
                items: ({ context }: { context: Record<string, unknown> | undefined }) => {
                  const userId = context?.userId as number;
                  return (categoriesByUser[userId] || []).map((cat) => ({
                    id: cat,
                    name: cat,
                  }));
                },
              },
              label: "Category",
              name: "category",
              type: "select",
              watchContext: ["userId"],
            },
          ]}
          onSubmit={mockSubmit}
          showSubmit
          context={{ userId: 1 }}
        />,
      );

      const categorySelect = screen.getByLabelText(/category/i);
      await userEvent.click(categorySelect);

      await waitFor(() => {
        expect(screen.getByText(/electronics/i)).toBeInTheDocument();
      });

      rerender(
        <Forma
          schema={contextSchema}
          fields={[
            {
              fieldProps: {
                items: ({ context }: { context: Record<string, unknown> | undefined }) => {
                  const userId = context?.userId as number;
                  return (categoriesByUser[userId] || []).map((cat) => ({
                    id: cat,
                    name: cat,
                  }));
                },
              },
              label: "Category",
              name: "category",
              type: "select",
              watchContext: ["userId"],
            },
          ]}
          onSubmit={mockSubmit}
          showSubmit
          context={{ userId: 2 }}
        />,
      );

      await userEvent.click(categorySelect);

      await waitFor(() => {
        expect(screen.getByText(/clothing/i)).toBeInTheDocument();
      });
    });
  });

  describe("Grid Distribution", () => {
    const gridSchema = z.object({
      field1: z.string(),
      field2: z.string(),
      field3: z.string(),
      field4: z.string(),
    });

    it("distributes fields in a 12-column grid", () => {
      const { container } = render(
        <Forma
          schema={gridSchema}
          fields={[
            { label: "Field 1", name: "field1", size: 6, type: "text" },
            { label: "Field 2", name: "field2", size: 6, type: "text" },
            { label: "Field 3", name: "field3", size: 4, type: "text" },
            { label: "Field 4", name: "field4", size: 8, type: "text" },
          ]}
          onSubmit={mockSubmit}
        />,
      );

      const gridContainers = container.querySelectorAll(".grid-cols-12");
      expect(gridContainers.length).toBeGreaterThan(0);

      const fieldContainers = container.querySelectorAll('[class*="col-span"]');
      expect(fieldContainers.length).toBeGreaterThan(0);
    });

    it("fills remaining space with placeholders", () => {
      const { container } = render(
        <Forma
          schema={gridSchema}
          fields={[
            { label: "Field 1", name: "field1", size: 4, type: "text" },
            { label: "Field 2", name: "field2", size: 4, type: "text" },
          ]}
          onSubmit={mockSubmit}
        />,
      );

      const gridRows = container.querySelectorAll(".grid-cols-12");
      expect(gridRows.length).toBe(1);
    });
  });

  describe("Field Overrides", () => {
    it("allows custom rendering of field", () => {
      const CustomField = () => <div data-testid="custom-field">Custom Render</div>;

      render(
        <Forma
          schema={basicSchema}
          fields={[
            {
              element: <CustomField />,
              name: "name",
              type: "text",
            },
          ]}
          onSubmit={mockSubmit}
        />,
      );

      expect(screen.getByTestId("custom-field")).toBeInTheDocument();
    });

    it("allows override wrapper for field", async () => {
      render(
        <Forma
          schema={basicSchema}
          fields={[
            {
              label: "Name",
              name: "name",
              overrides: (element) => <div data-testid="field-wrapper">{element}</div>,
              type: "text",
            },
          ]}
          onSubmit={mockSubmit}
        />,
      );

      expect(screen.getByTestId("field-wrapper")).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });

  describe("Row Overrides", () => {
    it("allows custom row rendering", () => {
      render(
        <Forma
          schema={basicSchema}
          fields={[
            { label: "Name", name: "name", size: 6, type: "text" },
            { label: "Email", name: "email", size: 6, type: "text" },
          ]}
          rowOverrides={(grid, rowIndex) => (
            <div key={rowIndex} data-testid={`row-${rowIndex}`} className="custom-row">
              {grid}
            </div>
          )}
          onSubmit={mockSubmit}
        />,
      );

      expect(screen.getByTestId("row-0")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("reports form state changes", async () => {
      render(<Forma schema={basicSchema} onSubmit={mockSubmit} onStateChange={mockStateChange} />);

      await waitFor(() => {
        expect(mockStateChange).toHaveBeenCalledWith(
          expect.objectContaining({
            canSubmit: expect.any(Boolean),
            isSubmitted: expect.any(Boolean),
            isSubmitting: expect.any(Boolean),
          }),
        );
      });
    });

    it("validates on blur", async () => {
      render(<Forma schema={basicSchema} onSubmit={mockSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, "invalid");
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });
  });

  describe("Initial Values", () => {
    it("populates form with initial values", () => {
      const initialValues = {
        age: 30,
        email: "john@example.com",
        name: "John Doe",
      };

      render(<Forma schema={basicSchema} initialValues={initialValues} onSubmit={mockSubmit} />);

      expect(screen.getByLabelText(/name/i)).toHaveValue("John Doe");
      expect(screen.getByLabelText(/email/i)).toHaveValue("john@example.com");
      expect(screen.getByLabelText(/age/i)).toHaveValue(30);
    });
  });

  describe("Different Field Types", () => {
    const fieldTypesSchema = z.object({
      checkboxField: z.boolean(),
      dateField: z.date(),
      numberField: z.number(),
      passwordField: z.string(),
      selectField: z.string(),
      textField: z.string(),
      textareaField: z.string(),
    });

    it("renders different field types correctly", () => {
      render(
        <Forma
          schema={fieldTypesSchema}
          fields={[
            { label: "Text", name: "textField", type: "text" },
            { label: "Number", name: "numberField", type: "number" },
            { label: "Checkbox", name: "checkboxField", type: "checkbox" },
            {
              fieldProps: {
                items: [
                  { id: "1", name: "Option 1" },
                  { id: "2", name: "Option 2" },
                ],
              },
              label: "Select",
              name: "selectField",
              type: "select",
            },
            { label: "Textarea", name: "textareaField", type: "textarea" },
            { label: "Date", name: "dateField", type: "date" },
            { label: "Password", name: "passwordField", type: "password" },
          ]}
          onSubmit={mockSubmit}
        />,
      );

      expect(screen.getByLabelText(/text/i)).toHaveAttribute("type", "text");
      expect(screen.getByLabelText(/number/i)).toHaveAttribute("type", "number");
      expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
    });
  });

  describe("Array Fields", () => {
    const arraySchema = z.object({
      items: z.array(
        z.object({
          name: z.string(),
          value: z.number(),
        }),
      ),
    });

    it("renders array fields", () => {
      render(<Forma schema={arraySchema} onSubmit={mockSubmit} />);

      expect(screen.getByText(/items/i)).toBeInTheDocument();
    });
  });

  describe("Custom Components", () => {
    const CustomInput = ({ value, onChange, ...props }: any) => (
      <input
        {...props}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="custom-input"
      />
    );

    it("uses custom components", () => {
      render(
        <Forma schema={basicSchema} components={{ text: CustomInput }} onSubmit={mockSubmit} />,
      );

      expect(screen.getAllByTestId("custom-input").length).toBeGreaterThan(0);
    });
  });
});
