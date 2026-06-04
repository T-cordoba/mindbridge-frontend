import { Brain } from 'lucide-react';
import { getEmotionLabel, getEmotionColor } from '@/lib/emotions';
import type { Message } from '@/types';
import ThinkingIndicator from './ThinkingIndicator';

interface ChatMessageProps {
  message: Message;
  showMood?: boolean;
  isThinking?: boolean;
  userInitial?: string;
  streamingContent?: string;
}

export default function ChatMessage({ message, showMood = true, isThinking = false, userInitial = 'U', streamingContent }: ChatMessageProps) {
  if (message.role === 'assistant' && message.content.trim().toUpperCase() === 'CRISIS_DETECTED') {
    return null;
  }

  const isUser = message.role === 'user';

  return (
    <div className={['flex gap-3 animate-slide-up', isUser ? 'flex-row-reverse' : 'flex-row', isThinking && !streamingContent ? 'items-center' : 'items-start'].join(' ')}>
      <div
        className={[
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm select-none',
          isUser ? 'bg-primary text-white' : 'bg-primary-subtle text-primary',
        ].join(' ')}
      >
        {isUser ? userInitial : <Brain size={16} />}
      </div>

      <div className={['flex flex-col gap-1.5 max-w-[75%]', isUser ? 'items-end' : 'items-start'].join(' ')}>
        {isThinking && !streamingContent && (
          <div className="px-1 mb-0.5">
            <ThinkingIndicator />
          </div>
        )}
        <div
          className={[
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-surface border border-border text-text-primary rounded-tl-sm',
          ].join(' ')}
        >
          {isThinking && !streamingContent ? (
            <div className="inline-flex items-center gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '180ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '360ms' }} />
            </div>
          ) : streamingContent !== undefined ? (
            <span>
              {streamingContent}
              <span className="animate-pulse opacity-70">▌</span>
            </span>
          ) : (
            message.content
          )}
        </div>

        {!isThinking && !isUser && showMood && message.moodData && message.moodData.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.moodData.map(([emotion, intensity]) => (
              <span
                key={emotion}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: `${getEmotionColor(emotion)}18`,
                  borderColor: `${getEmotionColor(emotion)}40`,
                  color: getEmotionColor(emotion),
                }}
              >
                {getEmotionLabel(emotion)}
                <span className="opacity-60">{intensity}</span>
              </span>
            ))}
          </div>
        )}

        {!isThinking && (
          <span className="text-xs text-text-muted">
            {new Date(message.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
