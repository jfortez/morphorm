"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { agate } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export const CodeExample = () => {
	const codeString = `
import { Form } from "morphorm"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  notify: z.boolean(),
})

export function MyForm() {
  return (
    <Form
      schema={schema}
      onSubmit={save}
      fields={[
        { name: "name"},
        { name: "email" },
        { name: "notify" },
      ]}
      showSubmit
    />
  )
}`;
	return (
		<SyntaxHighlighter
			language="tsx"
			style={agate}
		>
			{codeString}
		</SyntaxHighlighter>
	);
};
