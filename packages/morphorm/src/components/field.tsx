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
	const dynamicKeys = useMemo(() => {
		const keys = Object.keys(_metadata) as (keyof typeof _metadata)[];
		const dynamic: string[] = [];
		const staticProps: Record<string, any> = {};

		keys.forEach((key) => {
			const value = _metadata[key];
			if (key === "fieldProps" && value && typeof value === "object") {
				const metaProps = value as Record<string, unknown>;
				const hasCustomMetaValue = Object.values(metaProps).some((v) => typeof v === "function");
				if (hasCustomMetaValue) {
					dynamic.push(key);
				} else {
					staticProps[key as string] = value;
				}
			} else if (typeof value === "function") {
				dynamic.push(key as string);
			} else {
				staticProps[key as string] = value;
			}
		});
		return { dynamic, staticProps };
	}, [_metadata]);

	const metadata = useMemo(() => {
		const { dynamic, staticProps } = dynamicKeys;
		if (dynamic.length === 0) {
			return { ...staticProps, ..._metadata } as any;
		}

		const computedDynamic = dynamic.reduce((acc, currentKey) => {
			const value = (_metadata as any)[currentKey];
			if (currentKey === "fieldProps") {
				const fieldProps = value as Record<string, unknown>;
				const newFieldProps = Object.keys(fieldProps).reduce((propsAcc, propKey) => {
					const propValue = fieldProps[propKey];
					if (typeof propValue === "function") {
						return {
							...propsAcc,
							[propKey]: propValue({
								context,
								fieldValues: fieldValues ?? {},
							}),
						};
					}
					return { ...propsAcc, [propKey]: propValue };
				}, {});
				return { ...acc, [currentKey]: newFieldProps };
			}
			if (typeof value === "function") {
				return {
					...acc,
					[currentKey]: value({ context, fieldValues: fieldValues ?? {} }),
				};
			}
			return acc;
		}, {});

		return { ...staticProps, ...computedDynamic } as any;
	}, [dynamicKeys, _metadata, fieldValues, context]);

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
