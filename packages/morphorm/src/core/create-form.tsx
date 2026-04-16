// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import * as React from "react";
import {
	useRef,
	useMemo,
	useImperativeHandle,
	useContext,
	useLayoutEffect,
	useCallback,
} from "react";

import type { ContextType, FormField, RowOverrides, UseAppFormType } from "../types";
import type { FieldComponents, FieldsConfig, FormSubmitHandler } from "../types";

import { Form as PrimitiveForm } from "@/components/ui/form";
import { InternalProvider } from "@/components/internal-context";
import { FormaContext } from "@/components/provider";

import { FormSubmit, type FormaSubmitProps } from "@/components/submit";
import { parseFields } from "../core/layout";
import { ZodProvider } from "@morphorm/core/zod";
import { normalizeFields } from "../core/render-model";
import Render from "@/components/render";

import "../components/styles.css";

export interface FormProps<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = Record<never, never>,
	Context extends ContextType = ContextType,
> {
	schema: Z;
	initialValues?: z.input<Z>;
	fields?: FieldsConfig<Z, C, Context>;
	onSubmit?: FormSubmitHandler<Z>;
	onCancel?: () => void;
	components?: Partial<C>;
	context?: Context;
	showSubmit?: boolean;
	children?: React.ReactNode;
	buttonSettings?: Omit<FormaSubmitProps, "onCancel" | "onSubmit">;
	rowOverrides?: RowOverrides<Z, C>;
	rowChildren?: React.ReactNode;
	scopeId?: string;
	ref?: React.Ref<ReturnType<UseAppFormType>>;
}

export const createFormComponent = <InitComponents extends FieldComponents>(
	useAppForm: UseAppFormType,
) => {
	const $field = <
		Z extends z.ZodObject<any> = z.ZodObject<any>,
		C extends FieldComponents = Record<never, never>,
		Context extends ContextType = ContextType,
	>() => {
		return undefined as unknown as FormField<Z, InitComponents & C, Context>;
	};

	function defineFields<
		Z extends z.ZodObject<any> = z.ZodObject<any>,
		C extends FieldComponents = Record<never, never>,
		Context extends ContextType = ContextType,
		Field extends FormField<Z, InitComponents & C, Context> = FormField<
			Z,
			InitComponents & C,
			Context
		>,
	>(config: { schema?: Z; fields: Field[]; context?: Context }) {
		return config.fields;
	}

	const Form = <
		Z extends z.ZodObject<any> = z.ZodObject<any>,
		C extends FieldComponents = Record<never, never>,
		Context extends ContextType = ContextType,
	>(
		props: FormProps<Z, InitComponents & C, Context>,
	) => {
		const {
			schema,
			initialValues,
			fields = undefined,
			onSubmit,
			onCancel,
			showSubmit = false,
			components = {},
			context,
			children,
			buttonSettings,
			rowOverrides,
			rowChildren,
			scopeId = "",
			ref,
		} = props;

		const formaContext = useContext(FormaContext);
		const hasFormaProvider = formaContext !== null;

		const schemaProvider = useMemo(() => new ZodProvider(schema), [schema]);
		const fieldNodes = useMemo(() => {
			const schemaParsed = schemaProvider.parseSchema();
			const parsedFields = parseFields(fields, schemaParsed.fields);

			return normalizeFields(parsedFields);
		}, [schemaProvider, fields]);

		const defaultValues = useMemo<z.input<Z>>(() => {
			if (initialValues) {
				return initialValues;
			}
			return schemaProvider.getDefaultValues() as z.input<Z>;
		}, [initialValues, schemaProvider]);

		const form = useAppForm({
			defaultValues,
			onSubmit: useCallback(
				async (submitValues: { value: unknown }) => {
					await onSubmit?.(submitValues.value as z.input<any>);
				},
				[onSubmit],
			),
			validators: {
				onSubmit: schema,
			},
		});

		const unsub = useRef<() => void>(null!);

		if (unsub.current === null && hasFormaProvider && formaContext) {
			unsub.current = formaContext.registerForm(scopeId, form as any);
		}

		useLayoutEffect(() => {
			if (hasFormaProvider && formaContext) {
				return unsub.current;
			}
		}, [hasFormaProvider, formaContext, scopeId, form]);

		useImperativeHandle(ref, () => form as any);

		const handleCancel = useCallback(() => {
			onCancel?.();
		}, [onCancel]);

		return (
			<InternalProvider value={{ components, context }}>
				<form.AppForm>
					<PrimitiveForm className="formaRoot">
						<Render
							nodes={fieldNodes}
							rowOverrides={rowOverrides as never}
							rowChildren={rowChildren}
						/>
						{showSubmit && (
							<FormSubmit
								onCancel={handleCancel}
								{...(buttonSettings as any)}
							/>
						)}
						{children}
					</PrimitiveForm>
				</form.AppForm>
			</InternalProvider>
		);
	};

	Form.displayName = "Morphorm";

	return { Form, $field, defineFields };
};
