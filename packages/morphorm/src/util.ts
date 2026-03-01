// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";
import type { ParsedField } from "@morphorm/core/types";

import type { FieldType } from "./fields";
import type {
	AutoField,
	Components,
	FieldTransformFunction,
	FieldTransformObject,
	FieldsConfig,
	FormaField,
	Sizes,
	SpacerType,
} from "./types";

export type InternalField<Z extends z.ZodObject<any> = z.ZodObject<any>> = {
	name: string;
	label?: string | React.ReactNode;
	element?: React.ReactNode;
	type: string;
	mode: "value" | "array";
	schema: ParsedField[];
	size?: Sizes;
	watch?: string[];
	watchContext?: string[];
	arrayPath?: string;
	placeholder?: string | ((args: { fieldValues: z.infer<Z>; context: any }) => string);
	description?: string | ((args: { fieldValues: z.infer<Z>; context: any }) => string);
	disabled?: boolean | ((args: { fieldValues: z.infer<Z>; context: any }) => boolean);
	overrides?: (originalElement: React.JSX.Element, meta: any) => React.ReactNode;
};

export function generateGrid<Z extends z.ZodObject<any>>(
	fields: InternalField<Z>[],
): InternalField<Z>[][] {
	const GRID_WIDTH = 12;
	const result: InternalField<Z>[][] = [];
	let currentRow: InternalField<Z>[] = [];
	let currentWidth = 0;

	const createPlaceholder = (size: Sizes): InternalField<Z> =>
		({
			label: "",
			mode: "value",
			name: `placeholder_${Math.random().toString(36).slice(2)}`,
			schema: [] as ParsedField[],
			size,
			type: "hidden" as const,
		}) as InternalField<Z>;

	for (const item of fields) {
		const field = item as InternalField<Z>;
		const isFillRowType = field.type === "fill";

		if (isFillRowType) {
			if (currentWidth > 0) {
				const remaining = GRID_WIDTH - currentWidth;
				currentRow.push(createPlaceholder(remaining as Sizes));
				result.push([...currentRow]);
				currentRow = [];
				currentWidth = 0;
			} else {
				result.push([createPlaceholder(12)]);
			}
			continue;
		}

		const itemWidth = field.size || 12;

		if (itemWidth < 1 || itemWidth > 12) {
			throw new Error(`Invalid size ${itemWidth} for field ${String(field.name) || "Unknown"}`);
		}

		if (currentWidth + itemWidth > GRID_WIDTH) {
			if (currentRow.length > 0) {
				const remaining = GRID_WIDTH - currentWidth;
				currentRow.push(createPlaceholder(remaining as Sizes));
				result.push([...currentRow]);
			}
			currentRow = [];
			currentWidth = 0;
		}

		if (!isFillRowType) {
			currentRow.push({
				...field,
				name: field.name,
				size: itemWidth,
			});
		}
		currentWidth += itemWidth;

		if (currentWidth === GRID_WIDTH) {
			result.push([...currentRow]);
			currentRow = [];
			currentWidth = 0;
		}
	}

	if (currentRow.length > 0) {
		const remaining = GRID_WIDTH - currentWidth;
		if (remaining > 0) {
			currentRow.push(createPlaceholder(remaining as Sizes));
		}
		result.push([...currentRow]);
	}

	result.forEach((row, index) => {
		const rowWidth = row.reduce((sum, item) => sum + (item.size ?? 6), 0);
		if (rowWidth !== GRID_WIDTH) {
			throw new Error(`Row ${index} has invalid width: ${rowWidth}`);
		}
	});

	return result;
}

const toBaseType = <C extends Components = NonNullable<unknown>>(type: string): FieldType<C> => {
	if (type === "string") {
		return "text" as FieldType<C>;
	}
	if (type === "number") {
		return "number" as FieldType<C>;
	}
	if (type === "boolean") {
		return "checkbox" as FieldType<C>;
	}
	return "text" as FieldType<C>;
};

const camelToLabel = (str: string) => {
	const words = str.split(/(?=[A-Z])/);
	const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	return capitalizedWords.join(" ");
};

const parseNestedPath = (name: string): { parentKey: string | null; childKey: string | null } => {
	const parts = name.split(".");
	if (parts.length === 1) {
		return { parentKey: null, childKey: null };
	}
	return {
		parentKey: parts[0]!,
		childKey: parts.slice(1).join("."),
	};
};

function isFieldsArray<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
>(fields: FieldsConfig<Z, C, Context>): fields is FormaField<Z, C, Context>[] {
	return Array.isArray(fields);
}

function isFieldsFunction<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
>(fields: FieldsConfig<Z, C, Context>): fields is FieldTransformFunction<Z, C, Context> {
	return typeof fields === "function";
}

function isFieldsObject<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
>(fields: FieldsConfig<Z, C, Context>): fields is FieldTransformObject<Z, C, Context> {
	return typeof fields === "object" && !Array.isArray(fields);
}

export function parseFields<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
>(
	fields: FieldsConfig<Z, C, Context> | undefined,
	schemaFields: ParsedField[],
): InternalField<Z>[] {
	let defaultFields: InternalField<Z>[] = [];

	// Treat empty array the same as undefined - use schema defaults
	const fieldsConfig =
		fields === undefined || (Array.isArray(fields) && fields.length === 0) ? undefined : fields;

	const autoFields: AutoField<C>[] = (schemaFields as ParsedField[]).map((field) => {
		const item: AutoField<C> = {
			label: camelToLabel(field.key),
			name: field.key,
			size: 12,
			type: toBaseType(field.type),
		};

		return item;
	});

	if (!fieldsConfig) {
		defaultFields = (schemaFields as ParsedField[]).map((field) => {
			const item: InternalField<Z> = {
				label: camelToLabel(field.key),
				mode: field.type === "array" ? "array" : "value",
				name: field.key,
				schema: field.schema!,
				size: 12,
				type: toBaseType(field.type),
			};

			return item;
		});
	} else if (fields !== undefined && isFieldsFunction(fields)) {
		const transformed = fields(autoFields);

		defaultFields = transformed
			.filter((field): field is Exclude<typeof field, SpacerType> => {
				return (field as any).name !== undefined;
			})
			.map((field) => {
				const schemaField = schemaFields.find((sf) => sf.key === field.name);
				return {
					...field,
					mode: schemaField?.type === "array" ? "array" : "value",
					schema: schemaField?.schema || ([] as ParsedField[]),
				} as InternalField<Z>;
			});
	} else if (fields !== undefined && isFieldsObject(fields)) {
		defaultFields = (schemaFields as ParsedField[]).map((field) => {
			const baseField: InternalField<Z> = {
				label: camelToLabel(field.key),
				mode: field.type === "array" ? "array" : "value",
				name: field.key,
				schema: field.schema!,
				size: 12,
				type: toBaseType(field.type),
			};

			const transform = fields[field.key as keyof typeof fields];
			if (transform) {
				let transformResult: Partial<AutoField<C>> | undefined;

				if (typeof transform === "function") {
					transformResult = (
						transform as (field: AutoField<C>) => Partial<AutoField<C>> | undefined
					)(baseField as AutoField<C>);
				} else {
					transformResult = transform as Partial<AutoField<C>>;
				}

				if (transformResult) {
					return {
						...baseField,
						...transformResult,
						name: field.key,
					} as InternalField<Z>;
				}
			}

			return baseField;
		});
	} else if (fields !== undefined && isFieldsArray(fields)) {
		const fieldMap = new Map<string, ParsedField>();

		for (const field of schemaFields) {
			fieldMap.set(field.key, field);
		}

		for (const field of fields) {
			const _field: InternalField<Z> = {
				...(field as any),
				mode: "value",
				schema: [] as ParsedField[],
			};

			const nestedPathInfo = _field.name
				? parseNestedPath(_field.name)
				: { parentKey: null as string | null, childKey: null as string | null };
			const { parentKey } = nestedPathInfo;

			if (parentKey && fieldMap.has(parentKey)) {
				const parentField = fieldMap.get(parentKey)!;
				if (parentField.type === "array") {
					_field.arrayPath = parentKey;
					_field.schema = parentField.schema || [];
				}
			} else if (_field.name && fieldMap.has(_field.name)) {
				const _fieldSchema = fieldMap.get(_field.name)!;
				_field.schema = _fieldSchema.schema!;
				_field.mode = _fieldSchema.type === "array" ? "array" : "value";
			}

			defaultFields.push(_field);
		}
	}

	return defaultFields;
}

export function defineFields<Z extends z.ZodObject<any>, Context = undefined>(config: {
	schema: Z;
	fields: FieldsConfig<Z, {}, Context>;
	context?: Context;
}) {
	return config.fields;
}
