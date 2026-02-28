export interface SpinnerProps {
	size?: "sm" | "default" | "lg";
	className?: string;
}

export const Spinner = ({ size = "default", className = "" }: SpinnerProps) => {
	const sizeClass = {
		default: "",
		lg: "forma-spinner--lg",
		sm: "forma-spinner--sm",
	}[size];

	const classes = `forma-spinner ${sizeClass} ${className}`.trim();

	return (
		<span
			className={classes}
			aria-hidden="true"
		/>
	);
};

Spinner.displayName = "Spinner";
