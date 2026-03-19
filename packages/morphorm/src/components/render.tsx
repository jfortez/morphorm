// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import * as React from "react";
import { memo, useMemo } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

import type { RowOverrides } from "../types";
import type { FieldComponents, FormField } from "../types";
import type { FormNode, ResolvedFieldConfig } from "../core/render-model";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useFormInternal } from "./internal-context";
import { useFormContext } from "@/core/builder";
import { PlusIcon, TrashIcon } from "./ui/icons";
import { buildArrayItemFields, buildRenderModel } from "../core/render-model";
import { createStableWatchSelector } from "../core/watch";
import Field from "./field";

import type { UseAppFormType } from "../types";

export interface FormState {
	canSubmit: boolean;
	isSubmitted: boolean;
	isSubmitting: boolean;
}

interface RenderProps {
	nodes: FormNode[];
	rowOverrides?: RowOverrides<z.ZodObject<any>, FieldComponents>;
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
	const form = useFormContext() as unknown as ReturnType<UseAppFormType>;
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
			<Render nodes={nodes} />
		</div>
	);
});

const ContextAwareField = ({ field }: ContextAwareFieldProps) => {
	const form = useFormContext() as unknown as ReturnType<UseAppFormType>;
	const { context } = useFormInternal();

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
								metadata={field}
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
					metadata={field}
					context={slicedContext}
					fieldValues={{}}
				/>
			)}
		</form.AppField>
	);
};

const Render = memo(({ nodes, rowOverrides, rowChildren }: RenderProps) => {
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
							.map((node) => node.field) as unknown as FormField<
							z.ZodObject<any>,
							FieldComponents
						>[];

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

export default Render;
