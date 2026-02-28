import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export const NumberField = ({ ...props }: FieldProps) => {
	const field = useFieldContext<number | string>();
	return (
		<input
			type="number"
			className="forma-input"
			{...props}
			name={field.name}
			value={field.state.value}
			onChange={(e) => {
				const value = e.target.value === "" ? "" : Number(e.target.value);
				field.handleChange(value);
			}}
			onBlur={field.handleBlur}
		/>
	);
};

export default NumberField;
