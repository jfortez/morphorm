import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export const InputField = ({ ...props }: FieldProps) => {
  const field = useFieldContext<string>();
  return (
    <input
      type="text"
      className="forma-input"
      {...props}
      name={field.name}
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
    />
  );
};

export default InputField;
