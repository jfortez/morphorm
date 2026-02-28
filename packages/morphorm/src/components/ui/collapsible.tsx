import * as React from "react";

interface CollapsibleContextValue {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | undefined>(undefined);

const useCollapsible = () => {
	const context = React.useContext(CollapsibleContext);
	if (!context) {
		throw new Error("Collapsible components must be used within a Collapsible");
	}
	return context;
};

export interface CollapsibleProps {
	defaultOpen?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
	className?: string;
}

export const Collapsible = ({
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
	children,
	className = "",
}: CollapsibleProps) => {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const handleOpenChange = React.useCallback(
		(newOpen: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(newOpen);
			}
			onOpenChange?.(newOpen);
		},
		[isControlled, onOpenChange],
	);

	const value = React.useMemo(
		() => ({ onOpenChange: handleOpenChange, open }),
		[open, handleOpenChange],
	);

	return (
		<CollapsibleContext.Provider value={value}>
			<div className={`forma-collapsible ${className}`.trim()}>{children}</div>
		</CollapsibleContext.Provider>
	);
};

export interface CollapsibleTriggerProps {
	children: React.ReactNode;
	className?: string;
	asChild?: boolean;
}

export const CollapsibleTrigger = ({
	children,
	className = "",
	asChild = false,
}: CollapsibleTriggerProps) => {
	const { open, onOpenChange } = useCollapsible();

	const handleClick = () => {
		onOpenChange(!open);
	};

	if (asChild) {
		return (
			<div
				onClick={handleClick}
				className={className}
			>
				{children}
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`forma-collapsible__trigger ${className}`.trim()}
			aria-expanded={open}
		>
			{children}
			<span className={`forma-collapsible__icon ${open ? "forma-collapsible__icon--open" : ""}`}>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
					}}
				>
					<path
						d="M2.5 4.5L6 8L9.5 4.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		</button>
	);
};

export interface CollapsibleContentProps {
	children: React.ReactNode;
	className?: string;
}

export const CollapsibleContent = ({ children, className = "" }: CollapsibleContentProps) => {
	const { open } = useCollapsible();

	return (
		<div
			className={`forma-collapsible__content ${className}`.trim()}
			data-state={open ? "open" : "closed"}
		>
			<div className="forma-collapsible__content-inner">{children}</div>
		</div>
	);
};
