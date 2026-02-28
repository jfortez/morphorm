import { createFormHook } from "@tanstack/react-form";

import {

	fieldContext,
	formContext,
} from "./ui/form";

export const { useAppForm, withForm, withFieldGroup, } = createFormHook({
	fieldComponents:{},
	fieldContext,
	formComponents: {},
	formContext,
});
