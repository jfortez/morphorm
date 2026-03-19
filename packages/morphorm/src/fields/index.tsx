import Input from "./input";
import Number from "./number";
import Checkbox from "./checkbox";
import TextArea from "./textarea";
import Select from "./select";
import Radio from "./radio";

export const defaultFieldComponents = {
	checkbox: Checkbox,
	number: Number,
	radio: Radio,
	select: Select,
	text: Input,
	textarea: TextArea,
};

export type DefaultComponentTypes = keyof typeof defaultFieldComponents;
