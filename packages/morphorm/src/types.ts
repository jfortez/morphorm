// oxlint-disable typescript/no-explicit-any
import type * as z from "zod";

import type { createFormHook } from "@tanstack/react-form";

export type UseAppFormType = ReturnType<typeof createFormHook>["useAppForm"];

export type FieldComponents = Record<string, React.ComponentType<any>>;

export type Sizes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type InferZodType<T> = T extends z.ZodType<infer U> ? U : never;

export type ContextType = Record<string, any>;

type Paths<T, Prefix extends string = "", Depth extends unknown[] = []> = Depth["length"] extends 15
	? never
	: T extends object
		? T extends any[]
			? never
			: {
					[K in keyof T]-?: K extends string | number
						? T[K] extends any[]
							? T[K] extends (infer Item)[]
								? Item extends object
									?
											| `${Prefix}${K & string}`
											| `${Prefix}${K & string}.${Paths<Item, "", [...Depth, 1]>}`
									: `${Prefix}${K & string}`
								: `${Prefix}${K & string}`
							: T[K] extends object
								? T[K] extends Date | RegExp | Function
									? `${Prefix}${K & string}`
									:
											| `${Prefix}${K & string}`
											| `${Prefix}${K & string}.${Paths<T[K], "", [...Depth, 1]>}`
								: `${Prefix}${K & string}`
						: never;
				}[keyof T]
		: never;

export type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
		? T[Key] extends (infer Item)[]
			? PathValue<Item, Rest>
			: PathValue<T[Key], Rest>
		: never
	: P extends keyof T
		? T[P] extends (infer Item)[]
			? Item
			: T[P]
		: never;

export type FieldName<Z extends z.ZodObject<any>> = Paths<InferZodType<Z>>;

type ExtractFieldValues<Z extends z.ZodObject<any>, WatchPaths extends FieldName<Z>[]> = {
	[K in WatchPaths[number]]: PathValue<InferZodType<Z>, K & string>;
};

export interface SpacerType {
	type: "fill";
	size?: Sizes;
}

export type FieldWatch<Z extends z.ZodObject<any>, Name extends FieldName<Z>> = Exclude<
	FieldName<Z>,
	Name
>[];

export interface CustomPropertyArgs<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends ContextType = ContextType,
	W extends FieldName<Z>[] = FieldName<Z>[],
> {
	fieldValues: ExtractFieldValues<Z, W>;
	context: C;
}

export type ValueOrFunction<T, Args> = T | ((args: Args) => T);

interface _SharedFieldProps {
	label?: string | React.ReactNode;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
}

export type FieldType<C extends FieldComponents = FieldComponents> = keyof C;

type ValueOrFunctionProps<P, Args> = {
	[K in keyof P]: ValueOrFunction<P[K], Args>;
};

type ExtractFieldProps<T, Args> =
	T extends React.ComponentType<infer Props>
		? Props extends FieldComponentProps<infer P>
			? [P] extends [Record<string, never>]
				? never
				: ValueOrFunctionProps<P, Args>
			: ValueOrFunctionProps<Omit<Props, keyof FieldAttributes>, Args>
		: never;

type FormFieldMap<
	C extends FieldComponents = FieldComponents,
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	Context extends ContextType = ContextType,
> = {
	[K in FieldType<C>]: {
		name: string;
		element?: React.ReactNode;
		type: K;
		fieldProps?: ExtractFieldProps<C[K], CustomPropertyArgs<Z, Context>>;
		overrides?: (
			originalElement: React.JSX.Element,
			meta: FormFieldType<C, Z, Context>,
		) => React.ReactNode;
	} & {
		[Key in keyof _SharedFieldProps]?: ValueOrFunction<
			Required<_SharedFieldProps>[Key],
			CustomPropertyArgs<Z, Context>
		>;
	};
};

export type FormFieldType<
	C extends FieldComponents = NonNullable<unknown>,
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	Context extends ContextType = ContextType,
> = FormFieldMap<C, Z, Context>[FieldType<C>];

type CustomPropertyFn<
	T,
	Z extends z.ZodObject<any>,
	C extends ContextType = ContextType,
	_W extends FieldName<Z>[] = FieldName<Z>[],
> = (args: CustomPropertyArgs<Z, C>) => T;

export type CustomProperty<
	T,
	Z extends z.ZodObject<any>,
	C extends ContextType = ContextType,
	W extends FieldName<Z>[] = FieldName<Z>[],
> = T | CustomPropertyFn<T, Z, C, W>;

export interface BaseField<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	Context extends ContextType = ContextType,
	Watch extends FieldName<Z>[] = FieldName<Z>[],
> {
	name: string;
	element?: React.ReactNode;
	label?: CustomProperty<React.ReactNode, Z, Context, Watch>;
	placeholder?: CustomProperty<string, Z, Context, Watch>;
	description?: CustomProperty<string, Z, Context, Watch>;
	disabled?: CustomProperty<boolean, Z, Context, Watch>;
	watchContext?: (keyof Context)[];
}

export type FormaFieldBase<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
	Name extends FieldName<Z> = FieldName<Z>,
	Watch extends FieldWatch<Z, Name> = FieldWatch<Z, Name>,
> = BaseField<Z, Context, Watch> &
	FormFieldType<C, Z, Context> & {
		name: Name;
		size?: Sizes;
		watch?: Watch;
		overrides?: (
			originalElement: React.JSX.Element,
			meta: FormFieldType<C, Z, Context>,
		) => React.ReactNode;
	};

export type FormField<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
> =
	| {
			[K in FieldName<Z>]: FormaFieldBase<Z, C, Context, K>;
	  }[FieldName<Z>]
	| SpacerType;

type MaybePromise<T> = T | Promise<T>;

export type FormSubmitHandler<Z extends z.ZodObject<any>> = (
	values: z.infer<Z>,
) => MaybePromise<void>;

export interface AutoField<C extends FieldComponents = NonNullable<unknown>> {
	name: FieldName<z.ZodObject<any>>;
	type: FieldType<C>;
	label?: string;
	size?: Sizes;
	watch?: string[];
}

export type TransformedField<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
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
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
> = (fields: AutoField<C>[]) => TransformedField<Z, C, Context>[];

export interface FieldObjectConfig<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
	Name extends FieldName<Z> = FieldName<Z>,
	Watch extends FieldWatch<Z, Name> = FieldWatch<Z, Name>,
> {
	name?: string;
	type?: FieldType<C>;
	size?: Sizes;
	watch?: Watch;
	disabled?: CustomProperty<boolean, Z, Context, Watch>;
	label?: CustomProperty<React.ReactNode, Z, Context, Watch>;
	placeholder?: CustomProperty<string, Z, Context, Watch>;
	description?: CustomProperty<string, Z, Context, Watch>;
	watchContext?: Context extends Record<string, any> ? (keyof Context)[] : string[];
}

export type FieldTransformValue<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
	Name extends FieldName<Z> = FieldName<Z>,
> =
	| FieldObjectConfig<Z, C, Context, Name>
	| ((field: AutoField<C>) => Partial<TransformedField<Z, C, Context>> | undefined);

export type FieldTransformObject<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
> = Partial<{
	[K in FieldName<Z>]:
		| FieldObjectConfig<Z, C, Context, K>
		| ((field: AutoField<C>) => Partial<TransformedField<Z, C, Context>> | undefined);
}>;

export type FieldTransformer<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
> = FieldTransformObject<Z, C> | FieldTransformFunction<Z, C>;

export type FieldsConfig<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = NonNullable<unknown>,
	Context extends ContextType = ContextType,
> =
	| FormField<Z, C, Context>[]
	| FieldTransformFunction<Z, C, Context>
	| FieldTransformObject<Z, C, Context>;

export interface Option {
	id: string | number;
	name: string;
}

export type SelectOptions = Option[] | Promise<Option[]>;

export type RowOverrides<Z extends z.ZodObject<any>, C extends FieldComponents> = (
	gridElement: React.JSX.Element,
	rowIndex: number,
	fields: FormField<Z, C>[],
) => React.JSX.Element;
export interface FieldAttributes {
	"aria-describedby": string;
	"aria-invalid": boolean;
	className: string;
	"data-slot": string;
	id: string;
	name: string;
	placeholder?: string;
	ref?: any;
}

export type FieldComponentProps<P = object> = P & FieldAttributes;
