import type { Components } from "../types";

import { useFormKit } from "../components/form-context";

import Input from "./input";
import Number from "./number";
import Checkbox from "./checkbox";
import TextArea from "./textarea";
import Select from "./select";
import Radio from "./radio";

const BaseInputComponents = {
	checkbox: Checkbox,
	number: Number,
	radio: Radio,
	select: Select,
	text: Input,
	textarea: TextArea,
};

export type BaseFieldType = keyof typeof BaseInputComponents;

export type FieldType<C extends Components | undefined = NonNullable<unknown>> =
	| BaseFieldType
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
	? React.ComponentProps<(typeof BaseInputComponents & C)[T]>
	: React.ComponentProps<(typeof BaseInputComponents)[T & BaseFieldType]>;

export type BaseFieldProps<
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> | FieldType = FieldType<C | undefined>,
> = FieldComponentProps<C, T>;

const Field = <
	C extends Components | undefined = undefined,
	T extends FieldType<C | undefined> = FieldType<C | undefined>,
>({
	inputType,
	...props
}: BaseFieldProps<C, T> & _InternalProps<C, T>) => {
	const { components } = useFormKit();
	const Component = { ...BaseInputComponents, ...(components as C) }[inputType];

	if (!Component) {
		return null;
	}

	return <Component {...props} />;
};

export default Field;
