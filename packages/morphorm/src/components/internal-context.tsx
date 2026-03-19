import { createContext, useContext } from "react";

import type { FieldComponents } from "../types";

interface IFormContext<C extends FieldComponents = FieldComponents> {
	components?: C;
	context?: any;
}

const FormKitProvider = createContext<IFormContext>({} as IFormContext);

export const InternalProvider = FormKitProvider.Provider;

export const useFormInternal = () => {
	const ctx = useContext(FormKitProvider);
	if (!ctx) {
		throw new Error("FormComponentsContext not found");
	}
	return ctx;
};
