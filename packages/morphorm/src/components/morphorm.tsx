// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import * as React from "react";
import { memo, useRef, useMemo, useImperativeHandle, useContext, useLayoutEffect } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

import type { ContextType, RowOverrides } from "../types";
import type { Components, FieldsConfig, FormSubmitHandler, FormField } from "../types";
import type { FormNode, ResolvedFieldConfig } from "../core/render-model";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Form as PrimitiveForm, useFormContext } from "./ui/form";
import { FormComponentsProvider, useFormKit } from "./form-context";
import { FormaContext } from "./provider";
import Field from "./form-field";
import { useAppForm } from "./form-hook";
import { FormSubmit, type FormaSubmitProps } from "./submit";
import { parseFields } from "../core/layout";
import { ZodProvider } from "@morphorm/core/zod";
import { PlusIcon, TrashIcon } from "./ui/icons";
import { buildArrayItemFields, buildRenderModel, normalizeFields } from "../core/render-model";
import { createStableWatchSelector } from "../core/watch";
import "./styles.css";

export interface FormState {
	canSubmit: boolean;
	isSubmitted: boolean;
	isSubmitting: boolean;
}

interface FormProps<
	Z extends z.ZodObject<any>,
	C extends Components,
	Context extends ContextType = ContextType,
> {
	schema: Z;
	initialValues?: z.input<Z>;
	fields?: FieldsConfig<Z, C, Context>;
	onSubmit?: FormSubmitHandler<Z>;
	onCancel?: () => void;
	components?: C;
	context?: Context;
	showSubmit?: boolean;
	children?: React.ReactNode;
	buttonSettings?: Omit<FormaSubmitProps, "onCancel">;
	rowOverrides?: RowOverrides<Z, C>;
	rowChildren?: React.ReactNode;
	scopeId?: string;
	ref?: React.Ref<ReturnType<typeof useAppForm>>;
}

interface RenderGridProps {
	nodes: FormNode[];
	rowOverrides?: RowOverrides<z.ZodObject<any>, Components>;
	rowChildren?: React.ReactNode;
}

const getDefaultsByType = (type: string) => {
	const map = {
		text: "",
		checkbox: false,
		number: 0,
	};
	return map[type as keyof typeof map];
};

const getDefaultValues = (template: ResolvedFieldConfig[]) =>
	template.reduce(
		(acc, field) => {
			acc[field.resolvedName] = getDefaultsByType(field.type);
			return acc;
		},
		{} as Record<string, unknown>,
	);

interface ContextAwareFieldProps {
	field: ResolvedFieldConfig;
}

const getLabelString = (label: unknown): string => {
	if (typeof label === "string") {
		return label;
	}
	return "";
};

interface ArrayFieldProps {
	arrayField: ResolvedFieldConfig;
	itemTemplate: ResolvedFieldConfig[];
}

const ArrayField = memo(({ arrayField, itemTemplate }: ArrayFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<typeof useAppForm>;
	const defaultValues = useMemo(() => getDefaultValues(itemTemplate), [itemTemplate]);

	if (itemTemplate.length === 0) {
		return null;
	}

	return (
		<div className="formaArray">
			<Collapsible defaultOpen>
				<form.AppField
					name={arrayField.name}
					mode="array"
				>
					{(field) => {
						const items = (field.state.value as unknown[]) || [];

						return (
							<div className="formaArrayBody">
								<div className="formaArrayHeader">
									<CollapsibleTrigger>
										<Label>{getLabelString(arrayField.label)}</Label>
									</CollapsibleTrigger>
									<Button
										type="button"
										data-testid={`add-${arrayField.name}`}
										onClick={() => field.pushValue(defaultValues as never)}
										size="sm"
									>
										<PlusIcon />
										Add {getLabelString(arrayField.label)}
									</Button>
								</div>

								<CollapsibleContent className="formaArrayContent">
									{items.length === 0 ? (
										<div className="formaArrayEmpty">
											<div>
												<h3 className="formaArrayEmptyTitle">No items</h3>
												<span className="formaArrayEmptyDescription">
													Click the + button to get started
												</span>
											</div>
										</div>
									) : (
										<div className="formaArrayItems">
											{items.map((_, idx) => {
												const parsedFields = buildArrayItemFields(
													arrayField.name,
													idx,
													itemTemplate,
												);
												const handleRemoveItem = () => field.removeValue(idx);

												return (
													<ArrayFieldItem
														key={idx}
														onRemove={handleRemoveItem}
														fields={parsedFields}
													/>
												);
											})}
										</div>
									)}
								</CollapsibleContent>
							</div>
						);
					}}
				</form.AppField>
			</Collapsible>
		</div>
	);
});

interface ArrayFieldItemProps {
	fields: ResolvedFieldConfig[];
	onRemove: () => void;
}

const ArrayFieldItem = memo(({ fields, onRemove }: ArrayFieldItemProps) => {
	const nodes = useMemo<FormNode[]>(
		() => fields.map((field) => ({ kind: "scalar", field })),
		[fields],
	);

	return (
		<div className="formaArrayItem">
			<Button
				type="button"
				className="formaArrayItemAction"
				variant="destructive"
				size="icon-sm"
				onClick={onRemove}
			>
				<TrashIcon className="formaIconSmall" />
			</Button>
			<RenderGrid nodes={nodes} />
		</div>
	);
});

const ContextAwareField = ({ field }: ContextAwareFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<typeof useAppForm>;
	const { context } = useFormKit();

	const hasWatch = field.watch && field.watch.length > 0;
	const hasWatchContext = field.watchContext && field.watchContext.length > 0;

	const slicedContext = useMemo(() => {
		if (!hasWatchContext) {
			return undefined;
		}
		return field.watchContext!.reduce((acc, key) => ({ ...acc, [key]: context?.[key] }), {} as any);
	}, [context, hasWatchContext, field.watchContext]);

	if (hasWatch) {
		const watchSelector = useMemo(
			() => createStableWatchSelector(field.watch!, field.name),
			[field.name, field.watch],
		);

		return (
			<form.Subscribe selector={watchSelector}>
				{(watchedValues) => (
					<form.AppField name={field.name as never}>
						{() => (
							<Field
								metadata={field as unknown as any}
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
		<form.AppField name={field.name as never}>
			{() => (
				<Field
					metadata={field as unknown as any}
					context={slicedContext}
					fieldValues={{}}
				/>
			)}
		</form.AppField>
	);
};

const RenderGrid = memo(({ nodes, rowOverrides, rowChildren }: RenderGridProps) => {
	const rows = useMemo(() => buildRenderModel(nodes), [nodes]);

	return (
		<div className="formaLayout">
			<div className="formaRows">
				{rows.map((row, rowIndex) => {
					const renderGrid = (
						<div className="formaGridRow">
							{row.map((node) => (
								<div
									key={node.field.name}
									className="formaGridCol"
									style={{
										gridColumn: `span ${node.field.size} / span ${node.field.size}`,
									}}
								>
									{node.kind === "scalar" && <ContextAwareField field={node.field} />}
									{node.kind === "array" && (
										<ArrayField
											arrayField={node.field}
											itemTemplate={node.itemTemplate}
										/>
									)}
								</div>
							))}
						</div>
					);

					if (rowOverrides) {
						const fields = row
							.filter((node) => node.kind !== "placeholder")
							.map((node) => node.field) as unknown as FormField<z.ZodObject<any>, Components>[];

						return (
							<div key={`row-${rowIndex + 1}`}>{rowOverrides(renderGrid, rowIndex, fields)}</div>
						);
					}

					return <div key={`row-${rowIndex + 1}`}>{renderGrid}</div>;
				})}
				{rowChildren}
			</div>
		</div>
	);
});

export const Form = <
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context extends ContextType = ContextType,
>(
	props: FormProps<Z, C, Context>,
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
	const parsedFields = useMemo(() => {
		const parsed = schemaProvider.parseSchema();
		return parseFields(fields, parsed.fields);
	}, [schemaProvider, fields]);

	const normalizedNodes = useMemo(() => normalizeFields(parsedFields), [parsedFields]);

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

	const handleCancel = () => {
		onCancel?.();
	};

	return (
		<FormComponentsProvider value={{ components, context, schema: parsedFields }}>
			<form.AppForm>
				<PrimitiveForm className="formaRoot">
					<RenderGrid
						nodes={normalizedNodes}
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
		</FormComponentsProvider>
	);
};

export default Form;
