// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import * as React from "react";
import { memo, useEffect, useMemo, useRef } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

import type { SubmitProps } from "./subtmit";
import type { RowOverrides } from "../types";
import type { Components, FieldsConfig, FormSubmitHandler, FormaField } from "../types";
import type { InternalField } from "../util";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Form, useFieldContext, useFormContext } from "./ui/form";
import { FormComponentsProvider, useFormKit } from "./form-context";
import FormField from "./form-field";
import { useAppForm } from "./form-hook";
import { SubmitButton } from "./subtmit";
import { generateGrid, parseFields } from "../util";
import { ZodProvider } from "@morphorm/core/zod";
import { PlusIcon, TrashIcon } from "./ui/icons";
import "./index.css";

export interface FormState {
	canSubmit: boolean;
	isSubmitted: boolean;
	isSubmitting: boolean;
}

interface FormProps<Z extends z.ZodObject<any>, C extends Components, Context = any> {
	schema: Z;
	initialValues?: z.input<Z>;
	fields?: FieldsConfig<Z, C, Context>;
	onSubmit?: FormSubmitHandler<Z>;
	onCancel?: () => void;
	onStateChange?: (state: FormState) => void;
	components?: C;
	context?: Context;
	showSubmit?: boolean;
	children?: React.ReactNode;
	buttonSettings?: Omit<SubmitProps, "handleCancel">;
	rowOverrides?: RowOverrides<Z, C>;
	rowChildren?: React.ReactNode;
}

interface RenderGridProps {
	parsedFields: InternalField[];
	rowOverrides?: RowOverrides<z.ZodObject<any>, Components>;
	rowChildren?: React.ReactNode;
}

const getDefaultsByType = (type: string) => {
	const map = {
		text: "",
	};
	return map[type as keyof typeof map];
};

interface ArrayItemProps {
	label?: string;
	defaultValues?: Record<string, unknown>;
}

const getDefaultValues = (parsedFields: InternalField[]) =>
	parsedFields.reduce(
		(acc, field) => {
			acc[field.name] = getDefaultsByType(field.type);
			return acc;
		},
		{} as Record<string, unknown>,
	);

const ArrayItemControl = ({ defaultValues, label }: ArrayItemProps) => {
	const field = useFieldContext();

	const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		e.preventDefault();
		field.pushValue(defaultValues as never);
	};
	return (
		<div className="forma-flex forma-flex--items-center forma-flex--justify-between">
			<Label>{label}</Label>
			<div className="forma-flex forma-flex--items-center forma-flex--justify-end">
				<Button
					onClick={handleAddItem}
					size={label ? "sm" : "icon"}
				>
					<PlusIcon />
					{label && `Add ${label}`}
				</Button>
			</div>
		</div>
	);
};

interface ContextAwareFieldProps {
	col: InternalField;
	mode: "value" | "array";
}

const shallowCompare = (obj1: any, obj2: any): boolean => {
	if (obj1 === obj2) {
		return true;
	}
	if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") {
		return false;
	}
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) {
		return false;
	}
	for (const key of keys1) {
		if (obj1[key] !== obj2[key]) {
			return false;
		}
	}
	return true;
};

const getLabelString = (label: unknown): string => {
	if (typeof label === "string") {
		return label;
	}
	return "";
};

const ContextAwareField = ({ col, mode }: ContextAwareFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<typeof useAppForm>;
	const { context } = useFormKit();
	const prevSlicedContextRef = useRef<any>(null);

	const slicedContext = useMemo(() => {
		if (!col.watchContext || col.watchContext.length === 0) {
			return undefined;
		}

		const newResult = col.watchContext.reduce(
			(acc, key) => ({ ...acc, [key]: context?.[key] }),
			{} as any,
		);

		if (shallowCompare(newResult, prevSlicedContextRef.current)) {
			return prevSlicedContextRef.current;
		}

		prevSlicedContextRef.current = newResult;
		return newResult;
	}, [context, col.watchContext]);

	const prevWatchedValuesRef = useRef<Record<string, unknown>>({});

	const watchedValues = useMemo(() => {
		if (!col.watch || col.watch.length === 0) {
			return {};
		}

		const values: Record<string, unknown> = {};
		for (const key of col.watch) {
			const fieldValue = form.getFieldValue(key as never);
			values[key] = fieldValue;
		}

		if (shallowCompare(values, prevWatchedValuesRef.current)) {
			return prevWatchedValuesRef.current;
		}

		prevWatchedValuesRef.current = values;
		return values;
	}, [col.watch, form]);

	if (mode === "array") {
		const schema = col.schema![0]!.schema!;
		const nextParsedFields = parseFields([], schema);
		if (nextParsedFields.length === 0) {
			return null;
		}
		const defaultValues = getDefaultValues(nextParsedFields);

		return (
			<div className="forma-group">
				<Collapsible defaultOpen>
					<form.Field
						name={col.name as never}
						mode="array"
					>
						{(field: any) => {
							const items = (field.state.value as unknown[]) || [];

							return (
								<div className="forma-flex forma-flex--col forma-flex--gap-2">
									<CollapsibleTrigger
										className="forma-bg-background"
										asChild
									>
										<div>
											<ArrayItemControl
												label={getLabelString(col.label)}
												defaultValues={defaultValues}
											/>
										</div>
									</CollapsibleTrigger>

									<CollapsibleContent className="forma-group forma-bg-accent-hover forma-bg-background">
										{items.length === 0 ? (
											<div className="forma-array-empty">
												<div>
													<h3 className="forma-array-empty__title">No items</h3>
													<span className="forma-array-empty__description">
														Add an item to get started
													</span>
												</div>
											</div>
										) : (
											<div className="forma-flex forma-flex--col forma-flex--gap-3">
												{items.map((_, idx) => {
													const parsedFields = nextParsedFields.map((item) => ({
														...item,
														name: `${col.name}[${idx}].${item.name}`,
													}));

													const handleRemoveItem = () => {
														field.removeValue(idx);
													};
													return (
														<div
															className="forma-array-item"
															key={idx}
														>
															<Button
																type="button"
																className="forma-array-item__actions forma-button--icon-sm"
																variant="destructive"
																size="icon-sm"
																onClick={handleRemoveItem}
															>
																<TrashIcon className="forma-icon-sm" />
															</Button>
															<RenderGrid parsedFields={parsedFields} />
														</div>
													);
												})}
											</div>
										)}
									</CollapsibleContent>
								</div>
							);
						}}
					</form.Field>
				</Collapsible>
			</div>
		);
	}

	return (
		<form.AppField name={col.name as never}>
			{() => (
				<FormField
					metadata={col as unknown as any}
					context={slicedContext}
					fieldValues={watchedValues}
				/>
			)}
		</form.AppField>
	);
};

const RenderGrid = memo(({ parsedFields, rowOverrides, rowChildren }: RenderGridProps) => {
	const rowFields = useMemo(() => generateGrid(parsedFields), [parsedFields]);

	return (
		<div className="forma-flex forma-flex--col forma-flex--gap-4">
			<div className="forma-flex forma-flex--col forma-flex--gap-4">
				{rowFields.map((row, index) => {
					const visibleFields = row.filter((col) => col.type !== "hidden");

					const renderGrid = (
						<div className="forma-row">
							{row.map((col) => (
								<div
									key={col.name}
									className="forma-col"
									style={{
										gridColumn: `span ${col.size} / span ${col.size}`,
									}}
								>
									{col.type !== "hidden" && (
										<ContextAwareField
											col={col}
											mode={col.mode}
										/>
									)}
								</div>
							))}
						</div>
					);

					if (rowOverrides) {
						return (
							<div key={`row-${index + 1}`}>
								{rowOverrides(
									renderGrid,
									index,
									visibleFields as unknown as FormaField<z.ZodObject<any>, Components>[],
								)}
							</div>
						);
					}

					return <div key={`row-${index + 1}`}>{renderGrid}</div>;
				})}
				{rowChildren}
			</div>
		</div>
	);
});

export const Forma = <
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = undefined,
>(
	props: FormProps<Z, C, Context>,
) => {
	const {
		schema,
		initialValues,
		fields = undefined,
		onSubmit,
		onCancel,
		onStateChange,
		showSubmit = false,
		components = {},
		context,
		children,
		buttonSettings,
		rowOverrides,
		rowChildren,
	} = props;

	const schemaProvider = useMemo(() => new ZodProvider(schema), [schema]);
	const parsedFields = useMemo(() => {
		const parsed = schemaProvider.parseSchema();

		return parseFields(fields, parsed.fields);
	}, [schemaProvider, fields]);

	const defaultValues = useMemo<z.input<Z>>(() => {
		if (initialValues) {
			return initialValues;
		}
		return schemaProvider.getDefaultValues() as z.input<Z>;
	}, [initialValues, schemaProvider]);

	const form = useAppForm({
		defaultValues,
		onSubmit: async (submitValues) => {
			await onSubmit?.(submitValues.value as z.input<any>);
		},
		validators: {
			onSubmit: schema,
		},
	});

	useEffect(() => {
		if (!onStateChange) {
			return;
		}

		const unsubscribe = form.store.subscribe(() => {
			const currentState = form.store.state;
			onStateChange({
				canSubmit: currentState.canSubmit,
				isSubmitted: currentState.isSubmitted,
				isSubmitting: currentState.isSubmitting,
			});
		});

		const initialState = form.store.state;
		onStateChange({
			canSubmit: initialState.canSubmit,
			isSubmitted: initialState.isSubmitted,
			isSubmitting: initialState.isSubmitting,
		});

		return unsubscribe;
	}, [form.store, onStateChange]);

	const handleCancel = () => {
		onCancel?.();
	};

	return (
		<FormComponentsProvider value={{ components, context, schema: parsedFields }}>
			<form.AppForm>
				<Form className="forma-form forma-form--gap-6">
					<RenderGrid
						parsedFields={parsedFields}
						rowOverrides={rowOverrides as never}
						rowChildren={rowChildren}
					/>
					{showSubmit && (
						<SubmitButton
							handleCancel={handleCancel}
							{...buttonSettings}
						/>
					)}
					{children}
				</Form>
			</form.AppForm>
		</FormComponentsProvider>
	);
};
export default Forma;
