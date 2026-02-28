# Morphorm

A powerful, type-safe form component library built on top of TanStack Form with Zod validation.

## Features

- **Type-Safe**: Full TypeScript support with Zod schema inference
- **Context Subscription**: Watch external context changes with optimized re-rendering
- **Field Watching**: Inter-field dependencies with reactive updates
- **Dynamic Props**: Function-based field properties that react to form state
- **Grid System**: 12-column grid layout with automatic spacing
- **Field Overrides**: Custom rendering for individual fields
- **Row Overrides**: Custom row wrappers for layout control
- **Array Fields**: Support for dynamic array manipulation
- **Custom Components**: Extend with your own field components

## Installation

This is part of the web app package. Ensure you have the dependencies installed:

```bash
bun install
```

## Quick Start

```tsx
import { Forma } from "morphorm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(0).optional(),
});

function MyForm() {
  return (
    <Forma
      schema={schema}
      onSubmit={async (values) => {
        console.log("Submitted:", values);
      }}
      showSubmit={true}
    />
  );
}
```

## Field Configuration

### Basic Fields

```tsx
<Forma
  schema={schema}
  fields={[
    {
      name: "name",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your name",
      size: 6,
    },
    {
      name: "email",
      type: "text",
      label: "Email Address",
      size: 6,
    },
  ]}
/>
```

### Grid System

Fields are distributed in a 12-column grid system:

```tsx
fields={[
  // Row 1: Two columns (6 + 6 = 12)
  { name: "firstName", type: "text", label: "First", size: 6 },
  { name: "lastName", type: "text", label: "Last", size: 6 },

  // Row 2: Full width
  { name: "email", type: "text", label: "Email", size: 12 },

  // Row 3: Three columns (4 + 4 + 4 = 12)
  { name: "day", type: "number", label: "Day", size: 4 },
  { name: "month", type: "number", label: "Month", size: 4 },
  { name: "year", type: "number", label: "Year", size: 4 },
]}
```

## Context Subscription

Watch external context and update fields reactively:

```tsx
interface FormContext {
  userId: number;
  categories: Array<{ id: string; name: string }>;
}

function MyForm() {
  const context: FormContext = {
    userId: 1,
    categories: [
      { id: "1", name: "Electronics" },
      { id: "2", name: "Books" },
    ],
  };

  return (
    <Forma
      schema={schema}
      context={context}
      fields={[
        {
          name: "category",
          type: "select",
          label: "Category",
          watchContext: ["categories"], // Re-render when categories change
          fieldProps: {
            items: ({ context }) => context?.categories || [],
          },
        },
      ]}
    />
  );
}
```

## Field Watching

Create dependent fields that react to other field values:

```tsx
const schema = z.object({
  country: z.string(),
  state: z.string(),
  city: z.string(),
});

const citiesByState: Record<string, string[]> = {
  california: ["Los Angeles", "San Francisco"],
  newyork: ["New York City", "Buffalo"],
};

<Forma
  schema={schema}
  fields={[
    {
      name: "country",
      type: "select",
      label: "Country",
      fieldProps: {
        items: [{ id: "usa", name: "United States" }],
      },
    },
    {
      name: "state",
      type: "select",
      label: "State",
      watch: ["country"], // Watch country field
      disabled: ({ fieldValues }) => !fieldValues.country,
      fieldProps: {
        items: [
          { id: "california", name: "California" },
          { id: "newyork", name: "New York" },
        ],
      },
    },
    {
      name: "city",
      type: "select",
      label: "City",
      watch: ["state"], // Watch state field
      disabled: ({ fieldValues }) => !fieldValues.state,
      fieldProps: {
        items: ({ fieldValues }) => {
          const state = fieldValues.state as string;
          return (citiesByState[state] || []).map((city) => ({
            id: city,
            name: city,
          }));
        },
      },
    },
  ]}
/>;
```

## Dynamic Props

Make field properties reactive using functions:

```tsx
fields={[
  {
    name: "productType",
    type: "select",
    label: "Product Type",
    fieldProps: {
      items: [
        { id: "physical", name: "Physical" },
        { id: "digital", name: "Digital" },
      ],
    },
  },
  {
    name: "weight",
    type: "number",
    label: "Weight (kg)",
    watch: ["productType"],
    // Show only for physical products
    disabled: ({ fieldValues }) => fieldValues.productType !== "physical",
    description: ({ fieldValues }) =>
      fieldValues.productType === "physical"
        ? "Required for shipping"
        : "",
  },
  {
    name: "price",
    type: "number",
    label: "Price",
    placeholder: ({ fieldValues }) =>
      fieldValues.productType === "physical"
        ? "Price + shipping"
        : "Base price",
  },
]}
```

## Field Overrides

### Custom Element

Replace the default field input:

```tsx
{
  name: "customField",
  type: "text",
  element: <CustomInputComponent />,
}
```

### Override Wrapper

Wrap the field with custom UI:

```tsx
{
  name: "email",
  type: "text",
  label: "Email",
  overrides: (element, meta) => (
    <div className="custom-wrapper">
      <span className="icon">@</span>
      {element}
    </div>
  ),
}
```

## Row Overrides

Customize the rendering of entire rows:

```tsx
<Forma
  schema={schema}
  fields={[
    { name: "name", type: "text", label: "Name", size: 6 },
    { name: "email", type: "text", label: "Email", size: 6 },
    { name: "phone", type: "text", label: "Phone", size: 12 },
  ]}
  rowOverrides={(grid, rowIndex, fields) => (
    <Card key={rowIndex} className={`row-${rowIndex}`}>
      <CardHeader>Section {rowIndex + 1}</CardHeader>
      <CardContent>{grid}</CardContent>
    </Card>
  )}
/>
```

## Row Children

Add content after the field rows:

```tsx
<Forma
  schema={schema}
  fields={[...]}
  rowChildren={
    <div className="mt-4 text-sm text-gray-500">
      * Required fields
    </div>
  }
/>
```

## Array Fields

Handle dynamic arrays with add/remove functionality:

```tsx
const schema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
    }),
  ),
});

<Forma
  schema={schema}
  // Array fields are automatically rendered with collapsible sections
  // Add/remove buttons are provided automatically
/>;
```

## Custom Components

Extend Forma with custom field components:

```tsx
const CustomInput = (props) => <input {...props} className="custom-input" />;

const CustomSelect = ({ items, value, onChange, ...props }) => (
  <select {...props} value={value} onChange={(e) => onChange?.(e.target.value)}>
    {items?.map((item) => (
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    ))}
  </select>
);

<Forma
  schema={schema}
  components={{
    text: CustomInput,
    select: CustomSelect,
  }}
/>;
```

## Form State Management

Monitor form state changes:

```tsx
<Forma
  schema={schema}
  onStateChange={(state) => {
    console.log("Can submit:", state.canSubmit);
    console.log("Is submitting:", state.isSubmitting);
    console.log("Is submitted:", state.isSubmitted);
  }}
/>
```

## Initial Values

Populate form with existing data:

```tsx
<Forma
  schema={schema}
  initialValues={{
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  }}
/>
```

## Validation

Forma uses Zod for validation. Errors are automatically displayed:

```tsx
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be 18 or older"),
});
```

## Props Reference

### Forma Props

| Prop               | Type                                    | Description               |
| ------------------ | --------------------------------------- | ------------------------- |
| `schema`           | `z.ZodObject`                           | Zod schema for validation |
| `fields`           | `FieldKit[]`                            | Field configurations      |
| `initialValues`    | `Partial<z.infer<Z>>`                   | Initial form values       |
| `onSubmit`         | `(values: z.infer<Z>) => Promise<void>` | Submit handler            |
| `onCancel`         | `() => void`                            | Cancel handler            |
| `onStateChange`    | `(state: FormState) => void`            | State change handler      |
| `components`       | `Components`                            | Custom field components   |
| `context`          | `any`                                   | External context object   |
| `showSubmit`       | `boolean`                               | Show submit button        |
| `buttonSettings`   | `SubmitProps`                           | Button configuration      |
| `rowOverrides`     | `RowOverrides`                          | Custom row rendering      |
| `rowChildren`      | `ReactNode`                             | Content after rows        |
| `fieldTransformer` | `FieldTransformer`                      | Transform field configs   |

### Field Props

| Prop           | Type                             | Description                             |
| -------------- | -------------------------------- | --------------------------------------- |
| `name`         | `string`                         | Field name (must match schema key)      |
| `type`         | `FieldType`                      | Field type (text, number, select, etc.) |
| `label`        | `string \| ((args) => string)`   | Field label                             |
| `placeholder`  | `string \| ((args) => string)`   | Input placeholder                       |
| `description`  | `string \| ((args) => string)`   | Help text                               |
| `disabled`     | `boolean \| ((args) => boolean)` | Disable field                           |
| `size`         | `Sizes (1-12)`                   | Grid column size                        |
| `watch`        | `string[]`                       | Fields to watch                         |
| `watchContext` | `string[]`                       | Context keys to watch                   |
| `fieldProps`   | `object \| ((args) => object)`   | Additional field props                  |
| `element`      | `ReactNode`                      | Custom field element                    |
| `overrides`    | `(element, meta) => ReactNode`   | Override rendering                      |

### Args Object

Functions receive an args object with:

```typescript
{
  fieldValues: z.infer<Z>; // Current form values
  context: Context; // External context
}
```

## Available Field Types

| Type       | Description      |
| ---------- | ---------------- |
| `text`     | Text input       |
| `number`   | Number input     |
| `password` | Password input   |
| `email`    | Email input      |
| `textarea` | Multi-line text  |
| `select`   | Dropdown select  |
| `checkbox` | Boolean checkbox |
| `date`     | Date picker      |

## Performance

- **Shallow Comparison**: Context and watched values use shallow comparison to prevent unnecessary re-renders
- **Memoization**: Dynamic props are memoized and only recalculated when dependencies change
- **Selective Subscriptions**: Only subscribed fields re-render when context or watched values change

## Testing

Run tests:

```bash
bun test Forma.test.tsx
```

## Examples

See `examples.tsx` for comprehensive usage examples covering:

- Basic usage
- Context watching
- Field dependencies
- Dynamic props
- Grid layouts
- Custom overrides
- Row customization
- Custom components
- Complete real-world forms

## License

MIT
