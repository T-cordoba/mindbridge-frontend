'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Pencil } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ChatMessage from '@/components/journal/ChatMessage';
import ChatInput from '@/components/journal/ChatInput';
import CrisisAlert from '@/components/journal/CrisisAlert';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import FadeInSection from '@/components/ui/FadeInSection';
import { journalApi } from '@/lib/api';
import type { Session, Message } from '@/types';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    journalApi.getSession(sessionId)
      .then(({ session, messages }) => { setSession(session); setMessages(messages); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!session || editingTitle) return;
    setTitleDraft(session.title);
  }, [session, editingTitle]);

  useEffect(() => {
    const chatContainer = bottomRef.current?.closest('.chat-scroll') as HTMLDivElement | null;
    if (!chatContainer) return;

    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, sending]);

  const handleSend = async (content: string) => {
    if (!session || session.isBlocked) return;
    const optimisticId = `temp-user-${Date.now()}`;
    const optimisticUserMessage: Message = {
      id: optimisticId,
      sessionId,
      role: 'user',
      content,
      moodData: null,
      alertLevel: 0,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setSending(true);
    setError('');

    try {
      const result = await journalApi.sendMessage(sessionId, content);
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);
        return [...withoutOptimistic, result.userMessage, result.assistantMessage];
      });
      if (result.isBlocked) {
        setSession((prev) => prev ? { ...prev, isBlocked: true } : prev);
      }
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  const handleTitleSave = async () => {
    if (!session) return;
    const normalizedTitle = titleDraft.trim();

    if (!normalizedTitle) {
      setError('El titulo no puede estar vacio');
      setTitleDraft(session.title);
      setEditingTitle(false);
      return;
    }

    if (normalizedTitle.length > 200) {
      setError('El titulo no puede superar los 200 caracteres');
      return;
    }

    if (normalizedTitle === session.title) {
      setEditingTitle(false);
      return;
    }

    setUpdatingTitle(true);
    setError('');
    try {
      const { session: updatedSession } = await journalApi.updateSessionTitle(sessionId, normalizedTitle);
      setSession(updatedSession);
      setTitleDraft(updatedSession.title);
      setEditingTitle(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el titulo');
    } finally {
      setUpdatingTitle(false);
    }
  };

  const thinkingMessage: Message = {
    id: 'assistant-thinking',
    sessionId,
    role: 'assistant',
    content: '...',
    moodData: null,
    alertLevel: 0,
    createdAt: new Date().toISOString(),
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <FadeInSection>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
            <Link href="/journal" className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleTitleSave();
                    }

                    if (e.key === 'Escape') {
                      setTitleDraft(session?.title ?? '');
                      setEditingTitle(false);
                    }
                  }}
                  disabled={updatingTitle}
                  maxLength={200}
                  autoFocus
                  className="w-[22rem] max-w-full bg-surface-elevated border border-border rounded-lg px-2.5 py-1 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Editar titulo de la conversacion"
                />
              ) : (
                <button
                  type="button"
                  className="group max-w-full inline-flex items-center gap-1.5 text-left"
                  onClick={() => {
                    if (!session || loading) return;
                    setTitleDraft(session.title);
                    setEditingTitle(true);
                  }}
                  aria-label="Editar titulo de la conversacion"
                >
                  <span className="font-semibold text-text-primary truncate">{session?.title ?? 'Cargando...'}</span>
                  <Pencil size={13} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <p className="text-xs text-text-muted">{messages.length} mensajes</p>
            </div>
            {session?.isBlocked && <Badge variant="danger">Bloqueada</Badge>}
            {(session?.maxAlertLevel ?? 0) >= 3 && !session?.isBlocked && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <AlertTriangle size={14} />
                Nivel {session?.maxAlertLevel ?? 0}
              </div>
            )}
          </div>
        </FadeInSection>

        {/* Messages */}
        <FadeInSection delay={70} className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
          <div>
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-text-muted text-sm py-8">
                <p>Escribe lo que sientes para comenzar tu reflexión.</p>
                <p className="mt-1 text-xs opacity-60">La IA está aquí para escucharte, no para juzgarte.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {sending && (
                  <ChatMessage
                    key={thinkingMessage.id}
                    message={thinkingMessage}
                    showMood={false}
                    isThinking
                  />
                )}
              </div>
            )}

            {session?.isBlocked && (
              <div className="max-w-2xl mx-auto mt-6">
                <CrisisAlert />
              </div>
            )}

            {error && (
              <div className="max-w-2xl mx-auto mt-4">
                <Alert variant="danger">{error}</Alert>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </FadeInSection>

        {/* Input */}
        {!session?.isBlocked && (
          <FadeInSection delay={90}>
            <ChatInput onSend={handleSend} loading={sending} disabled={!!session?.isBlocked} />
          </FadeInSection>
        )}
      </div>
    </ProtectedRoute>
  );
}
