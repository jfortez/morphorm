import type { Components } from "../types";

import { useFormInternal } from "./internal-context";
import { type DefaultComponentTypes, defaultComponents } from "../fields";

export type FieldType<C extends Components | undefined = NonNullable<unknown>> =
	| DefaultComponentTypes
	| keyof C;

interface _InternalProps<
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> = FieldType<C | undefined>,
> {
	inputType: T;
}

export type FieldComponentProps<
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> | FieldType = FieldType<C | undefined>,
> = C extends Components
	? React.ComponentProps<(typeof defaultComponents & C)[T]>
	: React.ComponentProps<(typeof defaultComponents)[T & DefaultComponentTypes]>;

export type BaseFieldProps<
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> | FieldType = FieldType<C | undefined>,
> = FieldComponentProps<C, T>;

const RenderField = <
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> = FieldType<C | undefined>,
>({
	inputType,
	...props
}: BaseFieldProps<C, T> & _InternalProps<C, T>) => {
	const { components } = useFormInternal();
	const Component = { ...defaultComponents, ...(components as C) }[inputType];

	if (!Component) {
		return null;
	}

	return <Component {...props} />;
};

export default RenderField;
