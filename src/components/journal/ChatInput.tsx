'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const MAX_LENGTH = 600;

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ChatInput({ onSend, disabled = false, loading = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || loading) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_LENGTH - value.length;
  const isNearLimit = remaining < 80;

  return (
    <div className="border-t border-border bg-surface p-4">
      <div className="max-w-[var(--journal-chat-max-width)] mx-auto w-full">
        <div className="flex items-center gap-3 bg-surface-elevated rounded-2xl border border-border px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKey}
            disabled={disabled || loading}
            placeholder={disabled ? 'El chat está pausado.' : 'Escribe lo que sientes… (Enter para enviar)'}
            rows={1}
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none outline-none min-h-[24px] max-h-[140px] leading-relaxed disabled:cursor-not-allowed focus-visible:outline-none focus-visible:outline-offset-0"
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            {isNearLimit && (
              <span className={['text-xs', remaining < 20 ? 'text-danger' : 'text-text-muted'].join(' ')}>
                {remaining}
              </span>
            )}
            <button
              onClick={handleSend}
              disabled={!value.trim() || disabled || loading}
              className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:outline-offset-0"
              aria-label="Enviar mensaje"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-1.5 text-center">
          Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
