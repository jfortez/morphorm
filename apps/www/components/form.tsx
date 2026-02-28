"use client";
import { Forma } from "morphorm";
import * as z from "zod";

const formSchema = z.object({
	age: z.number(),
	name: z.string(),
});

export const Form = () => (
	<div>
		<Forma
			schema={formSchema}
			fields={[
				{ label: "age", name: "age", placeholder: "age", size: 6, type: "text" },
				{ label: "name", name: "name", placeholder: "name", size: 6, type: "text" },
			]}
		/>
	</div>
);
