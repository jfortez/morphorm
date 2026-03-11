import * as React from "react";
import { Spinner } from "./ui/spinner";

import { Button } from "./ui/button";
import { useForm, FormaContext } from "./provider";
import { useFormContext } from "./ui/form";

export interface FormaSubmitProps {
	formKey?: string;
	submitText?: string | ((isSubmitting: boolean) => string | React.ReactNode);
	cancelText?: string;
	showCancelButton?: boolean;
	className?: string;
	onCancel?: () => void;
	onSubmit?: (values: Record<string, unknown>) => Promise<void>;
}

export const FormaSubmit = ({
	formKey,
	submitText: _submitText,
	cancelText = "Cancel",
	showCancelButton = true,
	className = "",
	onCancel,
	onSubmit,
}: FormaSubmitProps) => {
	const formaContext = React.useContext(FormaContext);
	const contextMode = formaContext?.mode ?? "single";
	const isCombinedMode = contextMode === "combined" && formaContext !== null;

	const form = !isCombinedMode
		? formaContext !== null
			? useForm(formKey)
			: (useFormContext() as any)
		: null;

	const getSubmitText = (isSubmitting: boolean): React.ReactNode => {
		if (typeof _submitText === "function") {
			const result = _submitText(isSubmitting);
			return result;
		}
		if (_submitText) {
			return isSubmitting ? <Spinner /> : _submitText;
		}
		return isSubmitting ? <Spinner /> : "Submit";
	};

	const handleCancel = () => {
		if (form) {
			form.reset();
		}
		onCancel?.();
	};

	const handleCombinedSubmit = async () => {
		if (!formaContext || !onSubmit) {
			return;
		}

		const allValues = formaContext.getAllValues();
		await onSubmit(allValues);
	};

	const handleSingleSubmit = () => {
		if (form) {
			form.handleSubmit();
		}
	};

	if (isCombinedMode) {
		return (
			<div className={`forma-submit ${className}`.trim()}>
				{showCancelButton && (
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
					>
						{cancelText}
					</Button>
				)}
				<Button
					type="button"
					onClick={() => handleCombinedSubmit()}
				>
					{getSubmitText(false)}
				</Button>
			</div>
		);
	}

	return (
		<form.Subscribe
			selector={(state: any) => ({
				canSubmit: state.canSubmit,
				isSubmitting: state.isSubmitting,
			})}
		>
			{({ isSubmitting, canSubmit }: any) => (
				<div className={`forma-submit ${className}`.trim()}>
					{showCancelButton && (
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							{cancelText}
						</Button>
					)}
					<Button
						type="submit"
						disabled={!canSubmit}
						onClick={(e) => {
							e.preventDefault();
							handleSingleSubmit();
						}}
					>
						{getSubmitText(isSubmitting)}
					</Button>
				</div>
			)}
		</form.Subscribe>
	);
};
