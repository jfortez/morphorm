import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export const CheckboxField = ({ ...props }: FieldProps) => {
	const field = useFieldContext<boolean>();
	return (
		<input
			type="checkbox"
			className="forma-checkbox"
			{...props}
			name={field.name}
			checked={field.state.value}
			onChange={(e) => field.handleChange(e.target.checked)}
			onBlur={field.handleBlur}
		/>
	);
};

export default CheckboxField;
