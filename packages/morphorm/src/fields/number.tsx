import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export const NumberField = ({ ...props }: FieldProps) => {
	const field = useFieldContext<number | string>();
	const numTestId = `number-${field.name}`;
	const inputTestId = `input-${field.name}`;
	const displayValue =
		field.state.value !== undefined && field.state.value !== null ? String(field.state.value) : "";
	return (
		<>
			<input
				type="hidden"
				data-testid={inputTestId}
				name={field.name}
				value={displayValue}
			/>
			<input
				type="number"
				className="forma-input"
				{...props}
				name={field.name}
				data-testid={numTestId}
				value={displayValue}
				onChange={(e) => {
					const value = e.target.value === "" ? undefined : Number(e.target.value);
					field.handleChange(value as never);
				}}
				onBlur={field.handleBlur}
			/>
		</>
	);
};

export default NumberField;
