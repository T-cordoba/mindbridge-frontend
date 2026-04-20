'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare } from 'lucide-react';
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

  useEffect(() => {
    journalApi.getSessions()
      .then(({ sessions }) => setSessions(sessions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
    const sessionToDelete = sessions.find((session) => session.id === id);
    if (!sessionToDelete) return;

    setDeletingSession(sessionToDelete);
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;

    setDeleting(true);
    setError('');
    try {
      await journalApi.deleteSession(deletingSession.id);
      setSessions((prev) => prev.filter((session) => session.id !== deletingSession.id));
      setDeletingSession(null);
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
      setSessions((prev) =>
        prev
          .map((currentSession) => currentSession.id === updatedSession.id ? updatedSession : currentSession)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      setEditingSession(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el titulo');
    } finally {
      setUpdatingTitle(false);
    }
  };

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
        ) : sessions.length === 0 ? (
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
          </FadeInSection>
        )}

        <EditSessionTitleModal
          open={!!editingSession}
          initialTitle={editingSession?.title ?? ''}
          loading={updatingTitle}
          onClose={() => {
            if (updatingTitle) return;
            setEditingSession(null);
          }}
          onSave={updateSessionTitle}
        />

        <DeleteSessionConfirmModal
          open={!!deletingSession}
          sessionTitle={deletingSession?.title ?? ''}
          loading={deleting}
          onClose={() => {
            if (deleting) return;
            setDeletingSession(null);
          }}
          onConfirm={confirmDeleteSession}
        />
      </div>
    </ProtectedRoute>
  );
}
