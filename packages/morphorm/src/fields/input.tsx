import type { FieldComponentProps } from "../types";

import { useFieldContext } from "../components/ui/form";

export const InputField = ({ ...props }: FieldComponentProps) => {
	const field = useFieldContext<string>();
	return (
		<input
			type="text"
			className="forma-input"
			{...props}
			name={field.name}
			data-testid={`input-${field.name}`}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};

export default InputField;
