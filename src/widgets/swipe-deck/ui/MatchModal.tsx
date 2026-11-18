'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog';

interface Props {
  matchId: string;
  otherName: string;
  onClose: () => void;
}

export function MatchModal({ matchId, otherName, onClose }: Props) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col items-center gap-6 text-center max-w-xs p-8"
        showCloseButton={false}
      >
        <div className="text-5xl" aria-hidden>
          🎉
        </div>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-2xl font-bold">It&apos;s a Match!</DialogTitle>
          <DialogDescription>You and {otherName} liked each other.</DialogDescription>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button onClick={() => router.push(`/chat/${matchId}`)} className="w-full">
            Send a message
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Keep swiping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
