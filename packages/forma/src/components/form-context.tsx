import { createContext, useContext } from "react";

import type { Components } from "../types";
import type { InternalField } from "../util";

interface IFormContext<C extends Components = Components> {
  components?: C;
  schema: InternalField[];
  context?: any;
}

const FormKitProvider = createContext<IFormContext>({} as IFormContext);

export const FormComponentsProvider = FormKitProvider.Provider;

export const useFormKit = () => {
  const ctx = useContext(FormKitProvider);
  if (!ctx) {throw new Error("FormComponentsContext not found");}
  return ctx;
};
