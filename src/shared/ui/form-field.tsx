import React from 'react';

import { Label } from '@/shared/ui/label';

interface FormFieldProps {
  id?: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  // When no id (e.g. pill-button groups), use an explicit group role with aria-labelledby
  // so screen readers announce the question before each button.
  const labelId = id ? undefined : `ff-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-lbl`;
  // Derive errorId for pill-button groups from labelId so aria-describedby still works.
  const errorId = id ? `${id}-error` : labelId ? labelId.replace(/-lbl$/, '-err') : undefined;

  // Inject aria-describedby into the direct child input when there's an error,
  // so screen readers read the error message when the user focuses the field.
  // as cast: ReactElement<HTMLAttributes<HTMLElement>> covers all HTML input props.
  const child =
    errorId && error && React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
          'aria-describedby': errorId,
        })
      : children;

  return (
    <div
      className="flex flex-col gap-1.5"
      {...(!id ? { role: 'group', 'aria-labelledby': labelId } : {})}
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
