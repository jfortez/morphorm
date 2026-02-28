import { createFormHook } from "@tanstack/react-form";

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldContext,
  formContext,
} from "./ui/form";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    Field: Field,
    Label: FieldLabel,
    Control: FieldControl,
    Description: FieldDescription,
    Error: FieldError,
  },
  fieldContext,
  formComponents: {},
  formContext,
});
