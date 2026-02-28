import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	error?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
	({ className = "", error = false, children, ...props }, ref) => {
		const classes = `forma-label ${error ? "forma-label--error" : ""} ${className}`.trim();

		return (
			<label
				className={classes}
				ref={ref}
				{...props}
			>
				{children}
			</label>
		);
	},
);

Label.displayName = "Label";
