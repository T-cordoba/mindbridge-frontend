'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import RecentSessionsSidebar from '@/components/journal/RecentSessionsSidebar';
import { journalApi } from '@/lib/api';
import type { Session } from '@/types';

const sortSessionsByActivity = (a: Session, b: Session) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

interface SessionUpdatedEventDetail {
  session: Session;
}

function isSessionUpdatedEvent(value: unknown): value is CustomEvent<SessionUpdatedEventDetail> {
  return value instanceof CustomEvent;
}

interface JournalChatShellProps {
  children: ReactNode;
}

export default function JournalChatShell({ children }: JournalChatShellProps) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const activeSessionId = useMemo(() => (typeof segment === 'string' ? segment : ''), [segment]);
  const isSessionRoute = activeSessionId.length > 0;

  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  useEffect(() => {
    if (!isSessionRoute) return;

    setRecentLoading(true);
    setRecentError('');

    journalApi.getSessions(1, 50)
      .then(({ sessions }) => setRecentSessions([...sessions].sort(sortSessionsByActivity)))
      .catch((err) => setRecentError(err instanceof Error ? err.message : 'Error al cargar sesiones recientes'))
      .finally(() => setRecentLoading(false));
  }, [isSessionRoute]);

  const handleCreateSession = async () => {
    if (creatingSession) return;

    setCreatingSession(true);
    setRecentError('');
    try {
      const { session } = await journalApi.createSession();
      setRecentSessions((prev) => [session, ...prev.filter((item) => item.id !== session.id)].sort(sortSessionsByActivity));
      router.push(`/journal/${session.id}`);
    } catch (err: unknown) {
      setRecentError(err instanceof Error ? err.message : 'Error al crear sesión');
    } finally {
      setCreatingSession(false);
    }
  };

  useEffect(() => {
    if (!isSessionRoute) return;

    const handleSessionUpdate = (event: Event) => {
      if (!isSessionUpdatedEvent(event)) return;
      const updatedSession = event.detail?.session;
      if (!updatedSession) return;

      setRecentSessions((prev) => [updatedSession, ...prev.filter((item) => item.id !== updatedSession.id)].sort(sortSessionsByActivity));
    };

    window.addEventListener('journal:session-updated', handleSessionUpdate);
    return () => window.removeEventListener('journal:session-updated', handleSessionUpdate);
  }, [isSessionRoute]);

  if (!isSessionRoute) {
    return <>{children}</>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex">
      <RecentSessionsSidebar
        className="hidden lg:flex"
        sessions={recentSessions}
        activeSessionId={activeSessionId}
        loading={recentLoading}
        error={recentError}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onCreateSession={handleCreateSession}
        creatingSession={creatingSession}
      />

      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}
