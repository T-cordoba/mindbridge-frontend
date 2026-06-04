'use client';

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
import { useSession } from '@/hooks/useSession';
import type { Message } from '@/types';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const userInitial = user ? (user.name?.trim() || user.email)[0].toUpperCase() : 'U';

  const {
    session, messages, loading, sending, error,
    streamingContent, streamingReasoning,
    showReasoning, setShowReasoning,
    editingTitle, setEditingTitle,
    titleDraft, setTitleDraft,
    updatingTitle, displayedTitle,
    bottomRef,
    handleSend, handleCancel, handleTitleSave,
  } = useSession(sessionId);

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
                    if (e.key === 'Enter') { e.preventDefault(); void handleTitleSave(); }
                    if (e.key === 'Escape') { setTitleDraft(session?.title ?? ''); setEditingTitle(false); }
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
                  className={['group max-w-full inline-flex items-center gap-1.5 text-left', session?.isBlocked ? 'cursor-not-allowed opacity-70' : ''].join(' ')}
                  onClick={() => { if (!session || loading || session.isBlocked) return; setTitleDraft(session.title); setEditingTitle(true); }}
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
              className={['p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1', showReasoning ? 'bg-primary-subtle text-primary' : 'text-text-muted hover:text-primary hover:bg-primary-subtle'].join(' ')}
            >
              <BrainCircuit size={15} />
            </button>
          </div>
        </FadeInSection>

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

            {session?.isBlocked && <div className="mt-6"><CrisisAlert /></div>}
            {error && <div className="mt-4"><Alert variant="danger">{error}</Alert></div>}
            <div ref={bottomRef} />
          </div>
        </FadeInSection>

        {!session?.isBlocked && (
          <FadeInSection delay={90}>
            <ChatInput onSend={handleSend} onCancel={handleCancel} loading={sending} disabled={!!session?.isBlocked} />
          </FadeInSection>
        )}
      </div>
    </ProtectedRoute>
  );
}
