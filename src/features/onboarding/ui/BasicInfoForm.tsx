'use client';

import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

import { BasicInfoSchema, type BasicInfo } from '../model/schemas';

interface Props {
  onSubmit: (info: BasicInfo) => void;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other'];
const LOOKING_FOR_OPTIONS = ['Men', 'Women', 'Everyone'];

export function BasicInfoForm({ onSubmit }: Props) {
  const form = useForm({
    schema: BasicInfoSchema,
    onSubmit: async (data) => {
      onSubmit(data);
      return null;
    },
  });

  const lookingFor = form.values.looking_for ?? [];

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField id="basic-name" label="Your name" error={form.fieldErrors.name}>
        <Input
          id="basic-name"
          value={form.values.name ?? ''}
          onChange={(e) => form.setValue('name', e.target.value)}
          placeholder="Alice"
          maxLength={60}
          aria-invalid={Boolean(form.fieldErrors.name)}
        />
      </FormField>

      <FormField id="basic-age" label="Age" error={form.fieldErrors.age}>
        <Input
          id="basic-age"
          type="number"
          value={form.values.age ?? ''}
          onChange={(e) =>
            form.setValue('age', e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="25"
          min={18}
          max={99}
          aria-invalid={Boolean(form.fieldErrors.age)}
        />
      </FormField>

      <FormField label="Gender" error={form.fieldErrors.gender}>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => form.setValue('gender', g)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                form.values.gender === g
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Show me" error={form.fieldErrors.looking_for}>
        <div className="flex flex-wrap gap-2">
          {LOOKING_FOR_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = lookingFor.includes(opt)
                  ? lookingFor.filter((v) => v !== opt)
                  : [...lookingFor, opt];
                form.setValue('looking_for', next);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                lookingFor.includes(opt)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </FormField>

      <FormField id="basic-city" label="City" error={form.fieldErrors.city}>
        <Input
          id="basic-city"
          value={form.values.city ?? ''}
          onChange={(e) => form.setValue('city', e.target.value)}
          placeholder="Warsaw"
          maxLength={80}
          aria-invalid={Boolean(form.fieldErrors.city)}
        />
      </FormField>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
