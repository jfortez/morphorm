import type { FieldComponentProps } from "../types";

import { useFieldContext } from "../components/ui/form";

export const TextAreaField = ({ ...props }: FieldComponentProps) => {
	const field = useFieldContext<string>();
	return (
		<textarea
			className="forma-textarea"
			{...props}
			name={field.name}
			data-testid={`textarea-${field.name}`}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};

export default TextAreaField;
