import type { FieldComponentProps } from "../types";
import type { FieldType } from "@/types";

import { useFormInternal } from "./internal-context";

import { useFieldContext } from "@/core/builder";

interface RenderFieldProps extends FieldComponentProps {
	inputType: FieldType;
}

const RenderField = ({ inputType, ...rest }: RenderFieldProps) => {
	const { components = {} } = useFormInternal();
	const field = useFieldContext() as any;

	if (components && Object.keys(components).length > 0) {
		const Component = components[inputType];

		if (!Component) {
			return null;
		}
		return <Component {...rest} />;
	}

	const FieldComponent = field?.[inputType as any];

	if (FieldComponent && typeof FieldComponent === "function") {
		return <FieldComponent {...rest} />;
	}

	return <div>unknown field</div>;
};

export default RenderField;
