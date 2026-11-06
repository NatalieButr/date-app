import { cn } from '@/shared/lib/utils';

import type { Message } from '../model/schemas';

interface Props {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
          message.moderation === 'warn' && 'opacity-70',
        )}
      >
        <p className="break-words">{message.body}</p>
        {message.moderation === 'warn' && (
          <p className="mt-1 text-xs opacity-60">Message flagged</p>
        )}
      </div>
    </div>
  );
}
