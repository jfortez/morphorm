// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import type { FormFieldType } from "./components/form-field";

export type Components = Record<string, React.ComponentType<any>>;

export type Sizes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface SpacerType {
	type: "fill";
	size?: Sizes;
}

export interface FnArgs<Z extends z.ZodObject<any> = z.ZodObject<any>, ContextType = any> {
	fieldValues: z.infer<Z>;
	context: ContextType;
}

export type ValueOrFunction<T, Args> = T | ((args: Args) => T);

export interface BaseField<Z extends z.ZodObject<any> = z.ZodObject<any>, Context = any> {
	name: string;
	element?: React.ReactNode;
	label?: ValueOrFunction<string | React.ReactNode, FnArgs<Z, Context>>;
	placeholder?: ValueOrFunction<string, FnArgs<Z, Context>>;
	description?: ValueOrFunction<string, FnArgs<Z, Context>>;
	disabled?: ValueOrFunction<boolean, FnArgs<Z, Context>>;
	watchContext?: string[];
}

export type FormaField<
	ZObject extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> =
	| (BaseField<ZObject, Context> &
			FormFieldType<C, ZObject, Context> & {
				name: keyof z.infer<ZObject>;
				size?: Sizes;
				watch?: string[];
				overrides?: (
					originalElement: React.JSX.Element,
					meta: FormFieldType<C, ZObject, Context>,
				) => React.ReactNode;
			})
	| SpacerType;

type MaybePromise<T> = T | Promise<T>;

export type FormSubmitHandler<Z extends z.ZodObject<any>> = (
	values: z.infer<Z>,
) => MaybePromise<void>;

type _TransformField<C extends Components = NonNullable<unknown>> = FormFieldType<C> & {
	size?: Sizes;
};

type FieldTransformFunction<Z extends z.ZodObject<any>, C extends Components> = (
	field: Exclude<FormaField<Z, C>, SpacerType>,
) => Partial<_TransformField<C>> | undefined;

type FieldTransformObject<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
> = Partial<{
	[K in keyof z.infer<Z>]: Partial<_TransformField<C>> | FieldTransformFunction<Z, C>;
}>;

export type FieldTransformer<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
> = FieldTransformObject<Z, C> | FieldTransformFunction<Z, C>;

export interface Option {
	id: string | number;
	name: string;
}

export type SelectOptions = Option[] | Promise<Option[]>;

export type RowOverrides<Z extends z.ZodObject<any>, C extends Components> = (
	gridElement: React.JSX.Element,
	rowIndex: number,
	fields: FormaField<Z, C>[],
) => React.JSX.Element;
