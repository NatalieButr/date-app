'use client';

import { useState, useTransition } from 'react';

import type { z } from 'zod';

interface UseFormOpts<S extends z.ZodType> {
  schema: S;
  defaultValues?: Partial<z.infer<S>>;
  onSubmit: (data: z.infer<S>) => Promise<string | null>;
}

export function useForm<S extends z.ZodType>({ schema, defaultValues, onSubmit }: UseFormOpts<S>) {
  type InferredValues = Partial<z.infer<S>>;
  type FieldErrors = Partial<Record<keyof z.infer<S>, string>>;

  const [values, setValues] = useState<InferredValues>(
    // {} is a valid Partial<z.infer<S>> — all fields are optional by definition
    (defaultValues ?? {}) as InferredValues,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // `value` accepts `z.infer<S>[K] | ''` so numeric fields can be cleared to ''
  // (the age input temporarily holds '' before the user types a number).
  // The loose union is intentional; Zod catches a wrong type at submit time.
  function setValue<K extends keyof z.infer<S>>(field: K, value: z.infer<S>[K] | '') {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      // flatten().fieldErrors is always Record<string, string[] | undefined> at runtime;
      // the generic z.ZodType bound doesn't let TS infer this, so we cast.
      const flat = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const errors: FieldErrors = {};
      for (const [key, msgs] of Object.entries(flat)) {
        if (msgs && msgs.length > 0) {
          // FieldErrors keys are keyof z.infer<S>; we iterate Object.entries, so the
          // key is string here. The cast is safe: every key came from the schema output.
          (errors as Record<string, string>)[key] = msgs[0]!;
        }
      }
      setServerError(null);
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setServerError(null);
    startTransition(async () => {
      // z.ZodType generic bound doesn't narrow safeParse output to z.infer<S>; cast is safe.
      const error = await onSubmit(result.data as z.infer<S>);
      if (error) setServerError(error);
    });
  }

  function reset() {
    // {} satisfies Partial<z.infer<S>> — all fields optional by definition. Same as initial state.
    setValues((defaultValues ?? {}) as InferredValues);
    setFieldErrors({});
    setServerError(null);
  }

  return { values, fieldErrors, serverError, isPending, setValue, handleSubmit, reset };
}
