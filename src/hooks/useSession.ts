'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { journalApi } from '@/lib/api';
import type { Message, Session } from '@/types';

const CRISIS_MARKER = 'CRISIS_DETECTED';

const isCrisisMsg = (m: Pick<Message, 'role' | 'content'>) =>
  m.role === 'assistant' && m.content.trim().toUpperCase() === CRISIS_MARKER;

const sanitize = (msgs: Message[]) => msgs.filter((m) => !isCrisisMsg(m));

const emitSessionUpdate = (session: Session) =>
  window.dispatchEvent(new CustomEvent('journal:session-updated', { detail: { session } }));

export function useSession(sessionId: string) {
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
          if (j >= newTitle.length) { clearInterval(animIntervalRef.current!); animIntervalRef.current = null; }
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
      .then(({ session: s, messages: msgs }) => {
        const hasCrisis = msgs.some(isCrisisMsg);
        const normalized = hasCrisis && !s.isBlocked ? { ...s, isBlocked: true } : s;
        sessionRef.current = normalized;
        setSession(normalized);
        setMessages(sanitize(msgs));
        displayedTitleRef.current = normalized.title;
        setDisplayedTitle(normalized.title);
        emitSessionUpdate(normalized);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar sesión'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (!session || editingTitle) return;
    setTitleDraft(session.title);
  }, [session, editingTitle]);

  useEffect(() => {
    const container = bottomRef.current?.closest('.chat-scroll') as HTMLDivElement | null;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = (content: string) => {
    if (!session || session.isBlocked) return;
    const optimisticId = `temp-user-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId, sessionId, role: 'user', content,
      moodData: null, alertLevel: 0, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    setStreamingContent('');
    setStreamingReasoning('');
    setError('');

    abortControllerRef.current = journalApi.sendMessageStream(sessionId, content, {
      onReasoning: (chunk) => setStreamingReasoning((prev) => prev + chunk),
      onText: (chunk) => setStreamingContent((prev) => prev + chunk),
      onDone: (result) => {
        const hideCrisis = isCrisisMsg(result.assistantMessage);
        setMessages((prev) => {
          const without = prev.filter((m) => m.id !== optimisticId);
          return hideCrisis
            ? [...without, result.userMessage]
            : [...without, result.userMessage, result.assistantMessage];
        });
        const updated: Session = {
          ...session,
          title: result.generatedTitle ?? session.title,
          isBlocked: result.isBlocked || hideCrisis || session.isBlocked,
          maxAlertLevel: Math.max(session.maxAlertLevel, result.alertLevel),
          updatedAt: new Date().toISOString(),
          messageCount: session.messageCount + (hideCrisis ? 1 : 2),
        };
        sessionRef.current = updated;
        setSession(updated);
        if (updated.isBlocked) setEditingTitle(false);
        if (result.generatedTitle) { setTitleDraft(result.generatedTitle); animateToTitle(result.generatedTitle); }
        emitSessionUpdate(updated);
        setSending(false);
        setStreamingContent('');
        setStreamingReasoning('');
      },
      onTitleUpdated: (title) => {
        const updated = sessionRef.current ? { ...sessionRef.current, title, updatedAt: new Date().toISOString() } : null;
        if (updated) { sessionRef.current = updated; setSession(updated); emitSessionUpdate(updated); }
        setTitleDraft(title);
        animateToTitle(title);
      },
      onError: (message) => {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
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
    setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-user-')));
    setSending(false);
    setStreamingContent('');
    setStreamingReasoning('');
  };

  const handleTitleSave = async () => {
    if (!session) return;
    const normalized = titleDraft.trim();
    if (!normalized) { setError('El titulo no puede estar vacio'); setTitleDraft(session.title); setEditingTitle(false); return; }
    if (normalized.length > 200) { setError('El titulo no puede superar los 200 caracteres'); return; }
    if (normalized === session.title) { setEditingTitle(false); return; }
    setUpdatingTitle(true);
    setError('');
    try {
      const { session: updated } = await journalApi.updateSessionTitle(sessionId, normalized);
      setSession(updated);
      setTitleDraft(updated.title);
      emitSessionUpdate(updated);
      setEditingTitle(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el titulo');
    } finally {
      setUpdatingTitle(false);
    }
  };

  return {
    session, messages, loading, sending, error,
    streamingContent, streamingReasoning,
    showReasoning, setShowReasoning,
    editingTitle, setEditingTitle,
    titleDraft, setTitleDraft,
    updatingTitle, displayedTitle,
    bottomRef,
    handleSend, handleCancel, handleTitleSave,
  };
}
