import type { FieldProps } from "./type";

import { useFieldContext } from "../components/ui/form";

export interface RadioProps {
	options: { value: string; label: string }[];
}

export const RadioField = ({ options, ...props }: FieldProps<RadioProps>) => {
	const field = useFieldContext<string>();
	return (
		<div className="forma-radio-group">
			{options.map((option) => (
				<label
					key={option.value}
					className="forma-radio-label"
				>
					<input
						type="radio"
						{...props}
						className="forma-radio"
						name={field.name}
						value={option.value}
						checked={field.state.value === option.value}
						onChange={(e) => field.handleChange(e.target.value)}
						onBlur={field.handleBlur}
					/>
					{option.label}
				</label>
			))}
		</div>
	);
};

export default RadioField;
