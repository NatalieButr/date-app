'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import type { BioOptions } from '../model/schemas';

interface Props {
  options: BioOptions;
  chosenBio: string;
  onChoose: (bio: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function BioPicker({ options, chosenBio, onChoose, onConfirm, disabled }: Props) {
  const [edited, setEdited] = useState(chosenBio);

  function selectOption(text: string) {
    setEdited(text);
    onChoose(text);
  }

  function handleEditChange(val: string) {
    setEdited(val);
    onChoose(val);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Choose a bio style or edit the text directly.
      </p>

      <div className="flex flex-col gap-3">
        {options.options.map((opt) => (
          <button
            key={opt.tone}
            type="button"
            onClick={() => selectOption(opt.text)}
            disabled={disabled}
            className={`rounded-xl border p-4 text-left text-sm transition-colors ${
              edited === opt.text
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="mb-1 block text-xs font-medium text-muted-foreground capitalize">
              {opt.tone}
            </span>
            {opt.text}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Edit your bio</span>
        <Textarea
          value={edited}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEditChange(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={500}
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground text-right">{edited.length}/500</span>
      </div>

      <Button
        onClick={onConfirm}
        disabled={!edited.trim() || disabled}
        className="w-full"
      >
        Save profile and go to feed
      </Button>
    </div>
  );
}
