import type { FieldComponentProps } from "../types";

import { useFieldContext } from "../components/ui/form";

export const CheckboxField = ({ ...props }: FieldComponentProps) => {
	const field = useFieldContext<boolean>();
	return (
		<input
			type="checkbox"
			className="forma-checkbox"
			{...props}
			name={field.name}
			data-testid={`checkbox-${field.name}`}
			checked={field.state.value}
			onChange={(e) => field.handleChange(e.target.checked)}
			onBlur={field.handleBlur}
		/>
	);
};

export default CheckboxField;
