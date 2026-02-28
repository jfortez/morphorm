"use client";
import {Forma} from "forma";
import * as z from 'zod'

const formSchema = z.object({
  age: z.number(),
  name: z.string(),
});

export const Form = () => <div>
    <Forma schema={formSchema}/>
  </div>;

