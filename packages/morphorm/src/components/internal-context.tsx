import { createContext, useContext } from "react";

import type { Components } from "../types";

interface IFormContext<C extends Components = Components> {
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
