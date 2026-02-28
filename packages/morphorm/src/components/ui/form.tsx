"use client";

import { Slot } from "@radix-ui/react-slot";
import { createFormHookContexts, useStore } from "@tanstack/react-form";
import * as React from "react";

import {
	Field as FieldBase,
	FieldDescription as FieldDescriptionBase,
	FieldError as FieldErrorBase,
	FieldLabel as FieldLabelBase,
} from "./field";

const { useFieldContext, useFormContext, fieldContext, formContext } = createFormHookContexts();

function Form(props: React.ComponentProps<"form">) {
	const form = useFormContext();

	return (
		<form
			onSubmit={(e) => {
				e.stopPropagation();
				e.preventDefault();
				form.handleSubmit();
			}}
			{...props}
		/>
	);
}

const IdContext = React.createContext<string>(null as never);

function useFieldComponentContext() {
	const field = useFieldContext();
	const idContext = React.useContext(IdContext);

	if (typeof idContext !== "string") {
		throw new Error("Form components should be used within <Field>");
	}

	const errors = useStore(field.store, (state) => state.meta.errors);
	const isTouched = useStore(field.store, (state) => state.meta.isTouched);
	const submissionAttempts = useStore(field.form.store, (state) => state.submissionAttempts);

	const fieldComponent = React.useMemo(() => {
		const showError = isTouched || submissionAttempts > 0;

		let errorMessage: string | null = null;
		if (showError && errors.length > 0) {
			const error = errors[0];

			if (typeof error === "string") {
				errorMessage = error;
			} else if (typeof error === "object" && error !== null) {
				if ("message" in error && typeof error.message === "string") {
					errorMessage = error.message;
				}
			} else if (error !== null && error !== undefined) {
				errorMessage = String(error);
			}
		}

		return {
			error: errorMessage,
			formControlId: `${idContext}-form-item`,
			formDescriptionId: `${idContext}-form-item-description`,
			formMessageId: `${idContext}-form-item-message`,
			hasError: showError && errorMessage !== null,
		};
	}, [idContext, isTouched, submissionAttempts, errors]);

	return fieldComponent;
}

function Field({ className, ...props }: React.ComponentProps<typeof FieldBase>) {
	const id = React.useId();
	const field = useFieldContext();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const isTouched = useStore(field.store, (state) => state.meta.isTouched);
	const submissionAttempts = useStore(field.form.store, (state) => state.submissionAttempts);
	const showError = isTouched || submissionAttempts > 0;
	const hasError = showError && errors.length > 0;

	return (
		<IdContext.Provider value={id}>
			<FieldBase
				data-slot="form-item"
				data-invalid={hasError ? "true" : undefined}
				className={className}
				error={hasError}
				{...props}
			/>
		</IdContext.Provider>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof FieldLabelBase>) {
	const { formControlId, hasError } = useFieldComponentContext();

	return (
		<FieldLabelBase
			data-slot="form-label"
			data-error={hasError ? "true" : undefined}
			htmlFor={formControlId}
			className={className}
			error={hasError}
			{...props}
		/>
	);
}

function FieldControl(props: React.ComponentProps<typeof Slot>) {
	const { formControlId, formDescriptionId, formMessageId, hasError } = useFieldComponentContext();

	const describedBy = [formDescriptionId, hasError ? formMessageId : null]
		.filter(Boolean)
		.join(" ");

	return (
		<Slot
			data-slot="input-group-control"
			id={formControlId}
			aria-describedby={describedBy || undefined}
			aria-invalid={hasError}
			{...props}
		/>
	);
}

function FieldDescription({
	className,
	...props
}: React.ComponentProps<typeof FieldDescriptionBase>) {
	const { formDescriptionId } = useFieldComponentContext();

	return (
		<FieldDescriptionBase
			data-slot="form-description"
			id={formDescriptionId}
			className={className}
			{...props}
		/>
	);
}

function FieldError({ className, ...props }: React.ComponentProps<typeof FieldErrorBase>) {
	const { error, formMessageId } = useFieldComponentContext();
	const body = error ?? props.children;

	if (!body) {
		return null;
	}

	return (
		<FieldErrorBase
			data-slot="form-message"
			id={formMessageId}
			className={className}
			{...props}
		>
			{body}
		</FieldErrorBase>
	);
}

export {
	Form,
	Field,
	FieldLabel,
	FieldControl,
	FieldDescription,
	FieldError,
	fieldContext,
	useFieldContext,
	formContext,
	useFormContext,
};
