import { createContext, useCallback, useContext, useMemo, useRef } from "react";

import type { useAppForm } from "./form-hook";

type FormInstance = ReturnType<typeof useAppForm>;

export interface IFormaContext {
	mode: "single" | "combined";
	registerForm: (key: string, form: FormInstance) => () => void;
	getForm: (key?: string) => FormInstance;
	getAllValues: () => Record<string, unknown>;
}

export const FormaContext = createContext<IFormaContext | null>(null);

interface FormaProviderProps {
	children: React.ReactNode;
	mode?: "single" | "combined";
}

export const DEFAULT_SCOPE = "DEFAULT_SCOPE";

export const Provider: React.FC<FormaProviderProps> = ({ children, mode = "single" }) => {
	const forms = useRef<Map<string, FormInstance>>(new Map<string, FormInstance>());

	const registerForm = useCallback((key: string, form: FormInstance) => {
		forms.current.set(key, form);
		return () => {
			forms.current.delete(key);
		};
	}, []);

	const getForm = useCallback((key?: string): FormInstance => {
		if (key) {
			const form = forms.current.get(key);
			if (!form) {
				throw new Error(`Forma with key "${key}" not found. Make sure the form is mounted.`);
			}
			return form;
		}
		const defaultForm = forms.current.get("");
		if (!defaultForm) {
			throw new Error(
				"No default form found. Make sure a Forma component is mounted without a formKey, or provide a formKey.",
			);
		}
		return defaultForm;
	}, []);

	const getAllValues = useCallback((): Record<string, unknown> => {
		const combined: Record<string, unknown> = {};
		forms.current.forEach((form, key) => {
			const { values } = form.store.state;
			if (key === "") {
				Object.assign(combined, values);
			} else {
				combined[key] = values;
			}
		});
		return combined;
	}, []);

	const value = useMemo<IFormaContext>(
		() => ({
			mode,
			registerForm,
			getForm,
			getAllValues,
		}),
		[mode, registerForm, getForm, getAllValues],
	);

	return <FormaContext.Provider value={value}>{children}</FormaContext.Provider>;
};

export const useFormaContext = () => {
	const ctx = useContext(FormaContext);
	if (!ctx) {
		throw new Error("useFormaContext must be used within a FormaProvider");
	}
	return ctx;
};

export const useForm = (formKey?: string): FormInstance => {
	const { getForm } = useFormaContext();
	return getForm(formKey);
};
