import * as React from "react";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
	error?: boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
	({ className = "", error = false, children, ...props }, ref) => {
		const classes = `forma-field ${error ? "forma-field--error" : ""} ${className}`.trim();

		return (
			<div
				className={classes}
				ref={ref}
				{...props}
			>
				{children}
			</div>
		);
	},
);

Field.displayName = "Field";

export interface FieldLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
	htmlFor?: string;
	error?: boolean;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
	({ className = "", htmlFor, error = false, children, ...props }, ref) => {
		const classes =
			`forma-field__label ${error ? "forma-field__label--error" : ""} ${className}`.trim();

		return (
			<label
				htmlFor={htmlFor}
				className={classes}
				ref={ref}
				{...props}
			>
				{children}
			</label>
		);
	},
);

FieldLabel.displayName = "FieldLabel";

export interface FieldControlProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FieldControl = React.forwardRef<HTMLDivElement, FieldControlProps>(
	({ className = "", children, ...props }, ref) => (
		<div
			className={`forma-field__control ${className}`.trim()}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	),
);

FieldControl.displayName = "FieldControl";

export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldDescription = React.forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
	({ className = "", children, ...props }, ref) => (
		<p
			className={`forma-field__description ${className}`.trim()}
			ref={ref}
			{...props}
		>
			{children}
		</p>
	),
);

FieldDescription.displayName = "FieldDescription";

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
	({ className = "", children, ...props }, ref) => {
		if (!children) {
			return null;
		}

		return (
			<p
				className={`forma-field__error ${className}`.trim()}
				ref={ref}
				{...props}
			>
				{children}
			</p>
		);
	},
);

FieldError.displayName = "FieldError";
