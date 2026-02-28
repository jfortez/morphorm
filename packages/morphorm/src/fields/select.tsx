import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export interface SelectProps {
	options: { value: string; label: string }[];
}

export const SelectField = ({ options, ...props }: FieldProps<SelectProps>) => {
	const field = useFieldContext<string>();
	return (
		<select
			{...props}
			className="forma-select"
			name={field.name}
			data-testid={`select-${field.name}`}
			value={field.state.value}
			onChange={(e) => field.handleChange(e.target.value)}
			onBlur={field.handleBlur}
		>
			{options.map((option) => (
				<option
					key={option.value}
					value={option.value}
				>
					{option.label}
				</option>
			))}
		</select>
	);
};

export default SelectField;
