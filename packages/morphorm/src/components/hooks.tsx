import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

export const { useFieldContext, useFormContext, fieldContext, formContext } =
	createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {},
	fieldContext,
	formComponents: {},
	formContext,
});
