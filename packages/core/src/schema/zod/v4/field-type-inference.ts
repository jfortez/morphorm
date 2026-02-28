import * as z from "zod/v4/core";

import type { FieldConfig } from "../../../types";

export function inferFieldType(schema: z.$ZodType, fieldConfig?: FieldConfig): string {
	if (fieldConfig?.fieldType) {
		return fieldConfig.fieldType;
	}

	if (schema instanceof z.$ZodObject) return "object";
	if (schema instanceof z.$ZodString) return "string";
	if (schema instanceof z.$ZodNumber) return "number";
	if (schema instanceof z.$ZodBoolean) return "boolean";
	if (schema instanceof z.$ZodDate) return "date";
	if (schema instanceof z.$ZodEnum) return "select";
	if (schema instanceof z.$ZodArray) return "array";

	return "string";
}
