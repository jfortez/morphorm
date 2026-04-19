"use client";

import { CodeBlock } from "./code-block";

const codeString = `import { Form } from "morphorm"
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
      showSubmit
    />
  )
}`;

export const CodeExample = () => <CodeBlock>{codeString}</CodeBlock>;
