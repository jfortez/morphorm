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
- **Array Override**: Override array mode to scalar with custom types

## Installation

This is part of the web app package. Ensure you have the dependencies installed:

```bash
bun install
```

## Quick Start

```tsx
import { Form } from "morphorm";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	age: z.number().min(0).optional(),
});

function MyForm() {
	return (
		<Form
			schema={schema}
			onSubmit={async (values) => {
				console.log("Submitted:", values);
			}}
			showSubmit={true}
		/>
	);
}
```

## Type Safety

Morphorm provides full TypeScript inference from your Zod schema. The form values are automatically typed:

```tsx
import { Form, type FieldsConfig } from "morphorm";
import { z } from "zod";

const schema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	age: z.number().min(0).optional(),
});

// Fields configuration is fully type-safe
const fields: FieldsConfig<typeof schema> = [
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
];

// onSubmit receives correctly typed values
function handleSubmit(values: z.infer<typeof schema>) {
	// values is typed as { name: string; email: string; age?: number }
	console.log(values.name);
}

<Form
	schema={schema}
	fields={fields}
	onSubmit={handleSubmit}
	showSubmit
/>;
```

## Field Configuration

### Basic Fields

```tsx
<Form
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
		<Form
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

<Form
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
<Form
	schema={schema}
	fields={[
		{ name: "name", type: "text", label: "Name", size: 6 },
		{ name: "email", type: "text", label: "Email", size: 6 },
		{ name: "phone", type: "text", label: "Phone", size: 12 },
	]}
	rowOverrides={(grid, rowIndex, fields) => (
		<Card
			key={rowIndex}
			className={`row-${rowIndex}`}
		>
			<CardHeader>Section {rowIndex + 1}</CardHeader>
			<CardContent>{grid}</CardContent>
		</Card>
	)}
/>
```

## Row Children

Add content after the field rows:

```tsx
<Form
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

<Form
	schema={schema}
	// Array fields are automatically rendered with collapsible sections
	// Add/remove buttons are provided automatically
/>;
```

## Custom Components

Extend Form with custom field components:

### Basic Usage

```tsx
const CustomInput = (props: FieldComponentProps) => (
	<input
		{...props}
		className="custom-input"
	/>
);

const CustomSelect = ({ items, value, onChange, ...props }) => (
	<select
		{...props}
		value={value}
		onChange={(e) => onChange?.(e.target.value)}
	>
		{items?.map((item) => (
			<option
				key={item.id}
				value={item.id}
			>
				{item.name}
			</option>
		))}
	</select>
);

<Form
	schema={schema}
	components={{
		text: CustomInput,
		select: CustomSelect,
	}}
/>;
```

### Using Custom Types in Fields

You can define custom types in the `fields` configuration to use your custom components:

```tsx
const CustomTextInput = (props) => (
	<input
		type="text"
		{...props}
	/>
);

const CustomCheckbox = (props) => (
	<input
		type="checkbox"
		{...props}
	/>
);

<Form
	schema={schema}
	components={{
		customText: CustomTextInput,
		customCbx: CustomCheckbox,
	}}
	fields={[
		{ name: "title", label: "Task Title", type: "customText" },
		{ name: "completed", label: "Done", type: "customCbx" },
	]}
/>;
```

### Overriding Array Mode

By default, array schemas in the schema are rendered with add/remove buttons. However, when you specify a custom `type` in the fields configuration for an array field, it overrides the array mode and renders as a scalar field using your custom component:

```tsx
const schema = z.object({
	contacts: z.array(
		z.object({
			name: z.string(),
			email: z.string().email(),
		}),
	),
	profile: z.object({
		name: z.string(),
		age: z.number(),
	}),
});

// Custom component that manages its own array items
const CustomContactsInput = () => {
	const field = useFieldContext<{ name: string; email: string }[]>();
	const items = field.state.value || [];

	const handleAdd = () => {
		field.handleChange([...items, { name: "", email: "" }]);
	};

	const handleRemove = (index: number) => {
		field.handleChange(items.filter((_, i) => i !== index));
	};

	const handleUpdate = (index, key, value) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [key]: value };
		field.handleChange(newItems);
	};

	return (
		<div>
			{items.map((contact, idx) => (
				<div key={idx}>
					<input
						value={contact.name}
						onChange={(e) => handleUpdate(idx, "name", e.target.value)}
					/>
					<input
						value={contact.email}
						onChange={(e) => handleUpdate(idx, "email", e.target.value)}
					/>
					<button onClick={() => handleRemove(idx)}>Remove</button>
				</div>
			))}
			<button onClick={handleAdd}>Add Contact</button>
		</div>
	);
};

<Form
	schema={schema}
	components={{
		contactsInput: CustomContactsInput,
	}}
	fields={[
		// This overrides the default array mode and uses your custom component
		{ name: "contacts", label: "Contacts", type: "contactsInput" },
		{ name: "profile.name", label: "Name", type: "text" },
		{ name: "profile.age", label: "Age", type: "number" },
	]}
/>;
```

This works for both primitive arrays and object arrays:

```tsx
// Primitive array
const schema = z.object({
	tags: z.array(z.string()),
});

// Object array
const schema = z.object({
	teamMembers: z.array(
		z.object({
			name: z.string(),
			role: z.string(),
		}),
	),
});

// Both can use custom type to override array mode
<Form
	schema={schema}
	fields={[
		{ name: "tags", type: "customTagInput" },
		{ name: "teamMembers", type: "customTeamInput" },
	]}
/>;
```

## Form State Management

Monitor form state changes:

```tsx
<Form
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
<Form
	schema={schema}
	initialValues={{
		name: "John Doe",
		email: "john@example.com",
		age: 30,
	}}
/>
```

## Validation

Form uses Zod for validation. Errors are automatically displayed:

```tsx
const schema = z.object({
	email: z.string().email("Please enter a valid email"),
	age: z.number().min(18, "Must be 18 or older"),
});
```

## Props Reference

### Form Props

| Prop               | Type                                    | Description                |
| ------------------ | --------------------------------------- | -------------------------- |
| `schema`           | `z.ZodObject`                           | Zod schema for validation  |
| `fields`           | `FieldKit[]`                            | Field configurations       |
| `initialValues`    | `Partial<z.infer<Z>>`                   | Initial form values        |
| `onSubmit`         | `(values: z.infer<Z>) => Promise<void>` | Submit handler             |
| `onCancel`         | `() => void`                            | Cancel handler             |
| `onStateChange`    | `(state: FormState) => void`            | State change handler       |
| `components`       | `Components`                            | Custom field components    |
| `context`          | `any`                                   | External context object    |
| `showSubmit`       | `boolean`                               | Show submit button         |
| `buttonSettings`   | `SubmitProps`                           | Button configuration       |
| `rowOverrides`     | `RowOverrides`                          | Custom row rendering       |
| `rowChildren`      | `ReactNode`                             | Content after rows         |
| `fieldTransformer` | `FieldTransformer`                      | Transform field configs    |
| `scopeId`          | `string`                                | ID for FormaProvider       |
| `ref`              | `Ref<FormHandle>`                       | Ref to access form methods |

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
bun test Form.test.tsx
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

## Creating a Form Instance

We recommend creating a single form instance with the default field components in a centralized location.

### Recommended Setup

Create a form instance in `lib/form.ts`:

```tsx
// lib/form.ts
import { createForm } from "morphorm";
import Input from "./components/ui/input";
import Number from "./components/ui/number";
import Checkbox from "./components/ui/checkbox";
import TextArea from "./components/ui/textarea";
import Select from "./components/ui/select";
import Radio from "./components/ui/radio";

const defaultFieldComponents = {
	checkbox: Checkbox,
	number: Number,
	radio: Radio,
	select: Select,
	text: Input,
	textarea: TextArea,
};

export const { Form } = createForm(fieldComponents);
```

> **Note:** The field component paths depend on your project structure. Adjust the imports to match your setup.

### Usage

```tsx
import { Form } from "@/lib/form";

function MyForm() {
	return (
		<Form
			schema={mySchema}
			onSubmit={handleSubmit}
			showSubmit
		/>
	);
}
```

### Initial Field Components

When creating a form instance, you provide the initial field components:

| Type       | Component  | Description      |
| ---------- | ---------- | ---------------- |
| `text`     | `Input`    | Text input       |
| `number`   | `Number`   | Number input     |
| `checkbox` | `Checkbox` | Boolean checkbox |
| `textarea` | `TextArea` | Multi-line text  |
| `select`   | `Select`   | Dropdown select  |
| `radio`    | `Radio`    | Radio buttons    |

### Creating Custom Field Components

Create your own field components using `useFieldContext` for state management:

```tsx
// components/credit-card-input.tsx
import type { FieldComponentProps } from "morphorm";
import { useFieldContext } from "morphorm";

export const CreditCardInput = (props: FieldComponentProps) => {
	const field = useFieldContext<string>();

	return (
		<input
			type="text"
			placeholder="1234 5678 9012 3456"
			className="credit-card-input"
			{...props}
			name={field.name}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};
```

Use `useFieldContext` to access:

- `field.name` - Field name
- `field.state.value` - Current field value
- `field.handleChange(value)` - Update field value
- `field.handleBlur()` - Mark field as touched
- `field.state.error` - Validation error
- `field.state.isValidating` - Validation status

### Overriding Components Per-Form

If you need custom components for specific forms, use the `components` prop to override or extend the initial components:

```tsx
import { Form } from "@/lib/form";
import { CustomInput } from "./components/custom-input";
import { CreditCardInput } from "./components/credit-card";

function CheckoutForm() {
	return (
		<Form
			schema={checkoutSchema}
			components={{
				text: CustomInput,
				creditCard: CreditCardInput,
			}}
			onSubmit={handleSubmit}
			showSubmit
		/>
	);
}
```

The `components` prop allows you to:

- **Override** existing types (e.g., replace `text` with your custom input)
- **Extend** with new types (e.g., add `creditCard` type)

The `createForm` function returns:

| Export | Description        |
| ------ | ------------------ |
| `Form` | The form component |

### FormaProvider Integration

When using multiple forms, you can integrate them with `FormaProvider` for centralized form management:

```tsx
import { Provider, useForms } from "morphorm";

function App() {
	return (
		<Provider>
			<Dashboard />
		</Provider>
	);
}

function Dashboard() {
	const { getForm, forms } = useForms();

	return (
		<div>
			<UserForm scopeId="user" />
			<SettingsForm scopeId="settings" />
			<button onClick={() => getForm("user")?.reset()}>Reset User Form</button>
		</div>
	);
}
```

### Accessing Form Methods

Use `ref` to access form instance methods:

```tsx
import { useRef } from "react";

function MyForm() {
	const formRef = useRef();

	return (
		<>
			<MyFormComponent ref={formRef} />
			<button onClick={() => formRef.current?.reset()}>Reset</button>
			<button onClick={() => formRef.current?.validate()}>Validate</button>
		</>
	);
}
```

### Component Type Requirements

When creating custom field components, ensure they accept the base props:

```tsx
import type { FieldComponentProps } from "morphorm";

const CustomInput = (props: FieldComponentProps) => {
	return (
		<input
			{...props}
			className="custom-input"
		/>
	);
};
```

See [Custom Components](#custom-components) section for detailed examples of custom component implementation.

## License

MIT
