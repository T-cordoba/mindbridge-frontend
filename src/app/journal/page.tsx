'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import SessionCard from '@/components/journal/SessionCard';
import EditSessionTitleModal from '@/components/journal/EditSessionTitleModal';
import DeleteSessionConfirmModal from '@/components/journal/DeleteSessionConfirmModal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import FadeInSection from '@/components/ui/FadeInSection';
import { journalApi } from '@/lib/api';
import type { Session } from '@/types';

const PAGE_SIZE = 6;

export default function JournalPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await journalApi.getSessions(targetPage, PAGE_SIZE);
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions(1);
  }, [fetchSessions]);

  const createSession = async () => {
    setCreating(true);
    try {
      const { session } = await journalApi.createSession();
      router.push(`/journal/${session.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear sesión');
      setCreating(false);
    }
  };

  const requestDeleteSession = (id: string) => {
    const sessionToDelete = sessions.find((s) => s.id === id);
    if (sessionToDelete) setDeletingSession(sessionToDelete);
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;
    setDeleting(true);
    setError('');
    try {
      await journalApi.deleteSession(deletingSession.id);
      setDeletingSession(null);
      const newTotal = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      const targetPage = page > newTotalPages ? newTotalPages : page;
      await fetchSessions(targetPage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const updateSessionTitle = async (title: string) => {
    if (!editingSession) return;
    setUpdatingTitle(true);
    setError('');
    try {
      const { session: updatedSession } = await journalApi.updateSessionTitle(editingSession.id, title);
      setSessions((prev) => prev.map((s) => s.id === updatedSession.id ? updatedSession : s));
      setEditingSession(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el titulo');
    } finally {
      setUpdatingTitle(false);
    }
  };

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return;
    fetchSessions(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const isEmpty = !loading && sessions.length === 0 && total === 0;

  return (
    <ProtectedRoute>
      <div className="container py-10 max-w-2xl">
        <FadeInSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Mi Diario</h1>
              <p className="text-text-secondary mt-1">Tus sesiones de reflexión personal</p>
            </div>
            <Button onClick={createSession} loading={creating} className="gap-2">
              <Plus size={18} />
              Nueva sesión
            </Button>
          </div>
        </FadeInSection>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : isEmpty ? (
          <FadeInSection delay={90}>
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-subtle text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Empieza tu primer diario</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Cada sesión es un espacio privado para explorar tus pensamientos con la guía de la IA.
              </p>
              <Button onClick={createSession} loading={creating} className="gap-2">
                <Plus size={18} /> Crear primera sesión
              </Button>
            </div>
          </FadeInSection>
        ) : (
          <FadeInSection delay={90}>
            <div className="flex flex-col gap-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={requestDeleteSession}
                  onEdit={setEditingSession}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-xs text-text-muted">
                  {total} sesión{total !== 1 ? 'es' : ''} · página {page} de {totalPages}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {pageNumbers().map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-text-muted text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        className={[
                          'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                          p === page
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-primary hover:bg-primary-subtle',
                        ].join(' ')}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </FadeInSection>
        )}

        <EditSessionTitleModal
          open={!!editingSession}
          initialTitle={editingSession?.title ?? ''}
          loading={updatingTitle}
          onClose={() => { if (updatingTitle) return; setEditingSession(null); }}
          onSave={updateSessionTitle}
        />

        <DeleteSessionConfirmModal
          open={!!deletingSession}
          sessionTitle={deletingSession?.title ?? ''}
          loading={deleting}
          onClose={() => { if (deleting) return; setDeletingSession(null); }}
          onConfirm={confirmDeleteSession}
        />
      </div>
    </ProtectedRoute>
  );
}
