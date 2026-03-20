import { createForm } from "@/core/builder";
import { defaultFieldComponents } from "../fields";
import type { z } from "zod";
import type { ContextType, FieldComponents } from "../types";

const { Form, $field, defineFields } = createForm(defaultFieldComponents);

export { Form, defineFields };

export type Field<
	Z extends z.ZodObject<any> = z.ZodObject<any>,
	C extends FieldComponents = Record<never, never>,
	Context extends ContextType = ContextType,
> = ReturnType<typeof $field<Z, C, Context>>;
