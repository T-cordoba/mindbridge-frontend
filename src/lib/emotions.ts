import type { EmotionKey } from '@/types';

export const EMOTION_LABELS: Record<EmotionKey, string> = {
  joy: 'Alegría',
  gratitude: 'Gratitud',
  calm: 'Calma',
  hope: 'Esperanza',
  love: 'Amor',
  pride: 'Orgullo',
  relief: 'Alivio',
  sadness: 'Tristeza',
  anxiety: 'Ansiedad',
  fear: 'Miedo',
  anger: 'Ira',
  frustration: 'Frustración',
  guilt: 'Culpa',
  shame: 'Vergüenza',
  loneliness: 'Soledad',
  confusion: 'Confusión',
  nostalgia: 'Nostalgia',
  uncertainty: 'Incertidumbre',
  exhaustion: 'Agotamiento',
  emptiness: 'Vacío',
  unknown: 'Sin identificar',
};

export const EMOTION_COLORS: Record<EmotionKey, string> = {
  joy: '#f59e0b',
  gratitude: '#10b981',
  calm: '#06b6d4',
  hope: '#84cc16',
  love: '#ec4899',
  pride: '#8b5cf6',
  relief: '#34d399',
  sadness: '#6366f1',
  anxiety: '#f97316',
  fear: '#dc2626',
  anger: '#ef4444',
  frustration: '#fb923c',
  guilt: '#a78bfa',
  shame: '#f472b6',
  loneliness: '#94a3b8',
  confusion: '#fbbf24',
  nostalgia: '#c084fc',
  uncertainty: '#7dd3fc',
  exhaustion: '#9ca3af',
  emptiness: '#64748b',
  unknown: '#d1d5db',
};

export const EMOTION_GROUPS = {
  positive: ['joy', 'gratitude', 'calm', 'hope', 'love', 'pride', 'relief'] as EmotionKey[],
  negative: ['sadness', 'anxiety', 'fear', 'anger', 'frustration', 'guilt', 'shame', 'loneliness'] as EmotionKey[],
  neutral: ['confusion', 'nostalgia', 'uncertainty', 'exhaustion', 'emptiness', 'unknown'] as EmotionKey[],
};

export const getEmotionLabel = (key: EmotionKey): string => EMOTION_LABELS[key] ?? key;
export const getEmotionColor = (key: EmotionKey): string => EMOTION_COLORS[key] ?? '#d1d5db';
