import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export const TextAreaField = ({ ...props }: FieldProps) => {
	const field = useFieldContext<string>();
	return (
		<textarea
			className="forma-textarea"
			{...props}
			name={field.name}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		/>
	);
};

export default TextAreaField;
