'use client';

import { useState } from 'react';

import { MatchModal } from '@/widgets/swipe-deck';

export function MatchModalTestPage() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <div data-testid="modal-closed">
        <p>Modal closed</p>
        <button onClick={() => setOpen(true)}>Reopen</button>
      </div>
    );
  }

  return (
    <MatchModal matchId="test-match-id" otherName="Test User" onClose={() => setOpen(false)} />
  );
}
