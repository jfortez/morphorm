import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
	size?: "default" | "sm" | "icon" | "icon-sm";
	asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className = "", variant = "default", size = "default", asChild = false, children, ...props },
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		const variantClass = {
			default: "forma-button",
			destructive: "forma-button forma-button--destructive",
			ghost: "forma-button forma-button--ghost",
			outline: "forma-button forma-button--outline",
			secondary: "forma-button forma-button--secondary",
		}[variant];

		const sizeClass = {
			default: "",
			icon: "forma-button--icon",
			"icon-sm": "forma-button--icon-sm",
			sm: "forma-button--sm",
		}[size];

		const classes = `${variantClass} ${sizeClass} ${className}`.trim();

		return (
			<Comp
				className={classes}
				ref={ref}
				{...props}
			>
				{children}
			</Comp>
		);
	},
);

Button.displayName = "Button";
