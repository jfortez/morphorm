// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";
import type { ParsedField } from '@morphorm/core/types'

import type {
	Components,
	FormaField,
	FieldTransformer,
	Sizes,
	SpacerType,
} from "./types";

type _FieldWithoutType<Z extends z.ZodObject<any>> = Omit<
	Exclude<FormaField<Z, NonNullable<unknown>>, SpacerType>,
	"type"
>;

export type InternalField<Z extends z.ZodObject<any> = z.ZodObject<any>> = _FieldWithoutType<Z> & {
	type: string;
	mode: "value" | "array";
	schema: ParsedField[];
	watch?: string[];
	watchContext?: string[];
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

const toBaseType = (type: string) => {
	if (type === "string") { return "text"; }
	if (type === "number") { return "number"; }
	if (type === "boolean") { return "checkbox"; }
	return "text";
};

const camelToLabel = (str: string) => {
	const words = str.split(/(?=[A-Z])/);
	const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	return capitalizedWords.join(" ");
};

export function parseFields<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
>(
	fields: FormaField<Z, C>[],
	schemaFields: ParsedField[],
	fieldTransformer?: FieldTransformer<Z, C>,
): InternalField<Z>[] {
	let defaultFields: InternalField<Z>[] = [];

	if (!fields || fields.length === 0) {
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
	}

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
		if (_field.name && fieldMap.has(_field.name)) {
			const _fieldSchema = fieldMap.get(_field.name)!;
			_field.schema = _fieldSchema.schema!;
			_field.mode = _fieldSchema.type === "array" ? "array" : "value";
		}

		defaultFields.push(_field);
	}

	const getTransformResult = (
		field: InternalField<Z>,
		transformer: FieldTransformer<Z, C>,
	): InternalField<Z> => {
		const { name } = field;

		const privateValues = {
			name,
		};
		if (typeof transformer === "function") {
			const transformResult = transformer(field as any);
			if (transformResult) {
				return {
					...field,
					...transformResult,
					...privateValues,
				} as unknown as InternalField<Z>;
			}
			return field as InternalField<Z>;
		}
		if (typeof transformer === "object") {
			const transformResult = transformer[name];
			if (!transformResult) { return field as InternalField<Z>; }

			return {
				...field,
				...(typeof transformResult === "function"
					? transformResult(field as any)
					: transformResult),
				...privateValues,
			} as unknown as InternalField<Z>;
		}

		return field as InternalField<Z>;
	};

	return defaultFields.map((field) => {
		if (field.type === "fill") { return field; }
		if (!fieldTransformer) { return field; }
		return getTransformResult(field, fieldTransformer);
	});
}
