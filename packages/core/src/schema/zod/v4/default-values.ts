import * as z from "zod/v4/core";

export function getDefaultValueInZodStack(schema: z.$ZodType): any {
	if (schema instanceof z.$ZodDefault) {
		return schema._zod.def.defaultValue;
	}
	if ("innerType" in schema._zod.def) {
		return getDefaultValueInZodStack(schema._zod.def.innerType as z.$ZodType);
	}
	return getTypeBasedDefault(schema);
}

function getTypeBasedDefault(schema: z.$ZodType): any {
	const type = schema._zod.def.type as string;

	if (type === "string") {
		return "";
	}
	if (type === "number" || type === "int") {
		return 0;
	}
	if (type === "boolean") {
		return false;
	}

	return undefined;
}

export function getDefaultValues(schema: z.$ZodObject): Record<string, any> {
	const shape = schema._zod.def.shape;

	const defaultValues: Record<string, any> = {};

	for (const [key, field] of Object.entries(shape)) {
		defaultValues[key] = getDefaultValueInZodStack(field);
	}

	return defaultValues;
}
