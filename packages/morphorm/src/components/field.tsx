// oxlint-disable typescript/no-explicit-any

import { useMemo } from "react";

import type { z } from "zod";

import type { FieldComponents, ContextType, FormFieldType } from "../types";

import {
	FieldControl,
	FieldDescription,
	FieldError,
	FieldLabel,
	Field as FieldPrimitive,
} from "./ui/form";
import RenderField from "./render-field";

interface FormInputProps<
	C extends FieldComponents = NonNullable<unknown>,
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	Context extends ContextType = ContextType,
> {
	metadata: FormFieldType<C, Z, Context>;
	context?: Context;
	fieldValues?: Record<string, unknown>;
}

const FormField = <
	C extends FieldComponents = NonNullable<unknown>,
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	Context extends ContextType = ContextType,
>({
	metadata: _metadata,
	context,
	fieldValues,
}: FormInputProps<C, Z, Context>) => {
	const metadata = useMemo(() => {
		const args = { context, fieldValues: fieldValues ?? {} };
		const result: Record<string, any> = {};

		for (const key of Object.keys(_metadata) as (keyof typeof _metadata)[]) {
			const value = (_metadata as any)[key];
			if (key === "fieldProps" && value && typeof value === "object") {
				const metaProps = value as Record<string, unknown>;
				const resolvedProps: Record<string, unknown> = {};
				for (const propKey of Object.keys(metaProps)) {
					const propValue = metaProps[propKey];
					resolvedProps[propKey] = typeof propValue === "function" ? propValue(args) : propValue;
				}
				result[key as string] = resolvedProps;
			} else if (typeof value === "function") {
				result[key as string] = value(args);
			} else {
				result[key as string] = value;
			}
		}

		return result as any;
	}, [_metadata, fieldValues, context]);

	const fieldElement = (
		<FieldPrimitive data-testid={`field-${metadata.name}`}>
			{metadata.label && (
				<FieldLabel data-testid={`label-${metadata.name}`}>{metadata.label}</FieldLabel>
			)}
			<FieldControl data-testid={`control-${metadata.name}`}>
				{metadata.element ? (
					metadata.element
				) : (
					<RenderField
						name={metadata.name}
						inputType={metadata.type}
						{...metadata.fieldProps}
						placeholder={metadata.placeholder}
						disabled={metadata.disabled}
					/>
				)}
			</FieldControl>
			{metadata.description && (
				<FieldDescription data-testid={`description-${metadata.name}`}>
					{metadata.description}
				</FieldDescription>
			)}
			<FieldError data-testid={`error-${metadata.name}`} />
		</FieldPrimitive>
	);

	return (
		<>{metadata.overrides ? metadata.overrides(fieldElement, metadata as any) : fieldElement}</>
	);
};

export default FormField;
