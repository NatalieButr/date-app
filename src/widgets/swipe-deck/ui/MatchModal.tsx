'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';

interface Props {
  matchId: string;
  otherName: string;
  onClose: () => void;
}

export function MatchModal({ matchId, otherName, onClose }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-background p-8 text-center shadow-xl max-w-xs w-full">
        <div className="text-5xl">🎉</div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">It&apos;s a Match!</h2>
          <p className="text-muted-foreground text-sm">
            You and {otherName} liked each other.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button
            onClick={() => router.push(`/chat/${matchId}`)}
            className="w-full"
          >
            Send a message
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Keep swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
