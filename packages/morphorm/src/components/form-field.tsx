// oxlint-disable typescript/no-explicit-any
import type React from "react";
import { useMemo } from "react";

import type { z } from "zod";

import type {  FieldType } from "../fields";
import type { Components, FnArgs, ValueOrFunction } from "../types";

import Field from "../fields";
import {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Field as FieldPrimitive,
} from "./ui/form";

interface _SharedFieldProps {
  label?: string | React.ReactNode;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

type FormFieldMap<
  C extends Components = NonNullable<unknown>,
  Z extends z.ZodObject<any> = z.ZodObject<any>,
  Context = any,
> = {
  [K in FieldType<C>]: {
    name: string;
    element?: React.ReactNode;
    type: K;
    fieldProps?: Record<string, unknown>;
    overrides?: (
      originalElement: React.JSX.Element,
      meta: FormFieldType<C, Z, Context>,
    ) => React.ReactNode;
  } & {
    [Key in keyof _SharedFieldProps]?: ValueOrFunction<
      Required<_SharedFieldProps>[Key],
      FnArgs<Z, Context>
    >;
  };
};

export type FormFieldType<
  C extends Components = NonNullable<unknown>,
  Z extends z.ZodObject<any> = z.ZodObject<any>,
  Context = any,
> = FormFieldMap<C, Z, Context>[FieldType<C>];

interface FormInputProps<
  C extends Components = NonNullable<unknown>,
  Z extends z.ZodObject<any> = z.ZodObject<any>,
  Context = any,
> {
  metadata: FormFieldType<C, Z, Context>;
  context?: Context;
  fieldValues?: Record<string, unknown>;
  addonIcon?: React.ReactNode;
  showAddonIcon?: boolean;
}

const FormField = <
  C extends Components = NonNullable<unknown>,
  Z extends z.ZodObject<any> = z.ZodObject<any>,
  Context = any,
>({
  metadata: _metadata,
  context,
  fieldValues,
  addonIcon: _addonIcon,
  showAddonIcon = true,
}: FormInputProps<C, Z, Context>) => {
  const dynamicKeys = useMemo(() => {
    const keys = Object.keys(_metadata) as (keyof typeof _metadata)[];
    const dynamic: string[] = [];
    const staticProps: Record<string, any> = {};

    keys.forEach((key) => {
      const value = _metadata[key];
      if (key === "fieldProps" && value && typeof value === "object") {
        const fieldProps = value as Record<string, unknown>;
        const hasDynamicFieldProps = Object.values(fieldProps).some((v) => typeof v === "function");
        if (hasDynamicFieldProps) {
          dynamic.push(key);
        } else {
          staticProps[key as string] = value;
        }
      } else if (typeof value === "function") {
        dynamic.push(key as string);
      } else {
        staticProps[key as string] = value;
      }
    });
    return { dynamic, staticProps };
  }, [_metadata]);

  const metadata = useMemo(() => {
    const { dynamic, staticProps } = dynamicKeys;
    if (dynamic.length === 0) {return { ...staticProps, ..._metadata } as any;}

    const computedDynamic = dynamic.reduce((acc, currentKey) => {
      const value = (_metadata as any)[currentKey];
      if (currentKey === "fieldProps") {
        const fieldProps = value as Record<string, unknown>;
        const newFieldProps = Object.keys(fieldProps).reduce((propsAcc, propKey) => {
          const propValue = fieldProps[propKey];
          if (typeof propValue === "function") {
            return {
              ...propsAcc,
              [propKey]: propValue({
                context,
                fieldValues: fieldValues ?? {},
              }),
            };
          }
          return { ...propsAcc, [propKey]: propValue };
        }, {});
        return { ...acc, [currentKey]: newFieldProps };
      }
      if (typeof value === "function") {
        return {
          ...acc,
          [currentKey]: value({ context, fieldValues: fieldValues ?? {} }),
        };
      }
      return acc;
    }, {});

    return { ...staticProps, ...computedDynamic } as any;
  }, [dynamicKeys, _metadata, fieldValues, context]);

  const fieldElement = (
    <FieldPrimitive>
      {metadata.label && <FieldLabel>{metadata.label}</FieldLabel>}
      <FieldControl>
        {metadata.element ? (
          metadata.element
        ) : (
          <Field
            inputType={metadata.type as FieldType<C>}
            showAddonIcon={showAddonIcon}
            {...metadata.fieldProps}
            placeholder={metadata.placeholder}
            disabled={metadata.disabled}
          />
        )}
      </FieldControl>
      {metadata.description && <FieldDescription>{metadata.description}</FieldDescription>}
      <FieldError />
    </FieldPrimitive>
  );

  return (
    <>{metadata.overrides ? metadata.overrides(fieldElement, metadata as any) : fieldElement}</>
  );
};

export default FormField;
