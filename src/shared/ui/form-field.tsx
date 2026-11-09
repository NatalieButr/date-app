import { Label } from '@/shared/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactElement;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <span role="alert" className="text-destructive text-sm">
          {error}
        </span>
      ) : null}
    </div>
  );
}
