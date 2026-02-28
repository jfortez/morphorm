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

export type FieldWatch<Z extends z.ZodObject<any>, K extends keyof z.infer<Z>> = Exclude<
	keyof z.infer<Z>,
	K
>[];

export type FormaFieldBase<
	ZObject extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
	K extends keyof z.infer<ZObject> = keyof z.infer<ZObject>,
> = BaseField<ZObject, Context> &
	FormFieldType<C, ZObject, Context> & {
		name: K;
		size?: Sizes;
		watch?: FieldWatch<ZObject, K>;
		overrides?: (
			originalElement: React.JSX.Element,
			meta: FormFieldType<C, ZObject, Context>,
		) => React.ReactNode;
	};

export type FormaField<
	ZObject extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> =
	| {
			[K in keyof z.infer<ZObject>]: FormaFieldBase<ZObject, C, Context, K>;
	  }[keyof z.infer<ZObject>]
	| SpacerType;

type MaybePromise<T> = T | Promise<T>;

export type FormSubmitHandler<Z extends z.ZodObject<any>> = (
	values: z.infer<Z>,
) => MaybePromise<void>;

export type SchemaFieldNames<Z extends z.ZodObject<any>> = keyof z.infer<Z>;

export interface AutoField<C extends Components = NonNullable<unknown>> {
	name: string;
	type: FieldType<C>;
	label?: string;
	size?: Sizes;
	watch?: string[];
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
		watch?: string[];
	};

export type FieldTransformFunction<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> = (fields: AutoField<C>[]) => TransformedField<Z, C, Context>[];

export interface FieldObjectConfig<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
	K extends keyof z.infer<Z> = keyof z.infer<Z>,
> {
	name?: string;
	type?: FieldType<C>;
	size?: Sizes;
	watch?: FieldWatch<Z, K>;
	disabled?: ValueOrFunction<boolean, FnArgs<Z, Context>>;
	label?: ValueOrFunction<string | React.ReactNode, FnArgs<Z, Context>>;
	placeholder?: ValueOrFunction<string, FnArgs<Z, Context>>;
	description?: ValueOrFunction<string, FnArgs<Z, Context>>;
	watchContext?: Context extends Record<string, any> ? (keyof Context)[] : string[];
}

export type FieldTransformValue<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
	K extends keyof z.infer<Z> = keyof z.infer<Z>,
> =
	| FieldObjectConfig<Z, C, Context, K>
	| ((field: AutoField<C>) => Partial<TransformedField<Z, C, Context>> | undefined);

export type FieldTransformObject<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends Components = NonNullable<unknown>,
	Context = any,
> = Partial<{
	[K in keyof z.infer<Z>]:
		| FieldObjectConfig<Z, C, Context, K>
		| ((field: AutoField<C>) => Partial<TransformedField<Z, C, Context>> | undefined);
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
