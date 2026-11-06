import { ChatPage } from '@/_pages/chat';

interface Props {
  params: Promise<{ matchId: string }>;
}

export default async function Page({ params }: Props) {
  const { matchId } = await params;
  return <ChatPage matchId={matchId} />;
}
