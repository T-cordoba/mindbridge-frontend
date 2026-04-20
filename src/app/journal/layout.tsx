import { ReactNode } from 'react';
import JournalChatShell from '@/components/journal/JournalChatShell';

interface JournalLayoutProps {
  children: ReactNode;
}

export default function JournalLayout({ children }: JournalLayoutProps) {
  return <JournalChatShell>{children}</JournalChatShell>;
}
