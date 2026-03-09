// oxlint-disable typescript/no-explicit-any
import type { InternalField } from "./layout";

import { generateGrid, parseFields } from "./layout";

export interface ResolvedFieldConfig extends InternalField {
	resolvedName: string;
	rootArrayName?: string;
}

export type FormNode =
	| {
			kind: "scalar";
			field: ResolvedFieldConfig;
	  }
	| {
			kind: "array";
			field: ResolvedFieldConfig;
			itemTemplate: ResolvedFieldConfig[];
	  }
	| {
			kind: "placeholder";
			field: ResolvedFieldConfig;
	  };

const normalizeResolvedField = (
	field: InternalField,
	rootArrayName?: string,
): ResolvedFieldConfig => {
	const resolvedName =
		rootArrayName && field.name.startsWith(`${rootArrayName}.`)
			? field.name.slice(rootArrayName.length + 1)
			: field.name;

	return {
		...field,
		resolvedName,
		rootArrayName,
	};
};

const buildArrayItemTemplate = (
	arrayField: InternalField,
	arrayChildren: InternalField[],
): ResolvedFieldConfig[] => {
	const nestedSchema = arrayField.schema?.[0]?.schema ?? [];
	if (nestedSchema.length === 0) {
		return [];
	}

	if (arrayChildren.length === 0) {
		return parseFields(undefined, nestedSchema).map((field) =>
			normalizeResolvedField(field, arrayField.name),
		);
	}

	const fieldsAsObject = arrayChildren.reduce(
		(acc, field) => {
			const {
				name,
				arrayPath: _arrayPath,
				mode: _mode,
				schema: _schema,
				...fieldConfig
			} = field as InternalField & Record<string, unknown>;

			const childName = name.startsWith(`${arrayField.name}.`)
				? name.slice(arrayField.name.length + 1)
				: name;
			acc[childName] = fieldConfig;
			return acc;
		},
		{} as Record<string, any>,
	);

	return parseFields(fieldsAsObject, nestedSchema).map((field) =>
		normalizeResolvedField(field, arrayField.name),
	);
};

export const normalizeFields = (parsedFields: InternalField[]): FormNode[] => {
	const arrayChildrenByParent = new Map<string, InternalField[]>();
	for (const field of parsedFields) {
		if (!field.arrayPath) {
			continue;
		}
		const existing = arrayChildrenByParent.get(field.arrayPath) ?? [];
		existing.push(field);
		arrayChildrenByParent.set(field.arrayPath, existing);
	}

	const topLevelFields = parsedFields.filter((field) => !field.arrayPath);

	return topLevelFields.map((field) => {
		const resolvedField = normalizeResolvedField(field);
		if (field.mode === "array") {
			const arrayChildren = arrayChildrenByParent.get(field.name) ?? [];
			const itemTemplate = buildArrayItemTemplate(field, arrayChildren);
			return {
				kind: "array",
				field: resolvedField,
				itemTemplate,
			} satisfies FormNode;
		}

		return {
			kind: "scalar",
			field: resolvedField,
		} satisfies FormNode;
	});
};

export const buildRenderModel = (nodes: FormNode[]): FormNode[][] => {
	const fields = nodes.map((node) => node.field);
	const rows = generateGrid(fields);
	const nodeByName = new Map(nodes.map((node) => [node.field.name, node]));

	return rows.map((row) => {
		return row.map((field) => {
			const matchedNode = nodeByName.get(field.name);
			if (matchedNode) {
				return {
					...matchedNode,
					field: {
						...matchedNode.field,
						size: field.size,
					},
				} satisfies FormNode;
			}

			return {
				kind: "placeholder",
				field: normalizeResolvedField(field),
			} satisfies FormNode;
		});
	});
};

export const buildArrayItemFields = (
	arrayName: string,
	itemIndex: number,
	template: ResolvedFieldConfig[],
): ResolvedFieldConfig[] => {
	return template.map((field) => ({
		...field,
		name: `${arrayName}[${itemIndex}].${field.resolvedName}`,
	}));
};
