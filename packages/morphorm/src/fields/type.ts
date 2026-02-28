export interface FieldAttributes {
	"aria-describedby": string;
	"aria-invalid": boolean;
	className: string;
	"data-slot": string;
	id: string;
	name: string;
	placeholder?: string;
	ref?: any;
}

export type FieldProps<P = any> = P & FieldAttributes;
