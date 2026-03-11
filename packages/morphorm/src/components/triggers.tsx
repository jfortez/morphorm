import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { useForm, FormaContext } from "./provider";
import { useFormContext } from "./ui/form";

export interface SubmitTriggerProps {
	asChild?: boolean;
	formKey?: string;
	onSubmit?: (values: Record<string, unknown>) => Promise<void>;
	children:
		| React.ReactNode
		| ((state: { canSubmit: boolean; isSubmitting: boolean }) => React.ReactNode);
}

export const SubmitTrigger: React.FC<SubmitTriggerProps> = ({
	asChild,
	formKey,
	onSubmit,
	children,
}) => {
	const formaContext = React.useContext(FormaContext);
	const contextMode = formaContext?.mode ?? "single";
	const isCombinedMode = contextMode === "combined" && formaContext !== null;

	const form = !isCombinedMode
		? formaContext !== null
			? useForm(formKey)
			: (useFormContext() as any)
		: null;

	const handleSubmit = React.useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (isCombinedMode && formaContext && onSubmit) {
				const allValues = formaContext.getAllValues();
				await onSubmit(allValues);
			} else if (form) {
				form.handleSubmit();
			}
		},
		[form, formaContext, isCombinedMode, onSubmit],
	);

	if (isCombinedMode) {
		const child =
			typeof children === "function"
				? children({ canSubmit: true, isSubmitting: false })
				: children;

		if (asChild) {
			const SubmitSlot = Slot;
			return <SubmitSlot onClick={handleSubmit}>{child}</SubmitSlot>;
		}
		return (
			<button
				type="button"
				onClick={handleSubmit}
			>
				{child}
			</button>
		);
	}

	return (
		<form.Subscribe
			selector={(state: any) => ({
				canSubmit: state.canSubmit,
				isSubmitting: state.isSubmitting,
			})}
		>
			{({ canSubmit, isSubmitting }: any) => {
				const child =
					typeof children === "function" ? children({ canSubmit, isSubmitting }) : children;

				if (asChild) {
					const SubmitSlot = Slot;
					return <SubmitSlot onClick={!canSubmit ? undefined : handleSubmit}>{child}</SubmitSlot>;
				}
				return (
					<button
						type="submit"
						disabled={!canSubmit}
						onClick={handleSubmit}
					>
						{child}
					</button>
				);
			}}
		</form.Subscribe>
	);
};

export interface CancelTriggerProps {
	asChild?: boolean;
	formKey?: string;
	onCancel?: () => void;
	children: React.ReactNode | ((state: { isSubmitting: boolean }) => React.ReactNode);
}

export const CancelTrigger: React.FC<CancelTriggerProps> = ({
	asChild,
	formKey,
	onCancel,
	children,
}) => {
	const formaContext = React.useContext(FormaContext);
	const contextMode = formaContext?.mode ?? "single";
	const isCombinedMode = contextMode === "combined" && formaContext !== null;

	const form = !isCombinedMode
		? formaContext !== null
			? useForm(formKey)
			: (useFormContext() as any)
		: null;

	const handleCancel = React.useCallback(() => {
		if (form) {
			form.reset();
		}
		onCancel?.();
	}, [form, onCancel]);

	if (isCombinedMode) {
		const child = typeof children === "function" ? children({ isSubmitting: false }) : children;

		if (asChild) {
			const CancelSlot = Slot;
			return <CancelSlot onClick={handleCancel}>{child}</CancelSlot>;
		}
		return (
			<button
				type="button"
				onClick={handleCancel}
			>
				{child}
			</button>
		);
	}

	return (
		<form.Subscribe
			selector={(state: any) => ({
				isSubmitting: state.isSubmitting,
			})}
		>
			{({ isSubmitting }: any) => {
				const child = typeof children === "function" ? children({ isSubmitting }) : children;

				if (asChild) {
					const CancelSlot = Slot;
					return <CancelSlot onClick={handleCancel}>{child}</CancelSlot>;
				}
				return (
					<button
						type="button"
						onClick={handleCancel}
					>
						{child}
					</button>
				);
			}}
		</form.Subscribe>
	);
};
