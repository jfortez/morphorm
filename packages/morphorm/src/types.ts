// oxlint-disable typescript/no-explicit-any
import type { z } from "zod";

import type { FieldType } from "./fields";
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
	watchContext?: Context extends Record<string, any> ? (keyof Context)[] : string[];
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

export interface AutoField<C extends Components = NonNullable<unknown>> {
	name: string;
	type: FieldType<C>;
	label?: string;
	size?: Sizes;
}

export type TransformedField<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> = AutoField<C> &
	Partial<
		Omit<BaseField<Z, Context> & Omit<FormFieldType<C, Z, Context>, "name" | "type">, "name">
	> & {
		name: string;
		type?: FieldType<C>;
	};

export type FieldTransformFunction<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> = (fields: AutoField<C>[]) => TransformedField<Z, C, Context>[];

export type FieldTransformValue<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> =
	| Partial<AutoField<C>>
	| ((field: AutoField<C>) => Partial<TransformedField<Z, C, Context>> | undefined);

export type FieldTransformObject<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> = Partial<{
	[K in keyof z.infer<Z>]: FieldTransformValue<Z, C, Context>;
}>;

export type FieldTransformer<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
> = FieldTransformObject<Z, C> | FieldTransformFunction<Z, C>;

export type FieldsConfig<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> =
	| FormaField<Z, C, Context>[]
	| FieldTransformFunction<Z, C, Context>
	| FieldTransformObject<Z, C, Context>;

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
