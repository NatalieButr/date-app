'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { BasicInfoSchema, type BasicInfo } from '../model/schemas';

interface Props {
  onSubmit: (info: BasicInfo) => void;
}

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Other'];
const LOOKING_FOR_OPTIONS = ['Men', 'Women', 'Everyone'];

export function BasicInfoForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  function toggleLookingFor(val: string) {
    setLookingFor((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = BasicInfoSchema.safeParse({
      name: name.trim(),
      age: Number(age),
      gender,
      looking_for: lookingFor,
      city: city.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please fill all fields correctly');
      return;
    }
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alice"
          maxLength={60}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="25"
          min={18}
          max={99}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Gender</Label>
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Show me</Label>
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
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Warsaw"
          maxLength={80}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
