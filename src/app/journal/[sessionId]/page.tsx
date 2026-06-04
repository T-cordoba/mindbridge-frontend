'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Pencil, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

const CRISIS_DETECTED_MARKER = 'CRISIS_DETECTED';

const isCrisisDetectedMessage = (message: Pick<Message, 'role' | 'content'>) =>
  message.role === 'assistant' && message.content.trim().toUpperCase() === CRISIS_DETECTED_MARKER;

const sanitizeChatMessages = (allMessages: Message[]) =>
  allMessages.filter((message) => !isCrisisDetectedMessage(message));

const emitSessionUpdate = (updatedSession: Session) => {
  window.dispatchEvent(new CustomEvent('journal:session-updated', {
    detail: { session: updatedSession },
  }));
};

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const userInitial = user ? (user.name?.trim() || user.email)[0].toUpperCase() : 'U';
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const displayedTitleRef = useRef('');
  const animIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const animateToTitle = useCallback((newTitle: string) => {
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    const erase = () => {
      const current = displayedTitleRef.current;
      if (current.length === 0) {
        clearInterval(animIntervalRef.current!);
        let j = 0;
        animIntervalRef.current = setInterval(() => {
          j++;
          const next = newTitle.slice(0, j);
          displayedTitleRef.current = next;
          setDisplayedTitle(j < newTitle.length ? next + '|' : next);
          if (j >= newTitle.length) {
            clearInterval(animIntervalRef.current!);
            animIntervalRef.current = null;
          }
        }, 45);
        return;
      }
      const next = current.slice(0, -1);
      displayedTitleRef.current = next;
      setDisplayedTitle(next + '|');
    };

    animIntervalRef.current = setInterval(erase, 28);
  }, []);

  useEffect(() => () => { if (animIntervalRef.current) clearInterval(animIntervalRef.current); }, []);

  useEffect(() => {
    journalApi.getSession(sessionId)
      .then(({ session, messages }) => {
        const hasCrisisMarker = messages.some(isCrisisDetectedMessage);
        const sanitizedMessages = sanitizeChatMessages(messages);
        const normalizedSession = hasCrisisMarker && !session.isBlocked
          ? { ...session, isBlocked: true }
          : session;

        sessionRef.current = normalizedSession;
        setSession(normalizedSession);
        setMessages(sanitizedMessages);
        displayedTitleRef.current = normalizedSession.title;
        setDisplayedTitle(normalizedSession.title);
        emitSessionUpdate(normalizedSession);
      })
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

  const handleSend = (content: string) => {
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
    setStreamingContent('');
    setStreamingReasoning('');
    setError('');

    abortControllerRef.current = journalApi.sendMessageStream(sessionId, content, {
      onReasoning: (chunk) => setStreamingReasoning((prev) => prev + chunk),
      onText: (chunk) => setStreamingContent((prev) => prev + chunk),
      onDone: (result) => {
        const shouldHide = isCrisisDetectedMessage(result.assistantMessage);
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((msg) => msg.id !== optimisticId);
          return shouldHide
            ? [...withoutOptimistic, result.userMessage]
            : [...withoutOptimistic, result.userMessage, result.assistantMessage];
        });
        const updatedSession: Session = {
          ...session,
          title: result.generatedTitle ?? session.title,
          isBlocked: result.isBlocked || shouldHide || session.isBlocked,
          maxAlertLevel: Math.max(session.maxAlertLevel, result.alertLevel),
          updatedAt: new Date().toISOString(),
          messageCount: session.messageCount + (shouldHide ? 1 : 2),
        };
        sessionRef.current = updatedSession;
        setSession(updatedSession);
        if (updatedSession.isBlocked) setEditingTitle(false);
        if (result.generatedTitle) {
          setTitleDraft(result.generatedTitle);
          animateToTitle(result.generatedTitle);
        }
        emitSessionUpdate(updatedSession);
        setSending(false);
        setStreamingContent('');
        setStreamingReasoning('');
      },
      onTitleUpdated: (title) => {
        const updated = sessionRef.current ? { ...sessionRef.current, title, updatedAt: new Date().toISOString() } : null;
        if (updated) {
          sessionRef.current = updated;
          setSession(updated);
          emitSessionUpdate(updated);
        }
        setTitleDraft(title);
        animateToTitle(title);
      },
      onError: (message) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        setError(message);
        setSending(false);
        setStreamingContent('');
        setStreamingReasoning('');
        abortControllerRef.current = null;
      },
    });
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-user-')));
    setSending(false);
    setStreamingContent('');
    setStreamingReasoning('');
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
      emitSessionUpdate(updatedSession);
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
      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        <FadeInSection>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-bg border-b border-border">
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
                  className={[
                    'group max-w-full inline-flex items-center gap-1.5 text-left',
                    session?.isBlocked ? 'cursor-not-allowed opacity-70' : '',
                  ].join(' ')}
                  onClick={() => {
                    if (!session || loading || session.isBlocked) return;
                    setTitleDraft(session.title);
                    setEditingTitle(true);
                  }}
                  aria-label="Editar titulo de la conversacion"
                >
                  <span className="font-semibold text-text-primary truncate">{displayedTitle || session?.title || 'Cargando...'}</span>
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
            <button
              type="button"
              title="Ver razonamiento de la IA"
              onClick={() => setShowReasoning((v) => !v)}
              className={[
                'p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1',
                showReasoning
                  ? 'bg-primary-subtle text-primary'
                  : 'text-text-muted hover:text-primary hover:bg-primary-subtle',
              ].join(' ')}
            >
              <BrainCircuit size={15} />
            </button>
          </div>
        </FadeInSection>

        {/* Messages */}
        <FadeInSection delay={70} className="flex-1 overflow-y-auto chat-scroll px-4 py-6 bg-surface">
          <div className="w-full max-w-[var(--journal-chat-max-width)] mx-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-text-muted text-sm py-8">
                <p>Escribe lo que sientes para comenzar tu reflexión.</p>
                <p className="mt-1 text-xs opacity-60">La IA está aquí para escucharte, no para juzgarte.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} userInitial={userInitial} />
                ))}
                {sending && (
                  <>
                    {showReasoning && (
                      <div className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted max-h-40 overflow-y-auto">
                        <div className="flex items-center gap-1.5 mb-1.5 font-medium text-primary">
                          <BrainCircuit size={13} />
                          Razonamiento interno
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {streamingReasoning || <span className="animate-pulse">Esperando razonamiento...</span>}
                        </p>
                      </div>
                    )}
                    <ChatMessage
                      key={thinkingMessage.id}
                      message={thinkingMessage}
                      showMood={false}
                      isThinking={!streamingContent}
                      streamingContent={streamingContent || undefined}
                    />
                  </>
                )}
              </div>
            )}

            {session?.isBlocked && (
              <div className="mt-6">
                <CrisisAlert />
              </div>
            )}

            {error && (
              <div className="mt-4">
                <Alert variant="danger">{error}</Alert>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </FadeInSection>

        {/* Input */}
        {!session?.isBlocked && (
          <FadeInSection delay={90}>
            <ChatInput onSend={handleSend} onCancel={handleCancel} loading={sending} disabled={!!session?.isBlocked} />
          </FadeInSection>
        )}
      </div>
    </ProtectedRoute>
  );
}
