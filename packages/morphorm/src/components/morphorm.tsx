// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import * as React from "react";
import { memo, useEffect, useMemo } from "react";

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

const getLabelString = (label: unknown): string => {
	if (typeof label === "string") {
		return label;
	}
	return "";
};

interface ArrayFieldProps {
	col: InternalField;
}
const ArrayField = memo(({ col }: ArrayFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<typeof useAppForm>;

	const schema = col.schema![0]!.schema!;
	const nextParsedFields = parseFields([], schema);
	const defaultValues = getDefaultValues(nextParsedFields);

	if (nextParsedFields.length === 0) {
		return null;
	}

	return (
		<div className="forma-group">
			<Collapsible defaultOpen>
				<form.Field
					name={col.name as never}
					mode="array"
				>
					{(field) => {
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
													<ArrayFieldItem
														key={idx}
														onRemove={handleRemoveItem}
														parsedFields={parsedFields}
													/>
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
});

interface ArrayFieldItemProps {
	parsedFields: InternalField[];
	onRemove: () => void;
}

const ArrayFieldItem = memo(({ parsedFields, onRemove }: ArrayFieldItemProps) => {
	return (
		<div className="forma-array-item">
			<Button
				type="button"
				className="forma-array-item__actions forma-button--icon-sm"
				variant="destructive"
				size="icon-sm"
				onClick={onRemove}
			>
				<TrashIcon className="forma-icon-sm" />
			</Button>
			<RenderGrid parsedFields={parsedFields} />
		</div>
	);
});

const ContextAwareField = ({ col, mode }: ContextAwareFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<typeof useAppForm>;
	const { context } = useFormKit();

	const hasWatch = col.watch && col.watch.length > 0;
	const hasWatchContext = col.watchContext && col.watchContext.length > 0;

	const slicedContext = useMemo(() => {
		if (!hasWatchContext) {
			return undefined;
		}

		return col.watchContext!.reduce((acc, key) => ({ ...acc, [key]: context?.[key] }), {} as any);
	}, [context, hasWatchContext, col.watchContext]);

	if (mode === "array") {
		return <ArrayField col={col} />;
	}

	if (hasWatch) {
		const watchSelector = (state: any) => {
			const values: Record<string, unknown> = {};
			for (const key of col.watch!) {
				values[key] = state.values?.[key];
			}
			return values;
		};

		return (
			<form.Subscribe selector={watchSelector}>
				{(watchedValues) => (
					<form.AppField name={col.name as never}>
						{() => (
							<FormField
								metadata={col as unknown as any}
								context={slicedContext}
								fieldValues={watchedValues}
							/>
						)}
					</form.AppField>
				)}
			</form.Subscribe>
		);
	}

	return (
		<form.AppField name={col.name as never}>
			{() => (
				<FormField
					metadata={col as unknown as any}
					context={slicedContext}
					fieldValues={{}}
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
