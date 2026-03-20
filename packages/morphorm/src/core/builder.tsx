import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { FieldComponents } from "../types";
import { createFormComponent } from "./create-form";

export const { useFieldContext, useFormContext, fieldContext, formContext } =
	createFormHookContexts();

export const createForm = <C extends FieldComponents>(fieldComponents: C) => {
	const { useAppForm } = createFormHook({
		fieldComponents,
		fieldContext,
		formComponents: {},
		formContext,
	});

	return createFormComponent<C>(useAppForm as any);
};
