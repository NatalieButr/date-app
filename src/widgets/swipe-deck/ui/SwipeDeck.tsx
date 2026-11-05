'use client';

import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

import { ProfileCard } from '@/entities/profile';
import { Button } from '@/shared/ui/button';
import type { PublicProfile } from '@/entities/profile';

import { MatchModal } from './MatchModal';

interface Match {
  matchId: string;
  otherName: string;
}

interface Props {
  initialProfiles: PublicProfile[];
}

const SWIPE_THRESHOLD = 100;

function DraggableCard({
  profile,
  onSwipe,
  isTop,
}: {
  profile: PublicProfile;
  onSwipe: (direction: 'like' | 'dislike') => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, -20], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('like');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('dislike');
    }
  }

  if (!isTop) {
    return (
      <div className="absolute inset-0 scale-95 opacity-80 pointer-events-none">
        <ProfileCard profile={profile} className="h-full" />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute top-6 left-6 z-10 rounded-lg bg-green-500 px-3 py-1 text-white font-bold text-lg rotate-[-15deg]"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>
      <motion.div
        className="absolute top-6 right-6 z-10 rounded-lg bg-red-500 px-3 py-1 text-white font-bold text-lg rotate-[15deg]"
        style={{ opacity: dislikeOpacity }}
      >
        NOPE
      </motion.div>
      <ProfileCard profile={profile} className="h-full" />
    </motion.div>
  );
}

export function SwipeDeck({ initialProfiles }: Props) {
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles);
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);

  const handleSwipe = useCallback(async (direction: 'like' | 'dislike') => {
    const top = profiles[0];
    if (!top) return;

    setProfiles((prev) => prev.slice(1));
    setLoading(true);

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: top.id, direction }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { matched: boolean; matchId?: string };
      if (data.matched && data.matchId) {
        setMatch({ matchId: data.matchId, otherName: top.name });
      }
    } catch {
      // non-critical — optimistic removal already applied
    } finally {
      setLoading(false);
    }
  }, [profiles]);

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-4xl">✨</p>
        <p className="font-semibold text-lg">You&apos;re all caught up!</p>
        <p className="text-muted-foreground text-sm">No more profiles for now — check back later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-sm h-[480px]">
        {profiles.slice(0, 2).map((profile, index) => (
          <DraggableCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
            isTop={index === 0}
          />
        ))}
      </div>

      <div className="flex gap-8">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full text-2xl border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
          onClick={() => handleSwipe('dislike')}
          disabled={loading}
          aria-label="Dislike"
        >
          ✕
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full text-2xl border-2 border-green-300 hover:bg-green-50 hover:border-green-400"
          onClick={() => handleSwipe('like')}
          disabled={loading}
          aria-label="Like"
        >
          ♥
        </Button>
      </div>

      {match && (
        <MatchModal
          matchId={match.matchId}
          otherName={match.otherName}
          onClose={() => setMatch(null)}
        />
      )}
    </div>
  );
}
