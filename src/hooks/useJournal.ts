'use client';

import { useCallback, useState } from 'react';
import { journalApi } from '@/lib/api';
import type { Session } from '@/types';

const PAGE_SIZE = 6;

export function useJournal() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await journalApi.getSessions(targetPage, PAGE_SIZE);
      setSessions(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
      setPage(data.meta.page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = async (): Promise<string | null> => {
    setCreating(true);
    try {
      const { session } = await journalApi.createSession();
      return session.id;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear sesión');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const deleteSession = async (id: string, currentPage: number): Promise<void> => {
    await journalApi.deleteSession(id);
    const newTotal = total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const targetPage = currentPage > newTotalPages ? newTotalPages : currentPage;
    await fetchSessions(targetPage);
  };

  const updateSessionTitle = async (id: string, title: string): Promise<Session> => {
    const { session } = await journalApi.updateSessionTitle(id, title);
    setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
    return session;
  };

  return {
    sessions,
    setSessions,
    loading,
    creating,
    error,
    setError,
    page,
    totalPages,
    total,
    fetchSessions,
    createSession,
    deleteSession,
    updateSessionTitle,
  };
}
