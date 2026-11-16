import React from 'react';

import { Label } from '@/shared/ui/label';

interface FormFieldProps {
  id?: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  // useId() gives a stable, SSR-safe unique id — avoids collisions when the same
  // label text (e.g. "Gender") appears in two places or contains non-ASCII characters.
  const autoId = React.useId();
  // When no id (e.g. pill-button groups), use an explicit group role with aria-labelledby
  // so screen readers announce the question before each button.
  const labelId = id ? undefined : `${autoId}-lbl`;
  // Derive errorId from the same base so aria-describedby is always unique.
  const errorId = id ? `${id}-error` : `${autoId}-err`;

  // For fields with an id, inject aria-describedby into the direct child input so
  // screen readers read the error message when the user focuses the input.
  // For id-less pill groups the describedby goes on the role="group" wrapper (below)
  // because the child is a non-focusable div; cloneElement there would have no effect.
  // as cast: ReactElement<HTMLAttributes<HTMLElement>> covers all HTML input props.
  const child =
    id && errorId && error && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
          'aria-describedby': errorId,
        })
      : children;

  return (
    <div
      className="flex flex-col gap-1.5"
      {...(!id
        ? {
            role: 'group',
            'aria-labelledby': labelId,
            ...(errorId && error ? { 'aria-describedby': errorId } : {}),
          }
        : {})}
    >
      <Label htmlFor={id} id={labelId}>
        {label}
      </Label>
      {child}
      {error ? (
        <span id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </span>
      ) : null}
    </div>
  );
}
