'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

import { type z } from 'zod';

import { BasicInfoSchema, type BasicInfo } from '../model/schemas';

interface Props {
  onSubmit: (info: BasicInfo) => void;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other'];
const LOOKING_FOR_OPTIONS = ['Men', 'Women', 'Everyone'];

type FieldErrors = Partial<Record<keyof z.infer<typeof BasicInfoSchema>, string>>;

export function BasicInfoForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function toggleLookingFor(val: string) {
    setLookingFor((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    const parsed = BasicInfoSchema.safeParse({
      name: name.trim(),
      age: Number(age),
      gender,
      looking_for: lookingFor,
      city: city.trim(),
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0],
        age: flat.age?.[0],
        gender: flat.gender?.[0],
        looking_for: flat.looking_for?.[0],
        city: flat.city?.[0],
      });
      return;
    }
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField id="basic-name" label="Your name" error={fieldErrors.name}>
        <Input
          id="basic-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alice"
          maxLength={60}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </FormField>

      <FormField id="basic-age" label="Age" error={fieldErrors.age}>
        <Input
          id="basic-age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="25"
          min={18}
          max={99}
          aria-invalid={Boolean(fieldErrors.age)}
        />
      </FormField>

      <FormField label="Gender" error={fieldErrors.gender}>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                gender === g
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Show me" error={fieldErrors.looking_for}>
        <div className="flex flex-wrap gap-2">
          {LOOKING_FOR_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleLookingFor(opt)}
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

      <FormField id="basic-city" label="City" error={fieldErrors.city}>
        <Input
          id="basic-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Warsaw"
          maxLength={80}
          aria-invalid={Boolean(fieldErrors.city)}
        />
      </FormField>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
