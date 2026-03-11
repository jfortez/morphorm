import * as React from "react";
import { Spinner } from "./ui/spinner";

import { Button } from "./ui/button";
import { SubmitTrigger, CancelTrigger } from "./triggers";

export interface FormaSubmitProps {
	formKey?: string;
	submitText?: string | ((isSubmitting: boolean) => string | React.ReactNode);
	cancelText?: string;
	showCancelButton?: boolean;
	className?: string;
	onCancel?: () => void;
	onSubmit?: (values: Record<string, unknown>) => Promise<void>;
}

export const FormSubmit = ({
	formKey,
	submitText: _submitText,
	cancelText = "Cancel",
	showCancelButton = true,
	className = "",
	onCancel,
	onSubmit,
}: FormaSubmitProps) => {
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

	return (
		<div className={`forma-submit ${className}`.trim()}>
			{showCancelButton && (
				<CancelTrigger
					formKey={formKey}
					onCancel={onCancel}
					asChild
				>
					{({ isSubmitting }) => (
						<Button
							type="button"
							variant="outline"
							disabled={isSubmitting}
						>
							{cancelText}
						</Button>
					)}
				</CancelTrigger>
			)}
			<SubmitTrigger
				formKey={formKey}
				onSubmit={onSubmit}
				asChild
			>
				{({ canSubmit, isSubmitting }) => (
					<Button
						type="button"
						disabled={!canSubmit}
					>
						{getSubmitText(isSubmitting)}
					</Button>
				)}
			</SubmitTrigger>
		</div>
	);
};
